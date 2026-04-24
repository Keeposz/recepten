import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-6 px-6 py-20 text-center">
      <p className="font-display text-[10rem] leading-none text-accent">404</p>
      <h1 className="font-display text-4xl uppercase tracking-tight">Niet gevonden</h1>
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Deze pagina bestaat niet (meer).
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 border-2 border-foreground bg-accent px-4 py-2.5 font-display uppercase text-sm text-accent-foreground tracking-wide shadow-[4px_4px_0_0_var(--foreground)] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0_0_var(--foreground)]"
      >
        Terug naar home
      </Link>
    </main>
  )
}
