import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "ravipujari2005@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "@RAVIP";

  const passwordHash = await bcrypt.hash(password, 12);

  // Upsert the default admin: update password if the email already exists,
  // otherwise create it. This avoids duplicates and keeps admin login working.
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    await prisma.admin.update({
      where: { email },
      data: { passwordHash },
    });
    console.log(`✅ Default admin updated: ${email}`);
  } else {
    await prisma.admin.create({
      data: { email, passwordHash, name: "Administrator" },
    });
    console.log(`✅ Default admin created: ${email}`);
  }

  console.log(`   Password: ${password}`);

  // Test Students
  const TEST_STUDENTS = [
    {
      name: "Aarav Sharma",
      email: "test.student01@example.test",
      usn: "TESTCSE001",
      skills: "React, JavaScript, HTML, CSS",
      favoriteDomain: "Web Development",
      bio: "Frontend-focused student interested in building responsive web applications and improving modern JavaScript development skills."
    },
    {
      name: "Aditya Kumar",
      email: "test.student02@example.test",
      usn: "TESTCSE002",
      skills: "React, Node.js, Express, PostgreSQL",
      favoriteDomain: "Full Stack Development",
      bio: "Full-stack development enthusiast interested in building APIs, web applications, and database-driven systems."
    },
    {
      name: "Rahul Verma",
      email: "test.student03@example.test",
      usn: "TESTCSE003",
      skills: "Python, Django, PostgreSQL, SQL",
      favoriteDomain: "Backend Development",
      bio: "Backend-focused student interested in Python web development, databases, and building reliable server-side applications."
    },
    {
      name: "Kiran Patil",
      email: "test.student04@example.test",
      usn: "TESTCSE004",
      skills: "Java, Spring Boot, MySQL, REST API",
      favoriteDomain: "Backend Development",
      bio: "Java developer interested in enterprise backend systems, REST APIs, and relational databases."
    },
    {
      name: "Arjun Rao",
      email: "test.student05@example.test",
      usn: "TESTCSE005",
      skills: "React, TypeScript, Node.js, Git",
      favoriteDomain: "Full Stack Development",
      bio: "Full-stack learner interested in TypeScript, React, Node.js, and collaborative software development."
    },
    {
      name: "Vikram Singh",
      email: "test.student06@example.test",
      usn: "TESTCSE006",
      skills: "Python, Machine Learning, SQL, Pandas",
      favoriteDomain: "Data Science",
      bio: "Data-oriented student interested in Python, machine learning, data analysis, and working with structured datasets."
    },
    {
      name: "Rohit Desai",
      email: "test.student07@example.test",
      usn: "TESTCSE007",
      skills: "UI/UX, Figma, HTML, CSS, JavaScript",
      favoriteDomain: "UI/UX Design",
      bio: "UI/UX-focused student interested in designing clean interfaces, prototypes, and accessible web experiences."
    },
    {
      name: "Nikhil Joshi",
      email: "test.student08@example.test",
      usn: "TESTCSE008",
      skills: "Node.js, Express, MongoDB, JavaScript, REST API",
      favoriteDomain: "Backend Development",
      bio: "Backend developer interested in Node.js, APIs, JavaScript, and building scalable web services."
    },
    {
      name: "Abhishek Gowda",
      email: "test.student09@example.test",
      usn: "TESTCSE009",
      skills: "Cybersecurity, Linux, Python, Networking",
      favoriteDomain: "Cybersecurity",
      bio: "Cybersecurity learner interested in Linux, networking, Python automation, and secure software practices."
    },
    {
      name: "Sanjay Kulkarni",
      email: "test.student10@example.test",
      usn: "TESTCSE010",
      skills: "React, Python, PostgreSQL, Git",
      favoriteDomain: "Software Development",
      bio: "Software development student interested in combining frontend development, Python, databases, and collaborative engineering practices."
    }
  ];

  const TEST_PASSWORD = "TestStudent@123";
  const testPasswordHash = await bcrypt.hash(TEST_PASSWORD, 12);

  console.log("\n--- Starting Test Student Seeding ---");

  for (const ts of TEST_STUDENTS) {
    const existingEmail = await prisma.student.findUnique({ where: { email: ts.email.toLowerCase() } });
    const existingUsn = await prisma.student.findUnique({ where: { usn: ts.usn.toUpperCase() } });

    if (existingEmail || existingUsn) {
      const existing = existingEmail || existingUsn;
      if (existing!.email !== ts.email.toLowerCase() || existing!.usn !== ts.usn.toUpperCase()) {
         console.error(`CONFLICT: Existing student matches partial test criteria but differs. USN=${existing!.usn}, Email=${existing!.email}`);
         process.exit(1);
      }
      console.log(`Student already present: ${ts.name} (${ts.usn})`);
    } else {
      await prisma.student.create({
        data: {
          name: ts.name,
          email: ts.email.toLowerCase(),
          usn: ts.usn.toUpperCase(),
          skills: ts.skills,
          favoriteDomain: ts.favoriteDomain,
          bio: ts.bio,
          passwordHash: testPasswordHash,
        }
      });
      console.log(`Created test student: ${ts.name} (${ts.usn})`);
    }
  }
  
  console.log("--- Test Student Seeding Complete ---");
  console.log(`Test Student Password: ${TEST_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
