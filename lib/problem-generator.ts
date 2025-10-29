import { EquationConfig } from './equation-types';

export type Problem = { num1: number; num2: number };

/**
 * Generate all possible problems for a given number of digits and equation config
 */
export function generateAllProblems(
  digits: number,
  config: EquationConfig
): Problem[] {
  // Special handling for different equation types
  if (config.id === 'exponents') {
    return generateExponentProblems(digits);
  }
  if (config.id === 'square-roots') {
    return generateSquareRootProblems(digits);
  }
  if (config.id === 'negatives-addition' || config.id === 'negatives-subtraction') {
    return generateNegativeNumberProblems(digits, config);
  }

  // Standard generation for basic operations
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
 * Generate exponent problems with appropriate base and exponent ranges
 */
function generateExponentProblems(digits: number): Problem[] {
  const problems: Problem[] = [];

  if (digits === 1) {
    // 1-digit: bases 2-9, exponents 2-5
    for (let base = 2; base <= 9; base++) {
      for (let exp = 2; exp <= 5; exp++) {
        problems.push({ num1: base, num2: exp });
      }
    }
  } else if (digits === 2) {
    // 2-digit: bases 2-12, exponents 2-4
    for (let base = 2; base <= 12; base++) {
      for (let exp = 2; exp <= 4; exp++) {
        problems.push({ num1: base, num2: exp });
      }
    }
  } else {
    // 3-digit: bases 2-15, exponents 2-3
    for (let base = 2; base <= 15; base++) {
      for (let exp = 2; exp <= 3; exp++) {
        problems.push({ num1: base, num2: exp });
      }
    }
  }

  return problems;
}

/**
 * Generate square root problems with perfect squares
 */
function generateSquareRootProblems(digits: number): Problem[] {
  const problems: Problem[] = [];

  if (digits === 1) {
    // 1-digit results: 1-9, so squares 1-81
    for (let root = 1; root <= 9; root++) {
      problems.push({ num1: root * root, num2: 0 });
    }
  } else if (digits === 2) {
    // 2-digit results: 10-31 (31² = 961), so squares 100-961
    for (let root = 10; root <= 31; root++) {
      problems.push({ num1: root * root, num2: 0 });
    }
  } else {
    // 3-digit results: 32-99 (99² = 9801), limited to keep it reasonable
    for (let root = 32; root <= 99; root++) {
      problems.push({ num1: root * root, num2: 0 });
    }
  }

  return problems;
}

/**
 * Generate problems with negative numbers
 */
function generateNegativeNumberProblems(
  digits: number,
  config: EquationConfig
): Problem[] {
  const problems: Problem[] = [];

  if (digits === 1) {
    // 1-digit: -9 to 9
    for (let i = -9; i <= 9; i++) {
      for (let j = -9; j <= 9; j++) {
        problems.push({ num1: i, num2: j });
      }
    }
  } else if (digits === 2) {
    // 2-digit: -99 to 99
    for (let i = -99; i <= 99; i++) {
      for (let j = -99; j <= 99; j++) {
        problems.push({ num1: i, num2: j });
      }
    }
  } else {
    // 3-digit: -999 to 999
    for (let i = -999; i <= 999; i++) {
      for (let j = -999; j <= 999; j++) {
        problems.push({ num1: i, num2: j });
      }
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
