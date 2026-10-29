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

## Staff account credentials

Creating a staff account stores the staff member's email address and sends an
account notification using Mailjet. The email contains a sign-in link, Staff ID,
and initial password. Staff must change the password at first login.

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

If these values are missing or Mailjet rejects a send, the staff account is
still created and the API response reports that the notification was not sent.
The account-created email includes the initial password and requires the staff
member to change it at first login. Because email is not a secure channel,
administrators should use a unique temporary password and tell the recipient
to change it immediately.
When an administrator approves a password reset, the new temporary password
is also sent to the staff member's saved email address. If no email address is
saved or Mailjet cannot deliver the message, the admin panel displays the
temporary password for secure sharing.

The public contact form continues to use Resend and requires `RESEND_API_KEY`,
`EMAIL_FROM`, and `CONTACT_EMAIL`.

## Role-specific staff IDs

Apply
[`backend/migrations/20261029_role_prefixed_staff_ids.sql`](./backend/migrations/20261029_role_prefixed_staff_ids.sql)
in the Supabase SQL Editor before deploying the backend update. New Nurse
accounts receive sequential `NUR-###` IDs and Doctor accounts receive
sequential `DOC-###` IDs. Each sequence starts after the highest existing ID
with its role prefix and does not reuse IDs after an account is deleted.
Existing `StaffID-###` account IDs are not changed.

## Patient history, inventory, and audit

Before deploying the patient history and reporting updates, apply
[`backend/migrations/20261030_patient_history_inventory_audit.sql`](./backend/migrations/20261030_patient_history_inventory_audit.sql)
to the Supabase database. It adds patient allergy and follow-up records, medicine
batch numbers, stock movement history, aggregate report data, and an append-only
audit log. Existing medicine rows are assigned `LEGACY-<id>` batch numbers.

The inventory page flags batches with 10 or fewer units and batches expiring
within 30 days. Dispensing remains restricted to unexpired batches with enough
stock. Reports show aggregate visit and dispensing totals, current inventory
alerts, and recent audit events. Audit entries record the staff account,
action, record identifier, and changed field names, but not patient values.

Clinic visit history is loaded from the authenticated backend rather than
persisted in browser storage. The app removes any old `udm_clinic_history`
browser-storage entry on startup.

Authentication uses an `HttpOnly` session cookie rather than a JavaScript-
readable token. The frontend sends credentials with API requests, and the API
requires an allowed `Origin` plus the `X-Requested-With` request header for
write operations. Configure the backend `CORS_ORIGINS` environment variable
with the exact deployed frontend origin(s), comma-separated; include the local
Vite origin when needed for development. Production cookies require HTTPS.
Existing bearer-token sessions are invalidated by this change, so staff must
sign in again after deployment.
