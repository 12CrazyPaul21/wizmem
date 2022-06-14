/**
 * wizmem web manager logical module
 */

const wizmem = (function() {

    const I18n = {
        idle_memory: "空闲内存",
        absolute_path: "绝对路径",
        uss_memory: "独占内存",
        kill_process: "结束进程"
    };

    function update_wizmem_chart() {
        var used_memory_size = 0;
        var process_memory_infos = this.env.process_memory_infos.filter((p) => {
            if (!('memory_info' in p)) {
                return false;
            }

            used_memory_size += p.memory_info.uss;
            return true;
        }).sort((a,b) => {
            return a.process_name.localeCompare(b.process_name)
        });

        process_memory_infos.unshift({
            pid: 0,
            process_name: I18n.idle_memory,
            memory_info: {
                'uss': used_memory_size
            }
        });

        var process_names = process_memory_infos.map((p) => {
            return p.process_name;
        });

        var process_usses = process_memory_infos.map((p) => {
            return p.memory_info.uss;
        });

        var process_colors = process_memory_infos.map((p) => {
            return uniqolor(p.absolute_path || p.process_name).color;
        });

        if (this.env.process_memory_pie_chart instanceof Chart) {
            this.env.process_memory_pie_chart.destroy();
        }

        this.env.process_memory_pie_chart = new Chart($("#process-memory-pie-chart-canvas"), {
            type: 'pie',
            data: {
                labels: process_names,
                datasets: [{
                    data: process_usses,
                    backgroundColor: process_colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                borderColor: '#343434',
                animation: {
                    duration: 0
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Process Memory Info',
                        color: 'black',
                        font: {
                            weight: 'bold',
                            size: 16
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        position: 'nearest',
                        callbacks: {
                            label: function(ctx) {
                                let process_name = ctx.label || '';
                                let process_index = ctx.dataIndex;
                                let process_uss = ctx.parsed;
                                let process_info = process_memory_infos[process_index];

                                if (process_index == 0) {
                                    return I18n.idle_memory + ": " + filesize(process_uss, 2);
                                }

                                let label = process_name;
                                let uss = I18n.uss_memory + ": " + filesize(process_uss, 2);
                                let pid = "PID: " + process_info.pid;
                                let absolute_path = I18n.absolute_path + ": " + process_info.absolute_path;

                                return [label, pid, absolute_path, uss];
                            }
                        }
                    }
                }
            }
        });

        var context_options = {
            items: [
                {
                    header: ''
                },
                {
                    text: I18n.kill_process,
                    onclick: function() {
                        kill_selected_process();
                    }
                }
            ],
            menuId: "process-memory-pie-context-menu"
        };

        $("#process-memory-pie-chart-canvas").contextify(context_options);

        var contextify_handler = jQuery._data(document.getElementById("process-memory-pie-chart-canvas"), 'events').contextmenu[0].handler;
        $("#process-memory-pie-chart-canvas").unbind('contextmenu', contextify_handler);

        $("#process-memory-pie-chart-canvas").on('contextmenu', function(e) {
            wizmem.env.selected_process_info = null;

            let hitted_points = wizmem.env.process_memory_pie_chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
            if (wizmem.env.killing_process_flag || hitted_points.length == 0 || hitted_points[0].index == 0) {
                e.preventDefault();
                return false;
            }

            let process_index = hitted_points[0].index;
            let process_info = process_memory_infos[process_index];

            wizmem.env.selected_process_info = process_info;

            context_options.items[0].text = `[${process_info.process_name}(${process_info.pid})]`;
            contextify_handler(e);

            return true;
        });
    }

    function init_failed() {
        $("#init-status").text("WizMem Init Failed");
    }

    function into_wizmem_web_manager_page() {
        let self = this;

        $("#confirm-shutdown-btn").on('click', function() {
            $('#shutdown-dialog').on('hidden.bs.modal', function() {
                $('#shutdown-dialog').off('hidden.bs.modal');
                self.shutdown_server();
            });
            $("#shutdown-dialog").modal('hide');
        });

        update_wizmem_chart.bind(this)();

        // into web manager container page
        $("#splash-screen").fadeOut(1000, () => {
            $("#splash-screen").remove();
            $("#web-manager-container").removeClass("wizmem-hide");
        });
    }

    function into_wizmem_shutdown_page() {
        $("#web-manager-container").fadeOut(500, () => {
            $("#web-manager-container").remove();
            $("#shutdown-screen").removeClass("wizmem-hide");
        });
    }

    function kill_selected_process_failed() {
        $("#message-dialog-text").text("结束进程失败");
        $("#message-dialog").modal('show');
    }

    function kill_selected_process() {
        if (!wizmem.env.selected_process_info || wizmem.env.killing_process_flag) {
            return;
        }
        
        wizmem.env.killing_process_flag = true;

        $.ajax({
            type: 'post',
            url: '/kill_processes',
            contentType: "application/json",
            dataType: 'json',
            data: JSON.stringify({
                pids: [
                    wizmem.env.selected_process_info.pid
                ]
            }),
            success: (result) => {
                if (result['status'] != true) {
                    kill_selected_process_failed();
                    wizmem.env.killing_process_flag = false;
                    return;
                }

                let refresh_mem_info = result['refresh_mem_info'];
                wizmem.env.total_memory_size = refresh_mem_info['total_memory_size'];
                wizmem.env.process_memory_infos = refresh_mem_info['process_memory_infos'];

                update_wizmem_chart.bind(wizmem)();
                wizmem.env.killing_process_flag = false;
            },
            error: () => {
                kill_selected_process_failed();
                wizmem.env.killing_process_flag = false;
            }
        });
    }

    return {
        env: {
            total_memory_size: 0,
            process_memory_infos: [],
            process_memory_pie_chart: undefined,
            selected_process_info: null,
            killing_process_flag: false
        },
        init: function() {
            $.ajax({
                type: 'get',
                url: '/mem_info',
                success: (result) => {
                    if (result['total_memory_size'] === undefined || result['process_memory_infos'] === undefined) {
                        return;
                    }

                    this.env.total_memory_size = result['total_memory_size'];
                    this.env.process_memory_infos = result['process_memory_infos'];

                    $("#init-status").text("Into WizMem Web Manager Page");

                    into_wizmem_web_manager_page.bind(this)();
                },
                error: () => {
                    init_failed();
                }
            })
        },
        shutdown_server: function() {
            $.ajax({
                type: 'get',
                url: '/shutdown',
                success: () => {
                    into_wizmem_shutdown_page();
                },
                error: () => {
                    into_wizmem_shutdown_page();
                }
            });
        }
    }
})();