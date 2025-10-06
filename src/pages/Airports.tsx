import React from 'react'
import { api } from '../api/client'
import { Card, Grid, Row, Small } from '../styles'
import Pagination from '../components/Pagination'

export default function Airports() {
  const [q, setQ] = React.useState('')
  const [icao, setIcao] = React.useState('')
  const [iata, setIata] = React.useState('')
  const [country, setCountry] = React.useState('')
  const [atype, setAtype] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(20)
  const [data, setData] = React.useState<any>(null)
  const [err, setErr] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)

  async function run() {
    setLoading(true); setErr('')
    try {
      const res = await api.airports_list({ q, ICAO: icao, IATA: iata, country, type: atype, page, limit })
      setData(res)
    } catch(e:any) {
      setErr(e.message || 'Request failed')
    } finally { setLoading(false) }
  }

  React.useEffect(() => { run() }, [page, limit])

  return (
    <div>
      <h2>Airports</h2>
      <Row>
        <input placeholder="q (name/municipality/ICAO/IATA)" value={q} onChange={e=>setQ(e.target.value)} />
        <input placeholder="ICAO" value={icao} onChange={e=>setIcao(e.target.value)} />
        <input placeholder="IATA" value={iata} onChange={e=>setIata(e.target.value)} />
        <input placeholder="country (ISO)" value={country} onChange={e=>setCountry(e.target.value)} />
        <select value={atype} onChange={e=>setAtype(e.target.value)}>
          <option value="">type (any)</option>
          <option>large_airport</option><option>medium_airport</option>
          <option>small_airport</option><option>heliport</option><option>seaplane_base</option>
        </select>
        <button onClick={()=>{ setPage(1); run() }}>Search</button>
        <select value={limit} onChange={e=>setLimit(parseInt(e.target.value))}>
          {[10,20,50,100,150,200].map(n=><option key={n} value={n}>{n}/page</option>)}
        </select>
      </Row>
      {loading && <p>Loading…</p>}
      {err && <Card><b>Error</b><pre style={{whiteSpace:'pre-wrap'}}>{err}</pre></Card>}
      {data && <>
        <Small>Total: {data.meta?.total ?? data.items?.length ?? 0}</Small>
        <Grid>
          {(data.items||[]).map((a:any, i:number)=>(
            <Card key={i}>
              <b>{a.name}</b>
              <div>{a.municipality}</div>
              <Small>{a.iso_country} • {a.type}</Small>
              <div>ICAO: {a.icao_code || a.ident} | IATA: {a.iata_code || '-'}</div>
              {a.location?.coordinates && <Small>Lon/Lat: {a.location.coordinates.join(', ')}</Small>}
            </Card>
          ))}
        </Grid>
        {data.meta && <Pagination page={data.meta.page||1} limit={data.meta.limit||limit} total={data.meta.total||0} onPageChange={setPage} />}
      </>}
    </div>
  )
}
