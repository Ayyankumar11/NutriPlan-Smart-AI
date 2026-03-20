from supabase import create_client, Client
from app.config import settings

def get_supabase() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

def get_supabase_admin() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
