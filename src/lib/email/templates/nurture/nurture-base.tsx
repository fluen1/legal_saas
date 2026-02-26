import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface NurtureBaseProps {
  preview: string;
  unsubscribeUrl: string;
  children: React.ReactNode;
}

export function NurtureBase({ preview, unsubscribeUrl, children }: NurtureBaseProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>Retsklar</Heading>
          </Section>
          <Section style={content}>{children}</Section>
          <Section style={footer}>
            <Text style={footerText}>
              {`\u00a9 ${new Date().getFullYear()} Retsklar.dk \u2014 Juridisk compliance for virksomheder`}
            </Text>
            <Link href={unsubscribeUrl} style={footerLink}>
              Afmeld emails
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const body = {
  backgroundColor: '#f4f4f5',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: '0',
  padding: '0',
};

export const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
};

export const header = {
  backgroundColor: '#1E3A5F',
  padding: '24px 32px',
  textAlign: 'center' as const,
};

export const headerTitle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700' as const,
  margin: '0',
};

export const content = {
  padding: '32px',
};

export const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 16px',
};

export const heading2 = {
  fontSize: '20px',
  color: '#1E3A5F',
  margin: '24px 0 12px',
  fontWeight: '700' as const,
};

export const heading3 = {
  fontSize: '17px',
  color: '#1E3A5F',
  margin: '20px 0 8px',
  fontWeight: '600' as const,
};

export const primaryButton = {
  backgroundColor: '#1E3A5F',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600' as const,
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
};

export const secondaryButton = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
};

export const tipBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '16px 20px',
  border: '1px solid #bbf7d0',
  margin: '16px 0',
};

export const warningBox = {
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  padding: '16px 20px',
  border: '1px solid #fde68a',
  margin: '16px 0',
};

export const ctaBox = {
  backgroundColor: '#eff6ff',
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid #bfdbfe',
  textAlign: 'center' as const,
  margin: '24px 0',
};

export const lawRef = {
  fontSize: '14px',
  color: '#6b7280',
  fontStyle: 'italic' as const,
  margin: '4px 0 12px',
};

export const listItem = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 8px',
  paddingLeft: '8px',
};

export const footer = {
  padding: '24px 32px',
  textAlign: 'center' as const,
  backgroundColor: '#f9fafb',
};

export const footerText = {
  fontSize: '13px',
  color: '#9ca3af',
  margin: '0 0 8px',
};

export const footerLink = {
  fontSize: '13px',
  color: '#9ca3af',
  textDecoration: 'underline',
};
