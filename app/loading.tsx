import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-x py-20">
      <Skeleton className="mx-auto mb-6 h-14 w-2/3 max-w-2xl" />
      <Skeleton className="mx-auto mb-12 h-6 w-1/2 max-w-md" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
    </div>
  );
}
