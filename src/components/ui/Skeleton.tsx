import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700',
        className,
      )}
    />
  )
}

export function TaskSkeleton() {
  return (
    <div className="rounded-xl bg-white p-4 shadow-card dark:bg-gray-800">
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  )
}

export function ColumnSkeleton() {
  return (
    <div className="w-72 shrink-0 rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
      <Skeleton className="mb-4 h-6 w-32" />
      <div className="space-y-3">
        <TaskSkeleton />
        <TaskSkeleton />
        <TaskSkeleton />
      </div>
    </div>
  )
}
