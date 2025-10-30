'use client';

import React from 'react';

interface NumpadProps {
  onNumberClick: (num: string) => void;
  onClear: () => void;
  onBackspace?: () => void;
  onNegative?: () => void;
  onSubmit: () => void;
  hasNegatives?: boolean;
  submitDisabled?: boolean;
}

export function Numpad({
  onNumberClick,
  onClear,
  onBackspace,
  onNegative,
  onSubmit,
  hasNegatives = false,
  submitDisabled = false
}: NumpadProps) {
  const renderButton = (label: string, onClick: () => void, className = '') => (
    <button
      onClick={onClick}
      className={`p-4 text-2xl font-semibold rounded-lg transition-all
        ${className} hover:scale-105 active:scale-95`}
      type="button"
    >
      {label}
    </button>
  );

  const renderNumberButton = (num: string) =>
    renderButton(num, () => onNumberClick(num), 'bg-gray-200 hover:bg-gray-300');

  return (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {/* Numbers 1-9 */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num =>
        renderNumberButton(num.toString())
      )}

      {/* Bottom row */}
      {hasNegatives && onNegative ? (
        renderButton('+/−', onNegative, 'bg-yellow-200 hover:bg-yellow-300')
      ) : (
        renderButton('Clear', onClear, 'bg-red-200 hover:bg-red-300')
      )}

      {renderNumberButton('0')}

      {hasNegatives ? (
        renderButton('Clear', onClear, 'bg-red-200 hover:bg-red-300')
      ) : onBackspace ? (
        renderButton('←', onBackspace, 'bg-orange-200 hover:bg-orange-300')
      ) : (
        <div />
      )}

      {/* Submit button */}
      <button
        onClick={onSubmit}
        disabled={submitDisabled}
        className={`col-span-3 p-4 text-2xl font-semibold rounded-lg transition-all
          ${submitDisabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 active:scale-95'
          }`}
        type="submit"
      >
        Submit
      </button>
    </div>
  );
}