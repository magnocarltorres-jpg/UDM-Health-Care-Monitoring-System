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
account notification using Mailjet. The email contains a sign-in link and Staff
ID, but never includes the initial password. The administrator must share that
password securely; staff must change it at first login.

To allow staff records without an email address, apply
[`backend/migrations/20261027_staff_email_optional.sql`](./backend/migrations/20261027_staff_email_optional.sql)
in the Supabase SQL Editor. Existing staff email values are retained.

Create an account-creation template in Mailjet using
[`backend/email-templates/account-created.html`](./backend/email-templates/account-created.html)
and enable template variables. Set these backend environment variables in
`backend/.env` for local development and in the backend hosting environment
before deployment:

- `MAILJET_API_KEY`
- `MAILJET_SECRET_KEY`
- `MAILJET_SENDER_EMAIL` (a verified Mailjet sender)
- `MAILJET_SENDER_NAME` (optional; defaults to `UDM Health`)
- `MAILJET_ACCOUNT_CREATED_TEMPLATE_ID`
- `APP_LOGIN_URL` (the HTTPS URL of the application login page)

To send a test email to the configured sender address, run
`node backend/test-mailjet.js` from the repository root.

If these values are missing or Mailjet rejects a send, the staff account is
still created and the API response reports that the notification was not sent.
The administrator must then share the initial password securely.

The public contact form continues to use Resend and requires `RESEND_API_KEY`,
`EMAIL_FROM`, and `CONTACT_EMAIL`.

## Sequential staff IDs

Apply
[`backend/migrations/20261029_sequential_staff_ids.sql`](./backend/migrations/20261029_sequential_staff_ids.sql)
in the Supabase SQL Editor before deploying the backend update. New staff
accounts receive one shared sequential ID (`StaffID-001`, `StaffID-002`, and so
on) across Nurse and Doctor roles. The database sequence is initialized from
the highest existing `StaffID-###` value and prevents IDs from being reused
after a staff account is deleted.
