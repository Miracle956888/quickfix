/* Pure calculation logic for QuickKit tools — no DOM, no React. Unit-testable. */

export function percentOf(percent: number, value: number): number { return value * percent / 100 }
export function whatPercent(part: number, whole: number): number { return part / whole * 100 }
export function percentChange(oldValue: number, newValue: number): number { return (newValue - oldValue) / Math.abs(oldValue) * 100 }

export interface DiscountResult { afterFirst: number; finalPrice: number; saved: number; effectivePercent: number }
export function discount(price: number, percent: number, extraPercent = 0): DiscountResult {
  const afterFirst = price * (1 - percent / 100)
  const finalPrice = afterFirst * (1 - extraPercent / 100)
  const saved = price - finalPrice
  return { afterFirst, finalPrice, saved, effectivePercent: price > 0 ? saved / price * 100 : 0 }
}

export interface TextStats { words: number; chars: number; noSpaces: number; sentences: number; paragraphs: number; readingMinutes: number; speakingMinutes: number }
export function textStats(text: string): TextStats {
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0
  return {
    words,
    chars: text.length,
    noSpaces: text.replace(/\s/g, '').length,
    sentences: (text.match(/[.!?]+(?=\s|$)/g) || []).length,
    paragraphs: text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0,
    readingMinutes: words / 200,
    speakingMinutes: words / 130,
  }
}

/* Unicode-aware casing (JS \w is ASCII-only, which corrupts words like "élan") */
export function toTitleCase(t: string): string {
  return t.toLowerCase().replace(/(^|[^\p{L}\p{N}'’])(\p{L})/gu, (_m, pre: string, ch: string) => pre + ch.toUpperCase())
}
export function toSentenceCase(t: string): string {
  return t.toLowerCase().replace(/(^\s*)(\p{L})|([.!?]\s+)(\p{L})/gu, (_m, s1, c1, s2, c2) => c1 ? s1 + c1.toUpperCase() : s2 + c2.toUpperCase())
}
export function removeExtraSpaces(t: string): string { return t.replace(/[ \t]+/g, ' ').replace(/ +\n/g, '\n').replace(/\n +/g, '\n').trim() }
export function removeDuplicateBlankLines(t: string): string { return t.replace(/\n{3,}/g, '\n\n') }

export const DAY_MS = 86400000
export function daysBetween(a: Date, b: Date): number { return Math.round((b.getTime() - a.getTime()) / DAY_MS) }
export interface Age { years: number; months: number; days: number; totalDays: number }
export function ageBetween(dob: Date, asOf: Date): Age {
  let years = asOf.getUTCFullYear() - dob.getUTCFullYear()
  let months = asOf.getUTCMonth() - dob.getUTCMonth()
  let days = asOf.getUTCDate() - dob.getUTCDate()
  if (days < 0) { months--; days += new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), 0)).getUTCDate() }
  if (months < 0) { years--; months += 12 }
  return { years, months, days, totalDays: daysBetween(dob, asOf) }
}

export interface UnitDef { id: string; label: string; toBase: number }
export const LENGTH_UNITS: UnitDef[] = [
  { id: 'm', label: 'Metres (m)', toBase: 1 }, { id: 'km', label: 'Kilometres (km)', toBase: 1000 },
  { id: 'cm', label: 'Centimetres (cm)', toBase: 0.01 }, { id: 'in', label: 'Inches (in)', toBase: 0.0254 },
  { id: 'ft', label: 'Feet (ft)', toBase: 0.3048 }, { id: 'mi', label: 'Miles (mi)', toBase: 1609.344 },
]
export const WEIGHT_UNITS: UnitDef[] = [
  { id: 'g', label: 'Grams (g)', toBase: 1 }, { id: 'kg', label: 'Kilograms (kg)', toBase: 1000 },
  { id: 'lb', label: 'Pounds (lb)', toBase: 453.59237 }, { id: 'oz', label: 'Ounces (oz)', toBase: 28.349523125 },
]
export const TEMP_UNITS: UnitDef[] = [
  { id: 'c', label: 'Celsius (°C)', toBase: 1 }, { id: 'f', label: 'Fahrenheit (°F)', toBase: 1 }, { id: 'k', label: 'Kelvin (K)', toBase: 1 },
]
export const UNIT_CATEGORIES: Record<string, UnitDef[]> = { Length: LENGTH_UNITS, Weight: WEIGHT_UNITS, Temperature: TEMP_UNITS }
export function convertLinear(value: number, from: UnitDef, to: UnitDef): number { return value * from.toBase / to.toBase }
export function convertTemperature(value: number, from: string, to: string): number {
  const c = from === 'c' ? value : from === 'f' ? (value - 32) * 5 / 9 : value - 273.15
  return to === 'c' ? c : to === 'f' ? c * 9 / 5 + 32 : c + 273.15
}
