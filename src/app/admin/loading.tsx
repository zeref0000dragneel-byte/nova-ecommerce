import MetricCardSkeleton from './components/MetricCardSkeleton';
import TableSkeleton from './components/TableSkeleton';

export default function AdminDashboardLoading() {
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <div className="bg-white border border-zinc-100 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden mb-8 h-[220px]">
        <div className="px-4 py-3 border-b border-zinc-100">
          <div className="h-3 w-28 bg-zinc-200 rounded animate-pulse" />
        </div>
        <div className="p-4 flex items-end gap-2 h-[calc(220px-52px)]">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-zinc-100 rounded-t animate-pulse"
              style={{ height: `${30 + Math.random() * 60}%` }}
            />
          ))}
        </div>
      </div>
      <section className="bg-white border border-zinc-100 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-zinc-100">
          <div className="h-3 w-24 bg-zinc-200 rounded animate-pulse" />
        </div>
        <ul className="divide-y divide-zinc-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-2.5">
              <div className="w-7 h-7 rounded-full bg-zinc-100 animate-pulse shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="h-3 w-24 bg-zinc-100 rounded animate-pulse mb-1.5" />
                <div className="h-3 w-32 bg-zinc-50 rounded animate-pulse" />
              </div>
              <div className="h-3 w-10 bg-zinc-100 rounded animate-pulse shrink-0" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
