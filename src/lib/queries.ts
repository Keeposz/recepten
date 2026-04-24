import 'server-only'

import { asc, count, desc, eq } from 'drizzle-orm'

import { db, schema } from '@/db/server'

export async function listCategories() {
  return db.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder))
}

export async function listCategoriesWithCounts() {
  const rows = await db
    .select({
      id: schema.categories.id,
      slug: schema.categories.slug,
      name: schema.categories.name,
      sortOrder: schema.categories.sortOrder,
      recipeCount: count(schema.recipes.id),
    })
    .from(schema.categories)
    .leftJoin(schema.recipes, eq(schema.recipes.categoryId, schema.categories.id))
    .groupBy(schema.categories.id)
    .orderBy(asc(schema.categories.sortOrder))
  return rows
}

export async function listRecentRecipes(limit: number = 6) {
  return db
    .select({
      id: schema.recipes.id,
      slug: schema.recipes.slug,
      title: schema.recipes.title,
      imagePath: schema.recipes.imagePath,
      updatedAt: schema.recipes.updatedAt,
      categoryName: schema.categories.name,
      categorySlug: schema.categories.slug,
    })
    .from(schema.recipes)
    .innerJoin(schema.categories, eq(schema.recipes.categoryId, schema.categories.id))
    .orderBy(desc(schema.recipes.updatedAt))
    .limit(limit)
}

export async function getCategoryBySlug(slug: string) {
  const [category] = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.slug, slug))
    .limit(1)
  return category ?? null
}

export async function listRecipesByCategory(categoryId: number) {
  return db
    .select({
      id: schema.recipes.id,
      slug: schema.recipes.slug,
      title: schema.recipes.title,
      description: schema.recipes.description,
      imagePath: schema.recipes.imagePath,
      prepMinutes: schema.recipes.prepMinutes,
      cookMinutes: schema.recipes.cookMinutes,
      updatedAt: schema.recipes.updatedAt,
    })
    .from(schema.recipes)
    .where(eq(schema.recipes.categoryId, categoryId))
    .orderBy(asc(schema.recipes.title))
}

export async function getRecipeBySlug(slug: string) {
  const [recipe] = await db
    .select()
    .from(schema.recipes)
    .where(eq(schema.recipes.slug, slug))
    .limit(1)
  if (!recipe) return null

  const [category, ingredients, steps] = await Promise.all([
    db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, recipe.categoryId))
      .limit(1)
      .then((rows) => rows[0] ?? null),
    db
      .select()
      .from(schema.ingredients)
      .where(eq(schema.ingredients.recipeId, recipe.id))
      .orderBy(asc(schema.ingredients.position)),
    db
      .select()
      .from(schema.steps)
      .where(eq(schema.steps.recipeId, recipe.id))
      .orderBy(asc(schema.steps.position)),
  ])

  return { ...recipe, category, ingredients, steps }
}

export async function slugExists(slug: string): Promise<boolean> {
  const [row] = await db
    .select({ id: schema.recipes.id })
    .from(schema.recipes)
    .where(eq(schema.recipes.slug, slug))
    .limit(1)
  return Boolean(row)
}
