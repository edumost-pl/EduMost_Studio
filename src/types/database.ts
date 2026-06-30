export type {
  BaseEntity,
  Curriculum,
  Lesson,
  LessonDetail,
  LessonResource,
  LessonStatus,
  LessonTopic,
  LessonTopicView,
  LessonTopicWithTopicView,
  LessonType,
  RelationType,
  SchoolClass,
  Section,
  SectionListItem,
  Settings,
  Subject,
  Topic,
  TopicDetail,
  TopicFilters,
  TopicListItem,
  TopicRelation,
  TopicRelationView,
} from '../../electron/database/types';

export interface DatabaseInfo {
  path: string;
  isNew: boolean;
  seeded: boolean;
  counts: {
    subjects: number;
    sections: number;
    topics: number;
    curriculum: number;
    lessons: number;
    lessonTopics: number;
    lessonResources: number;
    topicRelations: number;
    settings: number;
  };
}

export interface DatabaseFileInfo {
  path: string;
  fileName: string;
  directory: string;
  sizeBytes: number;
  modifiedAt: string;
  sqliteVersion: string;
  appVersion: string;
  userDataPath: string;
  runtimeMode: 'development' | 'production';
  settingsDbPath: string | null;
  isNew: boolean;
  seeded: boolean;
  discoveredDbFiles: Array<{
    path: string;
    sizeBytes: number;
    modifiedAt: string;
    counts: {
      subjects: number;
      sections: number;
      topics: number;
      lessons: number;
    };
  }>;
  counts: DatabaseInfo['counts'];
}

export interface BackupEntry {
  fileName: string;
  path: string;
  sizeBytes: number;
  modifiedAt: string;
}
