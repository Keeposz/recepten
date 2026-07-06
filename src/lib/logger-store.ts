// Gedeelde opslag voor de dag-logger. Leeft in localStorage, gesleuteld op de datum:
// binnen de dag blijft alles staan, een nieuwe dag begint automatisch leeg.
// Zowel de logger-pagina als de "Loggen"-knop op recepten gebruiken dit,
// zodat ze exact dezelfde dag delen.

import { DEFAULT_DAY_TYPE, type PastaVariant, type RiceVariant } from '@/lib/nutrition'

export const STORAGE_KEY = 'recepten:logger:v1'

export const MEALS = [
  { id: 'ontbijt', label: 'Ontbijt' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'diner', label: 'Diner' },
  { id: 'snacks', label: 'Snacks' },
] as const

export type MealId = (typeof MEALS)[number]['id']
export type LogItem = { recipeId: number; portions: number }
export type Meals = Record<MealId, LogItem[]>
export type Sides = {
  riceRawG: number
  riceVariant: RiceVariant
  pastaRawG: number
  pastaVariant: PastaVariant
}
export type LoggerState = {
  date: string
  dayType: string
  meals: Meals
  sides: Sides
}

export function emptyMeals(): Meals {
  return { ontbijt: [], lunch: [], diner: [], snacks: [] }
}
export function emptySides(): Sides {
  return { riceRawG: 0, riceVariant: 'wit', pastaRawG: 0, pastaVariant: 'wit' }
}

export function todayStr(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function freshState(): LoggerState {
  return { date: todayStr(), dayType: DEFAULT_DAY_TYPE, meals: emptyMeals(), sides: emptySides() }
}

/** Leest de dag van vandaag; bij een nieuwe dag (of corrupte/lege state) een verse dag. */
export function loadState(): LoggerState {
  if (typeof window === 'undefined') return freshState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const p = JSON.parse(raw) as Partial<LoggerState>
      if (p.date === todayStr()) {
        return {
          date: p.date,
          dayType: p.dayType ?? DEFAULT_DAY_TYPE,
          meals: { ...emptyMeals(), ...(p.meals ?? {}) },
          sides: { ...emptySides(), ...(p.sides ?? {}) },
        }
      }
    }
  } catch {
    // corrupte state — negeren
  }
  if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY)
  return freshState()
}

export function saveState(state: LoggerState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, date: todayStr() }))
  } catch {
    // localStorage geblokkeerd/vol (bv. private mode) — stil negeren i.p.v. crashen
  }
}

/** Voegt een recept toe aan een maaltijd van vandaag (gebruikt door de "Loggen"-knop). */
export function addToMeal(mealId: MealId, recipeId: number, portions = 1): void {
  const s = loadState()
  s.meals[mealId] = [...s.meals[mealId], { recipeId, portions }]
  saveState(s)
}
