import { ChevronDown, Plus, Trash } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { fieldClasses } from '@/components/ui/field-classes'
import { TextAreaField } from '@/components/ui/TextAreaField'
import { TextField } from '@/components/ui/TextField'
import { PHONE_LABEL_NAMES } from '@/config/card-defaults'
import { LIMITS, PHONE_LABELS } from '@/schemas/card'
import type { CardContent } from '@/types/card'
import { getWhatsAppNumber, parsePhone } from '@/utils/phone'
import { FormSection } from '../FormSection'
import { PhoneNumberField } from '../PhoneNumberField'

export function ContactSection() {
  const {
    register,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<CardContent>()
  const { fields, append, remove } = useFieldArray({ control, name: 'profile.phones' })
  const profileErrors = errors.profile

  const phones = useWatch({ control, name: 'profile.phones' })
  // A new number starts in the same country as the first one.
  const defaultCountry = parsePhone(phones[0]?.number ?? '').country

  // WhatsApp links follow the mobile number: when it changes, a WhatsApp link that was
  // empty or still had the old number gets the new one. A different number is left alone.
  const whatsAppNumber = getWhatsAppNumber(phones)
  const previousWhatsAppNumber = useRef(whatsAppNumber)
  useEffect(() => {
    const previous = previousWhatsAppNumber.current
    if (previous === whatsAppNumber) return
    previousWhatsAppNumber.current = whatsAppNumber
    const previousDigits = previous.replace(/\D/g, '')
    getValues('links').forEach((link, index) => {
      if (link.type !== 'whatsapp') return
      const digits = link.url.replace(/\D/g, '')
      if (digits === '' || digits === previousDigits) {
        setValue(`links.${index}.url`, whatsAppNumber, { shouldDirty: true, shouldValidate: true })
      }
    })
  }, [whatsAppNumber, getValues, setValue])

  return (
    <FormSection title="Contact" description="Visitors can tap to call, email or get directions.">
      <TextField
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        error={profileErrors?.email?.message}
        {...register('profile.email')}
      />

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Phone numbers</legend>
        {fields.length === 0 && <p className="text-sm text-muted">No phone numbers yet.</p>}
        <ul className="space-y-2.5">
          {fields.map((field, index) => {
            const error = profileErrors?.phones?.[index]?.number?.message
            const errorId = `${field.id}-error`
            return (
              <li key={field.id}>
                {/* Phones: type and delete on one line, the number below. Wider: one line. */}
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:grid-cols-[7rem_minmax(0,1fr)_auto]">
                  <div className="relative">
                    <select
                      aria-label={`Phone ${String(index + 1)} type`}
                      className={fieldClasses(false, 'h-11 cursor-pointer appearance-none pr-8')}
                      {...register(`profile.phones.${index}.label`)}
                    >
                      {PHONE_LABELS.map((label) => (
                        <option key={label} value={label}>
                          {PHONE_LABEL_NAMES[label]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
                    />
                  </div>
                  <Controller
                    control={control}
                    name={`profile.phones.${index}.number`}
                    render={({ field: { value, onChange, onBlur, ref } }) => (
                      <PhoneNumberField
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        ref={ref}
                        defaultCountry={defaultCountry}
                        label={`Phone ${String(index + 1)}`}
                        invalid={Boolean(error)}
                        describedBy={error ? errorId : undefined}
                        className="col-span-2 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1"
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      remove(index)
                    }}
                    aria-label={`Remove phone ${String(index + 1)}`}
                    className="grid size-11 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-ink/5 hover:text-danger sm:col-start-3 sm:row-start-1"
                  >
                    <Trash aria-hidden className="size-4" />
                  </button>
                </div>
                {error && (
                  <p id={errorId} className="mt-1.5 text-[0.8125rem] font-medium text-danger">
                    {error}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
        {fields.length < LIMITS.phones && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2.5 -ml-2"
            onClick={() => {
              append({ label: fields.length === 0 ? 'mobile' : 'work', number: '' })
            }}
          >
            <Plus aria-hidden className="size-4" /> Add phone
          </Button>
        )}
      </fieldset>

      <TextAreaField
        label="Office address (optional)"
        rows={2}
        autoComplete="street-address"
        hint="Tapping it opens directions in Maps."
        error={profileErrors?.address?.message}
        {...register('profile.address')}
      />
    </FormSection>
  )
}
