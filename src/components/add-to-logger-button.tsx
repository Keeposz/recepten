'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'

import { MEALS, addToMeal, type MealId } from '@/lib/logger-store'

export function AddToLoggerButton({ recipeId, title }: { recipeId: number; title: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function pick(mealId: MealId, label: string) {
    addToMeal(mealId, recipeId)
    setOpen(false)
    toast.success(`Gelogd als ${label.toLowerCase()}`, { description: title })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 border-2 border-foreground bg-accent px-3 py-2 font-display uppercase text-xs tracking-wide text-accent-foreground shadow-[3px_3px_0_0_var(--foreground)] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--foreground)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--foreground)]"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={3} />
        Log
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm border-2 border-foreground bg-card p-4 shadow-[6px_6px_0_0_var(--foreground)]"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-lg uppercase tracking-tight leading-none">
                  Log als…
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{title}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Sluiten"
                className="-mr-1 -mt-1 shrink-0 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MEALS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => pick(m.id, m.label)}
                  className="border-2 border-foreground bg-background px-3 py-4 font-display text-base uppercase tracking-wide shadow-[3px_3px_0_0_var(--foreground)] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--foreground)]"
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
