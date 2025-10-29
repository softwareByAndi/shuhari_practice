import { EquationConfig } from './equation-types';

export type Problem = { num1: number; num2: number };

/**
 * Generate all possible problems for a given number of digits and equation config
 */
export function generateAllProblems(
  digits: number,
  config: EquationConfig
): Problem[] {
  const min = digits === 1 ? 0 : Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;

  const problems: Problem[] = [];

  for (let i = min; i <= max; i++) {
    for (let j = min; j <= max; j++) {
      // Check if the problem is valid (e.g., no division by zero)
      if (config.isValidProblem && !config.isValidProblem(i, j)) {
        continue;
      }

      // Apply any filters (e.g., only whole number division results)
      if (config.filterProblem && !config.filterProblem(i, j)) {
        continue;
      }

      problems.push({ num1: i, num2: j });
    }
  }

  return problems;
}

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get the display text for a digit count
 */
export function getDigitRangeLabel(digits: number): string {
  const min = digits === 1 ? 0 : Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return `${min}-${max}`;
}
