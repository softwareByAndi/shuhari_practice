'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getSubjectsForField } from '@/lib/supabase-v2';
import { Subject } from '@/lib/types/database';
import styles from '@/styles/card.module.css';
import CardsGrid from './CardsGrid';

const data = {
  default_card: {
    symbol: '📚',
    tw_color: 'bg-blue-500'
  },
}

interface SubjectsGridProps {
  fieldId: number;
  fieldCode: string;
}

export default function SubjectsGrid({ fieldId, fieldCode }: SubjectsGridProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubjects() {
      const subjectList = await getSubjectsForField(fieldId);
      setSubjects(subjectList);
      setLoading(false);
    }
    loadSubjects();
  }, [fieldId]);


  return (
    <div>
      <h2 className={styles.sectionTitle}>Choose a Subject</h2>

      {loading ? (

        <CardsGrid cards={[1,2,3,4,5,6,7,8,9,10,11,12].map(() => null)} />

      ) : (

          <CardsGrid cards={subjects.map(s => ({
              id:           s.subject_id,
              display_name: s.display_name,
              description:  null,
              actionText:   'Start Learning →',
              link:         `/practice/${fieldCode}/${s.code}`,
              icon:         SUBJECT_ICONS[s.code] || data.default_card.symbol,
              isActive:     true,
              colorClass:   data.default_card.tw_color,
          }))} />

      )}
    </div>
  );
}



// Field icon and color mapping

const SUBJECT_ICONS: Record<string, string> = {
  'arithmetic': '➕',
  'algebra':    '𝒙',
  'geometry':   '📐',
  'calculus':   '∫',
  'statistics': '📊',
};


/* 
.sectionTitle {
  @apply text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-6;
}

.cardTitle {
  @apply text-xl md:text-2xl font-bold text-zinc-900 dark:text-white mb-4 text-center;
}

.explanationCard {
  @apply bg-white dark:bg-zinc-800 rounded-xl md:rounded-2xl 
         p-4 md:p-8 mb-12 
         shadow-lg border border-zinc-200 dark:border-zinc-700;
}

.moduleCard {
  @apply block bg-white dark:bg-zinc-800 rounded-2xl 
         p-4 md:py-6
         shadow-lg border border-zinc-200 dark:border-zinc-700 
         hover:shadow-xl hover:scale-105 transition-all;
}

.cardHeader {
  @apply flex justify-between items-center mb-4;
}

.moduleEmoji {
  // Fluid sizing: min 32px, preferred 8vw, max 64px
  font-size: clamp(2rem, 8vw, 4rem);
    //  font-size: clamp(32px, 8vw, 64px); 
  min-height: 1.2em;
  line-height: 1.2;
}

*/

