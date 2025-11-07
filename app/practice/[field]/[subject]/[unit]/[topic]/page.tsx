import {
  topicLookup
} from '@/lib/local_db_lookup';
import type {
  Topic
} from '@/lib/types/database';

import {
  SessionProvider
} from '@/contexts/SessionProvider';

import { notFound } from 'next/navigation';
import PracticeSession from './PracticeSession';
import CondensedStagesToMastery from '@/components/CondensedStagesToMastery';
import Header from '@/components/Header';


interface SubjectPageProps {
  params: Promise<{
    topic: string;
  }>;
}

export default async function PracticePage({ params }: SubjectPageProps) {
  const {
    topic: topicCode
  } = await params;

  const extTopic = topicLookup.by_code[topicCode];
  if (!extTopic) {
    return notFound();
  }

  const topic = extTopic as Topic
  const unit = extTopic.unit;
  const subject = extTopic.subject;
  const field = extTopic.field;

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
              unit={unit}
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