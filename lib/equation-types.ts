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
    operator: '+',
    solve: (num1: number, num2: number) => Number((num1 + num2).toFixed(3)),
    displayEquation: (num1: number, num2: number) => `${num1} + ${num2}`,
  },
  sub: {
    id: 'sub',
    title: 'Subtraction',
    operator: '-',
    solve: (num1: number, num2: number) => Number((num1 - num2).toFixed(3)),
    displayEquation: (num1: number, num2: number) => `${num1} - ${num2}`,
    filterProblem: (num1: number, num2: number, options: FilterOptions) => (options.neg_in_answer ? true : num1 >= num2),
  },
  mul: {
    id: 'mul',
    title: 'Multiplication',
    operator: '×',
    solve: (num1: number, num2: number) => Number((num1 * num2).toFixed(3)),
    displayEquation: (num1: number, num2: number) => `${num1} × ${num2}`,
  },
  div: {
    id: 'div',
    title: 'Division',
    operator: '÷',
    solve: (num1: number, num2: number) => Number((num1 / num2).toFixed(3)),
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
    operator: '%',
    solve: (num1: number, num2: number) => Number((num1 % num2).toFixed(3)),
    displayEquation: (num1: number, num2: number) => `${num1} % ${num2}`,
    isValidProblem: (_num1: number, num2: number) => num2 !== 0,
  },
  pow_2: {
    id: 'pow_2',
    title: 'Powers of 2',
    operator: '^',
    solve: (_base: number, exponent: number) => Number(Math.pow(2, exponent).toFixed(3)),
    displayEquation: (base: number, exponent: number) => `$2^${exponent}`,
    isValidProblem: (num1: number, _num2: number) => num1 === 2,
    filterProblem: (base: number, exp: number) => {
      return exp <= 16
    },
  },
  exp: {
    id: 'exp',
    title: 'Exponents',
    operator: '^',
    solve: (base: number, exponent: number) => Number(Math.pow(base, exponent).toFixed(3)),
    displayEquation: (base: number, exponent: number) => `${base}^${exponent}`,
    filterProblem: (base: number, exp: number) => {
      return exp <= 5
    },
  },
  root: {
    id: 'root',
    title: 'Square Roots',
    operator: '√',
    /*pass in the answer (root) as num1*/
    solve: (num1: number, _num2: number) => num1,
    displayEquation: (num1: number, _num2: number) => `√${num1 * num1}`,
  },
  add_w_negatives: {
    id: 'add_w_negatives',
    title: 'Addition with Negatives',
    operator: '+',
    solve: (num1: number, num2: number) => Number((num1 + num2).toFixed(3)),
    displayEquation: (num1: number, num2: number) => {
      if (num2 < 0) 
        return `${num1} + (${num2})`;
      return `${num1} + ${num2}`;
    },
  },
  subtract_w_negatives: {
    id: 'subtract_w_negatives',
    title: 'Subtraction with Negatives',
    operator: '-',
    solve: (num1: number, num2: number) => Number((num1 - num2).toFixed(3)),
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
