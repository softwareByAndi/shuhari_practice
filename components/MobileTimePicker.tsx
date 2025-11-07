'use client';

import React, { useState, useEffect } from 'react';
import Picker from 'react-mobile-picker';

interface MobileTimePickerProps {
  value: number; // Value in milliseconds or minutes depending on mode
  onChange: (value: number) => void;
  mode?: 'duration' | 'progression'; // duration = h:mm:ss, progression = minutes only
  disabled?: boolean;
  label?: string;
}

export default function MobileTimePicker({
  value,
  onChange,
  mode = 'duration',
  disabled = false,
  label
}: MobileTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Convert value to picker selections
  const getInitialSelections = () => {
    if (mode === 'progression') {
      // For progression, value is in minutes (can be decimal)
      const absValue = Math.abs(value);
      const minutes = Math.floor(absValue);
      const seconds = Math.round((absValue - minutes) * 60);
      return {
        sign: value < 0 ? '-' : '+',
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
      };
    } else {
      // For duration, value is in milliseconds
      const totalSeconds = Math.floor(value / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return {
        sign: '+',
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
      };
    }
  };

  const [pickerValue, setPickerValue] = useState(getInitialSelections());

  // Update picker value when prop value changes
  useEffect(() => {
    setPickerValue(getInitialSelections());
  }, [value, mode]);

  // Generate options for the picker
  const getSelections = () => {
    return {
      sign: mode === 'progression' ? ['+', '-'] : ['+'],
      minutes: Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0')),
      seconds: Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))
    };
  };

  const handleChange = (newValue: any) => {
    setPickerValue(newValue);
  };

  const handleConfirm = () => {
    const minutes = parseInt(pickerValue.minutes || '0');
    const seconds = parseInt(pickerValue.seconds || '0');

    if (mode === 'progression') {
      // Convert to minutes (with decimal for seconds)
      const totalMinutes = minutes + seconds / 60;
      const signedValue = pickerValue.sign === '-' ? -totalMinutes : totalMinutes;
      onChange(signedValue);
    } else {
      // Convert to milliseconds
      const totalSeconds = minutes * 60 + seconds;
      onChange(totalSeconds * 1000);
    }
    setIsOpen(false);
  };

  const formatDisplayValue = () => {
    if (mode === 'progression') {
      const absValue = Math.abs(value);
      const minutes = Math.floor(absValue);
      const seconds = Math.round((absValue - minutes) * 60);
      const sign = value < 0 ? '-' : '+';
      return `${sign}${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      // For duration, value is in milliseconds
      const totalSeconds = Math.floor(value / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  return (
    <>
      <div className="inline-block">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          className={`px-4 py-2 border rounded-lg font-mono text-lg transition-colors
            ${disabled
              ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer'
            }`}
        >
          {formatDisplayValue() || '0:00'}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Picker Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-md shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-blue-600 dark:text-blue-400 font-medium"
              >
                Cancel
              </button>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === 'progression' ? 'Set Progression' : 'Set Duration'}
              </h3>
              <button
                type="button"
                onClick={handleConfirm}
                className="text-blue-600 dark:text-blue-400 font-medium"
              >
                Done
              </button>
            </div>

            {/* Picker */}
            <div className="p-4">
              <Picker
                value={pickerValue}
                onChange={handleChange}
                height={180}
                itemHeight={36}
              >
                {Object.entries(getSelections()).map(([name, options]) => (
                  <Picker.Column key={name} name={name}>
                    {options.map((option: string) => (
                      <Picker.Item key={option} value={option}>
                        {name === 'sign' ? option :
                         name === 'minutes' ? `${option}m` :
                         `${option}s`
                        }
                      </Picker.Item>
                    ))}
                  </Picker.Column>
                ))}
              </Picker>
            </div>

            {/* Helper text */}
            <div className="px-4 pb-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              {mode === 'progression'
                ? 'Set time change per session (use +/- sign)'
                : 'Set duration (mm:ss format)'}
            </div>
          </div>
        </div>
      )}
    </>
  );
}