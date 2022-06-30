# v0.1.0 TODO

- [x] 以管理员权限启动wizmem，确保拥有足够权限执行结束进程等操作
- [x] 结束进程
- [x] 使用饼图显示系统内存分布（使用[chart.js](https://www.chartjs.org/docs/latest/)）
- [x] 自定义饼图右键菜单（使用[jquery.contextify.js](http://contextify.js.org/)）
- [x] 对于饼图中的所有程序使用独立尽可能唯一的颜色来显示（使用[uniqolor](https://www.npmjs.com/package/uniqolor)）
- [x] 显示空余部分内存
- [x] 加入开关控制是否合并相同程序的进程
- [ ] 加入开关控制相同进程名但不同程序的进程
- [x] 加入刷新按钮
- [ ] 加入定时刷新
- [ ] 获取程序图标
- [x] 提供接口在资源管理器中打开程序所在文件夹
- [ ] 给README添加Travis-CI的badge图标
- [ ] 在CI中补充执行测试脚本
- [ ] 处理没有正确停止wizmem问题
- [ ] 加入限定wizmem进程单例

# v0.2.0 TODO

- [ ] 加入多选进程条目
- [ ] 加入执行释放“泄露内存”
- [ ] 加入执行释放“空闲内存”
- [ ] 把保留、不可用的内存空间大小也放入饼图中