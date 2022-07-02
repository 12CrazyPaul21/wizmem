#!/usr/bin/env python

import threading, webbrowser, socket, errno, sys

from wizmem import web

def check_singleton(server, port):
    result = False

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        try:
            sock.bind((server, port))
        except socket.error as e:
            if e.errno == errno.EADDRINUSE:
                result = True

    return result


def run():
    server = 'localhost'
    port = 7379
    url = "http://%s:%d" % (server, port)

    if check_singleton(server, port):
        webbrowser.open(url)
        sys.exit(0)        

    threading.Timer(1.5, lambda : webbrowser.open(url)).start()
    web.app.build(__name__).run(port=port)