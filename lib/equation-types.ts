export type EquationType =
  | 'add'
  | 'sub'
  | 'mul'
  | 'div'
  | 'mod'
  | 'pow_2'
  | 'exp'
  | 'root'
  | 'add_w_negatives'
  | 'subtract_w_negatives';

interface FilterOptions {
  dec_in_answer?: boolean;
  neg_in_answer?: boolean;
}

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
  displayEquation: (num1: number, num2: number) => string;
  /**
   * Validate that the problem is valid for the operation
   * (e.g., for division, num2 should not be 0)
   */
  isValidProblem?: (num1: number, num2: number) => boolean;
  /**
   * Optional filter to only include problems that meet certain criteria
   * (e.g., for division, only include problems with whole number results)
   */
  filterProblem?: (num1: number, num2: number, options: FilterOptions) => boolean;
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
    filterProblem: (num1: number, num2: number, options: FilterOptions) => (options.neg_in_answer ? true : num1 >= num2),
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
    isValidProblem: (_num1: number, num2: number) => num2 !== 0,
    filterProblem: (num1: number, num2: number, options: FilterOptions) => (
      num2 !== 0 && 
      (options.dec_in_answer ? true : num1 % num2 === 0)
    ),
  },
  mod: {
    id: 'mod',
    title: 'Modulus',
    description: 'Practice finding remainders',
    emoji: '📐',
    operator: '%',
    solve: (num1: number, num2: number) => num1 % num2,
    displayEquation: (num1: number, num2: number) => `${num1} % ${num2}`,
    isValidProblem: (_num1: number, num2: number) => num2 !== 0,
  },
  pow_2: {
    id: 'pow_2',
    title: 'Powers of 2',
    description: 'useful for binary and computer science',
    emoji: '🔢',
    operator: '^',
    solve: (_base: number, exponent: number) => Math.pow(2, exponent),
    displayEquation: (base: number, exponent: number) => `$2^${exponent}`,
    isValidProblem: (num1: number, _num2: number) => num1 === 2,
    filterProblem: (base: number, exp: number) => {
      return exp <= 16
    },
  },
  exp: {
    id: 'exp',
    title: 'Exponents',
    description: 'Practice powers and exponentiation',
    emoji: '🔢',
    operator: '^',
    solve: (base: number, exponent: number) => Math.pow(base, exponent),
    displayEquation: (base: number, exponent: number) => `${base}^${exponent}`,
    filterProblem: (base: number, exp: number) => {
      return exp <= 5
    },
  },
  root: {
    id: 'root',
    title: 'Square Roots',
    description: 'Practice finding square roots of perfect squares',
    emoji: '√',
    operator: '√',
    /*pass in the answer (root) as num1*/
    solve: (num1: number, _num2: number) => num1,
    displayEquation: (num1: number, _num2: number) => `√${num1 * num1}`,
  },
  add_w_negatives: {
    id: 'add_w_negatives',
    title: 'Addition with Negatives',
    description: 'Practice adding positive and negative numbers',
    emoji: '➕➖',
    operator: '+',
    solve: (num1: number, num2: number) => num1 + num2,
    displayEquation: (num1: number, num2: number) => {
      if (num2 < 0) 
        return `${num1} + (${num2})`;
      return `${num1} + ${num2}`;
    },
  },
  subtract_w_negatives: {
    id: 'subtract_w_negatives',
    title: 'Subtraction with Negatives',
    description: 'Practice subtracting positive and negative numbers',
    emoji: '➖➕',
    operator: '-',
    solve: (num1: number, num2: number) => num1 - num2,
    displayEquation: (num1: number, num2: number) => {
      if (num2 < 0) 
        return `${num1} - (${num2})`;
      return `${num1} - ${num2}`;
    },
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
