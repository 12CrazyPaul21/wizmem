import unittest

from . import test_mem
from . import test_web

suite = unittest.TestSuite()
loader = unittest.TestLoader()
suite.addTest(loader.loadTestsFromTestCase(test_mem.TestMemMod))
suite.addTest(loader.loadTestsFromTestCase(test_web.TestWebMod))
unittest.TextTestRunner().run(suite)