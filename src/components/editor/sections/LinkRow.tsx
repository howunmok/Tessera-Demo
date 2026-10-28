import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { clsx } from 'clsx'
import { ChevronDown, GripVertical, Trash } from 'lucide-react'
import { useId } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { PlatformBadge } from '@/components/links/PlatformBadge'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { TextField } from '@/components/ui/TextField'
import type { CardContent, CardLink } from '@/types/card'
import {
  getEditableLinkValue,
  getLinkDisplayValue,
  getLinkLabel,
  getLinkValueError,
  getPlatform,
  normalizeLinkValue,
  resolveLinkType,
} from '@/utils/links'

interface LinkRowProps {
  sortableId: string
  index: number
  editing: boolean
  onToggleEdit: () => void
  onRemove: () => void
}

/** One link: drag handle, icon, name, show/hide switch, and an expandable editor. */
export function LinkRow({ sortableId, index, editing, onToggleEdit, onRemove }: LinkRowProps) {
  const {
    control,
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<CardContent>()
  // Undefined for a moment while a removed row unmounts.
  const link = useWatch({ control, name: `links.${index}` }) as CardLink | undefined
  const panelId = useId()
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId })

  if (!link) return null

  // Show the link as it will be saved: normalized, with the detected platform's icon.
  const url = normalizeLinkValue(link.type, link.url)
  const type = resolveLinkType(link.type, url)
  const label = getLinkLabel({ ...link, url, type })
  const platform = getPlatform(link.type)
  const linkErrors = errors.links?.[index]
  const urlError = linkErrors?.url?.message

  let detail = 'Not set up yet — tap to add'
  if (urlError) detail = 'Needs fixing'
  else if (url) detail = getLinkDisplayValue(type, url)

  const urlField = register(`links.${index}.url`, {
    // On leaving the field, show the normalized value and switch to the detected platform.
    onBlur: () => {
      const current = getValues(`links.${index}`)
      const normalized = normalizeLinkValue(current.type, current.url)
      const resolved = resolveLinkType(current.type, normalized)
      // Leave invalid input exactly as typed; the error message explains what's wrong.
      if (getLinkValueError(resolved, normalized)) return
      if (resolved !== current.type)
        setValue(`links.${index}.type`, resolved, { shouldDirty: true })
      const editable = getEditableLinkValue(resolved, normalized)
      if (editable !== current.url) {
        setValue(`links.${index}.url`, editable, { shouldDirty: true, shouldValidate: true })
      }
    },
  })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={clsx(
        'rounded-2xl border bg-surface',
        isDragging ? 'relative z-10 border-ink/20 shadow-lift' : 'border-line',
      )}
    >
      <div className="flex items-center gap-1 py-2 pr-2 pl-1 sm:gap-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${label}`}
          className="grid size-9 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-muted transition-colors hover:bg-ink/5 hover:text-ink active:cursor-grabbing"
        >
          <GripVertical aria-hidden className="size-4" />
        </button>

        <PlatformBadge
          type={type}
          className={clsx('size-9 transition-opacity', !link.visible && 'opacity-35 grayscale')}
        />

        <button
          type="button"
          onClick={onToggleEdit}
          aria-expanded={editing}
          aria-controls={panelId}
          className="min-w-0 flex-1 rounded-lg px-1.5 py-1 text-left"
        >
          <span
            className={clsx('block truncate text-sm font-medium', !link.visible && 'text-muted')}
          >
            {label}
          </span>
          <span
            className={clsx(
              'block truncate text-xs',
              urlError ? 'font-medium text-danger' : url ? 'text-muted' : 'text-brass-strong',
            )}
          >
            {link.visible || !url ? detail : `Hidden · ${detail}`}
          </span>
        </button>

        <Switch
          checked={link.visible}
          onChange={(visible) => {
            setValue(`links.${index}.visible`, visible, { shouldDirty: true })
          }}
          label={`Show ${label} on card`}
        />
        <button
          type="button"
          onClick={onToggleEdit}
          aria-label={editing ? `Close ${label}` : `Edit ${label}`}
          aria-expanded={editing}
          aria-controls={panelId}
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <ChevronDown
            aria-hidden
            className={clsx('size-4 transition-transform duration-200', editing && 'rotate-180')}
          />
        </button>
      </div>

      {editing && (
        <div
          id={panelId}
          className="grid grid-cols-1 gap-4 border-t border-line p-4 sm:grid-cols-2"
        >
          <TextField
            label="Label"
            placeholder={platform.defaultLabel || 'e.g. My blog'}
            hint="Shown on your card."
            error={linkErrors?.label?.message}
            {...register(`links.${index}.label`)}
          />
          <TextField
            label={platform.inputLabel}
            placeholder={platform.placeholder}
            hint={platform.hint ?? 'https:// is added for you.'}
            error={urlError}
            inputMode={link.type === 'whatsapp' ? 'tel' : link.type === 'wechat' ? 'text' : 'url'}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            // A brand-new link opens straight into this field.
            autoFocus={!link.url}
            {...urlField}
          />
          <div className="flex items-center justify-between gap-3 sm:col-span-2">
            <Button variant="danger-ghost" size="sm" className="-ml-2" onClick={onRemove}>
              <Trash aria-hidden className="size-4" /> Delete link
            </Button>
            <Button variant="secondary" size="sm" onClick={onToggleEdit}>
              Done
            </Button>
          </div>
        </div>
      )}
    </li>
  )
}
