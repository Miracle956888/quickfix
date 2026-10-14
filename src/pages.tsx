import React, { useEffect, useState } from 'react'
import { ArrowRight, Check, Search, Zap, MousePointerClick, Sparkles, Heart, Clock, Star } from 'lucide-react'
import { TOOLS, ToolDef, CATEGORIES, searchTools } from './data/tools'
import { ToolCard, SearchBox, FAQ } from './components'
import * as ToolImpl from './tools'

const IMPL: Record<string, React.ComponentType> = {
  'percentage-calculator': ToolImpl.PercentageTool, 'discount-calculator': ToolImpl.DiscountTool,
  'word-counter': ToolImpl.WordCounterTool, 'text-formatter': ToolImpl.TextFormatterTool,
  'date-calculator': ToolImpl.DateTool, 'unit-converter': ToolImpl.UnitTool,
}

export function Home({ navigate, favs, toggleFav, recents }: any) {
  const recentTools = recents.map((s:string)=>TOOLS.find(t=>t.slug===s)).filter(Boolean) as ToolDef[]
  const favTools = favs.map((s:string)=>TOOLS.find(t=>t.slug===s)).filter(Boolean) as ToolDef[]
  return <>
    <section className="hero"><div className="wrap">
      <span className="chip"><Sparkles size={13}/> Free tools · No sign-up needed</span>
      <h1>Get small things <span>done faster.</span></h1>
      <p>Free, simple online tools for everyday tasks. Instant answers, no downloads, no unnecessary sign-ups.</p>
      <div className="hero-search"><SearchBox navigate={navigate} variant="hero"/></div>
      <div className="hero-note"><span><Check size={15} color="var(--success)"/> Free tools</span><span><Zap size={15} color="var(--brand)"/> Fast results</span><span><Check size={15} color="var(--success)"/> No hassle</span></div>
    </div></section>

    <section><div className="wrap">
      <div className="section-head"><div><h2>Popular tools</h2><p className="sub">The tools people reach for every day.</p></div><a className="btn" href="/tools" onClick={e=>{e.preventDefault();navigate('/tools')}}>Browse all tools <ArrowRight size={16}/></a></div>
      <div className="grid">{TOOLS.map(t=><ToolCard key={t.slug} tool={t} navigate={navigate} isFav={favs.includes(t.slug)} onToggleFav={toggleFav}/>)}</div>
    </div></section>

    {favTools.length>0 && <section style={{paddingTop:0}}><div className="wrap"><div className="section-head"><div><h2><Star size={22} style={{verticalAlign:-3}}/> Your favourites</h2><p className="sub">Saved on this device for quick access.</p></div></div><div className="grid">{favTools.map(t=><ToolCard key={t.slug} tool={t} navigate={navigate} isFav onToggleFav={toggleFav}/>)}</div></div></section>}

    <section style={{paddingTop:0}}><div className="wrap">
      <div className="section-head"><div><h2><Clock size={22} style={{verticalAlign:-3}}/> Recently used</h2><p className="sub">Pick up where you left off.</p></div></div>
      {recentTools.length===0 ? <div className="empty"><Clock size={28} style={{marginBottom:8}}/><br/><strong>No recent tools yet.</strong><br/>Tools you open will appear here, stored only on your device.<br/><a className="btn primary small" style={{marginTop:14}} href="/tools" onClick={e=>{e.preventDefault();navigate('/tools')}}>Explore tools</a></div>
      : <div className="grid">{recentTools.map(t=><ToolCard key={t.slug} tool={t} navigate={navigate} isFav={favs.includes(t.slug)} onToggleFav={toggleFav}/>)}</div>}
    </div></section>

    <section style={{paddingTop:0}}><div className="wrap">
      <h2 style={{marginBottom:6}}>Browse by category</h2><p className="sub" style={{marginBottom:20}}>Find the right tool for the job.</p>
      <div className="grid2">{CATEGORIES.map(c=>{ const list=TOOLS.filter(t=>t.category===c); return <a key={c} className="card tool-card" href="/tools" onClick={e=>{e.preventDefault();navigate('/tools?cat='+encodeURIComponent(c))}}><h3 style={{margin:'0 0 6px'}}>{c}</h3><p>{list.map(t=>t.name).join(' · ')}</p><span className="go"><ArrowRight size={19}/></span></a>})}</div>
    </div></section>

    <section style={{paddingTop:0}}><div className="wrap">
      <h2 style={{marginBottom:6}}>How QuickKit works</h2><p className="sub" style={{marginBottom:20}}>Three steps. No account, no download.</p>
      <div className="steps">
        {[['Search or browse','Find the tool you need — try “discount”, “age” or “feet to metres”.'],['Enter your numbers or text','Everything calculates instantly as you type, right in your browser.'],['Copy your answer','Grab the result and get on with your day. Nothing is uploaded or stored.']].map(([t,d],i)=><div className="card" key={t}><div className="step-num">{i+1}</div><h3 style={{margin:'0 0 6px'}}>{t}</h3><p className="muted" style={{margin:0}}>{d}</p></div>)}
      </div>
    </div></section>

    <section style={{paddingTop:0}}><div className="wrap" style={{maxWidth:820}}>
      <h2 style={{marginBottom:16}}>Frequently asked questions</h2>
      <FAQ items={[
        {q:'Is QuickKit really free?',a:'Yes — all core tools are free to use with no registration. QuickKit is a static website with no paid APIs behind the tools.'},
        {q:'Do I need to create an account?',a:'No. Favourites and recently used tools are stored only in your own browser (localStorage), so there is nothing to sign up for.'},
        {q:'Is my data private?',a:'Yes. Calculations and text processing happen locally on your device. Your text is never sent to a server. See our Privacy Policy for details.'},
        {q:'Does QuickKit work on mobile?',a:'Absolutely — every tool is mobile-first and works on phones, tablets, laptops and desktops, in light or dark mode.'},
      ]}/>
    </div></section>

    <section style={{paddingTop:0}}><div className="wrap"><div className="cta"><h2 style={{color:'#fff'}}>Ready to get something done?</h2><p>Explore the full collection of free everyday tools.</p><a className="btn" href="/tools" onClick={e=>{e.preventDefault();navigate('/tools')}}>Explore all tools <ArrowRight size={17}/></a></div></div></section>
  </>
}

export function ToolsDirectory({ navigate, favs, toggleFav, initialCat }: any) {
  const [q,setQ]=useState(''); const [cat,setCat]=useState(initialCat||'All')
  useEffect(()=>{ if(initialCat) setCat(initialCat) },[initialCat])
  const filtered=searchTools(q).filter(t=>cat==='All'||t.category===cat)
  return <div className="wrap page">
    <h1>All tools</h1><p className="sub" style={{maxWidth:640}}>Every QuickKit tool, free to use. Search by name, category or keyword — like “sale”, “essay” or “age”.</p>
    <div className="hero-search" style={{margin:'22px 0',maxWidth:640}}><div className="hero-search-box"><Search size={20} color="var(--brand)"/><input aria-label="Search all tools" placeholder="Search tools…" value={q} onChange={e=>setQ(e.target.value)}/>{q&&<button className="btn small" onClick={()=>setQ('')}>Clear</button>}</div></div>
    <div className="cat-row" role="group" aria-label="Filter by category">{['All',...CATEGORIES].map(c=><button key={c} className={cat===c?'on':''} aria-pressed={cat===c} onClick={()=>setCat(c)}>{c}</button>)}</div>
    {filtered.length===0 ? <div className="empty"><Search size={28}/><br/><strong>No tools found for “{q}”.</strong><br/>Try “percent”, “text”, “date” or “convert”.<br/><button className="btn primary small" style={{marginTop:14}} onClick={()=>{setQ('');setCat('All')}}>Browse all tools</button></div>
    : <div className="grid">{filtered.map(t=><ToolCard key={t.slug} tool={t} navigate={navigate} isFav={favs.includes(t.slug)} onToggleFav={toggleFav}/>)}</div>}
    <p className="small muted" style={{marginTop:18}}>{filtered.length} of {TOOLS.length} tools · Tip: tap the <Star size={14} style={{verticalAlign:-2}}/> on any card to save it as a favourite.</p>
  </div>
}

export function ToolPage({ tool, navigate, favs, toggleFav, onUse }: { tool:ToolDef; navigate:any; favs:string[]; toggleFav:any; onUse:(s:string)=>void }) {
  useEffect(()=>{ onUse(tool.slug) },[tool.slug])
  const Impl = IMPL[tool.slug]; const related = TOOLS.filter(t=>t.slug!==tool.slug && t.category===tool.category).concat(TOOLS.filter(t=>t.slug!==tool.slug && t.category!==tool.category)).slice(0,3)
  const isFav=favs.includes(tool.slug)
  return <div className="wrap">
    <nav className="crumb" aria-label="Breadcrumb"><a href="/" onClick={e=>{e.preventDefault();navigate('/')}}>Home</a>›<a href="/tools" onClick={e=>{e.preventDefault();navigate('/tools')}}>Tools</a>›<span aria-current="page">{tool.name}</span></nav>
    <div className="tool-hero"><span className="chip">{tool.category}</span><h1 style={{marginTop:10}}>{tool.name}</h1><p className="sub" style={{maxWidth:680}}>{tool.description}</p>
    <div className="btn-row"><button className={`btn small ${isFav?'primary':''}`} onClick={()=>toggleFav(tool.slug)} aria-pressed={isFav}><Star size={15} fill={isFav?'currentColor':'none'}/> {isFav?'Saved to favourites':'Save to favourites'}</button></div></div>
    <section style={{padding:'20px 0'}}><div className="card" style={{padding:'clamp(18px,3vw,28px)'}}>{Impl?<Impl/>:<p>Tool unavailable.</p>}</div></section>
    <section style={{paddingTop:0}}><div className="tool-layout">
      <div className="card"><h2 style={{fontSize:22}}>How it works</h2><p className="muted">{tool.howItWorks}</p><h3>Example</h3><p className="muted">{tool.example}</p><h3 style={{marginTop:22}}>Frequently asked questions</h3><FAQ items={tool.faqs}/></div>
      <div><h2 style={{fontSize:22,marginBottom:14}}>Related tools</h2><div style={{display:'grid',gap:12}}>{related.map(t=><ToolCard key={t.slug} tool={t} navigate={navigate} isFav={favs.includes(t.slug)} onToggleFav={toggleFav}/>)}</div></div>
    </div></section>
  </div>
}

export function About({ navigate }: any) {
  return <div className="wrap page prose"><h1>About QuickKit</h1><p><strong style={{color:'var(--text)'}}>QuickKit — Everyday tools. Instant answers.</strong></p>
  <p>QuickKit is a free collection of small, fast online tools for the little jobs that come up every day: working out a discount before you pay, checking the length of an essay, fixing messy pasted text, finding out how many days are left until a deadline, or converting feet into centimetres.</p>
  <h2>Why we built it</h2><p>Most tool websites are buried under pop-ups, forced sign-ups and slow, ad-heavy pages. QuickKit is the opposite: open a tool, get your answer, and get on with your day. Every calculation runs locally in your browser, so tools work instantly — and your text and numbers never leave your device.</p>
  <h2>What QuickKit offers</h2><ul><li><strong style={{color:'var(--text)'}}>Calculators</strong> — percentages and discounts, done instantly.</li><li><strong style={{color:'var(--text)'}}>Text tools</strong> — word counting and one-click formatting.</li><li><strong style={{color:'var(--text)'}}>Date tools</strong> — age, days between dates, and countdowns with leap years handled correctly.</li><li><strong style={{color:'var(--text)'}}>Converters</strong> — length, weight and temperature using exact international definitions.</li></ul>
  <h2>Our principles</h2><ul><li>Free core tools, no mandatory registration.</li><li>Privacy by design: no accounts, no tracking of your tool inputs, no uploads.</li><li>Fast and lightweight, on any device, anywhere in the world.</li><li>Honest by default — no fake reviews, counters or claims.</li></ul>
  <p><a className="btn primary" href="/tools" onClick={e=>{e.preventDefault();navigate('/tools')}}>Explore the tools <ArrowRight size={16}/></a></p></div>
}
export function Privacy(){
  return <div className="wrap page prose"><h1>Privacy Policy</h1><p className="small">Last updated: {new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>
  <p>QuickKit is designed to collect as little information as possible. This page explains, in plain language, what happens when you use the site.</p>
  <h2>Your tool inputs stay on your device</h2><p>All QuickKit tools run entirely in your web browser. Text you paste into the Word Counter or Text Formatter, dates you enter, and numbers you calculate with are <strong style={{color:'var(--text)'}}>never sent to, or stored on, a server</strong>.</p>
  <h2>What is stored locally</h2><p>QuickKit stores three small preferences in your browser's localStorage: your light/dark theme choice, your favourite tools, and your recently used tools. This data never leaves your device, is never sold or shared, and you can delete it at any time by clearing your browser's site data.</p>
  <h2>Accounts and personal information</h2><p>QuickKit has no accounts, no sign-up forms, no payments and no database. We do not ask for your name, email address or any other personal information to use the tools. If you contact us, we will only use your message to reply to you.</p>
  <h2>Cookies and third parties</h2><p>QuickKit does not set advertising or tracking cookies and does not load third-party analytics or marketing scripts in its core build. Your hosting provider may keep standard server logs (such as IP addresses) to operate and secure the service — see your host's privacy policy for details.</p>
  <h2>Your choices</h2><p>You can use every tool without providing any personal information. To remove locally stored preferences, clear site data for QuickKit in your browser settings.</p>
  <h2>Changes</h2><p>If this policy changes, the updated version will be posted on this page with a new “last updated” date.</p></div>
}
export function Contact({ navigate }: any) {
  const [sent,setSent]=useState(false); const [form,setForm]=useState({name:'',email:'',msg:''})
  return <div className="wrap page"><div style={{maxWidth:640}}><h1>Contact us</h1><p className="sub">Questions, corrections or a tool you'd love to see? Send a message below. Note: QuickKit is a static site with no backend, so this form opens your own email app — nothing is stored by QuickKit.</p>
  {sent ? <div className="empty" role="status"><Check size={30} color="var(--success)"/><br/><strong>Your email app should now be open.</strong><br/>If not, please email <a href="mailto:hello@example.com" style={{color:'var(--brand)',fontWeight:700}}>hello@example.com</a> (replace with your own address after deploying).<br/><button className="btn small" style={{marginTop:14}} onClick={()=>setSent(false)}>Send another message</button></div>
  : <form className="card" style={{marginTop:20}} onSubmit={e=>{ e.preventDefault(); const body=encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.msg}`); window.location.href=`mailto:hello@example.com?subject=${encodeURIComponent('QuickKit contact from '+ (form.name||'website visitor'))}&body=${body}`; setSent(true) }}>
    <div className="field-group"><label className="lbl" htmlFor="cn">Your name</label><input id="cn" className="field" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} autoComplete="name"/></div>
    <div className="field-group"><label className="lbl" htmlFor="ce">Your email</label><input id="ce" type="email" className="field" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} autoComplete="email"/></div>
    <div className="field-group"><label className="lbl" htmlFor="cm">Message</label><textarea id="cm" className="field" required minLength={10} value={form.msg} onChange={e=>setForm({...form,msg:e.target.value})} placeholder="How can we help?"/></div>
    <button className="btn primary" type="submit"><MousePointerClick size={16}/> Open in my email app</button>
    <p className="small muted">Prefer email directly? Write to <a href="mailto:hello@example.com" style={{color:'var(--brand)',fontWeight:600}}>hello@example.com</a> — replace this placeholder with your real address before launch (see README).</p>
  </form>}
  </div></div>
}
export function NotFound({ navigate }: any){ return <div className="wrap page" style={{textAlign:'center',paddingTop:60}}><span className="chip">404</span><h1>Page not found</h1><p className="sub">That page doesn't exist — but plenty of useful tools do.</p><p><a className="btn primary" href="/tools" onClick={e=>{e.preventDefault();navigate('/tools')}}>Browse all tools</a></p></div> }
