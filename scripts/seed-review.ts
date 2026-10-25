import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding sample review...");

  const comp = await prisma.competition.findFirst({ where: { isPublished: true } });
  if (!comp) throw new Error("Please create a competition first.");

  let person = await prisma.person.findUnique({ where: { savdId: "SAVD-0001" } });
  if (!person) throw new Error("SAVD-0001 not found.");

  // Update the person with a cool profile picture
  await prisma.person.update({
    where: { id: person.id },
    data: { photo: "https://i.pravatar.cc/150?u=badar" } 
  });

  // DELETE ALL EXISTING REVIEWS FOR THIS COMPETITION
  await prisma.review.deleteMany({
    where: { competitionId: comp.id },
  });
  console.log("🗑️  Deleted all old reviews for this competition.");

  // Create correct Participant review
  await prisma.review.create({
    data: {
      competitionId: comp.id,
      personId: person.id,
      role: "PARTICIPANT", 
      text: "Participating in SAVD was an unforgettable experience. Building an autonomous underwater vehicle from scratch pushed our engineering skills to the limit. The competition was fierce, but the support from the organizers was incredible. Can't wait to come back next year!",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  
  console.log("✅ Sample Participant review for SAVD-0001 added successfully!");
}

main().catch((e) => console.error(e)).finally(() => prisma.$disconnect());