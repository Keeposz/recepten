import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Plus } from 'lucide-react'

import { imageUrl } from '@/lib/image-url'
import { getCategoryBySlug, listRecipesByCategory } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const recipes = await listRecipesByCategory(category.id)

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Recepten
        </Link>
        <span className="mx-2 text-foreground/30">/</span>
        <span className="text-foreground">{category.name}</span>
      </div>

      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Categorie
          </p>
          <h1 className="mt-2 font-display text-6xl uppercase leading-[0.95] tracking-tight sm:text-7xl">
            {category.name}
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {recipes.length === 0
              ? 'Nog geen recepten'
              : recipes.length === 1
                ? '1 recept'
                : `${recipes.length} recepten`}
          </p>
        </div>
        <Link
          href={{ pathname: '/recept/nieuw', query: { categorie: category.slug } }}
          className="inline-flex items-center gap-1.5 border-2 border-foreground bg-accent px-4 py-2.5 font-display uppercase text-sm text-accent-foreground tracking-wide shadow-[4px_4px_0_0_var(--foreground)] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_0_var(--foreground)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--foreground)]"
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
          Nieuw recept
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="border-2 border-dashed border-foreground/40 bg-muted/30 p-12 text-center">
          <p className="font-display text-3xl uppercase tracking-tight">Leeg hier</p>
          <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Voeg het eerste recept in {category.name.toLowerCase()} toe.
          </p>
          <Link
            href={{ pathname: '/recept/nieuw', query: { categorie: category.slug } }}
            className="mt-4 inline-block font-display text-sm uppercase tracking-wider text-accent underline decoration-2 underline-offset-4 hover:opacity-80"
          >
            Begin nu →
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => {
            const url = imageUrl(recipe.imagePath)
            return (
              <li key={recipe.id}>
                <Link
                  href={`/recept/${recipe.slug}`}
                  className="group block overflow-hidden border-2 border-foreground bg-card shadow-[4px_4px_0_0_var(--foreground)] transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--foreground)]"
                >
                  <div className="relative aspect-[4/3] w-full border-b-2 border-foreground bg-muted">
                    {url ? (
                      <Image
                        src={url}
                        alt={recipe.title}
                        fill
                        sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-display text-5xl uppercase text-foreground/30">
                        {recipe.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-display text-xl uppercase leading-tight tracking-tight line-clamp-2">
                      {recipe.title}
                    </p>
                    {recipe.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {recipe.description}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
