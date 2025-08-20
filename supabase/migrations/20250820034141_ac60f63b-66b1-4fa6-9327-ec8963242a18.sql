-- Add nome_guest and telefone_guest columns to bombons table for non-logged users
ALTER TABLE public.bombons 
ADD COLUMN nome_guest TEXT,
ADD COLUMN telefone_guest TEXT;

-- Update RLS policies to allow anonymous users to insert with guest info
CREATE POLICY "Anonymous users can create bombons with guest info" 
ON public.bombons 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR 
  (auth.uid() IS NULL AND user_id IS NULL AND nome_guest IS NOT NULL AND telefone_guest IS NOT NULL)
);