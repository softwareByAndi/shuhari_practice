export type EquationType =
  | 'add'
  | 'sub'
  | 'mul'
  | 'div'
  | 'mod'
  | 'exp'
  | 'root'
  | 'add_w_negatives'
  | 'subtract_w_negatives';

export interface EquationConfig {
  id: EquationType;
  title: string;
  description: string;
  emoji: string;
  operator: string;
  /**
   * Generate the correct answer for the equation
   */
  solve: (num1: number, num2: number) => number;
  /**
   * Format how the equation should be displayed
   * (e.g., for negatives, show proper signs; for roots, show √ notation)
   */
  displayEquation?: (num1: number, num2: number) => string;
  /**
   * Validate that the problem is valid for the operation
   * (e.g., for division, num2 should not be 0)
   */
  isValidProblem?: (num1: number, num2: number) => boolean;
  /**
   * Optional filter to only include problems that meet certain criteria
   * (e.g., for division, only include problems with whole number results)
   */
  filterProblem?: (num1: number, num2: number) => boolean;
}

export const EQUATION_CONFIGS: Record<EquationType, EquationConfig> = {
  add: {
    id: 'add',
    title: 'Addition',
    description: 'Practice adding numbers',
    emoji: '➕',
    operator: '+',
    solve: (num1: number, num2: number) => num1 + num2,
    displayEquation: (num1: number, num2: number) => `${num1} + ${num2}`,
  },
  sub: {
    id: 'sub',
    title: 'Subtraction',
    description: 'Practice subtracting numbers',
    emoji: '➖',
    operator: '-',
    solve: (num1: number, num2: number) => num1 - num2,
    displayEquation: (num1: number, num2: number) => `${num1} - ${num2}`,
    // Only include problems where num1 >= num2 (no negative results)
    filterProblem: (num1: number, num2: number) => num1 >= num2,
  },
  mul: {
    id: 'mul',
    title: 'Multiplication',
    description: 'Practice multiplying numbers',
    emoji: '✖️',
    operator: '×',
    solve: (num1: number, num2: number) => num1 * num2,
    displayEquation: (num1: number, num2: number) => `${num1} × ${num2}`,
  },
  div: {
    id: 'div',
    title: 'Division',
    description: 'Practice dividing numbers',
    emoji: '➗',
    operator: '÷',
    solve: (num1: number, num2: number) => Math.floor(num1 / num2),
    displayEquation: (num1: number, num2: number) => `${num1} ÷ ${num2}`,
    // Num2 cannot be 0
    isValidProblem: (_num1: number, num2: number) => num2 !== 0,
    // Only include problems with whole number results
    filterProblem: (num1: number, num2: number) => num2 !== 0 && num1 % num2 === 0,
  },
  mod: {
    id: 'mod',
    title: 'Modulus',
    description: 'Practice finding remainders',
    emoji: '📐',
    operator: '%',
    solve: (num1: number, num2: number) => num1 % num2,
    displayEquation: (num1: number, num2: number) => `${num1} % ${num2}`,
    // Num2 cannot be 0
    isValidProblem: (_num1: number, num2: number) => num2 !== 0,
  },
  exp: {
    id: 'exp',
    title: 'Exponents',
    description: 'Practice powers and exponentiation',
    emoji: '🔢',
    operator: '^',
    solve: (base: number, exponent: number) => Math.pow(base, exponent),
    displayEquation: (base: number, exponent: number) => `${base}^${exponent}`,
    // Keep exponents reasonable (2-5) and bases small for mental math
    filterProblem: (base: number, exponent: number) => {
      // For 1-digit: bases 2-10, exponents 2-5
      // For 2-digit: bases 2-12, exponents 2-4
      // For 3-digit: bases 2-15, exponents 2-3
      return exponent >= 2 && exponent <= 5 && base >= 2;
    },
  },
  root: {
    id: 'root',
    title: 'Square Roots',
    description: 'Practice finding square roots of perfect squares',
    emoji: '√',
    operator: '√',
    // For square roots, num2 is ignored, num1 is the perfect square
    solve: (num1: number, _num2: number) => Math.sqrt(num1),
    displayEquation: (num1: number, _num2: number) => `√${num1}`,
    // Only perfect squares
    filterProblem: (num1: number, _num2: number) => {
      const sqrt = Math.sqrt(num1);
      return Number.isInteger(sqrt);
    },
  },
  add_w_negatives: {
    id: 'add_w_negatives',
    title: 'Addition with Negatives',
    description: 'Practice adding positive and negative numbers',
    emoji: '➕➖',
    operator: '+',
    solve: (num1: number, num2: number) => num1 + num2,
    displayEquation: (num1: number, num2: number) => {
      // For addition, show the operation properly with parentheses for clarity
      if (num2 < 0) {
        return `${num1} + (${num2})`;
      }
      return `${num1} + ${num2}`;
    },
    // Allow negative numbers
  },
  subtract_w_negatives: {
    id: 'subtract_w_negatives',
    title: 'Subtraction with Negatives',
    description: 'Practice subtracting positive and negative numbers',
    emoji: '➖➕',
    operator: '-',
    solve: (num1: number, num2: number) => num1 - num2,
    displayEquation: (num1: number, num2: number) => {
      // For subtraction, show the operation properly with parentheses for clarity
      if (num2 < 0) {
        return `${num1} - (${num2})`;
      }
      return `${num1} - ${num2}`;
    },
    // Allow negative numbers and results
  },
};

/**
 * Get the valid equation config for a given type
 */
export function getEquationConfig(type: string): EquationConfig | null {
  if (type in EQUATION_CONFIGS) {
    return EQUATION_CONFIGS[type as EquationType];
  }
  return null;
}

/**
 * Check if a string is a valid equation type
 */
export function isValidEquationType(type: string): type is EquationType {
  return type in EQUATION_CONFIGS;
}
