import { Button, Heading, Hr, Link, Section, Text } from '@react-email/components';
import {
  NurtureBase,
  paragraph,
  secondaryButton,
  ctaBox,
} from './nurture-base';
import { PRICES } from '@/config/constants';

interface Nurture5Props {
  reportUrl: string;
  checkoutUrl: string;
  scoreLevel: string;
  issueCount: number;
  unsubscribeUrl: string;
}

export function Nurture5Final({
  reportUrl,
  checkoutUrl,
  scoreLevel,
  issueCount,
  unsubscribeUrl,
}: Nurture5Props) {
  return (
    <NurtureBase
      preview="Din juridiske rapport venter stadig"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading as="h2" style={{ fontSize: '22px', color: '#1E3A5F', margin: '0 0 16px' }}>
        Din juridiske rapport venter stadig
      </Heading>

      <Text style={paragraph}>
        For ca. 2 uger siden fik du et overblik over din virksomheds juridiske
        situation hos Retsklar. Vi ville lige minde dig om dine resultater.
      </Text>

      <Section
        style={{
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center' as const,
          margin: '24px 0',
        }}
      >
        <Text style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px' }}>
          Din vurdering
        </Text>
        <Text style={{ fontSize: '28px', fontWeight: '700' as const, color: '#1E3A5F', margin: '0 0 8px' }}>
          {scoreLevel}
        </Text>
        <Text style={{ fontSize: '15px', color: '#4b5563', margin: '0' }}>
          {issueCount} {issueCount === 1 ? 'fund' : 'fund'} der kræver opmærksomhed
        </Text>
      </Section>

      <Text style={paragraph}>
        De fleste af de mangler vi fandt kan løses på under en uge. Og jo
        hurtigere du handler, jo mindre er risikoen for bøder, godtgørelser
        eller tvister.
      </Text>

      <Section style={ctaBox}>
        <Text style={{ ...paragraph, fontWeight: '600' as const, margin: '0 0 8px' }}>
          Se din fulde rapport med handlingsplan
        </Text>
        <Text style={{ ...paragraph, margin: '0 0 16px', fontSize: '14px' }}>
          Detaljerede lovhenvisninger, prioriteret handlingsplan og PDF-download
{`— ${PRICES.full.label}.`}
        </Text>
        <Button style={secondaryButton} href={checkoutUrl}>
          Se den fulde rapport
        </Button>
      </Section>

      <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />

      <Text style={paragraph}>
        <strong>PS:</strong> Har du brug for personlig hjælp? Send os en mail
        på{' '}
        <Link
          href="mailto:kontakt@retsklar.dk"
          style={{ color: '#2563eb', textDecoration: 'underline' }}
        >
          kontakt@retsklar.dk
        </Link>
        {' '}&mdash; vi svarer inden for 24 timer.
      </Text>

      <Text style={{ ...paragraph, fontSize: '14px', color: '#6b7280' }}>
        Med venlig hilsen,
        <br />
        Philip fra Retsklar
      </Text>
    </NurtureBase>
  );
}

export default Nurture5Final;
