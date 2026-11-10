import nodemailer from "nodemailer";

export interface SendInvitationEmailParams {
  toEmail: string;
  studentName: string;
  teamName: string;
  leaderName: string;
  description?: string;
  requiredSkills?: string;
  token?: string;
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

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const BADGE_PALETTE = [
  { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" }, // Sky Blue
  { bg: "#e0e7ff", text: "#4338ca", border: "#c7d2fe" }, // Indigo
  { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" }, // Emerald
  { bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe" }, // Purple
  { bg: "#f0fdfa", text: "#0f766e", border: "#99f6e4" }, // Teal
  { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" }, // Amber / Warm Orange
];

export function buildTeamInvitationHtml({
  toEmail,
  studentName,
  teamName,
  leaderName,
  description,
  requiredSkills,
  appBaseUrl
}: {
  toEmail: string;
  studentName: string;
  teamName: string;
  leaderName: string;
  description?: string;
  requiredSkills?: string;
  appBaseUrl: string;
}): string {
  const safeStudentName = escapeHtml(studentName || "Student");
  const safeTeamName = escapeHtml(teamName || "Project Team");
  const safeLeaderName = escapeHtml(leaderName || "Team Leader");
  const safeDescription = description ? escapeHtml(description) : "";
  const safeToEmail = escapeHtml(toEmail);
  const currentYear = new Date().getFullYear();

  const invitationUrl = `${appBaseUrl}/student/invitations`;
  const loginUrl = `${appBaseUrl}/student/login`;

  // Parse skill list from requiredSkills or fallback to description if formatted as skills
  const rawSkills = (requiredSkills && requiredSkills.trim().length > 0)
    ? requiredSkills
    : (description && description.includes(",") ? description : "");

  const parsedSkills = rawSkills
    ? rawSkills.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  const skillsHtml = parsedSkills.length > 0
    ? parsedSkills.map((skill, index) => {
        const color = BADGE_PALETTE[index % BADGE_PALETTE.length];
        return `<span style="display: inline-block; background-color: ${color.bg}; color: ${color.text}; border: 1px solid ${color.border}; font-size: 12px; font-weight: 600; padding: 4px 11px; border-radius: 999px; margin: 3px 4px 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; vertical-align: middle;">${escapeHtml(skill)}</span>`;
      }).join("\n")
    : `<span style="display: inline-block; background-color: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; font-size: 12px; font-weight: 500; padding: 4px 11px; border-radius: 999px; margin: 3px 4px 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; vertical-align: middle;">Open Collaboration &bull; All Skills Welcome</span>`;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Team Invitation — ${safeTeamName}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, span { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: #0b1120;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    @media only screen and (max-width: 620px) {
      .email-wrapper {
        padding: 12px 8px !important;
      }
      .email-card {
        width: 100% !important;
        border-radius: 12px !important;
      }
      .header-content {
        padding: 26px 20px 22px !important;
      }
      .body-content {
        padding: 24px 18px !important;
      }
      .team-box {
        padding: 16px !important;
      }
      .cta-button {
        width: 100% !important;
        display: block !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        text-align: center !important;
        box-sizing: border-box !important;
      }
      .footer-content {
        padding: 22px 18px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  
  <!-- Inbox Preheader Preview -->
  <div style="display: none; font-size: 1px; color: #0b1120; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ${safeStudentName}, you have been invited by ${safeLeaderName} to join ${safeTeamName} on Class Student Directory.
  </div>

  <!-- Background Canvas -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="background-color: #0b1120; min-height: 100vh;">
    <tr>
      <td align="center" class="email-wrapper" style="padding: 36px 16px;">
        
        <!-- Main Card Container (600px max) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-card" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08); border-collapse: separate;">
          
          <!-- Vibrant Top Gradient Accent -->
          <tr>
            <td height="6" style="background: linear-gradient(90deg, #38bdf8 0%, #3b82f6 35%, #6366f1 70%, #ec4899 100%); line-height: 6px; font-size: 6px;">&nbsp;</td>
          </tr>

          <!-- Branded Dark Navy Header -->
          <tr>
            <td class="header-content" style="background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); background-color: #0f172a; padding: 34px 36px 28px; text-align: left;">
              
              <!-- Brand Identity Badge -->
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 18px;">
                <tr>
                  <td style="background-color: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.28); border-radius: 999px; padding: 5px 13px;">
                    <span style="color: #38bdf8; font-size: 11px; font-weight: 700; letter-spacing: 1.1px; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      🎓 Class Student Directory
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Creative Invitation Headline -->
              <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 25px; font-weight: 800; line-height: 32px; letter-spacing: -0.4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                You're Invited to Join a Team!
              </h1>
              <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 22px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                A new project collaboration opportunity is ready for you on the portal.
              </p>
            </td>
          </tr>

          <!-- Main Body Section -->
          <tr>
            <td class="body-content" style="padding: 34px 36px 28px; background-color: #ffffff;">
              
              <!-- Greeting & Context -->
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Hello <strong style="color: #0f172a;">${safeStudentName}</strong>,
              </p>

              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <strong style="color: #0f172a;">${safeLeaderName}</strong> has invited you to join their project team <strong style="color: #2563eb;">${safeTeamName}</strong>. Check out the team overview below:
              </p>

              <!-- Team Information Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="team-box" role="presentation" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 26px; border-collapse: separate; overflow: hidden;">
                <tr>
                  <td style="padding: 22px;">
                    
                    <!-- Team Header Row -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                      <tr>
                        <td width="48" valign="middle" style="padding-right: 14px;">
                          <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-align: center; line-height: 48px; font-size: 22px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                            👥
                          </div>
                        </td>
                        <td valign="middle">
                          <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 2px 8px; border-radius: 999px; margin-bottom: 3px;">
                            Team Invitation
                          </span>
                          <h2 style="margin: 2px 0 0 0; color: #0f172a; font-size: 19px; font-weight: 800; line-height: 25px; letter-spacing: -0.3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            ${safeTeamName}
                          </h2>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <div style="height: 1px; background-color: #e2e8f0; margin: 18px 0 16px 0;"></div>

                    <!-- Details Table -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                      <!-- Team Leader Info -->
                      <tr>
                        <td style="padding-bottom: 14px;">
                          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; display: block; margin-bottom: 3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            Team Leader
                          </span>
                          <span style="font-size: 14px; font-weight: 700; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            👤 ${safeLeaderName}
                          </span>
                        </td>
                      </tr>

                      <!-- Project Description (if available) -->
                      ${safeDescription ? `
                      <tr>
                        <td style="padding-bottom: 14px;">
                          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; display: block; margin-bottom: 5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            Project Summary
                          </span>
                          <div style="font-size: 13px; line-height: 20px; color: #334155; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            ${safeDescription}
                          </div>
                        </td>
                      </tr>
                      ` : ""}

                      <!-- Required Skills Section -->
                      <tr>
                        <td>
                          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; display: block; margin-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            🎯 Required Skills &amp; Tech Stack
                          </span>
                          <div>
                            ${skillsHtml}
                          </div>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Primary Action Call to Action Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                      <tr>
                        <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); background-color: #2563eb; box-shadow: 0 6px 18px -2px rgba(37, 99, 235, 0.4);">
                          <a href="${invitationUrl}" class="cta-button" target="_blank" style="display: inline-block; padding: 15px 36px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px; letter-spacing: 0.3px;">
                            View Team Invitation &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Supporting Text -->
              <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 20px; color: #64748b; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Sign in to your portal account to <strong>Accept</strong> or <strong>Decline</strong> this invitation.
              </p>

              <!-- Informative Sign-in Notice Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                      <tr>
                        <td width="22" valign="middle" style="font-size: 15px; line-height: 18px; padding-right: 8px;">
                          ℹ️
                        </td>
                        <td style="font-size: 13px; line-height: 19px; color: #166534; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                          <strong>Fast response recommended:</strong> Team slots fill quickly. If not currently logged in, please <a href="${loginUrl}" style="color: #15803d; font-weight: 700; text-decoration: underline;">sign in here</a>.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Professional Footer -->
          <tr>
            <td class="footer-content" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 26px 36px; text-align: center;">
              
              <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #334155; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Class Student Directory Portal
              </p>
              
              <p style="margin: 0 0 14px 0; font-size: 12px; line-height: 18px; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Connecting students, showcasing portfolios, and building high-performance project teams.
              </p>

              <!-- Portal Navigation Links -->
              <p style="margin: 0 0 14px 0; font-size: 12px; color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <a href="${appBaseUrl}/student/invitations" style="color: #2563eb; text-decoration: none; font-weight: 600;">Invitations</a>
                &nbsp;&bull;&nbsp;
                <a href="${appBaseUrl}/student/teams/directory" style="color: #2563eb; text-decoration: none; font-weight: 600;">Teams Directory</a>
                &nbsp;&bull;&nbsp;
                <a href="${appBaseUrl}/directory" style="color: #2563eb; text-decoration: none; font-weight: 600;">Student Directory</a>
              </p>

              <div style="height: 1px; background-color: #e2e8f0; margin: 14px 0;"></div>

              <p style="margin: 0; font-size: 11px; line-height: 16px; color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                This invitation was sent directly to <strong>${safeToEmail}</strong>. If you did not expect this invitation, you can safely decline it in your portal dashboard.
              </p>

              <p style="margin: 6px 0 0 0; font-size: 11px; color: #cbd5e1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                &copy; ${currentYear} Class Student Directory Portal. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

export function buildTeamInvitationPlainText({
  studentName,
  teamName,
  leaderName,
  description,
  requiredSkills,
  appBaseUrl
}: {
  studentName: string;
  teamName: string;
  leaderName: string;
  description?: string;
  requiredSkills?: string;
  appBaseUrl: string;
}): string {
  const invitationUrl = `${appBaseUrl}/student/invitations`;
  const skills = (requiredSkills || description || "").trim();

  return `
CLASS STUDENT DIRECTORY PORTAL
Team Invitation

Hello ${studentName || "Student"},

${leaderName || "A team leader"} has invited you to join their project team: ${teamName || "Project Team"}.

Team Details:
- Team Name: ${teamName}
- Invited By: ${leaderName}
${description ? `- Project Summary: ${description}\n` : ""}${skills ? `- Required Skills: ${skills}\n` : ""}
To accept or decline this invitation, visit:
${invitationUrl}

(If you are not signed in, sign in at ${appBaseUrl}/student/login)

Regards,
Class Student Directory Portal
`.trim();
}

export async function sendTeamInvitationEmail({
  toEmail,
  studentName,
  teamName,
  leaderName,
  description,
  requiredSkills,
  token
}: SendInvitationEmailParams) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || "Class Student Directory <noreply@studentportal.com>";
  const appBaseUrl = process.env.APP_BASE_URL || process.env.CLIENT_ORIGIN || "http://localhost:5173";

  // If no credentials are provided, safely log in development instead of throwing/pretending.
  if (!transporter) {
    console.log("=========================================");
    console.log("EMAIL SERVICE DISABLED: Missing credentials.");
    console.log(`Would have sent invitation to: ${toEmail}`);
    console.log(`Team: ${teamName} (Leader: ${leaderName})`);
    console.log(`Accept Link: ${appBaseUrl}/student/invitations`);
    console.log("=========================================");
    return true; 
  }

  const html = buildTeamInvitationHtml({
    toEmail,
    studentName,
    teamName,
    leaderName,
    description,
    requiredSkills,
    appBaseUrl
  });

  const text = buildTeamInvitationPlainText({
    studentName,
    teamName,
    leaderName,
    description,
    requiredSkills,
    appBaseUrl
  });

  try {
    const info = await transporter.sendMail({
      from,
      to: toEmail,
      subject: `New Team Invitation — ${teamName}`,
      text,
      html
    });
    console.log(`[EmailService] Invitation email dispatched successfully to ${toEmail}. Message ID: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    throw new Error("Failed to dispatch invitation email");
  }
}


