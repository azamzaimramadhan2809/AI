# Supabase setup (Prisma 6)

1. Create a project in the Supabase Dashboard and keep its database password.
2. Open **Connect → Session pooler**, copy the PostgreSQL URI (port 5432), and replace the password placeholder. URL-encode special characters in the password.
3. In backend/.env set DATABASE_URL and DIRECT_URL to that URI, with ?sslmode=require (or &sslmode=require if parameters already exist). Keep existing JWT_SECRET and GEMINI_API_KEY. See .env.example for placeholders. Do not put database passwords in frontend variables.
4. Run from backend: npm run prisma:validate, npm run prisma:generate, then npm run prisma:deploy. Deploy creates the four application tables in a new/empty project; do not run reset against an existing Supabase database.
5. Start npm run dev and test login/register, AI creation, chat and memory.

This switches only the database. Existing Express JWT/bcrypt authentication remains; Supabase Auth is not used. The backend uses server-only database credentials. RLS is enabled on application tables without public client policies, so browser anon keys cannot read them. Use the dashboard database owner connection for this initial setup.

No old MySQL data is imported or deleted. Original MySQL schema/migrations are archived in prisma/legacy-mysql. Active migrations are PostgreSQL only. mysql2 remains installed temporarily for rollback compatibility but is not used by Prisma.

Validation completed locally with placeholder PostgreSQL URLs: schema validation, client generation, TypeScript. Remote migration and integration tests require the real Supabase project and URLs.

Sources: https://supabase.com/docs/guides/database/prisma and https://supabase.com/docs/guides/database/connecting-to-postgres
