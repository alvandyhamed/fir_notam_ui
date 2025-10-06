import React from 'react'
import { api } from '../api/client'
import { Card, Grid, Row } from '../styles'

export default function Weather() {
  const [icao, setIcao] = React.useState('OIII')
  const [hours, setHours] = React.useState<number|undefined>(2)
  const [metar, setMetar] = React.useState<any[]>([])
  const [taf, setTaf] = React.useState<any[]>([])
  const [err, setErr] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)

  async function run() {
    setLoading(true); setErr('')
    try {
      const [m, t] = await Promise.all([
        api.wxMetar({ icao, hours } as any),
        api.wxTaf({ icao, hours: 24 } as any),
      ])
      setMetar(m||[])
      setTaf(t||[])
    } catch(e:any) { 
      const msg = (e?.message || 'Request failed') + (e?.hint ? ` — ${e.hint}` : '')
      
      setErr(msg) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <h2>Weather</h2>
      <Row>
        <input placeholder="ICAO (e.g., OIII, KJFK)" value={icao} onChange={e=>setIcao(e.target.value.toUpperCase())} />
        <input type="number" placeholder="METAR hours" value={hours ?? ''} onChange={e=>setHours(e.target.value ? parseInt(e.target.value) : undefined)} />
        <button onClick={run}>Fetch</button>
      </Row>

      {loading && <p>Loading…</p>}
      {err && <Card><b>Error</b><pre style={{whiteSpace:'pre-wrap'}}>{err}</pre></Card>}

      <h3>METAR</h3>
      <Grid>
        {metar.map((m:any, i:number)=>(
          <Card key={i}>
            <b>{m.icaoId} — {m.name}</b>
            <div>{m.rawOb}</div>
            <small>Report: {m.reportTime} • Temp: {m.temp}°C • Wind: {m.wdir}/{m.wspd} kt</small>
          </Card>
        ))}
      </Grid>

      <h3>TAF</h3>
      <Grid>
        {taf.map((t:any, i:number)=>(
          <Card key={i}>
            <b>{t.icaoId} — {t.name}</b>
            <div>{t.rawTAF}</div>
            <small>Issue: {t.issueTime}</small>
          </Card>
        ))}
      </Grid>
    </div>
  )
}
