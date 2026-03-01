import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createLogger } from '@/lib/logger';

const log = createLogger('GDPR Delete');

export async function DELETE() {
  try {
    const userSupabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Ikke logget ind' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const email = user.email;
    const userId = user.id;

    // Delete in order: dependent tables first, then profile, then auth user
    // nurture_emails (references health_checks, but by email too)
    await supabase.from('nurture_emails').delete().eq('email', email);

    // lead_magnets
    await supabase.from('lead_magnets').delete().eq('email', email);

    // email_preferences
    await supabase.from('email_preferences').delete().eq('email', email);

    // waitlist
    await supabase.from('waitlist').delete().eq('email', email);

    // health_checks (by user_id OR email for legacy data)
    await supabase
      .from('health_checks')
      .delete()
      .or(`user_id.eq.${userId},email.eq.${email}`);

    // profiles (cascades from auth.users, but delete explicitly too)
    await supabase.from('profiles').delete().eq('id', userId);

    // Delete auth user via admin API
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      log.error('Auth user deletion failed:', deleteAuthError);
      // Data is already deleted — log but don't fail the response
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Error:', error);
    return NextResponse.json({ error: 'Sletning fejlede. Kontakt kontakt@retsklar.dk' }, { status: 500 });
  }
}
