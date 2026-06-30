import type { Settings } from '../database/types';
import { BaseRepository } from './BaseRepository';

export class SettingsRepository extends BaseRepository {
  find(): Settings | undefined {
    return this.get<Settings>('SELECT * FROM Settings ORDER BY id ASC LIMIT 1');
  }

  update(data: Partial<Settings>): Settings | undefined {
    const current = this.find();
    if (!current) {
      return undefined;
    }

    const fields = Object.keys(data).filter(
      (key) => key !== 'id' && key !== 'created_at',
    );

    if (fields.length === 0) {
      return current;
    }

    const assignments = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => data[field as keyof Settings]);

    this.run(
      `UPDATE Settings
       SET ${assignments}, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [...values, current.id],
    );

    return this.find();
  }
}
