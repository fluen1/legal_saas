import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

type ScoreLevel = 'red' | 'yellow' | 'green';

interface WelcomeEmailProps {
  name?: string;
  reportUrl: string;
  score: ScoreLevel;
  issueCount: number;
  upsellUrl: string;
}

const SCORE_CONFIG: Record<ScoreLevel, { label: string; color: string; emoji: string }> = {
  green: { label: 'God stand', color: '#22C55E', emoji: '✅' },
  yellow: { label: 'Bør forbedres', color: '#F59E0B', emoji: '⚠️' },
  red: { label: 'Kritisk', color: '#EF4444', emoji: '🔴' },
};

export function WelcomeEmail({
  name,
  reportUrl,
  score,
  issueCount,
  upsellUrl,
}: WelcomeEmailProps) {
  const greeting = name ? `Hej ${name}` : 'Hej der';
  const config = SCORE_CONFIG[score];

  return (
    <Html>
      <Head />
      <Preview>{`Din Retsklar-rapport er klar — ${config.label}`}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>Retsklar</Heading>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={heading}>
              {greeting},
            </Heading>

            <Text style={paragraph}>
              Tak fordi du brugte Retsklar. Vi har analyseret din virksomheds
              juridiske status, og din rapport er nu klar.
            </Text>

            <Section style={scoreSection}>
              <Text style={scoreLabel}>Din vurdering</Text>
              <Text style={{ ...scoreValue, color: config.color }}>
                {config.emoji} {config.label}
              </Text>
              <Text style={scoreSubtext}>
                Vi fandt <strong>{String(issueCount)}</strong>{' '}
                {issueCount === 1 ? 'område' : 'områder'} der kræver
                opmærksomhed
              </Text>
            </Section>

            <Section style={buttonSection}>
              <Button style={primaryButton} href={reportUrl}>
                Se din rapport
              </Button>
            </Section>

            <Hr style={divider} />

            <Section style={upsellSection}>
              <Heading as="h3" style={upsellHeading}>
                Vil du have den fulde rapport?
              </Heading>
              <Text style={paragraph}>
                Lås op for den fulde rapport med detaljerede lovhenvisninger og
                en konkret handlingsplan for kun <strong>499 kr</strong>.
              </Text>
              <Button style={secondaryButton} href={upsellUrl}>
                Lås op for fuld rapport
              </Button>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              {`© ${new Date().getFullYear()} Retsklar.dk — Alle rettigheder forbeholdes.`}
            </Text>
            <Link href="#" style={footerLink}>
              Afmeld emails
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: '#f4f4f5',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: '0',
  padding: '0',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
};

const header = {
  backgroundColor: '#1E3A5F',
  padding: '24px 32px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700' as const,
  margin: '0',
};

const content = {
  padding: '32px',
};

const heading = {
  fontSize: '22px',
  color: '#1E3A5F',
  margin: '0 0 16px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 16px',
};

const scoreSection = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const scoreLabel = {
  fontSize: '14px',
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
};

const scoreValue = {
  fontSize: '32px',
  fontWeight: '700' as const,
  margin: '0 0 8px',
};

const scoreSubtext = {
  fontSize: '15px',
  color: '#4b5563',
  margin: '0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const primaryButton = {
  backgroundColor: '#1E3A5F',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600' as const,
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const upsellSection = {
  backgroundColor: '#eff6ff',
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid #bfdbfe',
};

const upsellHeading = {
  fontSize: '18px',
  color: '#1E3A5F',
  margin: '0 0 12px',
};

const secondaryButton = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
};

const footer = {
  padding: '24px 32px',
  textAlign: 'center' as const,
  backgroundColor: '#f9fafb',
};

const footerText = {
  fontSize: '13px',
  color: '#9ca3af',
  margin: '0 0 8px',
};

const footerLink = {
  fontSize: '13px',
  color: '#9ca3af',
  textDecoration: 'underline',
};

export default WelcomeEmail;
