import { clsx } from 'clsx'
import { useRef, type KeyboardEvent } from 'react'
import { useFormState, type Control } from 'react-hook-form'
import type { CardContent } from '@/types/card'
import { EDITOR_TABS, panelId, tabId, type EditorTabId } from './editor-tabs'

/** Accessible tab list: arrow keys, Home and End move between tabs. */
export function EditorTabList({
  value,
  onChange,
  control,
}: {
  value: EditorTabId
  onChange: (id: EditorTabId) => void
  control: Control<CardContent>
}) {
  const { errors } = useFormState({ control })
  const refs = useRef<Partial<Record<EditorTabId, HTMLButtonElement | null>>>({})

  function handleKeyDown(event: KeyboardEvent, index: number) {
    const last = EDITOR_TABS.length - 1
    const next: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }
    const target = EDITOR_TABS[next[event.key] ?? -1]
    if (!target) return
    event.preventDefault()
    onChange(target.id)
    refs.current[target.id]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Editor sections"
      className="flex [scrollbar-width:none] gap-1 overflow-x-auto rounded-full bg-ink/[0.05] p-1"
    >
      {EDITOR_TABS.map((tab, index) => {
        const selected = tab.id === value
        const hasErrors = tab.fields.some((field) => errors[field] !== undefined)
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            ref={(element) => {
              refs.current[tab.id] = element
            }}
            type="button"
            role="tab"
            id={tabId(tab.id)}
            aria-selected={selected}
            aria-controls={panelId(tab.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => {
              onChange(tab.id)
            }}
            onKeyDown={(event) => {
              handleKeyDown(event, index)
            }}
            className={clsx(
              'relative flex flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 sm:px-3.5',
              'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink',
              selected ? 'bg-surface text-ink shadow-xs' : 'text-muted hover:text-ink',
            )}
          >
            <Icon aria-hidden className="size-4 max-sm:hidden" />
            {'shortLabel' in tab ? (
              <>
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="max-sm:hidden">{tab.label}</span>
              </>
            ) : (
              tab.label
            )}
            {hasErrors && (
              <>
                <span aria-hidden className="size-1.5 rounded-full bg-danger" />
                <span className="sr-only">(has errors)</span>
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
