import { clsx } from 'clsx'
import { ZoomIn, ZoomOut } from 'lucide-react'
import { useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { PhotoShape } from '@/types/card'
import { ImageProcessingError, type ImageKind, type PixelArea } from '@/utils/image'

type LogoFrame = 'original' | 'square' | 'wide'

const LOGO_FRAMES = [
  { value: 'original', label: 'Original' },
  { value: 'square', label: 'Square' },
  { value: 'wide', label: 'Wide' },
] as const

const COPY: Record<ImageKind, { title: string; description: string }> = {
  photo: {
    title: 'Crop your photo',
    description: 'Drag to position your face in the frame, and zoom to fit.',
  },
  logo: {
    title: 'Crop your logo',
    description: 'Keep the whole logo inside the frame. Zoom out to add breathing room.',
  },
  cover: {
    title: 'Crop your cover image',
    description: 'Drag to choose the part that shows across the top of your card.',
  },
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

interface CropDialogProps {
  src: string
  kind: ImageKind
  photoShape: PhotoShape
  onCancel: () => void
  onApply: (area: PixelArea) => Promise<void>
}

/** Crop step for uploads. Mount it fresh for each image so its state starts clean. */
export function CropDialog({ src, kind, photoShape, onCancel, onApply }: CropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [frame, setFrame] = useState<LogoFrame>('original')
  const [naturalAspect, setNaturalAspect] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [applying, setApplying] = useState(false)

  const isLogo = kind === 'logo'
  // Logos may zoom out past the edges (adds transparent padding); photos and covers can't.
  const minZoom = isLogo ? 0.5 : 1
  let aspect = kind === 'cover' ? 3 : 1
  if (isLogo) aspect = frame === 'wide' ? 3 : frame === 'square' ? 1 : naturalAspect

  async function apply() {
    if (!area) return
    setApplying(true)
    try {
      await onApply(area)
    } catch (error) {
      toast.error(
        error instanceof ImageProcessingError
          ? error.message
          : 'This image couldn’t be processed. Try another one.',
      )
      setApplying(false)
    }
  }

  return (
    <Dialog
      open
      onClose={onCancel}
      busy={applying}
      size="lg"
      title={COPY[kind].title}
      description={COPY[kind].description}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={applying}>
            Cancel
          </Button>
          <Button onClick={() => void apply()} loading={applying} disabled={!area}>
            Apply
          </Button>
        </>
      }
    >
      {isLogo && (
        <SegmentedControl
          label="Frame"
          value={frame}
          options={LOGO_FRAMES}
          onChange={(value) => {
            setFrame(value)
            setZoom(1)
            setCrop({ x: 0, y: 0 })
          }}
          className="mb-4"
        />
      )}

      <div
        className={clsx(
          'relative h-72 overflow-hidden rounded-2xl sm:h-80',
          isLogo ? 'bg-checkerboard' : 'bg-ink',
        )}
      >
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          minZoom={minZoom}
          maxZoom={4}
          zoomSpeed={0.15}
          cropShape={kind === 'photo' && photoShape === 'circle' ? 'round' : 'rect'}
          showGrid={kind !== 'photo'}
          restrictPosition={!isLogo}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => {
            setArea(pixels)
          }}
          onMediaLoaded={(media) => {
            setNaturalAspect(clamp(media.naturalWidth / media.naturalHeight, 1 / 3, 5))
          }}
          mediaProps={{ alt: '' }}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <ZoomOut aria-hidden className="size-4 shrink-0 text-muted" />
        <input
          type="range"
          min={minZoom}
          max={4}
          step={0.01}
          value={zoom}
          onChange={(event) => {
            setZoom(Number(event.target.value))
          }}
          aria-label="Zoom"
          className="h-1.5 w-full cursor-pointer accent-ink"
        />
        <ZoomIn aria-hidden className="size-4 shrink-0 text-muted" />
      </div>
    </Dialog>
  )
}
