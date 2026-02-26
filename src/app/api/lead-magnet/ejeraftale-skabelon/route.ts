import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildEjeraftale } from '@/lib/documents/ejeraftale';
import { validateEmail } from '@/lib/utils/helpers';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: 'Ugyldig email-adresse' }, { status: 400 });
    }

    const supabase = createAdminClient();

    await supabase.from('lead_magnets').insert({
      email,
      name: name || null,
      resource: 'ejeraftale-skabelon',
    });

    const docxBuffer = await buildEjeraftale();

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: sendError } = await resend.emails.send({
      from: 'Retsklar <noreply@send.retsklar.dk>',
      replyTo: 'kontakt@retsklar.dk',
      to: email,
      subject: 'Din Ejeraftale Skabelon — Retsklar',
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
          <div style="background-color:#1E3A5F;padding:24px 32px;text-align:center">
            <h1 style="color:#fff;font-size:24px;margin:0">Retsklar</h1>
          </div>
          <div style="padding:32px">
            <h2 style="color:#1E3A5F;font-size:20px">Her er din Ejeraftale Skabelon</h2>
            <p style="font-size:16px;line-height:1.6;color:#374151">
              ${name ? `Hej ${name},` : 'Hej,'}<br><br>
              Tak fordi du downloadede vores ejeraftale-skabelon. Du finder den vedhæftet som DOCX-fil.
            </p>
            <p style="font-size:16px;line-height:1.6;color:#374151">
              Skabelonen indeholder de vigtigste klausuler og er klar til tilpasning i Word eller
              Google Docs. Vi anbefaler, at du gennemgår den med en advokat.
            </p>
            <p style="font-size:16px;line-height:1.6;color:#374151">
              <strong>Vil du vide mere om, hvad din virksomhed mangler?</strong><br>
              Tag et gratis juridisk helbredstjek på
              <a href="https://retsklar.dk/helbredstjek" style="color:#2563eb">retsklar.dk</a>.
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
          filename: 'Ejeraftale-Skabelon-Retsklar.docx',
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
