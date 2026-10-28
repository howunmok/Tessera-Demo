import { clsx } from 'clsx'
import {
  ImagePlus,
  LoaderCircle,
  Mountain,
  Trash,
  Upload,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useId, useRef, useState, type DragEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import type { PhotoShape } from '@/types/card'
import {
  encodeCanvas,
  getOutputSize,
  ImageProcessingError,
  prepareImageForCrop,
  renderCroppedImage,
  type ImageKind,
  type PixelArea,
} from '@/utils/image'
import { CropDialog } from './CropDialog'

const KINDS: Record<
  ImageKind,
  { noun: string; title: string; placeholder: LucideIcon; tile: string; image: string }
> = {
  photo: {
    noun: 'photo',
    title: 'Photo',
    placeholder: UserRound,
    tile: 'size-22',
    image: 'size-full object-cover',
  },
  logo: {
    noun: 'logo',
    title: 'Logo',
    placeholder: ImagePlus,
    tile: 'size-22 rounded-2xl',
    image: 'max-h-14 max-w-18 object-contain',
  },
  cover: {
    noun: 'cover image',
    title: 'Cover image',
    placeholder: Mountain,
    tile: 'aspect-[3/1] w-40 rounded-xl sm:w-48',
    image: 'size-full object-cover',
  },
}

interface ImageFieldProps {
  kind: ImageKind
  label: string
  hint: string
  value: string | null
  onChange: (value: string | null) => void
  photoShape?: PhotoShape
}

/** Upload → crop → compress → data URL. Accepts a click or a dropped file. */
export function ImageField({
  kind,
  label,
  hint,
  value,
  onChange,
  photoShape = 'circle',
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const hintId = useId()
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [preparing, setPreparing] = useState(false)
  const [dragging, setDragging] = useState(false)
  const { noun, title, placeholder: Placeholder, tile, image } = KINDS[kind]

  async function handleFile(file: File) {
    setPreparing(true)
    try {
      setCropSrc(await prepareImageForCrop(file))
    } catch (error) {
      toast.error(
        error instanceof ImageProcessingError ? error.message : 'That image couldn’t be opened.',
      )
    } finally {
      setPreparing(false)
    }
  }

  function closeCropper() {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  async function applyCrop(area: PixelArea) {
    if (!cropSrc) return
    const canvas = await renderCroppedImage(cropSrc, area, getOutputSize(area, kind))
    onChange(await encodeCanvas(canvas, { keepTransparency: kind === 'logo' }))
    closeCropper()
  }

  function remove() {
    const previous = value
    onChange(null)
    toast(`${title} removed`, {
      action: {
        label: 'Undo',
        onClick: () => {
          onChange(previous)
        },
      },
    })
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) void handleFile(file)
  }

  return (
    <div>
      <p className="mb-2.5 text-sm font-medium">{label}</p>
      <div className="flex items-center gap-4">
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => {
            setDragging(false)
          }}
          onDrop={handleDrop}
          className={clsx(
            'relative grid shrink-0 place-items-center overflow-hidden border transition-colors',
            tile,
            kind === 'photo' && (photoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'),
            dragging
              ? 'border-2 border-dashed border-ink bg-ink/5'
              : value
                ? 'border-line'
                : 'border-dashed border-line-strong bg-canvas',
            value && kind === 'logo' && 'bg-checkerboard',
          )}
        >
          {value ? (
            <img src={value} alt={`Current ${noun}`} className={image} />
          ) : (
            <Placeholder aria-hidden className="size-7 text-muted/70" />
          )}
          {preparing && (
            <div className="absolute inset-0 grid place-items-center bg-surface/80">
              <LoaderCircle aria-hidden className="size-5 animate-spin text-muted" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={preparing}
              aria-describedby={hintId}
              onClick={() => inputRef.current?.click()}
            >
              <Upload aria-hidden className="size-4" />
              {value ? 'Replace' : 'Upload'}
              <span className="sr-only"> {noun}</span>
            </Button>
            {value && (
              <Button variant="ghost" size="sm" onClick={remove} aria-label={`Remove ${noun}`}>
                <Trash aria-hidden className="size-4" />
                <span className="max-sm:sr-only">Remove</span>
              </Button>
            )}
          </div>
          <p id={hintId} className="mt-2 text-xs leading-relaxed text-muted">
            {hint}
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = '' // allow choosing the same file again
          if (file) void handleFile(file)
        }}
      />

      {cropSrc && (
        <CropDialog
          key={cropSrc}
          src={cropSrc}
          kind={kind}
          photoShape={photoShape}
          onCancel={closeCropper}
          onApply={applyCrop}
        />
      )}
    </div>
  )
}
