import React, { useEffect, useRef, useState } from 'react'
import { Search, Sun, Moon, Menu, X, Zap, ArrowRight, Star, Clock, ChevronRight, Check } from 'lucide-react'
import { TOOLS, ToolDef, searchTools } from './data/tools'

export function Logo({ navigate }: { navigate: (p: string) => void }) {
  return <a href="/" className="logo" onClick={e => { e.preventDefault(); navigate('/') }} aria-label="QuickKit home"><span className="logo-mark"><Zap size={20} strokeWidth={2.5} /></span>Quick<em>Kit</em></a>
}

export function SearchBox({ navigate, variant = 'hero', autoFocus=false }: { navigate: (p: string) => void; variant?: 'hero'|'mini'; autoFocus?: boolean }) {
  const [q, setQ] = useState(''); const [open, setOpen] = useState(false); const [sel, setSel] = useState(0); const ref = useRef<HTMLDivElement>(null)
  const results = q.trim() ? searchTools(q) : TOOLS.slice(0, 4)
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [])
  const go = (t: ToolDef) => { setOpen(false); setQ(''); navigate(t.path) }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setSel(s => Math.min(s + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)) }
    else if (e.key === 'Enter' && open && results[sel]) { e.preventDefault(); go(results[sel]) }
    else if (e.key === 'Escape') setOpen(false)
  }
  const dropdown = open && (
    <div className="search-results" role="listbox" aria-label="Tool results">
      {results.length === 0 ? <div className="empty" style={{border:0,padding:18}}>No tools match “{q}”. <a href="/tools" onClick={e=>{e.preventDefault();setOpen(false);navigate('/tools')}}>Browse all tools →</a></div>
      : results.map((t, i) => { const Icon = t.icon; return <a key={t.slug} href={t.path} role="option" aria-selected={i===sel} className={i===sel?'sel':''} onMouseEnter={()=>setSel(i)} onClick={e=>{e.preventDefault();go(t)}}><span className="ic" style={{width:36,height:36,borderRadius:9,background:'var(--brand-soft)',color:'var(--brand)',display:'grid',placeItems:'center',flex:'none'}}><Icon size={18}/></span><span><strong style={{fontSize:15}}>{t.name}</strong><small>{t.category} · {t.short}</small></span></a>})}
      <a href="/tools" onClick={e=>{e.preventDefault();setOpen(false);navigate('/tools')}} style={{justifyContent:'center',fontWeight:700,color:'var(--brand)'}}>Browse all tools <ArrowRight size={16}/></a>
    </div>
  )
  if (variant === 'mini') return <div className="search-wrap" ref={ref}><div className="search-mini"><Search size={17}/><input aria-label="Search tools" placeholder="Search tools…" value={q} onChange={e=>{setQ(e.target.value);setOpen(true);setSel(0)}} onFocus={()=>setOpen(true)} onKeyDown={onKey}/></div>{dropdown}</div>
  return <div className="search-wrap" ref={ref}><div className="hero-search-box"><Search size={21} color="var(--brand)"/><input aria-label="Search tools" autoFocus={autoFocus} placeholder="What do you need to calculate or fix?" value={q} onChange={e=>{setQ(e.target.value);setOpen(true);setSel(0)}} onFocus={()=>setOpen(true)} onKeyDown={onKey}/>{q && <button className="icon-btn" style={{border:0,height:34,width:34}} aria-label="Clear search" onClick={()=>setQ('')}><X size={17}/></button>}<button className="btn primary" onClick={()=> results[0] ? go(results[0]) : navigate('/tools')}>Search</button></div>{dropdown}</div>
}

export function Header({ path, navigate, theme, toggleTheme }: any) {
  const [menu, setMenu] = useState(false)
  const link = (p: string, label: string) => <a key={p} href={p} className={path===p?'active':''} onClick={e=>{e.preventDefault();navigate(p);setMenu(false)}}>{label}</a>
  return <header className="site"><div className="wrap header-in">
    <Logo navigate={navigate}/>
    <nav className="main" aria-label="Main">{link('/','Home')}{link('/tools','All Tools')}{link('/about','About')}</nav>
    <div className="header-actions">
      <SearchBox navigate={navigate} variant="mini"/>
      <button className="icon-btn" onClick={toggleTheme} aria-label={theme==='dark'?'Switch to light mode':'Switch to dark mode'} title={theme==='dark'?'Light mode':'Dark mode'}>{theme==='dark'?<Sun size={19}/>:<Moon size={19}/>}</button>
      <a href="/tools" className="btn primary small" onClick={e=>{e.preventDefault();navigate('/tools')}}><span>Explore tools</span><ArrowRight size={16}/></a>
      <button className="icon-btn hamburger" onClick={()=>setMenu(m=>!m)} aria-expanded={menu} aria-label="Toggle menu">{menu?<X size={20}/>:<Menu size={20}/>}</button>
    </div>
  </div>
  <div className={`mobile-menu ${menu?'open':''}`}>
    <SearchBox navigate={navigate} variant="hero"/>
    <div style={{height:8}}/>{link('/','Home')}{link('/tools','All Tools')}{link('/about','About')}{link('/contact','Contact')}{link('/privacy','Privacy')}
    <button className="btn" style={{marginTop:10,width:'100%',justifyContent:'center'}} onClick={toggleTheme}>{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>} {theme==='dark'?'Light mode':'Dark mode'}</button>
  </div></header>
}

export function Footer({ navigate }: { navigate:(p:string)=>void }) {
  const a = (p:string,l:string) => <a key={p} href={p} onClick={e=>{e.preventDefault();navigate(p)}}>{l}</a>
  return <footer className="site"><div className="wrap"><div className="footer-grid">
    <div><Logo navigate={navigate}/><p className="muted small" style={{maxWidth:300}}>Everyday tools. Instant answers.<br/>Free, simple online tools for everyday tasks — no downloads, no unnecessary sign-ups.</p><span className="chip"><Check size={13}/> Core tools are free to use</span></div>
    <div className="fl"><h4>Tools</h4>{TOOLS.slice(0,3).map(t=>a(t.path,t.name))}</div>
    <div className="fl"><h4>More tools</h4>{TOOLS.slice(3).map(t=>a(t.path,t.name))}{a('/tools','All tools')}</div>
    <div className="fl"><h4>QuickKit</h4>{a('/about','About')}{a('/privacy','Privacy policy')}{a('/contact','Contact')}</div>
  </div><div className="copy"><span>© {new Date().getFullYear()} QuickKit. All rights reserved.</span><span>Calculations run locally in your browser.</span></div></div></footer>
}

export function ToolCard({ tool, navigate, isFav, onToggleFav }: { tool: ToolDef; navigate:(p:string)=>void; isFav:boolean; onToggleFav:(s:string)=>void }) {
  const Icon = tool.icon
  return <article className="card tool-card">
    <a href={tool.path} onClick={e=>{e.preventDefault();navigate(tool.path)}} aria-label={`Open ${tool.name}`} style={{display:'block'}}>
      <span className="ic"><Icon size={22}/></span><span className="chip">{tool.category}</span>
      <h3>{tool.name}</h3><p>{tool.short}</p><span className="go"><ArrowRight size={19}/></span>
    </a>
    <button className={`fav-btn ${isFav?'on':''}`} aria-label={isFav?`Remove ${tool.name} from favourites`:`Save ${tool.name} to favourites`} aria-pressed={isFav} onClick={()=>onToggleFav(tool.slug)}><Star size={19} fill={isFav?'currentColor':'none'}/></button>
  </article>
}

export function FAQ({ items }: { items:{q:string;a:string}[] }) {
  return <div>{items.map((f,i)=><details className="faq" key={i}><summary>{f.q}<ChevronRight size={18}/></summary><p>{f.a}</p></details>)}</div>
}
export function CopyBtn({ text, label='Copy result' }: { text:string; label?:string }) {
  const [done,setDone]=useState(false)
  return <button className="btn small" disabled={!text} onClick={async()=>{ const { copyText } = await import('./hooks'); if(await copyText(text)){ setDone(true); setTimeout(()=>setDone(false),1800)} }}>{done?<><Check size={16}/> Copied!</>:label}</button>
}
export { Clock }
