# WizMem [![Build Status](https://app.travis-ci.com/12CrazyPaul21/wizmem.svg?branch=master)](https://app.travis-ci.com/12CrazyPaul21/wizmem)

## 安装依赖

```bash
pip install -r requirements.txt
```

## 安装

``` bash
python setup.py install
```

## 打包为可执行二进制

``` bash
./build_executable
```

## 调用方法

```python
import wizmem
wizmem.run()
```

or

```bash
python -c "import wizmem; wizmem.run()"
```

## 执行测试

``` bash
python -m wizmem.tests
```

or

```bash
python -m unittest discover -v -s ./wizmem -p test_*.py
```

