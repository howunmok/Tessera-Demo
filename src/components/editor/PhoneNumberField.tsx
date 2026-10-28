import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'
import { useState, type ChangeEvent, type Ref } from 'react'
import { fieldTextSize } from '@/components/ui/field-classes'
import {
  cleanPhoneDigits,
  formatPhoneForStorage,
  formatPhoneNational,
  getCallingCode,
  getPhonePlaceholder,
  parsePhone,
  PHONE_COUNTRIES,
  type CountryCode,
  type PhoneParts,
} from '@/utils/phone'

interface PhoneNumberFieldProps {
  /** The stored value, e.g. "+1 (647)123-4567". */
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  ref?: Ref<HTMLInputElement>
  /** Country for an empty field. */
  defaultCountry: CountryCode
  /** Names the two controls: "Phone 1" → "Phone 1 country" and "Phone 1 number". */
  label: string
  invalid: boolean
  describedBy?: string
  className?: string
}

/** Country picker plus a number field that formats as you type: "(647)123-4567". */
export function PhoneNumberField({
  value,
  onChange,
  onBlur,
  ref,
  defaultCountry,
  label,
  invalid,
  describedBy,
  className,
}: PhoneNumberFieldProps) {
  // The field owns country and digits while it's mounted; the form gets the stored text.
  const [phone, setPhone] = useState(() => parsePhone(value, defaultCountry))

  function update(next: PhoneParts) {
    setPhone(next)
    onChange(formatPhoneForStorage(next))
  }

  function handleNumberChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target
    const raw = input.value

    // A full international number (pasted or autofilled) can switch the country.
    if (raw.trim().startsWith('+')) {
      update(parsePhone(raw, phone.country))
      return
    }

    const caret = input.selectionStart ?? raw.length
    let digitsBeforeCaret = countDigits(raw.slice(0, caret))
    let digits = raw.replace(/\D/g, '')

    // Backspace over "(", ")", "-" or a space deletes the digit before it instead.
    const { inputType } = event.nativeEvent as InputEvent
    if (inputType === 'deleteContentBackward' && digits === phone.digits && digitsBeforeCaret > 0) {
      digits = digits.slice(0, digitsBeforeCaret - 1) + digits.slice(digitsBeforeCaret)
      digitsBeforeCaret -= 1
    }

    const cleaned = cleanPhoneDigits(phone.country, digits)
    // Digits dropped from the front (a leading "1" in North America) move the caret too.
    if (cleaned.length < digits.length && digits.endsWith(cleaned)) {
      digitsBeforeCaret = Math.max(0, digitsBeforeCaret - (digits.length - cleaned.length))
    }

    // Write the formatted text straight away so the caret can be put back where it was.
    const next = { country: phone.country, digits: cleaned }
    const formatted = formatPhoneNational(next)
    input.value = formatted
    const position = positionAfterDigits(formatted, Math.min(digitsBeforeCaret, cleaned.length))
    input.setSelectionRange(position, position)
    update(next)
  }

  function handleCountryChange(event: ChangeEvent<HTMLSelectElement>) {
    const country = event.target.value as CountryCode
    update({ country, digits: cleanPhoneDigits(country, phone.digits) })
  }

  return (
    <div
      className={clsx(
        'flex h-11 items-stretch overflow-hidden rounded-xl border bg-surface shadow-xs transition-[border-color,box-shadow] duration-150 focus-within:ring-4',
        invalid
          ? 'border-danger focus-within:ring-danger/15'
          : 'border-line-strong focus-within:border-ink focus-within:ring-ink/10 hover:border-ink/30',
        className,
      )}
    >
      {/* A native picker (best on phones) laid invisibly over a compact "CA +1". */}
      <div className="relative flex shrink-0 items-center gap-1 border-r border-line pr-2 pl-3.5 hover:bg-ink/[0.03]">
        <span aria-hidden className={clsx('font-medium whitespace-nowrap', fieldTextSize)}>
          {phone.country} +{getCallingCode(phone.country)}
        </span>
        <ChevronDown aria-hidden className="size-4 text-muted" />
        <select
          aria-label={`${label} country`}
          value={phone.country}
          onChange={handleCountryChange}
          onBlur={onBlur}
          className={clsx('absolute inset-0 cursor-pointer opacity-0', fieldTextSize)}
        >
          {PHONE_COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name} (+{country.callingCode})
            </option>
          ))}
        </select>
      </div>
      <input
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={formatPhoneNational(phone)}
        onChange={handleNumberChange}
        onBlur={onBlur}
        placeholder={getPhonePlaceholder(phone.country)}
        aria-label={`${label} number`}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={clsx(
          'h-full min-w-0 flex-1 bg-transparent px-3.5 text-ink outline-none placeholder:text-muted/60',
          fieldTextSize,
        )}
      />
    </div>
  )
}

function countDigits(text: string): number {
  return text.replace(/\D/g, '').length
}

/** Index in `text` just after its `count`-th digit (0 → the start). */
function positionAfterDigits(text: string, count: number): number {
  if (count === 0) return 0
  let seen = 0
  for (let index = 0; index < text.length; index++) {
    if (/\d/.test(text.charAt(index)) && ++seen === count) return index + 1
  }
  return text.length
}
