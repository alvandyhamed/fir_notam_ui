import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import App from './App'
import Airports from './pages/Airports'
import Countries from './pages/Countries'
import FIRs from './pages/FIRs'
import Regions from './pages/Regions'
import Weather from './pages/Weather'
import { GlobalStyle, Topbar, Container, Nav } from './styles'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalStyle />
    <BrowserRouter>
      <Topbar>
        <h1>SepTaf Client</h1>
        <Nav>
          <NavLink to="/" end>Airports</NavLink>
          <NavLink to="/countries">Countries</NavLink>
          <NavLink to="/firs">FIRs</NavLink>
          <NavLink to="/regions">Regions</NavLink>
          <NavLink to="/wx">Weather</NavLink>
        </Nav>
      </Topbar>
      <Container>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Airports />} />
            <Route path="countries" element={<Countries />} />
            <Route path="firs" element={<FIRs />} />
            <Route path="regions" element={<Regions />} />
            <Route path="wx" element={<Weather />} />
          </Route>
        </Routes>
      </Container>
    </BrowserRouter>
  </React.StrictMode>
)
