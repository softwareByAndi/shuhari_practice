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

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { SessionStats } from '@/app/practice/components/SessionStats';
import { ACTION, Numpad } from '@/app/practice/components/Numpad';
import { ProgressBar } from '@/app/practice/components/ProgressBar';
import next from 'next';

interface PracticeProps {
    topicCode: string;
}

export default function Practice({ topicCode }: PracticeProps) {

    const [targetReps, setTargetReps] = useState(1000);
    const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
    const [currentProblem, setCurrentProblem] = useState<Problem|null>(null);
    const [problemSet, setProblemSet] = useState<Problem[]>([])
    const [answer, setAnswer] = useState<string>('');
    const [reps, setReps] = useState(20);
    const [equationConfig, setEquationConfig] = useState<EquationConfig | null>(null);
    const [complexitySettings, setComplexitySettings] = useState<ComplexitySettings | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAnswerFeedback, setShowAnswerFeedback] = useState<boolean>(false);

    useEffect(() => {
        // Initialize problem set
        const config = getEquationConfig(topicCode)
        if (!config) {
            console.error('Invalid topic code:', topicCode);
            return;
        }
        const complexity = getComplexitySettings(
            topicCode, 1, 1, 4
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
    }

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
        } else {
            console.log('Incorrect answer. Correct was:', currentProblem.answer);
            // Reset submission flag for incorrect answers
            setIsSubmitting(false);
        }
    }

    const numpad = {
        onNumberClick: (num: string) => { setAnswer(prev => prev + num);},
        onAction: (action: ACTION) => { 
            if (action === 'CLEAR') {
                setAnswer(''); 
                setShowAnswerFeedback(false);
            }
            if (action === 'CHECK_ANSWER') {
                setShowAnswerFeedback(true);
            }
        },
        onBackspace: () => { setAnswer(prev => prev.slice(0, -1)); },
        onNegative:  () => { setAnswer(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev); },
        hasNegatives: complexitySettings?.allowNegatives.inAnswer,
    }


    if (!currentProblem || !equationConfig || !complexitySettings) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col gap-6 !h-full min-h-full flex-grow">
            {/* input section */}
            <div className="border p-4 rounded-lg shadow-md w-full flex-grow">
                {/* problem display */}
                {problemSet && problemSet.length > 0 && currentProblemIndex < problemSet.length ? (
                    <div className="text-center text-2xl mb-4">
                        {currentProblem.display}
                    </div>
                ) : (
                    <div className="text-center text-2xl mb-4">
                        No problem available
                    </div>
                )}
                {/* answer input */}
                <div className="text-center text-2xl mb-4 border p-2 rounded h-12 max-h-12">
                    { showAnswerFeedback ? currentProblem?.answer : answer }
                </div>

                <div className="">
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
                        submitDisabled = {!answer || !Number(answer) || isSubmitting}
                    />
                </div>

            </div>



            <SessionStats 
                reps={reps}
                accuracy={0}
                avgResponseTime={0}
                medianResponseTime={0}
            />
            <ProgressBar 
                currentReps={reps}
                targetReps={targetReps}
                currentStage={'Hatsu'}
                nextStage={'Shu'}
            />        
        </div>
    )
}