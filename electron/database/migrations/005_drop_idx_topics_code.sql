-- Remove redundant index: Topics.code already has a UNIQUE constraint (implicit index).
DROP INDEX IF EXISTS idx_topics_code;
