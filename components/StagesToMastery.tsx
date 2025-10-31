'use server';

import StageCard from './StageCard';
import colors from '../styles/stage.module.css'

export default async function StagesToMastery() {
    return (
        <div className={styles.stageSection}>
            <h2 className={styles.stageSectionTitle}>
              Your 7-Stage Journey to Mastery
            </h2>
            <StageCard
                key={STAGES[0].code}
                symbol={STAGES[0].symbol}
                display_name={STAGES[0].display_name}
                description={STAGES[0].description}
                custom_css={{ symbol: STAGES[0].color, title: STAGES[0].color }}
            />
            <div className={styles.stageGrid}>
            {STAGES.slice(1).map((stage) => (
                <StageCard
                key={stage.code}
                symbol={stage.symbol}
                display_name={stage.display_name}
                description={stage.description}
                custom_css={{ symbol: stage.color, title: stage.color }}
                />
            ))}
            </div>
        </div>
    );
}


const styles = {
  stageSection: "flex flex-col gap-2 md:gap-6",
  stageSectionTitle: "text-xl md:text-3xl font-bold text-zinc-900 dark:text-white text-center",
  stageGrid: "grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6",
}

const STAGES = [
  {
    code: 'hatsu',
    symbol: '初',
    display_name: 'Hatsu - Begin',
    description: 'First exposure. Building familiarity with basic concepts.',
    color: '',
  },
  {
    code: 'shu',
    symbol: '守',
    display_name: 'Shu - Obey',
    description: 'Following patterns. Building automaticity through repetition.',
    color: colors.shu,
  },
  {
    code: 'kan',
    symbol: '鑑',
    display_name: 'Kan - Mirror',
    description: 'Reflecting patterns. Recognizing structures and relationships.',
    color: '',
  },
  {
    code: 'ha',
    symbol: '破',
    display_name: 'Ha - Break',
    description: 'Questioning patterns. Exploring variations and edge cases.',
    color: colors.ha,
  },
  {
    code: 'toi',
    symbol: '問',
    display_name: 'Toi - Question',
    description: 'Deep inquiry. Understanding the why behind the how.',
    color: '',
  },
  {
    code: 'ri',
    symbol: '離',
    display_name: 'Ri - Leave',
    description: 'Transcending rules. Creating innovative solutions.',
    color: colors.ri,
  },
  {
    code: 'ku',
    symbol: '空',
    display_name: 'Ku - Void',
    description: 'Effortless mastery. Teaching and inspiring others.',
    color: '',
  },
]

