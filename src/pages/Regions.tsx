import React from 'react'
import { api } from '../api/client'
import { Card, Grid, Row, Small } from '../styles'
import Pagination from '../components/Pagination'

export default function Regions() {
  const [q, setQ] = React.useState('')
  const [country, setCountry] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(50)
  const [data, setData] = React.useState<any>(null)
  const [err, setErr] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)

  async function run() {
    setLoading(true); setErr('')
    try {
      const res = await api.regions({ q, country, page, limit })
      setData(res)
    } catch(e:any) { setErr(e.message || 'Request failed') }
    finally { setLoading(false) }
  }

  React.useEffect(()=>{ run() }, [page, limit])

  return (
    <div>
      <h2>Regions</h2>
      <Row>
        <input placeholder="q (code/local_code/name)" value={q} onChange={e=>setQ(e.target.value)} />
        <input placeholder="country (ISO)" value={country} onChange={e=>setCountry(e.target.value)} />
        <button onClick={()=>{ setPage(1); run() }}>Search</button>
        <select value={limit} onChange={e=>setLimit(parseInt(e.target.value))}>
          {[10,20,50,100,200,500].map(n=><option key={n} value={n}>{n}/page</option>)}
        </select>
      </Row>
      {loading && <p>Loading…</p>}
      {err && <Card><b>Error</b><pre style={{whiteSpace:'pre-wrap'}}>{err}</pre></Card>}
      {data && <>
        <Small>Total: {data.meta?.total ?? data.items?.length ?? 0}</Small>
        <Grid>
          {(data.items||[]).map((r:any, i:number)=>(
            <Card key={i}>
              <b>{r.name}</b>
              <div>Code: {r.code} • Local: {r.local_code || '-'}</div>
              <Small>{r.iso_country} • {r.continent}</Small>
            </Card>
          ))}
        </Grid>
        {data.meta && <Pagination page={data.meta.page||1} limit={data.meta.limit||limit} total={data.meta.total||0} onPageChange={setPage} />}
      </>}
    </div>
  )
}
