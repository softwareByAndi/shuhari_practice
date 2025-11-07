'use client';

import React, { useState } from 'react';
import { ActionItem, NumericTracking, TimeTracking, EnumTracking, formatTime, parseTime } from '@/lib/types/goals';
import { useGoals } from '@/contexts/GoalsProvider';
import TrackingInput from './TrackingInput';

interface ActionItemCardProps {
  goalId: string;
  actionItem: ActionItem;
  isSessionActive: boolean;
  currentTracking?: NumericTracking | TimeTracking | EnumTracking;
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
  const [editProgressionRate, setEditProgressionRate] = useState(actionItem.progressionRate || 1);
  const [editTimeProgression, setEditTimeProgression] = useState('');

  // Initialize time progression display
  React.useEffect(() => {
    if (actionItem.trackingType === 'time' && actionItem.progressionRate !== undefined) {
      // Convert minutes to milliseconds for display
      const milliseconds = Math.abs(actionItem.progressionRate) * 60 * 1000;
      const prefix = actionItem.progressionRate < 0 ? '-' : '';
      setEditTimeProgression(prefix + formatTime(milliseconds));
    }
  }, [actionItem.trackingType, actionItem.progressionRate]);

  const handleDelete = () => {
    if (confirm(`Delete action item "${actionItem.title}"?`)) {
      removeActionItem(goalId, actionItem.id);
    }
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      const updates: Partial<ActionItem> = { title: editTitle.trim() };
      if (actionItem.trackingType === 'numeric') {
        updates.progressionRate = editProgressionRate;
      } else if (actionItem.trackingType === 'time') {
        // Parse time input and convert to minutes
        const isNegative = editTimeProgression.startsWith('-');
        const timeStr = editTimeProgression.replace(/^-/, '');
        if (/^\d+(:\d{1,2}){0,2}$/.test(timeStr)) {
          const milliseconds = parseTime(timeStr);
          const minutes = milliseconds / (60 * 1000);
          updates.progressionRate = isNegative ? -minutes : minutes;
        }
      }
      updateActionItem(goalId, actionItem.id, updates);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(actionItem.title);
    setEditProgressionRate(actionItem.progressionRate || 1);
    if (actionItem.trackingType === 'time' && actionItem.progressionRate !== undefined) {
      const milliseconds = Math.abs(actionItem.progressionRate) * 60 * 1000;
      const prefix = actionItem.progressionRate < 0 ? '-' : '';
      setEditTimeProgression(prefix + formatTime(milliseconds));
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {isEditing ? (
        <div className="flex-1 flex flex-col space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Action item title"
            autoFocus
          />
          {actionItem.trackingType === 'numeric' && (
            <div className="flex items-center gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">
                Progression:
              </label>
              <input
                type="number"
                value={editProgressionRate}
                onChange={(e) => setEditProgressionRate(parseFloat(e.target.value) || 0)}
                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Rate"
                step="1"
                title="Units to add/subtract each session"
              />
            </div>
          )}
          {actionItem.trackingType === 'time' && (
            <div className="flex items-center gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">
                Time +/-:
              </label>
              <input
                type="text"
                value={editTimeProgression}
                onChange={(e) => setEditTimeProgression(e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0:00"
                title="Time to add/subtract (h:mm:ss or mm:ss). Use - prefix for decreasing"
              />
            </div>
          )}
          <div className="flex justify-end gap-2 mt-auto">
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-base font-medium text-gray-900 dark:text-white flex-1 pr-2">
              {actionItem.title}
            </h3>
            {!isSessionActive && (
              <div className="flex gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {isSessionActive && (
            <div className="flex-1 flex flex-col justify-center">
              <TrackingInput
                actionItem={actionItem}
                currentValue={currentTracking}
                compact={true}
              />
            </div>
          )}

          {!isSessionActive && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-auto">
              {actionItem.trackingType === 'numeric' ? 'Numeric' :
               actionItem.trackingType === 'time' ? 'Time' :
               'Progress'}
            </div>
          )}
        </>
      )}
    </div>
  );
}