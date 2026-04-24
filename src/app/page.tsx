import Image from 'next/image'
import Link from 'next/link'

import { MJMark } from '@/components/mj-mark'
import { imageUrl } from '@/lib/image-url'
import { listCategoriesWithCounts, listRecentRecipes } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [categories, recent] = await Promise.all([
    listCategoriesWithCounts(),
    listRecentRecipes(6),
  ])

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section className="relative mb-16 overflow-hidden border-2 border-foreground bg-accent text-accent-foreground">
        <div className="relative z-10 px-6 py-14 sm:px-10 sm:py-20">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center border-2 border-accent-foreground bg-accent-foreground">
              <MJMark className="h-5 w-auto text-accent" />
            </span>
            <p className="font-display text-xs uppercase tracking-[0.3em]">Kookboek · Editie 01</p>
          </div>
          <h1 className="mt-4 font-display text-6xl leading-[0.95] uppercase tracking-tight sm:text-8xl">
            Wat eten
            <br />
            we vandaag?
          </h1>
          <p className="mt-6 max-w-lg text-sm sm:text-base">
            Geen drive, geen screenshots, geen docx. Onze recepten — altijd klaar, altijd dichtbij.
          </p>
        </div>
        <div
          aria-hidden
          className="absolute -right-8 -bottom-24 font-display text-[22rem] leading-none tracking-tighter text-accent-foreground/15 select-none sm:-right-4 sm:text-[30rem]"
        >
          MJ
        </div>
      </section>

      <section className="mb-20">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl uppercase tracking-tight sm:text-4xl">
            Categorieën
          </h2>
          <span className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground px-2.5 py-1 font-display text-xs uppercase leading-none tracking-wider text-background">
            <span className="text-accent">×</span>
            <span className="tabular-nums">{String(categories.length).padStart(2, '0')}</span>
            <span className="h-3 w-px bg-background/40" />
            <span>Index</span>
          </span>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <li key={category.id}>
              <Link
                href={`/categorie/${category.slug}`}
                className="group relative block border-2 border-foreground bg-card p-5 shadow-[4px_4px_0_0_var(--foreground)] transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_var(--foreground)]"
              >
                <span className="absolute top-3 right-3 font-display text-xs uppercase tracking-wider text-muted-foreground tabular-nums">
                  #{String(index + 1).padStart(2, '0')}
                </span>
                <p className="font-display text-4xl leading-none uppercase tracking-tight sm:text-5xl">
                  {category.name}
                </p>
                <p className="mt-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {category.recipeCount === 0
                    ? 'Nog geen recepten'
                    : category.recipeCount === 1
                      ? '1 recept'
                      : `${category.recipeCount} recepten`}
                  <span className="mx-2 text-foreground/30">·</span>
                  <span className="text-accent">Ontdekken →</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {recent.length > 0 && (
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl uppercase tracking-tight sm:text-4xl">Recent</h2>
            <span className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-2.5 py-1 font-display text-xs uppercase leading-none tracking-wider">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span>Vers uit de oven</span>
            </span>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((recipe) => {
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
                        <div className="flex h-full w-full items-center justify-center font-display text-4xl uppercase text-foreground/30">
                          {recipe.title.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-display text-xs uppercase tracking-wider text-accent">
                        {recipe.categoryName}
                      </p>
                      <p className="mt-1 font-display text-xl uppercase leading-tight tracking-tight line-clamp-2">
                        {recipe.title}
                      </p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </main>
  )
}
