'use client';

import React, { use, useEffect, useState } from 'react';
import PremiumCertificate, { CertificateData } from '@/components/shared/PremiumCertificate';

export default function CertificatePrintPage({ params }: { params: Promise<{ certNo: string }> }) {
  const { certNo } = use(params);
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/trainee/certificates');
        const data = await res.json();
        if (data.ok && Array.isArray(data.certificates)) {
          const found = data.certificates.find((c: { certNo: string }) => c.certNo === decodeURIComponent(certNo));
          if (found) {
            setCert(found as CertificateData);
            setReady(true);
          } else {
            setError('Certificate not found.');
          }
        } else {
          setError(data.message || 'Failed to load certificate.');
        }
      } catch {
        setError('Failed to load certificate. Please try again.');
      }
    };
    load();
  }, [certNo]);

  // Auto-trigger print once the certificate is rendered and fonts are loaded
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      window.print();
    }, 600);
    return () => clearTimeout(timer);
  }, [ready]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 font-bold text-lg mb-4">⚠️ {error}</p>
          <button onClick={() => window.close()} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm">
            Close Tab
          </button>
        </div>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Preparing your certificate...</p>
        </div>
      </div>
    );
  }

  const safeName = cert.course.replace(/[^a-z0-9]/gi, '_');

  return (
    <>
      {/* Set document title to suggest the PDF filename */}
      <title>{`KarmaSetu_Certificate_${safeName}`}</title>

      {/* Print-specific global styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            width: 100vw !important;
            height: 100vh !important;
            overflow: hidden !important;
          }
        }
      `}} />

      {/* Print toolbar (hidden when printing) */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white flex items-center justify-between px-6 py-3 shadow-xl print:hidden">
        <div className="flex items-center gap-3">
          <div className="text-lg">📄</div>
          <div>
            <div className="text-sm font-bold">Certificate Preview</div>
            <div className="text-xs text-slate-400">{cert.course}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-sm rounded-xl transition-colors"
          >
            🖨️ Print / Save as PDF
          </button>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 border border-slate-600 text-slate-300 hover:text-white text-sm rounded-xl transition-colors"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Certificate content */}
      <div className="print-page min-h-screen bg-[#f0f4f8] flex items-center justify-center pt-16 pb-4 print:pt-0 print:bg-white">
        <div className="w-full max-w-5xl px-4 print:px-0 print:max-w-none">
          <PremiumCertificate cert={cert} />
        </div>
      </div>
    </>
  );
}
