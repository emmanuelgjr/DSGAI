import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import RiskGrid from './pages/RiskGrid'
import RiskDetail from './pages/RiskDetail'
import AttackPaths from './pages/AttackPaths'
import About from './pages/About'

export default function App() {
  return (
    <div className="min-h-screen bg-owasp-dark text-owasp-text">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/risks" element={<RiskGrid />} />
          <Route path="/risks/:id" element={<RiskDetail />} />
          <Route path="/attack-paths" element={<AttackPaths />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
