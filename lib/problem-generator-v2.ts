import { EquationConfig } from './equation-types';

export type Problem = {
  num1: number;
  num2: number;
  stageId?: number;
  difficultyId?: number;
};

export interface ProblemGenerationConfig {
  topicCode: string;
  stageId: number;
  difficultyLevelId: number;
  equationConfig: EquationConfig;
}

/**
 * Maps stage and difficulty to problem complexity
 */
export interface ComplexitySettings {
  minValue: number;
  maxValue: number;
  problemCount: number;
  allowNegatives: boolean;
  allowDecimals: boolean;
  specialConstraints?: any;
}

/**
 * Get complexity settings based on stage and difficulty level
 * Stages: 1=Hatsu, 2=Shu, 3=Kan, 4=Ha, 5=Toi, 6=Ri, 7=Ku
 * Difficulties: 101=Seedling(1d), 102=Sapling(2d), 103=Bamboo(3d), 104=Cedar(4d), 105=Ancient Oak(5d)
 */
function getComplexitySettings(
  stageId: number,
  difficultyLevelId: number,
  topicCode: string
): ComplexitySettings {
  // Base complexity from difficulty level (1d, 2d, 3d, 4d, 5d)
  const digitCount = difficultyLevelId - 100; // 101 -> 1, 102 -> 2, etc.

  // Calculate value ranges based on digit count
  const baseMin = digitCount === 1 ? 0 : Math.pow(10, digitCount - 1);
  const baseMax = Math.pow(10, digitCount) - 1;

  // Stage-based adjustments
  let minValue = baseMin;
  let maxValue = baseMax;
  let problemCount = 100; // Default
  let allowNegatives = false;
  let allowDecimals = false;

  // Adjust based on stage
  switch (stageId) {
    case 1: // Hatsu - Begin (very simple)
      problemCount = 50;
      // For 1d difficulty, limit to 0-5
      if (digitCount === 1) {
        maxValue = 5;
      }
      break;

    case 2: // Shu - Obey (standard practice)
      problemCount = 100;
      break;

    case 3: // Kan - Mirror (pattern recognition)
      problemCount = 100;
      // Slightly increase range for pattern variety
      break;

    case 4: // Ha - Break (introduce variations)
      problemCount = 150;
      // Introduce negatives for appropriate topics
      if (topicCode === 'add_w_negatives' || topicCode === 'subtract_w_negatives') {
        allowNegatives = true;
        minValue = -maxValue;
      }
      break;

    case 5: // Toi - Question (deeper understanding)
      problemCount = 200;
      allowNegatives = true;
      minValue = -maxValue;
      break;

    case 6: // Ri - Leave (transcend basics)
      problemCount = 250;
      allowNegatives = true;
      minValue = -maxValue;
      // Could introduce decimals for advanced topics
      if (digitCount >= 3) {
        allowDecimals = true;
      }
      break;

    case 7: // Ku - Void (mastery)
      problemCount = 300;
      allowNegatives = true;
      allowDecimals = true;
      minValue = -maxValue;
      break;
  }

  // Special adjustments for specific topics
  if (topicCode === 'exp' || topicCode === 'root') {
    // Exponents and roots have special constraints
    problemCount = Math.min(problemCount, 50); // Fewer problems due to limited valid combinations
  }

  return {
    minValue,
    maxValue,
    problemCount,
    allowNegatives,
    allowDecimals,
    specialConstraints: { digitCount }
  };
}

/**
 * Generate problems based on new architecture
 */
export function generateProblems(config: ProblemGenerationConfig): Problem[] {
  const { topicCode, stageId, difficultyLevelId, equationConfig } = config;

  const complexity = getComplexitySettings(stageId, difficultyLevelId, topicCode);

  // Handle special cases
  if (topicCode === 'exp') {
    return generateExponentProblems(complexity, stageId, difficultyLevelId);
  }
  if (topicCode === 'root') {
    return generateSquareRootProblems(complexity, stageId, difficultyLevelId);
  }
  if (topicCode === 'add_w_negatives' || topicCode === 'subtract_w_negatives') {
    return generateNegativeProblems(complexity, equationConfig, stageId, difficultyLevelId);
  }

  // Standard problem generation
  return generateStandardProblems(complexity, equationConfig, stageId, difficultyLevelId);
}

/**
 * Generate standard arithmetic problems
 */
function generateStandardProblems(
  complexity: ComplexitySettings,
  config: EquationConfig,
  stageId: number,
  difficultyLevelId: number
): Problem[] {
  const problems: Problem[] = [];
  const { minValue, maxValue, problemCount, allowNegatives } = complexity;

  // Generate all possible combinations first
  const allProblems: Problem[] = [];

  const start = allowNegatives ? minValue : Math.max(0, minValue);
  const end = maxValue;

  for (let i = start; i <= end; i++) {
    for (let j = start; j <= end; j++) {
      // Check validity
      if (config.isValidProblem && !config.isValidProblem(i, j)) {
        continue;
      }

      // Apply filters
      if (config.filterProblem && !config.filterProblem(i, j)) {
        continue;
      }

      allProblems.push({
        num1: i,
        num2: j,
        stageId,
        difficultyId: difficultyLevelId
      });
    }
  }

  // If we have more problems than needed, shuffle and take subset
  if (allProblems.length > problemCount) {
    const shuffled = shuffleArray(allProblems);
    return shuffled.slice(0, problemCount);
  }

  return allProblems;
}

/**
 * Generate exponent problems adapted for stages
 */
function generateExponentProblems(
  complexity: ComplexitySettings,
  stageId: number,
  difficultyLevelId: number
): Problem[] {
  const problems: Problem[] = [];
  const { specialConstraints } = complexity;
  const digitCount = specialConstraints?.digitCount || 1;

  let baseMin = 2, baseMax = 9;
  let expMin = 2, expMax = 5;

  // Adjust ranges based on stage and difficulty
  if (stageId <= 2) { // Hatsu, Shu
    baseMax = 5;
    expMax = 3;
  } else if (stageId <= 4) { // Kan, Ha
    baseMax = 9;
    expMax = 4;
  } else { // Toi, Ri, Ku
    baseMax = 15;
    expMax = 5;
  }

  // Further adjust by digit count
  if (digitCount >= 3) {
    expMax = Math.min(expMax, 3); // Limit exponent for larger bases
  }

  for (let base = baseMin; base <= baseMax; base++) {
    for (let exp = expMin; exp <= expMax; exp++) {
      // Check if result would be reasonable
      const result = Math.pow(base, exp);
      if (result <= Math.pow(10, digitCount + 1)) {
        problems.push({
          num1: base,
          num2: exp,
          stageId,
          difficultyId: difficultyLevelId
        });
      }
    }
  }

  return problems;
}

/**
 * Generate square root problems adapted for stages
 */
function generateSquareRootProblems(
  complexity: ComplexitySettings,
  stageId: number,
  difficultyLevelId: number
): Problem[] {
  const problems: Problem[] = [];
  const { specialConstraints } = complexity;
  const digitCount = specialConstraints?.digitCount || 1;

  let rootMin = 1, rootMax = 9;

  // Adjust ranges based on stage and digit count
  if (digitCount === 1) {
    rootMax = 9;
  } else if (digitCount === 2) {
    rootMin = 10;
    rootMax = 31;
  } else if (digitCount === 3) {
    rootMin = 32;
    rootMax = 99;
  } else {
    rootMin = 100;
    rootMax = 316; // sqrt(100000) ≈ 316
  }

  // Further adjust by stage
  if (stageId <= 2) {
    rootMax = Math.min(rootMax, 10);
  } else if (stageId <= 4) {
    rootMax = Math.min(rootMax, 50);
  }

  for (let root = rootMin; root <= rootMax; root++) {
    problems.push({
      num1: root * root,
      num2: 0,
      stageId,
      difficultyId: difficultyLevelId
    });
  }

  return problems;
}

/**
 * Generate problems with negative numbers
 */
function generateNegativeProblems(
  complexity: ComplexitySettings,
  config: EquationConfig,
  stageId: number,
  difficultyLevelId: number
): Problem[] {
  const problems: Problem[] = [];
  const { minValue, maxValue, problemCount } = complexity;

  const allProblems: Problem[] = [];

  // For early stages, limit negative range
  let negMin = minValue;
  let posMax = maxValue;

  if (stageId <= 4) {
    // In Ha stage and below, use smaller negative range
    negMin = Math.max(minValue, -Math.abs(maxValue) / 2);
  }

  for (let i = negMin; i <= posMax; i++) {
    for (let j = negMin; j <= posMax; j++) {
      // Ensure at least one number is negative for these topics
      if (i >= 0 && j >= 0 && stageId <= 5) continue;

      allProblems.push({
        num1: i,
        num2: j,
        stageId,
        difficultyId: difficultyLevelId
      });
    }
  }

  // Shuffle and take subset
  const shuffled = shuffleArray(allProblems);
  return shuffled.slice(0, Math.min(problemCount, shuffled.length));
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
 * Get a descriptive label for the current complexity settings
 */
export function getComplexityLabel(stageId: number, difficultyLevelId: number): string {
  const stageNames: Record<number, string> = {
    1: 'Hatsu',
    2: 'Shu',
    3: 'Kan',
    4: 'Ha',
    5: 'Toi',
    6: 'Ri',
    7: 'Ku'
  };

  const difficultyNames: Record<number, string> = {
    101: 'Seedling',
    102: 'Sapling',
    103: 'Bamboo',
    104: 'Cedar',
    105: 'Ancient Oak'
  };

  return `${stageNames[stageId] || 'Unknown'} - ${difficultyNames[difficultyLevelId] || 'Unknown'}`;
}

/**
 * Convert old digit-based generation to new system
 * This helps with migration from old URLs
 */
export function convertDigitsToStageAndDifficulty(digits: number): {
  stageId: number;
  difficultyLevelId: number;
} {
  // Map old digit system to new difficulty levels
  const difficultyLevelId = 100 + digits; // 1d -> 101, 2d -> 102, etc.

  // Default to Shu stage for migration
  const stageId = 2;

  return { stageId, difficultyLevelId };
}