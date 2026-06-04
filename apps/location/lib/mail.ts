import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Artéfact Urbain <location@artefacturbain.ca>';
const NOTIFICATION_EMAIL = 'location@artefacturbain.ca';

interface SendQuoteEmailParams {
  to: string;
  customerName: string;
  requestId: string;
  items: any[];
  totalPrice: number;
  startDate: string;
  endDate: string;
}

export async function sendQuoteConfirmationEmail({
  to,
  customerName,
  requestId,
  items,
  totalPrice,
  startDate,
  endDate
}: SendQuoteEmailParams) {
  try {
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price}$</td>
      </tr>
    `).join('');

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Confirmation de votre demande de soumission #${requestId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #E7A128;">Merci pour votre demande !</h1>
          <p>Bonjour ${customerName},</p>
          <p>Nous avons bien reçu votre demande de soumission pour la période du <strong>${startDate}</strong> au <strong>${endDate}</strong>.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Récapitulatif de votre demande (#${requestId})</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="text-align: left; padding: 10px; border-bottom: 2px solid #ddd;">Article</th>
                  <th style="text-align: center; padding: 10px; border-bottom: 2px solid #ddd;">Qté</th>
                  <th style="text-align: right; padding: 10px; border-bottom: 2px solid #ddd;">Prix unit.</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 20px 10px 10px; text-align: right; font-weight: bold;">Total estimé:</td>
                  <td style="padding: 20px 10px 10px; text-align: right; font-weight: bold; color: #E7A128; font-size: 1.2em;">${totalPrice}$</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p>Un membre de notre équipe analysera votre demande et vous contactera sous peu pour finaliser les détails.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="font-size: 0.9em; color: #666;">
            <strong>Artéfact Urbain - Division Location</strong><br />
            277 Boul. Bona-Dussault, Saint-Marc-des-Carrières, G0A 4B0, QC<br />
            <a href="mailto:location@artefacturbain.ca" style="color: #E7A128;">location@artefacturbain.ca</a>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[Resend] Error sending confirmation email:', error);
      return { success: false, error };
    }

    // Send internal notification
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [NOTIFICATION_EMAIL],
      subject: `NOUVELLE SOUMISSION: ${customerName} (#${requestId})`,
      html: `<p>Une nouvelle demande de soumission a été reçue via le site web.</p><p>Client: ${customerName} (${to})</p><p>Total: ${totalPrice}$</p><p>Voir dans Rentman: #${requestId}</p>`,
    });

    return { success: true, data };
  } catch (error) {
    console.error('[Resend] Fatal error sending confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendContactEmail({
  name,
  email,
  phone,
  message
}: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [NOTIFICATION_EMAIL],
      replyTo: email,
      subject: `Nouveau message contact: ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #E7A128;">Nouveau message de contact</h2>
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Téléphone:</strong> ${phone || 'Non fourni'}</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin-top: 20px;">
            <p style="margin-top: 0; font-weight: bold;">Message:</p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[Resend] Error sending contact email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Resend] Fatal error sending contact email:', error);
    return { success: false, error };
  }
}

export async function sendRoleUpdateEmail({
  to,
  newRole
}: {
  to: string;
  newRole: string;
}) {
  try {
    const roleNames: Record<string, string> = {
      guest: 'GUEST (Accès standard)',
      locationb: 'LOCATION B (Accès intermédiaire)',
      locationc: 'LOCATION C (Accès complet)',
      admin: 'ADMINISTRATEUR (Accès complet + Administration)'
    };
    const roleName = roleNames[newRole] || newRole.toUpperCase();

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Mise à jour de vos accès - Artéfact Urbain`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <h1 style="color: #E7A128; font-size: 24px; margin-bottom: 20px;">Mise à jour de vos accès</h1>
          <p>Bonjour,</p>
          <p>Un administrateur a mis à jour vos privilèges d'accès sur la plateforme de <strong>Location Artéfact Urbain</strong>.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 24px 0; border-left: 4px solid #E7A128;">
            <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; font-weight: bold;">Nouveau rôle attribué :</p>
            <p style="margin: 8px 0 0 0; font-size: 18px; color: #E7A128; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em;">
              ${roleName}
            </p>
          </div>

          <p>Ces modifications sont applicables immédiatement. Vous pouvez vous connecter pour explorer vos nouveaux tarifs et le catalogue d'équipements correspondant.</p>
          
          <div style="margin-top: 30px;">
            <a href="https://artefacturbain.ca/location/login/" style="display: inline-block; background: #222; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; box-shadow: 0 10px 20px rgba(0,0,0,0.05); transition: background 0.3s;">
              Se connecter à mon espace
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />
          
          <p style="font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1.8;">
            <strong>Artéfact Urbain - Division Location</strong><br />
            277 Boul. Bona-Dussault, Saint-Marc-des-Carrières, G0A 4B0, QC<br />
            <a href="mailto:location@artefacturbain.ca" style="color: #E7A128; text-decoration: none;">location@artefacturbain.ca</a>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[Resend] Error sending role update email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Resend] Fatal error sending role update email:', error);
    return { success: false, error };
  }
}
