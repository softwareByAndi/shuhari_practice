export type EquationType =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'modulus'
  | 'exponents'
  | 'square-roots'
  | 'negatives-addition'
  | 'negatives-subtraction';

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
  addition: {
    id: 'addition',
    title: 'Addition',
    description: 'Practice adding numbers',
    emoji: '➕',
    operator: '+',
    solve: (num1, num2) => num1 + num2,
  },
  subtraction: {
    id: 'subtraction',
    title: 'Subtraction',
    description: 'Practice subtracting numbers',
    emoji: '➖',
    operator: '-',
    solve: (num1, num2) => num1 - num2,
    // Only include problems where num1 >= num2 (no negative results)
    filterProblem: (num1, num2) => num1 >= num2,
  },
  multiplication: {
    id: 'multiplication',
    title: 'Multiplication',
    description: 'Practice multiplying numbers',
    emoji: '✖️',
    operator: '×',
    solve: (num1, num2) => num1 * num2,
  },
  division: {
    id: 'division',
    title: 'Division',
    description: 'Practice dividing numbers',
    emoji: '➗',
    operator: '÷',
    solve: (num1, num2) => Math.floor(num1 / num2),
    // Num2 cannot be 0
    isValidProblem: (num1, num2) => num2 !== 0,
    // Only include problems with whole number results
    filterProblem: (num1, num2) => num2 !== 0 && num1 % num2 === 0,
  },
  modulus: {
    id: 'modulus',
    title: 'Modulus',
    description: 'Practice finding remainders',
    emoji: '📐',
    operator: '%',
    solve: (num1, num2) => num1 % num2,
    // Num2 cannot be 0
    isValidProblem: (num1, num2) => num2 !== 0,
  },
  exponents: {
    id: 'exponents',
    title: 'Exponents',
    description: 'Practice powers and exponentiation',
    emoji: '🔢',
    operator: '^',
    solve: (base, exponent) => Math.pow(base, exponent),
    // Keep exponents reasonable (2-5) and bases small for mental math
    filterProblem: (base, exponent) => {
      // For 1-digit: bases 2-10, exponents 2-5
      // For 2-digit: bases 2-12, exponents 2-4
      // For 3-digit: bases 2-15, exponents 2-3
      return exponent >= 2 && exponent <= 5 && base >= 2;
    },
  },
  'square-roots': {
    id: 'square-roots',
    title: 'Square Roots',
    description: 'Practice finding square roots of perfect squares',
    emoji: '√',
    operator: '√',
    // For square roots, num2 is ignored, num1 is the perfect square
    solve: (num1, _num2) => Math.sqrt(num1),
    // Only perfect squares
    filterProblem: (num1, _num2) => {
      const sqrt = Math.sqrt(num1);
      return Number.isInteger(sqrt);
    },
  },
  'negatives-addition': {
    id: 'negatives-addition',
    title: 'Addition with Negatives',
    description: 'Practice adding positive and negative numbers',
    emoji: '➕➖',
    operator: '+',
    solve: (num1, num2) => num1 + num2,
    // Allow negative numbers
  },
  'negatives-subtraction': {
    id: 'negatives-subtraction',
    title: 'Subtraction with Negatives',
    description: 'Practice subtracting positive and negative numbers',
    emoji: '➖➕',
    operator: '-',
    solve: (num1, num2) => num1 - num2,
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
