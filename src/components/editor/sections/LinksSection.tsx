import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type Modifier,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { PlatformBadge } from '@/components/links/PlatformBadge'
import { LIMITS } from '@/schemas/card'
import type { CardContent } from '@/types/card'
import { createId } from '@/utils/id'
import { getLinkLabel, getPlatform, PRESET_LINK_TYPES, type LinkType } from '@/utils/links'
import { getWhatsAppNumber } from '@/utils/phone'
import { FormSection } from '../FormSection'
import { LinkRow } from './LinkRow'

const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 })

export function LinksSection() {
  const { control, getValues } = useFormContext<CardContent>()
  // keyName "key" keeps RHF's internal row key from overwriting each link's own `id`.
  const { fields, append, remove, insert, move } = useFieldArray({
    control,
    name: 'links',
    keyName: 'key',
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const atLimit = fields.length >= LIMITS.links

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function add(type: LinkType) {
    const id = createId()
    append(
      {
        id,
        type,
        label: getPlatform(type).defaultLabel,
        // WhatsApp starts with your mobile number, e.g. "+16471234567".
        url: type === 'whatsapp' ? getWhatsAppNumber(getValues('profile.phones')) : '',
        visible: true,
        order: fields.length,
      },
      { shouldFocus: false },
    )
    setEditingId(id)
  }

  function removeAt(index: number) {
    const link = getValues(`links.${index}`)
    remove(index)
    toast(`${getLinkLabel(link)} removed`, {
      action: {
        label: 'Undo',
        onClick: () => {
          insert(Math.min(index, getValues('links').length), link)
        },
      },
    })
  }

  function indexOf(key: UniqueIdentifier) {
    return fields.findIndex((field) => field.key === key)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const from = indexOf(active.id)
    const to = indexOf(over.id)
    if (from !== -1 && to !== -1) move(from, to)
  }

  // Screen-reader announcements that use link names instead of internal ids.
  const labelOf = (key: UniqueIdentifier) => {
    const link = getValues('links')[indexOf(key)]
    return link ? getLinkLabel(link) : 'Link'
  }
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${labelOf(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over
        ? `${labelOf(active.id)} is over position ${String(indexOf(over.id) + 1)} of ${String(fields.length)}.`
        : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${labelOf(active.id)} dropped at position ${String(indexOf(over.id) + 1)} of ${String(fields.length)}.`
        : `${labelOf(active.id)} dropped.`,
    onDragCancel: ({ active }) => `Moving cancelled. ${labelOf(active.id)} is back in place.`,
  }

  return (
    <FormSection
      title="Links"
      description="Your website, social profiles and booking page — add as many as you like."
    >
      {fields.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          accessibility={{ announcements }}
        >
          <SortableContext
            items={fields.map((field) => field.key)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2.5">
              {fields.map((field, index) => (
                <LinkRow
                  key={field.key}
                  sortableId={field.key}
                  index={index}
                  editing={editingId === field.id}
                  onToggleEdit={() => {
                    setEditingId((current) => (current === field.id ? null : field.id))
                  }}
                  onRemove={() => {
                    removeAt(index)
                  }}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="rounded-2xl border border-dashed border-line-strong bg-canvas px-4 py-6 text-center text-sm text-muted">
          No links yet. Add your website, LinkedIn and more below.
        </p>
      )}

      <div>
        <p className="mb-2.5 text-sm font-medium">Add a link</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_LINK_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              disabled={atLimit}
              onClick={() => {
                add(type)
              }}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface py-1 pr-3.5 pl-1 text-sm font-medium shadow-xs transition-colors hover:border-ink/30 hover:bg-canvas disabled:opacity-50"
            >
              <PlatformBadge type={type} className="size-7 rounded-full" />
              {getPlatform(type).name}
            </button>
          ))}
          <button
            type="button"
            disabled={atLimit}
            onClick={() => {
              add('custom')
            }}
            className="inline-flex items-center gap-2 rounded-full border border-dashed border-line-strong bg-surface py-1 pr-3.5 pl-1 text-sm font-medium transition-colors hover:border-ink/40 hover:bg-canvas disabled:opacity-50"
          >
            <span className="grid size-7 place-items-center rounded-full bg-ink/[0.06]">
              <Plus aria-hidden className="size-4" />
            </span>
            Custom link
          </button>
        </div>
        {atLimit && (
          <p className="mt-2 text-[0.8125rem] text-muted">
            You’ve reached the maximum of {LIMITS.links} links.
          </p>
        )}
      </div>
    </FormSection>
  )
}
