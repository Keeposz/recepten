import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Pencil } from 'lucide-react'

import { DeleteRecipeButton } from '@/components/delete-recipe-button'
import { imageUrl } from '@/lib/image-url'
import { getRecipeBySlug } from '@/lib/queries'

export const dynamic = 'force-dynamic'

function formatMinutes(min: number | null): string | null {
  if (min == null) return null
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}u` : `${h}u ${m}min`
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)
  if (!recipe || !recipe.category) notFound()

  const url = imageUrl(recipe.imagePath)
  const prep = formatMinutes(recipe.prepMinutes)
  const cook = formatMinutes(recipe.cookMinutes)

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 font-mono text-xs uppercase tracking-wider text-muted-foreground print:hidden">
        <Link href="/" className="hover:text-foreground">
          Recepten
        </Link>
        <span className="mx-2 text-foreground/30">/</span>
        <Link href={`/categorie/${recipe.category.slug}`} className="hover:text-foreground">
          {recipe.category.name}
        </Link>
        <span className="mx-2 text-foreground/30">/</span>
        <span className="text-foreground line-clamp-1">{recipe.title}</span>
      </div>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/categorie/${recipe.category.slug}`}
            className="inline-block border-2 border-foreground bg-accent px-2 py-0.5 font-display text-xs uppercase tracking-wider text-accent-foreground"
          >
            {recipe.category.name}
          </Link>
          <h1 className="mt-3 font-display text-5xl uppercase leading-[0.95] tracking-tight sm:text-6xl">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="mt-4 max-w-xl text-muted-foreground">{recipe.description}</p>
          )}
        </div>
        <div className="flex gap-2 print:hidden">
          <Link
            href={`/recept/${recipe.slug}/bewerken`}
            className="inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-3 py-2 font-display uppercase text-xs tracking-wide shadow-[3px_3px_0_0_var(--foreground)] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--foreground)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--foreground)]"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2.5} />
            Bewerken
          </Link>
          <DeleteRecipeButton slug={recipe.slug} title={recipe.title} />
        </div>
      </div>

      {url && (
        <div className="relative mb-10 aspect-[16/10] w-full overflow-hidden border-2 border-foreground bg-muted shadow-[6px_6px_0_0_var(--foreground)]">
          <Image
            src={url}
            alt={recipe.title}
            fill
            sizes="(min-width: 768px) 720px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {(recipe.servings || prep || cook) && (
        <dl className="mb-10 grid grid-cols-3 border-2 border-foreground">
          <div className="border-r-2 border-foreground p-4">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Porties
            </dt>
            <dd className="mt-1 font-display text-2xl uppercase leading-none">
              {recipe.servings ?? '—'}
            </dd>
          </div>
          <div className="border-r-2 border-foreground p-4">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Prep
            </dt>
            <dd className="mt-1 font-display text-2xl uppercase leading-none">{prep ?? '—'}</dd>
          </div>
          <div className="p-4">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Kook
            </dt>
            <dd className="mt-1 font-display text-2xl uppercase leading-none">{cook ?? '—'}</dd>
          </div>
        </dl>
      )}

      <section className="mb-12">
        <h2 className="mb-4 font-display text-3xl uppercase tracking-tight">Ingrediënten</h2>
        <ul className="border-2 border-foreground">
          {recipe.ingredients.map((ing, idx) => (
            <li
              key={ing.id}
              className={`flex items-baseline gap-4 px-4 py-3 ${
                idx !== recipe.ingredients.length - 1 ? 'border-b border-foreground/20' : ''
              }`}
            >
              <span className="min-w-20 font-mono text-sm font-semibold tabular-nums text-accent">
                {ing.quantity ?? '—'}
              </span>
              <span className="flex-1">{ing.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 font-display text-3xl uppercase tracking-tight">Bereiding</h2>
        <ol className="space-y-5">
          {recipe.steps.map((step, idx) => (
            <li key={step.id} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-accent font-display text-lg uppercase text-accent-foreground leading-none">
                {idx + 1}
              </span>
              <p className="whitespace-pre-wrap pt-1.5 leading-7">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {recipe.notes && (
        <section className="border-2 border-foreground bg-accent/5 p-5">
          <h2 className="mb-2 font-display text-lg uppercase tracking-tight">Notities</h2>
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {recipe.notes}
          </p>
        </section>
      )}
    </main>
  )
}
