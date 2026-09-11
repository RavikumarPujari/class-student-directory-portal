const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function runTests() {
  const baseURL = 'http://localhost:5000/api';
  const prisma = new PrismaClient();

  try {
    console.log('1. Setting up test data...');
    // Create leader and target
    const passwordHash = await bcrypt.hash('password123', 12);
    const leader = await prisma.student.upsert({
      where: { email: 'test@student.com' },
      update: {},
      create: {
        name: 'Test Student', usn: 'TEST001', section: 'A', branch: 'CSE', year: '1st', semester: 1, phone: '9876543210', email: 'test@student.com', favoriteDomain: 'Web', skills: 'React', passwordHash
      }
    });
    
    const target = await prisma.student.upsert({
      where: { email: 'target@student.com' },
      update: {},
      create: {
        name: 'Target Student', usn: 'TARGET001', section: 'B', branch: 'ISE', year: '2nd', semester: 3, phone: '1234567890', email: 'target@student.com', favoriteDomain: 'AI', skills: 'Python', passwordHash
      }
    });
    
    const other = await prisma.student.upsert({
      where: { email: 'other@student.com' },
      update: {},
      create: {
        name: 'Other Student', usn: 'OTHER001', section: 'C', branch: 'ECE', year: '3rd', semester: 5, phone: '1111111111', email: 'other@student.com', favoriteDomain: 'ML', skills: 'C++', passwordHash
      }
    });

    // Login functions
    async function login(email) {
      const res = await fetch(`${baseURL}/students/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' })
      });
      return (await res.json()).token;
    }

    const leaderToken = await login('test@student.com');
    const targetToken = await login('target@student.com');
    const otherToken = await login('other@student.com');

    // Create a team
    const teamRes = await fetch(`${baseURL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${leaderToken}` },
      body: JSON.stringify({ name: 'Accept Squad', description: 'Testing accept', maxSize: 2 })
    });
    const teamId = (await teamRes.json()).data.id;

    // Create invitation manually using leader API
    const inviteRes = await fetch(`${baseURL}/teams/${teamId}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${leaderToken}` },
      body: JSON.stringify({ studentId: target.id })
    });
    const inviteId = (await inviteRes.json()).data.id;
    
    // Get token from DB since it's not exposed in response (for security)
    const dbInvite = await prisma.teamInvitation.findUnique({ where: { id: inviteId } });
    const token = dbInvite.token;

    console.log('\\n--- TEST: Get My Invitations ---');
    const myInvRes = await fetch(`${baseURL}/team-invitations/me`, {
      headers: { 'Authorization': `Bearer ${targetToken}` }
    });
    if (myInvRes.status === 200) {
      const myInvData = await myInvRes.json();
      console.log('Passed: can fetch my invitations. Count:', myInvData.data.length);
      console.log('Team name:', myInvData.data[0].teamName);
    } else console.log('Failed:', myInvRes.status);

    console.log('\\n--- TEST: Wrong Student Accept ---');
    const wrongRes = await fetch(`${baseURL}/team-invitations/${token}/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${otherToken}` }
    });
    if (wrongRes.status === 403) console.log('Passed: other student blocked');
    else console.log('Failed:', wrongRes.status, await wrongRes.text());

    console.log('\\n--- TEST: Valid Decline ---');
    const declineRes = await fetch(`${baseURL}/team-invitations/${token}/decline`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${targetToken}` }
    });
    if (declineRes.status === 200) console.log('Passed: valid decline');
    else console.log('Failed:', declineRes.status, await declineRes.text());
    
    console.log('\\n--- TEST: Already Declined (re-accept) ---');
    const reAcceptRes = await fetch(`${baseURL}/team-invitations/${token}/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${targetToken}` }
    });
    if (reAcceptRes.status === 400) console.log('Passed: already declined blocked');
    else console.log('Failed:', reAcceptRes.status, await reAcceptRes.text());
    
    console.log('\\n--- TEST: Valid Accept ---');
    // make a new invitation
    const inviteRes2 = await fetch(`${baseURL}/teams/${teamId}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${leaderToken}` },
      body: JSON.stringify({ studentId: target.id })
    });
    const inviteId2 = (await inviteRes2.json()).data.id;
    const token2 = (await prisma.teamInvitation.findUnique({ where: { id: inviteId2 } })).token;
    
    const acceptRes = await fetch(`${baseURL}/team-invitations/${token2}/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${targetToken}` }
    });
    if (acceptRes.status === 200) console.log('Passed: valid accept');
    else console.log('Failed:', acceptRes.status, await acceptRes.text());
    
    // Check membership
    const mem = await prisma.teamMember.findUnique({ where: { teamId_studentId: { teamId, studentId: target.id } } });
    if (mem) console.log('Passed: team member created atomically');
    else console.log('Failed: member not created');
    
    console.log('\\n--- TEST: Capacity Limit ---');
    // team size is 2, currently leader + target = 2. It is full!
    const inviteRes3 = await fetch(`${baseURL}/teams/${teamId}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${leaderToken}` },
      body: JSON.stringify({ studentId: other.id })
    });
    if (inviteRes3.status === 400) console.log('Passed: capacity checked on invite');
    
    // if I manually force a pending invite into DB, let's see if accept blocks it
    const fakeToken = 'faketoken';
    await prisma.teamInvitation.create({
      data: {
        teamId, studentId: other.id, status: 'PENDING', token: fakeToken, expiresAt: new Date(Date.now() + 100000)
      }
    });
    const capacityRes = await fetch(`${baseURL}/team-invitations/${fakeToken}/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${otherToken}` }
    });
    if (capacityRes.status === 400) console.log('Passed: capacity checked on accept transaction');
    else console.log('Failed:', capacityRes.status, await capacityRes.text());

    console.log('\\nCleaning up...');
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "teams" CASCADE;`);
    await prisma.student.deleteMany({ where: { email: { in: ['target@student.com', 'other@student.com'] } } });
    await prisma.$disconnect();
    console.log('Done.');

  } catch (err) {
    console.error(err);
  }
}
runTests();

