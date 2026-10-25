import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const teams = await prisma.team.findMany({
    include: { competition: true }
  });

  for (const team of teams) {
    const compName = team.competition.title.substring(0, 20); 
    const baseSlug = slugify(`${compName} ${team.name}`);
    
    const exists = await prisma.team.findUnique({ where: { slug: baseSlug } });
    const finalSlug = exists ? `${baseSlug}-${team.id.substring(0,4)}` : baseSlug;

    await prisma.team.update({
      where: { id: team.id },
      data: { slug: finalSlug }
    });
    console.log(`Updated team: ${team.name} -> ${finalSlug}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());