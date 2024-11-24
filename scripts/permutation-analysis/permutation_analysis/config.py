import os

from dotenv import load_dotenv

load_dotenv()

_SUPABASE_RAW_DB_NAME_TMP = os.getenv("SUPABASE_RAW_DB_NAME")
assert _SUPABASE_RAW_DB_NAME_TMP, "Supabase raw database name is missing. Set it in the .env file."
SUPABASE_RAW_DB_NAME = _SUPABASE_RAW_DB_NAME_TMP

_SUPABASE_RAW_DB_USER_TMP = os.getenv("SUPABASE_RAW_DB_USER")
assert _SUPABASE_RAW_DB_USER_TMP, "Supabase raw database user is missing. Set it in the .env file."
SUPABASE_RAW_DB_USER = _SUPABASE_RAW_DB_USER_TMP

_SUPABASE_RAW_DB_PASSWORD_TMP = os.getenv("SUPABASE_RAW_DB_PASSWORD")
assert (
    _SUPABASE_RAW_DB_PASSWORD_TMP
), "Supabase raw database password is missing. Set it in the .env file."
SUPABASE_RAW_DB_PASSWORD = _SUPABASE_RAW_DB_PASSWORD_TMP

_SUPABASE_RAW_DB_HOST_TMP = os.getenv("SUPABASE_RAW_DB_HOST")
assert _SUPABASE_RAW_DB_HOST_TMP, "Supabase raw database host is missing. Set it in the .env file."
SUPABASE_RAW_DB_HOST = _SUPABASE_RAW_DB_HOST_TMP

_SUPABASE_RAW_DB_PORT_TMP = os.getenv("SUPABASE_RAW_DB_PORT")
assert _SUPABASE_RAW_DB_PORT_TMP, "Supabase raw database port is missing. Set it in the .env file."
SUPABASE_RAW_DB_PORT = _SUPABASE_RAW_DB_PORT_TMP
