import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/big-shoulders-display';
import '@fontsource-variable/atkinson-hyperlegible-next';
import '@fontsource-variable/martian-mono';
import './styles.css';
import './polish.css';

type Garment = { name:string; kind:string; chest:number; length:number; shoulder:number; sleeve:number; color:string };
const closet:Garment[] = [
  {name:'Favourite hoodie',kind:'HOODIE',chest:56.2,length:68.4,shoulder:48.1,sleeve:62.3,color:'#DCFF3A'},
  {name:'Boxy vintage tee',kind:'TEE',chest:54.0,length:70.1,shoulder:46.5,sleeve:22.0,color:'#FF72B6'},
  {name:'Heavyweight crew',kind:'SWEATSHIRT',chest:58.8,length:69.0,shoulder:50.2,sleeve:60.4,color:'#62C9FF'},
];

function App(){
  const [tab,setTab]=useState<'measure'|'closet'|'fit'>('measure');
  const [active,setActive]=useState(0); const [uploaded,setUploaded]=useState(false);
  const [listing,setListing]=useState({chest:'58.3',length:'69.2',shoulder:'49.1',sleeve:'61.0'});
  const g=closet[active];
  const delta=useMemo(()=>({chest:listing.chest.trim()?Number(listing.chest)-g.chest:NaN,length:listing.length.trim()?Number(listing.length)-g.length:NaN,shoulder:listing.shoulder.trim()?Number(listing.shoulder)-g.shoulder:NaN,sleeve:listing.sleeve.trim()?Number(listing.sleeve)-g.sleeve:NaN}),[listing,g]);
  const valid=Object.values(delta).every(Number.isFinite);
  const verdict=!valid?'ENTER MEASUREMENTS':Math.max(Math.abs(delta.chest),Math.abs(delta.length),Math.abs(delta.shoulder))<3?'CLOSE MATCH':'CHECK THE DIFFERENCE';
  return <div className="app">
    <header><div className="brand">MUSLIN<span>®</span></div><div className="week"><i/> WEEK 39 / CHARTREUSE TAGS</div><button className="ghost" onClick={()=>setTab('closet')}>YOUR RACK <b>({closet.length})</b></button></header>
    <main>
      <section className="hero"><p className="eyebrow">A BETTER REFERENCE FOR SECONDHAND SHOPPING</p><h1>Measure what<br/><em>already fits.</em></h1><p className="lede">Compare a listing with a piece you already love. See the differences before you buy.</p>
      <nav>{(['measure','closet','fit'] as const).map(x=><button className={tab===x?'active':''} onClick={()=>setTab(x)} key={x}>{x==='measure'?'01 MEASURE':x==='closet'?'02 CLOSET':'03 FIT CHECK'}</button>)}</nav></section>
      {tab==='measure' && <section className="workgrid"><div className="stage"><div className="stagehead"><span>01 / MEASURE</span><span className="status">● SEEDED PREVIEW</span></div>{uploaded?<div className="garment-photo"><div className="outline"/><div className="measureline chest">56.2 cm ± 0.4</div><div className="measureline length">68.4 cm ± 0.5</div><div className="tag tag-chest">PIT TO PIT<strong>56.2 CM</strong></div><div className="tag tag-length">LENGTH<strong>68.4 CM</strong></div></div>:<label className="drop"><span className="hanger">⌁</span><strong>EXPLORE THE MEASUREMENT PREVIEW</strong><small>Sample values show the intended photo analysis workflow.</small><button type="button" onClick={()=>setUploaded(true)}>VIEW SEEDED PREVIEW ↗</button></label>}<div className="stagefoot"><span>{uploaded?'SAMPLE VALUES · PHOTO ANALYSIS NOT CONNECTED':'NO ACCOUNT REQUIRED'}</span><span>LETTER / A4 · CM</span></div></div><aside className="rail"><div className="railtitle">MEASUREMENT TAGS <span>04</span></div>{[['PIT TO PIT','56.2','± 0.4'],['LENGTH','68.4','± 0.5'],['SHOULDER','48.1','± 0.3'],['SLEEVE','62.3','± 0.6']].map((m,i)=><div className="measuretag" style={{'--tag':i===0?'#DCFF3A':i===1?'#FF72B6':i===2?'#62C9FF':'#52E38E'} as React.CSSProperties} key={m[0]}><small>{m[0]}</small><strong>{uploaded?m[1]:'—'} <i>CM</i></strong><span>{uploaded?m[2]:'waiting'}</span></div>)}<button className="inkbtn" onClick={()=>setTab('fit')}>COMPARE TO YOUR RACK →</button></aside></section>}
      {tab==='closet' && <section className="closet"><div className="sectionintro"><p className="eyebrow">02 / REFERENCE RACK</p><h2>Clothes that<br/><em>already work.</em></h2><p>Three sample garments show how your own reference rack could work. Select one, then compare it with a listing.</p></div><div className="rack">{closet.map((x,i)=><button className={'rackitem '+(active===i?' selected':'')} onClick={()=>setActive(i)} key={x.name}><div className="mini" style={{background:x.color}}><span>{x.kind}</span></div><span className="rackmeta"><b>{x.name}</b><small>{x.chest} cm pit to pit · {x.length} cm long</small><span className="rackaction">{active===i?'SELECTED REFERENCE':'USE AS REFERENCE'} <span aria-hidden="true">↗</span></span></span></button>)}<button className="add" onClick={()=>setTab('measure')}><span>01 / MEASURE</span><b>See how a garment becomes your reference</b><i>EXPLORE PREVIEW ↗</i></button></div><button className="inkbtn closet-cta" onClick={()=>setTab('fit')}>COMPARE A LISTING WITH {g.name.toUpperCase()} →</button></section>}
      {tab==='fit' && <section className="fit"><div className="fithead"><div><p className="eyebrow">03 / FIT CHECK</p><h2>Does this listing<br/><em>measure up?</em></h2><p className="fit-subhead">Use seller measurements to compare a listing against one sample garment in your rack.</p></div><div className={'verdict '+(verdict==='CLOSE MATCH'?'good':'warn')}><span>QUICK READ</span>{verdict}<small>against {g.name} · based on three dimensions</small></div></div><div className="reference-switch"><span>COMPARE AGAINST</span>{closet.map((item,i)=><button key={item.name} className={active===i?'selected':''} onClick={()=>setActive(i)}>{item.name}</button>)}</div><div className="fitgrid"><div className="compare"><div className="comparehead"><b>SIZE OVERLAY</b><span>ILLUSTRATIVE SHAPES</span></div><div className="ghostsilhouette"><div className="silhouette old"/><div className="silhouette new"/></div><div className="legend"><span><i className="dot olddot"/> {g.name.toUpperCase()}</span><span><i className="dot newdot"/> LISTING</span></div></div><div className="inputs"><p>ENTER THE SELLER'S MEASUREMENTS <span>CM</span></p>{Object.entries(listing).map(([key,val])=><label key={key}>{key.replace('chest','PIT TO PIT').toUpperCase()}<input aria-label={key+' in centimeters'} inputMode="decimal" value={val} onChange={e=>setListing({...listing,[key]:e.target.value})}/><i>CM</i></label>)}<div className="deltas"><div className="deltas-head">DIFFERENCE FROM YOUR REFERENCE</div>{Object.entries(delta).map(([k,v])=><div key={k}><span>{k.toUpperCase()}</span><b className={Math.abs(v)<3?'ok':'bad'}>{Number.isFinite(v)?`${v>0?'+':''}${v.toFixed(1)} CM`:'—'}</b><small>{Number.isFinite(v)?v>0?'looser':v<0?'tighter':'same':'enter a number'}</small></div>)}</div><p className="fit-caveat">A measurement comparison is a guide, not a guarantee of how the garment will fit.</p></div></div></section>}
    </main><footer><span>BUILT BY RISHIK RONTALA</span><span>PRIVATE BY DEFAULT · MUSLIN 2026</span></footer>
  </div>
}
createRoot(document.getElementById('root')!).render(<App/>);
