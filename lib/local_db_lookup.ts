import { get as _Get } from 'lodash';

import _stages   from '@/lib/static-data/stages.json';
import _fields   from '@/lib/static-data/fields.json';
import _subjects from '@/lib/static-data/subjects.json';
import _topics   from '@/lib/static-data/topics.json';
import _difficultyProgressions from '@/lib/static-data/difficulty-progressions.json';

import type {
  DifficultyProgression,
  Stage,
  Field,
  Subject,
  Topic,
  SubjectWithField,
  TopicWithSubject
} from '@/lib/types/database';

// Type definitions for lookup objects
interface DifficultyLookup {
  by_code: Record<string, DifficultyProgression>;
  by_id: Record<number, DifficultyProgression>;
  list: DifficultyProgression[];
}

interface FieldLookup {
  by_id: Record<number, Field>;
  by_code: Record<string, Field>;
  list: Field[];
}

interface SubjectLookup {
  by_code: Record<string, SubjectWithField>;
  by_id: Record<number, SubjectWithField>;
  list: SubjectWithField[];
}

interface TopicLookup {
  by_id: Record<number, TopicWithSubject>;
  by_code: Record<string, TopicWithSubject>;
  list: TopicWithSubject[];
}

interface StageLookup {
  by_id: Record<number, Stage>;
  by_code: Record<string, Stage>;
  list: Stage[];
}

export const difficulty: DifficultyLookup = {
  by_code: Object.fromEntries(_difficultyProgressions.map(d => [d.code, d])),
  by_id: Object.fromEntries(_difficultyProgressions.map(d => [d.difficulty_progression_id, d])),
  list: _difficultyProgressions as DifficultyProgression[]
}

export const field: FieldLookup = {
  by_id: Object.fromEntries(_fields.map(f => [f.field_id, f])),
  by_code: Object.fromEntries(_fields.map(f => [f.code, f])),
  list: _fields as Field[]
}


const _mappedSubjects: SubjectWithField[] = (_subjects as Subject[]).map(subject => ({
  ...subject,
  field: field.by_id[subject.field_id] || undefined
}))

export const subject: SubjectLookup = {
  by_code: Object.fromEntries(_mappedSubjects.map(s => [s.code, s])),
  by_id: Object.fromEntries(_mappedSubjects.map(s => [s.subject_id, s])),
  list: _mappedSubjects,
}

const _mappedTopics: TopicWithSubject[] = (_topics as Topic[]).map(topic => ({
  ...topic,
  subject: subject.by_id[topic.subject_id] || undefined,
  difficulty_progression: topic.difficulty_progression_id
    ? difficulty.by_id[topic.difficulty_progression_id] || undefined
    : undefined
}))

export const topic: TopicLookup = {
  by_id: Object.fromEntries(_mappedTopics.map(t => [t.topic_id, t])),
  by_code: Object.fromEntries(_mappedTopics.map(t => [t.code, t])),
  list: _mappedTopics
}

export const stage: StageLookup = {
  by_id: Object.fromEntries(_stages.map(s => [s.stage_id, s])),
  by_code: Object.fromEntries(_stages.map(s => [s.code, s])),
  list: _stages
}
