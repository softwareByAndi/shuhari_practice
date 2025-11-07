import { unitLookup } from '@/lib/local_db_lookup';
import { ExtendedUnit } from '@/lib/types/database';

import styles from '@/styles/card.module.css';

import CardsGrid from './CardsGrid';
import { notFound } from 'next/navigation';

const data = {
  default_card: {
    symbol: '📚',
    tw_color: 'gray'
  },
}

interface UnitsGridProps {
  subjectId: number;
  fieldCode: string;
  subjectCode: string;
}

export default async function UnitsGrid({ subjectId, fieldCode, subjectCode }: UnitsGridProps) {

  const units: ExtendedUnit[] = unitLookup.list.filter(u => u.subject_id === subjectId);

  if (!units || units.length === 0) {
    return notFound();
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}>Units:</h2>
      <CardsGrid cards={units.map(u => ({
          id:           u.unit_id,
          display_name: u.display_name,
          description:  u.description || null,
          actionText:   'View Topics →',
          link:         `/practice/${fieldCode}/${subjectCode}/${u.code}`,
          icon:         u.symbol || data.default_card.symbol,
          isActive:     u.is_active,
          color:        u.tw_color || null,
      }))} />
    </div>
  );
}