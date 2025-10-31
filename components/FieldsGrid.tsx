'use client';

import { useState, useEffect } from 'react';
import { getAllFields } from '@/lib/supabase-v2';
import { Field } from '@/lib/types/database';
import styles from '@/styles/card.module.css';
import CardsGrid from './CardsGrid';


const data = {
  default_card: {
    symbol: '📚',
    tw_color: 'bg-gray-500'
  },
}


export default function FieldsGrid() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFields() {
      const allFields = await getAllFields();
      console.log('Loaded fields:', allFields);
      setFields(allFields);
      setLoading(false);
    }
    loadFields();
  }, []);


  return (
    <div>
      <h2 className={styles.sectionTitle}>Choose Your Field</h2>

      {loading ? (

        <CardsGrid cards={[1,2,3,4,5,6,7,8,9,10,11,12].map(() => null)} />

      ) : (

          <CardsGrid cards={fields.map(f => ({
              id:           f.field_id,
              display_name: f.display_name,
              description:  null,
              actionText:   f.is_active ? 'Start your journey →' : 'Coming Soon...',
              link:         f.is_active ? `/practice/${f.code}` : null,
              icon:         f.symbol || data.default_card.symbol,
              isActive:     f.is_active,
              colorClass:   f.tw_color || data.default_card.tw_color,
          }))} />

      )}
    </div>
  );
}
