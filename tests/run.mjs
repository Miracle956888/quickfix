// Unit tests for QuickKit's pure calculation logic (src/lib/logic.ts).
// Bundles the TS module with esbuild (already a Vite dependency) and asserts known answers.
// Run: npm test
import { build } from 'esbuild'
import assert from 'node:assert'

await build({ entryPoints: ['src/lib/logic.ts'], bundle: true, format: 'esm', outfile: '/tmp/quickkit-logic.mjs', logLevel: 'silent' })
const L = await import('/tmp/quickkit-logic.mjs')
let n = 0
const eq = (actual, expected, label) => { assert.strictEqual(actual, expected, `${label}: expected ${expected}, got ${actual}`); n++ }
const near = (actual, expected, label, eps = 1e-9) => { assert.ok(Math.abs(actual - expected) < eps, `${label}: expected ~${expected}, got ${actual}`); n++ }

// Percentage
eq(L.percentOf(20, 250), 50, '20% of 250'); eq(L.percentOf(15, 200), 30, '15% of 200'); eq(L.percentOf(0, 999), 0, '0% of x')
eq(L.whatPercent(50, 200), 25, '50 is 25% of 200'); eq(L.percentChange(80, 100), 25, '80->100 +25%'); eq(L.percentChange(80, 60), -25, '80->60 -25%')
eq(L.percentChange(50, 50), 0, 'no change'); near(L.percentChange(-100, -50), 50, 'negative base uses |old|')

// Discount
const d1 = L.discount(120, 25); eq(d1.saved, 30, 'discount saved'); eq(d1.finalPrice, 90, 'discount final')
const d2 = L.discount(100, 20, 10); eq(d2.finalPrice, 72, 'stacked discounts are sequential, not additive'); near(d2.effectivePercent, 28, 'stacked effective %')
eq(L.discount(50, 100).finalPrice, 0, '100% off = free'); eq(L.discount(50, 0).saved, 0, '0% off saves 0')

// Text stats
const s = L.textStats('Hello   world.\n\nNew paragraph here! Is this great? Yes.')
eq(s.words, 9, 'word count with extra spaces/newlines'); eq(s.noSpaces, 'Helloworld.Newparagraphhere!Isthisgreat?Yes.'.length, 'chars without spaces')
eq(s.sentences, 4, 'sentence count'); eq(s.paragraphs, 2, 'paragraph count'); eq(s.readingMinutes, 9 / 200, 'reading time')
eq(L.textStats('').words, 0, 'empty text words'); eq(L.textStats('   ').chars, 3, 'whitespace-only chars')

// Text formatting (Unicode-aware)
eq(L.toTitleCase('hELLO wORLD'), 'Hello World', 'title case')
eq(L.toTitleCase('élan vital, über cool'), 'Élan Vital, Über Cool', 'title case handles non-English letters')
eq(L.toSentenceCase('hELLO wORLD. hOW are YOU?'), 'Hello world. How are you?', 'sentence case')
eq(L.toSentenceCase('über alles. ja wohl'), 'Über alles. Ja wohl', 'sentence case unicode')
eq(L.removeExtraSpaces('a   b\t\tc \n d '), 'a b c\nd', 'remove extra spaces')
eq(L.removeDuplicateBlankLines('a\n\n\n\nb'), 'a\n\nb', 'remove duplicate blank lines')

// Dates (UTC-safe)
const D = s => new Date(s + 'T00:00:00Z')
eq(L.daysBetween(D('2028-01-01'), D('2028-03-01')), 60, 'leap year Jan->Mar = 60')
eq(L.daysBetween(D('2027-01-01'), D('2027-03-01')), 59, 'non-leap Jan->Mar = 59')
eq(L.daysBetween(D('2026-01-02'), D('2026-01-01')), -1, 'reverse order is negative')
const age = L.ageBetween(D('1990-06-15'), D('2026-06-15')); eq(age.years, 36, 'age on birthday'); eq(age.months, 0, 'age months'); eq(age.days, 0, 'age days')
const age2 = L.ageBetween(D('2000-02-29'), D('2025-02-28')); eq(age2.years, 24, 'leap-day baby age'); eq(age2.totalDays, L.daysBetween(D('2000-02-29'), D('2025-02-28')), 'age total days consistent')

// Units
const U = Object.fromEntries([...L.LENGTH_UNITS, ...L.WEIGHT_UNITS].map(u => [u.id, u]))
near(L.convertLinear(1, U.mi, U.km), 1.609344, '1 mile in km'); near(L.convertLinear(100, U.cm, U.m), 1, '100cm = 1m')
near(L.convertLinear(70, U.kg, U.lb), 154.3235835, '70kg in lb', 1e-6); near(L.convertLinear(1, U.in, U.cm), 2.54, '1in = 2.54cm exact')
eq(L.convertTemperature(100, 'c', 'f'), 212, '100C = 212F'); eq(L.convertTemperature(-40, 'c', 'f'), -40, '-40C = -40F')
eq(L.convertTemperature(0, 'c', 'k'), 273.15, '0C = 273.15K'); eq(L.convertTemperature(32, 'f', 'c'), 0, '32F = 0C')

console.log(`✓ All ${n} logic tests passed`)
