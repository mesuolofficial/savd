import "server-only";
import { prisma } from "@/lib/prisma";

export async function generateSavdId(): Promise<string> {
  return await prisma.$transaction(async (tx) => {
    const counter = await tx.counter.upsert({
      where: { key: "savd_person" },
      update: { value: { increment: 1 } },
      create: { key: "savd_person", value: 1 },
    });
    return `SAVD-${String(counter.value).padStart(4, "0")}`;
  });
}

export async function createPersonFromRegistration(member: {
  name: string;
  email: string;
  phone: string;
  sapId: string;
  cnic: string;
  department: string;
  university: string;
  society?: string | null;
}) {
  // 1. CHECK FOR DUPLICATES (Email, Student ID, or CNIC)
  const existing = await prisma.person.findFirst({
    where: {
      OR: [
        { email: member.email.toLowerCase() },
        { studentId: member.sapId },
        { cnic: member.cnic }
      ]
    }
  });

  if (existing) {
    // If found, just update their details if they changed, and return existing
    return await prisma.person.update({
      where: { id: existing.id },
      data: {
        university: member.university,
        department: member.department,
        phone: member.phone || existing.phone,
        cnic: member.cnic || existing.cnic,
      }
    });
  }

  // 2. IF NOT FOUND, CREATE NEW
  const savdId = await generateSavdId();
  return prisma.person.create({
    data: {
      savdId,
      name: member.name,
      email: member.email.toLowerCase(),
      phone: member.phone,
      studentId: member.sapId,
      cnic: member.cnic,
      department: member.department,
      university: member.university,
      society: member.society || null,
    },
  });
}