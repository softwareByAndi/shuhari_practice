'use client';

/*
this page is responsible for managing the practice session for a given topic
and selecting which practice component to render based on the topic code / subject code
- currently there is only the Arithmetic component, but in the future there may be others
*/

import {
    useEffect,
    useRef,
    useState
} from 'react';
import { notFound } from 'next/navigation';

import { 
  useSession
} from '@/contexts/SessionProvider';
import {
    Topic,
    Subject,
    Field
} from '@/lib/types/database'

import Arithmetic from './Arithmetic';



interface SubjectPageProps {
  topic: Topic;
  subject: Subject;
  field: Field;
}

export default function PracticePage({ topic, subject, field }: SubjectPageProps) {
    const {
        session,
        initializeSession,
        recordAnswer,
        getAccuracy,
    } = useSession();
    const [isInitialized, setIsInitialized] = useState(false);
    const problemStartTime = useRef<number>(0);

    const sessionMetadata = {
        topicId: topic.topic_id,
        topicCode: topic.code,
        topicDisplayName: topic.display_name,
        subjectCode: subject.code,
        fieldCode: field.code
    };

    useEffect(() => {
        initializeSession(
            sessionMetadata.topicId,
            {
                topicCode: sessionMetadata.topicCode,
                topicDisplayName: sessionMetadata.topicDisplayName,
                subjectCode: sessionMetadata.subjectCode,
                fieldCode: sessionMetadata.fieldCode
            }
        ).then(() => {
            setIsInitialized(true);
            problemStartTime.current = Date.now();
        });
    }, [])

    // causing hook order issues because Arithmetic has hooks too

    const params = {
        topicCode: topic.code,
        onCorrectAnswer: () => recordAnswer(true, 0)
    }
    return <Arithmetic {...params} />;
}