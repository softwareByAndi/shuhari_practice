'use server';

interface StageCardProps {
  symbol: string;
  display_name: string;
  description: string;
  custom_css: {
    symbol: string;
    title: string;
  };
}

export default async function StageCard({
  symbol,
  display_name,
  description,
  custom_css
}: StageCardProps) {
  return (
    <div className="rounded-xl md:rounded-2xl bg-white dark:bg-zinc-800
                    py-4 px-2 md:p-6
                    shadow-lg border border-zinc-200 dark:border-zinc-700"
    >
        <div className={`text-2xl md:text-4xl mb-2 md:mb-3 text-center ${custom_css.symbol}`}>
            {symbol}
        </div>
        <h3 className={`md:text-lg lg:text-xl font-semibold mb-2 text-center ${custom_css.title}`}>
            {display_name}
        </h3>
        <p className={`text-xs md:text-sm md:text-base text-zinc-600 dark:text-zinc-400 text-center`}>
          {description}
        </p>
    </div>
  );
}