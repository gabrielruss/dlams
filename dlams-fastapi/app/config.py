"""
config.py
This file contains the configuration settings for the application.
"""

import os

from dotenv import load_dotenv

load_dotenv()

_secret = os.getenv("SECRET_KEY")
if _secret is None:
    raise ValueError("SECRET_KEY is not set in the environment variables.")

SECRET_KEY: str = _secret
COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "false").lower() == "true"
