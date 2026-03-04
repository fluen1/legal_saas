import { Text } from '@react-email/components';
import { EmailLayout, CTAButton, BRAND } from './_layout';

interface Nurture2Props {
  name?: string;
  reportId: string;
  unsubscribeUrl: string;
}

export function Nurture2Shareholder({ name, reportId, unsubscribeUrl }: Nurture2Props) {
  const greeting = name ? `Hej ${name}` : 'Hej';

  return (
    <EmailLayout preview="Hvad sker der, når din medstifter vil forlade virksomheden?" unsubscribeUrl={unsubscribeUrl}>
      <Text style={{ fontSize: '20px', fontWeight: 'bold', color: BRAND.text, marginBottom: '16px' }}>
        {greeting},
      </Text>
      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Forestil dig dette scenarie:
      </Text>
      <div style={{ backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '20px 24px', margin: '8px 0 20px 0', borderLeft: `4px solid ${BRAND.primary}` }}>
        <Text style={{ color: BRAND.text, fontSize: '14px', lineHeight: '1.8', margin: 0, fontStyle: 'italic' }}>
          Din medstifter ønsker at forlade virksomheden. Uden en ejeraftale: Hvad er prisen på hans andel?
          Hvem bestemmer det? Kan han starte en konkurrerende virksomhed næste dag?
          Kan han sælge sin andel til hvem som helst — også en konkurrent?
        </Text>
      </div>
      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Uden en ejeraftale afgøres alt dette af Selskabslovens baggrundsprincipper (§§ 25-33) — og det er sjældent til din fordel.
      </Text>
      <Text style={{ fontSize: '14px', color: BRAND.text, lineHeight: '1.8' }}>
        En ejeraftale regulerer typisk:<br />
        <strong>·</strong> Prisfastsættelse ved udtræden (drag-along, tag-along)<br />
        <strong>·</strong> Konkurrenceklausul og kundeklausul<br />
        <strong>·</strong> Forkøbsret — hvem må købe andele<br />
        <strong>·</strong> Deadlock-mekanisme — hvad sker der ved stemmelighed
      </Text>
      <Text style={{ fontSize: '14px', color: BRAND.text, lineHeight: '1.6' }}>
        Hvis Retsklar fandt mangler i din selskabsjuridiske situation, er det sandsynligvis her.
      </Text>
      <CTAButton href={`https://retsklar.dk/helbredstjek/resultat?id=${reportId}&upgrade=true`}>
        Se hvad din rapport fandt om ejerforhold
      </CTAButton>
    </EmailLayout>
  );
}

export default Nurture2Shareholder;
