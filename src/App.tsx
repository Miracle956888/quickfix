import { useMemo } from 'react'
import { Header, Footer } from './components'
import { Home, ToolsDirectory, ToolPage, About, Privacy, Contact, NotFound } from './pages'
import { TOOLS, SITE_URL } from './data/tools'
import { useTheme, useLocalList, usePath, useSEO } from './hooks'

const META: Record<string, [string, string]> = {
  '/': ['QuickKit — Everyday tools. Instant answers.', 'Free, simple online tools for everyday tasks: percentage & discount calculators, word counter, text formatter, date calculator and unit converter. Instant answers, no sign-up.'],
  '/tools': ['All Tools — QuickKit', 'Browse every free QuickKit tool: calculators, text tools, date tools and unit converters. Search and open any tool instantly.'],
  '/about': ['About — QuickKit', 'QuickKit is a free, private-by-design collection of everyday online tools. Learn why we built it and how it works.'],
  '/privacy': ['Privacy Policy — QuickKit', 'QuickKit runs tools locally in your browser and collects no personal information. Read our plain-language privacy policy.'],
  '/contact': ['Contact — QuickKit', 'Contact the QuickKit team with questions, corrections or tool suggestions.'],
}

export default function App() {
  const { theme, toggle } = useTheme()
  const { path, search, navigate } = usePath()
  const favs = useLocalList('quickkit-favourites')
  const recents = useLocalList('quickkit-recents')

  const tool = TOOLS.find(t => t.path === path)
  const catParam = useMemo(() => { try { return new URLSearchParams(window.location.search).get('cat') || undefined } catch { return undefined } }, [path])

  const [title, desc] = tool
    ? [`${tool.name} — QuickKit`, tool.description]
    : (META[path] || ['Page not found — QuickKit', 'The page you requested could not be found on QuickKit.'])
  useSEO(title, desc, path === '/' ? '/' : path)

  let page: React.ReactNode
  if (tool) page = <ToolPage tool={tool} navigate={navigate} favs={favs.items} toggleFav={favs.toggleItem} onUse={recents.add} />
  else if (path === '/') page = <Home navigate={navigate} favs={favs.items} toggleFav={favs.toggleItem} recents={recents.items} />
  else if (path === '/tools') page = <ToolsDirectory navigate={navigate} favs={favs.items} toggleFav={favs.toggleItem} initialCat={catParam} />
  else if (path === '/about') page = <About navigate={navigate} />
  else if (path === '/privacy') page = <Privacy />
  else if (path === '/contact') page = <Contact navigate={navigate} />
  else page = <NotFound navigate={navigate} />

  return <>
    <a className="skip" href="#main">Skip to content</a>
    <Header path={path} navigate={navigate} theme={theme} toggleTheme={toggle} />
    <main id="main">{page}</main>
    <Footer navigate={navigate} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'QuickKit', url: SITE_URL + '/', description: META['/'][1] }) }} />
  </>
}
