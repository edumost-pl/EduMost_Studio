import { BilingualText } from '@/components/content/BilingualText';
import { useI18n } from '@/i18n';
import type { RelationType, TopicRelationView } from '@/types/database';

const RELATION_ORDER: RelationType[] = [
  'PREREQUISITE',
  'NEXT',
  'RELATED',
  'REVISION',
  'EXTENSION',
];

function relationLabel(
  type: RelationType,
  t: (key: import('@/i18n/types').TranslationKey) => string,
): string {
  const map: Record<RelationType, import('@/i18n/types').TranslationKey> = {
    PREREQUISITE: 'editor.relationPrerequisite',
    NEXT: 'editor.relationNext',
    RELATED: 'editor.relationRelated',
    REVISION: 'editor.relationRevision',
    EXTENSION: 'editor.relationExtension',
  };
  return t(map[type]);
}

export function TopicEditorRelatedList({
  relations,
}: {
  relations: TopicRelationView[];
}) {
  const { t } = useI18n();

  if (relations.length === 0) {
    return (
      <p className="text-sm text-slate-400">{t('common.noResults')}</p>
    );
  }

  const grouped = RELATION_ORDER.map((type) => ({
    type,
    items: relations.filter((rel) => rel.relation_type === type),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-4">
      {grouped.map((group) => (
        <div key={group.type}>
          <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {relationLabel(group.type as RelationType, t)}
          </h4>
          <ul className="space-y-2">
            {group.items.map((rel) => (
              <li
                key={rel.id}
                className="rounded-lg border border-surface-border bg-surface-muted px-3 py-2"
              >
                <div className="font-mono text-xs font-semibold text-brand-700">
                  {rel.related_code}
                </div>
                <BilingualText
                  textPl={rel.related_name_pl}
                  textUa={rel.related_name_ua}
                  variant="compact"
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
