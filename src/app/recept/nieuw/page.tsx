import Link from 'next/link'

import { RecipeForm } from '@/components/recipe-form'
import { listCategories } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function NewRecipePage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>
}) {
  const [categories, params] = await Promise.all([listCategories(), searchParams])

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Recepten
        </Link>
        <span className="mx-2 text-foreground/30">/</span>
        <span className="text-foreground">Nieuw recept</span>
      </div>

      <h1 className="mb-8 font-display text-5xl uppercase leading-[0.95] tracking-tight sm:text-6xl">
        Nieuw recept
      </h1>

      <RecipeForm categories={categories} initialCategorySlug={params.categorie} />
    </main>
  )
}
