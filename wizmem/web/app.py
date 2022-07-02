import os, time, signal
import psutil, webbrowser

from urllib.parse import unquote
from flask import Flask
from flask import request, render_template

from wizmem import mem

def build(app_name: str) -> Flask:
    cwd = os.getcwd()
    
    if not os.path.isdir("%s/%s" % (cwd, 'templates')):
        cwd = cwd + "/wizmem"

    app = Flask(app_name,
                static_folder = cwd + '/static',
                template_folder = cwd + '/templates')

    @app.route("/")
    def index_page():
        return render_template('index.html')

    @app.route("/favicon.ico")
    def favicon():
        return app.send_static_file('favicon.ico')

    @app.route("/mem_info")
    def response_memory_infos():
        return {
            'total_memory_size': mem.get_system_total_mem_size(),
            'free_memory_size': mem.get_system_free_mem_size(),
            'process_memory_infos': list(mem.get_process_info_list())
        }

    @app.route("/kill_processes", methods = ['POST'])
    def kill_processes():
        if not request.is_json:
            return {
                'status': False
            }

        content = request.get_json()
        if 'pids' not in content:
            return {
                'status': False
            }

        for pid in content['pids']:
            try:
                psutil.Process(pid).kill()
            except Exception as e:
                app.logger.error('kill process(pid : {}) failed'.format(pid))

        # sleep a second
        time.sleep(1.0)

        return {
            'status': True,
            'refresh_mem_info': {
                'total_memory_size': mem.get_system_total_mem_size(),
                'free_memory_size': mem.get_system_free_mem_size(),
                'process_memory_infos': list(mem.get_process_info_list())
            }
        }

    @app.route("/open_program_in_explorer", methods = ['POST'])
    def open_program_in_explorer():
        if not request.is_json:
            return {
                'status': False
            }

        content = request.get_json()
        if 'absolute_path' not in content:
            return {
                'status': False
            }

        absolute_path = os.path.dirname(unquote(content['absolute_path']))

        try:
            webbrowser.open(absolute_path)
        except Exception as e:
            app.logger.error('open program in explorer(absolute_path : {}) failed'.format(absolute_path))

        return {
            'status': True
        }

    @app.route("/shutdown")
    def shutdown():
        shutdown_func = request.environ.get('werkzeug.server.shutdown')

        if shutdown_func:
            shutdown_func()
        else:
            os.kill(os.getpid(), signal.SIGINT)

        return {
            'result': True,
        }

    return app