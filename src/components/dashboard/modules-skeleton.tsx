export function ModulesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="glass-card p-6 rounded-2xl animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gray-200" />
            <div className="flex flex-col gap-2 items-end">
              <div className="w-16 h-6 rounded-full bg-gray-200" />
              <div className="w-20 h-6 rounded-full bg-gray-200" />
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>

          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-12" />
            <div className="h-6 bg-gray-200 rounded-full w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
