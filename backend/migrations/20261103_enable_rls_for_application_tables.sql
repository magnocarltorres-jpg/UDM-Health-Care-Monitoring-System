ALTER TABLE public.staff_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_dispensations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
  public.staff_accounts,
  public.password_reset_requests,
  public.patients,
  public.courses,
  public.medicines,
  public.drug_test_results,
  public.clinic_assessments,
  public.medicine_dispensations,
  public.contact_inquiries
FROM PUBLIC, anon, authenticated;

-- These tables intentionally have no client-role policies. The app uses custom
-- staff JWTs at the API, which accesses Supabase using the service-role key.
