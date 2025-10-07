import React from 'react'
import { api } from '../api/client'
import { Card, Grid, Row, Small } from '../styles'
import Pagination from '../components/Pagination'

export default function Countries() {
  const [q, setQ] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(20)
  const [data, setData] = React.useState<any>(null)
  const [err, setErr] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)

  async function run() {
    setLoading(true); setErr('')
    try {
      const res = await api.countries_find({ q, page, limit })
      setData(res)
    } catch(e:any) { setErr(e.message || 'Request failed') }
    finally { setLoading(false) }
  }

  React.useEffect(()=>{ run() }, [page, limit])

  return (
    <div>
      <h2>Countries</h2>
      <Row>
        <input placeholder="search…" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={()=>{ setPage(1); run() }}>Search</button>
        <select value={limit} onChange={e=>setLimit(parseInt(e.target.value))}>
          {[10,20,50,100].map(n=><option key={n} value={n}>{n}/page</option>)}
        </select>
      </Row>
      {loading && <p>Loading…</p>}
      {err && <Card><b>Error</b><pre style={{whiteSpace:'pre-wrap'}}>{err}</pre></Card>}
      {data && <>
        <Small>Total: {data.meta?.total ?? data.items?.length ?? 0}</Small>
        <Grid>
          {(data.items||[]).map((c:any, i:number)=>(
            <Card key={i}>
              <b>{c.name}</b>
              <div>Code: {c.code} • Continent: {c.continent}</div>
              <Small>{c.keywords}</Small>
            </Card>
          ))}
        </Grid>
        {data.meta && <Pagination page={data.meta.page||1} limit={data.meta.limit||limit} total={data.meta.total||0} onPageChange={setPage} />}
      </>}
    </div>
  )
}
