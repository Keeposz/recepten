import Link from 'next/link'

import { Planner } from '@/components/planner'
import { listRecipesForPlanner } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function PlannerPage() {
  const recipes = await listRecipesForPlanner()

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Recepten
        </Link>
        <span className="mx-2 text-foreground/30">/</span>
        <span className="text-foreground">Dagplanner</span>
      </div>

      <h1 className="font-display text-5xl uppercase leading-[0.95] tracking-tight sm:text-6xl">
        Dagplanner
      </h1>
      <p className="mb-8 mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        ↻ Resets daily
      </p>

      <Planner recipes={recipes} />
    </main>
  )
}
