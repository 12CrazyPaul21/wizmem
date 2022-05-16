import unittest

from . import test_mem

suite = unittest.TestSuite()
loader = unittest.TestLoader()
suite.addTest(loader.loadTestsFromTestCase(test_mem.TestMemMod))
unittest.TextTestRunner().run(suite)