# 🚀 Employee Portal — Deployment Guide for bolt.new

## What You're Deploying
- **Frontend**: React + Vite + TypeScript + Bootstrap 5
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Host**: bolt.new (free tier)

---

## Step 1 — Create a Supabase Project (Free)

1. Go to **https://supabase.com** → Sign up free
2. Click **"New Project"**
3. Choose a name: `employee-portal`
4. Set a strong database password (save it!)
5. Select region: **Southeast Asia (Singapore)**
6. Wait ~2 minutes for the project to spin up

### Get Your Credentials
From your Supabase dashboard → **Settings → API**:
- Copy **Project URL** → this is your `VITE_SUPABASE_URL`
- Copy **anon/public key** → this is your `VITE_SUPABASE_ANON_KEY`

---

## Step 2 — Run the Database Schema

1. In Supabase dashboard → go to **SQL Editor**
2. Click **"New query"**
3. Paste the entire contents of `supabase/migrations/001_schema.sql`
4. Click **"Run"** (green button)
5. You should see: *"Success. No rows returned"*

---

## Step 3 — Create Seed Users

In Supabase → **Authentication → Users → Add User**

Create these users (use the "Send invite" option or "Create user"):

| Name | Email | Password | Role (set after) |
|------|-------|----------|-----------------|
| Super Admin | superadmin@claritas.asia | Password123! | superadmin |
| Aisha Rahman | aisha.rahman@claritas.asia | Password123! | hr_manager |
| Raj Kumar | raj.kumar@claritas.asia | Password123! | it_manager |
| Ahmad Fadzil | ahmad.fadzil@claritas.asia | Password123! | employee |
| Priya Menon | priya.menon@claritas.asia | Password123! | employee |

### Update Roles via SQL Editor
After creating users, run this in SQL Editor to set roles:
```sql
UPDATE profiles SET role = 'superadmin'   WHERE work_email = 'superadmin@claritas.asia';
UPDATE profiles SET role = 'hr_manager'   WHERE work_email = 'aisha.rahman@claritas.asia';
UPDATE profiles SET role = 'it_manager'   WHERE work_email = 'raj.kumar@claritas.asia';
```

---

## Step 4 — Set Up Email (Gmail SMTP)

In Supabase → **Settings → Edge Functions → Environment Variables**, add:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-char-app-password
APP_URL=https://your-project.bolt.new
```

> **Gmail App Password**: Google Account → Security → 2-Step Verification → App Passwords → Generate for "Mail"

---

## Step 5 — Deploy to bolt.new

### Option A — Upload ZIP (Simplest)
1. ZIP the entire `bolt-portal` folder
2. Go to **https://bolt.new**
3. Click **"Import project"** or drag-and-drop the ZIP
4. bolt.new will detect Vite + React automatically

### Option B — GitHub (Recommended)
1. Push the `bolt-portal` folder to a GitHub repo
2. Go to bolt.new → **"Connect GitHub"**
3. Select your repo
4. bolt.new auto-detects Vite

### Set Environment Variables in bolt.new
In bolt.new project settings → **Environment Variables**:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Step 6 — Deploy Edge Function

In Supabase → **Edge Functions → Deploy new function**:
1. Name: `send-welcome-email`
2. Upload `supabase/functions/send-welcome-email/index.ts`
3. Click Deploy

Or using Supabase CLI:
```bash
npx supabase functions deploy send-welcome-email --project-ref your-project-ref
```

---

## Step 7 — Update APP_URL

After bolt.new gives you a live URL (e.g. `https://your-app.bolt.new`):
1. Go to Supabase → **Settings → Edge Functions → Environment Variables**
2. Update `APP_URL` to your live bolt.new URL

Also update Supabase Auth redirect URLs:
- Supabase → **Authentication → URL Configuration**
- Add Site URL: `https://your-app.bolt.new`
- Add redirect: `https://your-app.bolt.new/reset-password`

---

## Login Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Superadmin | superadmin@claritas.asia | Password123! |
| HR Manager | aisha.rahman@claritas.asia | Password123! |
| IT Manager | raj.kumar@claritas.asia | Password123! |
| Employee | ahmad.fadzil@claritas.asia | Password123! |

---

## Free Tier Limits (bolt.new + Supabase)

| Service | Free Limit | Notes |
|---------|-----------|-------|
| bolt.new | Unlimited hosting | Free on bolt.new |
| Supabase DB | 500MB | Enough for ~100k employees |
| Supabase Auth | 50,000 users/month | More than enough |
| Supabase Edge Functions | 500k invocations/month | For emails |
| Supabase Storage | 1GB | For file uploads |
| Supabase Bandwidth | 5GB/month | Fine for internal tool |

---

## Troubleshooting

### "Missing Supabase environment variables"
→ Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in bolt.new env vars

### "new row violates row-level security policy"
→ Make sure you ran the full SQL migration including the RLS policies

### "Profile not found after login"
→ The `handle_new_user` trigger auto-creates profiles. If missing, run:
```sql
INSERT INTO profiles (id, name, work_email, role, is_active)
SELECT id, email, email, 'employee', true FROM auth.users WHERE id NOT IN (SELECT id FROM profiles);
```

### Emails not sending
→ Check Edge Function logs in Supabase dashboard → Functions → Logs
→ Verify Gmail App Password is correct (not your regular password)

---

## Architecture Summary

```
bolt.new (Vite React)
    ↕ HTTPS
Supabase
  ├── Auth (JWT, email/password, password reset)
  ├── PostgreSQL (all data + RLS security)
  └── Edge Functions (Deno — email sending)
```

All business logic runs in the browser via Supabase JS client.
Email automation runs via Supabase Edge Functions (Deno runtime).
