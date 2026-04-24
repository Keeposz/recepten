import { Skeleton } from '@/components/skeleton'

export default function RecipeLoading() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Skeleton className="mb-6 h-4 w-52" />
      <Skeleton className="mb-3 h-6 w-24" />
      <Skeleton className="mb-3 h-10 w-3/4" />
      <Skeleton className="mb-8 h-5 w-1/2" />
      <Skeleton className="mb-8 aspect-[16/10] w-full" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </main>
  )
}
