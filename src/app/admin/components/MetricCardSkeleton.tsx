export default function MetricCardSkeleton() {
  return (
    <div className="bg-white border border-zinc-100 rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] animate-pulse">
      <div className="h-8 w-16 bg-zinc-200 rounded" />
      <div className="h-3 w-20 bg-zinc-100 rounded mt-3" />
      <div className="h-3 w-24 bg-zinc-100 rounded mt-1.5" />
    </div>
  );
}
