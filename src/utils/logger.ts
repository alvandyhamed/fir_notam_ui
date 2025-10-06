export type LogCtx = {
    area: string
    url: string
    method: string
    query?: Record<string, any>
    headers?: Record<string, string>
    body?: any
    canonical?: string
    startedAt?: number
    elapsedMs?: number
    status?: number
    responseType?: string
    error?: any
  }
  
  const MASK = (s?: string) =>
    !s ? s : s.length <= 8 ? '****' : s.slice(0, 4) + '…' + s.slice(-4)
  
  export function logStart(ctx: LogCtx) {
    ctx.startedAt = performance.now()
    // Mask security headers before printing
    const safeHeaders = { ...(ctx.headers||{}) }
    if (safeHeaders['X-Signature']) safeHeaders['X-Signature'] = MASK(safeHeaders['X-Signature'])
    if (safeHeaders['X-Nonce']) safeHeaders['X-Nonce'] = MASK(safeHeaders['X-Nonce'])
    console.groupCollapsed(
      `%c[REQ] ${ctx.method} ${ctx.url}`,
      'color:#0bf;font-weight:600'
    )
    console.log('area:', ctx.area)
    console.log('url:', ctx.url)
    console.log('method:', ctx.method)
    if (ctx.query) console.log('query:', ctx.query)
    if (ctx.body) console.log('body:', ctx.body)
    if (ctx.canonical) console.log('canonical:', ctx.canonical.replace(/\n/g, '\\n'))
    console.log('headers:', safeHeaders)
    console.groupEnd()
  }
  
  export function logEnd(ctx: LogCtx) {
    ctx.elapsedMs = Math.round((performance.now() - (ctx.startedAt || performance.now())) * 100) / 100
    const tag = ctx.error ? '[ERR]' : '[RES]'
    const color = ctx.error ? 'color:#f55;font-weight:700' : 'color:#2a2;font-weight:600'
    console.groupCollapsed(
      `%c${tag} ${ctx.method} ${ctx.url} • ${ctx.elapsedMs}ms`,
      color
    )
    if (ctx.status) console.log('status:', ctx.status)
    if (ctx.responseType) console.log('responseType:', ctx.responseType)
    if (ctx.error) {
      console.error('error:', ctx.error)
      // Helpful hint for classic CORS/network case
      if (ctx.error?.name === 'TypeError' && String(ctx.error?.message || '').includes('Failed to fetch')) {
        console.warn('Hint: This is usually CORS or network. Check API_BASE, port, HTTPS vs HTTP, and CORS allowlist for http://localhost:5174')
      }
    }
    console.groupEnd()
  }