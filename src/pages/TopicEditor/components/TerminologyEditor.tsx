import { useState } from 'react';
import { parseTerminology } from '@/components/content/BilingualText';
import { useI18n } from '@/i18n';

function joinTerms(terms: string[]): string {
  return terms.join('; ');
}

function TermTagList({
  terms,
  onRemove,
}: {
  terms: string[];
  onRemove: (term: string) => void;
}) {
  if (terms.length === 0) {
    return <p className="text-sm text-slate-400">—</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {terms.map((term) => (
        <span
          key={term}
          className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700"
        >
          {term}
          <button
            type="button"
            onClick={() => onRemove(term)}
            className="text-brand-400 hover:text-brand-700"
            aria-label={`Remove ${term}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

export function TerminologyEditor({
  valuePl,
  valueUa,
  onChangePl,
  onChangeUa,
}: {
  valuePl: string;
  valueUa: string;
  onChangePl: (value: string) => void;
  onChangeUa: (value: string) => void;
}) {
  const { t } = useI18n();
  const [newPl, setNewPl] = useState('');
  const [newUa, setNewUa] = useState('');

  const termsPl = parseTerminology(valuePl);
  const termsUa = parseTerminology(valueUa);

  const addTerm = (lang: 'pl' | 'ua') => {
    const raw = lang === 'pl' ? newPl : newUa;
    const term = raw.trim();
    if (!term) return;

    if (lang === 'pl') {
      onChangePl(joinTerms([...termsPl, term]));
      setNewPl('');
    } else {
      onChangeUa(joinTerms([...termsUa, term]));
      setNewUa('');
    }
  };

  const removeTerm = (lang: 'pl' | 'ua', term: string) => {
    if (lang === 'pl') {
      onChangePl(joinTerms(termsPl.filter((item) => item !== term)));
    } else {
      onChangeUa(joinTerms(termsUa.filter((item) => item !== term)));
    }
  };

  const inputClass =
    'flex-1 rounded-lg border border-surface-border px-3 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100';

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-xs font-semibold text-brand-700">
          {t('content.labelPl')}
        </div>
        <TermTagList terms={termsPl} onRemove={(term) => removeTerm('pl', term)} />
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newPl}
            onChange={(e) => setNewPl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTerm('pl'))}
            placeholder={t('editor.termPl')}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => addTerm('pl')}
            className="shrink-0 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            + {t('editor.addTerm')}
          </button>
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold text-brand-700">
          {t('content.labelUa')}
        </div>
        <TermTagList terms={termsUa} onRemove={(term) => removeTerm('ua', term)} />
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newUa}
            onChange={(e) => setNewUa(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTerm('ua'))}
            placeholder={t('editor.termUa')}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => addTerm('ua')}
            className="shrink-0 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            + {t('editor.addTerm')}
          </button>
        </div>
      </div>
    </div>
  );
}
