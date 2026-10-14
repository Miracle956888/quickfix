import { useCallback, useEffect, useState } from 'react'
import { SITE_URL } from './data/tools'

export type Theme = 'light' | 'dark'
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'))
  const toggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.dataset.theme = next
      document.documentElement.style.colorScheme = next
      try { localStorage.setItem('quickkit-theme', next) } catch {}
      return next
    })
  }, [])
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  return { theme, toggle }
}

export function useLocalList(key: string) {
  const [items, setItems] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } })
  const update = useCallback((next: string[]) => { setItems(next); try { localStorage.setItem(key, JSON.stringify(next)) } catch {} }, [key])
  const add = useCallback((slug: string) => { setItems(prev => { const next = [slug, ...prev.filter(s => s !== slug)].slice(0, 6); try { localStorage.setItem(key, JSON.stringify(next)) } catch {}; return next }) }, [key])
  const toggleItem = useCallback((slug: string) => { setItems(prev => { const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [slug, ...prev]; try { localStorage.setItem(key, JSON.stringify(next)) } catch {}; return next }) }, [key])
  return { items, add, toggleItem, update }
}

export function usePath() {
  const clean = (p: string) => p.replace(/\/$/, '') || '/'
  const [path, setPath] = useState(() => clean(window.location.pathname))
  const [search, setSearch] = useState(() => window.location.search)
  useEffect(() => {
    const on = () => { setPath(clean(window.location.pathname)); setSearch(window.location.search) }
    window.addEventListener('popstate', on); return () => window.removeEventListener('popstate', on)
  }, [])
  const navigate = useCallback((to: string) => {
    const url = new URL(to, window.location.origin)
    window.history.pushState({}, '', url.pathname + url.search)
    setPath(clean(url.pathname)); setSearch(url.search); window.scrollTo({ top: 0 })
  }, [])
  return { path, search, navigate }
}

export function useSEO(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title
    const meta = (key: 'name' | 'property', val: string, content: string) => {
      let el = document.querySelector(`meta[${key}="${val}"]`) as HTMLMetaElement | null
      if (!el) { el = document.createElement('meta'); el.setAttribute(key, val); document.head.appendChild(el) }
      el.content = content
    }
    meta('name', 'description', description)
    meta('property', 'og:title', title)
    meta('property', 'og:description', description)
    meta('property', 'og:url', SITE_URL + path)
    let c = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!c) { c = document.createElement('link'); c.rel = 'canonical'; document.head.appendChild(c) }
    c.href = SITE_URL + path
  }, [title, description, path])
}

export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true } catch {
    try { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); return true } catch { return false }
  }
}
export const fmt = (n: number, max = 4) => !isFinite(n) ? '—' : Number(n.toFixed(max)).toLocaleString('en-US', { maximumFractionDigits: max })
