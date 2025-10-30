'use client';

interface SimpleNumpadProps {
  onInput: (value: string) => void; // value can be '0'-'9', 'clear', or 'submit'
  disabled?: boolean;
}

export function SimpleNumpad({ onInput, disabled = false }: SimpleNumpadProps) {
  const renderButton = (label: string, value: string, className = '') => (
    <button
      key={label}
      onClick={() => onInput(value)}
      disabled={disabled}
      className={`p-4 text-2xl font-semibold rounded-lg transition-all
        ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {/* Numbers 1-9 */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num =>
        renderButton(num.toString(), num.toString(), 'bg-gray-200 hover:bg-gray-300')
      )}

      {/* Bottom row */}
      {renderButton('Clear', 'clear', 'bg-red-200 hover:bg-red-300')}
      {renderButton('0', '0', 'bg-gray-200 hover:bg-gray-300')}
      <div /> {/* Empty space */}

      {/* Submit button */}
      <button
        key="submit"
        onClick={() => onInput('submit')}
        disabled={disabled}
        className={`col-span-3 p-4 text-2xl font-semibold rounded-lg transition-all
          ${disabled
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