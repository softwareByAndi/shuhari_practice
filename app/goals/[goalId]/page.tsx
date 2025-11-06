'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGoals } from '@/contexts/GoalsProvider';
import ActionItemsList from '../components/ActionItemsList';
import AddActionItemDialog from '../components/AddActionItemDialog';
import GoalSessionStats from '../components/GoalSessionStats';

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = params.goalId as string;

  const {
    goals,
    getActionItems,
    activeSession,
    initializeSession,
    submitSession,
    clearSession,
    getGoalHistory
  } = useGoals();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const goal = goals.find(g => g.id === goalId);
  const actionItems = getActionItems(goalId);
  const history = getGoalHistory(goalId);

  useEffect(() => {
    if (activeSession && activeSession.goalId === goalId) {
      setIsSessionActive(true);
    } else {
      setIsSessionActive(false);
    }
  }, [activeSession, goalId]);

  if (!goal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Goal not found</p>
          <button
            onClick={() => router.push('/goals')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Goals
          </button>
        </div>
      </div>
    );
  }

  const handleStartSession = () => {
    if (actionItems.length === 0) {
      alert('Please add action items before starting a session');
      return;
    }
    initializeSession(goalId);
    setIsSessionActive(true);
  };

  const handleSubmitSession = () => {
    submitSession();
    setIsSessionActive(false);
  };

  const handleClearSession = () => {
    if (confirm('Are you sure you want to clear this session without saving?')) {
      clearSession();
      setIsSessionActive(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/goals')}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Goals
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {goal.title}
        </h1>

        <div className="text-gray-600 dark:text-gray-400">
          {actionItems.length} action items • {history?.sessions.length || 0} sessions completed
        </div>
      </div>

      {/* Session Controls */}
      <div className="mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        {!isSessionActive ? (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Start a New Session
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your progress on action items
              </p>
            </div>
            <button
              onClick={handleStartSession}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={actionItems.length === 0}
            >
              Start Session
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Session in Progress
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update your progress below and submit when done
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearSession}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleSubmitSession}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Session
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Items Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Action Items
          </h2>
          {!isSessionActive && (
            <button
              onClick={() => setShowAddDialog(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Action Item
            </button>
          )}
        </div>

        {actionItems.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No action items yet. Add your first action item to start tracking progress.
            </p>
            {!isSessionActive && (
              <button
                onClick={() => setShowAddDialog(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Your First Action Item
              </button>
            )}
          </div>
        ) : (
          <ActionItemsList
            goalId={goalId}
            actionItems={actionItems}
            isSessionActive={isSessionActive}
            activeSession={activeSession}
          />
        )}
      </div>

      {/* Session History */}
      {history && history.sessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Session History
          </h2>
          <GoalSessionStats history={history} actionItems={actionItems} />
        </div>
      )}

      {showAddDialog && (
        <AddActionItemDialog
          goalId={goalId}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </div>
  );
}