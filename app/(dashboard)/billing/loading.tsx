export default function BillingLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-6.5rem)] animate-pulse" aria-label="Loading billing">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 9 }, (_, index) => (
            <div key={index} className="rounded-xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-5 rounded-xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}