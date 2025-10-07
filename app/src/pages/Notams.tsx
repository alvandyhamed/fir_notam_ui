import React from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { Card, Grid, Row, Small } from '../styles'
import Pagination from '../components/Pagination'
import { putNotam } from '../utils/notamCache'
import { normalizeNotamFeature } from '../utils/notamShape'

type NotamItem = any

function chip(label: string) {
  return <span className="tag">{label}</span>
}

export default function Notams() {
  const [domesticLocation, setDomesticLocation] = React.useState('OIIX')
  const [notamType, setNotamType] = React.useState<string>('')
  const [classification, setClassification] = React.useState<string>('')
  const [notamNumber, setNotamNumber] = React.useState<string>('')
  const [effectiveStartDate, setEffectiveStartDate] = React.useState<string>('')
  const [effectiveEndDate, setEffectiveEndDate] = React.useState<string>('')
  const [featureType, setFeatureType] = React.useState<string>('')
  const [sortBy, setSortBy] = React.useState<string>('')
  const [sortOrder, setSortOrder] = React.useState<'Asc'|'Desc'|''>('')
  const [pageSize, setPageSize] = React.useState<number>(50)
  const [pageNum, setPageNum] = React.useState<number>(1)

  const [data, setData] = React.useState<{ items: NotamItem[], totalPages?: number, totalCount?: number }|null>(null)
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState<string>('')

  async function run() {
    setLoading(true); setErr('')
    try {
      const res = await api.notams({
        domesticLocation,
        notamType: notamType || undefined,
        classification: classification || undefined,
        notamNumber: notamNumber || undefined,
        effectiveStartDate: effectiveStartDate || undefined,
        effectiveEndDate: effectiveEndDate || undefined,
        featureType: featureType || undefined,
        sortBy: sortBy || undefined,
        sortOrder: (sortOrder as any) || undefined,
        pageSize,
        pageNum
      })
      setData(res)
    } catch (e:any) {
      const msg = e?.responseJson ? JSON.stringify(e.responseJson, null, 2)
               : e?.responseText ?? e?.message ?? 'Request failed'
      setErr(msg)
    } finally { setLoading(false) }
  }

  function setPage(p:number){ setPageNum(Math.max(1, p)) }

  return (
    <div>
      <h2>NOTAM (FAA proxy)</h2>
      <Row>
        <input placeholder="Domestic/FIR/ICAO (e.g., OIIX)" value={domesticLocation} onChange={e=>setDomesticLocation(e.target.value.toUpperCase())} />
        <select value={notamType} onChange={e=>setNotamType(e.target.value)}>
          <option value="">notamType (any)</option>
          <option value="N">N</option><option value="R">R</option><option value="C">C</option>
        </select>
        <select value={classification} onChange={e=>setClassification(e.target.value)}>
          <option value="">classification (any)</option>
          {['INTL','MIL','DOM','LMIL','FDC'].map(x=><option key={x} value={x}>{x}</option>)}
        </select>
        <input placeholder="notamNumber (e.g., CK0000/01)" value={notamNumber} onChange={e=>setNotamNumber(e.target.value)} />
      </Row>
      <Row>
        <input type="datetime-local" value={effectiveStartDate} onChange={e=>setEffectiveStartDate(e.target.value)} />
        <input type="datetime-local" value={effectiveEndDate} onChange={e=>setEffectiveEndDate(e.target.value)} />
        <input placeholder="featureType CSV (RWY,TWY,…)" value={featureType} onChange={e=>setFeatureType(e.target.value)} />
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="">sortBy (none)</option>
          {['icaoLocation','domesticLocation','notamType','notamNumber','effectiveStartDate','effectiveEndDate','featureType'].map(x=><option key={x} value={x}>{x}</option>)}
        </select>
        <select value={sortOrder} onChange={e=>setSortOrder(e.target.value as any)}>
          <option value="">sortOrder</option>
          <option value="Asc">Asc</option>
          <option value="Desc">Desc</option>
        </select>
      </Row>
      <Row>
        <button onClick={()=>{ setPageNum(1); run() }}>Search</button>
        <select value={pageSize} onChange={e=>setPageSize(parseInt(e.target.value,10))}>
          {[20,50,100,200,500,1000].map(n=><option key={n} value={n}>{n}/page</option>)}
        </select>
      </Row>

      {loading && <p>Loading…</p>}
      {err && <Card><b>Error</b><pre style={{whiteSpace:'pre-wrap', overflow:'auto', maxHeight:300}}>{err}</pre></Card>}

      {data && <>
        <Small>Total: {data.totalCount ?? (data.items?.length || 0)}</Small>
        <Grid>
          {(data.items||[]).map((it:any, i:number)=>{
            const norm = normalizeNotamFeature(it)
            const n = norm.notam
            const props = it?.properties?.[0]
            const core  = props?.coreNOTAMData
            const id = n.id || `${n.icaoLocation || n.location || 'UNK'}-${n.number || i}`
            const title = `${n.icaoLocation || n.location || ''} • ${n.number || n.series || ''}`.trim()

            // فیلدهای درخواستی روی کارت
            const affectedFIR = n.affectedFIR || '—'
            const location    = n.location || n.icaoLocation || '—'
            const featureType = it?.type || '—' // Feature.type
            const geoArr      = Array.isArray(it?.geometry) ? it.geometry : []
            const geometryTyp = geoArr[0]?.type || it?.geometry?.type || '—'

            putNotam(id, it)

            return (
              <Link key={id} to={`/notams/${encodeURIComponent(id)}`} state={{ item: it }} style={{ color: 'inherit', textDecoration:'none' }}>
                <Card>
                  <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom:4}}>
                    <b style={{fontSize:'1.05rem'}}>{title || 'NOTAM'}</b>
                    <span className="tag">FIR: {affectedFIR}</span>
                    <span className="tag">Loc: {location}</span>
                    <span className="tag">Geom: {geometryTyp}</span>
                    <span className="tag">Feat: {featureType}</span>         
                  </div>
                  <div><Small>Type:</Small> {n.type || '—'} • <Small>Class:</Small> {n.classification || '—'} • <Small>Scope:</Small> {n.scope || '—'}</div>
                  <div><Small>Effective:</Small> {(n.effectiveStart || '—')} → {(n.effectiveEnd || '—')}</div>

                  {n.text && <pre style={{whiteSpace:'pre-wrap', marginTop:8, maxHeight:140, overflow:'auto'}}>{n.text}</pre>}

                  
                </Card>
              </Link>
            )
          })}
        </Grid>

        {typeof data.totalPages === 'number' && (
          <Pagination
            page={pageNum}
            limit={pageSize}
            total={(data.totalPages || 1) * (pageSize || 1)}
            onPageChange={p => { setPage(p); run() }}
          />
        )}
      </>}

      <style>
        {`.tag{background:#374151;color:#fff;border-radius:999px;padding:2px 8px;font-size:.75rem}`}
      </style>
    </div>
  )
}