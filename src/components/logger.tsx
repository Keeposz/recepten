'use client'

import { useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BREAD,
  DAY_TYPES,
  MAINTENANCE_KCAL,
  SANDWICH,
  SIDES,
  dayTarget,
  formatGrams,
  kcalOf,
  macrosFromGrams,
  scaleMacros,
  type BreadVariant,
  type Macros,
  type PastaVariant,
  type RiceVariant,
} from '@/lib/nutrition'
import {
  MEALS,
  emptyMeals,
  emptySides,
  loadState,
  saveState,
  todayStr,
  type MealId,
  type Meals,
  type Sides,
} from '@/lib/logger-store'
import type { LoggerRecipe } from '@/lib/queries'

function round(n: number): number {
  return Math.round(n)
}

export function Logger({ recipes }: { recipes: LoggerRecipe[] }) {
  const [dayType, setDayType] = useState<string>(DAY_TYPES[0].id)
  const [meals, setMeals] = useState<Meals>(emptyMeals)
  const [sides, setSides] = useState<Sides>(emptySides)
  const [loaded, setLoaded] = useState(false)

  const byId = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes])

  // Laad de dag van vandaag; luister ook naar wijzigingen uit een ander tabblad
  // (bv. de "Loggen"-knop op een recept in een tweede tab).
  useEffect(() => {
    const sync = () => {
      const s = loadState()
      setDayType(s.dayType)
      setMeals(s.meals)
      setSides(s.sides)
    }
    sync()
    setLoaded(true)
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  useEffect(() => {
    if (!loaded) return
    saveState({ date: todayStr(), dayType, meals, sides })
  }, [loaded, dayType, meals, sides])

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
    const extras = [
      macrosFromGrams(SIDES.rice.variants[sides.riceVariant].per100g, sides.riceRawG),
      macrosFromGrams(SIDES.pasta.variants[sides.pastaVariant].per100g, sides.pastaRawG),
      scaleMacros(BREAD.variants[sides.breadVariant].per1, sides.breadCount),
      scaleMacros(SANDWICH.variants.sandwich.per1, sides.sandwichCount),
    ]
    for (const e of extras) {
      proteinG += e.proteinG
      carbsG += e.carbsG
      fatG += e.fatG
    }
    return { proteinG, carbsG, fatG, kcal: kcalOf({ proteinG, carbsG, fatG }) }
  }, [meals, sides, byId])

  const target = dayTarget(dayType)

  function setPortions(mealId: MealId, index: number, portions: number) {
    setMeals((prev) => ({
      ...prev,
      [mealId]: prev[mealId].map((it, i) => (i === index ? { ...it, portions } : it)),
    }))
  }
  function removeItem(mealId: MealId, index: number) {
    setMeals((prev) => ({ ...prev, [mealId]: prev[mealId].filter((_, i) => i !== index) }))
  }
  function clearDay() {
    setMeals(emptyMeals())
    setSides(emptySides())
  }

  const itemCount =
    MEALS.reduce((sum, m) => sum + meals[m.id].length, 0) +
    (sides.riceRawG > 0 ? 1 : 0) +
    (sides.pastaRawG > 0 ? 1 : 0) +
    (sides.breadCount > 0 ? 1 : 0) +
    (sides.sandwichCount > 0 ? 1 : 0)

  const bars = [
    { key: 'kcal', label: 'kcal', current: round(totals.kcal), target: round(target.kcal), unit: '' },
    { key: 'protein', label: 'Eiwit', current: totals.proteinG, target: target.proteinG, unit: ' g' },
    { key: 'carbs', label: 'Koolhydraten', current: totals.carbsG, target: target.carbsG, unit: ' g' },
    { key: 'fat', label: 'Vet', current: totals.fatG, target: target.fatG, unit: ' g' },
  ]

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
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
                    {dt.carbsG} g kh{dt.hint ? ` · ${dt.hint}` : ''}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {MEALS.map((meal) => (
          <section key={meal.id}>
            <h2 className="mb-3 font-display text-2xl uppercase tracking-tight">{meal.label}</h2>
            {meals[meal.id].length === 0 ? (
              <p className="border-2 border-dashed border-foreground/25 px-4 py-3 text-sm text-muted-foreground">
                Nog niets gelogd.
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

        {/* Rijst & pasta, per droog gewicht */}
        <section>
          <h2 className="mb-1 font-display text-2xl uppercase tracking-tight">Rijst &amp; pasta</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Hoeveel <strong>droge</strong> rijst/pasta je neemt.{' '}
            <span className="text-muted-foreground/80">
              (Gekookt = zelfde kcal, enkel meer water.)
            </span>
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <AmountInput
              label={SIDES.rice.label}
              variants={Object.entries(SIDES.rice.variants).map(([id, v]) => ({
                id,
                label: v.label,
                per: v.per100g,
              }))}
              variant={sides.riceVariant}
              amount={sides.riceRawG}
              step={5}
              unitSuffix="g"
              perLabel="droog · per 100 g"
              toFactor={(g) => g / 100}
              onVariant={(id) => setSides((s) => ({ ...s, riceVariant: id as RiceVariant }))}
              onAmount={(g) => setSides((s) => ({ ...s, riceRawG: g }))}
            />
            <AmountInput
              label={SIDES.pasta.label}
              variants={Object.entries(SIDES.pasta.variants).map(([id, v]) => ({
                id,
                label: v.label,
                per: v.per100g,
              }))}
              variant={sides.pastaVariant}
              amount={sides.pastaRawG}
              step={5}
              unitSuffix="g"
              perLabel="droog · per 100 g"
              toFactor={(g) => g / 100}
              onVariant={(id) => setSides((s) => ({ ...s, pastaVariant: id as PastaVariant }))}
              onAmount={(g) => setSides((s) => ({ ...s, pastaRawG: g }))}
            />
          </div>
        </section>

        {/* Brood & sandwiches, per stuk — vooral voor de lunch */}
        <section>
          <h2 className="mb-1 font-display text-2xl uppercase tracking-tight">Brood &amp; sandwich</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Aantal sneetjes of broodjes — handig voor je lunch.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <AmountInput
              label={BREAD.label}
              variants={Object.entries(BREAD.variants).map(([id, v]) => ({
                id,
                label: v.label,
                per: v.per1,
              }))}
              variant={sides.breadVariant}
              amount={sides.breadCount}
              step={1}
              unitSuffix="×"
              perLabel="per sneetje"
              toFactor={(c) => c}
              onVariant={(id) => setSides((s) => ({ ...s, breadVariant: id as BreadVariant }))}
              onAmount={(c) => setSides((s) => ({ ...s, breadCount: c }))}
            />
            <AmountInput
              label={SANDWICH.label}
              variants={Object.entries(SANDWICH.variants).map(([id, v]) => ({
                id,
                label: v.label,
                per: v.per1,
              }))}
              variant="sandwich"
              amount={sides.sandwichCount}
              step={1}
              unitSuffix="×"
              perLabel="per stuk"
              toFactor={(c) => c}
              onVariant={() => {}}
              onAmount={(c) => setSides((s) => ({ ...s, sandwichCount: c }))}
            />
          </div>
        </section>
      </div>

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

function AmountInput({
  label,
  variants,
  variant,
  amount,
  step,
  unitSuffix,
  perLabel,
  toFactor,
  onVariant,
  onAmount,
}: {
  label: string
  variants: { id: string; label: string; per: Macros }[]
  variant: string
  amount: number
  step: number
  unitSuffix: string
  perLabel: string
  toFactor: (amount: number) => number
  onVariant: (id: string) => void
  onAmount: (amount: number) => void
}) {
  const current = variants.find((v) => v.id === variant) ?? variants[0]
  const per = current.per
  const macros = scaleMacros(per, toFactor(amount))
  return (
    <div className="border-2 border-foreground px-3 py-2.5">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm uppercase tracking-wide">{label}</p>
          {variants.length > 1 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {variants.map((v) => {
                const active = v.id === current.id
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onVariant(v.id)}
                    className={`border-2 border-foreground px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                      active
                        ? 'bg-foreground text-background'
                        : 'bg-background text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {v.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={0}
            step={step}
            inputMode="numeric"
            value={amount || ''}
            onChange={(e) => onAmount(Math.max(0, Number(e.target.value) || 0))}
            className="w-20 text-center tabular-nums"
            aria-label={`${label} aantal`}
          />
          <span className="font-mono text-xs text-muted-foreground">{unitSuffix}</span>
        </div>
      </div>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {perLabel}: E {formatGrams(per.proteinG)} · K {formatGrams(per.carbsG)} · V{' '}
        {formatGrams(per.fatG)}
      </p>
      {amount > 0 && (
        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-foreground">
          = {round(kcalOf(macros))} kcal · E {formatGrams(macros.proteinG)} · K{' '}
          {formatGrams(macros.carbsG)} · V {formatGrams(macros.fatG)}
        </p>
      )}
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
