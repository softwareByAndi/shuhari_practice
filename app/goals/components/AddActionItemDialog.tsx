'use client';

import React, { useState } from 'react';
import { useGoals } from '@/contexts/GoalsProvider';

interface AddActionItemDialogProps {
  goalId: string;
  onClose: () => void;
}

export default function AddActionItemDialog({ goalId, onClose }: AddActionItemDialogProps) {
  const { addActionItem } = useGoals();
  const [title, setTitle] = useState('');
  const [trackingType, setTrackingType] = useState<'numeric' | 'enum'>('enum');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter an action item title');
      return;
    }

    addActionItem(goalId, title.trim(), trackingType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Dialog */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Add Action Item
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="action-title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Action Item Title
              </label>
              <input
                id="action-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError('');
                }}
                placeholder="Enter action item..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
              {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tracking Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tracking-type"
                    value="enum"
                    checked={trackingType === 'enum'}
                    onChange={() => setTrackingType('enum')}
                    className="mr-2"
                  />
                  <div>
                    <span className="font-medium">Progress Level</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Track with fun labels like "Too Lazy", "It Got Done", etc.
                    </p>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tracking-type"
                    value="numeric"
                    checked={trackingType === 'numeric'}
                    onChange={() => setTrackingType('numeric')}
                    className="mr-2"
                  />
                  <div>
                    <span className="font-medium">Numeric</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Track with numbers (e.g., reps, minutes, count)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Action Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}