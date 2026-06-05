import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
