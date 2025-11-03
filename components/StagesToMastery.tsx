'use server';

import StageCard from './StageCard';
import colors from '@/styles/stage.module.css'
import { stageLookup } from '@/lib/local_db_lookup';

export default async function StagesToMastery() {
    return (
        <div className={styles.stageSection}>
            <h2 className={styles.stageSectionTitle}>
              Your 7-Stage Journey to Mastery
            </h2>
            <StageCard
                key={stageLookup.by_code.hatsu.code}
                symbol={stageLookup.by_code.hatsu.symbol}
                display_name={stageLookup.by_code.hatsu.display_name}
                description={stageLookup.by_code.hatsu.description}
                custom_css={{ symbol: colors.hatsu, title: colors.hatsu }}
            />
            <div className={styles.stageGrid}>
            {stageLookup.list
              .filter(s => s.code != 'hatsu')
              .map((stage) => (
                  <StageCard
                    key={stage.code}
                    symbol={stage.symbol}
                    display_name={stage.display_name}
                    description={stage.description}
                    custom_css={{ symbol: colors[stage.code], title: colors[stage.code] }}
                  />
              ))
            }
            </div>
        </div>
    );
}


const styles = {
  stageSection: "flex flex-col gap-2 md:gap-6",
  stageSectionTitle: "text-xl md:text-3xl font-bold text-zinc-900 dark:text-white text-center",
  stageGrid: "grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6",
}
