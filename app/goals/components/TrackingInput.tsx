'use client';

import React from 'react';
import { ActionItem, NumericTracking, EnumTracking, EnumTrackingValue, ENUM_LABELS } from '@/lib/types/goals';
import { useGoals } from '@/contexts/GoalsProvider';

interface TrackingInputProps {
  actionItem: ActionItem;
  currentValue?: NumericTracking | EnumTracking;
}

export default function TrackingInput({ actionItem, currentValue }: TrackingInputProps) {
  const { updateTracking } = useGoals();

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      updateTracking(actionItem.id, value);
    }
  };

  const handleEnumChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTracking(actionItem.id, e.target.value as EnumTrackingValue);
  };

  if (actionItem.trackingType === 'numeric') {
    const numericValue = currentValue && 'value' in currentValue
      ? (currentValue as NumericTracking).value
      : 0;

    return (
      <div className="flex items-center gap-3">
        <label htmlFor={`numeric-${actionItem.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Value:
        </label>
        <input
          id={`numeric-${actionItem.id}`}
          type="number"
          value={numericValue}
          onChange={handleNumericChange}
          className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          step="any"
        />
      </div>
    );
  }

  const enumValue = currentValue && 'value' in currentValue
    ? (currentValue as EnumTracking).value
    : 'too_lazy';

  return (
    <div className="flex items-center gap-3">
      <label htmlFor={`enum-${actionItem.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Progress:
      </label>
      <select
        id={`enum-${actionItem.id}`}
        value={enumValue}
        onChange={handleEnumChange}
        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        {Object.entries(ENUM_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}