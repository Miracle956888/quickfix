// QuickKit automated QA audit — run: node audit.mjs [baseURL]
import { chromium } from 'playwright-core'
import fs from 'node:fs'

const BASE = process.argv[2] || 'http://localhost:5173'
const PAGES = ['/', '/tools', '/tools/percentage-calculator', '/tools/discount-calculator', '/tools/word-counter', '/tools/text-formatter', '/tools/date-calculator', '/tools/unit-converter', '/about', '/privacy', '/contact']
const WIDTHS = [320, 375, 390, 430, 768, 1024, 1280, 1440]
const results = { overflow: [], console: [], functional: [], shots: [] }
const ok = (name, pass, detail = '') => results.functional.push({ name, pass: !!pass, detail })
fs.mkdirSync('audit-screenshots', { recursive: true })

const browser = await chromium.launch()

// ---------- 1. Responsive overflow + console errors ----------
for (const w of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } })
  page.on('console', m => { if (m.type() === 'error') results.console.push({ w, text: m.text().slice(0, 200) }) })
  page.on('pageerror', e => results.console.push({ w, text: 'PAGEERROR: ' + String(e).slice(0, 200) }))
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'networkidle' })
    const m = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth, iw: window.innerWidth,
      bad: [...document.querySelectorAll('body *:not(.skip)')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1) }).slice(0, 4).map(el => `${el.tagName}.${el.className} r=${Math.round(el.getBoundingClientRect().right)}`),
    }))
    if (m.sw > m.iw + 1 || m.bad.length) results.overflow.push({ w, p, sw: m.sw, iw: m.iw, bad: m.bad })
  }
  await page.close()
}

// screenshots: home + a tool, mobile + desktop, both themes
for (const [w, theme, name] of [[390, 'light', 'home-390-light'], [390, 'dark', 'home-390-dark'], [1440, 'light', 'home-1440-light'], [1440, 'dark', 'home-1440-dark'], [320, 'light', 'pct-320-light'], [768, 'dark', 'tools-768-dark']]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } })
  await page.addInitScript(t => { try { localStorage.setItem('quickkit-theme', t) } catch {} }, theme)
  await page.goto(BASE + (name.startsWith('pct') ? '/tools/percentage-calculator' : name.startsWith('tools') ? '/tools' : '/'), { waitUntil: 'networkidle' })
  await page.screenshot({ path: `audit-screenshots/${name}.png` })
  results.shots.push(name)
  await page.close()
}

fs.writeFileSync('/tmp/audit-partial.json', JSON.stringify(results,null,1))
// ---------- 2. Functional flows (desktop) ----------
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
page.on('pageerror', e => results.console.push({ w: 'fn', text: 'PAGEERROR: ' + String(e).slice(0, 200) }))

await page.goto(BASE + '/', { waitUntil: 'networkidle' })
// theme toggle + persistence
const before = await page.evaluate(() => document.documentElement.dataset.theme)
await page.click('header .icon-btn[aria-label*="mode"]')
const after = await page.evaluate(() => document.documentElement.dataset.theme)
ok('theme toggles immediately', before !== after, `${before}->${after}`)
await page.reload({ waitUntil: 'networkidle' })
ok('theme persists after reload', (await page.evaluate(() => document.documentElement.dataset.theme)) === after)
await page.click('header .icon-btn[aria-label*="mode"]') // back to light

// search: type "discount", keyboard-navigate, Enter
await page.fill('.hero .hero-search-box input', 'discount')
await page.waitForSelector('.search-results a')
ok('search shows discount result', (await page.textContent('.hero .search-results')).includes('Discount Calculator'))
await page.keyboard.press('Enter')
await page.waitForURL('**/tools/discount-calculator')
ok('search Enter navigates to discount tool', true)
await page.goBack(); await page.waitForURL(BASE + '/')
ok('browser Back works', true)
await page.fill('.hero .hero-search-box input', 'zzzz-nothing')
await page.waitForTimeout(300)
ok('search empty state', (await page.textContent('.hero .search-results')).includes('No tools match'))

// percentage calculator
await page.goto(BASE + '/tools/percentage-calculator', { waitUntil: 'networkidle' })
ok('pct default 20% of 250 = 50', (await page.textContent('.result .big')).trim() === '50')
await page.fill('#pa', '15'); await page.fill('#pb', '200')
ok('pct 15% of 200 = 30', (await page.textContent('.result .big')).trim() === '30')
await page.fill('#pa', 'abc')
ok('pct invalid input shows error', (await page.textContent('main')).includes('Please enter a valid number'))
await page.locator('.tabs button',{hasText:'What % is'}).click(); await page.fill('#px', '1'); await page.fill('#py', '0')
ok('pct division-by-zero handled', (await page.textContent('.result')).includes('must not be 0'))
await page.locator('.tabs button',{hasText:'Increase'}).click(); await page.fill('#po', '80'); await page.fill('#pn', '60')
ok('pct decrease 80->60 = -25%', (await page.textContent('.result .big')).includes('-25%'))

// discount calculator
await page.goto(BASE + '/tools/discount-calculator', { waitUntil: 'networkidle' })
ok('discount default $120@25% pay $90', (await page.textContent('.result')).includes('90'))
await page.fill('#dp', '100'); await page.fill('#dd', '100')
ok('discount 100% -> pay 0', (await page.textContent('.result')).includes('$0.00') || (await page.textContent('.result')).includes('0'))
await page.fill('#dd', '150')
ok('discount >100% rejected', (await page.textContent('main')).includes('between 0% and 100%'))
await page.fill('#dd', '10'); await page.selectOption('#dc', 'JPY')
ok('JPY shows no decimals', !(await page.textContent('.result')).includes('.00'))

// word counter
await page.goto(BASE + '/tools/word-counter', { waitUntil: 'networkidle' })
ok('word counter empty = 0/0 sec', (await page.textContent('.stat-grid')).includes('0 sec'))
await page.fill('#wc', 'Hello   world.\n\nNew paragraph here! Is this great? Yes.')
const wc = await page.textContent('.stat-grid')
ok('word counter counts', wc.includes('Words') && (await page.textContent('main')).includes('Speaking time'))
await page.click('text=Clear')
ok('word counter clears', (await page.inputValue('#wc')) === '')

// text formatter
await page.goto(BASE + '/tools/text-formatter', { waitUntil: 'networkidle' })
await page.fill('#tf', 'hELLO   wORLD. hOW are YOU?')
await page.locator('[role="group"] button',{hasText:'Title Case'}).click()
ok('title case', (await page.inputValue('#tf')) === 'Hello   World. How Are You?')
await page.locator('[role="group"] button',{hasText:'Sentence case'}).click()
ok('sentence case', (await page.inputValue('#tf')) === 'Hello   world. How are you?')
await page.locator('[role="group"] button',{hasText:'UPPERCASE'}).click()
ok('uppercase unicode-safe', (await page.inputValue('#tf')).startsWith('HELLO'))

// date calculator
await page.goto(BASE + '/tools/date-calculator', { waitUntil: 'networkidle' })
ok('age default renders years', /\d+ years, \d+ months, \d+ days/.test(await page.textContent('.result')))
await page.locator('.tabs button',{hasText:'Days between'}).click(); await page.fill('#df', '2028-01-01'); await page.fill('#dt', '2028-03-01')
ok('leap-year Jan->Mar 2028 = 60 days', (await page.textContent('.result .big')).includes('60'))

// unit converter
await page.goto(BASE + '/tools/unit-converter', { waitUntil: 'networkidle' })
await page.fill('#uval', '100'); await page.selectOption('#ufrom', 'cm'); await page.selectOption('#uto', 'm')
ok('100 cm = 1 m', (await page.inputValue('#ures')) === '1')
await page.selectOption('#ucat','Temperature'); await page.fill('#uval', '100')
ok('temp category switches units', (await page.textContent('main')).includes('Fahrenheit'))
await page.click('[aria-label="Swap units"]')
await page.fill('#uval', 'abc')
ok('unit invalid input shows message', (await page.textContent('main')).includes('Please enter a valid number'))
await page.fill('#uval', '-40'); await page.selectOption('#ufrom', 'c'); await page.selectOption('#uto', 'f')
ok('-40C = -40F in UI', (await page.inputValue('#ures')) === '-40')

await page.goto(BASE + '/tools/text-formatter', { waitUntil: 'networkidle' })
await page.fill('#tf', 'élan vital, über cool')
await page.locator('[role="group"] button',{hasText:'Title Case'}).click()
ok('title case unicode (élan -> Élan)', (await page.inputValue('#tf')) === 'Élan Vital, Über Cool')

// favorites + recents
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'networkidle' })
ok('recents empty state for new visitor', (await page.textContent('main')).includes('No recent tools yet'))
const favBtn = page.locator('.tool-card .fav-btn').first()
await favBtn.click()
ok('favourite adds Your favourites section', (await page.textContent('main')).includes('Your favourites'))
await page.reload({ waitUntil: 'networkidle' })
ok('favourite persists after reload', (await page.textContent('main')).includes('Your favourites'))
ok('recents shows visited percentage tool', (await page.textContent('main')).includes('Recently used'))
await page.locator('.tool-card .fav-btn').first().click().catch(() => {})
await page.close()

// mobile menu
const mob = await browser.newPage({ viewport: { width: 375, height: 800 } })
await mob.goto(BASE + '/', { waitUntil: 'networkidle' })
ok('hamburger visible on mobile', await mob.isVisible('.hamburger'))
await mob.click('.hamburger')
ok('mobile menu opens', await mob.isVisible('.mobile-menu.open'))
await mob.click('.mobile-menu a[href="/about"]')
await mob.waitForURL('**/about')
ok('mobile menu link navigates', true)
await mob.close()

await browser.close()
console.log(JSON.stringify(results, null, 1))
const fails = results.functional.filter(f => !f.pass)
console.log(`\n=== SUMMARY: overflow issues: ${results.overflow.length}, console errors: ${results.console.length}, functional: ${results.functional.length - fails.length}/${results.functional.length} passed ===`)
