import {
  subjectLookup,
  unitLookup,
  topicLookup
} from '@/lib/local_db_lookup';

import { notFound } from 'next/navigation';
import CardsGrid from '@/components/CardsGrid';
import CondensedStagesToMastery from '@/components/CondensedStagesToMastery';
import Header from '@/components/Header';

interface UnitPageProps {
  params: Promise<{
    field: string;
    subject: string;
    unit: string;
  }>;
}

export default async function UnitPage({ params }: UnitPageProps) {
  const { field: fieldCode, subject: subjectCode, unit: unitCode } = await params;

  const subject = subjectLookup.by_code[subjectCode];
  const unit = unitLookup.by_code[unitCode];
  const topics = topicLookup.list.filter(t => t.unit_id === unit?.unit_id);

  if (!subject || !unit) {
    return notFound();
  }

  const content = {
    title: `${unit.display_name} Topics`,
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
                description:  topic.description || null,
                actionText:   'Start Practicing →',
                link:         `/practice/${fieldCode}/${subjectCode}/${unitCode}/${topic.code}`,
                icon:         topic.symbol || '📚',
                isActive:     topic.is_active,
                color:        topic.tw_color || null,
            }))} />
          </div>

      </main>
      <footer>
        <CondensedStagesToMastery />
      </footer>
    </div>
  );
}