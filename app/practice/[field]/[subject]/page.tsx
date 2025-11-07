
import {
  subjectLookup,
  unitLookup
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
  const units = unitLookup.list.filter(u => u.subject_id === subject?.subject_id);


  if (!subject) {
    return notFound();
  }

  const content = {
    title: `${subject.display_name} Units`,
    subTitle: 'Choose a unit to explore. Progress through 7 stages from Hatsu to Ku.',
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

          {/* Units Cards Grid */}
          <div className="pageContent">
            <CardsGrid cards={units.map(unit => ({
                id:           unit.unit_id,
                display_name: unit.display_name,
                description:  unit.description || null,
                actionText:   'View Topics →',
                link:         `/practice/${fieldCode}/${subjectCode}/${unit.code}`,
                icon:         unit.symbol || '📚',
                isActive:     unit.is_active,
                color:        unit.tw_color || null,
            }))} />
          </div>

      </main>
      <footer>
        <CondensedStagesToMastery />
      </footer>
    </div>
  );
}