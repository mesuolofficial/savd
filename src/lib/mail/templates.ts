const BASE_STYLE = `font-family: 'Barlow', Helvetica, Arial, sans-serif; background: #EAE6DE; margin: 0; padding: 32px 16px; color: #14202B;`;
const CARD_STYLE = `max-width: 600px; margin: 0 auto; background: #F6F3EC; border: 1px solid #D8D2C6; border-radius: 16px; overflow: hidden;`;
const HEADER_STYLE = `background: #0F2F4B; padding: 24px 32px; color: #FFFFFF;`;
const BODY_STYLE = `padding: 32px; font-size: 15px; line-height: 1.65;`;
const FOOTER_STYLE = `background: #0F2F4B; padding: 20px 32px; color: #EAE6DE; text-align: center; font-size: 12px;`;

function renderBase(contentHtml: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body style="${BASE_STYLE}">
        <div style="${CARD_STYLE}">
          <div style="${HEADER_STYLE}">
            <div style="font-size: 26px; font-weight: 700; letter-spacing: 1px;">
              SAVD <span style="color: #8EC1E8; font-size: 14px; margin-left: 4px;">▸ MES</span>
            </div>
          </div>
          <div style="${BODY_STYLE}">
            ${contentHtml}
          </div>
          <div style="${FOOTER_STYLE}">
            <div style="color: #8EC1E8; font-weight: bold; margin-bottom: 6px;">SAVD — Submersible Autonomous Vehicle Design</div>
            <div>Organized by MES, University of Lahore</div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function renderRegistrationReceived(p: { isLeader: boolean; recipientName: string; teamName: string; competitionTitle: string; competitionSlug: string; siteUrl: string; leaderName: string; }) {
  const firstName = p.recipientName.split(" ")[0] || p.recipientName;
  const role = p.isLeader ? "team leader" : "team member";
  
  const content = `
    <h1 style="font-family: 'Barlow Condensed', sans-serif; font-size: 30px; color: #0F2F4B; margin-top: 0; text-transform: uppercase;">You're in, ${firstName}.</h1>
    <p>We've received the registration for <strong>${p.teamName}</strong> in <strong>${p.competitionTitle}</strong>. This email is going to every team member, not just the leader.</p>
    <p>As ${role}, you'll get another email as soon as the organizers review and approve your team. No action is needed from you right now.</p>
    <div style="margin: 20px 0; padding: 16px; background: #FFFFFF; border: 1px solid #D8D2C6; border-radius: 10px;">
      <div><strong>Team:</strong> ${p.teamName}</div>
      <div><strong>Leader:</strong> ${p.leaderName}</div>
      <div><strong>Competition:</strong> ${p.competitionTitle}</div>
    </div>
    <a href="${p.siteUrl}/competitions/${p.competitionSlug}" style="display: inline-block; background: #EF8557; color: #14202B; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 10px; text-transform: uppercase;">View Competition</a>
  `;
  return renderBase(content);
}

export function renderRegistrationStatus(p: { teamName: string; competitionTitle: string; status: "APPROVED" | "REJECTED" | "WITHDRAWN"; leaderName: string; siteUrl: string; competitionSlug: string; }) {
  const isApproved = p.status === "APPROVED";
  const color = isApproved ? "#1f9d6b" : "#d64545";
  const title = isApproved ? "Registration Approved" : p.status === "REJECTED" ? "Registration Rejected" : "Registration Withdrawn";
  
  const content = `
    <h1 style="font-family: 'Barlow Condensed', sans-serif; font-size: 30px; color: #0F2F4B; margin-top: 0; text-transform: uppercase;">${title}</h1>
    <p>Hello ${p.leaderName},</p>
    <p>The status of your team <strong>${p.teamName}</strong> for <strong>${p.competitionTitle}</strong> has been updated.</p>
    
    <div style="margin: 20px 0; padding: 16px; background: #FFFFFF; border-left: 4px solid ${color}; border-radius: 4px;">
      <p style="margin: 0; font-size: 16px; font-weight: bold; color: ${color};">Status: ${p.status}</p>
      ${isApproved 
        ? `<p style="margin: 8px 0 0; font-size: 14px;">Congratulations! Your team is officially in. We will be in touch with further details soon.</p>` 
        : `<p style="margin: 8px 0 0; font-size: 14px;">Unfortunately, your team cannot participate in this edition. If you believe this is a mistake, please contact the organizers.</p>`}
    </div>

    <a href="${p.siteUrl}/competitions/${p.competitionSlug}" style="display: inline-block; background: #EF8557; color: #14202B; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 10px; text-transform: uppercase;">View Competition</a>
  `;
  return renderBase(content);
}

export function renderAdminNewRegistration(p: { teamName: string; competitionTitle: string; leaderName: string; leaderEmail: string; leaderWhatsapp: string; leaderUniversity: string; teamSize: number; submittedAt: string; adminUrl: string; }) {
  const content = `
    <h1 style="font-family: 'Barlow Condensed', sans-serif; font-size: 30px; color: #0F2F4B; margin-top: 0; text-transform: uppercase;">New Registration</h1>
    <p>A new team has registered for <strong>${p.competitionTitle}</strong>. Review it in the admin panel.</p>
    <table style="width: 100%; border-collapse: collapse; background: #FFFFFF; border: 1px solid #D8D2C6; border-radius: 10px; margin: 20px 0;">
      <tr><td style="padding: 10px; border-bottom: 1px solid #EAE6DE;"><strong>Team:</strong> ${p.teamName}</td></tr>
      <tr><td style="padding: 10px; border-bottom: 1px solid #EAE6DE;"><strong>Leader:</strong> ${p.leaderName} &lt;${p.leaderEmail}&gt;</td></tr>
      <tr><td style="padding: 10px; border-bottom: 1px solid #EAE6DE;"><strong>WhatsApp:</strong> ${p.leaderWhatsapp}</td></tr>
      <tr><td style="padding: 10px; border-bottom: 1px solid #EAE6DE;"><strong>University:</strong> ${p.leaderUniversity}</td></tr>
      <tr><td style="padding: 10px; border-bottom: 1px solid #EAE6DE;"><strong>Team Size:</strong> ${p.teamSize}</td></tr>
      <tr><td style="padding: 10px;"><strong>Submitted:</strong> ${p.submittedAt}</td></tr>
    </table>
    <a href="${p.adminUrl}" style="display: inline-block; background: #EF8557; color: #14202B; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 10px; text-transform: uppercase;">Review in Admin</a>
  `;
  return renderBase(content);
}

export function renderAdminNewApplication(p: { type: string; name: string; email: string; phone: string; institution?: string; adminUrl: string; }) {
  const content = `
    <h1 style="font-family: 'Barlow Condensed', sans-serif; font-size: 30px; color: #0F2F4B; margin-top: 0; text-transform: uppercase;">New ${p.type} Application</h1>
    <p>A new application has been submitted and requires your review.</p>
    <table style="width: 100%; border-collapse: collapse; background: #FFFFFF; border: 1px solid #D8D2C6; border-radius: 10px; margin: 20px 0;">
      <tr><td style="padding: 10px; border-bottom: 1px solid #EAE6DE;"><strong>Name:</strong> ${p.name}</td></tr>
      <tr><td style="padding: 10px; border-bottom: 1px solid #EAE6DE;"><strong>Email:</strong> ${p.email}</td></tr>
      ${p.phone ? `<tr><td style="padding: 10px; border-bottom: 1px solid #EAE6DE;"><strong>Phone:</strong> ${p.phone}</td></tr>` : ''}
      ${p.institution ? `<tr><td style="padding: 10px; border-bottom: 1px solid #EAE6DE;"><strong>Institution:</strong> ${p.institution}</td></tr>` : ''}
    </table>
    <a href="${p.adminUrl}" style="display: inline-block; background: #EF8557; color: #14202B; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 10px; text-transform: uppercase;">Review in Admin</a>
  `;
  return renderBase(content);
}

export function renderCertificateReady(p: { name: string; title: string; serial: string; siteUrl: string; }) {
  const content = `
    <h1 style="font-family: 'Barlow Condensed', sans-serif; font-size: 30px; color: #0F2F4B; margin-top: 0; text-transform: uppercase;">Your Certificate is Ready</h1>
    <p>Dear ${p.name},</p>
    <p>Congratulations! Your certificate for <strong>${p.title}</strong> has been officially issued and is now available for download.</p>
    
    <div style="margin: 20px 0; padding: 16px; background: #FFFFFF; border: 1px solid #D8D2C6; border-radius: 10px;">
      <div><strong>Serial Number:</strong> <span style="font-family: monospace; font-size: 16px; color: #226192;">${p.serial}</span></div>
    </div>

    <p>You can view, verify, and download your certificate from our public portal.</p>
    
    <a href="${p.siteUrl}/certificates/verify?q=${p.serial}" style="display: inline-block; background: #EF8557; color: #14202B; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 10px; text-transform: uppercase; margin-top: 10px;">View & Download Certificate</a>
  `;
  return renderBase(content);
}

export function renderResultCongratulations(p: { teamName: string; competitionTitle: string; position: string; medal: string; siteUrl: string; competitionSlug: string; }) {
  const medalEmoji = p.medal === "GOLD" ? "🥇" : p.medal === "SILVER" ? "🥈" : p.medal === "BRONZE" ? "🥉" : "🏆";
  
  const content = `
    <h1 style="font-family: 'Barlow Condensed', sans-serif; font-size: 30px; color: #0F2F4B; margin-top: 0; text-transform: uppercase;">Congratulations!</h1>
    <p>We are thrilled to announce that your team, <strong>${p.teamName}</strong>, has achieved a remarkable result in <strong>${p.competitionTitle}</strong>!</p>
    
    <div style="margin: 24px 0; padding: 24px; background: #FFFFFF; border: 2px dashed #D9A441; border-radius: 12px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 8px;">${medalEmoji}</div>
      <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #5D6D7A;">Position Awarded</p>
      <p style="margin: 4px 0 0; font-size: 24px; font-weight: bold; color: #0F2F4B;">${p.position}</p>
    </div>

    <p>Your hard work, dedication, and engineering brilliance have truly paid off. The entire organizing team is incredibly proud of your achievement.</p>
    
    <a href="${p.siteUrl}/competitions/${p.competitionSlug}/results" style="display: inline-block; background: #EF8557; color: #14202B; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 10px; text-transform: uppercase; margin-top: 10px;">View Official Results</a>
  `;
  return renderBase(content);
}

export function renderReviewSubmitted(p: { name: string; title: string; siteUrl: string; }) {
  const content = `
    <h1 style="font-family: 'Barlow Condensed', sans-serif; font-size: 30px; color: #0F2F4B; margin-top: 0; text-transform: uppercase;">Review Received</h1>
    <p>Dear ${p.name},</p>
    <p>Thank you for sharing your experience! We have received your review for <strong>${p.title}</strong>.</p>
    <p>Our team will review it shortly. Once approved, it will be published on our website and you will receive another email.</p>
    <a href="${p.siteUrl}/reviews" style="display: inline-block; background: #EF8557; color: #14202B; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 10px; text-transform: uppercase; margin-top: 10px;">View All Reviews</a>
  `;
  return renderBase(content);
}

export function renderReviewPublished(p: { name: string; title: string; reviewUrl: string; }) {
  const content = `
    <h1 style="font-family: 'Barlow Condensed', sans-serif; font-size: 30px; color: #0F2F4B; margin-top: 0; text-transform: uppercase;">Your Review is Live!</h1>
    <p>Dear ${p.name},</p>
    <p>Great news! Your review for <strong>${p.title}</strong> has been approved and is now published on our website.</p>
    <a href="${p.reviewUrl}" style="display: inline-block; background: #EF8557; color: #14202B; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 10px; text-transform: uppercase; margin-top: 10px;">View Your Review</a>
  `;
  return renderBase(content);
}

export function renderReviewReply(p: { name: string; title: string; replyText: string; reviewUrl: string; }) {
  const content = `
    <h1 style="font-family: 'Barlow Condensed', sans-serif; font-size: 30px; color: #0F2F4B; margin-top: 0; text-transform: uppercase;">New Reply to Your Review</h1>
    <p>Dear ${p.name},</p>
    <p>The SAVD Team has replied to your review for <strong>${p.title}</strong>.</p>
    <div style="margin: 20px 0; padding: 16px; background: #FFFFFF; border-left: 4px solid #EF8557; border-radius: 4px;">
      <p style="margin: 0; font-style: italic; color: #555;">"${p.replyText}"</p>
    </div>
    <a href="${p.reviewUrl}" style="display: inline-block; background: #EF8557; color: #14202B; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 10px; text-transform: uppercase; margin-top: 10px;">View Reply</a>
  `;
  return renderBase(content);
}

export function renderOtpEmail(p: { code: string; purpose: string; }) {
  // UPDATED to handle ADMIN_RESET
  const purposeText = 
    p.purpose === "POST_REVIEW" ? "Post a Review" : 
    p.purpose === "MANAGE_TEAM" ? "Manage Team" : 
    "Reset Admin Password";

  const content = `
    <h1 style="font-family: 'Barlow Condensed', sans-serif; font-size: 30px; color: #0F2F4B; margin-top: 0; text-transform: uppercase;">Verification Code</h1>
    <p>You requested a code for: <strong>${purposeText}</strong></p>
    <p>Enter the following 6-digit code to verify your email. This code expires in 10 minutes.</p>
    <div style="margin: 24px 0; padding: 24px; background: #FFFFFF; border: 1px dashed #D8D2C6; border-radius: 12px; text-align: center;">
      <span style="font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #226192;">${p.code}</span>
    </div>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  return renderBase(content);
}

export function renderContactAcknowledgement(p: { name: string; subject: string; message: string; }) {
  const content = `
    <h1 style="font-family: 'Barlow Condensed', sans-serif; font-size: 30px; color: #0F2F4B; margin-top: 0; text-transform: uppercase;">We've received your message</h1>
    <p>Dear ${p.name},</p>
    <p>Thank you for reaching out to SAVD. We have received your message regarding <strong>"${p.subject}"</strong> and our team will get back to you shortly.</p>
    
    <div style="margin: 20px 0; padding: 16px; background: #FFFFFF; border-left: 4px solid #226192; border-radius: 4px;">
      <p style="margin: 0; font-style: italic; color: #5D6D7A;">"${p.message}"</p>
    </div>

    <p>Best regards,<br/>The SAVD Team</p>
  `;
  return renderBase(content);
}

export function renderAdminNewContactMessage(p: { name: string; email: string; subject: string; adminUrl: string; }) {
  const content = `
    <h1 style="font-family: 'Barlow Condensed', sans-serif; font-size: 30px; color: #0F2F4B; margin-top: 0; text-transform: uppercase;">New Contact Message</h1>
    <p>You have received a new message from the website contact form.</p>
    <table style="width: 100%; border-collapse: collapse; background: #FFFFFF; border: 1px solid #D8D2C6; border-radius: 10px; margin: 20px 0;">
      <tr><td style="padding: 10px; border-bottom: 1px solid #EAE6DE;"><strong>Name:</strong> ${p.name}</td></tr>
      <tr><td style="padding: 10px; border-bottom: 1px solid #EAE6DE;"><strong>Email:</strong> ${p.email}</td></tr>
      <tr><td style="padding: 10px;"><strong>Subject:</strong> ${p.subject}</td></tr>
    </table>
    <a href="${p.adminUrl}" style="display: inline-block; background: #EF8557; color: #14202B; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 10px; text-transform: uppercase;">View Message</a>
  `;
  return renderBase(content);
}