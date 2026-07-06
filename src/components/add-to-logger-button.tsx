'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { MEALS, addToMeal, type MealId } from '@/lib/logger-store'

export function AddToLoggerButton({ recipeId, title }: { recipeId: number; title: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function pick(mealId: MealId, label: string) {
    addToMeal(mealId, recipeId)
    setOpen(false)
    toast.success(`Gelogd als ${label.toLowerCase()}`, { description: title })
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 border-2 border-foreground bg-accent px-3 py-2 font-display uppercase text-xs tracking-wide text-accent-foreground shadow-[3px_3px_0_0_var(--foreground)] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--foreground)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--foreground)]"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={3} />
        Loggen
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-48 border-2 border-foreground bg-popover p-1 shadow-[4px_4px_0_0_var(--foreground)]"
        >
          <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Loggen als…
          </p>
          {MEALS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="menuitem"
              onClick={() => pick(m.id, m.label)}
              className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
