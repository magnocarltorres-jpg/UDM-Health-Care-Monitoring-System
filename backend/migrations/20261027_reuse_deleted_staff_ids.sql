CREATE OR REPLACE FUNCTION public.generate_staff_id(p_role text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_prefix text;
  v_candidate integer := 1;
  v_staff_id text;
BEGIN
  CASE lower(trim(p_role))
    WHEN 'nurse' THEN
      v_prefix := 'NUR';
    WHEN 'doctor' THEN
      v_prefix := 'DOC';
    ELSE
      RAISE EXCEPTION 'Unsupported staff role: %', p_role;
  END CASE;

  PERFORM pg_advisory_xact_lock(
    hashtext('generate_staff_id:' || v_prefix)::bigint
  );

  LOOP
    v_staff_id := v_prefix || '-' ||
      CASE
        WHEN v_candidate < 1000 THEN lpad(v_candidate::text, 3, '0')
        ELSE v_candidate::text
      END;

    IF NOT EXISTS (
      SELECT 1
      FROM public.staff_accounts
      WHERE staff_id = v_staff_id
    ) THEN
      RETURN v_staff_id;
    END IF;

    v_candidate := v_candidate + 1;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_staff_id(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_staff_id(text) TO service_role;
