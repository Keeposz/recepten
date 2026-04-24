import { MJMark } from '@/components/mj-mark'

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-16 border-t-2 border-foreground bg-foreground text-background print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-background bg-accent">
            <MJMark className="h-6 w-auto text-accent-foreground" />
          </span>
          <div className="font-display text-xs uppercase tracking-wider">
            <p>Kookboek · Editie 01</p>
            <p className="text-background/60">Sinds {year}</p>
          </div>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-background/60">
          Gemaakt in eigen keuken · Geserveerd vanuit de cluster
        </p>
      </div>
    </footer>
  )
}
