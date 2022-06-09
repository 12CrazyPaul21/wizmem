/**
 * wizmem web manager logical module
 */

const wizmem = (function() {

    function update_wizmem_chart() {

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

        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
            var data = google.visualization.arrayToDataTable([
                ['Task', 'Hours per Day'],
                ['Work',     11],
                ['Eat',      2],
                ['Commute',  2],
                ['Watch TV', 2],
                ['Sleep',    7]
            ]);

            var options = {
                title: 'Process Memory Info',
                backgroundColor: 'transparent',
                width: 800,
                height: 400
            };

            var chart = new google.visualization.PieChart(document.getElementById('process-memory-pie-chart'));
            chart.draw(data, options);
        }

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

    return {
        env: {
            total_memory_size: 0,
            process_memory_infos: []
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