# PostgreSQL Migration & Deployment Plan

## Steps

### Migration (SQLite → PostgreSQL)
- [x] Step 1: Update Prisma provider in `schema.prisma` (sqlite → postgresql)
- [x] Step 2: Update `server/.env` `DATABASE_URL` to Neon PostgreSQL URL
- [x] Step 3: Update `.env.example` and README for documentation
- [x] Step 4: Regenerate Prisma client (fixed EPERM lock)
- [x] Step 5: Create fresh PostgreSQL migration (preserve old SQLite migration folder)
- [x] Step 6: Seed the new PostgreSQL database (default admin)
- [x] Step 7: Verify backend connects & health endpoint works
- [x] Step 8: Test registration & data storage in PostgreSQL

### Deployment
- [x] Step 9: Prepare frontend for Vercel deployment (vercel.json, VITE_API_URL support)
- [x] Step 10: Prepare backend for Render deployment (render.yaml)
- [ ] Step 11: Configure PostgreSQL Neon for production (deploy + set env vars)
