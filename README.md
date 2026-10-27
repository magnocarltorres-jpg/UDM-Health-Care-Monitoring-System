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

## Staff account email

Staff account invitations are sent through the Gmail API over HTTPS. In Render,
configure `GMAIL_USER`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, and
`GMAIL_REFRESH_TOKEN`. The Google account must have the Gmail API enabled and
grant the `https://www.googleapis.com/auth/gmail.send` OAuth scope. Generate the
refresh token for the same Google account configured as `GMAIL_USER`. Never
commit or share these credentials. OAuth and message requests time out after
15 seconds.

To configure Gmail API access:

1. Create or select a project in Google Cloud Console and enable the Gmail API.
2. Configure the OAuth consent screen. If the app is in Testing, add the
   sending Gmail account as a test user.
3. Create an OAuth client ID and secret.
4. In OAuth 2.0 Playground, enable **Use your own OAuth credentials**, enter the
   client ID and secret, authorize the sending Gmail account with
   `https://www.googleapis.com/auth/gmail.send`, and exchange the code for a
   refresh token.
5. Add the four values above as environment variables for the backend service
   in Render, then redeploy.

The staff member's Gmail address entered in the Admin Panel is the email
recipient; `GMAIL_USER` is the account that sends it.

The public contact form continues to use Resend. Configure `RESEND_API_KEY`,
`EMAIL_FROM`, and `CONTACT_EMAIL` for contact-form notifications. The sender
must use a domain verified with Resend.

## Reusing deleted staff IDs

Apply
[`backend/migrations/20261027_reuse_deleted_staff_ids.sql`](./backend/migrations/20261027_reuse_deleted_staff_ids.sql)
in the Supabase SQL Editor. The staff-ID generator then assigns the lowest
unused `NUR-###` or `DOC-###` ID, so a deleted ID is reused only when no staff
account currently has it. Account creation retries ID conflicts caused by
simultaneous requests.
