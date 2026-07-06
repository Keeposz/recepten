'use client'

import { useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DAY_TYPES,
  DEFAULT_DAY_TYPE,
  MAINTENANCE_KCAL,
  dayTarget,
  formatGrams,
  kcalOf,
} from '@/lib/nutrition'
import type { PlannerRecipe } from '@/lib/queries'

const STORAGE_KEY = 'recepten:planner:v1'

const MEALS = [
  { id: 'ontbijt', label: 'Ontbijt' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'diner', label: 'Diner' },
  { id: 'snacks', label: 'Snacks' },
] as const

type MealId = (typeof MEALS)[number]['id']
type Item = { recipeId: number; portions: number }
type Meals = Record<MealId, Item[]>

const EMPTY_MEALS: Meals = { ontbijt: [], lunch: [], diner: [], snacks: [] }

type StoredState = { date: string; dayType: string; meals: Meals }

function todayStr(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function round(n: number): number {
  return Math.round(n)
}

export function Planner({ recipes }: { recipes: PlannerRecipe[] }) {
  const [dayType, setDayType] = useState<string>(DEFAULT_DAY_TYPE)
  const [meals, setMeals] = useState<Meals>(EMPTY_MEALS)
  const [loaded, setLoaded] = useState(false)

  const byId = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes])

  // Laad de opgeslagen dag — maar enkel als het nog vandaag is. Nieuwe dag = leeg.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as StoredState
        if (parsed.date === todayStr()) {
          setDayType(parsed.dayType ?? DEFAULT_DAY_TYPE)
          setMeals({ ...EMPTY_MEALS, ...parsed.meals })
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch {
      // corrupte state — negeren, verse dag
    }
    setLoaded(true)
  }, [])

  // Bewaar bij elke wijziging (pas nadat we geladen hebben, anders overschrijven we).
  useEffect(() => {
    if (!loaded) return
    const state: StoredState = { date: todayStr(), dayType, meals }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [loaded, dayType, meals])

  const totals = useMemo(() => {
    let proteinG = 0
    let carbsG = 0
    let fatG = 0
    for (const meal of MEALS) {
      for (const item of meals[meal.id]) {
        const r = byId.get(item.recipeId)
        if (!r) continue
        proteinG += (r.proteinG ?? 0) * item.portions
        carbsG += (r.carbsG ?? 0) * item.portions
        fatG += (r.fatG ?? 0) * item.portions
      }
    }
    return { proteinG, carbsG, fatG, kcal: kcalOf({ proteinG, carbsG, fatG }) }
  }, [meals, byId])

  const target = dayTarget(dayType)

  function addItem(mealId: MealId, recipeId: number) {
    setMeals((prev) => ({
      ...prev,
      [mealId]: [...prev[mealId], { recipeId, portions: 1 }],
    }))
  }

  function setPortions(mealId: MealId, index: number, portions: number) {
    setMeals((prev) => ({
      ...prev,
      [mealId]: prev[mealId].map((it, i) => (i === index ? { ...it, portions } : it)),
    }))
  }

  function removeItem(mealId: MealId, index: number) {
    setMeals((prev) => ({
      ...prev,
      [mealId]: prev[mealId].filter((_, i) => i !== index),
    }))
  }

  function clearDay() {
    setMeals(EMPTY_MEALS)
  }

  const itemCount = MEALS.reduce((sum, m) => sum + meals[m.id].length, 0)

  const bars = [
    {
      key: 'kcal',
      label: 'kcal',
      current: round(totals.kcal),
      target: round(target.kcal),
      unit: '',
    },
    {
      key: 'protein',
      label: 'Eiwit',
      current: totals.proteinG,
      target: target.proteinG,
      unit: ' g',
    },
    {
      key: 'carbs',
      label: 'Koolhydraten',
      current: totals.carbsG,
      target: target.carbsG,
      unit: ' g',
    },
    { key: 'fat', label: 'Vet', current: totals.fatG, target: target.fatG, unit: ' g' },
  ]

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Linkerkolom: dagtype + maaltijden */}
      <div className="space-y-8">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Dagtype
            </h2>
            {itemCount > 0 && (
              <button
                type="button"
                onClick={clearDay}
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground underline hover:text-foreground"
              >
                Dag leegmaken
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {DAY_TYPES.map((dt) => {
              const active = dt.id === dayType
              return (
                <button
                  key={dt.id}
                  type="button"
                  onClick={() => setDayType(dt.id)}
                  className={`border-2 border-foreground px-3 py-1.5 text-left transition-transform ${
                    active
                      ? 'bg-accent text-accent-foreground shadow-[3px_3px_0_0_var(--foreground)]'
                      : 'bg-background hover:-translate-y-[1px]'
                  }`}
                >
                  <span className="block font-display text-sm uppercase leading-none tracking-wide">
                    {dt.label}
                  </span>
                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider opacity-70">
                    {dt.carbsG} g kh · {dt.hint}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {recipes.length === 0 && (
          <p className="border-2 border-dashed border-foreground/30 px-4 py-3 text-sm text-muted-foreground">
            Nog geen recepten met macro’s. Vul ze in bij een recept (Bewerken → Voedingswaarde), of
            draai de backfill — dan verschijnen ze in de keuzelijsten.
          </p>
        )}

        {MEALS.map((meal) => (
          <section key={meal.id}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl uppercase tracking-tight">{meal.label}</h2>
              <div className="w-48 shrink-0">
                <RecipePicker recipes={recipes} onPick={(id) => addItem(meal.id, id)} />
              </div>
            </div>

            {meals[meal.id].length === 0 ? (
              <p className="border-2 border-dashed border-foreground/25 px-4 py-3 text-sm text-muted-foreground">
                Nog niets gekozen.
              </p>
            ) : (
              <ul className="space-y-2">
                {meals[meal.id].map((item, index) => {
                  const r = byId.get(item.recipeId)
                  if (!r) return null
                  const kcal = round(
                    kcalOf({
                      proteinG: (r.proteinG ?? 0) * item.portions,
                      carbsG: (r.carbsG ?? 0) * item.portions,
                      fatG: (r.fatG ?? 0) * item.portions,
                    }),
                  )
                  return (
                    <li
                      key={`${meal.id}-${index}`}
                      className="flex items-center gap-3 border-2 border-foreground px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{r.title}</p>
                        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                          {kcal} kcal · E {formatGrams((r.proteinG ?? 0) * item.portions)} · K{' '}
                          {formatGrams((r.carbsG ?? 0) * item.portions)} · V{' '}
                          {formatGrams((r.fatG ?? 0) * item.portions)}
                        </p>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        step={0.5}
                        value={item.portions}
                        onChange={(e) =>
                          setPortions(meal.id, index, Math.max(0, Number(e.target.value) || 0))
                        }
                        className="w-16 text-center tabular-nums"
                        aria-label="Porties"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(meal.id, index)}
                        aria-label="Verwijderen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* Rechterkolom: totalen t.o.v. dagdoel */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="border-2 border-foreground bg-card p-5 shadow-[6px_6px_0_0_var(--foreground)]">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-2xl uppercase tracking-tight">Vandaag</h2>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {target.label}
            </span>
          </div>
          <div className="space-y-4">
            {bars.map(({ key, ...bar }) => (
              <Bar key={key} {...bar} />
            ))}
          </div>
          <p className="mt-4 border-t-2 border-foreground/15 pt-3 font-mono text-[11px] leading-5 text-muted-foreground">
            Onderhoud ≈ {MAINTENANCE_KCAL} kcal (referentie). kcal-doel volgt uit je macro’s en
            stijgt vanzelf op zwaardere dagen.
          </p>
        </div>
      </aside>
    </div>
  )
}

function Bar({
  label,
  current,
  target,
  unit,
}: {
  label: string
  current: number
  target: number
  unit: string
}) {
  const pct = target > 0 ? (current / target) * 100 : 0
  const over = current > target
  const remaining = target - current
  const fmt = unit === ' g' ? formatGrams : (n: number) => String(round(n))

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-display text-sm uppercase tracking-wide">{label}</span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {fmt(current)}
          {unit} / {fmt(target)}
          {unit}
        </span>
      </div>
      <div className="h-4 w-full overflow-hidden border-2 border-foreground bg-background">
        <div
          className={`h-full ${over ? 'bg-destructive' : 'bg-accent'}`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {over ? `${fmt(-remaining)}${unit} over` : `nog ${fmt(remaining)}${unit}`} · {round(pct)}%
      </div>
    </div>
  )
}

function RecipePicker({
  recipes,
  onPick,
}: {
  recipes: PlannerRecipe[]
  onPick: (recipeId: number) => void
}) {
  // Gecontroleerde Select die na een keuze weer leegt, zodat je meerdere keer kan toevoegen.
  const [value, setValue] = useState('')
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (!v) return
        onPick(Number(v))
        setValue('')
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="+ Recept toevoegen" />
      </SelectTrigger>
      <SelectContent>
        {recipes.map((r) => (
          <SelectItem key={r.id} value={String(r.id)}>
            {r.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
