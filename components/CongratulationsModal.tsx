
interface CongratulationsModalProps {
  problemCount: number;
  sessionReps: number;
  allTimeReps: number;
  totalRepsGoal?: number;
}

export default async function CongratulationsModal({
  problemCount,
  sessionReps,
  allTimeReps,
  totalRepsGoal = 1000,
}: CongratulationsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-zinc-800 radius-modal spacing-modal-padding shadow-2xl border border-zinc-200 dark:border-zinc-700 max-w-md w-full text-center animate-bounce">
        <div className="text-modal-emoji mb-4">🎉</div>
        <h2 className="text-modal-title font-bold text-zinc-900 dark:text-white mb-2">
          Set Complete!
        </h2>
        <p className="text-modal-text text-zinc-600 dark:text-zinc-400 mb-4">
          You've completed all {problemCount} problems!
        </p>
        <p className="text-modal-small text-zinc-500 dark:text-zinc-400">
          Session reps: <span className="font-bold text-blue-600 dark:text-blue-400">{sessionReps}</span>
        </p>
        <p className="text-modal-small text-zinc-500 dark:text-zinc-400">
          Total reps: <span className="font-bold text-indigo-600 dark:text-indigo-400">{allTimeReps}</span> / {totalRepsGoal}
        </p>
      </div>
    </div>
  );
}