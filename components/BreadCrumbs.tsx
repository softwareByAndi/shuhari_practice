"use server";

import Link from 'next/link';

interface BreadCrumbsProps {
  paths: {
    path: string,
    label: string
  }[],
}

export default async function BreadCrumbs({ paths }: BreadCrumbsProps) {
  return (
    <div>
      {paths.map(({ path, label }, index) => (
        <Link
          key={index}
          href={path}
          className="mb-4 inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
        >
          {label}
        </Link>
      ))}
    </div>
  );
}