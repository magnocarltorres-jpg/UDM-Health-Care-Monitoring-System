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

Staff account invitations are sent with the Resend HTTPS API to the Gmail
address entered in the Admin Panel. In Render, configure `RESEND_API_KEY` and
`EMAIL_FROM`. `EMAIL_FROM` must use a sender address on a domain verified in
Resend. Resend's testing mode only allows delivery to the account owner's
address; verifying a domain is required to send invitations to other
recipients. Requests time out after 15 seconds and report the provider's error.

The public contact form also uses Resend and requires `CONTACT_EMAIL`.

## Reusing deleted staff IDs

Apply
[`backend/migrations/20261027_reuse_deleted_staff_ids.sql`](./backend/migrations/20261027_reuse_deleted_staff_ids.sql)
in the Supabase SQL Editor. The staff-ID generator then assigns the lowest
unused `NUR-###` or `DOC-###` ID, so a deleted ID is reused only when no staff
account currently has it. Account creation retries ID conflicts caused by
simultaneous requests.
