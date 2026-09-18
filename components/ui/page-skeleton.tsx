type SkeletonVariant = 'dashboard' | 'list' | 'table' | 'form' | 'detail' | 'auth';

interface PageSkeletonProps {
  variant?: SkeletonVariant;
}

const block = 'rounded-lg bg-slate-200 dark:bg-slate-800';

export function PageSkeleton({ variant = 'list' }: PageSkeletonProps) {
  if (variant === 'dashboard') {
    return (
      <div className="space-y-6 animate-pulse" aria-label="Loading dashboard">
        <HeaderSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, index) => <div key={index} className={`${block} h-24`} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${block} h-80 lg:col-span-2`} />
          <div className={`${block} h-80`} />
        </div>
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse" aria-label="Loading form">
        <HeaderSkeleton />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-2">
              <div className={`${block} h-4 w-32`} />
              <div className={`${block} h-10 w-full`} />
            </div>
          ))}
          <div className={`${block} h-10 w-32`} />
        </div>
      </div>
    );
  }

  if (variant === 'auth') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 animate-pulse" aria-label="Loading authentication page">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 p-8 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className={`${block} h-12 w-12 rounded-xl`} />
            <div className={`${block} h-7 w-44`} />
            <div className={`${block} h-4 w-60`} />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="space-y-2">
                <div className={`${block} h-4 w-20`} />
                <div className={`${block} h-10 w-full`} />
              </div>
            ))}
            <div className={`${block} h-11 w-full`} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse" aria-label="Loading details">
        <HeaderSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, index) => <div key={index} className={`${block} h-28`} />)}
        </div>
        <div className={`${block} h-80 w-full`} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading page">
      <HeaderSkeleton />
      <div className="h-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
      {variant === 'table' ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          {Array.from({ length: 8 }, (_, index) => <div key={index} className={`${block} h-12 w-full`} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }, (_, index) => <div key={index} className={`${block} h-36`} />)}
        </div>
      )}
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-2">
        <div className={`${block} h-7 w-48`} />
        <div className={`${block} h-4 w-72 max-w-full`} />
      </div>
      <div className={`${block} h-10 w-32 shrink-0`} />
    </div>
  );
}
