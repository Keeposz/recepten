'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'

import { Trash2 } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteRecipe } from '@/lib/actions'

export function DeleteRecipeButton({ slug, title }: { slug: string; title: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <AlertDialog>
      <AlertDialogTrigger className="inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-3 py-2 font-display uppercase text-xs tracking-wide text-destructive shadow-[3px_3px_0_0_var(--foreground)] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--foreground)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_var(--foreground)]">
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
        Verwijderen
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Recept verwijderen?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{title}&rdquo; wordt definitief verwijderd. Deze actie kan niet ongedaan gemaakt worden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuleren</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              startTransition(async () => {
                try {
                  await deleteRecipe(slug)
                } catch (err) {
                  if (err instanceof Error && err.message === 'NEXT_REDIRECT') return
                  toast.error('Verwijderen mislukt.')
                }
              })
            }}
          >
            {isPending ? 'Verwijderen…' : 'Verwijderen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
