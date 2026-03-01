import { Button, Heading, Section, Text } from '@react-email/components';
import {
  NurtureBase,
  paragraph,
  heading2,
  secondaryButton,
  tipBox,
  ctaBox,
  listItem,
} from './nurture-base';
import { PRICES } from '@/config/constants';

interface Nurture3Props {
  reportUrl: string;
  checkoutUrl: string;
  unsubscribeUrl: string;
}

export function Nurture3SocialProof({ reportUrl, checkoutUrl, unsubscribeUrl }: Nurture3Props) {
  return (
    <NurtureBase
      preview="Sådan bruger andre virksomhedsejere Retsklar"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading as="h2" style={{ fontSize: '22px', color: '#1E3A5F', margin: '0 0 16px' }}>
        Sådan bruger andre virksomhedsejere Retsklar
      </Heading>

      <Text style={paragraph}>
        Hundredvis af danske virksomheder har allerede fået et juridisk helbredstjek.
        Her er nogle eksempler på, hvad vi har hjulpet med at finde:
      </Text>

      <Section style={tipBox}>
        <Text style={{ ...paragraph, margin: '0 0 8px', fontWeight: '600' as const }}>
          IT-konsulent med 8 ansatte
        </Text>
        <Text style={{ ...paragraph, margin: '0' }}>
          &quot;Opdagede at vores ansættelseskontrakter manglede 3 obligatoriske
          vilkår efter den nye ansættelsesbevislov. Det kunne have kostet op til
          13 ugers løn i godtgørelse per medarbejder.&quot;
        </Text>
      </Section>

      <Section style={tipBox}>
        <Text style={{ ...paragraph, margin: '0 0 8px', fontWeight: '600' as const }}>
          Webshop-ejer
        </Text>
        <Text style={{ ...paragraph, margin: '0' }}>
          &quot;Fandt ud af, at vores cookie-banner ikke overholdt loven. Vi havde
          kun en &apos;Accepter&apos;-knap, men brugerne skal have et reelt valg.
          Vi rettede det på en dag.&quot;
        </Text>
      </Section>

      <Section style={tipBox}>
        <Text style={{ ...paragraph, margin: '0 0 8px', fontWeight: '600' as const }}>
          ApS med 2 ejere
        </Text>
        <Text style={{ ...paragraph, margin: '0' }}>
          &quot;Vi havde ingen ejeraftale. Retsklar viste os, at vi var sårbare
          ved uenighed. Vi fik lavet en aftale inden for 2 uger.&quot;
        </Text>
      </Section>

      <Heading as="h3" style={heading2}>
        Hvad indeholder den fulde rapport?
      </Heading>

      <Text style={listItem}>
        &#10003; Detaljeret analyse af alle 5 juridiske områder
      </Text>
      <Text style={listItem}>
        &#10003; Præcise lovhenvisninger med links til retsinformation.dk
      </Text>
      <Text style={listItem}>
        &#10003; Prioriteret handlingsplan med deadlines
      </Text>
      <Text style={listItem}>
        &#10003; PDF-download til arkivering
      </Text>

      <Section style={ctaBox}>
        <Text style={{ ...paragraph, fontWeight: '600' as const, margin: '0 0 16px' }}>
{`Lås op for din fulde rapport — ${PRICES.full.label}`}
        </Text>
        <Button style={secondaryButton} href={checkoutUrl}>
          Se den fulde rapport
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

export default Nurture3SocialProof;
