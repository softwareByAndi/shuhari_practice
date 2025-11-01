import { 
  getFieldByCode, 
  getSubjectByCode, 
  getTopicByCode 
} from '@/lib/supabase-v2';
import { 
  TOPIC_ICONS
} from '@/lib/topic-icons';

import {
  SessionProvider
} from '@/contexts/SessionProvider';

import { notFound } from 'next/navigation';
import PracticeSession from './PracticeSession';
import CondensedStagesToMastery from '@/components/CondensedStagesToMastery';
import Header from '@/components/Header';


interface SubjectPageProps {
  params: Promise<{
    field: string;
    subject: string;
    topic: string;
  }>;
}

export default async function PracticePage({ params }: SubjectPageProps) {
  const {
    field: fieldCode,
    subject: subjectCode,
    topic: topicCode
  } = await params;

  const [
    topic,
    subject,
    field
  ] = await Promise.all([
    getTopicByCode(topicCode),
    getSubjectByCode(subjectCode),
    getFieldByCode(fieldCode)
  ])


  if (!topic || !subject || !field) {
    return notFound();
  }

  const content = {
    title: `${topic.display_name} Practice`,
    icon: TOPIC_ICONS[topic.code] || '📝',
  }

  return (
    <div className="page">
      <Header params={params} sectionIcon={content.icon} sectionTitle={content.title} />
      <main className="mx-auto">
        {/* <section className="titleSection mb-4">
          <div className="flex items-center justify-center gap-4">
            <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl">{content.icon}</div>
            <h1 className="text-lg xs:text-2xl sm:text-3xl md:text-4xl font-bold">{content.title}</h1>
          </div>
        </section> */}

        <section className="pageContent  w-full">
          <SessionProvider >
            <PracticeSession 
              topic={topic} 
              subject={subject} 
              field={field} 
            />
          </SessionProvider>
        </section>
      </main>
      <footer>
        <CondensedStagesToMastery />
      </footer>
    </div>
  );
}