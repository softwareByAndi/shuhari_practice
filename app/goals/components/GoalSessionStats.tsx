'use client';

import React from 'react';
import { GoalSessionHistory, ActionItem, ENUM_LABELS, EnumTracking } from '@/lib/types/goals';

interface GoalSessionStatsProps {
  history: GoalSessionHistory;
  actionItems: ActionItem[];
}

export default function GoalSessionStats({ history, actionItems }: GoalSessionStatsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionItemTitle = (actionItemId: string) => {
    const item = actionItems.find(ai => ai.id === actionItemId);
    return item?.title || 'Unknown Item';
  };

  const getActionItemType = (actionItemId: string) => {
    const item = actionItems.find(ai => ai.id === actionItemId);
    return item?.trackingType || 'numeric';
  };

  const renderTrackingValue = (tracking: any, actionItemId: string) => {
    const type = getActionItemType(actionItemId);

    if (type === 'numeric') {
      return <span className="font-medium">{tracking.value}</span>;
    }

    const enumTracking = tracking as EnumTracking;
    const label = ENUM_LABELS[enumTracking.value];

    // Color coding for enum values
    const colorClasses = {
      'too_lazy': 'text-red-600 dark:text-red-400',
      'got_done': 'text-green-600 dark:text-green-400',
      'surpassed': 'text-blue-600 dark:text-blue-400',
      'extra_mile': 'text-purple-600 dark:text-purple-400'
    };

    return (
      <span className={`font-medium ${colorClasses[enumTracking.value]}`}>
        {label}
      </span>
    );
  };

  // Sort sessions by date, most recent first
  const sortedSessions = [...history.sessions].sort(
    (a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedSessions.map((session, index) => (
        <div
          key={`${session.sessionDate}-${index}`}
          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="mb-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(session.sessionDate)}
            </div>
          </div>

          <div className="space-y-2">
            {session.actionItems.map((item) => (
              <div
                key={item.actionItemId}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  {getActionItemTitle(item.actionItemId)}
                </span>
                {renderTrackingValue(item.tracking, item.actionItemId)}
              </div>
            ))}
          </div>
        </div>
      ))}

      {sortedSessions.length === 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No sessions recorded yet
        </div>
      )}
    </div>
  );
}