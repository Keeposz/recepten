import { z } from 'zod'

// Client-side: matches what HTML inputs produce. Used by react-hook-form.
export const ingredientFormSchema = z.object({
  quantity: z.string().max(64),
  name: z.string().trim().min(1, 'Naam is verplicht').max(200),
})

export const stepFormSchema = z.object({
  body: z.string().trim().min(1, 'Stap mag niet leeg zijn').max(4000),
})

export const recipeFormSchema = z.object({
  title: z.string().trim().min(1, 'Titel is verplicht').max(200),
  categoryId: z.string().min(1, 'Kies een categorie'),
  description: z.string().max(4000),
  servings: z.string(),
  prepMinutes: z.string(),
  cookMinutes: z.string(),
  notes: z.string().max(4000),
  ingredients: z.array(ingredientFormSchema).min(1, 'Minstens één ingrediënt'),
  steps: z.array(stepFormSchema).min(1, 'Minstens één stap'),
})

export type RecipeFormValues = z.infer<typeof recipeFormSchema>

// Server-side: parses FormData from the submitted recipe. Coerces strings → numbers.
function optionalNonNegativeInt(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    throw new Error('Moet een positief geheel getal zijn')
  }
  return n
}

function nullableText(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export const recipeInputSchema = z.object({
  title: z.string().trim().min(1, 'Titel is verplicht').max(200),
  categoryId: z.coerce.number().int().positive(),
  description: z.preprocess(nullableText, z.string().max(4000).nullable()),
  servings: z.preprocess(optionalNonNegativeInt, z.number().int().nonnegative().nullable()),
  prepMinutes: z.preprocess(optionalNonNegativeInt, z.number().int().nonnegative().nullable()),
  cookMinutes: z.preprocess(optionalNonNegativeInt, z.number().int().nonnegative().nullable()),
  notes: z.preprocess(nullableText, z.string().max(4000).nullable()),
  ingredients: z
    .array(
      z.object({
        quantity: z.preprocess(nullableText, z.string().max(64).nullable()),
        name: z.string().trim().min(1).max(200),
      }),
    )
    .min(1),
  steps: z
    .array(
      z.object({
        body: z.string().trim().min(1).max(4000),
      }),
    )
    .min(1),
})

export type RecipeInput = z.infer<typeof recipeInputSchema>
