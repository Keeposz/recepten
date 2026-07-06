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

      <h1 className="mb-2 font-display text-5xl uppercase leading-[0.95] tracking-tight sm:text-6xl">
        Dagplanner
      </h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Kies wat je vandaag eet en zie hoe je macro’s zich verhouden tot je dagdoel. Je selectie
        blijft de hele dag bewaard; morgen begin je vanzelf opnieuw.
      </p>

      {recipes.length === 0 ? (
        <div className="border-2 border-foreground bg-card p-6">
          <p className="font-medium">Nog geen recepten met voedingswaarde.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vul bij een recept de macro’s per portie in (eiwit, koolhydraten, vet) — dan verschijnt
            het hier vanzelf in de planner.
          </p>
        </div>
      ) : (
        <Planner recipes={recipes} />
      )}
    </main>
  )
}
