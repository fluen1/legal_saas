'use client';

import { useState } from 'react';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError('Kunne ikke sende login-link. Prøv igen.');
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <>
      <Header />
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Log ind</CardTitle>
            <p className="text-sm text-muted-foreground">
              Vi sender dig et magic link til din email.
            </p>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center">
                <p className="text-lg font-medium text-green-600">Tjek din email!</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Vi har sendt et login-link til <strong>{email}</strong>
                </p>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din@email.dk"
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    'Send login-link'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
