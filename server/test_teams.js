async function runTests() {
  const baseURL = 'http://localhost:5000/api';

  try {
    console.log('Logging in...');
    const loginRes = await fetch(`${baseURL}/students/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@student.com', password: 'password123' })
    });
    
    if (!loginRes.ok) {
        console.error("Login failed!", await loginRes.text());
        return;
    }
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    // Fetch Me to get student ID
    const meRes = await fetch(`${baseURL}/students/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    const studentId = meData.data.id;
    console.log('Token acquired, ID:', studentId);

    // TEST 1: Unauthenticated request
    const res1 = await fetch(`${baseURL}/teams`, { method: 'POST' });
    if (res1.status === 401) console.log('TEST 1 PASSED: Unauthenticated rejected');
    else console.log('TEST 1 FAILED', res1.status);

    // TEST 7 & 8: Invalid name and maxSize
    const res2 = await fetch(`${baseURL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: 'A', maxSize: 100 })
    });
    if (res2.status === 422) console.log('TEST 7/8 PASSED: Validation caught bad data');
    else console.log('TEST 7/8 FAILED', res2.status);

    // TEST 2: Authenticated student creates team
    const teamRes = await fetch(`${baseURL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: 'Alpha Squad', description: 'Test description', maxSize: 5 })
    });
    
    if (teamRes.status === 201) console.log('TEST 2 PASSED: Team created');
    else console.log('TEST 2 FAILED', await teamRes.text());
    
    const teamData = await teamRes.json();
    const team = teamData.data;
    
    // TEST 3: Creator is leader
    if (team.leaderId === studentId) console.log('TEST 3 PASSED: Creator is leader');
    
    // Check DB for TeamMember
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const member = await prisma.teamMember.findFirst({ where: { teamId: team.id, studentId } });
    
    if (member) console.log('TEST 4/5 PASSED: Creator is automatically a TeamMember');
    
    // Cleanup
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "teams" CASCADE;`);
    await prisma.$disconnect();

  } catch (err) {
    console.error(err);
  }
}
runTests();
