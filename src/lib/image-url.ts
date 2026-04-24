export function imageUrl(filename: string | null | undefined): string | null {
  if (!filename) return null
  return `/api/images/${encodeURIComponent(filename)}`
}
