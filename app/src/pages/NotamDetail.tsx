import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Card, Small } from '../styles'
import { getNotam } from '../utils/notamCache'
import { normalizeNotamFeature } from '../utils/notamShape'

function RowKV({k,v}:{k:string,v:any}) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'140px 1fr', gap:8, padding:'6px 0', borderBottom:'1px dashed rgba(255,255,255,.08)'}}>
      <Small style={{opacity:.8}}>{k}</Small>
      <div>{v ?? '—'}</div>
    </div>
  )
}
const fmt = (s?:string)=> s ? new Date(s).toLocaleString() : '—'
const Chip = ({children}:{children:React.ReactNode}) => <span className="tag">{children}</span>

export default function NotamDetail() {
  const nav = useNavigate()
  const { id = '' } = useParams()
  const loc = useLocation() as any
  const item = loc?.state?.item || getNotam(id)

  if (!item) {
    return (
      <div>
        <button onClick={()=>nav(-1)}>← Back</button>
        <Card><b>NOTAM not found</b><div>از لیست وارد شوید تا کش پر شود.</div></Card>
      </div>
    )
  }

  const props = item?.properties?.[0]
  const core  = props?.coreNOTAMData
  const norm = normalizeNotamFeature(item)
  const n = norm.notam
  const trans = core?.notam_translation?.items?.[0]?.formattedText
  const title = `${n.icaoLocation || n.location || ''} • ${n.number || n.series || ''}`.trim()

  const geoArr = Array.isArray(item?.geometry) ? item.geometry : []
  const featureType = item?.type || '—' // Feature.type

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
        <button onClick={()=>nav(-1)}>← Back</button>
        <h2 style={{margin:0}}>NOTAM Details</h2>
        <span />
      </div>

      <Card>
      <div style={{display:'flex', flexWrap:'wrap', gap:8, alignItems:'baseline', marginBottom:8}}>
  <b style={{fontSize:'1.15rem'}}>{title || id}</b>
  {n.type && <Chip>Type: {n.type}</Chip>}
  {n.classification && <Chip>Class: {n.classification}</Chip>}
  {n.scope && <Chip>Scope: {n.scope}</Chip>}
  {n.affectedFIR && <Chip>FIR: {n.affectedFIR}</Chip>}
  {(n.location || n.icaoLocation) && <Chip>Loc: {n.location || n.icaoLocation}</Chip>}
  {norm.featureType && <Chip>Feat: {norm.featureType}</Chip>}
  {norm.geometryType && <Chip>Geom: {norm.geometryType}</Chip>}
</div>

<div style={{marginTop:4}}>
  <RowKV k="id" v={n.id} />
  <RowKV k="series" v={n.series} />
  <RowKV k="number" v={n.number} />
  <RowKV k="type" v={n.type} />
  <RowKV k="issued" v={fmt(n.issued)} />
  <RowKV k="affectedFIR" v={n.affectedFIR} />
  <RowKV k="selectionCode" v={n.selectionCode} />
  <RowKV k="traffic" v={n.traffic} />
  <RowKV k="purpose" v={n.purpose} />
  <RowKV k="scope" v={n.scope} />
  <RowKV k="minimumFL" v={n.minimumFL} />
  <RowKV k="maximumFL" v={n.maximumFL} />
  <RowKV k="location" v={n.location} />
  <RowKV k="icaoLocation" v={n.icaoLocation} />
  <RowKV k="effectiveStart" v={fmt(n.effectiveStart)} />
  <RowKV k="effectiveEnd" v={fmt(n.effectiveEnd)} />
  <RowKV k="classification" v={n.classification} />
  <RowKV k="accountId" v={n.accountId} />
  <RowKV k="lastUpdated" v={fmt(n.lastUpdated)} />
  {/* فیلدهای اضافه‌شده در نمونه‌ات */}
  <RowKV k="schedule" v={n.schedule} />
  <RowKV k="lowerLimit" v={n.lowerLimit} />
  <RowKV k="upperLimit" v={n.upperLimit} />
  <RowKV k="coordinates" v={n.coordinates} />
  <RowKV k="radius" v={n.radius} />
</div>

{n.text && (
  <>
    <h3 style={{marginTop:16}}>Raw Text</h3>
    <pre style={{whiteSpace:'pre-wrap', overflow:'auto'}}>{n.text}</pre>
  </>
)}
{!n.text && norm.translationText && (
  <>
    <h3 style={{marginTop:16}}>Text</h3>
    <pre style={{whiteSpace:'pre-wrap', overflow:'auto'}}>{norm.translationText}</pre>
  </>
)}

<div style={{marginTop:16}}>
  <h3>Geometry</h3>
  {norm.geometries.length === 0 && <Small>—</Small>}
  {norm.geometries.map((g:any, idx:number)=>(
    <div key={idx} style={{margin:'6px 0', padding:'8px', border:'1px solid rgba(255,255,255,.08)', borderRadius:8}}>
      <div><Small>type:</Small> {g?.type || '—'}</div>
      {'coordinates' in (g||{}) && (
        <details style={{marginTop:6}}>
          <summary>coordinates</summary>
          <pre style={{whiteSpace:'pre-wrap', overflow:'auto'}}>{JSON.stringify(g.coordinates, null, 2)}</pre>
        </details>
      )}
    </div>
  ))}
</div>

<details style={{marginTop:16}}>
  <summary>core.notam (JSON)</summary>
  <pre style={{whiteSpace:'pre-wrap', overflow:'auto'}}>{JSON.stringify(n, null, 2)}</pre>
</details>

<details style={{marginTop:8}}>
  <summary>Feature (raw)</summary>
  <pre style={{whiteSpace:'pre-wrap', overflow:'auto'}}>{JSON.stringify(item, null, 2)}</pre>
</details>

      </Card>

      <style>
        {`.tag{background:#374151;color:#fff;border-radius:999px;padding:2px 10px;font-size:.8rem}`}
      </style>
    </div>
  )
}