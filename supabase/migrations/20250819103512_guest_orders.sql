-- Allow guest orders by making user_id optional and adding guest fields
ALTER TABLE public.bombons
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.bombons
  ADD COLUMN IF NOT EXISTS guest_nome TEXT,
  ADD COLUMN IF NOT EXISTS guest_telefone TEXT;

-- Optional: simple check to ensure at least user_id or guest data is present
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bombons_user_or_guest_chk'
  ) THEN
    ALTER TABLE public.bombons
    ADD CONSTRAINT bombons_user_or_guest_chk
    CHECK (
      user_id IS NOT NULL
      OR (guest_nome IS NOT NULL AND guest_telefone IS NOT NULL)
    );
  END IF;
END $$;