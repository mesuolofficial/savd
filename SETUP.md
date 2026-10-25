# SAVD — Phase 1 setup (Windows)

## 1. Create the project (once)
```
cd C:\Users\badar
npx create-next-app@latest savd --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd savd
```
If it asks about the React Compiler, answer **No**.

## 2. Copy the Phase 1 files in
Extract `savd-phase1.zip` **into the `savd` folder** and choose **Replace** when asked
(it replaces `src/app/layout.tsx` and `src/app/globals.css`; your default `page.tsx` is left alone for now).

## 3. Install packages
```
npm i @prisma/client@6 bcryptjs zod clsx tailwind-merge lucide-react server-only
npm i -D prisma@6 tsx
```

## 4. Edit `package.json` (two small additions)
Inside `"scripts"` add:
```json
"postinstall": "prisma generate",
"db:migrate": "prisma migrate dev",
"db:seed": "prisma db seed",
"db:studio": "prisma studio"
```
And at the top level (next to `"scripts"`), add:
```json
"prisma": { "seed": "tsx --env-file=.env prisma/seed.ts" }
```

## 5. Database + secrets
1. Go to https://neon.tech, make a free project, copy the **direct (non-pooled)** connection string.
2. `copy .env.example .env`
3. Open `.env` and fill: `DATABASE_URL`, `APP_SECRET`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` (12+ chars).

## 6. Create tables, seed the first admin, run
```
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```
Open http://localhost:3000/admin/login

## 7. Test checklist
- [ ] Wrong password shows "Incorrect email or password" (and "2 attempts left" from the 3rd failure)
- [ ] 5 wrong passwords -> account locks, live countdown shows, correct password is refused
- [ ] Correct login -> dashboard with your name; sidebar shows every module (you are super admin)
- [ ] Logout -> back to login; visiting /admin/dashboard while logged out redirects to login
- [ ] `npx prisma studio` -> table `ActivityLog` has "Signed in" / "Signed out" rows

**If anything errors, paste the exact error text and I will fix it.**
