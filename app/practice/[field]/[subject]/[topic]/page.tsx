import { 
  getFieldByCode, 
  getSubjectByCode, 
  getTopicByCode 
} from '@/lib/supabase-v2';
import { TOPIC_ICONS } from '@/lib/topic-icons';

import styles from '@/styles/page.module.css';

import { SessionProvider } from '@/contexts/SessionProvider';

import { notFound } from 'next/navigation';
import Arithmetic from './Arithmetic';
import CondensedStagesToMastery from '@/components/CondensedStagesToMastery';
import Header from '@/components/Header';
import BreadCrumbs from '@/components/BreadCrumbs';


function _temp_save_old_code() {
  // return (
  //   <SessionProvider>
  //     <PracticeContentFixed />
  //   </SessionProvider>
  // );
}


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
      <Header params={params} />
      <main className="!max-w-xl mx-auto">
        <section className="titleSection">
          <div className="flex items-center gap-4 justify-center">
            <div className="text-3xl md:text-4xl">{content.icon}</div>
            <h1 className="title">{content.title}</h1>
          </div>
        </section>
        
        <section className="pageContent">
          <Arithmetic topicCode={topicCode} />
        </section>
      </main>
      <footer>
        <CondensedStagesToMastery />
      </footer>
    </div>
  );
}