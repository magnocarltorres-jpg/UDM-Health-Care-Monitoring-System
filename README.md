# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Database migration

The backend uses Supabase (PostgreSQL). Before deploying the clinic extensions,
run [`backend/migrations/20261027_clinic_extensions.sql`](./backend/migrations/20261027_clinic_extensions.sql)
against the project's PostgreSQL database using the Supabase SQL Editor or your
usual migration workflow. This creates the course lookup, medicine dispensation,
and drug-test tables, adds guardian fields to patients, and
installs the transactional medicine-dispensing functions used by the API. The
medicine API reads and updates the existing `public.medicines` table, including
its `brand_name`, `generic_name`, `strength`, `stock_quantity`, and
`expiration_date` fields.

## Database row-level security

The backend uses a custom staff JWT and a Supabase service-role key; it does not
use Supabase Auth identities for staff. Apply
[`backend/migrations/20261103_enable_rls_for_application_tables.sql`](./backend/migrations/20261103_enable_rls_for_application_tables.sql)
after the clinic-extension migration above in the Supabase SQL Editor (or your
migration workflow) to enable RLS and revoke direct access for `PUBLIC`, `anon`,
and `authenticated` on the application tables. No client-role policies are
created intentionally: app data is accessed through the backend API, which
checks the staff JWT and account status (and admin role for administrative
operations). The service-role key bypasses RLS, so keep it only in the backend
environment and never expose it to the browser.

The read-only API schema also includes `medicine_inventory`,
`generate_patient_id()`, and an `rls_auto_enable` RPC. Apply
[`backend/migrations/20261104_restrict_exposed_database_resources.sql`](./backend/migrations/20261104_restrict_exposed_database_resources.sql)
after the RLS migration to deny client-role access to the inventory relation and
those RPCs while retaining service-role access. The inventory relation is
handled as a table or view based on its live database object type.

## Password setup links

Before deploying the password setup flow, apply
[`backend/migrations/20261104_staff_password_setup_tokens.sql`](./backend/migrations/20261104_staff_password_setup_tokens.sql)
after the migration that creates `public.staff_accounts`. It stores only a hash
of each setup token, expires links after one hour, and atomically allows a token
to be redeemed once. The API uses the Supabase service-role key to manage these
records.

## User and privacy policies

The public website links to [`public/security-and-user-policy.html`](./public/security-and-user-policy.html)
and [`public/privacy-policy.html`](./public/privacy-policy.html). The privacy
notice is explicitly a draft: the institution must confirm its legal basis,
official privacy contact, retention schedule, processor details, and transfer
safeguards with its Data Protection Officer before adopting or publishing it as
an official notice.

## Staff account credentials

Creating a staff account stores the staff member's email address and sends an
account notification using Mailjet. The email contains the Staff ID and a
single-use password setup link that expires after one hour; it never includes a
password. Password resets use the same flow, and the existing password remains
valid until the staff member completes setup.

To allow staff records without an email address, apply
[`backend/migrations/20261027_staff_email_optional.sql`](./backend/migrations/20261027_staff_email_optional.sql)
in the Supabase SQL Editor. Existing staff email values are retained.

The account-creation email uses the local HTML template at
[`backend/email-templates/account-created.html`](./backend/email-templates/account-created.html).
No Mailjet template ID is needed. Set these backend environment variables in
`backend/.env` for local development and in the backend hosting environment:

- `MAILJET_API_KEY`
- `MAILJET_SECRET_KEY`
- `MAILJET_SENDER_EMAIL` (a verified Mailjet sender)
- `MAILJET_SENDER_NAME` (optional; defaults to `UDM Health`)
- `APP_LOGIN_URL` (the HTTPS URL of the application login page)

To send a test email to the configured sender address, run
`node backend/test-mailjet.js` from the repository root.

If these values are missing or Mailjet rejects a send, a new account is created
without a usable password setup link. An administrator must use **Reset
Password** in Staff Management to send a new link. Passwords are never returned
by the reset API or displayed in the admin panel.

The public contact form continues to use Resend and requires `RESEND_API_KEY`,
`EMAIL_FROM`, and `CONTACT_EMAIL`.

## Role-specific login and admin routes

Nurses and Doctors sign in at `/login`; successful sign-in routes them to
`/nurse/dashboard` or `/doctor/dashboard`. Administrator sign-in is separate at
`/admin/login` and accepts the account's Staff ID or email. The public landing
page does not link to the Administrator login.

The backend accepts only Nurse and Doctor accounts at `/api/auth/login` and
only Administrator accounts at `/api/auth/admin/login`. Admin pages under
`/admin/*` require an active Administrator session. Administrative API routes
also verify the active account and Administrator role on the server; hiding or
entering a frontend route does not grant API access.

## Cloudflare Worker deployment

The frontend is deployed as a static-assets Cloudflare Worker from the `main`
branch. In the Cloudflare Git build settings, use:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

[`wrangler.jsonc`](./wrangler.jsonc) publishes `dist` and falls back to the
single-page application for routes such as `/admin/login`. Do not set
`GITHUB_PAGES` in the Cloudflare build environment; it is only for builds
deployed under the GitHub Pages repository subpath.

## Role-specific staff IDs

Apply
[`backend/migrations/20261029_role_prefixed_staff_ids.sql`](./backend/migrations/20261029_role_prefixed_staff_ids.sql)
in the Supabase SQL Editor before deploying the backend update. New Nurse
accounts receive sequential `NUR-###` IDs and Doctor accounts receive
sequential `DOC-###` IDs. Each sequence starts after the highest existing ID
with its role prefix and does not reuse IDs after an account is deleted.
Existing `StaffID-###` account IDs are not changed.
