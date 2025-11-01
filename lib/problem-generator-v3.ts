import { EquationConfig } from './equation-types';
import { shuffle } from 'lodash';

export type Problem = {
  num1: number;
  num2: number;
  display: string;
  answer: number;
};

export interface VariableRange {
  min: number;
  max: number;
}

export interface ComplexitySettings {
  problemCount: number;
  allowNegatives: {
    inQuestion: boolean;
    inAnswer: boolean;
  };
  allowDecimals: {
    inQuestion: boolean;
    inAnswer: boolean;
  };
  range: {
    num1: VariableRange;
    num2: VariableRange | null;
  };
}

export interface ProblemGenerationConfig {
  topicCode: string;
  equationConfig: EquationConfig;
  complexity: ComplexitySettings;
}

export function convertDigitCountToRange(digitCount: number): VariableRange {
  const min = digitCount === 1 ? 0 : Math.pow(10, digitCount - 1);
  const max = Math.pow(10, digitCount) - 1;
  return { min, max };
}

export function getComplexitySettings(
  topicCode: string,
  digitCount1: number,
  digitCount2: number | null,
  maxProblemCount?: number,
  flags?: {
    allowNegatives?: boolean;
    allowDecimals?: boolean;
  }
): ComplexitySettings {
  console.log('Generating complexity settings for topic:', topicCode);
  console.log('Input params:', { digitCount1, digitCount2, maxProblemCount, flags });

  const range = {
    num1: convertDigitCountToRange(digitCount1),
    num2: digitCount2 == null ? { min: 0, max: 0 } : convertDigitCountToRange(digitCount2),
  }
  console.log('Initial range:', range);

  let allowNegatives = {
    inQuestion: flags?.allowNegatives ?? false,
    inAnswer:   flags?.allowNegatives ?? false
  };
  const allowDecimals = {
    inQuestion: flags?.allowDecimals ?? false,
    inAnswer:   flags?.allowDecimals ?? false
  };

  if (topicCode.includes('_w_neg')) {
    allowNegatives.inQuestion = true;
    allowNegatives.inAnswer = true;
  }
  if (topicCode === 'sub') {
    allowNegatives.inAnswer = true;
  }
  if (topicCode.includes('_w_dec')) {
    allowDecimals.inQuestion = true;
  }
  if (
    topicCode.includes('root') 
    || topicCode.includes('div') 
    || topicCode.includes('decimal')
  ) {
    allowDecimals.inAnswer = true;
  }

  console.log('Options: ', { allowNegatives, allowDecimals });

  /*
    Adjust ranges to fit within maxProblemCount if necessary
  */
  const theoreticalMaxProblemCount = (range.num1.max - range.num1.min) * (!range.num2 ? 1 : (range.num2.max - range.num2.min));
  const problemCount = Math.min(maxProblemCount ?? 1000, theoreticalMaxProblemCount);
  let _p = problemCount;
  if (allowNegatives.inQuestion) {
    _p = Math.floor(_p / 4);
    /*
        a  +   b
        a  + (-b)
      (-a) +   b
      (-a) + (-b)
    */
  }
  if (theoreticalMaxProblemCount > _p) {
    console.log('Adjusting ranges to fit within maxProblemCount');
    if (!range.num2) {
      range.num1.max = range.num1.min + _p;
    }
    else {
        console.log('Adjusting ranges for two variables');
        let root = Math.floor(Math.sqrt(_p));
        root = root < 1 ? 1 : root;

        const out_of_range = {
          /* a positive difference means  */
          num1: ((range.num1.max - range.num1.min) - root) > 0,
          num2: ((range.num2.max - range.num2.min) - root) > 0,
        };

        console.log('root: ', root, 'out_of_range: ', out_of_range);

        if (out_of_range.num1 && out_of_range.num2)
        {
            range.num1.max = range.num1.min + root;
            range.num2.max = range.num2.min + root;
        }
        else if (out_of_range.num1)
        {
            const db = range.num2.max - range.num2.min;
            /*
              (da * db) <= problemCount
              da <= (problemCount / db)
            */
            let da = Math.floor(problemCount / db);
            const adjust = da < 1 ? 1 : da;
            range.num1.max = range.num1.min + adjust;
        }
        else if (out_of_range.num2)
        {
            const db = range.num1.max - range.num1.min;
            /*
              (da * db) <= problemCount
              da <= (problemCount / db)
            */
            let da = Math.floor(problemCount / db);
            const adjust = da < 1 ? 1 : da;
            range.num2.max = range.num2.min + adjust;
        }
        else {
          throw new Error('Logic error in problem count adjustment');
        }
    }
  }
  console.log('Final range:', range);

  return {
    problemCount,
    allowNegatives,
    allowDecimals,
    range,
  };
}

/**
 * Generate problems based on new architecture
 */
export function generateProblems(config: ProblemGenerationConfig): Problem[] {
  const { topicCode, equationConfig, complexity } = config;
  return generateProblemSet(complexity, equationConfig);
}


export function generateProblemSet(
  complexity: ComplexitySettings,
  config: EquationConfig,
): Problem[] {

  const problems: Problem[] = [];
  const { range } = complexity;

  const rangeA = range.num1
  const rangeB = range.num2 || { min: 0, max: 1 };

  const options = { 
    dec_in_answer: complexity.allowDecimals.inAnswer,
    neg_in_answer: complexity.allowNegatives.inAnswer
  };

  for (let a = rangeA.min; a < rangeA.max; a++) {
    for (let b = rangeB.min; b < rangeB.max; b++) {
        const expandedProblemSet = [{a, b}]
        if (complexity.allowNegatives.inQuestion) {
            a > 0 && expandedProblemSet.push({a: -a, b});
            b > 0 && expandedProblemSet.push({a, b: -b});
            a > 0 && b > 0 && expandedProblemSet.push({a: -a, b: -b});
        }
        for (const p of expandedProblemSet) {
            if (!!config.isValidProblem && !config.isValidProblem(p.a, p.b)) {
              continue;
            }
            if (!!config.filterProblem && !config.filterProblem(p.a, p.b, options)) {
              continue;
            }
            problems.push({
              num1: p.a,
              num2: p.b,
              display: config.displayEquation(p.a, p.b),
              answer: config.solve(p.a, p.b)
            });
        }
    }
  }

  return shuffle(problems);
}
