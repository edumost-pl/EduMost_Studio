import type { TopicRelation, TopicRelationView } from '../database/types';
import { BaseRepository } from './BaseRepository';

export class TopicRelationRepository extends BaseRepository {
  findByTopicId(topicId: number): TopicRelationView[] {
    return this.all<TopicRelationView>(
      `SELECT
         tr.*,
         rt.code AS related_code,
         rt.name_pl AS related_name_pl,
         rt.name_ua AS related_name_ua
       FROM TopicRelations tr
       INNER JOIN Topics rt ON rt.id = tr.related_topic_id
       WHERE tr.topic_id = ? AND tr.is_active = 1
       ORDER BY tr.relation_type ASC, tr.display_order ASC`,
      [topicId],
    );
  }

  findByType(topicId: number, relationType: string): TopicRelationView[] {
    return this.all<TopicRelationView>(
      `SELECT
         tr.*,
         rt.code AS related_code,
         rt.name_pl AS related_name_pl,
         rt.name_ua AS related_name_ua
       FROM TopicRelations tr
       INNER JOIN Topics rt ON rt.id = tr.related_topic_id
       WHERE tr.topic_id = ? AND tr.relation_type = ? AND tr.is_active = 1
       ORDER BY tr.display_order ASC`,
      [topicId, relationType],
    );
  }

  create(data: Omit<TopicRelation, 'id' | 'created_at' | 'updated_at'>): TopicRelation {
    const result = this.run(
      `INSERT INTO TopicRelations (
         topic_id, related_topic_id, relation_type,
         description_pl, description_ua, display_order, is_active
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.topic_id,
        data.related_topic_id,
        data.relation_type,
        data.description_pl,
        data.description_ua,
        data.display_order,
        data.is_active,
      ],
    );

    return this.get<TopicRelation>('SELECT * FROM TopicRelations WHERE id = ?', [
      Number(result.lastInsertRowid),
    ])!;
  }
}
