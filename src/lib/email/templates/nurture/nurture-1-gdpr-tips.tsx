import { Button, Heading, Section, Text } from '@react-email/components';
import {
  NurtureBase,
  paragraph,
  heading2,
  heading3,
  primaryButton,
  tipBox,
  lawRef,
  ctaBox,
} from './nurture-base';

interface Nurture1Props {
  reportUrl: string;
  scoreLevel: string;
  unsubscribeUrl: string;
}

export function Nurture1GdprTips({ reportUrl, scoreLevel, unsubscribeUrl }: Nurture1Props) {
  return (
    <NurtureBase
      preview="3 GDPR-fejl de fleste danske virksomheder laver"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading as="h2" style={{ fontSize: '22px', color: '#1E3A5F', margin: '0 0 16px' }}>
        3 GDPR-fejl de fleste danske virksomheder laver
      </Heading>

      <Text style={paragraph}>
        For et par dage siden lavede du et juridisk helbredstjek af din virksomhed
        hos Retsklar. Vi vil gerne dele 3 af de mest almindelige GDPR-fejl vi ser
        hos danske virksomheder.
      </Text>

      <Heading as="h3" style={heading2}>
        1. Manglende eller forældet privatlivspolitik
      </Heading>
      <Text style={paragraph}>
        Din privatlivspolitik skal klart beskrive, hvordan du indsamler, bruger og
        opbevarer persondata. Den skal opdateres, hver gang din databehandling
        ændrer sig &mdash; f.eks. hvis du begynder at bruge et nyt CRM-system eller
        en ny e-mail-platform.
      </Text>
      <Text style={lawRef}>
        GDPR Art. 13-14 &mdash; Oplysningspligt ved indsamling af persondata
      </Text>

      <Heading as="h3" style={heading2}>
        2. Ingen databehandleraftaler med leverandører
      </Heading>
      <Text style={paragraph}>
        Bruger du cloud-tjenester, email-marketing, hosting eller regnskabssoftware?
        Så behandler dine leverandører sandsynligvis persondata på dine vegne &mdash;
        og du <strong>skal</strong> have en skriftlig databehandleraftale (DPA) med hver
        enkelt af dem.
      </Text>
      <Text style={lawRef}>
        GDPR Art. 28 &mdash; Krav om databehandleraftale
      </Text>

      <Heading as="h3" style={heading2}>
        3. Cookie-consent der kun har &quot;Accept&eacute;r&quot;
      </Heading>
      <Text style={paragraph}>
        Et cookie-banner der kun giver mulighed for at acceptere er ikke lovligt. Brugere
        skal have et reelt valg &mdash; herunder mulighed for at fravælge alle
        ikke-nødvendige cookies. Datatilsynet har skærpet tilsynet med dette område.
      </Text>
      <Text style={lawRef}>
        Cookiebekendtgørelsen + ePrivacy-direktivet
      </Text>

      <Section style={tipBox}>
        <Text style={{ ...paragraph, margin: '0', fontWeight: '600' as const }}>
          Vidste du?
        </Text>
        <Text style={{ ...paragraph, margin: '8px 0 0' }}>
          Datatilsynet kan udstede bøder på op til 4% af den årlige globale omsætning.
          For de fleste SMV&apos;er handler det dog mere om at undgå klager fra kunder
          og medarbejdere.
        </Text>
      </Section>

      <Section style={ctaBox}>
        <Text style={{ ...paragraph, fontWeight: '600' as const, margin: '0 0 8px' }}>
          Din rapport viste: {scoreLevel}
        </Text>
        <Text style={{ ...paragraph, margin: '0 0 16px' }}>
          Vil du se præcis hvad din virksomhed mangler?
        </Text>
        <Button style={primaryButton} href={reportUrl}>
          Se din rapport
        </Button>
      </Section>

      <Text style={{ ...paragraph, fontSize: '14px', color: '#6b7280' }}>
        Med venlig hilsen,
        <br />
        Philip fra Retsklar
      </Text>
    </NurtureBase>
  );
}

export default Nurture1GdprTips;
