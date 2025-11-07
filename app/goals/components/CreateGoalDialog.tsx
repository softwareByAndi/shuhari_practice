'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGoals } from '@/contexts/GoalsProvider';

interface CreateGoalDialogProps {
  onClose: () => void;
}

export default function CreateGoalDialog({ onClose }: CreateGoalDialogProps) {
  const router = useRouter();
  const { createGoal } = useGoals();
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter a goal title');
      return;
    }

    const newGoal = createGoal(title.trim());

    // Navigate to the new goal page
    router.push(`/goals/${newGoal.id}`);
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
            Create New Goal
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="goal-title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Goal Title
              </label>
              <input
                id="goal-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError('');
                }}
                placeholder="Enter your goal..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
              {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
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
                Create Goal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}