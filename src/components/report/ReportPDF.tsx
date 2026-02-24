'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface ReportPDFProps {
  healthCheckId: string;
}

export function ReportPDF({ healthCheckId }: ReportPDFProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/report/${healthCheckId}/pdf`);

      if (!res.ok) {
        setError(
          res.status === 403
            ? 'PDF er kun tilgængelig for betalende brugere.'
            : 'Kunne ikke generere PDF. Prøv igen.',
        );
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().split('T')[0];

      const a = document.createElement('a');
      a.href = url;
      a.download = `retsklar-rapport-${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Noget gik galt. Prøv igen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="print:hidden">
      <Button
        variant="outline"
        onClick={handleDownload}
        disabled={loading}
        className="gap-2 border-deep-blue text-deep-blue hover:bg-deep-blue/5"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Genererer PDF...
          </>
        ) : (
          <>
            <Download className="size-4" />
            Download PDF
          </>
        )}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
