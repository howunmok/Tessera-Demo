import imageCompression from 'browser-image-compression'

/*
 * Image pipeline (no Cloud Storage on the Spark plan, so images live inside the card document):
 *   1. prepareImageForCrop  — validate the upload and shrink huge camera photos
 *   2. the user crops it in <CropDialog>
 *   3. renderCroppedImage   — draw the crop onto a canvas at the final size
 *   4. encodeCanvas         — WebP (or PNG/JPEG fallback) under the byte budget, as a data URL
 */

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024
const PRESHRINK_ABOVE_BYTES = 2 * 1024 * 1024

/** Byte budget per stored image (~133 KB as base64, well inside the 1 MB document limit). */
export const IMAGE_MAX_BYTES = 100_000

export type ImageKind = 'photo' | 'logo' | 'cover'

/** Longest side of the saved image: square 400px photos, 300px logos, 1200 × 400 covers. */
const MAX_OUTPUT_SIZE: Record<ImageKind, number> = { photo: 400, logo: 300, cover: 1200 }

export class ImageProcessingError extends Error {}

export interface PixelArea {
  x: number
  y: number
  width: number
  height: number
}

/** Validates an upload and returns an object URL for the cropper. Revoke it when done. */
export async function prepareImageForCrop(file: File): Promise<string> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new ImageProcessingError('Choose a JPG, PNG or WebP image.')
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ImageProcessingError('That image is over 15 MB. Choose a smaller one.')
  }

  let source: Blob = file
  if (file.size > PRESHRINK_ABOVE_BYTES) {
    // Big camera photos make cropping sluggish; scale them down first.
    // useWebWorker is off because the library's worker downloads itself from a CDN.
    source = await imageCompression(file, {
      maxWidthOrHeight: 2000,
      initialQuality: 0.92,
      useWebWorker: false,
    })
  }
  return URL.createObjectURL(source)
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image()
  image.src = src
  try {
    await image.decode()
  } catch {
    throw new ImageProcessingError('This image couldn’t be read. Try a different file.')
  }
  return image
}

function createCanvas(width: number, height: number): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  const context = canvas.getContext('2d')
  if (!context) throw new ImageProcessingError('Your browser couldn’t process this image.')
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  return context
}

/** Output size for a crop. Never upscales beyond the cropped area's real pixels. */
export function getOutputSize(area: PixelArea, kind: ImageKind) {
  const scale = Math.min(1, MAX_OUTPUT_SIZE[kind] / Math.max(area.width, area.height))
  return { width: area.width * scale, height: area.height * scale }
}

export async function renderCroppedImage(
  src: string,
  area: PixelArea,
  output: { width: number; height: number },
): Promise<HTMLCanvasElement> {
  const image = await loadImage(src)
  const context = createCanvas(output.width, output.height)
  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    context.canvas.width,
    context.canvas.height,
  )
  return context.canvas
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality)
  })
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new ImageProcessingError('This image couldn’t be read.'))
    }
    reader.onerror = () => {
      reject(new ImageProcessingError('This image couldn’t be read.'))
    }
    reader.readAsDataURL(blob)
  })
}

function scaleCanvas(canvas: HTMLCanvasElement, factor: number, background?: string) {
  const context = createCanvas(canvas.width * factor, canvas.height * factor)
  if (background) {
    context.fillStyle = background
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)
  }
  context.drawImage(canvas, 0, 0, context.canvas.width, context.canvas.height)
  return context.canvas
}

/**
 * Encodes a canvas as a data URL no larger than `maxBytes`.
 * Prefers WebP; browsers that can't encode WebP fall back to PNG (logos, to keep
 * transparency) or JPEG on white. Shrinks the image as a last resort.
 */
export async function encodeCanvas(
  canvas: HTMLCanvasElement,
  options: { maxBytes?: number; keepTransparency?: boolean } = {},
): Promise<string> {
  const maxBytes = options.maxBytes ?? IMAGE_MAX_BYTES
  let current = canvas

  for (let attempt = 0; attempt < 4; attempt++) {
    for (const quality of [0.9, 0.82, 0.74, 0.66, 0.58, 0.5]) {
      const webp = await canvasToBlob(current, 'image/webp', quality)
      // Browsers without a WebP encoder silently return PNG instead.
      if (webp?.type !== 'image/webp') break
      if (webp.size <= maxBytes) return blobToDataUrl(webp)
    }

    if (options.keepTransparency) {
      const png = await canvasToBlob(current, 'image/png')
      if (png && png.size <= maxBytes) return blobToDataUrl(png)
    }

    const flattened = scaleCanvas(current, 1, '#ffffff')
    for (const quality of [0.88, 0.8, 0.72, 0.64, 0.56, 0.48]) {
      const jpeg = await canvasToBlob(flattened, 'image/jpeg', quality)
      if (jpeg && jpeg.size <= maxBytes) return blobToDataUrl(jpeg)
    }

    current = scaleCanvas(current, 0.8)
  }

  throw new ImageProcessingError('This image couldn’t be made small enough. Try a simpler one.')
}
