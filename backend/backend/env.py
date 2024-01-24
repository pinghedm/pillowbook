import os

SECRET_KEY = os.environ.get("SECRET_KEY", "pylintneedssomethingset")
DEBUG = os.environ.get("DEBUG", "false") != "false"

DB_NAME = os.environ.get("DB_NAME", "db")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "goodpassword")
DB_HOST = os.environ.get("DB_HOST", "db")
DB_PORT = os.environ.get("DB_PORT", "5432")

SESSION_COOKIE_SECURE = os.environ.get("SESSION_COOKIE_SECURE", "True") == "True"
WEB_HOST = os.environ.get("WEB_HOST", "http://localhost:8000")
STATIC_URL = os.environ.get("STATIC_URL", "/static/")
