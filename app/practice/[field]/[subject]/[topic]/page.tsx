import {
  fieldLookup,
  subjectLookup,
  topicLookup
} from '@/lib/local_db_lookup';

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

  const field = fieldLookup.by_code[fieldCode];
  const subject = subjectLookup.by_code[subjectCode];
  const topic = topicLookup.by_code[topicCode];

  if (!topic || !subject || !field) {
    return notFound();
  }

  const content = {
    title: `${topic.display_name} Practice`,
    icon: topic.symbol || '📝',
  }

  return (
    <div className="page">
      <Header params={params} sectionIcon={content.icon} sectionTitle={content.title} />
      <main className="mx-auto">

        <section className="pageContent w-full">
          <SessionProvider>
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