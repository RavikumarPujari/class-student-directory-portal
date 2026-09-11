# Fix Database Schema Drift — Task Tracker

## Root Cause
PostgreSQL `students` table is missing the `semester` column that schema.prisma requires → Prisma P2022 → 500.

## Steps
- [x] Read project, schema.prisma, migrations, controllers, types
- [x] Confirm root cause: `students.semester` column does not exist (P2022)
- [ ] Create ONE complete migration adding missing `semester` column
- [ ] Apply migration to Neon database
- [ ] Run `prisma generate` and `prisma validate`
- [ ] Run `prisma migrate status`
- [ ] Build backend (`tsc`)
- [ ] Build frontend (`tsc -b && vite build`)
- [ ] Start backend and frontend
- [ ] Test all endpoints (registration, login, profile, update, list, get, admin login, export)
