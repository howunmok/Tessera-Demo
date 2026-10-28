/** "Benny Lee" → "BL", "benny@example.com" → "B". */
export function getInitials(name: string): string {
  const words = name
    .replace(/@.*$/, '')
    .split(/[\s._-]+/)
    .filter(Boolean)

  const initials = words.length > 1 ? [words[0], words[words.length - 1]] : words.slice(0, 1)
  return initials.map((word) => word?.charAt(0).toUpperCase() ?? '').join('')
}

/** The first word of a display name, for friendly greetings. */
export function getFirstName(name: string | null | undefined): string | undefined {
  return name?.trim().split(/\s+/)[0] || undefined
}
