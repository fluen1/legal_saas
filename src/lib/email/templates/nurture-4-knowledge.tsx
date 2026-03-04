import { Text, Link } from '@react-email/components';
import { EmailLayout, CTAButton, BRAND } from './_layout';

interface Nurture4Props {
  name?: string;
  reportId: string;
  unsubscribeUrl: string;
}

export function Nurture4Knowledge({ name, reportId, unsubscribeUrl }: Nurture4Props) {
  const greeting = name ? `Hej ${name}` : 'Hej';

  return (
    <EmailLayout preview="Ansættelsesbevisloven 2026 — 5 ting dit ansættelsesbevis skal indeholde" unsubscribeUrl={unsubscribeUrl}>
      <Text style={{ fontSize: '20px', fontWeight: 'bold', color: BRAND.text, marginBottom: '8px' }}>
        {greeting},
      </Text>
      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Ansættelsesbevisloven blev skærpet i 2023 som følge af EU&apos;s arbejdsvilkårsdirektiv.
        Fra 2024 gælder de nye krav alle medarbejdere — også dem med ældre kontrakter.
      </Text>

      <Text style={{ fontWeight: 'bold', color: BRAND.text, fontSize: '15px', marginBottom: '8px' }}>
        5 ting dit ansættelsesbevis skal indeholde (§ 3):
      </Text>
      <Text style={{ color: BRAND.text, fontSize: '14px', lineHeight: '1.9' }}>
        <strong>1.</strong> Identitetsoplysninger — virksomhedens CVR, medarbejderens CPR/adresse<br />
        <strong>2.</strong> Arbejdsstedets placering — specifik adresse eller &quot;skiftende steder&quot;<br />
        <strong>3.</strong> Stillingsbetegnelse og -beskrivelse — ikke blot &quot;konsulent&quot;<br />
        <strong>4.</strong> Startdato og ved tidsbegrænsning: slutdato + begrundelse<br />
        <strong>5.</strong> Opsigelsesvarsel — jf. funktionærloven eller overenskomst
      </Text>

      <Text style={{ fontSize: '14px', color: BRAND.text, lineHeight: '1.6' }}>
        Manglende elementer kan give bøde til virksomheden (ansættelsesbevisloven § 6).
        Tjek om din virksomheds ansættelsesbevis lever op til kravene.
      </Text>

      <CTAButton href={`https://retsklar.dk/helbredstjek/resultat?id=${reportId}&upgrade=true`}>
        Tjek om dine ansættelsesforhold er compliant
      </CTAButton>

      <Text style={{ fontSize: '13px', color: BRAND.muted }}>
        <Link href="https://www.retsinformation.dk/eli/lta/2023/672" style={{ color: BRAND.muted }}>
          Kilde: Ansættelsesbevisloven (LBK nr. 672, 2023) — Retsinformation.dk
        </Link>
      </Text>
    </EmailLayout>
  );
}

export default Nurture4Knowledge;
