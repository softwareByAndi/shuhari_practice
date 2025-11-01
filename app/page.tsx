'use server';

import Header from '@/components/Header';
import RecentPractice from '@/components/RecentPractice';
import StagesToMastery from '@/components/StagesToMastery';
import FieldsGrid from '@/components/FieldsGrid';
import styles from '@/styles/page.module.css';

const data = {
  header: {
    title: "Shuhari Learning",
    subTitle: "Master any subject through the ancient martial arts principle of foundational embodiment",
    description: "Shuhari uses repetition to build automaticity. This frees your mind from the basics so you can focus on the deeper principles behind the rules. Eventually, you internalize these principles and transcend conscious rule-following entirely; responding fluidly from embodied understanding.",
  }
}

export default async function Home() {
  return (
    <div className="page">
      <Header />
      <main>

          <div className={styles.titleSection}>
            <h1 className={styles.title}>{data.header.title}</h1>
            <h2 className={styles.sub_title}>{data.header.subTitle}</h2>
            <p className={styles.title_description}>{data.header.description}</p>
        </div>

          <div className={styles.pageContent}>
            <StagesToMastery />
            <FieldsGrid />
            <RecentPractice />
          </div>

      </main>
    </div>
  );
}


