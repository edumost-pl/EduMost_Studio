ALTER TABLE Settings ADD COLUMN auto_backup_before_import INTEGER NOT NULL DEFAULT 1;
ALTER TABLE Settings ADD COLUMN materials_path TEXT;
