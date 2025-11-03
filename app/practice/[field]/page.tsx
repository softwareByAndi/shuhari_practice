import { fieldLookup } from '@/lib/local_db_lookup';

import styles from '@/styles/page.module.css';

import { notFound } from 'next/navigation';
import CondensedStagesToMastery from '@/components/CondensedStagesToMastery';
import SubjectsGrid from '@/components/SubjectsGrid';
import Header from '@/components/Header';

// Field-specific content configuration
const fieldContent: Record<string, { title: string; subTitle: string; description: string }> = {
  math: {
    title: "Mathematics Practice",
    subTitle: "Enhance your mathematical skills through targeted practice sessions.",
    description: "Choose a subject to explore topics and begin your 7-stage journey."
  },
  chemistry: {
    title: "Chemistry Practice",
    subTitle: "Master chemical concepts through interactive practice.",
    description: "Choose a subject to explore topics and begin your 7-stage journey."
  },
  physics: {
    title: "Physics Practice",
    subTitle: "Understand the laws of nature through guided practice.",
    description: "Choose a subject to explore topics and begin your 7-stage journey."
  },
  biology: {
    title: "Biology Practice",
    subTitle: "Explore life sciences through structured learning.",
    description: "Choose a subject to explore topics and begin your 7-stage journey."
  },
  default: {
    title: "Practice",
    subTitle: "Enhance your skills through targeted practice sessions.",
    description: "Choose a subject to explore topics and begin your 7-stage journey."
  }
};

export default async function FieldPractice({ params }: { params: Promise<{ field: string }> }) {
  const { field: fieldCode } = await params;
  const field = fieldLookup.by_code[fieldCode];

  // If field not found, show 404
  if (!field) {
    return notFound();
  }

  const content = fieldContent[fieldCode] || fieldContent.default;
  const displayTitle = field.display_name ? `${field.display_name} Practice` : content.title;

  return (
    <div className="page">
      <Header />
      <main>

          {/* Header */}
          <div className={styles.titleSection}>
              <h1 className={styles.title}>{displayTitle}</h1>
              <h2 className={styles.sub_title}>{content.subTitle}</h2>
              <p className={styles.title_description}>{content.description}</p>
          </div>


          <div className={styles.pageContent}>
              <SubjectsGrid fieldId={field.field_id} fieldCode={field.code} />
          </div>

      </main>
      <footer>
        <CondensedStagesToMastery />
      </footer>
    </div>
  );
}