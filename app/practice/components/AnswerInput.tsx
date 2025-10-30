'use client';

import React, { useEffect, useRef } from 'react';

interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  feedback: 'correct' | 'incorrect' | null;
  autoFocus?: boolean;
  placeholder?: string;
}

export function AnswerInput({
  value,
  onChange,
  onSubmit,
  feedback,
  autoFocus = true,
  placeholder = 'Enter answer'
}: AnswerInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  const getFeedbackStyles = () => {
    if (feedback === 'correct') {
      return 'bg-green-100 border-green-500 text-green-900';
    }
    if (feedback === 'incorrect') {
      return 'bg-red-100 border-red-500 text-red-900';
    }
    return 'border-gray-300 focus:border-blue-500';
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`w-full p-4 text-2xl text-center font-semibold rounded-lg border-2
        transition-all duration-200 ${getFeedbackStyles()}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
      autoComplete="off"
      inputMode="numeric"
    />
  );
}