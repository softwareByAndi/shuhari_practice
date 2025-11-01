

import stage_styles from '@/styles/stage.module.css'

import BreadCrumbs from './BreadCrumbs';
import User from './User';

interface headerPageProps {
  sectionTitle?: string;
  sectionIcon?: string;
  params?: Promise<{
    field?: string;
    subject?: string;
    topic?: string;
  }>;
}

/* TODO - clean up breadcrumbs and show display names instead of codes...*/

export default async function Header({ sectionTitle, sectionIcon, params }: headerPageProps) {
  // Handle optional params
  const { field, subject, topic } = params ? await params : { field: undefined, subject: undefined, topic: undefined };
  // console.log('_data in Header:', { field, subject, topic });

  const fieldCode = field;
  const subjectCode = subject;
  const topicCode = topic;

  const nav: { label: string; path: string }[] = [
    ...((!fieldCode || !subjectCode)               ? [] : [{ label: fieldCode, path: `/practice/${fieldCode}` }]),
    ...((!fieldCode || !subjectCode || !topicCode) ? [] : [{ label: subjectCode, path: `/practice/${fieldCode}/${subjectCode}` }]),
  ].filter(item => item.label && item.path)

  return (
    <section className="border-b border-zinc-200 dark:border-zinc-800 
                bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm
                flex items-center justify-between
                px-4 py-2 sm:px-6 lg:px-8"
    >
          <div className="flex items-center gap-8">
            <a href="/" className="text-xl font-bold text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center w-fit">
              <span className={`${stage_styles.shu}`}>守</span>
              <span className={`${stage_styles.ha}`}>破</span>
              <span className={`${stage_styles.ri}`}>離</span>
              <div className="text-xs m-0 text-zinc-500">Shuhari</div>
            </a>
            
            <div className="hidden md:block">
              <BreadCrumbs paths={nav} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="text-3xl">{sectionIcon}</div>
            <h1 className="text-xl sm:text-2xl font-bold">{sectionTitle}</h1>
          </div>
          <User />
    </section>
  );
}
