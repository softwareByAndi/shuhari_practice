'use client';

import React, { useState } from 'react';
import { ActionItem, NumericTracking, TimeTracking, EnumTracking, EnumTrackingValue, ENUM_LABELS } from '@/lib/types/goals';
import { useGoals } from '@/contexts/GoalsProvider';
import MobileTimePicker from '@/components/MobileTimePicker';
import Timer from './Timer';

interface TrackingInputProps {
  actionItem: ActionItem;
  currentValue?: NumericTracking | TimeTracking | EnumTracking;
  compact?: boolean;
}

export default function TrackingInput({ actionItem, currentValue, compact = false }: TrackingInputProps) {
  const { updateTracking, updateCompletionStatus } = useGoals();
  const [showTimer, setShowTimer] = useState(false);

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? null : parseFloat(e.target.value);
    if (value === null || !isNaN(value)) {
      updateTracking(actionItem.id, value);
    }
  };

  const handleTimeChange = (milliseconds: number) => {
    updateTracking(actionItem.id, milliseconds);
  };

  const handleEnumChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTracking(actionItem.id, e.target.value as EnumTrackingValue);
  };

  const handleCompletionToggle = () => {
    updateCompletionStatus(actionItem.id, !isCompleted);
  };

  const handleTimerComplete = () => {
    if (actionItem.trackingType === 'time') {
      // Keep the current time value and mark as completed
      const timeValue = currentValue && 'value' in currentValue && typeof currentValue.value === 'number' ? currentValue.value : 0;
      updateTracking(actionItem.id, timeValue);
      updateCompletionStatus(actionItem.id, true);
    }
    setShowTimer(false);
  };

  const isCompleted = currentValue && 'completed' in currentValue ? currentValue.completed : false;

  if (compact) {
    return (
      <div className="flex flex-col items-center space-y-3">
        <div className="text-center">
          {actionItem.trackingType === 'numeric' ? (
            <input
              id={`numeric-${actionItem.id}`}
              type="number"
              value={currentValue && 'value' in currentValue && currentValue.value !== null ? currentValue.value : ''}
              onChange={handleNumericChange}
              disabled={!isCompleted}
              className={`w-full text-center text-2xl font-semibold px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isCompleted
                  ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                }`}
              step="any"
              placeholder="0"
            />
          ) : actionItem.trackingType === 'time' ? (
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1">
                <MobileTimePicker
                  value={currentValue && 'value' in currentValue && typeof currentValue.value === 'number' ? currentValue.value : 0}
                  onChange={handleTimeChange}
                  disabled={!isCompleted}
                  mode="duration"
                />
              </div>
              <button
                onClick={() => setShowTimer(true)}
                disabled={!isCompleted || !(currentValue && 'value' in currentValue && currentValue.value > 0)}
                className={`p-2 rounded-lg transition-colors ${
                  isCompleted && currentValue && 'value' in currentValue && currentValue.value > 0
                    ? 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                    : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
                title={!isCompleted ? "Mark as in progress first" : !(currentValue && 'value' in currentValue && currentValue.value > 0) ? "Set a time value first" : "Start timer"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          ) : (
            <select
              id={`enum-${actionItem.id}`}
              value={currentValue && 'value' in currentValue && currentValue.value ? currentValue.value : 'too_lazy'}
              onChange={handleEnumChange}
              disabled={!isCompleted}
              className={`w-full text-center px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isCompleted
                  ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                }`}
            >
              {Object.entries(ENUM_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={handleCompletionToggle}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors
            ${isCompleted
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
        >
          {isCompleted ? 'Completed ✓' : 'Complete'}
        </button>

        {showTimer && actionItem.trackingType === 'time' && (
          <Timer
            initialTime={currentValue && 'value' in currentValue && typeof currentValue.value === 'number' ? currentValue.value : 0}
            onComplete={handleTimerComplete}
            onClose={() => setShowTimer(false)}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={`complete-${actionItem.id}`}
          checked={isCompleted}
          onChange={(e) => updateCompletionStatus(actionItem.id, e.target.checked)}
          className="h-5 w-5 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
          title="Mark as completed"
        />

      {actionItem.trackingType === 'numeric' ? (
        <input
          id={`numeric-${actionItem.id}`}
          type="number"
          value={currentValue && 'value' in currentValue && currentValue.value !== null ? currentValue.value : ''}
          onChange={handleNumericChange}
          disabled={!isCompleted}
          className={`w-24 px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
            ${isCompleted
              ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
            }`}
          step="any"
          placeholder="0"
        />
      ) : actionItem.trackingType === 'time' ? (
        <div className="flex items-center gap-2">
          <MobileTimePicker
            value={currentValue && 'value' in currentValue && typeof currentValue.value === 'number' ? currentValue.value : 0}
            onChange={handleTimeChange}
            disabled={!isCompleted}
            mode="duration"
          />
          <button
            onClick={() => setShowTimer(true)}
            disabled={!isCompleted || !(currentValue && 'value' in currentValue && currentValue.value > 0)}
            className={`p-1.5 rounded-lg transition-colors ${
              isCompleted && currentValue && 'value' in currentValue && currentValue.value > 0
                ? 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            title={!isCompleted ? "Mark as in progress first" : !(currentValue && 'value' in currentValue && currentValue.value > 0) ? "Set a time value first" : "Start timer"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      ) : (
        <select
          id={`enum-${actionItem.id}`}
          value={currentValue && 'value' in currentValue && currentValue.value ? currentValue.value : 'too_lazy'}
          onChange={handleEnumChange}
          disabled={!isCompleted}
          className={`px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
            ${isCompleted
              ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
            }`}
        >
          {Object.entries(ENUM_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      )}
      </div>

      {showTimer && actionItem.trackingType === 'time' && (
        <Timer
          initialTime={currentValue && 'value' in currentValue && typeof currentValue.value === 'number' ? currentValue.value : 0}
          onComplete={handleTimerComplete}
          onClose={() => setShowTimer(false)}
        />
      )}
    </>
  );
}