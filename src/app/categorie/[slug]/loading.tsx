import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/skeleton'

export default function CategoryLoading() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Skeleton className="mb-6 h-4 w-40" />
      <div className="mb-10 flex items-center justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <Card className="overflow-hidden pt-0">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  )
}
