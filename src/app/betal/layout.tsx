import type { Metadata } from "next";
import { SITE_URL } from "@/config/constants";

// Siden er en klientkomponent og kan ikke selv eksportere metadata. Den er
// heller ikke beregnet til at ligge i søgeresultaterne, så vi sætter noindex
// (og en egen canonical, så siden ikke arver forsidens).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/betal` },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
