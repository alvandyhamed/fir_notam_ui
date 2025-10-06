import React from 'react'
import { api } from '../api/client'
import { Card, Grid, Row, Small } from '../styles'

export default function FIRs() {
  const [country, setCountry] = React.useState('')
  const [name, setName] = React.useState('')
  const [code, setCode] = React.useState('')
  const [data, setData] = React.useState<any>(null)
  const [err, setErr] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)

  async function run() {
    setLoading(true); setErr('')
    try {
      const res = await api.fir_list({ country, fir_name: name, fir_code: code })
      setData(res)
    } catch(e:any) { setErr(e.message || 'Request failed') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <h2>FIRs</h2>
      <Row>
        <input placeholder="country (name or ISO)" value={country} onChange={e=>setCountry(e.target.value)} />
        <input placeholder="FIR name" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="FIR ICAO code (e.g., OIIX)" value={code} onChange={e=>setCode(e.target.value)} />
        <button onClick={run}>Search</button>
      </Row>
      {loading && <p>Loading…</p>}
      {err && <Card><b>Error</b><pre style={{whiteSpace:'pre-wrap'}}>{err}</pre></Card>}
      {data && <>
        <Small>Total: {data.meta?.total ?? data.items?.length ?? 0}</Small>
        <Grid>
          {(data.items||[]).map((f:any, i:number)=>(
            <Card key={i}>
              <b>{f.fir_name}</b>
              <div>Code: {f.fir_code}</div>
              <Small>{f.country}</Small>
            </Card>
          ))}
        </Grid>
      </>}
    </div>
  )
}
