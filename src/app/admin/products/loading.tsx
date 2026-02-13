import TableSkeleton from '../components/TableSkeleton';

export default function ProductsLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse" />
        <div className="h-9 w-24 bg-zinc-200 rounded animate-pulse" />
      </div>
      <TableSkeleton rows={8} cols={5} />
    </div>
  );
}
