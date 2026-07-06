// Voedings-model voor de dagplanner.
//
// Uitgangspunten (afgesproken):
//  - Doel = onderhouden + spier, geen dieet.
//  - Eiwit (125 g) en vet (65 g) liggen elke dag vast — bouwsteen + hormonen.
//  - Koolhydraten zijn de énige knop die schuift, per dagtype (brandstof).
//  - kcal is een berekende OUTPUT (4/4/9), nooit een aparte invoer of harde limiet.
//    Daarom slaan we per recept ook alleen de 3 macro's op en niet kcal zelf.
//
// Alle carb-getallen zijn startwaarden — stel ze gerust bij op basis van de
// weegschaal na een paar weken. Dit is de enige plek waar je ze aanpast.

/** Vaste dagelijkse eiwitdoel in gram. */
export const PROTEIN_G = 125
/** Vaste dagelijkse vetdoel in gram. */
export const FAT_G = 65
/** Referentie: geschat onderhoud op een gemiddelde dag. Geen doel, enkel context. */
export const MAINTENANCE_KCAL = 2450

export type Macros = {
  proteinG: number
  carbsG: number
  fatG: number
}

export type DayType = {
  id: string
  label: string
  /** Optionele korte extra toelichting (geen dagen). Leeg = niets tonen. */
  hint: string
  carbsG: number
}

/** Enige bron van waarheid voor de koolhydraatdoelen per dagtype. */
export const DAY_TYPES: readonly DayType[] = [
  { id: 'rust', label: 'Rustdag', hint: '', carbsG: 250 },
  { id: 'rit_rustig', label: 'Rustige rit', hint: '', carbsG: 280 },
  { id: 'kracht', label: 'Krachtdag', hint: 'kettlebell', carbsG: 300 },
  { id: 'rit_hard', label: 'Harde rit', hint: '330-360 g', carbsG: 345 },
] as const

export const DEFAULT_DAY_TYPE = DAY_TYPES[0].id

export function dayTypeById(id: string): DayType {
  return DAY_TYPES.find((d) => d.id === id) ?? DAY_TYPES[0]
}

/** Kilocalorieën uit macro's — 4 kcal/g eiwit & koolhydraten, 9 kcal/g vet. */
export function kcalOf(macros: Partial<Macros>): number {
  const p = macros.proteinG ?? 0
  const c = macros.carbsG ?? 0
  const f = macros.fatG ?? 0
  return p * 4 + c * 4 + f * 9
}

// Bijgerechten die vaak variëren: rijst & pasta, ingevoerd als DROOG gewicht.
// Koken voegt geen kcal toe (enkel water), dus droog gewicht = wat je binnenkrijgt.
// Macro's per 100 g droog product, per variant.
export const SIDES = {
  rice: {
    label: 'Rijst',
    variants: {
      wit: { label: 'Wit · basmati/jasmijn', per100g: { proteinG: 6.7, carbsG: 79, fatG: 0.9 } },
      zilvervlies: { label: 'Zilvervlies', per100g: { proteinG: 7.5, carbsG: 77, fatG: 2.7 } },
    },
  },
  pasta: {
    label: 'Pasta',
    variants: {
      wit: { label: 'Wit', per100g: { proteinG: 12.5, carbsG: 75, fatG: 1.5 } },
      volkoren: { label: 'Volkoren', per100g: { proteinG: 14, carbsG: 68, fatG: 2.5 } },
    },
  },
} as const

export type RiceVariant = keyof typeof SIDES.rice.variants
export type PastaVariant = keyof typeof SIDES.pasta.variants

// Brood & sandwiches, ingevoerd per STUK (aantal sneetjes / broodjes). Macro's per 1 stuk.
// Gebaseerd op Belgische gemiddelden: snede brood ± 35 g, zachte sandwich ± 55 g.
export const BREAD = {
  label: 'Sneetje brood',
  variants: {
    wit: { label: 'Wit', per1: { proteinG: 3, carbsG: 17, fatG: 1 } }, // ± 92 kcal / snede
    bruin: { label: 'Bruin/volkoren', per1: { proteinG: 3.2, carbsG: 15, fatG: 1 } }, // ± 82 kcal
  },
} as const
export type BreadVariant = keyof typeof BREAD.variants

export const SANDWICH = {
  label: 'Sandwich',
  // Belgisch zacht broodje ± 55 g, ± 155 kcal.
  variants: { sandwich: { label: 'Sandwich', per1: { proteinG: 5, carbsG: 27, fatG: 3 } } },
} as const

/** Schaalt macro's met een factor (bv. gram/100, of aantal stuks). */
export function scaleMacros(base: Macros, factor: number): Macros {
  const k = factor > 0 ? factor : 0
  return { proteinG: base.proteinG * k, carbsG: base.carbsG * k, fatG: base.fatG * k }
}

/** Macro's voor een hoeveelheid (gram) van een bijgerecht met bekende waarde per 100 g. */
export function macrosFromGrams(per100g: Macros, grams: number): Macros {
  return scaleMacros(per100g, grams / 100)
}

export type DayTarget = Macros & { kcal: number; label: string }

/** Het macro- + kcal-doel voor een gekozen dagtype (met optionele carb-override). */
export function dayTarget(dayTypeId: string, carbsOverride?: number): DayTarget {
  const dt = dayTypeById(dayTypeId)
  const macros: Macros = {
    proteinG: PROTEIN_G,
    carbsG: carbsOverride ?? dt.carbsG,
    fatG: FAT_G,
  }
  return { ...macros, kcal: kcalOf(macros), label: dt.label }
}

/** Netjes afgerond weergeven: gehele kcal, macro's op 1 decimaal zonder overbodige .0. */
export function formatGrams(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
