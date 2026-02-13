import TableSkeleton from '../components/TableSkeleton';

export default function CategoriesLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 w-28 bg-zinc-200 rounded animate-pulse" />
        <div className="h-9 w-24 bg-zinc-200 rounded animate-pulse" />
      </div>
      <TableSkeleton rows={6} cols={4} />
    </div>
  );
}
