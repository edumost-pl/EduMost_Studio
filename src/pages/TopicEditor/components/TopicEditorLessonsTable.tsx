import { useI18n } from '@/i18n';
import { useNavigation } from '@/context/NavigationContext';
import type { LessonTopicView } from '@/types/database';

export function TopicEditorLessonsTable({
  lessons,
  onNewLesson,
}: {
  lessons: LessonTopicView[];
  onNewLesson?: () => void;
}) {
  const { t } = useI18n();
  const nav = useNavigation();

  if (lessons.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-surface-border bg-surface-muted/40 px-6 py-10 text-center">
        <p className="text-sm text-slate-500">{t('editor.noLessonsYet')}</p>
        {onNewLesson ? (
          <button
            type="button"
            onClick={onNewLesson}
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {t('action.newLesson')}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-surface-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-surface-border bg-surface-muted text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-2.5 font-semibold">{t('table.code')}</th>
            <th className="px-4 py-2.5 font-semibold">{t('table.namePl')}</th>
            <th className="px-4 py-2.5 font-semibold">{t('table.nameUa')}</th>
            <th className="px-4 py-2.5 font-semibold">{t('table.lessonType')}</th>
            <th className="px-4 py-2.5 font-semibold">{t('editor.order')}</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson) => (
            <tr
              key={lesson.id}
              onClick={() => nav.setEditingLessonId(lesson.lesson_id)}
              className="cursor-pointer border-b border-surface-border last:border-0 hover:bg-brand-50"
            >
              <td className="px-4 py-2.5 font-mono text-xs font-semibold text-brand-700">
                {lesson.lesson_code}
              </td>
              <td className="px-4 py-2.5">
                <span className="font-medium text-slate-900">{lesson.lesson_title_pl}</span>
              </td>
              <td className="px-4 py-2.5 text-slate-600">{lesson.lesson_title_ua}</td>
              <td className="px-4 py-2.5 text-slate-600">{lesson.lesson_type}</td>
              <td className="px-4 py-2.5">
                <span className="inline-flex h-8 w-12 items-center justify-center rounded-lg border border-surface-border bg-surface-muted text-xs font-medium text-slate-600">
                  {lesson.display_order}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
