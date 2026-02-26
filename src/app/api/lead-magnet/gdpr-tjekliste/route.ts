import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildGDPRTjekliste } from '@/lib/documents/gdpr-tjekliste';
import { validateEmail } from '@/lib/utils/helpers';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: 'Ugyldig email-adresse' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Save lead
    await supabase.from('lead_magnets').insert({
      email,
      name: name || null,
      resource: 'gdpr-tjekliste',
    });

    // Generate DOCX
    const docxBuffer = await buildGDPRTjekliste();

    // Send email with attachment
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: sendError } = await resend.emails.send({
      from: 'Retsklar <noreply@send.retsklar.dk>',
      replyTo: 'kontakt@retsklar.dk',
      to: email,
      subject: 'Din GDPR Tjekliste — Retsklar',
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
          <div style="background-color:#1E3A5F;padding:24px 32px;text-align:center">
            <h1 style="color:#fff;font-size:24px;margin:0">Retsklar</h1>
          </div>
          <div style="padding:32px">
            <h2 style="color:#1E3A5F;font-size:20px">Her er din GDPR Tjekliste</h2>
            <p style="font-size:16px;line-height:1.6;color:#374151">
              ${name ? `Hej ${name},` : 'Hej,'}<br><br>
              Tak fordi du downloadede vores GDPR Tjekliste. Du finder den vedhæftet som DOCX-fil.
            </p>
            <p style="font-size:16px;line-height:1.6;color:#374151">
              Tjeklisten indeholder de 10 vigtigste GDPR-krav, din virksomhed skal overholde.
              Brug den som udgangspunkt og markér hvert punkt, når det er opfyldt.
            </p>
            <p style="font-size:16px;line-height:1.6;color:#374151">
              <strong>Vil du vide præcis, hvor din virksomhed står?</strong><br>
              Tag et gratis juridisk helbredstjek på
              <a href="https://retsklar.dk/helbredstjek" style="color:#2563eb">retsklar.dk</a>
              — det tager kun 5 minutter.
            </p>
            <p style="font-size:14px;color:#6b7280;margin-top:24px">
              Med venlig hilsen,<br>Philip fra Retsklar
            </p>
          </div>
          <div style="padding:24px 32px;text-align:center;background-color:#f9fafb">
            <p style="font-size:13px;color:#9ca3af;margin:0">&copy; ${new Date().getFullYear()} Retsklar.dk</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'GDPR-Tjekliste-Retsklar.docx',
          content: docxBuffer.toString('base64'),
        },
      ],
    });

    if (sendError) {
      console.error('[Lead Magnet] Email send failed:', sendError);
      return NextResponse.json({ error: 'Kunne ikke sende email' }, { status: 500 });
    }

    // Start nurture sequence
    await supabase.from('nurture_emails').insert({
      email,
      sequence_step: 0,
      next_send_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Lead Magnet] Error:', error);
    return NextResponse.json({ error: 'Der opstod en fejl' }, { status: 500 });
  }
}
