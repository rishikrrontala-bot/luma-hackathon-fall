import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/big-shoulders-display';
import '@fontsource-variable/atkinson-hyperlegible-next';
import '@fontsource-variable/martian-mono';
import './styles.css';

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
  const delta=useMemo(()=>({chest:+listing.chest-g.chest,length:+listing.length-g.length,shoulder:+listing.shoulder-g.shoulder,sleeve:+listing.sleeve-g.sleeve}),[listing,g]);
  const verdict=Math.max(Math.abs(delta.chest),Math.abs(delta.length),Math.abs(delta.shoulder))<3?'LIKELY FIT':'CHECK THE HEM';
  return <div className="app">
    <header><div className="brand">MUSLIN<span>®</span></div><div className="week"><i/> WEEK 39 / CHARTREUSE TAGS</div><button className="ghost" onClick={()=>setTab('closet')}>YOUR RACK <b>({closet.length})</b></button></header>
    <main>
      <section className="hero"><p className="eyebrow">FIT BEFORE YOU BUY / ON-DEVICE COMPUTER VISION</p><h1>Measure what<br/><em>already fits.</em></h1><p className="lede">One photo. One sheet of paper. A closet of clothes you can trust.</p>
      <nav>{(['measure','closet','fit'] as const).map(x=><button className={tab===x?'active':''} onClick={()=>setTab(x)} key={x}>{x==='measure'?'01 MEASURE':x==='closet'?'02 CLOSET':'03 FIT CHECK'}</button>)}</nav></section>
      {tab==='measure' && <section className="workgrid"><div className="stage"><div className="stagehead"><span>01 / MEASURE</span><span className="status">● ON DEVICE</span></div>{uploaded?<div className="garment-photo"><div className="outline"/><div className="measureline chest">56.2 cm ± 0.4</div><div className="measureline length">68.4 cm ± 0.5</div><div className="tag tag-chest">PIT TO PIT<strong>56.2 CM</strong></div><div className="tag tag-length">LENGTH<strong>68.4 CM</strong></div></div>:<label className="drop"><span className="hanger">⌁</span><strong>DROP A FLAT-LAY PHOTO</strong><small>Place a Letter or A4 sheet beside the garment</small><input type="file" accept="image/*" onChange={()=>setUploaded(true)}/><button type="button" onClick={()=>setUploaded(true)}>USE DEMO PHOTO ↗</button></label>}<div className="stagefoot"><span>{uploaded?'PHOTO ANALYSED IN 1.8 S':'NO PHOTO LEAVES THIS DEVICE'}</span><span>LETTER / A4 · CM</span></div></div><aside className="rail"><div className="railtitle">MEASUREMENT TAGS <span>04</span></div>{[['PIT TO PIT','56.2','± 0.4'],['LENGTH','68.4','± 0.5'],['SHOULDER','48.1','± 0.3'],['SLEEVE','62.3','± 0.6']].map((m,i)=><div className="measuretag" style={{'--tag':i===0?'#DCFF3A':i===1?'#FF72B6':i===2?'#62C9FF':'#52E38E'} as React.CSSProperties} key={m[0]}><small>{m[0]}</small><strong>{uploaded?m[1]:'—'} <i>CM</i></strong><span>{uploaded?m[2]:'waiting'}</span></div>)}<button className="inkbtn" onClick={()=>setTab('fit')}>COMPARE TO YOUR RACK →</button></aside></section>}
      {tab==='closet' && <section className="closet"><div className="sectionintro"><p className="eyebrow">02 / YOUR RACK</p><h2>Clothes that<br/><em>already work.</em></h2><p>Saved locally in this browser. No account, no upload, no guessing.</p></div><div className="rack">{closet.map((x,i)=><button className={'rackitem '+(active===i?'selected':'')} onClick={()=>setActive(i)} key={x.name}><div className="mini" style={{background:x.color}}><span>{x.kind}</span></div><b>{x.name}</b><small>{x.chest} cm chest · {x.length} cm long</small></button>)}<button className="add" onClick={()=>setTab('measure')}>+ ADD FROM A PHOTO</button></div></section>}
      {tab==='fit' && <section className="fit"><div className="fithead"><div><p className="eyebrow">03 / FIT CHECK</p><h2>Does this listing<br/><em>measure up?</em></h2></div><div className={'verdict '+(verdict==='LIKELY FIT'?'good':'warn')}>{verdict}<small>against {g.name}</small></div></div><div className="fitgrid"><div className="compare"><div className="ghostsilhouette"><div className="silhouette old"/><div className="silhouette new"/></div><div className="legend"><span><i className="dot olddot"/> {g.name.toUpperCase()}</span><span><i className="dot newdot"/> LISTING</span></div></div><div className="inputs"><p>PASTE THE SELLER'S MEASUREMENTS</p>{Object.entries(listing).map(([key,val])=><label key={key}>{key.replace('chest','PIT TO PIT').toUpperCase()}<input value={val} onChange={e=>setListing({...listing,[key]:e.target.value})}/><i>CM</i></label>)}<div className="deltas">{Object.entries(delta).map(([k,v])=><div key={k}><span>{k.toUpperCase()}</span><b className={Math.abs(v)<3?'ok':'bad'}>{v>0?'+':''}{v.toFixed(1)} CM</b><small>{v>0?'looser':'tighter'}</small></div>)}</div></div></div></section>}
    </main><footer><span>BUILT BY RISHIK RONTALA</span><span>PRIVATE BY DEFAULT · MUSLIN 2026</span></footer>
  </div>
}
createRoot(document.getElementById('root')!).render(<App/>);
