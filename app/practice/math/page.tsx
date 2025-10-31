'use server';

import old_styles from './page.module.css';
import styles from '@/styles/page.module.css';
import StagesToMastery from '@/components/StagesToMastery';
import BreadCrumbs from '@/components/BreadCrumbs';
import SubjectsGrid from '@/components/SubjectsGrid';
import Header from '@/components/Header';

const data = {
  header: {
    title: "Mathematics Practice",
    subTitle: "Enhance your mathematical skills through targeted practice sessions.",
    description: "Choose a subject to explore topics and begin your 7-stage journey."
  },
  field: {
    id: 101,
    code: 'math'
  }
}

export default async function MathPractice() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        {/* <BreadCrumbs paths={[ { path: "/", label: "Home" } ]} /> */}

        {/* Header */}
        <div className={styles.titleSection}>
            <h1 className={styles.title}>{data.header.title}</h1>
            <h2 className={styles.sub_title}>{data.header.subTitle}</h2>
            <p className={styles.title_description}>{data.header.description}</p>
        </div>


          <div className={styles.pageContent}>
              <StagesToMastery />
              <SubjectsGrid fieldId={data.field.id} fieldCode={data.field.code} />
          </div>

      </main>
    </div>
  );
}