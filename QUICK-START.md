# 🚀 Quick Start: Activate Supabase Backend

Your Diary App backend is **95% complete**! Just follow these 3 simple steps:

---

## ✅ Step 1: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **"Diary App"** project (or create one)
3. Click **⚙️ Settings** → **API**
4. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the long JWT token)

---

## ⚙️ Step 2: Configure Credentials

### Option A: Use the Setup Helper (Recommended) ⭐

1. Open `setup-helper.html` in your browser
2. Paste your credentials
3. Click "Generate Configuration Code"
4. Copy the generated code
5. Open `js/config.js` and replace EVERYTHING with the generated code
6. Save the file

### Option B: Manual Edit

1. Open `js/config.js`
2. Replace:
   ```javascript
   url: 'YOUR_SUPABASE_URL'
   ```
   with your actual Project URL

3. Replace:
   ```javascript
   anonKey: 'YOUR_SUPABASE_ANON_KEY'
   ```
   with your actual anon key

4. Save the file

---

## 🗄️ Step 3: Apply Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **+ New Query**
3. Open `supabase-schema.sql` from your project
4. Copy **ALL** the contents
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. ✅ Wait for: "Success! No rows returned"

This creates:
- `entries` table (stores diary entries)
- `quick_log_options` table (custom user preferences)
- Row Level Security policies (users can only see their own data)

---

## 🧪 Step 4: Test Your Setup

1. Open `tests/backend-test.html` in your browser
2. Click "Run All Tests"
3. ✅ All tests should pass!

---

## 🎉 You're Done!

Your app now has:
- ☁️ **Cloud Sync** - Access from any device
- 🔐 **Authentication** - Secure user accounts
- 💾 **Automatic Backup** - Never lose your entries
- 📱 **Multi-Device** - Seamless sync across devices

### Test the Full App:

1. Open `login.html`
2. Sign up for an account
3. Start creating diary entries!

---

## 🆘 Troubleshooting

**❌ "Supabase not configured" message**
- Make sure you updated `js/config.js` with REAL credentials
- Refresh the page

**❌ "Table 'entries' does not exist"**
- Run `supabase-schema.sql` in Supabase SQL Editor
- Make sure ALL the SQL code was executed

**❌ Can't sign in**
- Check browser console for errors (F12)
- Verify credentials are correct in `js/config.js`
- Ensure database schema was applied

---

## 📂 File Quick Reference

| File | Purpose |
|------|---------|
| `setup-helper.html` | Interactive credential setup tool |
| `js/config.js` | **← UPDATE THIS** with credentials |
| `supabase-schema.sql` | Database setup SQL (run in Supabase) |
| `tests/backend-test.html` | Backend verification tool |
| `login.html` | Authentication page |
| `index.html` | Main app |

---

**Need help?** All backend modules are already built and tested. You just need credentials! 🎯
