// Eenmalige backfill: leest de vrije-tekst voedingswaarde uit `notes` en vult
// de gestructureerde macro-kolommen (protein_g, carbs_g, fat_g) in.
//
// Verwacht formaat in notes, bv.:
//   "VOEDINGSWAARDE (per portie): 205 kcal — 28 g eiwit · 15 g koolhydraten · 3,7 g vet"
//
// Draaien (alleen better-sqlite3 nodig, geen tsx):
//   node scripts/backfill-nutrition.mjs            # DRY-RUN, wijzigt niets
//   node scripts/backfill-nutrition.mjs --apply    # schrijft de macro-kolommen weg
//   node scripts/backfill-nutrition.mjs --apply --force   # overschrijft ook al ingevulde macro's
//
// DB-pad volgt DATABASE_PATH (zoals de app), default ./data/recepten.db:
//   DATABASE_PATH=/data/recepten.db node scripts/backfill-nutrition.mjs

import Database from 'better-sqlite3'

const APPLY = process.argv.includes('--apply')
const FORCE = process.argv.includes('--force')
const DB_PATH = process.env.DATABASE_PATH ?? './data/recepten.db'

function num(raw) {
  if (raw == null) return null
  const n = Number(String(raw).replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : null
}

// Pakt het getal dat vóór een label staat, bv. "28 g eiwit" of "28g eiwit".
function grab(text, label) {
  const re = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*g?\\s*${label}`, 'i')
  const m = text.match(re)
  return m ? num(m[1]) : null
}

function parseNotes(notes) {
  if (!notes) return null
  const kcalMatch = notes.match(/(\d+(?:[.,]\d+)?)\s*kcal/i)
  const kcal = kcalMatch ? num(kcalMatch[1]) : null
  const proteinG = grab(notes, 'eiwit')
  const carbsG = grab(notes, 'koolh') // koolhydraten / koolhydr.
  const fatG = grab(notes, 'vet')

  if (proteinG == null && carbsG == null && fatG == null && kcal == null) return null

  const perHundred = /per\s*100/i.test(notes) && !/per\s*portie/i.test(notes)
  return { kcal, proteinG, carbsG, fatG, perHundred }
}

function fmt(v) {
  return v == null ? '—' : String(v)
}

const db = new Database(DB_PATH)
const rows = db
  .prepare('SELECT id, title, servings, notes, protein_g, carbs_g, fat_g FROM recipe ORDER BY id')
  .all()

const update = db.prepare(
  'UPDATE recipe SET protein_g = ?, carbs_g = ?, fat_g = ? WHERE id = ?',
)

console.log(`DB: ${DB_PATH}`)
console.log(`Modus: ${APPLY ? 'APPLY (schrijft weg)' : 'DRY-RUN (wijzigt niets)'}${FORCE ? ' + FORCE' : ''}`)
console.log(`Recepten: ${rows.length}\n`)

let willWrite = 0
let skippedExisting = 0
let noData = 0
const warnings = []

for (const r of rows) {
  const parsed = parseNotes(r.notes)
  if (!parsed) {
    noData++
    console.log(`· #${r.id} ${r.title} — geen voedingswaarde in notes, overgeslagen`)
    continue
  }

  const alreadySet = r.protein_g != null || r.carbs_g != null || r.fat_g != null
  if (alreadySet && !FORCE) {
    skippedExisting++
    console.log(`· #${r.id} ${r.title} — heeft al macro's, overgeslagen (gebruik --force om te overschrijven)`)
    continue
  }

  // Sanity: klopt de genoteerde kcal met 4/4/9 van de macro's?
  const computedKcal =
    (parsed.proteinG ?? 0) * 4 + (parsed.carbsG ?? 0) * 4 + (parsed.fatG ?? 0) * 9
  if (parsed.kcal != null && Math.abs(computedKcal - parsed.kcal) > 15) {
    warnings.push(
      `#${r.id} ${r.title}: genoteerd ${parsed.kcal} kcal vs berekend ${Math.round(computedKcal)} kcal (verschil > 15) — even nakijken`,
    )
  }
  if (parsed.perHundred) {
    warnings.push(`#${r.id} ${r.title}: lijkt "per 100 g" i.p.v. per portie — NIET automatisch overgenomen`)
    console.log(`! #${r.id} ${r.title} — per 100 g? handmatig checken, overgeslagen`)
    continue
  }

  willWrite++
  console.log(
    `✎ #${r.id} ${r.title} — eiwit ${fmt(parsed.proteinG)} · kh ${fmt(parsed.carbsG)} · vet ${fmt(parsed.fatG)} (≈ ${Math.round(computedKcal)} kcal)`,
  )

  if (APPLY) {
    update.run(parsed.proteinG, parsed.carbsG, parsed.fatG, r.id)
  }
}

console.log('\n— Samenvatting —')
console.log(`  ${willWrite} ${APPLY ? 'weggeschreven' : 'zouden weggeschreven worden'}`)
console.log(`  ${skippedExisting} overgeslagen (al ingevuld)`)
console.log(`  ${noData} zonder voedingswaarde in notes`)
if (warnings.length) {
  console.log('\n⚠ Waarschuwingen:')
  for (const w of warnings) console.log(`  - ${w}`)
}
if (!APPLY && willWrite > 0) {
  console.log('\nNiets gewijzigd. Draai opnieuw met --apply om weg te schrijven.')
}

db.close()
