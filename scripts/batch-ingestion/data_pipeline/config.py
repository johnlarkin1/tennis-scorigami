import os

from dotenv import load_dotenv

load_dotenv()

_RAPIDAPI_KEY_TMP = os.getenv("RAPIDAPI_KEY")
assert _RAPIDAPI_KEY_TMP, "RapidAPI key is missing. Set it in the .env file."
RAPIDAPI_KEY = _RAPIDAPI_KEY_TMP

_SUPABASE_URL_TMP = os.getenv("SUPABASE_URL")
assert _SUPABASE_URL_TMP, "Supabase URL is missing. Set it in the .env file."
SUPABASE_URL = _SUPABASE_URL_TMP

_SUPABASE_KEY_TMP = os.getenv("SUPABASE_KEY")
assert _SUPABASE_KEY_TMP, "Supabase key is missing. Set it in the .env file."
SUPABASE_KEY = _SUPABASE_KEY_TMP

_SPORTRADAR_KEY_TMP = os.getenv("SPORTRADAR_API_KEY")
assert _SPORTRADAR_KEY_TMP, "Sportradar API key is missing. Set it in the .env file."
SPORTRADAR_API_KEY = _SPORTRADAR_KEY_TMP
