# Database Setup Instructions for Buddy Lend Log

## Quick Start: Free Database + Free Hosting

### Step 1: Create Supabase Account (FREE)
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start Your Project" and sign up (GitHub recommended)
3. Create a new project:
   - Project name: `buddy-lend-log` (or your choice)
   - Database password: Use a strong password
   - Region: Choose closest to your location
   - Click "Create new project" (takes ~2 minutes)

### Step 2: Create Database Tables
Once your Supabase project is created:

1. Go to the **SQL Editor** in Supabase dashboard
2. Click **"New Query"** and run this SQL:

```sql
-- Create loans table
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower JSONB NOT NULL,
  principal DECIMAL NOT NULL,
  fixed_interest DECIMAL NOT NULL,
  start_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  notes TEXT,
  closed_at TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (public access for this demo)
CREATE POLICY "loans_all" ON loans
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "payments_all" ON payments
  FOR ALL USING (TRUE) WITH CHECK (TRUE);
```

3. Click **"Run"** to execute

### Step 3: Get Your Credentials
1. Go to **Settings → API**
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon key** (public) → `VITE_SUPABASE_ANON_KEY`

### Step 4: Add Environment Variables
1. Create `.env.local` in your project root:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

Replace with your actual values from Step 3.

### Step 5: Update function signatures (IMPORTANT!)
Since database calls are now async, you need to update your components. Change any direct function calls to use `await`:

**Before:**
```typescript
addLoan(loanData);
```

**After:**
```typescript
await addLoan(loanData);
```

Similarly for: `updateLoan`, `deleteLoan`, `extendLoan`, `closeLoan`, `addPayment`, `deletePayment`

### Step 6: Deploy to Vercel (FREE)
1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Import your GitHub repository
4. In "Environment Variables", add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click "Deploy"

### Step 7: Test Locally
```bash
npm install
npm run dev
```

Visit `http://localhost:5173` - your app should now save to Supabase!

---

## Supabase Free Tier Limits
- ✅ Up to 500 MB database storage
- ✅ Up to 2 GB bandwidth/month
- ✅ Real-time subscriptions included
- ✅ Full PostgreSQL features
- No credit card required

## Vercel Free Tier Limits
- ✅ Unlimited deployments
- ✅ Unlimited bandwidth
- ✅ Serverless Functions included
- ✅ Custom domain support

---

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists with correct values
- Restart your dev server after adding `.env.local`

### Table not found errors
- Check that tables were created in SQL Editor
- Verify table names match (use snake_case in DB)

### Network errors
- Verify Supabase URL and key are correct
- Check that RLS policies are enabled properly
- Ensure your IP isn't blocked (unlikely with Supabase)

---

## Next Steps (Optional)

### Add User Authentication
Supabase has built-in Auth (GitHub, Google, Email). See [Supabase Auth Docs](https://supabase.com/docs/guides/auth).

### Optimize with Real-time
Use Supabase subscriptions to auto-sync across tabs:
```typescript
const subscription = supabase
  .from('loans')
  .on('*', payload => {
    console.log('Change received!', payload);
  })
  .subscribe();
```

### Backup Strategy
Supabase automatically backs up your data. Use [pgDump](https://supabase.com/docs/guides/database/backup) for manual backups.
