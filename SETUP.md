# Nexora Technologies — Contact Backend Setup

This version adds:
- Real Contact Us form backed by Supabase
- Supabase PostgreSQL database table for client messages
- Supabase Auth email/password login
- Private admin authorization table
- Admin dashboard at `admin.html`
- Row Level Security (RLS) so public visitors can insert messages but only authorized admins can read them

## 1. Create a Supabase project

Go to https://supabase.com/ and create a free project.

## 2. Create the database and security policies

In Supabase, open **SQL Editor → New query**.

Copy and run the complete contents of `supabase_schema.sql`.

## 3. Create the admin login

In Supabase open **Authentication → Users → Add user**.

Create the email/password account that you want to use for the Nexora Admin Dashboard.

Copy that user's **User UID**.

Then in SQL Editor run:

```sql
insert into public.admins (user_id)
values ('PASTE_AUTH_USER_UUID_HERE');
```

Replace the UUID with the actual user UID.

## 4. Get Supabase URL and public key

Open **Project Settings → API**.

Copy:
- Project URL
- Publishable/anon public key

Open `config.js` and replace:

```js
SUPABASE_URL: 'https://YOUR-PROJECT.supabase.co',
SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY'
```

Important: use only the public anon/publishable key in `config.js`.
**Never put the `service_role` or secret key in website files.**

## 5. Test locally

Open the folder in VS Code and run `index.html` with Live Server.

Open the public website and submit a test message.

Then open:

`admin.html`

Log in with the admin email/password. The message should appear in the dashboard.

## 6. Deploy to Netlify

Upload the complete `nexora_website` folder to Netlify.

Make sure `config.js` is included in the deployment.

The public site will be your normal Netlify URL or your connected custom domain.

The admin page will be:

`https://YOUR-DOMAIN/admin.html`

## Security notes

- The admin password is handled by Supabase Auth and is not stored in this website.
- RLS prevents ordinary visitors from reading contact messages.
- The browser only contains the Supabase public/anon key. This is expected for Supabase client applications.
- The admin dashboard additionally requires the logged-in user to exist in `public.admins`.
- For production, consider adding CAPTCHA/rate limiting if the form receives spam.


## Admin Login → Dashboard → Contact Messages

1. In Supabase, open **Authentication → Users** and create the admin user.
2. Copy that user's **User UID**.
3. In **SQL Editor**, run:
   ```sql
   insert into public.admins (user_id)
   values ('PASTE_AUTH_USER_UUID_HERE');
   ```
4. Open `admin.html` in the website.
5. Sign in with the same email/password created in Supabase Auth.
6. The site redirects to `admin-dashboard.html`.
7. The dashboard verifies the logged-in user is in `public.admins`, then loads rows from `contact_messages`.
8. The **Refresh** button reloads the latest messages.
9. **Logout** signs out of Supabase and returns to the Admin Login page.

The dashboard is protected by Supabase Auth + Row Level Security. Do not put a `service_role` or secret key in `config.js`.


### Admin Login on the website
A visible **Admin Login** link is included in the public navigation on every public page. It opens `admin.html`. Only authenticated users who are listed in `public.admins` can access the dashboard.
