import { Percent, Tag, Type, CaseSensitive, CalendarDays, Ruler, LucideIcon } from 'lucide-react'

export type Category = 'Calculators' | 'Text Tools' | 'Date & Time' | 'Converters'
export interface ToolDef {
  slug: string
  path: string
  name: string
  short: string
  description: string
  category: Category
  keywords: string[]
  icon: LucideIcon
  popular?: boolean
  howItWorks: string
  example: string
  faqs: { q: string; a: string }[]
}

export const SITE_URL = (import.meta as any).env?.VITE_SITE_URL || 'https://quickkit.pages.dev'

export const TOOLS: ToolDef[] = [
  {
    slug: 'percentage-calculator', path: '/tools/percentage-calculator', name: 'Percentage Calculator',
    short: 'Find percentages, ratios and increases in seconds.',
    description: 'Calculate what X% of a number is, what percentage one number is of another, and percentage increase or decrease — instantly, with no sign-up.',
    category: 'Calculators', keywords: ['percent','%','ratio','increase','decrease','maths','proportion'], icon: Percent, popular: true,
    howItWorks: 'A percentage is a fraction of 100. To find X% of Y, QuickKit multiplies Y by X ÷ 100. To find what percentage A is of B, it divides A by B and multiplies by 100. For change, it compares the difference between the old and new values against the old value.',
    example: 'What is 20% of 250? 250 × 0.20 = 50. If a price rises from 80 to 100, that is a 25% increase.',
    faqs: [
      { q: 'How do I calculate a percentage of a number?', a: 'Multiply the number by the percentage divided by 100. For example, 15% of 200 is 200 × 0.15 = 30.' },
      { q: 'What is the difference between percentage points and percent?', a: 'If a rate rises from 4% to 5%, that is +1 percentage point, but a 25% relative increase.' },
      { q: 'Can percentages be over 100?', a: 'Yes. 150% of 40 is 60 — more than the original whole.' },
    ],
  },
  {
    slug: 'discount-calculator', path: '/tools/discount-calculator', name: 'Discount Calculator',
    short: 'See exactly what you save and what you will pay.',
    description: 'Enter a price and discount percentage to instantly see the amount saved and the final price, in your choice of currency symbol.',
    category: 'Calculators', keywords: ['sale','price','off','savings','deal','shopping','coupon','money'], icon: Tag, popular: true,
    howItWorks: 'QuickKit multiplies the original price by the discount percentage to find your saving, then subtracts it from the original price. An optional extra discount can be stacked after the first one is applied.',
    example: 'A $120 jacket at 25% off: you save $30 and pay $90.',
    faqs: [
      { q: 'How are stacked discounts calculated?', a: 'Sequentially, not added. 20% then 10% off $100 is $100 → $80 → $72, a 28% total saving — not 30%.' },
      { q: 'Does this convert currencies?', a: 'No. The currency selector only changes the displayed symbol. QuickKit does not claim to provide live exchange rates.' },
      { q: 'Can a discount be over 100%?', a: 'No — that would mean being paid to take the item. Inputs above 100% are flagged as invalid.' },
    ],
  },
  {
    slug: 'word-counter', path: '/tools/word-counter', name: 'Word Counter',
    short: 'Count words, characters, sentences and reading time.',
    description: 'Paste or type text to count words, characters (with and without spaces), sentences, paragraphs and estimated reading time — live, and entirely on your device.',
    category: 'Text Tools', keywords: ['words','characters','count','essay','writing','reading time','letters','sentences'], icon: Type, popular: true,
    howItWorks: 'QuickKit splits your text on whitespace to count words, counts every character with and without spaces, detects sentence-ending punctuation, and estimates reading time at an average adult speed of about 200 words per minute (speaking time at ~130 wpm).',
    example: 'A 1,000-word article takes roughly 5 minutes to read aloud at a natural pace.',
    faqs: [
      { q: 'Is my text sent anywhere?', a: 'No. Counting happens locally in your browser. Nothing you type is uploaded or stored.' },
      { q: 'How is reading time calculated?', a: 'Word count ÷ 200 words per minute for reading, and ÷ 130 for speaking. These are averages — your pace may vary.' },
      { q: 'What counts as a word?', a: 'Any sequence of characters separated by spaces, tabs or line breaks.' },
    ],
  },
  {
    slug: 'text-formatter', path: '/tools/text-formatter', name: 'Text Formatter',
    short: 'Fix casing, spacing and messy pasted text in one click.',
    description: 'Convert text to UPPERCASE, lowercase, Title Case or Sentence case, remove extra spaces and blank lines, sort lines and more.',
    category: 'Text Tools', keywords: ['uppercase','lowercase','title case','capitalize','format','clean','spaces','text'], icon: CaseSensitive, popular: true,
    howItWorks: 'Each button applies a standard text transformation locally in your browser: casing changes re-map letters, cleanup tools collapse repeated whitespace and empty lines, and line tools can sort, deduplicate or reverse your lines.',
    example: '"hELLO   world" → Title Case → "Hello World", or → Sentence case → "Hello world".',
    faqs: [
      { q: 'What is Title Case?', a: 'The first letter of each word is capitalised, e.g. "The Quick Brown Fox". Small joining words are also capitalised here for simplicity and consistency.' },
      { q: 'Will formatting fix spelling?', a: 'No — it changes casing, spacing and line structure only. Your words stay exactly as written.' },
      { q: 'Is my text stored?', a: 'No. All formatting happens on your device.' },
    ],
  },
  {
    slug: 'date-calculator', path: '/tools/date-calculator', name: 'Date Calculator',
    short: 'Age, days between dates, and countdowns — done right.',
    description: 'Calculate your exact age, the days between any two dates, days until a future date, or add/subtract days — with leap years handled correctly.',
    category: 'Date & Time', keywords: ['age','days between','countdown','birthday','deadline','calendar','dates'], icon: CalendarDays, popular: true,
    howItWorks: 'QuickKit uses real calendar arithmetic (via the browser Date engine, normalised to UTC to avoid timezone drift). Age is calculated in years, months and days by comparing year, month and day components — not by simply dividing days by 365, which would be wrong around leap years.',
    example: 'Born 15 June 1990, someone turns 36 on 15 June 2026. From 1 Jan to 1 Mar 2028 (a leap year) is 60 days.',
    faqs: [
      { q: 'How are leap years handled?', a: 'Automatically. 2028 has a 29 February, 2100 does not (century rule). Calculations use the real calendar, so results are exact.' },
      { q: 'Why does "days between" exclude one endpoint?', a: 'By convention: 1 Jan → 2 Jan is 1 day. This matches how hotel nights and most deadlines are counted.' },
      { q: 'Can I calculate a past countdown?', a: 'Yes — if the date has passed, QuickKit shows how many days ago it was.' },
    ],
  },
  {
    slug: 'unit-converter', path: '/tools/unit-converter', name: 'Unit Converter',
    short: 'Convert length, weight and temperature accurately.',
    description: 'Instantly convert metres, kilometres, centimetres, inches, feet and miles; grams, kilograms, pounds and ounces; and Celsius, Fahrenheit and Kelvin.',
    category: 'Converters', keywords: ['convert','metres','feet','inches','kg','pounds','celsius','fahrenheit','length','weight','temperature'], icon: Ruler, popular: true,
    howItWorks: 'Length and weight conversions go through a base unit (metres / grams) using exact international definitions: 1 inch = 2.54 cm exactly, 1 pound = 453.59237 g exactly. Temperature uses the standard formulas °F = °C × 9/5 + 32 and K = °C + 273.15.',
    example: '5 feet 9 inches ≈ 175.3 cm. 70 kg ≈ 154.3 lb. 100 °C = 212 °F.',
    faqs: [
      { q: 'Why can temperature not go below 0 Kelvin?', a: '0 K (−273.15 °C) is absolute zero, the lowest physically possible temperature. QuickKit flags results below it.' },
      { q: 'Are these conversions exact?', a: 'Factors are the internationally defined exact values. Results are rounded sensibly for display (up to 6 significant decimals where useful).' },
      { q: 'Can I swap units quickly?', a: 'Yes — use the swap button between the unit selectors to reverse the conversion.' },
    ],
  },
]

export const CATEGORIES: Category[] = ['Calculators', 'Text Tools', 'Date & Time', 'Converters']
export function searchTools(q: string): ToolDef[] {
  const s = q.trim().toLowerCase()
  if (!s) return TOOLS
  return TOOLS.filter(t => [t.name, t.category, t.short, t.description, ...t.keywords].join(' ').toLowerCase().includes(s))
}
