import { Text } from '@react-email/components';
import { EmailLayout, CTAButton, ScoreBadge, BRAND } from './_layout';

interface Nurture1Props {
  name?: string;
  reportId: string;
  scoreLevel: 'red' | 'yellow' | 'green';
  issueCount: number;
  unsubscribeUrl: string;
}

export function Nurture1Findings({ name, reportId, scoreLevel, issueCount, unsubscribeUrl }: Nurture1Props) {
  const greeting = name ? `Hej ${name}` : 'Hej';
  const reportUrl = `https://retsklar.dk/helbredstjek/resultat?id=${reportId}&upgrade=true`;

  return (
    <EmailLayout preview={`${issueCount} juridiske huller vi fandt — hvad koster det at ignorere dem?`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={{ fontSize: '20px', fontWeight: 'bold', color: BRAND.text, marginBottom: '8px' }}>
        {greeting},
      </Text>

      <ScoreBadge scoreLevel={scoreLevel} />

      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Vi fandt {issueCount} juridiske problemområder i din virksomhed. Her er tre af de mest typiske fund — og hvad de koster, hvis de ikke håndteres:
      </Text>

      {/* Fund 1 */}
      <div style={{ borderLeft: `3px solid ${BRAND.red}`, paddingLeft: '16px', margin: '20px 0' }}>
        <Text style={{ fontWeight: 'bold', color: BRAND.text, fontSize: '14px', marginTop: 0, marginBottom: '4px' }}>
          1. Manglende eller forældet privatlivspolitik
        </Text>
        <Text style={{ color: BRAND.muted, fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
          GDPR art. 13-14 kræver at du aktivt informerer brugere om databehandling. Bøder: op til 2% af global omsætning (Datatilsynet).
        </Text>
      </div>

      {/* Fund 2 */}
      <div style={{ borderLeft: `3px solid ${BRAND.yellow}`, paddingLeft: '16px', margin: '20px 0' }}>
        <Text style={{ fontWeight: 'bold', color: BRAND.text, fontSize: '14px', marginTop: 0, marginBottom: '4px' }}>
          2. Ingen databehandleraftaler med leverandører
        </Text>
        <Text style={{ color: BRAND.muted, fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
          GDPR art. 28 kræver skriftlig DPA med alle der behandler data på dine vegne (fx regnskabsprogram, CRM, email-system).
        </Text>
      </div>

      {/* Fund 3 */}
      <div style={{ borderLeft: `3px solid ${BRAND.yellow}`, paddingLeft: '16px', margin: '20px 0' }}>
        <Text style={{ fontWeight: 'bold', color: BRAND.text, fontSize: '14px', marginTop: 0, marginBottom: '4px' }}>
          3. Cookie-consent uden valgmulighed
        </Text>
        <Text style={{ color: BRAND.muted, fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
          Cookiebekendtgørelsen kræver at brugere aktivt kan afvise ikke-nødvendige cookies. Kun &quot;Acceptér&quot; er ikke lovligt.
        </Text>
      </div>

      <Text style={{ fontSize: '14px', color: BRAND.text, lineHeight: '1.6' }}>
        Din rapport viste <strong>{issueCount} problemområder</strong>. Vil du se præcis hvad <em>din</em> virksomhed mangler?
      </Text>

      <CTAButton href={reportUrl}>Se din fulde rapport med handlingsplan</CTAButton>
    </EmailLayout>
  );
}

export default Nurture1Findings;
