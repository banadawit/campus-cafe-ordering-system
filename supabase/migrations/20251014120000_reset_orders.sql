-- Function: reset all orders and items, restarting identity sequences
-- Only admins (checked via public.has_role) may execute

CREATE OR REPLACE FUNCTION public.reset_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Truncate child table first due to FK, restart identities and cascade
  TRUNCATE TABLE public.order_items RESTART IDENTITY CASCADE;
  TRUNCATE TABLE public.orders RESTART IDENTITY CASCADE;
END;
$$;

REVOKE ALL ON FUNCTION public.reset_orders() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_orders() TO anon, authenticated;


