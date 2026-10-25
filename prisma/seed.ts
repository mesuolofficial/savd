/**
 * Seed script — safe to run more than once.
 *   npx prisma db seed
 *
 * Creates: the singleton SiteSettings row, the SAVD-ID counter, a handful of
 * universities, and the FIRST super admin (from SEED_ADMIN_* in .env).
 * An existing admin's password is never overwritten by re-seeding.
 */
import { PrismaClient, AdminRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const UNIVERSITIES = [
  "University of Lahore (UOL)",
  "PUCIT — University of the Punjab",
  "NUST — National University of Sciences & Technology",
  "UET Taxila",
  "Institute of Space Technology (IST)",
];

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Super Admin";

  if (!email || !password) {
    throw new Error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env before seeding.");
  }
  if (password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters.");
  }

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteTitle: "SAVD — Submersible Autonomous Vehicle Design",
      adminEmail: email,
    },
  });

  await prisma.counter.upsert({
    where: { key: "savd_person" },
    update: {},
    create: { key: "savd_person", value: 0 },
  });

  await prisma.university.createMany({
    data: UNIVERSITIES.map((n) => ({ name: n })),
    skipDuplicates: true,
  });

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin ${email} already exists — left untouched.`);
  } else {
    await prisma.admin.create({
      data: {
        name,
        email,
        passwordHash: await hash(password, 12),
        role: AdminRole.SUPER_ADMIN,
      },
    });
    console.log(`Created super admin ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
