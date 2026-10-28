import QRCodeStyling, { type Options } from 'qr-code-styling'

/** Saves the QR code as a file: PNG (pixels) or SVG (vector, scales to any size). */
export async function downloadQrCode(
  options: Partial<Options>,
  format: 'png' | 'svg',
  fileName: string,
): Promise<void> {
  const qr = new QRCodeStyling({ ...options, type: format === 'svg' ? 'svg' : 'canvas' })
  await qr.download({ name: fileName, extension: format })
}
