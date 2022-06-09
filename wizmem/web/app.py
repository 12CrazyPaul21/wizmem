import os, signal

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
            'process_memory_infos': list(mem.get_process_info_list())
        }

    @app.route("/shutdown")
    def shutdown():
        os.kill(signal.CTRL_C_EVENT, 0)
        return {
            'result': True
        }

    return app