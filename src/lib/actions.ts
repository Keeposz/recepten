'use server'

import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { db, schema } from '@/db/server'
import { deleteImage, saveImage } from '@/lib/images'
import { slugExists } from '@/lib/queries'
import { toSlug, uniqueSlug } from '@/lib/slug'
import { recipeInputSchema } from '@/lib/validators'

type ActionResult =
  | { ok: true; slug: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

function parseJson<T>(value: FormDataEntryValue | null): T | null {
  if (typeof value !== 'string' || value === '') return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function parseFormData(formData: FormData) {
  return recipeInputSchema.safeParse({
    title: formData.get('title'),
    categoryId: formData.get('categoryId'),
    description: formData.get('description') ?? '',
    servings: formData.get('servings') ?? '',
    prepMinutes: formData.get('prepMinutes') ?? '',
    cookMinutes: formData.get('cookMinutes') ?? '',
    notes: formData.get('notes') ?? '',
    ingredients: parseJson(formData.get('ingredients')) ?? [],
    steps: parseJson(formData.get('steps')) ?? [],
  })
}

function flattenErrors(issues: import('zod').ZodIssue[]): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const issue of issues) {
    const key = issue.path.join('.')
    out[key] = [...(out[key] ?? []), issue.message]
  }
  return out
}

export async function createRecipe(formData: FormData): Promise<ActionResult> {
  const parsed = parseFormData(formData)
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Kijk de invoer na.',
      fieldErrors: flattenErrors(parsed.error.issues),
    }
  }
  const input = parsed.data

  const imageFile = formData.get('image')
  let imagePath: string | null = null
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imagePath = await saveImage(imageFile)
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Foto kon niet verwerkt worden.' }
    }
  }

  const slug = await uniqueSlug(input.title, slugExists)

  try {
    await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(schema.recipes)
        .values({
          slug,
          title: input.title,
          categoryId: input.categoryId,
          description: input.description,
          servings: input.servings,
          prepMinutes: input.prepMinutes,
          cookMinutes: input.cookMinutes,
          notes: input.notes,
          imagePath,
        })
        .returning({ id: schema.recipes.id })

      if (input.ingredients.length > 0) {
        await tx.insert(schema.ingredients).values(
          input.ingredients.map((ing, index) => ({
            recipeId: created.id,
            position: index,
            quantity: ing.quantity,
            name: ing.name,
          })),
        )
      }
      if (input.steps.length > 0) {
        await tx.insert(schema.steps).values(
          input.steps.map((step, index) => ({
            recipeId: created.id,
            position: index,
            body: step.body,
          })),
        )
      }
    })
  } catch (err) {
    if (imagePath) await deleteImage(imagePath).catch(() => {})
    return { ok: false, error: err instanceof Error ? err.message : 'Opslaan mislukt.' }
  }

  revalidatePath('/')
  revalidatePath('/categorie/[slug]', 'page')
  redirect(`/recept/${slug}`)
}

export async function updateRecipe(
  currentSlug: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseFormData(formData)
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Kijk de invoer na.',
      fieldErrors: flattenErrors(parsed.error.issues),
    }
  }
  const input = parsed.data

  const [existing] = await db
    .select()
    .from(schema.recipes)
    .where(eq(schema.recipes.slug, currentSlug))
    .limit(1)
  if (!existing) return { ok: false, error: 'Recept niet gevonden.' }

  const removeImage = formData.get('removeImage') === '1'
  const imageFile = formData.get('image')
  let newImagePath: string | null | undefined
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      newImagePath = await saveImage(imageFile)
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Foto kon niet verwerkt worden.',
      }
    }
  } else if (removeImage) {
    newImagePath = null
  }

  const newBaseSlug = toSlug(input.title)
  let nextSlug = existing.slug
  if (newBaseSlug && newBaseSlug !== toSlug(existing.title)) {
    nextSlug = await uniqueSlug(input.title, async (s) => {
      if (s === existing.slug) return false
      return slugExists(s)
    })
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(schema.recipes)
        .set({
          slug: nextSlug,
          title: input.title,
          categoryId: input.categoryId,
          description: input.description,
          servings: input.servings,
          prepMinutes: input.prepMinutes,
          cookMinutes: input.cookMinutes,
          notes: input.notes,
          ...(newImagePath !== undefined ? { imagePath: newImagePath } : {}),
          updatedAt: sql`(CURRENT_TIMESTAMP)`,
        })
        .where(eq(schema.recipes.id, existing.id))

      await tx.delete(schema.ingredients).where(eq(schema.ingredients.recipeId, existing.id))
      await tx.delete(schema.steps).where(eq(schema.steps.recipeId, existing.id))

      if (input.ingredients.length > 0) {
        await tx.insert(schema.ingredients).values(
          input.ingredients.map((ing, index) => ({
            recipeId: existing.id,
            position: index,
            quantity: ing.quantity,
            name: ing.name,
          })),
        )
      }
      if (input.steps.length > 0) {
        await tx.insert(schema.steps).values(
          input.steps.map((step, index) => ({
            recipeId: existing.id,
            position: index,
            body: step.body,
          })),
        )
      }
    })
  } catch (err) {
    if (newImagePath) await deleteImage(newImagePath).catch(() => {})
    return { ok: false, error: err instanceof Error ? err.message : 'Opslaan mislukt.' }
  }

  if (
    (newImagePath !== undefined && existing.imagePath && existing.imagePath !== newImagePath) ||
    (removeImage && existing.imagePath)
  ) {
    await deleteImage(existing.imagePath).catch(() => {})
  }

  revalidatePath('/')
  revalidatePath('/categorie/[slug]', 'page')
  revalidatePath(`/recept/${currentSlug}`)
  if (nextSlug !== currentSlug) revalidatePath(`/recept/${nextSlug}`)
  redirect(`/recept/${nextSlug}`)
}

export async function deleteRecipe(slug: string): Promise<void> {
  const [existing] = await db
    .select()
    .from(schema.recipes)
    .where(eq(schema.recipes.slug, slug))
    .limit(1)
  if (!existing) redirect('/')

  await db.delete(schema.recipes).where(eq(schema.recipes.id, existing.id))
  if (existing.imagePath) await deleteImage(existing.imagePath).catch(() => {})

  revalidatePath('/')
  revalidatePath('/categorie/[slug]', 'page')
  redirect(`/categorie/${await categorySlugForId(existing.categoryId)}`)
}

async function categorySlugForId(id: number): Promise<string> {
  const [row] = await db
    .select({ slug: schema.categories.slug })
    .from(schema.categories)
    .where(eq(schema.categories.id, id))
    .limit(1)
  return row?.slug ?? ''
}
