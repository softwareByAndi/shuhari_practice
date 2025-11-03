
import {
  subjectLookup,
  topicLookup
} from '@/lib/local_db_lookup';


import { notFound } from 'next/navigation';
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

  const subject = subjectLookup.by_code[subjectCode];
  const topics = topicLookup.list.filter(t => t.subject_id === subject?.subject_id);
  

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
          <div className="titleSection mb-12">
            <h1 className="title">{content.title}</h1>
            <p className="sub_title">{content.subTitle}</p>
          </div>

          {/* Topics Cards Grid */}
          <div className="pageContent">
            <CardsGrid cards={topics.map(topic => ({
                id:           topic.topic_id,
                display_name: topic.display_name,
                description:  null,
                actionText:   'Start Practicing →',
                link:         `/practice/${fieldCode}/${subjectCode}/${topic.code}`,
                icon:         topic.symbol || '📚',
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