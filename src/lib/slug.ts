import slugify from 'slugify'

export function toSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, locale: 'nl' })
}

export async function uniqueSlug(
  base: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = toSlug(base) || 'recept'
  let candidate = root
  let suffix = 2
  while (await isTaken(candidate)) {
    candidate = `${root}-${suffix}`
    suffix += 1
  }
  return candidate
}
