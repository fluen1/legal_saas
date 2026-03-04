import { Text, Link, Hr } from '@react-email/components';
import { EmailLayout, CTAButton, BRAND } from './_layout';

interface PurchaseEmailProps {
  name?: string;
  email: string;
  reportId: string;
  tier: 'full' | 'premium';
  amount: number; // i kr (allerede divideret fra Stripe ører)
  unsubscribeUrl: string;
}

export function PurchaseEmail({ name, email, reportId, tier, amount, unsubscribeUrl }: PurchaseEmailProps) {
  const greeting = name ? `Hej ${name}` : 'Hej';
  const reportUrl = `https://retsklar.dk/helbredstjek/resultat?id=${reportId}`;
  const pdfUrl = `https://retsklar.dk/api/report/${reportId}/pdf`;
  const tierLabel = tier === 'premium' ? 'Premium (inkl. personlig opfølgning)' : 'Fuld rapport';
  const amountDKK = amount;

  return (
    <EmailLayout preview={`Kvittering — ${tierLabel} — ${amountDKK} kr.`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={{ fontSize: '22px', fontWeight: 'bold', color: BRAND.text, marginBottom: '8px' }}>
        {greeting},
      </Text>
      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Tak for dit køb. Din rapport er klar til dig.
      </Text>

      {/* Kvitterings-boks */}
      <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', padding: '20px 24px', margin: '16px 0' }}>
        <Text style={{ fontWeight: 'bold', color: BRAND.green, fontSize: '15px', marginTop: 0, marginBottom: '12px' }}>
          {'✓ Betaling bekræftet'}
        </Text>
        <Text style={{ color: BRAND.text, fontSize: '14px', margin: '4px 0' }}>
          <strong>Produkt:</strong> {tierLabel}
        </Text>
        <Text style={{ color: BRAND.text, fontSize: '14px', margin: '4px 0' }}>
          <strong>Beløb:</strong> {amountDKK} kr. inkl. moms
        </Text>
        <Text style={{ color: BRAND.text, fontSize: '14px', margin: '4px 0' }}>
          <strong>Email:</strong> {email}
        </Text>
      </div>

      <CTAButton href={reportUrl}>Se din fulde rapport</CTAButton>

      <Text style={{ textAlign: 'center', margin: '0 0 24px 0' }}>
        <Link href={pdfUrl} style={{ color: BRAND.accent, fontSize: '14px' }}>
          Download som PDF
        </Link>
      </Text>

      {tier === 'premium' && (
        <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '6px', padding: '20px 24px', margin: '8px 0 24px 0' }}>
          <Text style={{ fontWeight: 'bold', color: '#C2410C', fontSize: '15px', marginTop: 0, marginBottom: '8px' }}>
            Personlig opfølgning — næste skridt
          </Text>
          <Text style={{ color: BRAND.text, fontSize: '14px', lineHeight: '1.6', marginBottom: 0 }}>
            Vi kontakter dig inden for 1 hverdag på denne email for at aftale din personlige juridiske gennemgang.
          </Text>
        </div>
      )}

      <Hr style={{ borderColor: '#E2E8F0', margin: '24px 0 16px 0' }} />
      <Text style={{ fontSize: '13px', color: BRAND.muted, lineHeight: '1.6' }}>
        Gem denne email som dokumentation for dit køb. Har du spørgsmål? Skriv til os på kontakt@retsklar.dk
      </Text>
    </EmailLayout>
  );
}

export default PurchaseEmail;
