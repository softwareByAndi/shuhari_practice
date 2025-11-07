import type {
  Field, Subject, Topic, Stage, DifficultyLevel, DifficultyProgression,
  StageCode
} from './types/database';

// Import the static data
import fieldsData from './static-data/fields.json';
import subjectsData from './static-data/subjects.json';
import topicsData from './static-data/topics.json';
import stagesData from './static-data/stages.json';
import difficultyLevelsData from './static-data/difficulty-levels.json';
import difficultyProgressionsData from './static-data/difficulty-progressions.json';
import topicDifficultyOptionsData from './static-data/topic-difficulty-options.json';

// Cast imported data to proper types
const fields = fieldsData as Field[];
const subjects = subjectsData as Subject[];
const topics = topicsData as Topic[];
const stages = stagesData as Stage[];
const difficultyLevels = difficultyLevelsData as DifficultyLevel[];
const difficultyProgressions = difficultyProgressionsData as DifficultyProgression[];
const topicDifficultyOptions = topicDifficultyOptionsData as any[];

// ============= Field & Subject Navigation =============

export async function getAllFields(): Promise<Field[]> {
  return fields.sort((a, b) => a.field_id - b.field_id);
}

export async function getFieldByCode(code: string): Promise<Field | null> {
  const field = fields.find(f => f.code === code);
  return field || null;
}

export async function getActiveFields(): Promise<Field[]> {
  return fields
    .filter(f => f.is_active)
    .sort((a, b) => a.field_id - b.field_id);
}

export async function getSubjectByCode(code: string): Promise<Subject | null> {
  const subject = subjects.find(s => s.code === code);
  return subject || null;
}

export async function getSubjectsForFieldCode(fieldCode: string): Promise<Subject[]> {
  const field = await getFieldByCode(fieldCode);
  if (!field) return [];

  return subjects
    .filter(s => s.field_id === field.field_id)
    .sort((a, b) => a.subject_id - b.subject_id);
}

export async function getSubjectsForField(fieldId: number): Promise<Subject[]> {
  return subjects
    .filter(s => s.field_id === fieldId)
    .sort((a, b) => a.subject_id - b.subject_id);
}

// ============= Topic Management =============

export async function getTopicsForSubjectCode(subjectCode: string): Promise<Topic[]> {
  const subject = await getSubjectByCode(subjectCode);
  if (!subject) return [];

  return topics
    .filter(t => t.subject_id === subject.subject_id)
    .sort((a, b) => a.topic_id - b.topic_id);
}

export async function getTopicById(topicId: number): Promise<Topic | null> {
  const topic = topics.find(t => t.topic_id === topicId);
  return topic || null;
}

export async function getTopicByCode(code: string): Promise<Topic | null> {
  const topic = topics.find(t => t.code === code);
  return topic || null;
}

// ============= Stage Management =============

export async function getStageById(stageId: number): Promise<Stage | null> {
  const stage = stages.find(s => s.stage_id === stageId);
  return stage || null;
}

export async function getStageRequirements(
  topicId: number,
  stageCode: StageCode
): Promise<number> {
  const topic = await getTopicById(topicId);
  if (!topic?.difficulty_progression_id) {
    return 1000; // Default fallback
  }

  const progression = difficultyProgressions.find(
    dp => dp.difficulty_progression_id === topic.difficulty_progression_id
  );

  if (!progression) {
    return 1000; // Default fallback
  }

  // Map stage code to progression field
  switch (stageCode) {
    case 'hatsu': return progression.hatsu;
    case 'shu': return progression.shu;
    case 'kan': return progression.kan;
    case 'ha': return progression.ha;
    case 'toi': return progression.toi;
    case 'ri': return progression.ri;
    case 'ku': return Number.MAX_SAFE_INTEGER; // Ku has no requirement
    default: return 1000;
  }
}

// ============= Difficulty Levels =============

export async function getDifficultyLevels(): Promise<DifficultyLevel[]> {
  return difficultyLevels.sort((a, b) => a.difficulty_level_id - b.difficulty_level_id);
}

export async function getDifficultyLevelsForTopic(topicId: number): Promise<DifficultyLevel[]> {
  const topicOptions = topicDifficultyOptions.filter(tdo => tdo.topic_id === topicId);

  const difficulties: DifficultyLevel[] = [];
  for (const option of topicOptions) {
    const difficulty = difficultyLevels.find(
      dl => dl.difficulty_level_id === option.difficulty_level_id
    );
    if (difficulty) {
      difficulties.push(difficulty);
    }
  }

  return difficulties.sort((a, b) => a.difficulty_level_id - b.difficulty_level_id);
}

// ============= Export Info =============

export async function getExportInfo() {
  try {
    const exportInfo = await import('./static-data/export-info.json');
    return exportInfo.default;
  } catch {
    return null;
  }
}