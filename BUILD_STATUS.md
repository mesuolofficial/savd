# SAVD — Build Status

## Colour theme in use (Signal Blue + Porcelain)
| Role | Name | Hex |
|---|---|---|
| Primary (buttons, links, active) | **Signal Blue** | `#0057FF` (gradient to `#2D7DFF`) |
| Links on dark | Signal Tint | `#5B8FFF` |
| Light background | **Porcelain** | `#F8F7F4` |
| Admin page background | Canvas | `#F2F3F5` |
| Dark base (sidebar, hero, footer) | **Abyss** | `#06192B` |
| Dark cards / raised dark | Deep / Tide | `#0A2A43` / `#103F5E` |
| Highlights, data numbers, sonar | Aqua | `#34C3C9` |
| Medals & prizes ONLY | Gold | `#D9A441` |
| Text / muted / borders | Ink / Mist / Line | `#10202E` / `#6B7F8E` / `#E4E7EB` |

Fonts: Barlow Condensed (headings, uppercase) · Barlow (body) · Lora italic (taglines) · JetBrains Mono (SAVD IDs, serials).
All of this lives in `src/styles/tokens.css`.

## Phase 1 — DONE (this zip)  ✅
Foundation, login, admin shell, dashboard.
- ✅ `prisma/schema.prisma` — all 30 models + FR-25 constraints  ·  ✅ `prisma/seed.ts`
- ✅ Design tokens + base styles (`src/styles/*`, `globals.css`, root `layout.tsx` with fonts)
- ✅ Auth: DB-backed sessions, bcrypt, 5-fail/15-min lockout, role matrix, scoping helper, activity log, rate limiter, `proxy.ts`
- ✅ Admin: login page (live lockout countdown), role-aware sidebar + mobile drawer, dashboard (live counts + recent activity)

## Remaining (build order)
| Phase | What | Requirements |
|---|---|---|
| 2 | Public shell + Home (ticker, navbar, hero, countdown, footer) · Settings · Universities · Sponsors (first admin CRUD pages, sets the table/form pattern) | FR-18, 19, 20 |
| 3 | Competitions (admin CRUD + public list/details) | FR-1 |
| 4 | Brevo email + React Email templates · public registration · registration review + Excel | FR-2, 3, 23 |
| 5 | People (SAVD IDs, merge) · Teams (members, media) | FR-4, 5 |
| 6 | Certificates (bulk add, vault, verify) | FR-6, 22 |
| 7 | Results · Archives · Progress grid | FR-7, 8, 9 |
| 8 | Gallery · Reviews + OTP · Contact | FR-10, 11, 12, 21 |
| 9 | Admin management + Welcome Letter PDF · forgot-password · Activity log page · Push | FR-15, 16, 17, 24 |
| Later | APK | FR-14 |

## Corrections to the earlier `SAVD_FILE_DIRECTORY.md` (found while building)
1. **Admin pages live under a real `/admin` folder** (`src/app/admin/...`), not a `(admin)` route group — a group would collide with public `/competitions`, `/teams`, etc. Login is `/admin/login`.
2. **Auth is custom DB sessions, not NextAuth**: the requirement is server-side sessions with regeneration, Auth.js v5 is still beta, and this is revocable (deactivate an admin = instantly logged out).
3. **`middleware.ts` is `src/proxy.ts`** in Next.js 16.
4. **Tailwind v4 has no `tailwind.config.ts`** — the theme is `src/styles/tokens.css`.
5. **Prisma is pinned to v6** (v7 changed the client setup; upgrade later on purpose).
6. Temp admin password is stored **encrypted** (not hashed) so the Welcome Letter can be re-downloaded (FR-16).
7. `TeamMember` carries `competitionId` so "one team per person per competition" is a real database rule.
8. `Certificate.competitionId` is optional/SetNull: deleting a competition won't destroy issued certificates (FR-25 doesn't list them as cascaded — tell me if you want them deleted too).

## Honest note
I cannot run `npm install` or `next build` in my environment. All files pass a TypeScript **syntax** check, but the first real compile happens on your PC. Send me any error you see.
