/** `tel:` link; an extension ("ext. 12" / "x12") becomes a pause so phones dial it. */
export function telHref(number: string): string {
  const withPause = number.replace(/\s*(?:ext\.?|x)\s*(\d+)\s*$/i, ',$1')
  return `tel:${withPause.replace(/[^\d+,]/g, '')}`
}

export function mailtoHref(email: string): string {
  return `mailto:${email}`
}

/** Opens the address in Google Maps (app or web) on any device. */
export function mapsHref(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}
