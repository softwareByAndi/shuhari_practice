
import {
  getFieldByCode,
  getSubjectByCode,
  getTopicsForSubjectCode
} from '@/lib/supabase-v2';
import { TOPIC_ICONS } from '@/lib/topic-icons';

import styles from '@/styles/page.module.css';

import { notFound } from 'next/navigation';
import BreadCrumbs from '@/components/BreadCrumbs';
import CardsGrid from '@/components/CardsGrid';
import CondensedStagesToMastery from '@/components/CondensedStagesToMastery';
import Header from '@/components/Header';

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

  if (!subject) {
    return notFound();
  }

  const content = {
    title: `${subject.display_name} Topics`,
    subTitle: 'Choose a topic to practice. Progress through 7 stages from Hatsu to Ku.',
  }

  return (
    <div className="page">
      <Header params={params} />
      <main>
          {/* Header */}
          <div className="titleSection">
            <h1 className="title">{content.title}</h1>
            <p className="sub_title">{content.subTitle}</p>
          </div>

          {/* Topics Cards Grid */}
          <div className="pageContent">
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