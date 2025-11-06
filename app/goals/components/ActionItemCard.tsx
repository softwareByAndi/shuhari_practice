'use client';

import React, { useState } from 'react';
import { ActionItem, NumericTracking, EnumTracking } from '@/lib/types/goals';
import { useGoals } from '@/contexts/GoalsProvider';
import TrackingInput from './TrackingInput';

interface ActionItemCardProps {
  goalId: string;
  actionItem: ActionItem;
  isSessionActive: boolean;
  currentTracking?: NumericTracking | EnumTracking;
}

export default function ActionItemCard({
  goalId,
  actionItem,
  isSessionActive,
  currentTracking
}: ActionItemCardProps) {
  const { removeActionItem, updateActionItem } = useGoals();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(actionItem.title);

  const handleDelete = () => {
    if (confirm(`Delete action item "${actionItem.title}"?`)) {
      removeActionItem(goalId, actionItem.id);
    }
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      updateActionItem(goalId, actionItem.id, { title: editTitle.trim() });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(actionItem.title);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
              <button
                onClick={handleSaveEdit}
                className="text-green-600 hover:text-green-700"
                title="Save"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700"
                title="Cancel"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {actionItem.title}
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Type: {actionItem.trackingType === 'numeric' ? 'Numeric' : 'Progress Level'}
                </div>
              </div>

              {!isSessionActive && (
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isSessionActive && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <TrackingInput
            actionItem={actionItem}
            currentValue={currentTracking}
          />
        </div>
      )}
    </div>
  );
}