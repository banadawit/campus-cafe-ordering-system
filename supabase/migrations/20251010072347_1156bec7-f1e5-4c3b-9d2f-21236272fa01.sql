-- Create enum types
CREATE TYPE public.food_category AS ENUM ('food', 'drink');
CREATE TYPE public.order_type AS ENUM ('delivery', 'cafeteria');
CREATE TYPE public.order_status AS ENUM ('pending', 'completed');
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create food table
CREATE TABLE public.food (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image TEXT,
  available BOOLEAN DEFAULT true NOT NULL,
  category food_category NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create orders table (no user_id since students don't need accounts)
CREATE TABLE public.orders (
  id BIGSERIAL PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  order_type order_type NOT NULL,
  block_type TEXT,
  dorm_number TEXT,
  time_slot TEXT,
  status order_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create order_items table
CREATE TABLE public.order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  food_id BIGINT REFERENCES public.food(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.food ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for food table
-- Anyone can view available food items
CREATE POLICY "Anyone can view available food" ON public.food
  FOR SELECT USING (available = true);

-- Only admins can manage food items
CREATE POLICY "Admins can insert food" ON public.food
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update food" ON public.food
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete food" ON public.food
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for orders table
-- Anyone can create orders (students don't need accounts)
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Only admins can view and update orders
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for order_items table
-- Anyone can create order items (part of order creation)
CREATE POLICY "Anyone can create order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- Admins can view order items
CREATE POLICY "Admins can view order items" ON public.order_items
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles table
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample food items
INSERT INTO public.food (name, price, description, category, available) VALUES
  ('Burger Deluxe', 8.99, 'Juicy beef patty with lettuce, tomato, and special sauce', 'food', true),
  ('Caesar Salad', 6.99, 'Fresh romaine lettuce with caesar dressing and croutons', 'food', true),
  ('Chicken Wrap', 7.49, 'Grilled chicken with vegetables wrapped in tortilla', 'food', true),
  ('Pizza Slice', 3.99, 'Classic pepperoni pizza slice', 'food', true),
  ('French Fries', 2.99, 'Crispy golden fries', 'food', true),
  ('Coca Cola', 1.99, 'Classic Coke - 330ml', 'drink', true),
  ('Orange Juice', 2.49, 'Fresh squeezed orange juice', 'drink', true),
  ('Water', 0.99, 'Bottled water - 500ml', 'drink', true),
  ('Coffee', 2.49, 'Hot brewed coffee', 'drink', true),
  ('Iced Tea', 1.99, 'Refreshing iced tea', 'drink', true);