# Bhima Print Solutions

React website (Vite + React Router) backed by Supabase (Postgres, Auth, Storage).

## Run locally

React 18 + Vite + React Router. Data, auth and storage come from Supabase.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

Environment variables (optional, defaults are built in): see `.env.example`. Only public values:
`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_WHATSAPP_NUMBER`, and optionally
`VITE_INSTAGRAM_URL`, `VITE_YOUTUBE_URL`, `VITE_LINKEDIN_URL` (a social icon is only shown when its URL is set)
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `WHATSAPP_NUMBER` work too).

## Project structure

```
src/
  main.jsx, App.jsx        entry + routes
  pages/                   Home, Products, Product, Customize (design studio), Cart, Checkout, Login, Account, Admin, Info, NotFound
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
| `/customize/:slug?` | Design Studio: upload a logo/design file, pick sizes (for apparel) or quantity, add notes, then add it to the cart. No live mock-up preview — our team confirms the artwork with the customer on WhatsApp. |
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
- Storage bucket `design-uploads`: anyone can upload images or PDFs (max 15 MB) from the design studio, public read. Customers' uploaded logos/artwork are saved here so the order message can link to them. Uploads are anonymous, so consider requiring login if spam appears.

### Making someone an admin

Emails listed in `public.admin_emails` become admins automatically when they sign up
(`lakshmisrinivas1849@gmail.com` is already listed). To promote an existing user:

```sql
update public.profiles set role = 'admin' where email = 'someone@example.com';
```

### Things to configure in the Supabase dashboard

These are dashboard settings, not code, so they cannot be checked from this repo — verify each one by actually
clicking through the flow (sign up, log in, reset password) with a real inbox before launch:

- **Auth > Providers > Email > "Confirm email"**: on by default, so a new account cannot log in until the
  confirmation link is clicked. Decide whether you want that for launch, or turn it off for easier testing.
- **Auth > URL Configuration**: set *Site URL* to the live domain and add it to *Redirect URLs* — otherwise the
  "reset password" and "confirm email" links in the email open the wrong (or a blank) page.
- **Auth > Emails > SMTP Settings**: Supabase's built-in mailer has a low hourly limit (a handful of emails/hour)
  and can land in spam. Configure a custom SMTP provider (Resend, SendGrid, etc.) before relying on sign-up or
  password-reset emails in production.
- After changing any of the above, actually sign up with a real email, click the confirmation link, then use
  "Forgot password" and confirm the reset email arrives and its link lands back on the live site.

## Still needed before launch

- Real social media URLs (set `VITE_INSTAGRAM_URL`, `VITE_YOUTUBE_URL`, `VITE_LINKEDIN_URL`; until then the icons are hidden).
- Review the Privacy Policy and Terms pages (`src/pages/Info.jsx`, marked as drafts).
- Footer/contact phone and email are now +91 94918 11360 and bhimaxerox1@gmail.com.
- Set the real WhatsApp number in production (`VITE_WHATSAPP_NUMBER`, format `91XXXXXXXXXX`) — currently 919491811360.
- Online payments are not implemented.
- `public/robots.txt` and `public/sitemap.xml` use the placeholder `https://your-domain-here.com` — replace it with the real live domain once the site is deployed to it. The sitemap lists only static pages; product pages come from the database and are not generated into it.
- `index.html`'s Open Graph / Twitter card tags use `/images/bhima-hero.jpg` as the share preview image; replace with a dedicated 1200×630 banner if you want a nicer link preview on WhatsApp/Facebook.

## Deploy on Vercel

`vercel.json` is included (Vite build to `dist/`, all routes rewritten to `index.html` so deep links and refresh work).
Import the GitHub repo in Vercel; Framework Preset `Vite` is detected. Environment variables are optional
(see `.env.example`). Only public values: never add a `service_role` / `sb_secret_` key.
After deploying, add the Vercel URL to Supabase > Authentication > URL Configuration.
