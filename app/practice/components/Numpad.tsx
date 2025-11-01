'use client';


export type ACTION = 'CLEAR'
  | 'CHECK_ANSWER'
  | 'NEGATE';
;

interface NumpadProps {
  onNumberClick: (num: string) => void;
  onAction: (action: ACTION) => void;
  onCheckAnswer?: () => void;
  onSymbolClick?: (symbol: string) => void;
  symbols?: {
    negative?: boolean;
    decimal?: boolean;
  };
  hasNegatives?: boolean;
  submitDisabled?: boolean;
}

export function Numpad({
  onNumberClick,
  onAction,
  onSymbolClick,
  symbols,
}: NumpadProps) {
  const renderButton = (label: string, onClick: () => void, className = '') => (
    <button
      key={label}
      onClick={onClick}
      className={`p-4 text-2xl font-semibold rounded-lg transition-all
        ${className} hover:scale-105 active:scale-95 dark:text-zinc-800`}
      type="button"
    >
      {label}
    </button>
  );

  const renderNumberButton = (num: string) =>
    renderButton(num, () => onNumberClick(num), 'bg-gray-200 hover:bg-gray-300');

  return (
    <div className="grid grid-cols-3 gap-3 w-full mx-auto">
      {/* Numbers 1-9 */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num =>
        renderNumberButton(num.toString())
      )}

      {/* Bottom row */}

      {renderButton('Clear', () => onAction('CLEAR'), 'bg-red-200 hover:bg-red-300')}


      {renderNumberButton('0')}

      {renderButton('?', () => onAction('CHECK_ANSWER'),'bg-green-200 hover:bg-green-300')}

      {symbols?.decimal && onSymbolClick ? (
        renderButton('.', () => onSymbolClick('.'), 'bg-blue-200 hover:bg-blue-300')
      ) : (<div></div>)}

      <div></div>

      {symbols?.negative && onSymbolClick ? (
        renderButton('(neg)', () => onAction('NEGATE'), 'bg-yellow-200 hover:bg-yellow-300')
      ) : (<div></div>)}





    </div>
  );
}