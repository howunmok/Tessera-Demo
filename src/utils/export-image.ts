import { toPng } from 'html-to-image'

/**
 * Saves an element as a PNG. Fonts are embedded (only the families the element uses) and
 * images are data URLs, so the result matches the screen. `pixelRatio` sets the output
 * resolution, e.g. 300 / 96 for print-quality 300 DPI.
 */
export async function downloadElementAsPng(
  element: HTMLElement,
  fileName: string,
  pixelRatio: number,
): Promise<void> {
  await document.fonts.ready
  const options = { pixelRatio, cacheBust: true }
  // Safari sometimes paints fonts and images only on a second pass.
  if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) await toPng(element, options)
  const dataUrl = await toPng(element, options)

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
}

/** Print resolution for business-card exports: 3.5 × 2 in at 300 DPI = 1050 × 600 px. */
export const PRINT_PIXEL_RATIO = 300 / 96
