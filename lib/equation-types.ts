export type EquationType = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'modulus';

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
