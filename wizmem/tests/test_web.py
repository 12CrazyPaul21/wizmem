import unittest

from wizmem import web

class TestWebMod(unittest.TestCase):
    def setUp(self) -> None:
        self.app = web.app.build(__name__)
        self.client = self.app.test_client()
        return super().setUp()

    def test_request_process_info_list(self) -> None:
        self.assertIsNotNone(self.client)

        response = self.client.get('/mem_info')

        self.assertIsNotNone(response)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.is_json)

        result = response.get_json()
        self.assertIsNotNone(result)

        self.assertIn('total_memory_size', result)
        self.assertIn('process_memory_infos', result)
        self.assertNotEqual(0, result['total_memory_size'])
        self.assertNotEqual(0, len(result['process_memory_infos']))
