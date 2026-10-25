import "server-only";
import { prisma } from "@/lib/prisma";

export type BulkCertRow = {
  savdId: string;
  name: string;
  serial: string;
};

export async function processBulkCertificates(competitionId: string, title: string, rows: BulkCertRow[]) {
  const results = {
    inserted: 0,
    errors: [] as { row: BulkCertRow; reason: string }[],
  };

  // Get all valid SAVD IDs from the database to validate quickly
  const validPersons = await prisma.person.findMany({
    where: { savdId: { in: rows.map(r => r.savdId) } },
    select: { id: true, savdId: true, name: true },
  });
  const personMap = new Map(validPersons.map(p => [p.savdId, p]));

  // Get all existing serials to check for duplicates
  const existingSerials = await prisma.certificate.findMany({
    where: { serial: { in: rows.map(r => r.serial) } },
    select: { serial: true },
  });
  const serialSet = new Set(existingSerials.map(s => s.serial));

  for (const row of rows) {
    const person = personMap.get(row.savdId);
    
    if (!person) {
      results.errors.push({ row, reason: "SAVD ID not found" });
      continue;
    }
    if (serialSet.has(row.serial)) {
      results.errors.push({ row, reason: "Serial number already exists" });
      continue;
    }

    // Optional: Warn if name doesn't match, but still allow (admin override)
    // In a real scenario, we might block, but let's just insert.

    try {
      await prisma.certificate.create({
        data: {
          personId: person.id,
          competitionId: competitionId || null,
          serial: row.serial,
          title: title,
        },
      });
      results.inserted++;
      serialSet.add(row.serial); // Prevent duplicates within the same batch
    } catch (e) {
      results.errors.push({ row, reason: "Database error" });
    }
  }

  return results;
}