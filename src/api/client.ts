// src/api/client.ts
import { buildCanonical, epochSeconds, hmacSha256Base64, sha256Hex, sortedQueryString, uuid } from './signing'

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/,'')
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID
const KEY_VERSION = import.meta.env.VITE_KEY_VERSION
const SECRET_V1 = import.meta.env.VITE_SECRET_V1 || ''        // DEV ONLY
const DATE_MODE = import.meta.env.VITE_DATE_HEADER || 'epoch' // 'epoch' یا 'rfc3339'

function toDateHeader(epoch: string): string {
  return DATE_MODE === 'rfc3339' ? new Date(Number(epoch) * 1000).toISOString() : epoch
}

export async function signedFetch(
  pathname: string,
  options: { method?: string; query?: Record<string, any>; body?: any; area?: string } = {}
) {
  const method = (options.method || 'GET').toUpperCase()
  const query = sortedQueryString(options.query || {})
  const url   = query ? API_BASE + pathname + '?' + query : API_BASE + pathname

  const bodyStr = options.body ? JSON.stringify(options.body) : ''
  const bodySha = await sha256Hex(bodyStr || '')

  // 🧊 یک‌بار تولید و فریز کن؛ همین مقدار باید در canonical و هدر یکی باشد
  const xDateEpoch = epochSeconds()   // ← فقط epoch؛ اگر RFC3339 لازم داری، تبدیل هنگام هدر انجام می‌شود
  const xNonce     = uuid()

  const canonical = buildCanonical({
    method,
    path: pathname,
    query,                 // همینی که برای URL استفاده شد
    bodySha256Hex: bodySha,
    epochSeconds: xDateEpoch, // ← همینی که بالا ساختی
    nonce: xNonce,
    keyVersion: KEY_VERSION,
  })

  const secret = KEY_VERSION === 'v1' ? SECRET_V1 : ''
  if (!secret) throw new Error('Missing HMAC secret for key version v1. Set VITE_SECRET_V1 in your .env')

  const signature = await hmacSha256Base64(secret, canonical)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Client-Id' : CLIENT_ID,
    'X-Key-Version': KEY_VERSION,
    'X-Date'      : toDateHeader(xDateEpoch), // ← از همون xDateEpoch ساخته می‌شود
    'X-Nonce'     : xNonce,
    'X-Signature' : signature,
  }

  // ---- LOG: درخواست (بدون لو دادن سِکرِت)
  console.groupCollapsed(`%c[REQ] ${method} ${url}`, 'color:#0bf')
  console.log('canonical:', canonical.replace(/\n/g,'\\n'))
  console.log('headers:', { ...headers, 'X-Signature': headers['X-Signature'].slice(0,4)+'…'+headers['X-Signature'].slice(-4) })
  console.groupEnd()

  try {
    const res = await fetch(url, { method, headers, body: bodyStr || undefined })

    // ✅ روی خطا هم متن ریسپانس را لاگ/برگردان
    const contentType = res.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')

    if (!res.ok) {
      const text = await res.text().catch(() => '') // متن خام خطا
      console.groupCollapsed(`%c[ERR] ${method} ${url} • ${res.status}`, 'color:#f55;font-weight:700')
      console.log('status:', res.status)
      console.log('response headers:', Object.fromEntries(res.headers.entries()))
      console.log('response body:', text || '(empty)')
      console.groupEnd()

      const err = new Error(`HTTP ${res.status}: ${text || res.statusText}`)
      ;(err as any).status = res.status
      ;(err as any).responseText = text
      throw err
    }

    // OK
    const data = isJson ? await res.json() : await res.text()
    console.groupCollapsed(`%c[RES] ${method} ${url} • ${res.status}`, 'color:#2a2;font-weight:600')
    console.log('response headers:', Object.fromEntries(res.headers.entries()))
    console.log('body preview:', isJson ? data : String(data).slice(0,300))
    console.groupEnd()
    return data

  } catch (e) {
    // اگر Failed to fetch بود (CORS/شبکه)، لاگ مفصل
    console.groupCollapsed(`%c[NET] ${method} ${url}`, 'color:#f90;font-weight:700')
    console.error(e)
    console.groupEnd()
    throw e
  }
}

export const api = {
  airports_list: (params: { q?: string; ICAO?: string; IATA?: string; country?: string; type?: string; page?: number; limit?: number }) =>
    signedFetch('/airports_list', { method: 'GET', query: params, area: 'airports' }),

  countries_find: (params: { q?: string; page?: number; limit?: number }) =>
    signedFetch('/countries_find', { method: 'GET', query: params, area: 'countries' }),

  fir_list: (params: { country?: string; fir_name?: string; fir_code?: string }) =>
    signedFetch('/fir_list', { method: 'GET', query: params, area: 'firs' }),

  regions: (params: { q?: string; country?: string; page?: number; limit?: number }) =>
    signedFetch('/regions', { method: 'GET', query: params, area: 'regions' }),

  wxMetar: (params: { icao: string; hours?: number }) =>
    signedFetch('/wx/metar', { method: 'GET', query: params, area: 'metar' }),

  wxTaf: (params: { icao: string; hours?: number }) =>
    signedFetch('/wx/taf', { method: 'GET', query: params, area: 'taf' }),
}