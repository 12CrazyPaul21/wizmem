from . import version
from . import mem
from . import web
from . import wm

__version__ = version.__version__
__all__ = ['wm', 'mem']

run = wm.run