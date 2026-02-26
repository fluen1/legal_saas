import { LegalPageLayout } from '@/components/shared/LegalPageLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Handelsbetingelser — Retsklar',
  description: 'Handelsbetingelser for køb af juridisk helbredstjek hos Retsklar.',
};

export default function HandelsbetingelserPage() {
  return (
    <LegalPageLayout title="Handelsbetingelser" lastUpdated="26. februar 2026">
      <section>
        <h2>1. Virksomhedsoplysninger</h2>
        <p>
          Retsklar<br />
          C/O Erhvervsstyrelsen, Langelinie All&eacute; 17<br />
          CVR-nr.: 42767107<br />
          Email: <a href="mailto:kontakt@retsklar.dk">kontakt@retsklar.dk</a>
        </p>
      </section>

      <section>
        <h2>2. Produktet</h2>
        <p>Retsklar tilbyder et AI-drevet juridisk helbredstjek for virksomheder. Produktet består af:</p>
        <ul>
          <li><strong>Gratis Mini-Scan (0 kr):</strong> Overordnet juridisk score baseret på 5 spørgsmål. Kræver email-adresse.</li>
          <li><strong>Fuld Rapport (499 kr):</strong> Detaljeret juridisk analyse med lovhenvisninger og handlingsplan.</li>
          <li><strong>Premium (1.499 kr):</strong> Fuld rapport samt 30 minutters personlig opfølgning med juridisk rådgiver.</li>
        </ul>
      </section>

      <section>
        <h2>3. Vigtigt forbehold</h2>
        <p>
          <strong>Retsklar er ikke juridisk rådgivning.</strong> Rapporten er et AI-genereret overblik
          baseret på dine svar og gældende dansk lovgivning. Den erstatter ikke individuel rådgivning
          fra en advokat eller juridisk rådgiver.
        </p>
        <p>
          Rapporten er baseret på de oplysninger, du selv angiver. Jo mere præcise dine svar er, desto
          mere retvisende er resultatet. Vi garanterer ikke, at rapporten er udtømmende eller fejlfri.
        </p>
      </section>

      <section>
        <h2>4. Priser og betaling</h2>
        <p>Alle priser er angivet i danske kroner (DKK) inkl. moms.</p>
        <p>
          Betaling sker via Stripe. Vi modtager ikke dine kortoplysninger — de håndteres direkte af
          Stripe i overensstemmelse med PCI DSS-standarden.
        </p>
      </section>

      <section>
        <h2>5. Levering</h2>
        <p>
          Rapporten leveres digitalt umiddelbart efter betaling og analyse. Den fulde analyse tager
          typisk under 10 minutter. Du modtager adgang til rapporten på skærmen og via email.
        </p>
        <p>
          For Premium-pakken aftales den personlige opfølgning separat via email inden for 5 hverdage
          efter købet.
        </p>
      </section>

      <section>
        <h2>6. Fortrydelsesret</h2>
        <p>
          Da der er tale om digitalt indhold, som leveres umiddelbart efter købet, giver du ved købet
          afkald på din 14-dages fortrydelsesret jf. forbrugeraftalelovens &sect; 18, stk. 2, nr. 13.
        </p>
        <p>Du accepterer dette aktivt i forbindelse med betalingen.</p>
      </section>

      <section>
        <h2>7. Reklamation</h2>
        <p>
          Hvis rapporten indeholder åbenlyse fejl (fx forkerte lovhenvisninger eller manglende analyse
          af et område, du har besvaret spørgsmål om), kan du kontakte os på{' '}
          <a href="mailto:kontakt@retsklar.dk">kontakt@retsklar.dk</a> inden 14 dage. Vi vil da
          vurdere, om du er berettiget til en ny analyse eller hel/delvis refusion.
        </p>
      </section>

      <section>
        <h2>8. Ansvarsbegrænsning</h2>
        <p>
          Retsklars samlede erstatningsansvar er begrænset til det beløb, du har betalt for den
          pågældende rapport. Vi er ikke ansvarlige for indirekte tab, følgeskader eller tab som
          følge af handlinger foretaget på baggrund af rapportens indhold.
        </p>
      </section>

      <section>
        <h2>9. Immaterielle rettigheder</h2>
        <p>
          Rapportens indhold er genereret til dig og må bruges frit internt i din virksomhed.
          Retsklars brand, design, system og metode tilhører Retsklar og må ikke kopieres eller
          videredistribueres.
        </p>
      </section>

      <section>
        <h2>10. Tvister</h2>
        <p>
          Disse handelsbetingelser er undergivet dansk ret. Tvister søges løst i mindelighed. Kan
          enighed ikke opnås, afgøres tvisten ved de danske domstole.
        </p>
        <p>Som forbruger kan du også klage til Nævnenes Hus:</p>
        <p>
          Nævnenes Hus<br />
          Toldboden 2<br />
          8800 Viborg<br />
          <a href="https://www.naevneneshus.dk" target="_blank" rel="noopener noreferrer">www.naevneneshus.dk</a>
        </p>
        <p>
          EU-Kommissionens online klageportal kan også benyttes:{' '}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr/
          </a>
        </p>
      </section>

      <section>
        <h2>11. Ændringer</h2>
        <p>
          Vi forbeholder os retten til at ændre disse handelsbetingelser. Ændringer gælder kun for
          køb foretaget efter ændringsdatoen.
        </p>
      </section>
    </LegalPageLayout>
  );
}
