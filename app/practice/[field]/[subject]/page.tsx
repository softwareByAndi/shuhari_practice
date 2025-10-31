
import {
  getFieldByCode,
  getSubjectByCode,
  getTopicsForSubjectCode
} from '@/lib/supabase-v2';

import styles from '@/styles/page.module.css';

import { notFound } from 'next/navigation';
import BreadCrumbs from '@/components/BreadCrumbs';
import CardsGrid from '@/components/CardsGrid';
import CondensedStagesToMastery from '@/components/CondensedStagesToMastery';
import Header from '@/components/Header';

// Topic icons mapping
const TOPIC_ICONS: Record<string, string> = {
  'add': '➕',
  'sub': '➖',
  'mul': '✖️',
  'div': '➗',
  'mod': '%',
  'exp': '^',
  'root': '√',
  'add_w_negatives': '±',
  'subtract_w_negatives': '∓',
};

interface SubjectPageProps {
  params: Promise<{
    field: string;
    subject: string;
  }>;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { field: fieldCode, subject: subjectCode } = await params;

  const [
    topics,
    subject,
    field
  ] = await Promise.all([
    getTopicsForSubjectCode(subjectCode),
    getSubjectByCode(subjectCode),
    getFieldByCode(fieldCode)
  ])

  console.log('TOPICS:', topics);
  console.log('SUBJECT:', subject);

  if (!subject) {
    return notFound();
  }

  const content = {
    title: `${subject.display_name} Topics`,
    subTitle: 'Choose a topic to practice. Progress through 7 stages from Hatsu to Ku.',
  }

  return (
    <div className="page">
      <Header />
      <main>

          {/* Header */}
          <div className={styles.titleSection}>
            <BreadCrumbs paths={[
              { label: 'Home', path: `/` },
              { label: field?.display_name || 'Field', path: `/practice/${fieldCode}` }
            ]} />
            <h1 className={styles.title}>{content.title}</h1>
            <p className={styles.sub_title}>{content.subTitle}</p>
          </div>

          {/* Topics Cards Grid */}
          <div className={styles.pageContent}>
            <CardsGrid cards={topics.map(topic => ({
                id:           topic.topic_id,
                display_name: topic.display_name.split(' ')[0],
                description:  null,
                actionText:   'Start Practicing →',
                link:         `/practice/${fieldCode}/${subjectCode}/${topic.code}`,
                icon:         TOPIC_ICONS[topic.code] || '📚',
                isActive:     true,
                color:        null,
            }))} />
          </div>

      </main>
      <footer>
        <CondensedStagesToMastery />
      </footer>
    </div>
  );
}