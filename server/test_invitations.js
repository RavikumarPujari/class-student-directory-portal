const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function runTests() {
  const baseURL = 'http://localhost:5000/api';
  const prisma = new PrismaClient();

  try {
    console.log('1. Setting up test data...');
    // Create target student
    const targetPasswordHash = await bcrypt.hash('password123', 12);
    const targetStudent = await prisma.student.upsert({
      where: { email: 'target@student.com' },
      update: {},
      create: {
        name: 'Target Student',
        usn: 'TARGET001',
        section: 'B',
        branch: 'ISE',
        year: '2nd',
        semester: 3,
        phone: '1234567890',
        email: 'target@student.com',
        favoriteDomain: 'AI',
        skills: 'Python',
        passwordHash: targetPasswordHash
      }
    });

    // Login as leader
    console.log('2. Logging in as leader...');
    const loginRes = await fetch(`${baseURL}/students/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@student.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    // Fetch Me to get student ID
    const meRes = await fetch(`${baseURL}/students/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    const leaderId = meData.data.id;

    // Login as target (to test non-leader auth)
    const targetLoginRes = await fetch(`${baseURL}/students/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'target@student.com', password: 'password123' })
    });
    const targetToken = (await targetLoginRes.json()).token;

    // Create a team
    console.log('3. Creating a team...');
    const teamRes = await fetch(`${baseURL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: 'Invitation Squad', description: 'Testing invites', maxSize: 2 })
    });
    const teamData = await teamRes.json();
    const teamId = teamData.data.id;

    // TEST: self invite
    console.log('\\n--- TEST: Self invite ---');
    const selfInviteRes = await fetch(`${baseURL}/teams/${teamId}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ studentId: leaderId })
    });
    if (selfInviteRes.status === 400) console.log('Passed: self invite blocked');
    else console.log('Failed:', selfInviteRes.status, await selfInviteRes.text());

    // TEST: non-leader invite
    console.log('\\n--- TEST: Non-leader invite ---');
    const nonLeaderInviteRes = await fetch(`${baseURL}/teams/${teamId}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${targetToken}` },
      body: JSON.stringify({ studentId: leaderId })
    });
    if (nonLeaderInviteRes.status === 403) console.log('Passed: non-leader invite blocked');
    else console.log('Failed:', nonLeaderInviteRes.status, await nonLeaderInviteRes.text());

    // TEST: leader invite
    console.log('\\n--- TEST: Leader invite ---');
    const leaderInviteRes = await fetch(`${baseURL}/teams/${teamId}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ studentId: targetStudent.id })
    });
    if (leaderInviteRes.status === 201) console.log('Passed: leader can invite');
    else console.log('Failed:', leaderInviteRes.status, await leaderInviteRes.text());

    // TEST: duplicate pending
    console.log('\\n--- TEST: Duplicate pending ---');
    const dupInviteRes = await fetch(`${baseURL}/teams/${teamId}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ studentId: targetStudent.id })
    });
    if (dupInviteRes.status === 400) console.log('Passed: duplicate invite blocked');
    else console.log('Failed:', dupInviteRes.status, await dupInviteRes.text());

    // TEST: view invitations
    console.log('\\n--- TEST: View invitations (Leader) ---');
    const viewInvRes = await fetch(`${baseURL}/teams/${teamId}/invitations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (viewInvRes.status === 200) {
      const invData = await viewInvRes.json();
      console.log('Passed: View invitations works, count:', invData.data.length);
    } else {
      console.log('Failed:', viewInvRes.status);
    }

    // Cleanup
    console.log('\\nCleaning up...');
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "teams" CASCADE;`);
    await prisma.student.delete({ where: { id: targetStudent.id } });
    await prisma.$disconnect();
    console.log('Done.');

  } catch (err) {
    console.error(err);
  }
}
runTests();

