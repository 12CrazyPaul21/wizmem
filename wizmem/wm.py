#!/usr/bin/env python

import threading, webbrowser, socket, errno, sys
import pystray
import urllib.request

from PIL import Image

from wizmem import web

WIZMEM_SERVER = 'localhost'
WIZMEM_SERVER_PORT = 7379
WIZMEM_SERVER_URL = "http://%s:%d" % (WIZMEM_SERVER, WIZMEM_SERVER_PORT)

def check_singleton(server, port):
    result = False

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        try:
            sock.bind((server, port))
        except socket.error as e:
            if e.errno == errno.EADDRINUSE:
                result = True

    return result

def setup_systemtray():
    icon_path = 'static/favicon.ico'
    if not getattr(sys, 'frozen', False):
        icon_path = 'wizmem/%s' % icon_path

    menu = pystray.Menu(
        pystray.MenuItem(
            text='Open Web Manager Site',
            action=lambda: webbrowser.open(WIZMEM_SERVER_URL)
        ),
        pystray.MenuItem(
            text='Quit',
            action=lambda: urllib.request.urlopen('%s/shutdown' % WIZMEM_SERVER_URL)
        ),
    )

    icon = pystray.Icon('wizmem', icon=Image.open(icon_path), menu=menu)
    threading.Thread(target=lambda: icon.run(), daemon=True).start()

def run():
    if check_singleton(WIZMEM_SERVER, WIZMEM_SERVER_PORT):
        webbrowser.open(WIZMEM_SERVER_URL)
        sys.exit(0)

    setup_systemtray()

    threading.Timer(1.5, lambda: webbrowser.open(WIZMEM_SERVER_URL)).start()
    web.app.build(__name__).run(port=WIZMEM_SERVER_PORT)