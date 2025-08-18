-- Fix the handle_new_user function to handle cases where nome/telefone might be null
-- This will allow users to be created directly from the Supabase dashboard

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert into profiles table with default values if metadata is missing
  INSERT INTO public.profiles (user_id, nome, telefone)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'telefone', '')
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;