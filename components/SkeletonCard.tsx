export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-border border-t-4 border-t-muted-bg p-6 flex flex-col gap-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 w-20 bg-muted-bg rounded-full" />
        <div className="h-5 w-28 bg-muted-bg rounded-full" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 bg-muted-bg rounded" />
        <div className="h-5 w-full bg-muted-bg rounded" />
        <div className="h-5 w-4/5 bg-muted-bg rounded" />
        <div className="h-4 w-full bg-muted-bg rounded mt-3" />
        <div className="h-4 w-3/4 bg-muted-bg rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-14 bg-muted-bg rounded-full" />
        <div className="h-5 w-20 bg-muted-bg rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="h-4 w-24 bg-muted-bg rounded" />
        <div className="h-4 w-20 bg-muted-bg rounded" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
