import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RecipeForm, type RecipeFormInitial } from '@/components/recipe-form'
import { getRecipeBySlug, listCategories } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [recipe, categories] = await Promise.all([getRecipeBySlug(slug), listCategories()])
  if (!recipe || !recipe.category) notFound()

  const initial: RecipeFormInitial = {
    slug: recipe.slug,
    title: recipe.title,
    categoryId: recipe.categoryId,
    description: recipe.description,
    servings: recipe.servings,
    prepMinutes: recipe.prepMinutes,
    cookMinutes: recipe.cookMinutes,
    notes: recipe.notes,
    imagePath: recipe.imagePath,
    ingredients: recipe.ingredients.map((ing) => ({
      quantity: ing.quantity,
      name: ing.name,
    })),
    steps: recipe.steps.map((step) => ({ body: step.body })),
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Recepten
        </Link>
        <span className="mx-2 text-foreground/30">/</span>
        <Link href={`/categorie/${recipe.category.slug}`} className="hover:text-foreground">
          {recipe.category.name}
        </Link>
        <span className="mx-2 text-foreground/30">/</span>
        <Link href={`/recept/${recipe.slug}`} className="hover:text-foreground">
          {recipe.title}
        </Link>
        <span className="mx-2 text-foreground/30">/</span>
        <span className="text-foreground">Bewerken</span>
      </div>

      <h1 className="mb-8 font-display text-5xl uppercase leading-[0.95] tracking-tight sm:text-6xl">
        Bewerken
      </h1>

      <RecipeForm categories={categories} initial={initial} />
    </main>
  )
}
