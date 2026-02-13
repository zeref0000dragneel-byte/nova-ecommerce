type TableSkeletonProps = {
  rows?: number;
  cols?: number;
};

export default function TableSkeleton({ rows = 5, cols = 5 }: TableSkeletonProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-zinc-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
      <table className="w-full">
        <thead className="bg-zinc-50/80">
          <tr className="border-b border-zinc-100">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <div className="h-3 w-16 bg-zinc-200 rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-zinc-100">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-6">
                  <div
                    className="h-3 bg-zinc-100 rounded animate-pulse"
                    style={{ width: colIndex === 0 ? '80%' : '60%' }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
