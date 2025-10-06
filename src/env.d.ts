/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_BASE: string
  readonly VITE_CLIENT_ID: string
  readonly VITE_KEY_VERSION: string
  readonly VITE_SECRET_V1?: string
  readonly VITE_CANON_INCLUDE_EMPTY_QUERY?: string
  readonly VITE_DATE_HEADER?: "epoch" | "rfc3339"
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
