# 💸 Buddy Lend

A small, fast loan-tracking app built with Vite + React + TypeScript.

## Quick Start

1. Clone the repository:

```bash
git clone <YOUR_GIT_URL>
cd buddy-lend
```

2. Install dependencies and run locally:

```bash
npm install
npm run dev
```

Open http://localhost:5173 (or the URL printed by Vite).

## Database

This project uses Supabase for data storage. See **DATABASE_SETUP.md** for step-by-step instructions to create the `loans` and `payments` tables, set policies, and configure environment variables.

Create a `.env.local` in the project root with:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Restart the dev server after adding environment variables.

## Deployment

Deploy on Vercel (free):
- Push your repo to GitHub
- Import the repo into Vercel
- Add the same environment variables in Vercel settings
- Deploy

## Contributing

- Fork the repo and open pull requests
- Keep changes focused and well-documented

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Supabase (Postgres)

---

Happy hacking! 🎉
