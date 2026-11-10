import "dotenv/config";
import { verifyEmailConfiguration, sendTeamInvitationEmail } from "./src/services/email.service";

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const user = parts[0];
  const domain = parts[1];
  const maskedUser = user.length > 3 ? user.slice(0, 3) + "***" : user.slice(0, 1) + "***";
  return `${maskedUser}@${domain}`;
}

async function runEmailTest() {
  console.log("=== Safe Email Delivery Test ===");

  const targetEmail = process.argv[2] || process.env.SMTP_USER;
  if (!targetEmail) {
    console.error("❌ No recipient email specified and SMTP_USER is not configured in .env");
    process.exit(1);
  }

  console.log(`Testing SMTP configuration with recipient: ${maskEmail(targetEmail)}`);

  // 1. Verify SMTP connection
  console.log("Step 1: Verifying SMTP transport connection...");
  await verifyEmailConfiguration();

  // 2. Send a test invitation email using the existing email service
  console.log("Step 2: Sending test team invitation email via sendTeamInvitationEmail...");
  try {
    const result = await sendTeamInvitationEmail({
      toEmail: targetEmail,
      studentName: "Aditya Sharma",
      teamName: "CodeCraft Innovators",
      leaderName: "Rahul Verma",
      description: "Building an AI-powered student collaboration and project showcase platform for the upcoming hackathon.",
      requiredSkills: "React, Node.js, TypeScript, PostgreSQL, Tailwind CSS",
      token: "test-token-" + Date.now()
    });

    if (result) {
      console.log(`✅ Test email was successfully accepted and dispatched by Gmail SMTP!`);
      console.log(`Recipient: ${maskEmail(targetEmail)}`);
    } else {
      console.error("❌ Email service returned false or email service is disabled.");
    }
  } catch (err: any) {
    console.error("❌ Email delivery failed with error:", err.message || err);
    process.exit(1);
  }
}

runEmailTest();

