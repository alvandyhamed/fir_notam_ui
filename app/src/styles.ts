import styled, { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji','Segoe UI Emoji', 'Segoe UI Symbol'; }
  a { text-decoration: none; color: inherit; }
  input, select, button { font: inherit; }
`

export const Topbar = styled.header`
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 1px solid #4443;
  position: sticky; top: 0; backdrop-filter: blur(8px);
`

export const Container = styled.main`
  max-width: 1100px; margin: 0 auto; padding: 16px;
`

export const Nav = styled.nav`
  display: flex; gap: 12px;
  a { padding: 6px 10px; border-radius: 10px; }
  a.active { background: #6b7280; color: white; }
`

export const Card = styled.div`
  border: 1px solid #4443; border-radius: 14px; padding: 14px; margin: 10px 0; 
  box-shadow: 0 2px 8px #0001;
  background: #fff0;
`

export const Grid = styled.div`
  display: grid; gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`

export const Row = styled.div`
  display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin: 8px 0;
  > * { min-width: 160px; }
`

export const Small = styled.small`
  opacity: .75;
`
