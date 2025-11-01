'use client';

import {
  useState,
  useRef,
  useEffect
} from 'react';

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
      className={`flex-grow col-span-2 rounded-xl md:rounded-2xl transition-all
        text-xl xxs:text-2xl xs:text-3xl sm:text-4xl font-semibold md:font-bold
        ${className} dark:text-zinc-800`}
      type="button"
    >
      {label}
    </button>
  );

  const renderNumberButton = (num: string) =>
    renderButton(num, () => onNumberClick(num), 'bg-gray-200 hover:bg-gray-300');

  return (
    // <div className="flex-grow h-full absolute inset-0 ">
    <div className="flex-grow grid grid-cols-6 gap-1 xxs:gap-2 xs:gap-3 md:gap-4 h-full w-full">
      {renderButton('Clear', () => onAction('CLEAR'), 'bg-red-200 hover:bg-red-300 col-span-3')}
      
      {symbols?.negative && onSymbolClick ? (
        renderButton('(neg)', () => onAction('NEGATE'), 'bg-yellow-200 hover:bg-yellow-300 col-span-3')
      ) : (<div></div>)}
      
      {/* Numbers 1-9 */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num =>
        renderNumberButton(num.toString())
      )}

      {/*row*/}
      {renderButton('?', () => onAction('CHECK_ANSWER'),'bg-green-200 hover:bg-green-300')}
      {renderNumberButton('0')}
      {symbols?.decimal && onSymbolClick ? (
        renderButton('.', () => onSymbolClick('.'), 'bg-blue-200 hover:bg-blue-300')
      ) : (<div></div>)}

      {/*row*/}



    </div>
    // </div>
  );
}