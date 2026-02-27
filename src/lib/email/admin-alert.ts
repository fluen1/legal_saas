import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = 'Retsklar Alerts <noreply@send.retsklar.dk>';
const FALLBACK_FROM = 'Retsklar Alerts <onboarding@resend.dev>';

export async function sendAdminAlert(subject: string, body: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn('[Admin Alert] ADMIN_EMAIL not configured. Alert not sent:', subject);
    return;
  }

  try {
    const result = await getResend().emails.send({
      from: FROM,
      to: adminEmail,
      subject: `[Retsklar Alert] ${subject}`,
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
          <div style="background-color:#EF4444;padding:16px 24px">
            <h2 style="color:#fff;margin:0;font-size:18px">Retsklar — Admin Alert</h2>
          </div>
          <div style="padding:24px;background:#fff;border:1px solid #e5e7eb">
            <h3 style="color:#1E3A5F;margin:0 0 12px">${subject}</h3>
            <pre style="background:#f9fafb;padding:16px;border-radius:8px;overflow-x:auto;font-size:13px;line-height:1.5;white-space:pre-wrap;word-break:break-word">${body}</pre>
            <p style="margin:16px 0 0;font-size:12px;color:#9ca3af">Tidspunkt: ${new Date().toISOString()}</p>
          </div>
        </div>
      `,
    });

    if (result.error?.message?.includes('not verified')) {
      await getResend().emails.send({
        from: FALLBACK_FROM,
        to: adminEmail,
        subject: `[Retsklar Alert] ${subject}`,
        html: `<pre>${body}</pre>`,
      });
    }

    console.log(`[Admin Alert] Sent: ${subject}`);
  } catch (err) {
    console.error('[Admin Alert] Failed to send:', subject, err);
  }
}
