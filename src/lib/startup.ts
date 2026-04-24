import 'server-only'

import { notInArray, eq } from 'drizzle-orm'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { join } from 'node:path'

import { db, schema } from '@/db'

const DEFAULT_CATEGORIES = [
  { slug: 'mealpreps', name: 'Mealpreps', sortOrder: 10 },
  { slug: 'ontbijt', name: 'Ontbijt', sortOrder: 20 },
  { slug: 'lunch', name: 'Lunch', sortOrder: 30 },
  { slug: 'hoofdgerecht', name: 'Hoofdgerecht', sortOrder: 40 },
  { slug: 'bijgerecht', name: 'Bijgerecht', sortOrder: 50 },
  { slug: 'desserts', name: 'Desserts', sortOrder: 60 },
  { slug: 'snacks', name: 'Snacks', sortOrder: 70 },
]

export async function runStartupTasks() {
  const migrationsFolder =
    process.env.MIGRATIONS_FOLDER ?? join(process.cwd(), 'drizzle')

  migrate(db, { migrationsFolder })
  console.log('[startup] DB migrations applied')

  for (const category of DEFAULT_CATEGORIES) {
    await db
      .insert(schema.categories)
      .values(category)
      .onConflictDoUpdate({
        target: schema.categories.slug,
        set: { name: category.name, sortOrder: category.sortOrder },
      })
  }

  const slugs = DEFAULT_CATEGORIES.map((c) => c.slug)
  const stale = await db
    .select()
    .from(schema.categories)
    .where(notInArray(schema.categories.slug, slugs))

  for (const cat of stale) {
    try {
      await db.delete(schema.categories).where(eq(schema.categories.id, cat.id))
    } catch {
      // Categorie kan recepten hebben die ernaar verwijzen — laat staan.
    }
  }

  console.log(
    `[startup] ${DEFAULT_CATEGORIES.length} categorieën geseed${stale.length ? `, ${stale.length} verwijderd` : ''}`,
  )
}
