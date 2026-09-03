import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SourceCitation({ compact = false }) {
  const { t } = useLanguage();

  return (
    <div className={`bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium ${compact ? 'py-1.5 px-3' : ''}`}>
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 shrink-0" />
        <span>{t('govt_citation')}</span>
      </div>
      <a 
        href="https://agmarknet.gov.in" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-emerald-700 underline font-bold hover:text-emerald-900 shrink-0"
      >
        agmarknet.gov.in
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
