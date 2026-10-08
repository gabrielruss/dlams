import unittest

from fastapi import Response

from app.auth.routes import logout


class LogoutRouteTests(unittest.TestCase):
    def test_logout_clears_access_cookie(self) -> None:
        response = logout(Response())

        self.assertEqual(response.status_code, 204)
        set_cookie = response.headers["set-cookie"]
        self.assertIn("access_token=", set_cookie)
        self.assertIn("Max-Age=0", set_cookie)
        self.assertIn("HttpOnly", set_cookie)
        self.assertIn("Path=/", set_cookie)


if __name__ == "__main__":
    unittest.main()
