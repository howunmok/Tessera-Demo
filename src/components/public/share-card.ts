import { toast } from 'sonner'
import { copyText } from '@/utils/clipboard'

/**
 * Opens the device's share sheet (Web Share API). Where that isn't available — most desktop
 * browsers — the link is copied instead.
 */
export async function shareCard({
  title,
  text,
  url,
}: {
  title: string
  text: string
  url: string
}) {
  const data = { title, text, url }
  // canShare is missing in some browsers (e.g. Firefox), despite what the DOM types say.
  const shareable = 'canShare' in navigator ? navigator.canShare(data) : true
  if (typeof navigator.share === 'function' && shareable) {
    try {
      await navigator.share(data)
      return
    } catch (error) {
      // Closing the share sheet isn't an error worth reporting.
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
  }
  try {
    await copyText(url)
    toast.success('Link copied', { description: url })
  } catch {
    toast.error('Couldn’t copy the link')
  }
}
