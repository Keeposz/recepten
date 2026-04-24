import Link from 'next/link'
import { Plus } from 'lucide-react'

import { MJMark } from '@/components/mj-mark'
import { listCategories } from '@/lib/queries'

export async function SiteHeader() {
  const categories = await listCategories()

  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background print:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 font-display text-2xl leading-none tracking-tight uppercase"
        >
          <span className="flex items-center gap-0.5">
            <span>Re</span>
            <span className="inline-flex h-6 w-6 -translate-y-0.5 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm">
              c
            </span>
            <span>epten</span>
          </span>
          <span className="hidden h-7 w-7 items-center justify-center border-2 border-foreground bg-foreground sm:inline-flex">
            <MJMark className="h-4 w-auto text-background" />
          </span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto text-sm font-display uppercase tracking-wide">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categorie/${c.slug}`}
              className="rounded-md border-2 border-transparent px-2.5 py-1 whitespace-nowrap hover:border-foreground hover:bg-accent/10"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <Link
          href="/recept/nieuw"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border-2 border-foreground bg-accent px-3 py-1.5 font-display uppercase text-sm text-accent-foreground tracking-wide shadow-[3px_3px_0_0_var(--foreground)] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--foreground)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--foreground)]"
          aria-label="Nieuw recept"
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
          <span className="hidden sm:inline">Nieuw</span>
        </Link>
      </div>
    </header>
  )
}
