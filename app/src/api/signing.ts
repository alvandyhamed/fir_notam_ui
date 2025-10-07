// src/api/signing.ts
import CryptoJS from 'crypto-js'


// ----- Types -----
export type CanonParts = {
  method: string                 // e.g. GET
  path: string                   // e.g. /airportslist  (دقیقاً همان چیزی که سرور انتظار دارد)
  query: string                  // sorted & RFC3986-encoded querystring, e.g. "limit=20&page=1&q=hamed"
  bodySha256Hex: string          // SHA-256(body) in lowercase hex; for empty body use hash of empty string
  epochSeconds: string           // e.g. "1759243458" (یا RFC3339 اگر در client تبدیل می‌کنی)
  nonce: string                  // UUID v4
  keyVersion: string             // e.g. "v1"  ← طبق نمونه‌ی شما بخشی از canonical است
}

// ----- Encoding helpers (RFC3986) -----
export function encodeRFC3986(str: string) {
  // تفاوت با encodeURIComponent: ! ' ( ) * هم درصد-کد می‌شوند تا با سرور هم‌خوان باشد
  return encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
}

// Build a stable query string: sort by key (asc) and encode RFC3986
export function sortedQueryString(params: Record<string, any>): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
  return entries.map(([k, v]) => `${encodeRFC3986(k)}=${encodeRFC3986(String(v))}`).join('&')
}

// ----- Hash -----
// export function sha256Hex(input: string): Promise<string> {
//   const data = new TextEncoder().encode(input)
//   return crypto.subtle.digest('SHA-256', data).then(buf => {
//     const bytes = new Uint8Array(buf)
//     return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
//   })
// }

function getSubtle(): SubtleCrypto | null {
  try {
    // @ts-ignore
    const c = typeof crypto !== 'undefined' ? crypto : (window as any).crypto
    return c && c.subtle ? c.subtle : null
  } catch { return null }
}

export async function sha256Hex(input: string): Promise<string> {
  const subtle = getSubtle()
  if (subtle) {
    const data = new TextEncoder().encode(input)
    const buf = await subtle.digest('SHA-256', data)
    const bytes = new Uint8Array(buf)
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  // Fallback با CryptoJS
  const wordArray = CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(input))
  return wordArray.toString(CryptoJS.enc.Hex)
}

// ----- Base64 helpers (accept base64url & fix padding) -----
function normalizeBase64(b64: string): string {
  const s = (b64 || '').trim().replace(/\s+/g, '')
  const urlFixed = s.replace(/-/g, '+').replace(/_/g, '/')
  // pad to multiple of 4
  return urlFixed + '==='.slice((urlFixed.length + 3) % 4)
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(normalizeBase64(b64))
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

// ----- HMAC -----
export async function hmacSha256Base64(secretB64: string, message: string): Promise<string> {
  const subtle = getSubtle()
  const normalized = (secretB64 || '').trim().replace(/-/g,'+').replace(/_/g,'/')
  const padded = normalized + '==='.slice((normalized.length + 3) % 4)

  if (subtle) {
    const bin = atob(padded)
    const keyRaw = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) keyRaw[i] = bin.charCodeAt(i)
    const key = await subtle.importKey('raw', keyRaw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const sig = await subtle.sign('HMAC', key, new TextEncoder().encode(message))
    return btoa(String.fromCharCode(...new Uint8Array(sig)))
  }

  // Fallback با CryptoJS
  const keyWA = CryptoJS.enc.Base64.parse(padded)
  const msgWA = CryptoJS.enc.Utf8.parse(message)
  const mac = CryptoJS.HmacSHA256(msgWA, keyWA)
  return CryptoJS.enc.Base64.stringify(mac)
}

// ----- Canonical builder -----
// دقیقاً طبق نمونه‌ی شما: 7 خط، و در انتها newline ندارد.
export function buildCanonical(p: CanonParts): string {
  return [
    p.method.toUpperCase(),
    p.path,
    p.query,            // اگر query خالی است، همین رشته‌ی خالی در این خط قرار می‌گیرد
    p.bodySha256Hex,
    p.epochSeconds,
    p.nonce,
    p.keyVersion        // "v1"
  ].join('\n')          // ⚠️ بدون '\n' نهایی
}

// ----- Time & UUID helpers -----
export function epochSeconds(): string {
  return Math.floor(Date.now() / 1000).toString()
}

// UUID v4: اولویت با crypto.randomUUID؛ در غیر این‌صورت fallback امن
export function uuid(): string {
  // @ts-ignore
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    // @ts-ignore
    return crypto.randomUUID()
  }
  // fallback: سعی کن از getRandomValues استفاده کنی
  // @ts-ignore
  const rng = (typeof crypto !== 'undefined' && crypto.getRandomValues)
    // @ts-ignore
    ? crypto.getRandomValues(new Uint8Array(16))
    : (() => {
        // خیلی بعید: اگر crypto نبود، dev-only fallback با Math.random
        const a = new Uint8Array(16)
        for (let i = 0; i < 16; i++) a[i] = (Math.random() * 256) | 0
        return a
      })()

  rng[6] = (rng[6] & 0x0f) | 0x40 // version 4
  rng[8] = (rng[8] & 0x3f) | 0x80 // variant 10

  const hex: string[] = []
  for (let i = 0; i < 256; ++i) hex.push((i + 256).toString(16).slice(1))
  return (
    hex[rng[0]] + hex[rng[1]] + hex[rng[2]] + hex[rng[3]] + '-' +
    hex[rng[4]] + hex[rng[5]] + '-' +
    hex[rng[6]] + hex[rng[7]] + '-' +
    hex[rng[8]] + hex[rng[9]] + '-' +
    hex[rng[10]] + hex[rng[11]] + hex[rng[12]] + hex[rng[13]] + hex[rng[14]] + hex[rng[15]]
  )
}