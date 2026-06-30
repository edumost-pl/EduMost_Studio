/**
 * EduMost Studio — official topic code standard:
 * SUBJECT-CLASS-SECTION-ORDER  (e.g. MAT5-NUM-001)
 *
 * ORDER = Curriculum.display_order (global position in class textbook).
 */
export function buildTopicCode(
  subjectCode: string,
  schoolClass: number,
  sectionCode: string,
  displayOrder: number,
): string {
  return `${subjectCode}${schoolClass}-${sectionCode}-${String(displayOrder).padStart(3, '0')}`;
}

/** SQL expression for the canonical topic code from joined Subjects/Sections/Curriculum. */
export function topicCodeSqlExpression(): string {
  return `sub.code || c.school_class || '-' || s.code || '-' || printf('%03d', c.display_order)`;
}

/** Extract global ORDER from a standard topic code (last 3 digits). */
export function parseTopicCodeOrder(code: string): number | null {
  const match = code.match(/-(\d{3})$/);
  if (!match) {
    return null;
  }
  const order = parseInt(match[1]!, 10);
  return Number.isNaN(order) ? null : order;
}
