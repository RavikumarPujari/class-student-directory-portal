import nodemailer from "nodemailer";

interface SendInvitationEmailParams {
  toEmail: string;
  studentName: string;
  teamName: string;
  leaderName: string;
  description: string;
  token: string;
}

export async function sendTeamInvitationEmail({
  toEmail,
  studentName,
  teamName,
  leaderName,
  description,
  token
}: SendInvitationEmailParams) {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || "587", 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  const from = process.env.EMAIL_FROM || "noreply@studentportal.com";
  const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:5173";

  // If no credentials are provided, safely log in development instead of throwing/pretending.
  if (!host || !user || !pass) {
    console.log("=========================================");
    console.log("EMAIL SERVICE DISABLED: Missing credentials.");
    console.log(`Would have sent invitation to: ${toEmail}`);
    console.log(`Team: ${teamName} (Leader: ${leaderName})`);
    console.log(`Accept Link: ${appBaseUrl}/teams/invitation/accept?token=${token}`);
    console.log("=========================================");
    return true; 
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  const acceptUrl = `${appBaseUrl}/teams/invitation/accept?token=${token}`;
  const declineUrl = `${appBaseUrl}/teams/invitation/decline?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-w-md: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #0f766e;">Team Invitation</h2>
      <p>Hi ${studentName},</p>
      <p><strong>${leaderName}</strong> has invited you to join their team: <strong>${teamName}</strong>.</p>
      ${description ? `<blockquote style="border-left: 4px solid #0f766e; padding-left: 10px; color: #555;">${description}</blockquote>` : ""}
      <p>Click below to respond to this invitation:</p>
      <div style="margin: 20px 0;">
        <a href="${acceptUrl}" style="background-color: #0f766e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">Accept Invitation</a>
        <a href="${declineUrl}" style="background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Decline</a>
      </div>
      <p style="font-size: 12px; color: #888;">This link will expire in 7 days.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `Student Portal <${from}>`,
      to: toEmail,
      subject: `You've been invited to join ${teamName}`,
      html
    });
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    throw new Error("Failed to dispatch invitation email");
  }
}

