import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWelcomeEmail } from '@/lib/email/resend';
import { validateEmail } from '@/lib/utils/helpers';
import { rateLimit } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';

const log = createLogger('Waitlist');

interface WaitlistRequestBody {
  email: string;
  source?: string;
}

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, { maxRequests: 5, windowMs: 60_000, prefix: 'waitlist' });
    if (limited) return limited;

    const body: WaitlistRequestBody = await request.json();
    const { email, source } = body;

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: 'Ugyldig email-adresse' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error: upsertError } = await supabase
      .from('waitlist')
      .upsert(
        { email, source: source || 'landing' },
        { onConflict: 'email' }
      );

    if (upsertError) {
      log.error('Upsert error:', upsertError);
      return NextResponse.json({ error: 'Kunne ikke tilmelde' }, { status: 500 });
    }

    await sendWelcomeEmail(email).catch((err) => log.error('Email error:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('API error:', error);
    return NextResponse.json({ error: 'Noget gik galt' }, { status: 500 });
  }
}
