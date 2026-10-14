import React, { useMemo, useState } from 'react'
import { RotateCcw, ArrowLeftRight, Copy, Check, Trash2 } from 'lucide-react'
import { fmt, copyText } from './hooks'
import { percentOf, whatPercent, percentChange, discount as calcDiscount, textStats, toTitleCase, toSentenceCase, removeExtraSpaces, removeDuplicateBlankLines, ageBetween, daysBetween, convertLinear, convertTemperature, UNIT_CATEGORIES } from './lib/logic'
import { CopyBtn } from './components'

const num = (v: string) => v === '' ? NaN : Number(v)
function useCopy(){ const [done,setDone]=useState(false); const copy=async(t:string)=>{ if(await copyText(t)){setDone(true); setTimeout(()=>setDone(false),1800)} }; return {done,copy} }

export function PercentageTool(){
  const [tab,setTab]=useState(0)
  const [a,setA]=useState('20'); const [b,setB]=useState('250')
  const [x,setX]=useState('50'); const [y,setY]=useState('200')
  const [oldV,setOld]=useState('80'); const [newV,setNew]=useState('100')
  const err = (v:string)=> v!=='' && isNaN(Number(v)) ? 'Please enter a valid number.' : ''
  let result='', detail=''
  if(tab===0){ const p=num(a),n=num(b); if(!isNaN(p)&&!isNaN(n)){ const r=percentOf(p,n); result=`${fmt(r)}`; detail=`${fmt(p)}% of ${fmt(n)} = ${fmt(n)} × ${fmt(p/100,6)} = ${fmt(r)}` } }
  if(tab===1){ const p=num(x),n=num(y); if(!isNaN(p)&&!isNaN(n)){ if(n===0){detail='Cannot divide by zero — the second number must not be 0.'} else { const r=whatPercent(p,n); result=`${fmt(r)}%`; detail=`${fmt(p)} ÷ ${fmt(n)} × 100 = ${fmt(r)}%` } } }
  if(tab===2){ const o=num(oldV),n=num(newV); if(!isNaN(o)&&!isNaN(n)){ if(o===0){detail='The original value must not be 0.'} else { const r=percentChange(o,n); result=`${r>0?'+':''}${fmt(r)}%`; detail=`(${fmt(n)} − ${fmt(o)}) ÷ ${fmt(Math.abs(o))} × 100 = ${fmt(r)}% — a ${r>0?'increase':r<0?'decrease':'no change'} of ${fmt(Math.abs(n-o))}.` } } }
  const reset=()=>{setA('');setB('');setX('');setY('');setOld('');setNew('')}
  return <div>
    <div className="tabs" role="tablist">{['% of a number','What % is…','Increase / decrease'].map((l,i)=><button key={l} role="tab" aria-selected={tab===i} className={tab===i?'on':''} onClick={()=>setTab(i)}>{l}</button>)}</div>
    {tab===0 && <div className="field-row"><div className="field-group"><label className="lbl" htmlFor="pa">Percentage (%)</label><input id="pa" className="field" inputMode="decimal" value={a} onChange={e=>setA(e.target.value)} placeholder="e.g. 20"/>{err(a)&&<p className="err">{err(a)}</p>}</div><div className="field-group"><label className="lbl" htmlFor="pb">Of number</label><input id="pb" className="field" inputMode="decimal" value={b} onChange={e=>setB(e.target.value)} placeholder="e.g. 250"/>{err(b)&&<p className="err">{err(b)}</p>}</div></div>}
    {tab===1 && <div className="field-row"><div className="field-group"><label className="lbl" htmlFor="px">First number</label><input id="px" className="field" inputMode="decimal" value={x} onChange={e=>setX(e.target.value)}/>{err(x)&&<p className="err">{err(x)}</p>}</div><div className="field-group"><label className="lbl" htmlFor="py">Is what % of</label><input id="py" className="field" inputMode="decimal" value={y} onChange={e=>setY(e.target.value)}/>{err(y)&&<p className="err">{err(y)}</p>}</div></div>}
    {tab===2 && <div className="field-row"><div className="field-group"><label className="lbl" htmlFor="po">Original value</label><input id="po" className="field" inputMode="decimal" value={oldV} onChange={e=>setOld(e.target.value)}/>{err(oldV)&&<p className="err">{err(oldV)}</p>}</div><div className="field-group"><label className="lbl" htmlFor="pn">New value</label><input id="pn" className="field" inputMode="decimal" value={newV} onChange={e=>setNew(e.target.value)}/>{err(newV)&&<p className="err">{err(newV)}</p>}</div></div>}
    <div className="result" aria-live="polite"><span className="small muted" style={{fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em'}}>Result</span><div className="big">{result||'—'}</div>{detail&&<p className="small muted" style={{margin:'6px 0 0'}}>{detail}</p>}</div>
    <div className="btn-row"><CopyBtn text={result?`${detail} (${result})`:''}/><button className="btn small" onClick={reset}><RotateCcw size={15}/> Reset</button></div>
  </div>
}

const CURRENCIES=[['USD','$ — US Dollar'],['EUR','€ — Euro'],['GBP','£ — British Pound'],['NGN','₦ — Nigerian Naira'],['INR','₹ — Indian Rupee'],['JPY','¥ — Japanese Yen'],['CAD','$ — Canadian Dollar'],['AUD','$ — Australian Dollar']] as const
export function DiscountTool(){
  const [price,setPrice]=useState('120'); const [disc,setDisc]=useState('25'); const [extra,setExtra]=useState(''); const [cur,setCur]=useState('USD')
  const p=num(price), d=num(disc), e=extra===''?0:num(extra)
  const errP = price!=='' && (isNaN(p)||p<0) ? 'Enter a price of 0 or more.' : ''
  const errD = disc!=='' && (isNaN(d)||d<0||d>100) ? 'Discount must be between 0% and 100%.' : ''
  const errE = extra!=='' && (isNaN(e)||e<0||e>100) ? 'Extra discount must be between 0% and 100%.' : ''
  const valid=!errP&&!errD&&!errE&&!isNaN(p)&&!isNaN(d)&&!isNaN(e)
  const dc=valid?calcDiscount(p,d,e):null; const after1=dc?dc.afterFirst:NaN, final=dc?dc.finalPrice:NaN, saved=dc?dc.saved:NaN
  const money=(n:number)=> new Intl.NumberFormat('en-US',{style:'currency',currency:cur}).format(n)
  const summary=valid?`Original ${money(p)}, ${fmt(d)}% off${e?` plus extra ${fmt(e)}% off`:''}: you save ${money(saved)} and pay ${money(final)}.`:''
  return <div>
    <div className="field-row"><div className="field-group"><label className="lbl" htmlFor="dp">Original price</label><input id="dp" className="field" inputMode="decimal" value={price} onChange={e=>setPrice(e.target.value)} placeholder="e.g. 120"/>{errP&&<p className="err">{errP}</p>}</div>
    <div className="field-group"><label className="lbl" htmlFor="dd">Discount (%)</label><input id="dd" className="field" inputMode="decimal" value={disc} onChange={e=>setDisc(e.target.value)} placeholder="e.g. 25"/>{errD&&<p className="err">{errD}</p>}</div></div>
    <div className="field-row"><div className="field-group"><label className="lbl" htmlFor="de">Extra discount % (optional)</label><input id="de" className="field" inputMode="decimal" value={extra} onChange={e=>setExtra(e.target.value)} placeholder="e.g. 10"/>{errE&&<p className="err">{errE}</p>}</div>
    <div className="field-group"><label className="lbl" htmlFor="dc">Currency (display only)</label><select id="dc" className="field" value={cur} onChange={e=>setCur(e.target.value)}>{CURRENCIES.map(([c,l])=><option key={c} value={c}>{l}</option>)}</select><p className="small muted" style={{margin:'6px 0 0'}}>Changes the symbol only — no live exchange rates.</p></div></div>
    <div className="result" aria-live="polite"><div className="stat-grid">
      <div className="stat"><b>{valid?money(saved):'—'}</b><span>You save</span></div>
      <div className="stat"><b>{valid?money(final):'—'}</b><span>Final price</span></div>
      <div className="stat"><b>{valid?fmt(dc!.effectivePercent,1)+'%':'—'}</b><span>Total saving</span></div></div>
      {valid&&e>0&&<p className="small muted" style={{margin:'10px 0 0'}}>After first discount: {money(after1)}</p>}</div>
    <div className="btn-row"><CopyBtn text={summary}/><button className="btn small" onClick={()=>{setPrice('');setDisc('');setExtra('')}}><RotateCcw size={15}/> Reset</button></div>
  </div>
}

export function WordCounterTool(){
  const [text,setText]=useState(''); const {done,copy}=useCopy()
  const st=useMemo(()=>textStats(text),[text]); const s={words:st.words, chars:st.chars, noSpaces:st.noSpaces, sentences:st.sentences, paras:st.paragraphs, read:st.readingMinutes, speak:st.speakingMinutes}
  const time=(m:number)=> s.words===0?'0 sec':m<1?`${Math.max(1,Math.round(m*60))} sec`:`${Math.floor(m)} min ${Math.round((m%1)*60)} sec`
  return <div>
    <label className="lbl" htmlFor="wc">Your text</label>
    <textarea id="wc" className="field" style={{minHeight:200}} value={text} onChange={e=>setText(e.target.value)} placeholder="Start typing or paste your text here… (processed locally, never uploaded)"/>
    <div className="stat-grid" style={{marginTop:14}} aria-live="polite">
      {[['Words',s.words],['Characters',s.chars],['No spaces',s.noSpaces],['Sentences',s.sentences],['Paragraphs',s.paras],['Reading',time(s.read)]].map(([l,v])=><div className="stat" key={l as string}><b>{v}</b><span>{l}</span></div>)}
    </div>
    <p className="small muted">Speaking time: ~{time(s.speak)} at 130 wpm · Reading at 200 wpm.</p>
    <div className="btn-row"><button className="btn small" disabled={!text} onClick={()=>copy(text)}>{done?<><Check size={15}/> Copied!</>:<><Copy size={15}/> Copy text</>}</button><button className="btn small" disabled={!text} onClick={()=>setText('')}><Trash2 size={15}/> Clear</button></div>
  </div>
}

export function TextFormatterTool(){
  const [text,setText]=useState(''); const [msg,setMsg]=useState(''); const {done,copy}=useCopy()
  const apply=(fn:(t:string)=>string,label:string)=>{ if(!text){setMsg('Add some text first.');return} setText(fn(text)); setMsg(label+' applied.') }
  const title=toTitleCase
  const sentence=toSentenceCase
  return <div>
    <label className="lbl" htmlFor="tf">Your text</label>
    <textarea id="tf" className="field" value={text} onChange={e=>{setText(e.target.value);setMsg('')}} placeholder="Paste messy text here, then choose a transformation below…"/>
    <p className="small muted" style={{margin:'8px 0 0'}}>{text.length} characters · {text.trim()?text.trim().split(/\s+/).length:0} words {msg&&<>· <span className="ok-msg">{msg}</span></>}</p>
    <div className="btn-row" role="group" aria-label="Text transformations">
      <button className="btn small" onClick={()=>apply(t=>t.toUpperCase(),'UPPERCASE')}>UPPERCASE</button>
      <button className="btn small" onClick={()=>apply(t=>t.toLowerCase(),'lowercase')}>lowercase</button>
      <button className="btn small" onClick={()=>apply(title,'Title Case')}>Title Case</button>
      <button className="btn small" onClick={()=>apply(sentence,'Sentence case')}>Sentence case</button>
      <button className="btn small" onClick={()=>apply(removeExtraSpaces,'Extra spaces removed')}>Remove extra spaces</button>
      <button className="btn small" onClick={()=>apply(removeDuplicateBlankLines,'Duplicate blank lines removed')}>Remove blank lines</button>
      <button className="btn small" onClick={()=>apply(t=>t.split('\n').sort((a,b)=>a.localeCompare(b)).join('\n'),'Lines sorted A–Z')}>Sort lines</button>
      <button className="btn small" onClick={()=>apply(t=>[...new Set(t.split('\n'))].join('\n'),'Duplicate lines removed')}>Dedupe lines</button>
      <button className="btn small" onClick={()=>apply(t=>t.split('\n').reverse().join('\n'),'Lines reversed')}>Reverse lines</button>
    </div>
    <div className="btn-row"><button className="btn small primary" disabled={!text} onClick={()=>copy(text)}>{done?<><Check size={15}/> Copied!</>:<><Copy size={15}/> Copy result</>}</button><button className="btn small" disabled={!text} onClick={()=>setText('')}><Trash2 size={15}/> Clear</button><button className="btn small" onClick={()=>{setText('');setMsg('')}}><RotateCcw size={15}/> Reset</button></div>
  </div>
}

const DAY=86400000
const parseD=(v:string)=>{ if(!v) return null; const d=new Date(v+'T00:00:00Z'); return isNaN(d.getTime())?null:d }
const fmtD=(d:Date)=>d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})
export function DateTool(){
  const today=new Date().toISOString().slice(0,10)
  const [tab,setTab]=useState(0)
  const [dob,setDob]=useState('1990-06-15'); const [asOf,setAsOf]=useState(today)
  const [from,setFrom]=useState(today); const [to,setTo]=useState('')
  const [target,setTarget]=useState(''); const [base,setBase]=useState(today); const [days,setDays]=useState('30'); const [mode,setMode]=useState<'add'|'sub'>('add')
  let result:React.ReactNode=null
  if(tab===0){ const b=parseD(dob),a=parseD(asOf); if(b&&a){ if(b>a) result=<p className="err">Date of birth must be before the “as of” date.</p>; else { const ag=ageBetween(b,a); const yrs=ag.years, mos=ag.months, ds=ag.days; const total=ag.totalDays; const next=new Date(Date.UTC(a.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate())); if(next<=a) next.setUTCFullYear(a.getUTCFullYear()+1); result=<><div className="big">{yrs} years, {mos} months, {ds} days</div><p className="small muted">{fmt(total)} days old in total · Next birthday: {fmtD(next)} ({fmt(Math.round((next.getTime()-a.getTime())/DAY))} days away)</p></> } } }
  if(tab===1){ const f=parseD(from),t=parseD(to); if(f&&t){ const diff=daysBetween(f,t); result=<><div className="big">{fmt(Math.abs(diff))} days</div><p className="small muted">{fmtD(f)} → {fmtD(t)} · {fmt(Math.abs(diff)/7,2)} weeks · {diff<0?'Second date is earlier':'In chronological order'}</p></> } else result=<p className="muted small">Choose both dates to see the difference.</p> }
  if(tab===2){ const t=parseD(target), n=parseD(today); if(t&&n){ const diff=daysBetween(n,t); result=<><div className="big">{diff>0?`${fmt(diff)} days to go`:diff<0?`${fmt(-diff)} days ago`:'Today!'}</div><p className="small muted">{fmtD(t)}{diff>0?` · ${fmt(diff/7,1)} weeks away`:''}</p></> } else result=<p className="muted small">Pick a date to count down to.</p> }
  if(tab===3){ const bse=parseD(base), d=num(days); if(bse&&!isNaN(d)){ const r=new Date(bse.getTime()+(mode==='add'?d:-d)*DAY); result=<><div className="big">{fmtD(r)}</div><p className="small muted">{mode==='add'?'Adding':'Subtracting'} {fmt(Math.abs(d))} days {mode==='add'?'to':'from'} {fmtD(bse)}</p></> } }
  return <div>
    <div className="tabs">{['Age calculator','Days between','Countdown','Add / subtract'].map((l,i)=><button key={l} className={tab===i?'on':''} onClick={()=>setTab(i)}>{l}</button>)}</div>
    {tab===0&&<div className="field-row"><div className="field-group"><label className="lbl" htmlFor="dob">Date of birth</label><input id="dob" type="date" className="field" value={dob} max={today} onChange={e=>setDob(e.target.value)}/></div><div className="field-group"><label className="lbl" htmlFor="asof">As of date</label><input id="asof" type="date" className="field" value={asOf} onChange={e=>setAsOf(e.target.value)}/></div></div>}
    {tab===1&&<div className="field-row"><div className="field-group"><label className="lbl" htmlFor="df">Start date</label><input id="df" type="date" className="field" value={from} onChange={e=>setFrom(e.target.value)}/></div><div className="field-group"><label className="lbl" htmlFor="dt">End date</label><input id="dt" type="date" className="field" value={to} onChange={e=>setTo(e.target.value)}/></div></div>}
    {tab===2&&<div className="field-group"><label className="lbl" htmlFor="dc2">Target date</label><input id="dc2" type="date" className="field" value={target} onChange={e=>setTarget(e.target.value)}/></div>}
    {tab===3&&<><div className="field-row"><div className="field-group"><label className="lbl" htmlFor="db">Start date</label><input id="db" type="date" className="field" value={base} onChange={e=>setBase(e.target.value)}/></div><div className="field-group"><label className="lbl" htmlFor="ddays">Number of days</label><input id="ddays" className="field" inputMode="numeric" value={days} onChange={e=>setDays(e.target.value)}/></div></div><div className="btn-row" style={{margin:'0 0 14px'}}><button className={`btn small ${mode==='add'?'primary':''}`} onClick={()=>setMode('add')}>Add days</button><button className={`btn small ${mode==='sub'?'primary':''}`} onClick={()=>setMode('sub')}>Subtract days</button></div></>}
    <div className="result" aria-live="polite">{result||<p className="muted small" style={{margin:0}}>Enter dates above to see your result.</p>}</div>
  </div>
}

const CATS=UNIT_CATEGORIES
function tempConvert(v:number,from:string,to:string){ return convertTemperature(v,from,to) }
export function UnitTool(){
  const [cat,setCat]=useState('Length'); const [from,setFrom]=useState('m'); const [to,setTo]=useState('ft'); const [val,setVal]=useState('1')
  const units=CATS[cat]; const v=num(val)
  const changeCat=(c:string)=>{ setCat(c); setFrom(CATS[c][0].id); setTo(CATS[c][1].id) }
  let out=NaN, errMsg=''
  if(!isNaN(v)){ if(cat==='Temperature'){ out=tempConvert(v,from,to); if(to==='k'&&out<0) errMsg='Result is below absolute zero (0 K) — not physically possible.'; if(from==='k'&&v<0) errMsg='Kelvin cannot be negative.' } else { const f=units.find(u=>u.id===from)!, t=units.find(u=>u.id===to)!; out=convertLinear(v,f,t) } }
  const fromLabel=units.find(u=>u.id===from)?.label, toLabel=units.find(u=>u.id===to)?.label
  const swap=()=>{ setFrom(to); setTo(from); if(!isNaN(out)) setVal(String(Number(out.toFixed(6)))) }
  return <div>
    <div className="field-group"><label className="lbl" htmlFor="ucat">Category</label><select id="ucat" className="field" value={cat} onChange={e=>changeCat(e.target.value)}>{Object.keys(CATS).map(c=><option key={c}>{c}</option>)}</select></div>
    <div className="unit-grid">
      <div className="field-group"><label className="lbl" htmlFor="uval">Value</label><input id="uval" className="field" inputMode="decimal" value={val} onChange={e=>setVal(e.target.value)} placeholder="1"/></div>
      <button className="btn swap" onClick={swap} aria-label="Swap units" title="Swap units"><ArrowLeftRight size={17}/></button>
      <div className="field-group"><label className="lbl" htmlFor="ures">Result</label><input id="ures" className="field" readOnly value={isNaN(out)?'':fmt(out,6)} aria-live="polite"/></div>
    </div>
    <div className="field-row"><div className="field-group"><label className="lbl" htmlFor="ufrom">From</label><select id="ufrom" className="field" value={from} onChange={e=>setFrom(e.target.value)}>{units.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}</select></div>
    <div className="field-group"><label className="lbl" htmlFor="uto">To</label><select id="uto" className="field" value={to} onChange={e=>setTo(e.target.value)}>{units.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}</select></div></div>
    {val!==''&&isNaN(v)?<p className="err">Please enter a valid number.</p>:errMsg?<p className="err">{errMsg}</p>:!isNaN(out)&&<div className="result" aria-live="polite"><div className="big">{fmt(v,6)} → {fmt(out,6)}</div><p className="small muted" style={{margin:'4px 0 0'}}>{fromLabel} to {toLabel}</p></div>}
    <div className="btn-row"><CopyBtn text={!isNaN(out)?`${fmt(v,6)} ${fromLabel} = ${fmt(out,6)} ${toLabel}`:''} label="Copy conversion"/><button className="btn small" onClick={()=>setVal('')}><RotateCcw size={15}/> Reset</button></div>
  </div>
}
