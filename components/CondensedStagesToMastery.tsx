
import colors from '../styles/stage.module.css'

export default async function StagesToMastery() {
    return (
      <div className={styles.stageSection}>
        {STAGES.map((stage) => (
          <div key={stage.code} className={styles.stage}>
            <div className={`${styles.symbol} ${stage.color}`}>{stage.symbol}</div>
            <div className={styles.stageLabel}>
              {stage.display_name.split(' - ')[1]}
            </div>
          </div>
        ))}
      </div>
    );
}


const styles = {
  stageSection: "px-2 md:px-14 flex justify-around w-full text-3xl md:text-5xl",
  stage: "flex flex-col items-center",
  stageLabel: "text-sm opacity-40 font-medium text-zinc-900 dark:text-white text-center mt-2",
  symbol: ""
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

