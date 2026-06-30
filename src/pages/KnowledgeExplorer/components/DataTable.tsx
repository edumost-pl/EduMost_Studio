import { useI18n } from '@/i18n';
import { BilingualText } from '@/components/content/BilingualText';
import type { Lesson, TopicListItem } from '@/types/database';

function ClassBadge({ value }: { value: number | null | undefined }) {
  if (!value) return <span className="text-slate-300">—</span>;
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
      {value}
    </span>
  );
}

function CountBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
      {value}
    </span>
  );
}

export function TopicsTable({
  topics,
  selectedId,
  onSelect,
  onOpen,
}: {
  topics: TopicListItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onOpen?: (id: number) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-white shadow-panel">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-muted text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-semibold">{t('table.code')}</th>
              <th className="px-4 py-3 font-semibold">{t('table.namePl')}</th>
              <th className="px-4 py-3 font-semibold">{t('table.nameUa')}</th>
              <th className="px-4 py-3 font-semibold">{t('table.class')}</th>
              <th className="px-4 py-3 font-semibold">{t('table.section')}</th>
              <th className="px-4 py-3 font-semibold">{t('table.lessons')}</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => {
              const selected = topic.id === selectedId;
              return (
                <tr
                  key={topic.id}
                  onClick={() => onSelect(topic.id)}
                  onDoubleClick={() => onOpen?.(topic.id)}
                  className={[
                    'cursor-pointer border-b border-surface-border transition-colors last:border-0',
                    selected ? 'bg-brand-50' : 'hover:bg-slate-50',
                  ].join(' ')}
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-700">
                    {topic.code}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-900">{topic.name_pl}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{topic.name_ua}</td>
                  <td className="px-4 py-3">
                    <ClassBadge value={topic.school_class} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{topic.section_name_ua}</td>
                  <td className="px-4 py-3">
                    <CountBadge value={topic.lessons_count} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LessonsTable({
  lessons,
  selectedId,
  onSelect,
  onOpen,
}: {
  lessons: Lesson[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onOpen?: (id: number) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-white shadow-panel">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-muted text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-semibold">{t('table.code')}</th>
              <th className="px-4 py-3 font-semibold">{t('table.namePl')}</th>
              <th className="px-4 py-3 font-semibold">{t('table.nameUa')}</th>
              <th className="px-4 py-3 font-semibold">{t('table.class')}</th>
              <th className="px-4 py-3 font-semibold">{t('table.lessonType')}</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => {
              const selected = lesson.id === selectedId;
              return (
                <tr
                  key={lesson.id}
                  onClick={() => onSelect(lesson.id)}
                  onDoubleClick={() => onOpen?.(lesson.id)}
                  className={[
                    'cursor-pointer border-b border-surface-border transition-colors last:border-0',
                    selected ? 'bg-brand-50' : 'hover:bg-slate-50',
                  ].join(' ')}
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-700">
                    {lesson.code}
                  </td>
                  <td className="px-4 py-3">
                    <BilingualText
                      textPl={lesson.title_pl}
                      textUa={null}
                      variant="compact"
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{lesson.title_ua}</td>
                  <td className="px-4 py-3">
                    <ClassBadge value={lesson.school_class} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{lesson.lesson_type}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
