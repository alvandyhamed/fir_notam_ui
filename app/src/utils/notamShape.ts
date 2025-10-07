// src/utils/notamShape.ts
export type NormalizedNotam = {
    featureType: string
    geometryType: string
    geometries: any[]
    core: any
    notam: any
    translationText?: string
  }
  
  export function normalizeNotamFeature(f: any): NormalizedNotam {
    // properties می‌تونه آبجکت یا آرایه باشه
    const props = Array.isArray(f?.properties) ? f?.properties?.[0] : f?.properties
    const core = props?.coreNOTAMData || props?.coreNotamData || props?.coreNOTAMDataType || {}
  
    // notam
    const notam = core?.notam || core?.NOTAM || {}
  
    // ترجمه: می‌تونه آرایه، آبجکت با items، یا کلید دیگری باشه
    const nt = core?.notamTranslation || core?.notam_translation || core?.NOTAMTranslation
    let translationText: string | undefined
    if (Array.isArray(nt)) {
      translationText = nt[0]?.formattedText
    } else if (nt?.items && Array.isArray(nt.items)) {
      translationText = nt.items[0]?.formattedText
    } else if (typeof nt?.formattedText === 'string') {
      translationText = nt.formattedText
    }
  
    // geometry: آبجکت (معمولاً GeometryCollection) یا آرایه
    const g = f?.geometry
    let geometries: any[] = []
    let geometryType = ''
    if (Array.isArray(g)) {
      geometryType = g[0]?.type || ''
      geometries = g
    } else if (g && typeof g === 'object') {
      geometryType = g.type || ''
      if (g.type === 'GeometryCollection' && Array.isArray(g.geometries)) {
        geometries = g.geometries
      } else {
        geometries = [g]
      }
    }
  
    return {
      featureType: f?.type || '',
      geometryType,
      geometries,
      core,
      notam,
      translationText,
    }
  }