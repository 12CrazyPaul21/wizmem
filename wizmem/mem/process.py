import psutil


def get_process_list():
   return list(map(lambda pid: {'Pid': pid, 'ProcessName': psutil.Process(pid).name}, psutil.pids()))