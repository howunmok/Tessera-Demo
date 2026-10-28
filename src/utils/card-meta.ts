/*
 * Title and description for a card's page and link previews. Kept free of imports so the
 * Netlify edge function (netlify/shared/card-preview.ts) can reuse it as-is.
 */

export interface CardSummary {
  fullName: string
  jobTitle: string
  company: string
  bio: string
}

export function describeCard(card: CardSummary): { title: string; description: string } {
  const name = card.fullName.trim()
  const role = [card.jobTitle.trim(), card.company.trim()].filter(Boolean).join(' at ')
  const title = name ? (role ? `${name} — ${role}` : name) : role || 'Digital business card'
  const description =
    card.bio.trim() ||
    (role
      ? `${role}. Save my contact, call, email or connect in one tap.`
      : 'Save my contact, call, email or connect in one tap.')
  return { title, description }
}
