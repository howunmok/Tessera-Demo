import { Link2, Palette, QrCode, Settings2, UserRound, type LucideIcon } from 'lucide-react'
import type { FieldErrors } from 'react-hook-form'
import type { CardContent } from '@/types/card'

/** Editor tabs and the form fields each one contains (used to flag tabs with errors). */
export const EDITOR_TABS = [
  { id: 'details', label: 'Details', icon: UserRound, fields: ['profile', 'photo', 'logo'] },
  { id: 'links', label: 'Links', icon: Link2, fields: ['links'] },
  { id: 'design', label: 'Design', icon: Palette, fields: ['theme', 'cover'] },
  { id: 'qr', label: 'QR code', shortLabel: 'QR', icon: QrCode, fields: ['qr'] },
  { id: 'settings', label: 'Settings', icon: Settings2, fields: ['label'] },
] as const satisfies readonly {
  id: string
  label: string
  /** Used on phones, where five tabs share a narrow bar. */
  shortLabel?: string
  icon: LucideIcon
  fields: readonly (keyof CardContent)[]
}[]

export type EditorTabId = (typeof EDITOR_TABS)[number]['id']

export function isEditorTabId(value: string | null): value is EditorTabId {
  return EDITOR_TABS.some((tab) => tab.id === value)
}

/** The first tab holding a field with a validation error, if any. */
export function findTabWithErrors(errors: FieldErrors<CardContent>): EditorTabId | undefined {
  return EDITOR_TABS.find((tab) => tab.fields.some((field) => errors[field] !== undefined))?.id
}

export const tabId = (id: EditorTabId) => `editor-tab-${id}`
export const panelId = (id: EditorTabId) => `editor-panel-${id}`
