# Family Bridge - Database Setup Guide

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project: https://irpducvqwdfxvhulwidt.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

## Step 2: Run the Schema

1. Copy the entire contents of `supabase_schema.sql`
2. Paste it into the SQL editor
3. Click **Run** or press `Cmd/Ctrl + Enter`

This will create:
- All database tables (profiles, messages, credit_transactions, services, bookings)
- Row Level Security (RLS) policies
- Sample services data
- Trigger for automatic profile creation

## Step 3: Create Test Users

After running the schema, create test users:

1. Go to **Authentication** → **Users** in Supabase
2. Click **Add user** → **Create new user**

Create these three test accounts:

### Resident Account
- Email: `resident@test.com`
- Password: `password123`
- After creation, go to SQL Editor and run:
```sql
UPDATE profiles SET role = 'resident', full_name = 'John Resident', credits = 100 
WHERE email = 'resident@test.com';
```

### Family Account
- Email: `family@test.com`
- Password: `password123`
- After creation, go to SQL Editor and run:
```sql
UPDATE profiles SET role = 'family', full_name = 'Jane Family' 
WHERE email = 'family@test.com';
```

### Staff Account
- Email: `staff@test.com`
- Password: `password123`
- After creation, go to SQL Editor and run:
```sql
UPDATE profiles SET role = 'staff', full_name = 'Admin Staff' 
WHERE email = 'staff@test.com';
```

## Step 4: Verify Setup

Run this query to verify all users are created correctly:

```sql
SELECT email, role, full_name, credits FROM profiles;
```

You should see all three users with their respective roles.

## Done!

Your database is now ready. You can start the application with:

```bash
npm run web
```

Then log in with any of the test accounts!
