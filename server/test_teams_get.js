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

    // Create a team
    const teamRes = await fetch(`${baseURL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: 'Alpha Squad', description: 'Test description', maxSize: 5 })
    });
    const teamData = await teamRes.json();
    const teamId = teamData.data.id;

    // GET /api/teams/me
    console.log('\\n--- GET /api/teams/me ---');
    const myTeamsRes = await fetch(`${baseURL}/teams/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (myTeamsRes.status === 200) {
      const myTeams = await myTeamsRes.json();
      console.log('Passed:', myTeams.data.length > 0);
      console.log('Team data:', JSON.stringify(myTeams.data[0], null, 2));
    } else {
      console.log('Failed:', myTeamsRes.status, await myTeamsRes.text());
    }

    // GET /api/teams/:teamId
    console.log('\\n--- GET /api/teams/:teamId ---');
    const getTeamRes = await fetch(`${baseURL}/teams/${teamId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (getTeamRes.status === 200) {
      const getTeam = await getTeamRes.json();
      console.log('Passed:', getTeam.data.id === teamId);
      console.log('Single team data:', JSON.stringify(getTeam.data, null, 2));
    } else {
      console.log('Failed:', getTeamRes.status, await getTeamRes.text());
    }

    // Unauthenticated GET
    console.log('\\n--- GET /api/teams/me (Unauthenticated) ---');
    const unauthRes = await fetch(`${baseURL}/teams/me`);
    if (unauthRes.status === 401) {
      console.log('Passed: Unauthenticated request rejected');
    } else {
      console.log('Failed:', unauthRes.status);
    }
    
    // Unrelated student GET
    console.log('\\n--- GET /api/teams/:teamId (Unrelated student) ---');
    // First, temporarily remove the student from the team
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Remove membership
    await prisma.teamMember.delete({ where: { teamId_studentId: { teamId, studentId } } });
    // Change leader
    await prisma.team.update({ where: { id: teamId }, data: { leaderId: 'some-other-id' } });
    
    const unrelatedRes = await fetch(`${baseURL}/teams/${teamId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (unrelatedRes.status === 403) {
      console.log('Passed: Unrelated student rejected with 403');
    } else {
      console.log('Failed:', unrelatedRes.status, await unrelatedRes.text());
    }

    // Cleanup
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "teams" CASCADE;`);
    await prisma.$disconnect();

  } catch (err) {
    console.error(err);
  }
}
runTests();

