import React from 'react';
import SourceCitation from './SourceCitation';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 px-4 mt-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        <SourceCitation />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-semibold text-slate-300">
              AgriConnect Platform © 2026 — Neutral Digital Agriculture Price & Trade Infrastructure
            </p>
            <p>
              Integrated with Agmarknet, e-NAM, Bhashini AI Mission, myScheme.gov.in, and IMD Agriculture Weather Advisory.
            </p>
          </div>
          
          <div className="flex items-center gap-4 font-medium">
            <a href="https://data.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 underline">data.gov.in</a>
            <a href="https://enam.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 underline">e-NAM Portal</a>
            <a href="https://bhashini.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 underline">Bhashini Mission</a>
            <a href="https://myscheme.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 underline">myScheme.gov.in</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
