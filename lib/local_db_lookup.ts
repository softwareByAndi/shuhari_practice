import { get as _Get } from 'lodash';

import _stages   from '@/lib/static-data/stages.json';
import _fields   from '@/lib/static-data/fields.json';
import _subjects from '@/lib/static-data/subjects.json';
import _units    from '@/lib/static-data/units.json';
import _topics   from '@/lib/static-data/topics.json';
import _difficultyProgressions from '@/lib/static-data/difficulty-progressions.json';

import type {
  DifficultyProgression,
  Stage,
  Field,
  Subject,
  Unit,
  Topic,
  ExtendedSubject,
  ExtendedUnit,
  ExtendedTopic
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
  by_code: Record<string, ExtendedSubject>;
  by_id: Record<number, ExtendedSubject>;
  list: ExtendedSubject[];
}

interface UnitLookup {
  by_code: Record<string, ExtendedUnit>;
  by_id: Record<number, ExtendedUnit>;
  list: ExtendedUnit[];
}

interface TopicLookup {
  by_id: Record<number, ExtendedTopic>;
  by_code: Record<string, ExtendedTopic>;
  list: ExtendedTopic[];
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

export const fieldLookup: FieldLookup = {
  by_id: Object.fromEntries(_fields.map(f => [f.field_id, f])),
  by_code: Object.fromEntries(_fields.map(f => [f.code, f])),
  list: _fields as Field[]
}


const _mappedSubjects: ExtendedSubject[] = (_subjects as Subject[]).map(subject => ({
  ...subject,
  field: fieldLookup.by_id[subject.field_id] || undefined
}))

export const subjectLookup: SubjectLookup = {
  by_code: Object.fromEntries(_mappedSubjects.map(s => [s.code, s])),
  by_id: Object.fromEntries(_mappedSubjects.map(s => [s.subject_id, s])),
  list: _mappedSubjects,
}

const _mappedUnits: ExtendedUnit[] = (_units as Unit[]).map(unit => ({
  ...unit,
  subject: subjectLookup.by_id[unit.subject_id],
  field: fieldLookup.by_id[subjectLookup.by_id[unit.subject_id].field_id]
}))

export const unitLookup: UnitLookup = {
  by_code: Object.fromEntries(_mappedUnits.map(u => [u.code, u])),
  by_id: Object.fromEntries(_mappedUnits.map(u => [u.unit_id, u])),
  list: _mappedUnits,
}

const _mappedTopics: ExtendedTopic[] = (_topics as Topic[]).map(topic => {
    const _unit = unitLookup.by_id[topic.unit_id]
    const _subject = _unit.subject
    const _field = _unit.field

    return {
        ...topic,
        unit: _unit as Unit,
        subject: _subject,
        field: _field,
        difficulty_progression: topic.difficulty_progression_id
            ? difficulty.by_id[topic.difficulty_progression_id] || undefined
            : difficulty.by_code.standard
    }
})

export const topicLookup: TopicLookup = {
  by_id: Object.fromEntries(_mappedTopics.map(t => [t.topic_id, t])),
  by_code: Object.fromEntries(_mappedTopics.map(t => [t.code, t])),
  list: _mappedTopics
}

export const stageLookup: StageLookup = {
  by_id: Object.fromEntries(_stages.map(s => [s.stage_id, s])),
  by_code: Object.fromEntries(_stages.map(s => [s.code, s])),
  list: _stages
}



export function calculateStageByReps(totalReps: number): Stage {
  // Sort stages by min_reps ascending
  const stageId = Math.min(
    ...stageLookup.list
        .filter(s => totalReps >= s.rep_threshold)
        .map(s => s.stage_id)
  );
    return stageLookup.by_id[stageId] || stageLookup.by_code.hatsu;
}
