#!/usr/bin/env python

from wizmem import web

def run():
    web.app.build(__name__).run(port=7379)