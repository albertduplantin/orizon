import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key-for-build');

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, email not sent');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: from || 'ORIZON <noreply@yourdomain.com>', // TODO: Update with real domain
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error('Email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email exception:', error);
    return { success: false, error };
  }
}

// Email Templates

export function invitationEmailTemplate(params: {
  tenantName: string;
  inviteLink: string;
  role: string;
  clearanceLevel: number;
  clearanceName: string;
  expiresAt?: Date;
}) {
  const { tenantName, inviteLink, role, clearanceLevel, clearanceName, expiresAt } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .button {
      display: inline-block;
      background: #6366f1;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 8px;
      margin: 20px 0;
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Invitation à rejoindre ${tenantName}</h1>
  </div>

  <div class="content">
    <p>Bonjour,</p>

    <p>Vous avez été invité(e) à rejoindre <strong>${tenantName}</strong> sur ORIZON.</p>

    <p>
      <strong>Rôle assigné :</strong> ${role === 'tenant_admin' ? 'Administrateur' : 'Membre'}<br>
      <strong>Niveau d'accréditation :</strong> <span class="badge">${clearanceName} (${clearanceLevel})</span>
    </p>

    <p>Cliquez sur le bouton ci-dessous pour accepter l'invitation et créer votre compte :</p>

    <center>
      <a href="${inviteLink}" class="button">Accepter l'invitation</a>
    </center>

    ${expiresAt ? `<p><small>⏰ Cette invitation expire le ${expiresAt.toLocaleDateString('fr-FR')} à ${expiresAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</small></p>` : ''}

    <p>À bientôt sur ORIZON !</p>
  </div>

  <div class="footer">
    <p>Cet email a été envoyé automatiquement par ORIZON</p>
    <p>Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email</p>
  </div>
</body>
</html>
  `;
}

export function membershipRenewalEmailTemplate(params: {
  userName: string;
  tenantName: string;
  expiryDate: Date;
  renewalLink: string;
  amount: number;
}) {
  const { userName, tenantName, expiryDate, renewalLink, amount } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .button {
      display: inline-block;
      background: #6366f1;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 8px;
      margin: 20px 0;
      font-weight: 600;
    }
    .warning {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>💳 Renouvellement de votre adhésion</h1>
  </div>

  <div class="content">
    <p>Bonjour ${userName},</p>

    <div class="warning">
      <strong>⏰ Votre adhésion à ${tenantName} expire bientôt !</strong><br>
      Date d'expiration : <strong>${expiryDate.toLocaleDateString('fr-FR')}</strong>
    </div>

    <p>Pour continuer à participer aux activités de l'association, merci de renouveler votre adhésion.</p>

    <p><strong>Montant de la cotisation :</strong> ${amount}€</p>

    <center>
      <a href="${renewalLink}" class="button">Renouveler mon adhésion</a>
    </center>

    <p>Merci pour votre engagement ! 💚</p>
  </div>

  <div class="footer">
    <p>Association ${tenantName} - Powered by ORIZON</p>
  </div>
</body>
</html>
  `;
}

export function volunteerHoursValidatedEmailTemplate(params: {
  userName: string;
  hours: number;
  date: Date;
  description?: string;
  totalYearHours: number;
}) {
  const { userName, hours, date, description, totalYearHours } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .stats {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .stat-row:last-child {
      border-bottom: none;
      font-weight: 600;
      font-size: 18px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✅ Heures validées !</h1>
  </div>

  <div class="content">
    <p>Bonjour ${userName},</p>

    <p>Vos heures de bénévolat ont été validées :</p>

    <div class="stats">
      <div class="stat-row">
        <span>📅 Date</span>
        <span>${date.toLocaleDateString('fr-FR')}</span>
      </div>
      <div class="stat-row">
        <span>⏱️ Heures</span>
        <span>${hours}h</span>
      </div>
      ${description ? `
      <div class="stat-row">
        <span>📝 Description</span>
        <span>${description}</span>
      </div>
      ` : ''}
      <div class="stat-row">
        <span>📊 Total 2025</span>
        <span>${totalYearHours}h</span>
      </div>
    </div>

    <p>Merci pour votre engagement ! 🙏</p>
  </div>

  <div class="footer">
    <p>ORIZON - Gestion d'événements</p>
  </div>
</body>
</html>
  `;
}
