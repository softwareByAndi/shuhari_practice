
import colors from '@/styles/stage.module.css';
import { stage } from '@/lib/local_db_lookup';
import type { Stage } from '@/lib/types/database';

export default async function StagesToMastery() {
    return (
      <div className={styles.stageSection}>
        {stage.list
          .map((_stage: Stage) => (
            <div key={_stage.code} className={styles.stage}>
              <div className={`${styles.symbol} ${colors[_stage.code]}`}>{_stage.symbol}</div>
              <div className={styles.stageLabel}>{_stage.translation}</div>
            </div>
          ))
        }
      </div>
    );
}

const styles = {
  stageSection: "px-2 md:px-14 flex justify-around w-full text-3xl md:text-5xl",
  stage: "flex flex-col items-center",
  stageLabel: "text-sm opacity-40 font-medium text-zinc-900 dark:text-white text-center mt-2",
  symbol: ""
}
