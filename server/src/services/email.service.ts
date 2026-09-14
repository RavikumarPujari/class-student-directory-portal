import nodemailer from "nodemailer";

interface SendInvitationEmailParams {
  toEmail: string;
  studentName: string;
  teamName: string;
  leaderName: string;
  description: string;
  token: string;
}

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
};

export async function verifyEmailConfiguration() {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("SMTP email service is not configured (missing SMTP_HOST, SMTP_USER, or SMTP_PASS). Emails will be skipped safely.");
    return;
  }
  
  try {
    await transporter.verify();
    console.log("SMTP email service configured successfully");
  } catch (err) {
    console.warn("SMTP email service configuration failed:", err);
  }
}

export async function sendTeamInvitationEmail({
  toEmail,
  studentName,
  teamName,
  leaderName,
  description,
  token
}: SendInvitationEmailParams) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || "Class Student Directory <noreply@studentportal.com>";
  const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:5173";

  // If no credentials are provided, safely log in development instead of throwing/pretending.
  if (!transporter) {
    console.log("=========================================");
    console.log("EMAIL SERVICE DISABLED: Missing credentials.");
    console.log(`Would have sent invitation to: ${toEmail}`);
    console.log(`Team: ${teamName} (Leader: ${leaderName})`);
    console.log(`Accept Link: ${appBaseUrl}/student/teams/invitations`);
    console.log("=========================================");
    return true; 
  }

  const loginUrl = `${appBaseUrl}/student/login`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #0f766e;">New Team Invitation — ${teamName}</h2>
      <p>Hello ${studentName},</p>
      <p>You have received a new invitation to join:</p>
      <p><strong>${teamName}</strong></p>
      <p>Invited by:<br/><strong>${leaderName}</strong></p>
      ${description ? `<p>Required skills:<br/><strong>${description}</strong></p>` : ""}
      <p>Please sign in to your Class Student Directory account to view the invitation and choose:</p>
      <p><strong>Accept</strong><br/>or<br/><strong>Decline</strong></p>
      <div style="margin: 20px 0;">
        <a href="${loginUrl}" style="background-color: #0f766e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Invitation</a>
      </div>
      <p>Regards,</p>
      <p>Class Student Directory</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to: toEmail,
      subject: `New Team Invitation — ${teamName}`,
      html
    });
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    throw new Error("Failed to dispatch invitation email");
  }
}

