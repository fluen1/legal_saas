# Lovdatabase

Denne mappe indeholder fulde lovtekster hentet fra [retsinformation.dk](https://www.retsinformation.dk) som markdown-filer.

## Opdatering

Kør scriptet for at hente/opdatere love:

```bash
npx tsx scripts/fetch-laws.ts
```

- **Rate limit:** 4 sekunder mellem hvert API-kald
- **Genoptagelse:** Love med `sidstHentet` inden for sidste år springes over
- **Retry:** Eksponentiel backoff ved 429 (rate limit)

## Struktur

- `gdpr/` — Databeskyttelsesloven, Cookiebekendtgørelsen
- `employment/` — Ansættelsesbevisloven, Arbejdsmiljøloven, Funktionærloven, Ferieloven
- `corporate/` — Selskabsloven, Årsregnskabsloven, Bogføringsloven
- `contracts/` — Aftaleloven, Købeloven, Markedsføringsloven
- `ip/` — Ophavsretsloven, Varemærkeloven

## metadata.json

Indeholder metadata for alle love: year, number, type, filePath, tokenEstimate, lastFetched.
