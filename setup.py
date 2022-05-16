#!/usr/bin/env python

from setuptools import setup, find_packages
from wizmem import version

setup(
    name='WizMem',
    version=version.__version__,
    author='',
    author_email='',
    description=(''),
    license='LGPL',
    keywords='process memory graph',
    packages=find_packages(include=['wizmem', 'wizmem.*']),
    install_requires=open("./requirements.txt", "r", encoding="utf-8").read().splitlines(),
)