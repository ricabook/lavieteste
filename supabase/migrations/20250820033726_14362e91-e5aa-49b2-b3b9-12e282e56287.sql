-- Add url_imagem_base64 column to bombons table
ALTER TABLE public.bombons 
ADD COLUMN url_imagem_base64 TEXT;