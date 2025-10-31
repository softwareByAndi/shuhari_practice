import styles from '@/styles/card.module.css';

import { getAllFields } from '@/lib/supabase-v2';
import { Field } from '@/lib/types/database';

import { notFound } from 'next/navigation';
import CardsGrid from './CardsGrid';



const data = {
  default_card: {
    symbol: '📚',
    tw_color: 'gray'
  },
}

export default async function FieldsGrid() {

  const fields: Field[] = await getAllFields();
  if (!fields) {
    return notFound();
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}>Choose Your Field</h2>
        <CardsGrid cards={fields.map(f => ({
            id:           f.field_id,
            display_name: f.display_name,
            description:  null,
            actionText:   f.is_active ? 'Start your journey →' : 'Coming Soon...',
            link:         f.is_active ? `/practice/${f.code}` : null,
            icon:         f.symbol || data.default_card.symbol,
            isActive:     f.is_active,
            color:   f.tw_color || data.default_card.tw_color,
        }))} />
    </div>
  );
}
