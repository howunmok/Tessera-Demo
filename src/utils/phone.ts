import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js'
import examples from 'libphonenumber-js/mobile/examples'
import { DEFAULT_PHONE_COUNTRY } from '@/config/card-defaults'
import type { CardPhone } from '@/types/card'

/*
 * Phone numbers are stored on the card already formatted, with their country code:
 * "+1 (647)123-4567", "+1 (416)555-0199 ext. 12" or "+852 9123 4567". The public card
 * shows that text as is, so only the editor needs this module (and its metadata).
 */

export type { CountryCode }

/** What the editor works with: a country and the digits typed after its calling code. */
export interface PhoneParts {
  country: CountryCode
  digits: string
}

const EXTENSION = /\s*(?:ext\.?|x)\s*(\d+)\s*$/i
const NANP_LENGTH = 10
const MAX_EXTENSION_DIGITS = 6
/** E.164 allows 15 digits, calling code included. */
const MAX_E164_DIGITS = 15

const defaultCountry = DEFAULT_PHONE_COUNTRY as CountryCode

/** Every country for the picker, sorted by English name. */
export const PHONE_COUNTRIES = (() => {
  const names = new Intl.DisplayNames(['en'], { type: 'region' })
  return getCountries()
    .map((code) => ({
      code,
      name: names.of(code) ?? code,
      callingCode: getCountryCallingCode(code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
})()

export function getCallingCode(country: CountryCode): string {
  return getCountryCallingCode(country)
}

/** North America (+1: Canada, the US and the Caribbean) uses the (XXX)XXX-XXXX format. */
function isNanp(country: CountryCode): boolean {
  return getCountryCallingCode(country) === '1'
}

/** A country for a calling code when the number itself doesn't pin one down. */
function countryForCallingCode(callingCode: string, preferred: CountryCode): CountryCode {
  if (getCountryCallingCode(preferred) === callingCode) return preferred
  return getCountries().find((code) => getCountryCallingCode(code) === callingCode) ?? preferred
}

/**
 * Keeps only digits that can belong to a number in this country. North American numbers
 * never start with 1, so a typed or pasted leading "1" (the country code) is dropped;
 * digits after the first ten are an extension.
 */
export function cleanPhoneDigits(country: CountryCode, digits: string): string {
  if (isNanp(country)) {
    return digits.replace(/^1+/, '').slice(0, NANP_LENGTH + MAX_EXTENSION_DIGITS)
  }
  return digits.slice(0, MAX_E164_DIGITS - getCountryCallingCode(country).length)
}

/** Splits a stored (or pasted, or old free-form) number into country and digits. */
export function parsePhone(value: string, fallback: CountryCode = defaultCountry): PhoneParts {
  const extension = EXTENSION.exec(value)?.[1] ?? ''
  const main = value.replace(EXTENSION, '').trim()
  if (!main) return { country: fallback, digits: '' }

  const parsed = parsePhoneNumberFromString(main, fallback)
  if (!parsed)
    return { country: fallback, digits: cleanPhoneDigits(fallback, main.replace(/\D/g, '')) }

  const country = parsed.country ?? countryForCallingCode(parsed.countryCallingCode, fallback)
  const digits = parsed.nationalNumber + (isNanp(country) ? extension : '')
  return { country, digits: cleanPhoneDigits(country, digits) }
}

/** The number as shown in the field: "(647)123-4567" in North America, local format elsewhere. */
export function formatPhoneNational({ country, digits }: PhoneParts): string {
  if (!isNanp(country)) return new AsYouType(country).input(digits)
  if (digits.length <= 3) return digits
  const area = digits.slice(0, 3)
  const exchange = digits.slice(3, 6)
  if (digits.length <= 6) return `(${area})${exchange}`
  const line = digits.slice(6, NANP_LENGTH)
  const extension = digits.slice(NANP_LENGTH)
  return `(${area})${exchange}-${line}${extension ? ` ext. ${extension}` : ''}`
}

/** The value saved on the card, e.g. "+1 (647)123-4567" or "+852 9123 4567". */
export function formatPhoneForStorage(phone: PhoneParts): string {
  if (!phone.digits) return ''
  const callingCode = getCountryCallingCode(phone.country)
  if (isNanp(phone.country)) return `+${callingCode} ${formatPhoneNational(phone)}`
  const parsed = parsePhoneNumberFromString(phone.digits, phone.country)
  return parsed?.isPossible() ? parsed.formatInternational() : `+${callingCode} ${phone.digits}`
}

/** A sample number for the field's placeholder. */
export function getPhonePlaceholder(country: CountryCode): string {
  const example = getExampleNumber(country, examples)
  return example ? formatPhoneNational({ country, digits: example.nationalNumber }) : ''
}

/** "+16471234567" for a stored number (extension dropped), or "" if it isn't a number yet. */
export function toE164(value: string): string {
  const main = value.replace(EXTENSION, '').trim()
  return (main && parsePhoneNumberFromString(main, defaultCountry)?.number) || ''
}

/** The number a WhatsApp link follows: the first mobile number, else the first number. */
export function getWhatsAppNumber(phones: readonly CardPhone[]): string {
  const withNumber = phones.filter((phone) => phone.number.trim() !== '')
  const source = withNumber.find((phone) => phone.label === 'mobile') ?? withNumber[0]
  return source ? toE164(source.number) : ''
}
