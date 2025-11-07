'use client';

import React from 'react';
import { ActionItem, GoalSession } from '@/lib/types/goals';
import ActionItemCard from './ActionItemCard';

interface ActionItemsListProps {
  goalId: string;
  actionItems: ActionItem[];
  isSessionActive: boolean;
  activeSession: GoalSession | null;
}

export default function ActionItemsList({
  goalId,
  actionItems,
  isSessionActive,
  activeSession
}: ActionItemsListProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {actionItems.map((item) => {
        const sessionItem = activeSession?.actionItems.find(
          ai => ai.actionItemId === item.id
        );

        return (
          <ActionItemCard
            key={item.id}
            goalId={goalId}
            actionItem={item}
            isSessionActive={isSessionActive}
            currentTracking={sessionItem?.tracking}
          />
        );
      })}
    </div>
  );
}