import Link from 'next/link';

export function AnonymousBanner() {
  return (
    <div className="bg-blue-600 text-white px-4 py-2 text-center flex-shrink-0">
      <p className="text-banner">
        You're practicing anonymously. Progress won't be saved.{' '}
        <Link href="/auth" className="underline font-semibold hover:text-blue-200">
          Sign in
        </Link>{' '}
        to track your progress!
      </p>
    </div>
  );
}