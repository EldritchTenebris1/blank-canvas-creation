-- 1. Ordem personalizada de produtos
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sort_order integer;

-- Backfill inicial pela ordem alfabética
WITH ordered AS (
  SELECT id, row_number() OVER (ORDER BY name) * 10 AS rn
  FROM public.products
)
UPDATE public.products p
SET sort_order = o.rn
FROM ordered o
WHERE p.id = o.id AND p.sort_order IS NULL;

-- 2. Função de registro de venda (baixa pista + insere movement)
CREATE OR REPLACE FUNCTION public.register_sale(_items jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _item jsonb;
  _pid uuid;
  _qty integer;
  _current integer;
  _pname text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  FOR _item IN SELECT * FROM jsonb_array_elements(_items)
  LOOP
    _pid := (_item->>'product_id')::uuid;
    _qty := (_item->>'quantity')::integer;

    IF _qty IS NULL OR _qty <= 0 THEN
      CONTINUE;
    END IF;

    SELECT pista_qty, name INTO _current, _pname
    FROM public.products WHERE id = _pid FOR UPDATE;

    IF _current IS NULL THEN
      RAISE EXCEPTION 'Produto não encontrado';
    END IF;

    IF _current < _qty THEN
      RAISE EXCEPTION 'Estoque insuficiente na pista para %', _pname;
    END IF;

    UPDATE public.products
    SET pista_qty = pista_qty - _qty
    WHERE id = _pid;

    INSERT INTO public.movements (product_id, type, quantity, location, user_id)
    VALUES (_pid, 'venda'::transaction_type, _qty, 'pista'::stock_location, _uid);
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_sale(jsonb) TO authenticated;