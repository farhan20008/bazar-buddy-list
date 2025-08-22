-- Enable Row Level Security on item_suggestions table
ALTER TABLE public.item_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to item suggestions
-- This table contains suggestion data that should be readable by all authenticated users
CREATE POLICY "Allow public read access to item suggestions" 
ON public.item_suggestions 
FOR SELECT 
TO authenticated 
USING (true);

-- Fix the function search path issue for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$function$;