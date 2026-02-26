import { LegalPageLayout } from '@/components/shared/LegalPageLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookiepolitik — Retsklar',
  description: 'Læs om Retsklars brug af cookies.',
};

export default function CookiepolitikPage() {
  return (
    <LegalPageLayout title="Cookiepolitik" lastUpdated="26. februar 2026">
      <section>
        <h2>1. Hvad er cookies?</h2>
        <p>
          Cookies er små tekstfiler, der gemmes på din enhed, når du besøger en hjemmeside. De bruges
          til at få hjemmesiden til at fungere, huske dine præferencer og indsamle statistik.
        </p>
      </section>

      <section>
        <h2>2. Vores brug af cookies</h2>

        <h3>Nødvendige cookies (kræver ikke samtykke)</h3>
        <table>
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Formål</th>
              <th>Udløber</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Session-cookie</td>
              <td>Holder styr på din session under helbredstjekket</td>
              <td>Ved session-slut</td>
            </tr>
            <tr>
              <td>Cookie-samtykke</td>
              <td>Husker dit cookie-valg</td>
              <td>12 måneder</td>
            </tr>
          </tbody>
        </table>
        <p>Disse cookies er nødvendige for, at hjemmesiden fungerer. De kan ikke fravælges.</p>

        <h3>Statistik-cookies (kræver samtykke)</h3>
        <p>
          Vi bruger <strong>ingen</strong> tredjeparts statistik-cookies (Google Analytics e.l.) på
          nuværende tidspunkt.
        </p>
        <p>
          Hvis vi fremover implementerer statistik-cookies, opdaterer vi denne politik og beder om
          dit samtykke.
        </p>

        <h3>Marketing-cookies</h3>
        <p>Vi bruger <strong>ingen</strong> marketing- eller tracking-cookies.</p>
      </section>

      <section>
        <h2>3. Tredjeparter</h2>
        <p>Følgende tredjeparter kan sætte cookies i forbindelse med deres tjenester:</p>
        <table>
          <thead>
            <tr>
              <th>Tjeneste</th>
              <th>Formål</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Stripe</td>
              <td>Betalingshåndtering og svindelforebyggelse</td>
              <td>Nødvendig</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>4. Administr&eacute;r dine cookies</h2>
        <p>
          Du kan til enhver tid ændre dine cookie-præferencer via cookie-banneret på vores side
          eller ved at slette cookies i din browser:
        </p>
        <ul>
          <li><strong>Chrome:</strong> Indstillinger &rarr; Privatliv og sikkerhed &rarr; Cookies</li>
          <li><strong>Safari:</strong> Indstillinger &rarr; Privatliv</li>
          <li><strong>Firefox:</strong> Indstillinger &rarr; Privatliv og sikkerhed</li>
        </ul>
        <p>Bemærk at sletning af nødvendige cookies kan påvirke hjemmesidens funktionalitet.</p>
      </section>

      <section>
        <h2>5. Retsgrundlag</h2>
        <p>
          Nødvendige cookies sættes jf. cookiebekendtgørelsens &sect; 3, stk. 2 (undtagelsen for
          teknisk nødvendige cookies). Øvrige cookies sættes kun med dit samtykke jf.
          cookiebekendtgørelsens &sect; 3, stk. 1.
        </p>
      </section>

      <section>
        <h2>6. Kontakt</h2>
        <p>
          Har du spørgsmål til vores brug af cookies, kontakt os på{' '}
          <a href="mailto:kontakt@retsklar.dk">kontakt@retsklar.dk</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
