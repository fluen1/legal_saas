import { Resend } from 'resend';
import { EMAILS } from '@/config/constants';
import { createLogger } from '@/lib/logger';

let _resend: Resend | null = null;

function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = `Retsklar Alerts <${EMAILS.noreply}>`;
const FALLBACK_FROM = EMAILS.fallbackFrom;

const log = createLogger('Admin Alert');

export async function sendAdminAlert(subject: string, body: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    log.warn('ADMIN_EMAIL not configured. Alert not sent:', subject);
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

    log.info(`Sent: ${subject}`);
  } catch (err) {
    log.error('Failed to send:', subject, err);
  }
}
