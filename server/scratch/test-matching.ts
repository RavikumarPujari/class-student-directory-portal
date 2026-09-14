import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const team = await prisma.team.findFirst({
    include: { leader: true }
  });
  if (!team) {
    console.log("No teams found. Creating a test team.");
    const leader = await prisma.student.findFirst();
    const newTeam = await prisma.team.create({
      data: {
        name: "Test Team",
        description: "Test",
        leaderId: leader!.id,
        requiredSkills: "React, Node.js",
        maxSize: 4
      },
      include: { leader: true }
    });
    console.log("Created team:", newTeam.id, "Leader:", newTeam.leaderId);
  } else {
    console.log("Found team:", team.id);
    console.log("Required Skills:", team.requiredSkills);
    console.log("Leader:", team.leaderId);
  }
}
main().finally(() => prisma.$disconnect());

