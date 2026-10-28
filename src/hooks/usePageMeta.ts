import { useEffect } from 'react'

export interface PageMeta {
  title: string
  description?: string
  url?: string
  /** Keep the page out of search results. */
  noindex?: boolean
  /** Browser UI color on mobile. */
  themeColor?: string
}

/** Sets (or creates) a <meta> tag and returns a function that restores the previous value. */
function setMetaTag(attribute: 'name' | 'property', key: string, value: string | undefined) {
  if (value === undefined) return () => undefined
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  const created = tag === null
  const previous = tag?.content
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.append(tag)
  }
  tag.content = value
  return () => {
    if (created) tag.remove()
    else if (previous !== undefined) tag.content = previous
  }
}

/**
 * Page title and meta tags for the current page, restored when it unmounts. Search engines
 * that run JavaScript read these; link-preview bots don't — on Netlify, the card-preview
 * edge function serves them the same tags in the HTML instead.
 */
export function usePageMeta({ title, description, url, noindex, themeColor }: PageMeta): void {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title
    const restore = [
      setMetaTag('name', 'description', description),
      setMetaTag('property', 'og:title', title),
      setMetaTag('property', 'og:description', description),
      setMetaTag('property', 'og:url', url),
      setMetaTag('name', 'robots', noindex ? 'noindex' : undefined),
      setMetaTag('name', 'theme-color', themeColor),
    ]
    return () => {
      document.title = previousTitle
      for (const undo of restore) undo()
    }
  }, [title, description, url, noindex, themeColor])
}
