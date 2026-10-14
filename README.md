# Bhima Print Solutions

Static website (HTML, CSS, vanilla JS) backed by Supabase (Postgres, Auth, Storage).

## Run locally

```bash
python -m http.server 5173
```

Open http://localhost:5173.

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Home. Featured products load from Supabase. |
| `products.html` | Catalog with category filter, search (`?q=`), sort. |
| `product.html?slug=...` | Product detail, quantity, wishlist, "Buy now", enquiry. |
| `cart.html` | Cart (stored in the browser), quantities, per-item notes. |
| `checkout.html` | WhatsApp checkout: opens WhatsApp with the order written out. No login, no payment. |
| `login.html` | Log in, sign up, forgot / reset password. |
| `account.html` | Wishlist, enquiries, profile. |
| `admin.html` | Admin: enquiries, products (with image upload), categories, customers. |
| `info.html?p=shipping\|privacy\|terms` | Info pages. Privacy and Terms are drafts to review. |

## Supabase

Project URL: `https://scjesfsrrgawtojuwzlk.supabase.co` (set in `js/config.js`).

**First-time setup:** open Supabase Dashboard > SQL Editor, paste all of `supabase/schema.sql` and run it once. It creates the tables, security rules, storage bucket and the starter products.
Public settings are in `js/config.js` (the anon key is meant to be public).

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
- Set the real WhatsApp number in `js/config.js` (`whatsapp`, format `91XXXXXXXXXX`). It currently uses the footer number +91 98765 43210, which looks like a placeholder.
- Online payments are not implemented.
