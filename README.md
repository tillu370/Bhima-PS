# Bhima Print Solutions

Static website (HTML, CSS, vanilla JS) backed by Supabase (Postgres, Auth, Storage).

## Run locally

React 18 + Vite + React Router. Data, auth and storage come from Supabase.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

Environment variables (optional, defaults are built in): see `.env.example`. Only public values:
`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_WHATSAPP_NUMBER`
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `WHATSAPP_NUMBER` work too).

## Project structure

```
src/
  main.jsx, App.jsx        entry + routes
  pages/                   Home, Products, Product, Cart, Checkout, Login, Account, Admin, Info, NotFound
  components/              Layout, Header, Footer, TopBar, CartDrawer, EnquiryModal, ProductCard, ...
  context/                 AuthContext (session, role, wishlist), CartContext, UiContext (toast, modals)
  lib/                     supabase client, config, utils, hooks
  styles/                  CSS (unchanged from the static site)
public/images/             product and banner photos
supabase/schema.sql        database schema, RLS policies, starter data
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home. Featured products load from Supabase. |
| `/products?cat=&q=` | Catalog with category filter, search, sort. |
| `/product/:slug` | Product detail, quantity, wishlist, "Buy now", enquiry. |
| `/cart` | Cart (stored in the browser), quantities, per-item notes. |
| `/checkout` | WhatsApp checkout: opens WhatsApp with the order written out. No login, no payment. |
| `/login` | Log in, sign up, forgot / reset password. |
| `/account/:tab` | Wishlist, enquiries, profile. |
| `/admin/:tab` | Admin: enquiries, products (with image upload), categories, customers. |
| `/info/shipping`, `/info/privacy`, `/info/terms` | Info pages. Privacy and Terms are drafts to review. |

## Supabase

Project URL: `https://scjesfsrrgawtojuwzlk.supabase.co` (default in `src/lib/config.js`, overridable with env variables).

**First-time setup:** open Supabase Dashboard > SQL Editor, paste all of `supabase/schema.sql` and run it once. It creates the tables, security rules, storage bucket and the starter products.
The publishable key is meant to be public; security comes from the RLS policies.

Tables: `profiles`, `categories`, `products`, `wishlist`, `enquiries`, `admin_emails`.
Every table has Row Level Security:

- Anyone can read active products and categories. Only admins can change them.
- Orders go through WhatsApp and are not stored.
- Customers see only their own wishlist and enquiries. Admins see everything.
- A user cannot change their own `role`.
- Storage bucket `product-images`: public read, admin-only upload/delete.

### Making someone an admin

Emails listed in `public.admin_emails` become admins automatically when they sign up
(`lakshmisrinivas1849@gmail.com` is already listed). To promote an existing user:

```sql
update public.profiles set role = 'admin' where email = 'someone@example.com';
```

### Things to configure in the Supabase dashboard

- **Auth > Providers > Email**: "Confirm email" is on by default, so new users must click the email link before logging in. Turn it off for easier testing.
- **Auth > URL Configuration**: set the Site URL and add your live site URL to Redirect URLs, otherwise the password-reset email link will not return to the site.
- Built-in Supabase email has a low hourly limit. Configure custom SMTP before launch.

## Still needed before launch

- Real social media URLs (footer and top bar links are `#`).
- Review `info.html` Privacy Policy and Terms (marked as drafts).
- Confirm the phone number and email shown in the footer.
- Set the real WhatsApp number (`VITE_WHATSAPP_NUMBER`, format `91XXXXXXXXXX`). It currently uses the footer number +91 98765 43210, which looks like a placeholder.
- Online payments are not implemented.

## Deploy on Vercel

`vercel.json` is included (Vite build to `dist/`, all routes rewritten to `index.html` so deep links and refresh work).
Import the GitHub repo in Vercel; Framework Preset `Vite` is detected. Environment variables are optional
(see `.env.example`). Only public values: never add a `service_role` / `sb_secret_` key.
After deploying, add the Vercel URL to Supabase > Authentication > URL Configuration.
