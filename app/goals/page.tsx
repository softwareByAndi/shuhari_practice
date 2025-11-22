'use client';

import React from 'react';
import { useGoals } from '@/contexts/GoalsProvider';
import GoalsList from './components/GoalsList';
import CreateGoalDialog from './components/CreateGoalDialog';

export default function GoalsPage() {
  const { goals, loading } = useGoals();
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          My Goals
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your progress on personal goals and action items
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowCreateDialog(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No goals yet. Create your first goal to get started!
          </p>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <GoalsList goals={goals} />
      )}

      {showCreateDialog && (
        <CreateGoalDialog onClose={() => setShowCreateDialog(false)} />
      )}
    </div>
  );
}