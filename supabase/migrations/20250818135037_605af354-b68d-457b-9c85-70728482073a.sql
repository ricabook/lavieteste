-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create customization options tables
CREATE TABLE public.opcoes_chocolate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.opcoes_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.opcoes_ganache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.opcoes_geleia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.opcoes_cor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo_hex TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bombons table
CREATE TABLE public.bombons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chocolate_id UUID REFERENCES public.opcoes_chocolate(id),
  base_id UUID REFERENCES public.opcoes_base(id),
  ganache_id UUID REFERENCES public.opcoes_ganache(id),
  geleia_id UUID REFERENCES public.opcoes_geleia(id),
  cor_id UUID REFERENCES public.opcoes_cor(id),
  prompt_gerado TEXT,
  url_imagem TEXT,
  status TEXT DEFAULT 'enviado' CHECK (status IN ('enviado', 'em_producao', 'finalizado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opcoes_chocolate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opcoes_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opcoes_ganache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opcoes_geleia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opcoes_cor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bombons ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, nome, telefone)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'nome',
    NEW.raw_user_meta_data->>'telefone'
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for customization options (public read)
CREATE POLICY "Everyone can view active chocolate options" 
ON public.opcoes_chocolate 
FOR SELECT 
TO authenticated
USING (ativo = true);

CREATE POLICY "Admins can manage chocolate options" 
ON public.opcoes_chocolate 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view active base options" 
ON public.opcoes_base 
FOR SELECT 
TO authenticated
USING (ativo = true);

CREATE POLICY "Admins can manage base options" 
ON public.opcoes_base 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view active ganache options" 
ON public.opcoes_ganache 
FOR SELECT 
TO authenticated
USING (ativo = true);

CREATE POLICY "Admins can manage ganache options" 
ON public.opcoes_ganache 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view active geleia options" 
ON public.opcoes_geleia 
FOR SELECT 
TO authenticated
USING (ativo = true);

CREATE POLICY "Admins can manage geleia options" 
ON public.opcoes_geleia 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view active cor options" 
ON public.opcoes_cor 
FOR SELECT 
TO authenticated
USING (ativo = true);

CREATE POLICY "Admins can manage cor options" 
ON public.opcoes_cor 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for bombons
CREATE POLICY "Users can view their own bombons" 
ON public.bombons 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bombons" 
ON public.bombons 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bombons" 
ON public.bombons 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bombons" 
ON public.bombons 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all bombons" 
ON public.bombons 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bombons_updated_at
  BEFORE UPDATE ON public.bombons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial customization options
INSERT INTO public.opcoes_chocolate (nome) VALUES 
('Chocolate ao Leite'),
('Chocolate Meio Amargo'),
('Chocolate Branco'),
('Chocolate 70% Cacau');

INSERT INTO public.opcoes_base (nome) VALUES 
('Biscoito Triturado'),
('Castanha Triturada'),
('Coco Ralado'),
('Sem Base');

INSERT INTO public.opcoes_ganache (nome) VALUES 
('Ganache de Chocolate'),
('Ganache de Caramelo'),
('Ganache de Frutas Vermelhas'),
('Ganache de Maracujá'),
('Ganache de Café');

INSERT INTO public.opcoes_geleia (nome) VALUES 
('Geleia de Morango'),
('Geleia de Framboesa'),
('Geleia de Maracujá'),
('Geleia de Damasco'),
('Sem Geleia');

INSERT INTO public.opcoes_cor (nome, codigo_hex) VALUES 
('Rosa', '#FFB6C1'),
('Azul', '#87CEEB'),
('Verde', '#98FB98'),
('Amarelo', '#FFFF99'),
('Roxo', '#DDA0DD'),
('Laranja', '#FFB347'),
('Vermelho', '#FF6B6B'),
('Branco', '#FFFFFF');