import { Text, Link } from '@react-email/components';
import { EmailLayout, CTAButton, ScoreBadge, BRAND } from './_layout';

interface Nurture5Props {
  name?: string;
  reportId: string;
  scoreLevel: 'red' | 'yellow' | 'green';
  issueCount: number;
  unsubscribeUrl: string;
}

export function Nurture5Final({ name, reportId, scoreLevel, issueCount, unsubscribeUrl }: Nurture5Props) {
  const greeting = name ? `Hej ${name}` : 'Hej';

  return (
    <EmailLayout preview="Din Retsklar-rapport venter stadig" unsubscribeUrl={unsubscribeUrl}>
      <Text style={{ fontSize: '20px', fontWeight: 'bold', color: BRAND.text, marginBottom: '8px' }}>
        {greeting},
      </Text>
      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        For to uger siden gennemgik vi din virksomheds juridiske situation.
        Din rapport er stadig tilgængelig.
      </Text>

      <ScoreBadge scoreLevel={scoreLevel} />

      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Vi fandt {issueCount} problemområder. De fleste af dem kan håndteres på under én uge
        — når du ved præcist hvad du skal gøre.
      </Text>

      <CTAButton href={`https://retsklar.dk/helbredstjek/resultat?id=${reportId}&upgrade=true`}>
        Se din rapport
      </CTAButton>

      <Text style={{ fontSize: '14px', color: BRAND.muted, lineHeight: '1.6' }}>
        Har du brug for personlig hjælp?{' '}
        <Link href="https://retsklar.dk/kontakt" style={{ color: BRAND.accent }}>
          Book en gratis 15-minutters samtale
        </Link>
        {' '}— ingen forpligtelse.
      </Text>

      <Text style={{ fontSize: '13px', color: BRAND.muted, fontStyle: 'italic' }}>
        P.S. Dette er den sidste email i vores sekvens. Vi kontakter dig ikke igen med mindre du henvender dig.
      </Text>
    </EmailLayout>
  );
}

export default Nurture5Final;
