#!/usr/bin/env python

import threading, webbrowser

from wizmem import web

def run():
    port = 7379
    url = "http://127.0.0.1:%d" % port
    threading.Timer(1.5, lambda : webbrowser.open(url)).start()
    web.app.build(__name__).run(port=port)