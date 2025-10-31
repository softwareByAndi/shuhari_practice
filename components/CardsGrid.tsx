
import styles from '@/styles/card.module.css';

interface CardsGridProps {
  cards: (null | {
    id: number;
    display_name: string;
    description: string | null;
    actionText: string | null;
    link: string | null;
    icon: string;
    isActive: boolean;
    colorClass: string | null;
  })[];
}

export default function CardsGrid({ cards }: CardsGridProps) {

  return (
    <div className={styles._grid}>
      {cards.map((card, index) => {
        return !card ? (
            <div
              key={`loading-${index}`}
              className={`${styles.card} ${styles.cardDisabled} h-48 flex items-center justify-center`}
            >
              <div className="opacity-20">Loading...</div>
            </div>
        ) : card.isActive ? (
          
            <a
              key={card.id}
              href={card.link ?? undefined}
              className={styles.card}
            >
              <div className={`${styles.cardGlow} ${card.colorClass}`}></div>
              <div className={styles.cardContent}>
                <div className={styles.cardIcon}>{card.icon}</div>
                <h3 className={styles.cardName}>{card.display_name}</h3>
                {card.description  && <p className={styles.cardDescription}>{card.description}</p>}
                {card.actionText   && <p className={styles.cardAction}>{card.actionText}</p>}
              </div>
            </a>

        ) : (
            <div
              key={card.id}
              className={`${styles.card} ${styles.cardDisabled}`}
            >
              <div className={styles.cardContent}>
                <div className={`${styles.cardIcon} ${styles.cardIconDisabled}`}>{card.icon}</div>
                <h3 className={`${styles.cardName} ${styles.cardNameDisabled}`}>{card.display_name}</h3>
                {card.description  && <p className={styles.cardDescriptionDisabled}>{card.description}</p>}
                {card.actionText   && <p className={`${styles.cardAction} ${styles.cardActionDisabled}`}>{card.actionText}</p>}
              </div>
            </div>

        );
      })}
    </div>
  );
}