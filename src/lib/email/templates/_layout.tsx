import {
  Html, Head, Body, Container, Section,
  Text, Link, Hr, Preview
} from '@react-email/components';
import { COMPANY } from '@/config/constants';

interface LayoutProps {
  preview: string;
  unsubscribeUrl: string;
  children: React.ReactNode;
}

export const BRAND = {
  primary: '#1E3A5F',
  accent: '#3B82F6',
  green: '#16A34A',
  yellow: '#CA8A04',
  red: '#DC2626',
  bg: '#F8FAFC',
  text: '#1E293B',
  muted: '#64748B',
};

export function EmailLayout({ preview, unsubscribeUrl, children }: LayoutProps) {
  return (
    <Html lang="da">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: BRAND.bg, fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        {/* Header */}
        <Section style={{ backgroundColor: BRAND.primary, padding: '24px 40px' }}>
          <Text style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>
            Retsklar
          </Text>
          <Text style={{ color: '#93C5FD', fontSize: '12px', margin: '4px 0 0 0' }}>
            Juridisk helbredstjek for virksomheder
          </Text>
        </Section>

        {/* Body */}
        <Container style={{ backgroundColor: '#FFFFFF', maxWidth: '580px', margin: '0 auto', padding: '32px 40px' }}>
          {children}
        </Container>

        {/* Footer */}
        <Section style={{ maxWidth: '580px', margin: '0 auto', padding: '20px 40px' }}>
          <Hr style={{ borderColor: '#E2E8F0', margin: '0 0 16px 0' }} />
          <Text style={{ color: BRAND.muted, fontSize: '11px', textAlign: 'center', margin: 0 }}>
            {COMPANY.name} · CVR: {COMPANY.cvr} · {COMPANY.domain}
          </Text>
          <Text style={{ color: BRAND.muted, fontSize: '11px', textAlign: 'center', margin: '4px 0 0 0' }}>
            <Link href={unsubscribeUrl} style={{ color: BRAND.muted }}>
              Afmeld emails
            </Link>
            {' · '}
            <Link href="https://retsklar.dk/privatlivspolitik" style={{ color: BRAND.muted }}>
              Privatlivspolitik
            </Link>
          </Text>
        </Section>
      </Body>
    </Html>
  );
}

export function CTAButton({ href, children }: { href: string; children: string }) {
  return (
    <Section style={{ textAlign: 'center', margin: '24px 0' }}>
      <Link
        href={href}
        style={{
          backgroundColor: BRAND.primary,
          color: '#FFFFFF',
          padding: '14px 32px',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '15px',
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        {children}
      </Link>
    </Section>
  );
}

export function ScoreBadge({ scoreLevel }: { scoreLevel: 'red' | 'yellow' | 'green' }) {
  const map = {
    red: { label: 'Kritisk', color: BRAND.red, bg: '#FEF2F2' },
    yellow: { label: 'Bør forbedres', color: BRAND.yellow, bg: '#FEFCE8' },
    green: { label: 'God stand', color: BRAND.green, bg: '#F0FDF4' },
  };
  const s = map[scoreLevel];
  return (
    <Section style={{ backgroundColor: s.bg, border: `1px solid ${s.color}`, borderRadius: '6px', padding: '16px 20px', margin: '16px 0' }}>
      <Text style={{ color: s.color, fontWeight: 'bold', fontSize: '16px', margin: 0 }}>
        Status: {s.label}
      </Text>
    </Section>
  );
}
