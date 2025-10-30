'use client';

import React from 'react';

interface PracticeTitleProps {
  subject: string;
  topic: string;
  subtitle?: string;
}

export function PracticeTitle({
  subject,
  topic,
  subtitle
}: PracticeTitleProps) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-3xl font-bold capitalize">
        {subject} - {topic.replace('-', ' ')}
      </h1>
      {subtitle && (
        <p className="text-gray-600 mt-2">{subtitle}</p>
      )}
    </div>
  );
}