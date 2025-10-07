import React from 'react'

type Props = {
  page: number
  limit: number
  total: number
  onPageChange: (p: number) => void
}

export default function Pagination({ page, limit, total, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)))
  return (
    <div style={{display:'flex', gap:8, alignItems:'center', marginTop:8}}>
      <button onClick={() => onPageChange(1)} disabled={page<=1}>« First</button>
      <button onClick={() => onPageChange(page-1)} disabled={page<=1}>‹ Prev</button>
      <span>Page {page} / {totalPages}</span>
      <button onClick={() => onPageChange(page+1)} disabled={page>=totalPages}>Next ›</button>
      <button onClick={() => onPageChange(totalPages)} disabled={page>=totalPages}>Last »</button>
    </div>
  )
}
