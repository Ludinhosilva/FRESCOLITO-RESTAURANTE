import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'
import useLenis from './hooks/useLenis'

const Home = lazy(() => import('./pages/Home'))
const Menu = lazy(() => import('./pages/Menu'))
const About = lazy(() => import('./pages/About'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Contact = lazy(() => import('./pages/Contact'))
const Reservations = lazy(() => import('./pages/Reservations'))

function Page({ children }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

export default function App() {
  useLenis()
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/menu" element={<Page><Menu /></Page>} />
          <Route path="/nosotros" element={<Page><About /></Page>} />
          <Route path="/galeria" element={<Page><Gallery /></Page>} />
          <Route path="/contacto" element={<Page><Contact /></Page>} />
          <Route path="/reservas" element={<Page><Reservations /></Page>} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
