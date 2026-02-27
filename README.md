# Oscar Ballot 2026 🏆

A shareable Oscar predictions ballot app. Create your picks, share with friends, and score as you watch the ceremony!

## Quick Start (15-20 minutes)

### Step 1: Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project" and give it a name (e.g., "oscar-ballot")
3. Wait for the project to be created (~2 minutes)
4. Go to **SQL Editor** in the left sidebar
5. Paste this SQL and click "Run":

```sql
create table ballots (
  id text primary key,
  name text not null,
  picks jsonb not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table ballots enable row level security;

-- Allow anyone to read ballots
create policy "Ballots are viewable by everyone" 
  on ballots for select 
  using (true);

-- Allow anyone to insert ballots
create policy "Anyone can create a ballot" 
  on ballots for insert 
  with check (true);

-- Allow anyone to update ballots (for editing)
create policy "Anyone can update ballots" 
  on ballots for update 
  using (true);
```

6. Go to **Settings** → **API** in the left sidebar
7. Copy your **Project URL** and **anon public** key (you'll need these)

### Step 2: Set up the code

1. Create a new GitHub repository
2. Upload all these files to the repo (or clone and push)
3. Create a `.env` file in the root (don't commit this!):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Deploy to Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. In the **Environment Variables** section, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click "Deploy"
6. Wait ~1 minute and you'll have a live URL!

### Step 4: (Optional) Custom domain

In Vercel project settings, you can add a custom domain if you have one.

## Local Development

```bash
# Install dependencies
npm install

# Create .env file with your Supabase credentials
cp .env.example .env
# Edit .env with your values

# Start dev server
npm run dev
```

## Features

- ✅ Create and share ballot links
- ✅ Pick "Will Win" predictions
- ✅ Optional "Wish They'd Win" picks
- ✅ Real-time scoring during the ceremony
- ✅ Edit ballots before the show
- ✅ Mobile-friendly design
- ✅ No sign-up required

## Tech Stack

- React + Vite
- Tailwind CSS
- Supabase (database)
- Vercel (hosting)

## Updating for Future Years

To update for next year's Oscars, edit the `CATEGORIES` and `CATEGORY_ORDER` objects in `src/App.jsx` with the new nominees.

## Buy Me a Coffee ☕

If you find this useful, the "Buy me a coffee" link in the app goes to buymeacoffee.com - update it with your own link!

Find it in `src/App.jsx` and search for `buymeacoffee.com` to replace with your URL.
