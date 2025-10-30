'use client';

interface SimpleProgressBarProps {
  progress: number; // 0-100
  label?: string;
}

export function SimpleProgressBar({ progress, label }: SimpleProgressBarProps) {
  return (
    <div className="w-full">
      {label && (
        <div className="text-sm text-gray-600 mb-1">{label}</div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}