'use client';

import colors from '@/styles/stage.module.css';

interface ProgressBarProps {
  currentReps: number;
  targetReps: number;
  currentStage: {
    stage_id: number;
    code: string;
    display_name: string;
  };
  nextStage?: {
    stage_id: number;
    code: string;
    display_name: string;
  } | null;
}


export function ProgressBar({
  currentReps,
  targetReps,
  currentStage,
  nextStage
}: ProgressBarProps) {
  const progress = Math.min((currentReps / targetReps) * 100, 100);
  console.log('ProgressBar Inputs:', { currentReps, targetReps, currentStage, nextStage });
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className={`capitalize ${colors[currentStage?.code || 'default_stage']} font-bold`}>{currentStage?.display_name}</span>
        {currentStage?.stage_id && (
          <div className="flex gap-2">
            <div>{currentReps} / {targetReps}</div> 
            <div>to</div>
            <div className={`${colors[nextStage?.code || 'default_stage']} font-bold `}>{nextStage?.display_name}</div>
          </div>
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