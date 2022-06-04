#!/usr/bin/env python

from setuptools import setup, find_packages
from wizmem import version

setup(
    name='WizMem',
    version=version.__version__,
    author='ljh, hzq',
    author_email='381418921@qq.com, 604916833@qq.com',
    description=('visual memory viewer'),
    license='LGPL',
    keywords='process memory graph',
    packages=find_packages(include=['wizmem', 'wizmem.*']),
    install_requires=open("./requirements.txt", "r", encoding="utf-8").read().splitlines(),
    include_package_data=True,
    zip_safe=False
)