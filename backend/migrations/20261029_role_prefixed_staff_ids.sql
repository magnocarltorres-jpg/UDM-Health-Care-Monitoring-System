CREATE SEQUENCE IF NOT EXISTS public.staff_id_nurse_seq
  AS bigint
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.staff_id_doctor_seq
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
BEGIN
  SELECT MAX(substring(staff_id FROM '[0-9]+$')::bigint)
  INTO v_max_existing
  FROM public.staff_accounts
  WHERE staff_id ~* '^NUR-[0-9]+$';

  SELECT last_value, is_called
  INTO v_last_value, v_is_called
  FROM public.staff_id_nurse_seq;

  IF v_max_existing IS NOT NULL
     AND (v_max_existing > v_last_value OR NOT v_is_called) THEN
    PERFORM setval('public.staff_id_nurse_seq', v_max_existing, true);
  END IF;

  SELECT MAX(substring(staff_id FROM '[0-9]+$')::bigint)
  INTO v_max_existing
  FROM public.staff_accounts
  WHERE staff_id ~* '^DOC-[0-9]+$';

  SELECT last_value, is_called
  INTO v_last_value, v_is_called
  FROM public.staff_id_doctor_seq;

  IF v_max_existing IS NOT NULL
     AND (v_max_existing > v_last_value OR NOT v_is_called) THEN
    PERFORM setval('public.staff_id_doctor_seq', v_max_existing, true);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_staff_id(p_role text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_prefix text;
  v_sequence text;
  v_candidate bigint;
BEGIN
  CASE lower(trim(p_role))
    WHEN 'nurse' THEN
      v_prefix := 'NUR';
      v_sequence := 'public.staff_id_nurse_seq';
    WHEN 'doctor' THEN
      v_prefix := 'DOC';
      v_sequence := 'public.staff_id_doctor_seq';
    ELSE
      RAISE EXCEPTION 'Unsupported staff role: %', p_role;
  END CASE;

  v_candidate := nextval(v_sequence::regclass);

  RETURN v_prefix || '-' ||
    CASE
      WHEN v_candidate < 1000 THEN lpad(v_candidate::text, 3, '0')
      ELSE v_candidate::text
    END;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_staff_id(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_staff_id(text) TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.staff_id_nurse_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.staff_id_doctor_seq TO service_role;
