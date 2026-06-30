import type Database from 'better-sqlite3';
import { CurriculumRepository } from './CurriculumRepository';
import { LessonRepository } from './LessonRepository';
import { LessonResourceRepository } from './LessonResourceRepository';
import { LessonStatusRepository } from './LessonStatusRepository';
import { LessonTopicRepository } from './LessonTopicRepository';
import { LessonTypeRepository } from './LessonTypeRepository';
import { SchoolClassRepository } from './SchoolClassRepository';
import { SectionRepository } from './SectionRepository';
import { SettingsRepository } from './SettingsRepository';
import { SubjectRepository } from './SubjectRepository';
import { TopicRelationRepository } from './TopicRelationRepository';
import { TopicRepository } from './TopicRepository';

export class RepositoryRegistry {
  readonly subjects: SubjectRepository;
  readonly sections: SectionRepository;
  readonly topics: TopicRepository;
  readonly curriculum: CurriculumRepository;
  readonly lessons: LessonRepository;
  readonly lessonTopics: LessonTopicRepository;
  readonly lessonResources: LessonResourceRepository;
  readonly topicRelations: TopicRelationRepository;
  readonly settings: SettingsRepository;
  readonly lessonTypes: LessonTypeRepository;
  readonly lessonStatuses: LessonStatusRepository;
  readonly schoolClasses: SchoolClassRepository;

  constructor(db: Database.Database) {
    this.subjects = new SubjectRepository(db);
    this.sections = new SectionRepository(db);
    this.topics = new TopicRepository(db);
    this.curriculum = new CurriculumRepository(db);
    this.lessons = new LessonRepository(db);
    this.lessonTopics = new LessonTopicRepository(db);
    this.lessonResources = new LessonResourceRepository(db);
    this.topicRelations = new TopicRelationRepository(db);
    this.settings = new SettingsRepository(db);
    this.lessonTypes = new LessonTypeRepository(db);
    this.lessonStatuses = new LessonStatusRepository(db);
    this.schoolClasses = new SchoolClassRepository(db);
  }
}

export * from './SubjectRepository';
export * from './SectionRepository';
export * from './TopicRepository';
export * from './CurriculumRepository';
export * from './LessonRepository';
export * from './LessonTopicRepository';
export * from './LessonResourceRepository';
export * from './TopicRelationRepository';
export * from './SettingsRepository';
export * from './LessonTypeRepository';
export * from './LessonStatusRepository';
export * from './SchoolClassRepository';
