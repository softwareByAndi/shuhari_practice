'use client';

import {
  EquationConfig,
  getEquationConfig
} from '@/lib/equation-types';
import {
  ComplexitySettings,
  generateProblems,
  getComplexitySettings,
  Problem
} from '@/lib/problem-generator-v3';
import { shuffle, isNil, set } from 'lodash';

import { useEffect, useState, useRef } from 'react';
import { notFound } from 'next/navigation';
import { SessionStats } from '@/app/practice/components/SessionStats';
import { ACTION, Numpad } from '@/app/practice/components/Numpad';
import { ProgressBar } from '@/app/practice/components/ProgressBar';

interface ArithmeticProps {
  topicCode: string;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
}

export default function Arithmetic({ topicCode, onCorrectAnswer, onIncorrectAnswer }: ArithmeticProps) {

  const [targetReps, setTargetReps] = useState<number>(1000);
  const [currentProblemIndex, setCurrentProblemIndex] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [problemSet, setProblemSet] = useState<Problem[]>([])
  const [answer, setAnswer] = useState<string>('');
  const [reps, setReps] = useState<number>(0);
  const [equationConfig, setEquationConfig] = useState<EquationConfig | null>(null);
  const [complexitySettings, setComplexitySettings] = useState<ComplexitySettings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<boolean>(false);

  // TODO : fetch user session



  useEffect(() => {

    // Initialize problem set
    const config = getEquationConfig(topicCode)
    if (!config) {
      console.error('Invalid topic code:', topicCode);
      return;
    }
    const complexity = getComplexitySettings(
      topicCode, 1, 1, 1000
    );
    const problems = generateProblems({
      topicCode,
      equationConfig: config,
      complexity,
    });

    setEquationConfig(config);
    setComplexitySettings(complexity);
    setProblemSet(problems)
    setCurrentProblem(problems[0]);
    console.log('Generated Problem Count:', problemSet?.length);
  }, []);

  useEffect(() => {
    if (
      !!answer
      && !isNil(currentProblem?.answer)
      && Number(answer) === currentProblem?.answer
      && !isSubmitting
    ) {
      handleSubmit();
    }
  }, [answer, currentProblem, isSubmitting]);

  const nextProblem = (index: number) => {
    if (problemSet && problemSet.length > 0) {
      let nextProblem = problemSet[index] ?? null;
      if (!nextProblem) {
        const newProblemSet = shuffle(problemSet);
        setCurrentProblemIndex(0);
        setProblemSet(newProblemSet);
        nextProblem = newProblemSet[0];
        console.log('Shuffled problem set for new round.');
      }
      setCurrentProblem(nextProblem);
      setShowAnswerFeedback(false);
    }
  };

  const handleSubmit = () => {
    // Prevent duplicate submissions
    if (isSubmitting || !answer || !currentProblem) {
      return;
    }

    setIsSubmitting(true);
    console.log('Submitted answer:', answer);

    if (!!answer && Number(answer) === currentProblem.answer) {
      const index = currentProblemIndex + 1;
      setCurrentProblemIndex(index);
      setReps(prev => prev + 1);
      setAnswer('');
      nextProblem(index);
      // Reset submission flag after successful submission
      setTimeout(() => setIsSubmitting(false), 100);
      onCorrectAnswer && onCorrectAnswer();
    } else {
      console.log('Incorrect answer. Correct was:', currentProblem.answer);
      // Reset submission flag for incorrect answers
      setIsSubmitting(false);
      onIncorrectAnswer && onIncorrectAnswer();
    }
  };

  const numpad = {
    onNumberClick: (num: string) => { setAnswer(prev => prev + num); },
    onAction: (action: ACTION) => {
      if (action === 'CLEAR') {
        setAnswer('');
        setShowAnswerFeedback(false);
      }
      if (action === 'CHECK_ANSWER') {
        setShowAnswerFeedback(true);
      }
      if (action === 'NEGATE') {
        setAnswer(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev);
      }
    },
    onBackspace: () => { setAnswer(prev => prev.slice(0, -1)); },
    onNegative: () => { setAnswer(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev); },
    hasNegatives: complexitySettings?.allowNegatives.inAnswer,
  };

  if (!currentProblem || !equationConfig || !complexitySettings) {
    return (<div className="text-center h-full flex-grow flex justify-center items-center text-3xl md:text-5xl text-zinc-500">Loading Problem Set...</div>);
  }

  return (
    <div className="flex flex-col gap-4 h-full m-auto w-full">
      {/* input section */}
      <div className="flex flex-col border p-4 sm:p-6 md:p-8 lg:p-12 rounded-lg shadow-md w-full h-full flex-grow max-w-[40vh] max-h-[300vw] mx-auto">
        {/* problem display */}
        {problemSet && problemSet.length > 0 && currentProblemIndex < problemSet.length ? (
          <div className="text-center text-3xl xs:text-5xl font-bold mb-4">
            {currentProblem.display}
          </div>
        ) : (
          <div className="text-center text-2xl md:text-4xl font-bold text-rose-500 mb-4">
            No problem available
          </div>
        )}
        {/* answer input */}
        <div className="text-center text-3xl md:text-4xl mb-4 border p-2 rounded-full h-16 mx-12">
          {showAnswerFeedback ? currentProblem?.answer : answer || (<span className="text-zinc-500">?</span>)}
        </div>

        <div className="flex-grow h-full">
          <Numpad
            onNumberClick={numpad.onNumberClick}
            onAction={numpad.onAction}
            onSymbolClick={numpad.onNumberClick}
            symbols={{
              // negative: complexitySettings.allowNegatives.inAnswer,
              // decimal: complexitySettings.allowDecimals.inAnswer
              negative: true,
              decimal: true
            }}
            submitDisabled={!answer || !Number(answer) || isSubmitting}
          />
        </div>
      </div>

      {/* <div className="flex-grow" /> */}

      {/* <SessionStats
            reps={reps}
            accuracy={0}
            avgResponseTime={0}
            medianResponseTime={0}
          /> */}
    </div>
  );
}