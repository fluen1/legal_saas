import { Text } from '@react-email/components';
import { EmailLayout, CTAButton, BRAND } from './_layout';

interface Nurture3Props {
  name?: string;
  reportId: string;
  issueCount: number;
  unsubscribeUrl: string;
}

export function Nurture3Value({ name, reportId, issueCount, unsubscribeUrl }: Nurture3Props) {
  const greeting = name ? `Hej ${name}` : 'Hej';

  return (
    <EmailLayout preview="Hvad indeholder den fulde Retsklar-rapport?" unsubscribeUrl={unsubscribeUrl}>
      <Text style={{ fontSize: '20px', fontWeight: 'bold', color: BRAND.text, marginBottom: '8px' }}>
        {greeting},
      </Text>
      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Vi fandt {issueCount} problemområder i din virksomhed. Her er hvad den fulde rapport viser dig — og hvad andre virksomhedsejere brugte den til:
      </Text>

      {/* Eksempler */}
      <div style={{ backgroundColor: '#F0FDF4', borderRadius: '6px', padding: '16px 20px', margin: '16px 0' }}>
        <Text style={{ fontWeight: 'bold', color: BRAND.green, fontSize: '13px', marginTop: 0, marginBottom: '8px' }}>
          EKSEMPEL — IT-konsulent, 8 ansatte
        </Text>
        <Text style={{ color: BRAND.text, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
          Opdagede manglende ansættelsesbevis for 3 medarbejdere (ansættelsesbevisloven § 3). Fik udstedt korrekte beviser inden en planlagt revision.
        </Text>
      </div>

      <div style={{ backgroundColor: '#EFF6FF', borderRadius: '6px', padding: '16px 20px', margin: '16px 0' }}>
        <Text style={{ fontWeight: 'bold', color: BRAND.accent, fontSize: '13px', marginTop: 0, marginBottom: '8px' }}>
          EKSEMPEL — E-commerce startup, 3 ejere
        </Text>
        <Text style={{ color: BRAND.text, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
          Manglende handelsvilkår og fortrydelsesretsformular (købelovens § 24a). Tilpassede inden første store kampagne.
        </Text>
      </div>

      {/* Hvad du får */}
      <Text style={{ fontWeight: 'bold', color: BRAND.text, fontSize: '15px', marginBottom: '8px' }}>
        Hvad du får i den fulde rapport:
      </Text>
      <Text style={{ color: BRAND.text, fontSize: '14px', lineHeight: '1.8' }}>
        {'✓ Detaljeret analyse af alle fund'}<br />
        {'✓ Direkte links til Retsinformation.dk (præcise lovparagraffer)'}<br />
        {'✓ Prioriteret handlingsplan — hvad er mest kritisk?'}<br />
        {'✓ PDF til arkivering og dokumentation'}
      </Text>

      <CTAButton href={`https://retsklar.dk/helbredstjek/resultat?id=${reportId}&upgrade=true`}>
        Lås op for fuld rapport — 499 kr.
      </CTAButton>

      <Text style={{ fontSize: '13px', color: BRAND.muted, textAlign: 'center' }}>
        Ingen abonnement. Én rapport, én betaling.
      </Text>
    </EmailLayout>
  );
}

export default Nurture3Value;
