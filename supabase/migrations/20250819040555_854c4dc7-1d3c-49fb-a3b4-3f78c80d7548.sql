-- Add ordem column to all options tables
ALTER TABLE public.opcoes_chocolate ADD COLUMN ordem INTEGER DEFAULT 0;
ALTER TABLE public.opcoes_base ADD COLUMN ordem INTEGER DEFAULT 0;
ALTER TABLE public.opcoes_ganache ADD COLUMN ordem INTEGER DEFAULT 0;
ALTER TABLE public.opcoes_geleia ADD COLUMN ordem INTEGER DEFAULT 0;
ALTER TABLE public.opcoes_cor ADD COLUMN ordem INTEGER DEFAULT 0;

-- Update existing records with sequential order
UPDATE public.opcoes_chocolate SET ordem = (
    SELECT row_number() OVER (ORDER BY nome) - 1
    FROM public.opcoes_chocolate c2
    WHERE c2.id = opcoes_chocolate.id
);

UPDATE public.opcoes_base SET ordem = (
    SELECT row_number() OVER (ORDER BY nome) - 1
    FROM public.opcoes_base b2
    WHERE b2.id = opcoes_base.id
);

UPDATE public.opcoes_ganache SET ordem = (
    SELECT row_number() OVER (ORDER BY nome) - 1
    FROM public.opcoes_ganache g2
    WHERE g2.id = opcoes_ganache.id
);

UPDATE public.opcoes_geleia SET ordem = (
    SELECT row_number() OVER (ORDER BY nome) - 1
    FROM public.opcoes_geleia ge2
    WHERE ge2.id = opcoes_geleia.id
);

UPDATE public.opcoes_cor SET ordem = (
    SELECT row_number() OVER (ORDER BY nome) - 1
    FROM public.opcoes_cor co2
    WHERE co2.id = opcoes_cor.id
);