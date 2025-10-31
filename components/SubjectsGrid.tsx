
import { getSubjectsForField } from '@/lib/supabase-v2';
import { Subject } from '@/lib/types/database';

import styles from '@/styles/card.module.css';

import CardsGrid from './CardsGrid';
import { notFound } from 'next/navigation';

const data = {
  default_card: {
    symbol: '📚',
    tw_color: 'gray'
  },
}

interface SubjectsGridProps {
  fieldId: number;
  fieldCode: string;
}

/*
export default async function FieldsGrid() {

  const fields: Field[] = await getAllFields();
  if (!fields) {
    return notFound();
  }
*/

export default async function SubjectsGrid({ fieldId, fieldCode }: SubjectsGridProps) {

  const subjects: Subject[] = await getSubjectsForField(fieldId);

  if (!fieldId || !subjects) {
    return notFound();
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}>Subjects:</h2>
      <CardsGrid cards={subjects.map(s => ({
          id:           s.subject_id,
          display_name: s.display_name,
          description:  null,
          actionText:   'Start Learning →',
          link:         `/practice/${fieldCode}/${s.code}`,
          icon:         SUBJECT_ICONS[s.code] || data.default_card.symbol,
          isActive:     true,
          color:        data.default_card.tw_color,
      }))} />
    </div>
  );
}



// Field icon and color mapping

const SUBJECT_ICONS: Record<string, string> = {
  'arithmetic': '➗',
  'algebra':    '𝒙',
  'geometry':   '📐',
  'calculus':   '∫',
  'statistics': '📊',
};
