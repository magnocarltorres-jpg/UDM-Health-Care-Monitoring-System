DO $$
DECLARE
  v_relation_kind "char";
  v_function regprocedure;
BEGIN
  SELECT relkind
  INTO v_relation_kind
  FROM pg_class
  WHERE oid = to_regclass('public.medicine_inventory');

  IF v_relation_kind IS NOT NULL THEN
    EXECUTE
      'REVOKE ALL PRIVILEGES ON TABLE public.medicine_inventory FROM PUBLIC, anon, authenticated';

    IF v_relation_kind IN ('r', 'p') THEN
      EXECUTE 'ALTER TABLE public.medicine_inventory ENABLE ROW LEVEL SECURITY';
    END IF;
  END IF;

  SELECT p.oid::regprocedure
  INTO v_function
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname = 'generate_patient_id'
    AND p.pronargs = 0
    AND p.prokind = 'f';

  IF v_function IS NULL THEN
    RAISE EXCEPTION 'Expected public.generate_patient_id() function was not found.';
  END IF;

  EXECUTE format(
    'REVOKE ALL PRIVILEGES ON FUNCTION %s FROM PUBLIC, anon, authenticated',
    v_function
  );
  EXECUTE format(
    'GRANT EXECUTE ON FUNCTION %s TO service_role',
    v_function
  );

  FOR v_function IN
    SELECT p.oid::regprocedure
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'rls_auto_enable'
      AND p.prokind = 'f'
  LOOP
    EXECUTE format(
      'REVOKE ALL PRIVILEGES ON FUNCTION %s FROM PUBLIC, anon, authenticated',
      v_function
    );
    EXECUTE format(
      'GRANT EXECUTE ON FUNCTION %s TO service_role',
      v_function
    );
  END LOOP;
END;
$$;
