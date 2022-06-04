import unittest

from wizmem import mem

class TestMemMod(unittest.TestCase):
    def test_get_system_total_men_size(self):
        self.assertNotEqual(0, mem.get_system_total_mem_size())
        
    def test_get_process_list(self):
        self.assertNotEqual(0, len(list(mem.get_process_info_list())))