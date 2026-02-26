import { Button, Heading, Link, Section, Text } from '@react-email/components';
import {
  NurtureBase,
  paragraph,
  heading2,
  primaryButton,
  tipBox,
  lawRef,
  ctaBox,
  listItem,
} from './nurture-base';

interface Nurture4Props {
  reportUrl: string;
  unsubscribeUrl: string;
}

export function Nurture4Expertise({ reportUrl, unsubscribeUrl }: Nurture4Props) {
  return (
    <NurtureBase
      preview="Ansættelsesbevis i 2026 — det nye du skal vide"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading as="h2" style={{ fontSize: '22px', color: '#1E3A5F', margin: '0 0 16px' }}>
        Ansættelsesbevis i 2026 &mdash; det nye du skal vide
      </Heading>

      <Text style={paragraph}>
        Ansættelsesbevisloven (der erstattede den tidligere ansættelsesbevislov i
        2023) stiller klare krav til, hvad dine medarbejdere skal have på skrift.
        Her er en kort guide.
      </Text>

      <Heading as="h3" style={heading2}>
        5 ting dit ansættelsesbevis SKAL indeholde
      </Heading>

      <Text style={listItem}>
        <strong>1. Løn og tillæg</strong> &mdash; Grundløn, pension, bonus og andre
        løndele skal specificeres.
      </Text>

      <Text style={listItem}>
        <strong>2. Arbejdstid</strong> &mdash; Normal ugentlig arbejdstid, og om
        der kan forekomme overarbejde.
      </Text>

      <Text style={listItem}>
        <strong>3. Prøvetid</strong> &mdash; Hvis der er prøvetid, skal varigheden
        og vilkårene fremgå tydeligt.
      </Text>

      <Text style={listItem}>
        <strong>4. Opsigelsesvarsel</strong> &mdash; Begge parters opsigelsesvarsel
        skal angives.
      </Text>

      <Text style={listItem}>
        <strong>5. Ret til uddannelse</strong> &mdash; Nyt krav! Hvis virksomheden
        tilbyder uddannelse, skal vilkårene beskrives.
      </Text>

      <Text style={lawRef}>
        Ansættelsesbevisloven &sect; 3 (Oplysningspligt) + &sect; 4 (Frister)
      </Text>

      <Section style={tipBox}>
        <Text style={{ ...paragraph, margin: '0 0 8px', fontWeight: '600' as const }}>
          Frist for udlevering
        </Text>
        <Text style={{ ...paragraph, margin: '0' }}>
          Centrale vilkår (løn, arbejdstid, startdato) skal udleveres senest
          <strong> 7 kalenderdage</strong> efter ansættelsens start. Øvrige vilkår
          inden for <strong>1 måned</strong>.
        </Text>
      </Section>

      <Text style={paragraph}>
        <strong>Konsekvens ved mangler:</strong> Medarbejderen kan kræve en
        godtgørelse på op til 13 ugers løn. Ved grove eller forsætlige mangler
        kan godtgørelsen stige yderligere.
      </Text>

      <Text style={paragraph}>
        Vil du læse mere?{' '}
        <Link
          href="https://retsklar.dk/blog/ansaettelsesbevis-krav-2026"
          style={{ color: '#2563eb', textDecoration: 'underline' }}
        >
          Læs vores fulde guide til ansættelsesbeviset
        </Link>
      </Text>

      <Section style={ctaBox}>
        <Text style={{ ...paragraph, margin: '0 0 16px' }}>
          Tjek om dine ansættelsesforhold er compliant
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

export default Nurture4Expertise;
