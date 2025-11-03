

import { subjectLookup } from '@/lib/local_db_lookup';
import { ExtendedSubject } from '@/lib/types/database';

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


export default async function SubjectsGrid({ fieldId, fieldCode }: SubjectsGridProps) {

  const subjects: ExtendedSubject[] = subjectLookup.list.filter(s => s.field_id === fieldId);

  if (!subjects) {
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
          link:         `/practice/${s.field.code}/${s.code}`,
          icon:         s.symbol || data.default_card.symbol,
          isActive:     true,
          color:        data.default_card.tw_color,
      }))} />
    </div>
  );
}



