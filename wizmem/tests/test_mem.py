import unittest

from wizmem import mem

class TestMemMod(unittest.TestCase):
    def test_get_process_list(self):
        self.assertNotEqual(0, len(mem.process.get_process_list()))