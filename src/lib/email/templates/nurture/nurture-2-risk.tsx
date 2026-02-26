import { Button, Heading, Section, Text } from '@react-email/components';
import {
  NurtureBase,
  paragraph,
  heading2,
  primaryButton,
  warningBox,
  lawRef,
  ctaBox,
} from './nurture-base';

interface Nurture2Props {
  reportUrl: string;
  unsubscribeUrl: string;
}

export function Nurture2Risk({ reportUrl, unsubscribeUrl }: Nurture2Props) {
  return (
    <NurtureBase
      preview="Hvad koster det at mangle en ejeraftale?"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading as="h2" style={{ fontSize: '22px', color: '#1E3A5F', margin: '0 0 16px' }}>
        Hvad koster det at mangle en ejeraftale?
      </Heading>

      <Text style={paragraph}>
        Forestil dig dette scenarie: Din medstifter vil forlade virksomheden. I har
        aldrig lavet en ejeraftale. Hvad sker der nu?
      </Text>

      <Heading as="h3" style={heading2}>
        Uden en ejeraftale kan det betyde:
      </Heading>

      <Text style={paragraph}>
        <strong>Ingen aftalt værdiansættelse.</strong> Hvem bestemmer, hvad
        anparterne er værd? Uden en aftalt metode (f.eks. revisorværdiansættelse)
        kan I bruge måneder &mdash; og hundredtusinder af kroner &mdash; på at
        blive enige.
      </Text>

      <Text style={paragraph}>
        <strong>Ingen konkurrenceklausul.</strong> Din tidligere partner kan starte
        en konkurrerende virksomhed og tage jeres kunder med sig. Dagen efter.
      </Text>

      <Text style={paragraph}>
        <strong>Ingen minoritetsbeskyttelse.</strong> Hvis du ejer under 50%, har
        du i princippet ingen kontrol over beslutninger om udbytte, nyemission
        eller salg af virksomheden.
      </Text>

      <Section style={warningBox}>
        <Text style={{ ...paragraph, margin: '0', fontWeight: '600' as const }}>
          Det handler ikke om mistillid
        </Text>
        <Text style={{ ...paragraph, margin: '8px 0 0' }}>
          En ejeraftale er nemmest at lave, når alle stadig er enige. Tænk på den
          som en forsikring &mdash; du håber aldrig at få brug for den, men du er
          glad for den, når situationen opstår.
        </Text>
      </Section>

      <Text style={lawRef}>
        Selskabsloven &sect;&sect; 25-33 (Kapitalejere og rettigheder),
        &sect;&sect; 50-55 (Generalforsamling og beslutninger)
      </Text>

      <Text style={paragraph}>
        Selskabsloven indeholder grundregler, men de dækker sjældent det vigtigste:
        forkøbsret, drag-along/tag-along, deadlock-mekanismer og udbyttepolitik.
        Det kræver en ejeraftale.
      </Text>

      <Section style={ctaBox}>
        <Text style={{ ...paragraph, fontWeight: '600' as const, margin: '0 0 8px' }}>
          Mangler din virksomhed en ejeraftale?
        </Text>
        <Text style={{ ...paragraph, margin: '0 0 16px' }}>
          Se hvad din virksomhed specifikt mangler &mdash; baseret på dit
          helbredstjek.
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

export default Nurture2Risk;
