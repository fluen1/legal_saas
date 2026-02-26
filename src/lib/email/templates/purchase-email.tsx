import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface PurchaseEmailProps {
  name?: string;
  reportUrl: string;
  pdfUrl: string;
  tier: 'full' | 'premium';
  amount: number;
}

const TIER_LABELS: Record<string, string> = {
  full: 'Fuld Rapport',
  premium: 'Premium Rapport',
};

export function PurchaseEmail({
  name,
  reportUrl,
  pdfUrl,
  tier,
  amount,
}: PurchaseEmailProps) {
  const greeting = name ? `Hej ${name}` : 'Hej';
  const isPremium = tier === 'premium';
  const tierLabel = TIER_LABELS[tier] || 'Fuld Rapport';

  return (
    <Html>
      <Head />
      <Preview>Din fulde rapport er klar — Retsklar</Preview>
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
              Tak for dit køb. Din fulde juridiske rapport er nu tilgængelig.
            </Text>

            <Section style={receiptSection}>
              <Text style={receiptLabel}>Kvittering</Text>
              <Text style={receiptItem}>
                <strong>{tierLabel}</strong> — {amount} kr
              </Text>
            </Section>

            <Section style={buttonRow}>
              <Button style={primaryButton} href={reportUrl}>
                Se din rapport
              </Button>
            </Section>

            <Section style={buttonRow}>
              <Button style={secondaryButton} href={pdfUrl}>
                Download PDF
              </Button>
            </Section>

            {isPremium && (
              <>
                <Hr style={divider} />
                <Section style={premiumNotice}>
                  <Heading as="h3" style={premiumHeading}>
                    Personlig opfølgning
                  </Heading>
                  <Text style={paragraph}>
                    Som Premium-kunde kontakter vi dig inden for 24 timer for at
                    aftale din personlige opfølgning med en af vores juridiske
                    rådgivere.
                  </Text>
                </Section>
              </>
            )}
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Retsklar.dk — Alle rettigheder
              forbeholdes.
            </Text>
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

const receiptSection = {
  backgroundColor: '#f0fdf4',
  borderRadius: '12px',
  padding: '20px 24px',
  border: '1px solid #bbf7d0',
  margin: '24px 0',
};

const receiptLabel = {
  fontSize: '12px',
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
};

const receiptItem = {
  fontSize: '18px',
  color: '#1E3A5F',
  margin: '0',
};

const buttonRow = {
  textAlign: 'center' as const,
  margin: '16px 0',
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

const secondaryButton = {
  backgroundColor: '#ffffff',
  color: '#1E3A5F',
  fontSize: '14px',
  fontWeight: '600' as const,
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
  border: '2px solid #1E3A5F',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const premiumNotice = {
  backgroundColor: '#fefce8',
  borderRadius: '12px',
  padding: '20px 24px',
  border: '1px solid #fde68a',
};

const premiumHeading = {
  fontSize: '18px',
  color: '#92400e',
  margin: '0 0 8px',
};

const footer = {
  padding: '24px 32px',
  textAlign: 'center' as const,
  backgroundColor: '#f9fafb',
};

const footerText = {
  fontSize: '13px',
  color: '#9ca3af',
  margin: '0 0 4px',
};

export default PurchaseEmail;
