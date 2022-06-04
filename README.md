# WizMem

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
# 打包到dist/wizmem目录下，需要打包为压缩包的话，请手动打包
# 另外执行之前请手动安装pyinstaller(pip install pyinstaller)
build_executable
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
