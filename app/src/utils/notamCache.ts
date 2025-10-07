const KEY = 'notamCache:v1'

type Entry = { id: string, item: any, ts: number }
type MapType = Record<string, Entry>

function load(): MapType {
  try { return JSON.parse(sessionStorage.getItem(KEY) || '{}') } catch { return {} }
}
function save(map: MapType) { try { sessionStorage.setItem(KEY, JSON.stringify(map)) } catch {} }

export function putNotam(id: string, item: any) {
  const m = load(); m[id] = { id, item, ts: Date.now() }; save(m)
}
export function getNotam(id: string): any | null {
  const m = load(); return m[id]?.item || null
}
export function clearOld(maxAgeMs = 24*3600*1000) {
  const m = load(); const now = Date.now()
  let changed = false
  for (const k of Object.keys(m)) if (now - (m[k]?.ts||0) > maxAgeMs) { delete m[k]; changed = true }
  if (changed) save(m)
}