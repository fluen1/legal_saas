import { Text, Link } from '@react-email/components';
import { EmailLayout, CTAButton, ScoreBadge, BRAND } from './_layout';

interface WelcomeEmailProps {
  name?: string;
  reportId: string;
  scoreLevel: 'red' | 'yellow' | 'green';
  issueCount: number;
  unsubscribeUrl: string;
}

export function WelcomeEmail({ name, reportId, scoreLevel, issueCount, unsubscribeUrl }: WelcomeEmailProps) {
  const greeting = name ? `Hej ${name}` : 'Hej';
  const reportUrl = `https://retsklar.dk/helbredstjek/resultat?id=${reportId}`;

  return (
    <EmailLayout preview={`Din Retsklar-rapport er klar — ${issueCount} områder kræver opmærksomhed`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={{ fontSize: '22px', fontWeight: 'bold', color: BRAND.text, marginBottom: '8px' }}>
        {greeting},
      </Text>
      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Tak fordi du brugte Retsklar. Vi har analyseret din virksomheds juridiske situation på tværs af 5 områder.
      </Text>

      <ScoreBadge scoreLevel={scoreLevel} />

      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Vi fandt <strong>{issueCount} {issueCount === 1 ? 'område' : 'områder'}</strong> der kræver opmærksomhed.
        Din gratis rapport giver dig overblikket — den fulde rapport indeholder præcise lovhenvisninger og en konkret handlingsplan.
      </Text>

      <CTAButton href={reportUrl}>Se din rapport</CTAButton>

      {/* Upsell-boks */}
      <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '20px 24px', margin: '8px 0 24px 0' }}>
        <Text style={{ fontWeight: 'bold', color: BRAND.primary, fontSize: '15px', marginTop: 0, marginBottom: '8px' }}>
          Hvad den fulde rapport indeholder:
        </Text>
        <Text style={{ color: BRAND.text, fontSize: '14px', lineHeight: '1.8', marginBottom: '16px' }}>
          {'✓ Detaljeret analyse af alle fund med lovhenvisninger'}<br />
          {'✓ Links direkte til Retsinformation.dk'}<br />
          {'✓ Prioriteret handlingsplan — hvad gør du først?'}<br />
          {'✓ PDF-download til arkivering'}
        </Text>
        <Link
          href={`${reportUrl}&upgrade=true`}
          style={{ backgroundColor: BRAND.accent, color: '#FFFFFF', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', textDecoration: 'none', display: 'inline-block' }}
        >
          Lås op for fuld rapport — 499 kr.
        </Link>
      </div>

      <Text style={{ fontSize: '13px', color: BRAND.muted, lineHeight: '1.6' }}>
        Har du spørgsmål? Skriv til os på kontakt@retsklar.dk
      </Text>
    </EmailLayout>
  );
}

export default WelcomeEmail;
