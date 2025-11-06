'use client';

import React from 'react';
import Link from 'next/link';
import { Goal } from '@/lib/types/goals';
import { useGoals } from '@/contexts/GoalsProvider';

interface GoalCardProps {
  goal: Goal;
}

export default function GoalCard({ goal }: GoalCardProps) {
  const { deleteGoal, getActionItems, getGoalHistory } = useGoals();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const actionItems = getActionItems(goal.id);
  const history = getGoalHistory(goal.id);
  const sessionsCount = history?.sessions.length || 0;

  const handleDelete = () => {
    deleteGoal(goal.id);
    setShowDeleteConfirm(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative">
      <Link href={`/goals/${goal.id}`} className="block">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {goal.title}
        </h3>

        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Created {formatDate(goal.createdAt)}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">{actionItems.length}</span> action items
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">{sessionsCount}</span> sessions
          </div>
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          setShowDeleteConfirm(true);
        }}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors"
        title="Delete goal"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Delete "{goal.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}