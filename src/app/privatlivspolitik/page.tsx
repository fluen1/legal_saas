import { LegalPageLayout } from '@/components/shared/LegalPageLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privatlivspolitik — Retsklar',
  description: 'Læs om hvordan Retsklar behandler dine personoplysninger.',
};

export default function PrivatlivspolitikPage() {
  return (
    <LegalPageLayout title="Privatlivspolitik" lastUpdated="26. februar 2026">
      <section>
        <h2>1. Dataansvarlig</h2>
        <p>
          Retsklar<br />
          C/O Erhvervsstyrelsen, Langelinie All&eacute; 17<br />
          CVR-nr.: 42767107<br />
          Email: <a href="mailto:kontakt@retsklar.dk">kontakt@retsklar.dk</a>
        </p>
        <p>
          Vi er dataansvarlig for behandlingen af de personoplysninger, vi modtager om dig.
          Har du spørgsmål til vores behandling af dine personoplysninger, er du velkommen til
          at kontakte os.
        </p>
      </section>

      <section>
        <h2>2. Hvilke personoplysninger behandler vi?</h2>
        <p>Vi behandler følgende kategorier af personoplysninger:</p>

        <p><strong>Når du bruger vores juridiske helbredstjek:</strong></p>
        <ul>
          <li>Email-adresse</li>
          <li>Virksomhedsnavn og branche</li>
          <li>Dine svar på spørgsmål om virksomhedens juridiske forhold (GDPR, ansættelse, selskab, kontrakter mv.)</li>
        </ul>

        <p><strong>Når du køber en rapport:</strong></p>
        <ul>
          <li>Navn og email-adresse</li>
          <li>Betalingsoplysninger (behandles af Stripe — vi modtager ikke dine kortoplysninger)</li>
        </ul>

        <p><strong>Når du downloader en gratis ressource:</strong></p>
        <ul>
          <li>Navn og email-adresse</li>
        </ul>

        <p><strong>Tekniske oplysninger:</strong></p>
        <ul>
          <li>IP-adresse, browsertype og enhedsoplysninger (via cookies, se vores <a href="/cookiepolitik">cookiepolitik</a>)</li>
        </ul>
      </section>

      <section>
        <h2>3. Formål og retsgrundlag</h2>
        <table>
          <thead>
            <tr>
              <th>Formål</th>
              <th>Retsgrundlag (GDPR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Levere dit juridiske helbredstjek og rapport</td>
              <td>Art. 6(1)(b) — opfyldelse af aftale</td>
            </tr>
            <tr>
              <td>Behandle betaling via Stripe</td>
              <td>Art. 6(1)(b) — opfyldelse af aftale</td>
            </tr>
            <tr>
              <td>Sende dig din rapport og kvittering på email</td>
              <td>Art. 6(1)(b) — opfyldelse af aftale</td>
            </tr>
            <tr>
              <td>Sende juridiske tips og nurture-emails</td>
              <td>Art. 6(1)(a) — samtykke</td>
            </tr>
            <tr>
              <td>Forbedre vores tjeneste og fejlretning</td>
              <td>Art. 6(1)(f) — legitim interesse</td>
            </tr>
            <tr>
              <td>Overholde bogføringsloven (transaktionsdata)</td>
              <td>Art. 6(1)(c) — retlig forpligtelse</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>4. AI-behandling af dine data</h2>
        <p>Din rapport genereres ved hjælp af kunstig intelligens (AI). Det indebærer:</p>
        <ul>
          <li>Dine svar fra helbredstjekket sendes til en AI-model (Anthropic Claude) til analyse</li>
          <li>AI&apos;en sammenholder dine svar med gældende dansk lovgivning og genererer en rapport</li>
          <li>Dine data bruges <strong>ikke</strong> til at træne AI-modeller</li>
          <li>Analysen er automatiseret, men udgør ikke juridisk rådgivning (se vores <a href="/handelsbetingelser">handelsbetingelser</a>)</li>
        </ul>
      </section>

      <section>
        <h2>5. Modtagere af personoplysninger</h2>
        <p>Vi deler dine personoplysninger med følgende databehandlere:</p>
        <table>
          <thead>
            <tr>
              <th>Leverandør</th>
              <th>Formål</th>
              <th>Lokation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Vercel Inc.</td>
              <td>Hosting af hjemmeside og API</td>
              <td>EU/USA (EU Standard Contractual Clauses)</td>
            </tr>
            <tr>
              <td>Supabase Inc.</td>
              <td>Database og lagring</td>
              <td>EU</td>
            </tr>
            <tr>
              <td>Stripe Inc.</td>
              <td>Betalingshåndtering</td>
              <td>EU/USA (EU Standard Contractual Clauses)</td>
            </tr>
            <tr>
              <td>Resend Inc.</td>
              <td>Afsendelse af emails</td>
              <td>USA (EU Standard Contractual Clauses)</td>
            </tr>
            <tr>
              <td>Anthropic PBC</td>
              <td>AI-analyse af helbredstjek</td>
              <td>USA (EU Standard Contractual Clauses)</td>
            </tr>
          </tbody>
        </table>
        <p>Vi har indgået databehandleraftaler med alle ovenstående leverandører.</p>
      </section>

      <section>
        <h2>6. Overførsel til tredjelande</h2>
        <p>
          Visse af vores databehandlere er baseret i USA. Overførsler sker på grundlag af
          EU-Kommissionens standardkontraktbestemmelser (Standard Contractual Clauses) jf.
          GDPR Art. 46(2)(c).
        </p>
      </section>

      <section>
        <h2>7. Opbevaring og sletning</h2>
        <table>
          <thead>
            <tr>
              <th>Datatype</th>
              <th>Opbevaringsperiode</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Helbredstjek-svar og rapport</td>
              <td>12 måneder efter generering</td>
            </tr>
            <tr>
              <td>Email til nurture-sekvens</td>
              <td>Indtil du afmelder dig</td>
            </tr>
            <tr>
              <td>Betalingsdata (Stripe)</td>
              <td>5 år (bogføringsloven)</td>
            </tr>
            <tr>
              <td>Tekniske logfiler</td>
              <td>30 dage</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>8. Dine rettigheder</h2>
        <p>Du har følgende rettigheder efter GDPR:</p>
        <ul>
          <li><strong>Indsigt</strong> (Art. 15) — få at vide hvilke data vi har om dig</li>
          <li><strong>Berigtigelse</strong> (Art. 16) — ret forkerte oplysninger</li>
          <li><strong>Sletning</strong> (Art. 17) — bed om at få dine data slettet</li>
          <li><strong>Begrænsning</strong> (Art. 18) — begræns vores behandling</li>
          <li><strong>Dataportabilitet</strong> (Art. 20) — modtag dine data i et maskinlæsbart format</li>
          <li><strong>Indsigelse</strong> (Art. 21) — gør indsigelse mod behandling baseret på legitim interesse</li>
          <li><strong>Tilbagetrækning af samtykke</strong> — du kan til enhver tid afmelde dig nurture-emails via linket i bunden af hver email</li>
        </ul>
        <p>Kontakt os på <a href="mailto:kontakt@retsklar.dk">kontakt@retsklar.dk</a> for at udøve dine rettigheder. Vi svarer inden 30 dage.</p>
      </section>

      <section>
        <h2>9. Klage</h2>
        <p>Du har ret til at indgive en klage til Datatilsynet:</p>
        <p>
          Datatilsynet<br />
          Carl Jacobsens Vej 35<br />
          2500 Valby<br />
          Tlf.: 33 19 32 00<br />
          <a href="mailto:dt@datatilsynet.dk">dt@datatilsynet.dk</a><br />
          <a href="https://www.datatilsynet.dk" target="_blank" rel="noopener noreferrer">www.datatilsynet.dk</a>
        </p>
      </section>

      <section>
        <h2>10. Ændringer</h2>
        <p>
          Vi opdaterer denne privatlivspolitik løbende. Ved væsentlige ændringer orienterer vi
          dig via email.
        </p>
      </section>
    </LegalPageLayout>
  );
}
