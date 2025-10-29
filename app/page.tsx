import Header from '@/components/Header';
import RecentPractice from '@/components/RecentPractice';
import styles from './page.module.css';

export default function Home() {
  const subjects = [
    { name: 'Mathematics', icon: '🔢', href: '/practice/math', color: 'bg-blue-500', enabled: true },
    { name: 'Chemistry', icon: '⚗️', href: '/practice/chemistry', color: 'bg-green-500', enabled: false },
    { name: 'Biology', icon: '🧬', href: '/practice/biology', color: 'bg-emerald-500', enabled: false },
    { name: 'Programming', icon: '💻', href: '/practice/programming', color: 'bg-purple-500', enabled: false },
    { name: 'Physics', icon: '⚛️', href: '/practice/physics', color: 'bg-indigo-500', enabled: false },
    { name: 'History', icon: '📜', href: '/practice/history', color: 'bg-amber-500', enabled: false },
  ];

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.mainContent}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>
            ShuHaRi Learning
          </h1>
          <p className={styles.pageSubtitle}>
            Master any subject through the ancient martial arts principle of learning
          </p>
        </div>

        {/* ShuHaRi Explanation */}
        <div className={styles.shuHaRiSection}>
          <div className={styles.shuHaRiCard}>
            <div className={`${styles.shuHaRiSymbol} shu`}>守</div>
            <h3 className={`${styles.shuHaRiTitle} shu`}>Shu - Obey</h3>
            <p className={styles.shuHaRiDescription}>
              Learn the fundamentals and follow traditional wisdom. Build a strong foundation through repetition and adherence to proven methods.
            </p>
          </div>
          <div className={styles.shuHaRiCard}>
            <div className={`${styles.shuHaRiSymbol} ha`}>破</div>
            <h3 className={`${styles.shuHaRiTitle} ha`}>Ha - Break</h3>
            <p className={styles.shuHaRiDescription}>
              Question and expand upon the basics. Explore variations and adapt techniques to find what works best for you.
            </p>
          </div>
          <div className={styles.shuHaRiCard}>
            <div className={`${styles.shuHaRiSymbol} ri`}>離</div>
            <h3 className={`${styles.shuHaRiTitle} ri`}>Ri - Leave</h3>
            <p className={styles.shuHaRiDescription}>
              Transcend the rules and make the knowledge your own. Create innovative solutions and teach others.
            </p>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className={styles.subjectsSection}>
          <h2 className={styles.sectionTitle}>Choose Your Subject</h2>
          <div className={styles.subjectsGrid}>
            {subjects.map((subject) => (
              subject.enabled ? (
                <a
                  key={subject.name}
                  href={subject.href}
                  className={styles.subjectCard}
                >
                  <div className={`${styles.subjectGlow} ${subject.color}`}></div>
                  <div className={styles.subjectContent}>
                    <div className={styles.subjectIcon}>{subject.icon}</div>
                    <h3 className={styles.subjectName}>
                      {subject.name}
                    </h3>
                    <p className={styles.subjectAction}>
                      Start your journey →
                    </p>
                  </div>
                </a>
              ) : (
                <div
                  key={subject.name}
                  className={styles.subjectCardDisabled}
                >
                  <div className={styles.subjectContent}>
                    <div className={styles.subjectIconDisabled}>{subject.icon}</div>
                    <h3 className={styles.subjectNameDisabled}>
                      {subject.name}
                    </h3>
                    <p className={styles.subjectActionDisabled}>
                      Coming soon...
                    </p>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className={styles.recentSection}>
          <h2 className={styles.sectionTitle}>Recent Practice</h2>
          <RecentPractice />
        </div>
      </main>
    </div>
  );
}
