import styles from '@/styles/page.module.css';
import CondensedStagesToMastery from '@/components/CondensedStagesToMastery';
import SubjectsGrid from '@/components/SubjectsGrid';
import Header from '@/components/Header';
import { getFieldByCode } from '@/lib/supabase-v2';
import { notFound } from 'next/navigation';

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

  // Fetch field data server-side
  const field = await getFieldByCode(fieldCode);

  // If field not found, show 404
  if (!field) {
    notFound();
  }

  // Get content for this field or use default
  const content = fieldContent[fieldCode] || fieldContent.default;

  // If field exists in database, override the title with the display name
  const displayTitle = field.display_name ? `${field.display_name} Practice` : content.title;

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>

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
      <footer className={styles.footer}>
        <CondensedStagesToMastery />
      </footer>
    </div>
  );
}