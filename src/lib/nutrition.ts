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
  /** Korte toelichting bij het dagtype (welke dagen). */
  hint: string
  carbsG: number
}

/** Enige bron van waarheid voor de koolhydraatdoelen per dagtype. */
export const DAY_TYPES: readonly DayType[] = [
  { id: 'rust', label: 'Rustdag', hint: 'di / do / vr', carbsG: 250 },
  { id: 'rit_rustig', label: 'Rustige rit', hint: 'zo', carbsG: 280 },
  { id: 'kracht', label: 'Krachtdag', hint: 'ma / wo — kettlebell', carbsG: 300 },
  { id: 'rit_hard', label: 'Harde rit', hint: 'za — 330-360 g', carbsG: 345 },
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

/** Macro's voor een hoeveelheid (gram) van een bijgerecht met bekende waarde per 100 g. */
export function macrosFromGrams(per100g: Macros, grams: number): Macros {
  const k = (grams > 0 ? grams : 0) / 100
  return { proteinG: per100g.proteinG * k, carbsG: per100g.carbsG * k, fatG: per100g.fatG * k }
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
