'use client';

interface SessionStatsProps {
  reps: number;
  accuracy: number;
  avgResponseTime: number;
  medianResponseTime: number;
}

export function SessionStats({
  reps,
  accuracy,
  avgResponseTime,
  medianResponseTime
}: SessionStatsProps) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600 max-w-xs mx-auto">
      <div>Reps: {reps}</div>
      <div>Accuracy: {(accuracy * 100).toFixed(0)}%</div>
      <div>Avg: {(avgResponseTime / 1000).toFixed(1)}s</div>
      <div>Median: {(medianResponseTime / 1000).toFixed(1)}s</div>
    </div>
  );
}