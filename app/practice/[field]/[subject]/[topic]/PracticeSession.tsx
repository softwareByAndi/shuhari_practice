'use client';

/*
this page is responsible for managing the practice session for a given topic
and selecting which practice component to render based on the topic code / subject code
- currently there is only the Arithmetic component, but in the future there may be others
*/

import {
    useEffect
} from 'react';

import { useSession } from '@/contexts/SessionProvider';


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
        initializeSession,
        recordAnswer,
    } = useSession();

    useEffect(() => {
        initializeSession(topic.topic_id)
    }, [])

    // returning a loading page is causing hook order issues because Arithmetic has hooks too
    
    const params = {
        topicCode: topic.code,
        onCorrectAnswer: () => recordAnswer(true, 0)
    }
    return <Arithmetic {...params} />;
}