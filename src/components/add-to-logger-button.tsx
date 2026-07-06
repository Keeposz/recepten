'use client'

import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MEALS, addToMeal } from '@/lib/logger-store'

export function AddToLoggerButton({ recipeId, title }: { recipeId: number; title: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 border-2 border-foreground bg-accent px-3 py-2 font-display uppercase text-xs tracking-wide text-accent-foreground shadow-[3px_3px_0_0_var(--foreground)] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--foreground)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--foreground)]">
        <Plus className="h-3.5 w-3.5" strokeWidth={3} />
        Loggen
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>Loggen als…</DropdownMenuLabel>
        {MEALS.map((m) => (
          <DropdownMenuItem
            key={m.id}
            onClick={() => {
              addToMeal(m.id, recipeId)
              toast.success(`Gelogd als ${m.label.toLowerCase()}`, { description: title })
            }}
          >
            {m.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
