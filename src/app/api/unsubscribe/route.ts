import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyUnsubscribeToken } from '@/lib/email/unsubscribe';

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json({ error: 'Email og token er påkrævet' }, { status: 400 });
    }

    if (!verifyUnsubscribeToken(email, token)) {
      return NextResponse.json({ error: 'Ugyldigt afmeldingslink' }, { status: 403 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('email_preferences')
      .upsert(
        { email, unsubscribed: true, updated_at: new Date().toISOString() },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('[Unsubscribe] Supabase error:', error);
      return NextResponse.json({ error: 'Kunne ikke gemme afmelding' }, { status: 500 });
    }

    // Also mark any active nurture sequences as unsubscribed
    await supabase
      .from('nurture_emails')
      .update({ unsubscribed: true, completed: true })
      .eq('email', email)
      .eq('completed', false);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Der opstod en fejl' }, { status: 500 });
  }
}