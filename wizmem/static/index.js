/**
 * wizmem web manager logical module
 */

const wizmem = (function() {

    const I18n = {
        idle_memory: "空闲内存",
        absolute_path: "绝对路径",
        uss_memory: "独占内存",
        kill_process: "结束进程",
        kill_process_failed: "结束进程失败",
        open_program_folder_in_explorer: "打开程序所在目录"
    };

    function update_wizmem_chart() {
        $("#total-memory-size-btn").text("total memory size : " + filesize(this.env.total_memory_size, {base: 2, round: 2}));

        var process_memory_infos = this.env.process_memory_infos.filter((p) => {
            if (!('memory_info' in p)) {
                return false;
            }

            return true;
        }).sort((a,b) => {
            return a.process_name.localeCompare(b.process_name)
        });

        if (wizmem.env.merge_same_program) {
            var merge_process_memory_infos = [];

            for (var process_info of process_memory_infos) {
                var index = merge_process_memory_infos.findIndex((p) => {
                    return p.absolute_path == process_info.absolute_path;
                });

                if (index == -1) {
                    merge_process_memory_infos.push({
                        'absolute_path': process_info.absolute_path,
                        'process_name': process_info.process_name,
                        'pid': [process_info.pid],
                        'memory_info': {
                            'private': process_info.memory_info['private'],
                            'rss': process_info.memory_info['rss'],
                            'uss': process_info.memory_info['uss'],
                            'vms': process_info.memory_info['vms']
                        }
                    })
                } else {
                    merge_process_memory_infos[index]['pid'].push(process_info.pid);
                    merge_process_memory_infos[index]['memory_info']['private'] += process_info.memory_info['private'];
                    merge_process_memory_infos[index]['memory_info']['rss'] += process_info.memory_info['rss'];
                    merge_process_memory_infos[index]['memory_info']['uss'] += process_info.memory_info['uss'];
                    merge_process_memory_infos[index]['memory_info']['vms'] += process_info.memory_info['vms'];
                }
            }

            process_memory_infos = merge_process_memory_infos;
        }

        process_memory_infos.unshift({
            pid: 0,
            process_name: I18n.idle_memory,
            memory_info: {
                'uss': this.env.free_memory_size
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

        wizmem.env.process_memory_infos_roasted = process_memory_infos;

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
                                    return I18n.idle_memory + ": " + filesize(process_uss, {base: 2, round: 2});
                                }

                                let label = process_name;
                                let uss = I18n.uss_memory + ": " + filesize(process_uss, {base: 2, round: 2});
                                let pid = "";

                                if (Array.isArray(process_info.pid)) {
                                    pid = "PIDS: [" + process_info.pid + "]";
                                } else {
                                    pid = "PID: " + process_info.pid;
                                }

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
                },
                {
                    text: I18n.open_program_folder_in_explorer,
                    onclick: function() {
                        open_program_folder_in_explorer();
                    }
                }
            ],
            menuId: "process-memory-pie-context-menu"
        };

        $("#process-memory-pie-chart-canvas").contextify(context_options);

        var contextify_handlers = jQuery._data(document.getElementById("process-memory-pie-chart-canvas"), 'events').contextmenu;
        var contextify_handler = contextify_handlers[0].handler;
        for (var p of contextify_handlers) {
            $("#process-memory-pie-chart-canvas").unbind('contextmenu', p.handler);
        }

        $("#process-memory-pie-chart-canvas").bind('contextmenu', function(e) {
            wizmem.env.selected_pids = null;
            wizmem.env.selected_program = '';

            let hitted_points = wizmem.env.process_memory_pie_chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
            if (wizmem.env.killing_process_flag || hitted_points.length == 0 || hitted_points[0].index == 0) {
                e.preventDefault();
                return false;
            }

            let process_index = hitted_points[0].index;
            let process_info = wizmem.env.process_memory_infos_roasted[process_index];

            if (Array.isArray(process_info.pid)) {
                wizmem.env.selected_pids = process_info.pid;
                context_options.items[0].text = `[${process_info.absolute_path}]`;
            } else {
                wizmem.env.selected_pids = [process_info.pid];
                context_options.items[0].text = `[${process_info.process_name}(${process_info.pid})]`;
            }

            wizmem.env.selected_program = process_info.absolute_path;

            contextify_handler(e);

            return true;
        });
    }

    function toggle_refresh_wizmem_status_btn(loading) {
        $("#refresh-wizmem-status-btn").prop("disabled", loading);
        let method = (loading ? "add" : "remove") + "Class";
        $("#refresh-wizmem-status-btn-spinner")[method]("spinner-border spinner-border-sm");
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

        $("#merge-same-program-checkbox").on('click', function() {
            wizmem.env.merge_same_program = !$("#merge-same-program-checkbox").hasClass("active");

            if (wizmem.env.merge_same_program) {
                $("#merge-same-program-checkbox").addClass("active");
                $("#merge-same-program-checkbox").removeClass("btn-outline-secondary");
                $("#merge-same-program-checkbox").addClass("btn-outline-success");
            } else {
                $("#merge-same-program-checkbox").removeClass("active");
                $("#merge-same-program-checkbox").removeClass("btn-outline-success");
                $("#merge-same-program-checkbox").addClass("btn-outline-secondary");
            }

            update_wizmem_chart.bind(wizmem)();
        });

        $("#refresh-wizmem-status-btn").on('click', function() {
            toggle_refresh_wizmem_status_btn(true);

            $.ajax({
                type: 'get',
                url: '/mem_info',
                success: (result) => {
                    if (result['total_memory_size'] === undefined ||
                        result['free_memory_size'] === undefined ||
                        result['process_memory_infos'] === undefined) {
                        toggle_refresh_wizmem_status_btn(false);
                        return;
                    }

                    wizmem.env.total_memory_size = result['total_memory_size'];
                    wizmem.env.free_memory_size = result['free_memory_size'];
                    wizmem.env.process_memory_infos = result['process_memory_infos'];

                    update_wizmem_chart.bind(wizmem)();

                    toggle_refresh_wizmem_status_btn(false);
                },
                error: () => {
                    toggle_refresh_wizmem_status_btn(false);
                }
            });
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
        $("#message-dialog-text").text(I18n.kill_process_failed);
        $("#message-dialog").modal('show');
    }

    function kill_selected_process() {
        if (!wizmem.env.selected_pids || wizmem.env.killing_process_flag) {
            return;
        }
        
        wizmem.env.killing_process_flag = true;

        $.ajax({
            type: 'post',
            url: '/kill_processes',
            contentType: "application/json",
            dataType: 'json',
            data: JSON.stringify({
                pids: wizmem.env.selected_pids
            }),
            success: (result) => {
                if (result['status'] != true) {
                    kill_selected_process_failed();
                    wizmem.env.killing_process_flag = false;
                    return;
                }

                let refresh_mem_info = result['refresh_mem_info'];
                wizmem.env.total_memory_size = refresh_mem_info['total_memory_size'];
                wizmem.env.free_memory_size = refresh_mem_info['free_memory_size'];
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

    function open_program_folder_in_explorer() {
        $.ajax({
            type: 'post',
            url: '/open_program_in_explorer',
            contentType: "application/json",
            dataType: 'json',
            data: JSON.stringify({
                absolute_path: encodeURI(wizmem.env.selected_program)
            }),
            success: () => {
            },
            error: () => {
            }
        });
    }

    return {
        env: {
            total_memory_size: 0,
            free_memory_size: 0,
            process_memory_infos: [],
            process_memory_pie_chart: undefined,
            process_memory_infos_roasted: [],
            selected_pids: null,
            selected_program: '',
            killing_process_flag: false,
            merge_same_program: false
        },
        init: function() {
            $.ajax({
                type: 'get',
                url: '/mem_info',
                success: (result) => {
                    if (result['total_memory_size'] === undefined ||
                        result['free_memory_size'] === undefined ||
                        result['process_memory_infos'] === undefined) {
                        init_failed();
                        return;
                    }

                    this.env.total_memory_size = result['total_memory_size'];
                    this.env.free_memory_size = result['free_memory_size'];
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