import psutil

def get_system_total_mem_size():
    return psutil.virtual_memory().total