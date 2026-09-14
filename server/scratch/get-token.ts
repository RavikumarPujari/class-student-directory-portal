import { PrismaClient } from "@prisma/client";
import { signToken } from "../src/utils/jwt"; // assuming it exists
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const teamId = "cmtwljhim0002qy4yok4f6idt";
  await prisma.team.update({
    where: { id: teamId },
    data: { requiredSkills: "React, Node.js" }
  });
  console.log("Updated required skills.");

  const leaderId = "cmtvtbw4900003vwl4bafqmyl";
  const leader = await prisma.student.findUnique({ where: { id: leaderId }});
  
  const token = signToken({
    studentId: leader!.id,
    email: leader!.email,
    role: "student"
  });
  
  fs.writeFileSync("token.txt", token);
  console.log("Token generated.");
}
main().finally(() => prisma.$disconnect());

