CREATE SEQUENCE IF NOT EXISTS public.staff_id_number_seq
  AS bigint
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

DO $$
DECLARE
  v_max_existing bigint;
  v_last_value bigint;
  v_is_called boolean;
  v_current_value bigint;
BEGIN
  SELECT MAX(substring(staff_id FROM '[0-9]+$')::bigint)
  INTO v_max_existing
  FROM public.staff_accounts
  WHERE staff_id ~* '^StaffID-[0-9]+$';

  SELECT last_value, is_called
  INTO v_last_value, v_is_called
  FROM public.staff_id_number_seq;

  v_current_value := CASE
    WHEN v_is_called THEN v_last_value
    ELSE 0
  END;

  IF v_max_existing IS NOT NULL AND v_max_existing > v_current_value THEN
    PERFORM setval(
      'public.staff_id_number_seq',
      v_max_existing,
      true
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_staff_id(p_role text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_candidate bigint;
BEGIN
  IF lower(trim(p_role)) NOT IN ('nurse', 'doctor') THEN
    RAISE EXCEPTION 'Unsupported staff role: %', p_role;
  END IF;

  v_candidate := nextval('public.staff_id_number_seq');

  RETURN 'StaffID-' ||
    CASE
      WHEN v_candidate < 1000 THEN lpad(v_candidate::text, 3, '0')
      ELSE v_candidate::text
    END;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_staff_id(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_staff_id(text) TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.staff_id_number_seq TO service_role;
