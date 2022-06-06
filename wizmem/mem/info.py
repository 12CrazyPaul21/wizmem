from ast import expr_context
import psutil

from typing import Iterator

def get_system_total_mem_size() -> int:
    """
    get system total memory size

    :returns: total memory size
    :rtype: int
    """
    
    return psutil.virtual_memory().total

def __map_process_info(pid: int) -> object:
    """
    encapsulate process info

    :param pid: process id
    :returns: process info dictionary
    """

    r = {
        'pid': pid
    }

    try:
        p = psutil.Process(pid)
        r['process_name'] = p.name()
        r['absolute_path'] = p.exe()

        m = p.memory_full_info()
        r['memory_info'] = {
            'rss': m.rss,
            'vms': m.vms,
            'private': m.private,
            'uss': m.uss
        }
    except psutil.NoSuchProcess:
        pass
    except psutil.AccessDenied:
        pass
    except Exception:
        pass

    return r

def get_process_info_list() -> Iterator[object]:
    """
    get all process's memory info list

    :returns: process info list generator
    :rtype: Iterator[object]
    """

    return map(__map_process_info, psutil.pids())