
import {
    getEquationConfig
} from '@/lib/equation-types';
import { 
    generateProblems, 
    getComplexitySettings
} from '@/lib/problem-generator-v3';

import { notFound } from 'next/navigation';

interface PracticeProps {
    topicCode: string;
}

export default async function Practice({ topicCode }: PracticeProps) {
    const equationConfig = getEquationConfig(topicCode);

    if (!equationConfig) {
        return notFound();
    }

    const complexitySettings = getComplexitySettings(
        topicCode, 2, 2, 100
    );
    const problemSet = generateProblems({
        topicCode,
        equationConfig: equationConfig!,
        complexity: complexitySettings,
    });

    console.log('Generated Problems:', problemSet);



    return (
        <div>
            <h2>{equationConfig.title} Practice</h2>
            <ul>
                {problemSet.map((problem, index) => (
                    <li key={index}>
                        {problem.display} = {problem.answer}
                    </li>
                ))}
            </ul>
        </div>
    )
}