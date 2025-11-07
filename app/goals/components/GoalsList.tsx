'use client';

import React from 'react';
import { Goal } from '@/lib/types/goals';
import GoalCard from './GoalCard';

interface GoalsListProps {
  goals: Goal[];
}

export default function GoalsList({ goals }: GoalsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}