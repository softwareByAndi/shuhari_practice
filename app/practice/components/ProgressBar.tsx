'use client';

import React from 'react';

interface ProgressBarProps {
  currentReps: number;
  targetReps: number;
  currentStage: string;
  nextStage?: string;
}

export function ProgressBar({
  currentReps,
  targetReps,
  currentStage,
  nextStage
}: ProgressBarProps) {
  const progress = Math.min((currentReps / targetReps) * 100, 100);

  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1">
        <span className="capitalize">{currentStage}</span>
        {nextStage && (
          <span>
            {currentReps} / {targetReps} to {nextStage}
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}