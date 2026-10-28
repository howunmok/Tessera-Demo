/** A short random id, e.g. for links inside a card ("k3f9x2m8q1ab"). */
export function createId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12)
}
