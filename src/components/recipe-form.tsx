'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GripVertical, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createRecipe, updateRecipe } from '@/lib/actions'
import { imageUrl } from '@/lib/image-url'
import { recipeFormSchema, type RecipeFormValues } from '@/lib/validators'

type Category = { id: number; slug: string; name: string }

export type RecipeFormInitial = {
  slug: string
  title: string
  categoryId: number
  description: string | null
  servings: number | null
  prepMinutes: number | null
  cookMinutes: number | null
  notes: string | null
  imagePath: string | null
  ingredients: { quantity: string | null; name: string }[]
  steps: { body: string }[]
}

type Props = {
  categories: Category[]
  initialCategorySlug?: string
  initial?: RecipeFormInitial
}

function toDefaults(
  categories: Category[],
  initial: RecipeFormInitial | undefined,
  initialCategorySlug: string | undefined,
): RecipeFormValues {
  const defaultCategoryId =
    initial?.categoryId ??
    categories.find((c) => c.slug === initialCategorySlug)?.id ??
    categories[0]?.id ??
    0

  return {
    title: initial?.title ?? '',
    categoryId: String(defaultCategoryId),
    description: initial?.description ?? '',
    servings: initial?.servings != null ? String(initial.servings) : '',
    prepMinutes: initial?.prepMinutes != null ? String(initial.prepMinutes) : '',
    cookMinutes: initial?.cookMinutes != null ? String(initial.cookMinutes) : '',
    notes: initial?.notes ?? '',
    ingredients: initial?.ingredients?.length
      ? initial.ingredients.map((i) => ({ quantity: i.quantity ?? '', name: i.name }))
      : [{ quantity: '', name: '' }],
    steps: initial?.steps?.length
      ? initial.steps.map((s) => ({ body: s.body }))
      : [{ body: '' }],
  }
}

export function RecipeForm({ categories, initialCategorySlug, initial }: Props) {
  const isEdit = Boolean(initial)
  const [isPending, startTransition] = useTransition()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [removeExisting, setRemoveExisting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: toDefaults(categories, initial, initialCategorySlug),
  })
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form
  const categoryId = watch('categoryId')

  const ingredients = useFieldArray({ control, name: 'ingredients' })
  const steps = useFieldArray({ control, name: 'steps' })

  const existingImageUrl = initial?.imagePath ? imageUrl(initial.imagePath) : null
  const showExistingImage = existingImageUrl && !removeExisting && !preview

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setImageFile(file)
    setRemoveExisting(false)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  async function onSubmit(values: RecipeFormValues) {
    const fd = new FormData()
    fd.set('title', values.title)
    fd.set('categoryId', values.categoryId)
    fd.set('description', values.description)
    fd.set('servings', values.servings)
    fd.set('prepMinutes', values.prepMinutes)
    fd.set('cookMinutes', values.cookMinutes)
    fd.set('notes', values.notes)
    fd.set('ingredients', JSON.stringify(values.ingredients))
    fd.set('steps', JSON.stringify(values.steps))
    if (imageFile) fd.set('image', imageFile)
    if (isEdit && removeExisting) fd.set('removeImage', '1')

    startTransition(async () => {
      try {
        const result = isEdit && initial
          ? await updateRecipe(initial.slug, fd)
          : await createRecipe(fd)
        if (result && !result.ok) {
          toast.error(result.error)
        }
      } catch (err) {
        if (err instanceof Error && err.message === 'NEXT_REDIRECT') return
        toast.error('Er ging iets mis bij het opslaan.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="space-y-4">
        <div className="grid gap-1.5">
          <Label htmlFor="title">Titel</Label>
          <Input id="title" placeholder="Spaghetti bolognese" {...register('title')} />
          {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="categoryId">Categorie</Label>
          <Select
            value={categoryId}
            onValueChange={(v) => setValue('categoryId', v ?? '', { shouldValidate: true })}
          >
            <SelectTrigger id="categoryId">
              <SelectValue placeholder="Kies een categorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-sm text-destructive">{errors.categoryId.message}</p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="description">Beschrijving (optioneel)</Label>
          <Textarea
            id="description"
            rows={2}
            placeholder="Korte intro..."
            {...register('description')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="servings">Porties</Label>
            <Input id="servings" type="number" min={0} {...register('servings')} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="prepMinutes">Voorbereiding (min)</Label>
            <Input id="prepMinutes" type="number" min={0} {...register('prepMinutes')} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cookMinutes">Kooktijd (min)</Label>
            <Input id="cookMinutes" type="number" min={0} {...register('cookMinutes')} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <Label>Foto (optioneel)</Label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl border bg-muted">
            {preview ? (
              <Image src={preview} alt="Nieuwe foto" fill className="object-cover" unoptimized />
            ) : showExistingImage && existingImageUrl ? (
              <Image
                src={existingImageUrl}
                alt="Huidige foto"
                fill
                sizes="160px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Geen foto
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Input type="file" accept="image/*" onChange={onFileChange} />
            {isEdit && initial?.imagePath && !preview && !removeExisting && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRemoveExisting(true)}
              >
                Huidige foto verwijderen
              </Button>
            )}
            {isEdit && removeExisting && (
              <p className="text-sm text-muted-foreground">
                Foto wordt verwijderd bij opslaan.{' '}
                <button
                  type="button"
                  className="underline"
                  onClick={() => setRemoveExisting(false)}
                >
                  Ongedaan maken
                </button>
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base">Ingrediënten</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => ingredients.append({ quantity: '', name: '' })}
          >
            Toevoegen
          </Button>
        </div>
        <ul className="space-y-2">
          {ingredients.fields.map((field, index) => (
            <li key={field.id} className="flex gap-2">
              <GripVertical className="mt-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                className="max-w-28"
                placeholder="Hoeveelheid"
                {...register(`ingredients.${index}.quantity` as const)}
              />
              <Input
                className="flex-1"
                placeholder="Ingrediënt"
                {...register(`ingredients.${index}.name` as const)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => ingredients.remove(index)}
                disabled={ingredients.fields.length <= 1}
                aria-label="Verwijderen"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
        {errors.ingredients && (
          <p className="text-sm text-destructive">
            {typeof errors.ingredients.message === 'string'
              ? errors.ingredients.message
              : 'Kijk de ingrediënten na.'}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base">Bereiding</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => steps.append({ body: '' })}
          >
            Stap toevoegen
          </Button>
        </div>
        <ol className="space-y-2">
          {steps.fields.map((field, index) => (
            <li key={field.id} className="flex gap-2">
              <span className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                {index + 1}
              </span>
              <Textarea
                rows={3}
                placeholder="Beschrijf de stap…"
                {...register(`steps.${index}.body` as const)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => steps.remove(index)}
                disabled={steps.fields.length <= 1}
                aria-label="Verwijderen"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ol>
        {errors.steps && (
          <p className="text-sm text-destructive">
            {typeof errors.steps.message === 'string' ? errors.steps.message : 'Kijk de stappen na.'}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <div className="grid gap-1.5">
          <Label htmlFor="notes">Notities (optioneel)</Label>
          <Textarea
            id="notes"
            rows={4}
            placeholder="Tips, variaties…"
            {...register('notes')}
          />
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 border-t pt-6">
        <Link
          href={initial ? `/recept/${initial.slug}` : '/'}
          className={
            buttonVariants({ variant: 'ghost' }) +
            (isPending ? ' pointer-events-none opacity-50' : '')
          }
        >
          Annuleren
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Opslaan…' : isEdit ? 'Opslaan' : 'Recept toevoegen'}
        </Button>
      </div>
    </form>
  )
}
