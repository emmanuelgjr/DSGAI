import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import RiskGrid from './pages/RiskGrid'
import RiskDetail from './pages/RiskDetail'
import AttackPaths from './pages/AttackPaths'
import Diagrams from './pages/Diagrams'
import Assessment from './pages/Assessment'
import Checklists from './pages/Checklists'
import ThreatModels from './pages/ThreatModels'
import ADRs from './pages/ADRs'
import Playbooks from './pages/Playbooks'
import PolicyGenerator from './pages/PolicyGenerator'
import About from './pages/About'

export default function App() {
  return (
    <div className="min-h-screen bg-owasp-dark text-owasp-text transition-colors duration-200">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/risks" element={<RiskGrid />} />
          <Route path="/risks/:id" element={<RiskDetail />} />
          <Route path="/attack-paths" element={<AttackPaths />} />
          <Route path="/diagrams" element={<Diagrams />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/checklists" element={<Checklists />} />
          <Route path="/threat-models" element={<ThreatModels />} />
          <Route path="/adrs" element={<ADRs />} />
          <Route path="/playbooks" element={<Playbooks />} />
          <Route path="/policy-generator" element={<PolicyGenerator />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
