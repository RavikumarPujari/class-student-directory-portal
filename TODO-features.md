# Approved Feature Implementation — Tracking

## Feature 1: Hide Student Directory Until Login
- [x] Modify client/src/pages/Directory.tsx to gate behind student auth

## Feature 2: Student Registration Rules (unique email, phone, USN)
- [x] Modify server/src/controllers/students.controller.ts (createStudent)
- [x] Modify server/src/controllers/studentAuth.controller.ts (updateMe duplicate check)

## Feature 3: Student Profile Editing (own profile only, lock USN/email)
- [x] Modify server/src/controllers/studentAuth.controller.ts (lock usn/email in updateMe)
- [x] Modify client/src/components/shared/StudentForm.tsx (lockPermanentFields prop)
- [x] Modify client/src/pages/StudentProfile.tsx (pass lockPermanentFields)

## Feature 4: Registration Success Message + auto-redirect
- [ ] Modify client/src/pages/Register.tsx

## Feature 5: Admin "Clear All Students" (safe, admin-only)
- [x] Modify server/src/controllers/students.controller.ts (clearAllStudents)
- [x] Modify server/src/routes/students.routes.ts (add route)
- [x] Modify client/src/services/students.service.ts (add service fn)
- [x] Modify client/src/pages/AdminStudents.tsx (add button + dialog)

## Final Verification
- [x] Run tsc -b on server & client
- [x] Run prisma validate
