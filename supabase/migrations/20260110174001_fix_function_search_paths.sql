-- Fix mutable search_path security warnings for functions
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- Setting search_path to empty string prevents search path manipulation attacks
-- by requiring all object references to be fully schema-qualified

ALTER FUNCTION public.is_admin() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.handle_updated_at() SET search_path = '';
