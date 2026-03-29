import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Network, ExternalLink } from 'lucide-react'
import { risks, categories } from '../data/risks'
import { useTheme } from '../components/ThemeContext'

// ---------------------------------------------------------------------------
// SVG Infrastructure Icons as React components
// ---------------------------------------------------------------------------

function CloudIcon({ x, y, size = 48, color = '#60a5fa' }) {
  return (
    <g transform={`translate(${x - size/2}, ${y - size/2})`}>
      <path d={`M${size*0.2} ${size*0.65} C${size*0.05} ${size*0.65} 0 ${size*0.55} 0 ${size*0.45} C0 ${size*0.32} ${size*0.12} ${size*0.22} ${size*0.27} ${size*0.22} C${size*0.3} ${size*0.1} ${size*0.42} ${size*0.02} ${size*0.55} ${size*0.02} C${size*0.7} ${size*0.02} ${size*0.82} ${size*0.12} ${size*0.85} ${size*0.27} C${size*0.97} ${size*0.3} ${size} ${size*0.38} ${size} ${size*0.48} C${size} ${size*0.58} ${size*0.92} ${size*0.65} ${size*0.82} ${size*0.65} Z`}
        fill="none" stroke={color} strokeWidth="2" />
    </g>
  )
}

function ServerIcon({ x, y, size = 40, color = '#a78bfa' }) {
  return (
    <g transform={`translate(${x - size/2}, ${y - size/2})`}>
      <rect x="2" y="2" width={size-4} height={size*0.35} rx="3" fill="none" stroke={color} strokeWidth="1.5" />
      <rect x="2" y={size*0.38} width={size-4} height={size*0.35} rx="3" fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={size*0.75} cy={size*0.19} r="2" fill={color} />
      <circle cx={size*0.75} cy={size*0.55} r="2" fill={color} />
      <line x1={size*0.15} y1={size*0.19} x2={size*0.55} y2={size*0.19} stroke={color} strokeWidth="1.5" />
      <line x1={size*0.15} y1={size*0.55} x2={size*0.55} y2={size*0.55} stroke={color} strokeWidth="1.5" />
    </g>
  )
}

function DatabaseIcon({ x, y, size = 40, color = '#2dd4bf' }) {
  return (
    <g transform={`translate(${x - size/2}, ${y - size/2})`}>
      <ellipse cx={size/2} cy={size*0.15} rx={size*0.42} ry={size*0.15} fill="none" stroke={color} strokeWidth="1.5" />
      <path d={`M${size*0.08} ${size*0.15} V${size*0.75}`} fill="none" stroke={color} strokeWidth="1.5" />
      <path d={`M${size*0.92} ${size*0.15} V${size*0.75}`} fill="none" stroke={color} strokeWidth="1.5" />
      <ellipse cx={size/2} cy={size*0.75} rx={size*0.42} ry={size*0.15} fill="none" stroke={color} strokeWidth="1.5" />
      <ellipse cx={size/2} cy={size*0.45} rx={size*0.42} ry={size*0.15} fill="none" stroke={color} strokeWidth="0.8" opacity="0.4" />
    </g>
  )
}

function FirewallIcon({ x, y, size = 40, color = '#f87171' }) {
  return (
    <g transform={`translate(${x - size/2}, ${y - size/2})`}>
      <rect x="2" y="2" width={size-4} height={size-4} rx="4" fill="none" stroke={color} strokeWidth="1.5" />
      <line x1={size*0.2} y1={size*0.5} x2={size*0.8} y2={size*0.5} stroke={color} strokeWidth="1.5" />
      <line x1={size*0.35} y1={size*0.3} x2={size*0.35} y2={size*0.7} stroke={color} strokeWidth="1.5" />
      <line x1={size*0.65} y1={size*0.3} x2={size*0.65} y2={size*0.7} stroke={color} strokeWidth="1.5" />
    </g>
  )
}

function RouterIcon({ x, y, size = 40, color = '#fb923c' }) {
  return (
    <g transform={`translate(${x - size/2}, ${y - size/2})`}>
      <circle cx={size/2} cy={size/2} r={size*0.4} fill="none" stroke={color} strokeWidth="1.5" />
      <line x1={size*0.2} y1={size/2} x2={size*0.8} y2={size/2} stroke={color} strokeWidth="1.5" />
      <line x1={size/2} y1={size*0.2} x2={size/2} y2={size*0.8} stroke={color} strokeWidth="1.5" />
      <circle cx={size/2} cy={size*0.2} r="3" fill={color} />
      <circle cx={size/2} cy={size*0.8} r="3" fill={color} />
      <circle cx={size*0.2} cy={size/2} r="3" fill={color} />
      <circle cx={size*0.8} cy={size/2} r="3" fill={color} />
    </g>
  )
}

function UserIcon({ x, y, size = 36, color = '#f87171' }) {
  return (
    <g transform={`translate(${x - size/2}, ${y - size/2})`}>
      <circle cx={size/2} cy={size*0.3} r={size*0.2} fill="none" stroke={color} strokeWidth="1.5" />
      <path d={`M${size*0.15} ${size*0.85} C${size*0.15} ${size*0.6} ${size*0.3} ${size*0.5} ${size/2} ${size*0.5} C${size*0.7} ${size*0.5} ${size*0.85} ${size*0.6} ${size*0.85} ${size*0.85}`} fill="none" stroke={color} strokeWidth="1.5" />
    </g>
  )
}

function AgentIcon({ x, y, size = 40, color = '#e879f9' }) {
  return (
    <g transform={`translate(${x - size/2}, ${y - size/2})`}>
      <rect x="4" y="4" width={size-8} height={size-8} rx="8" fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={size*0.35} cy={size*0.4} r="2.5" fill={color} />
      <circle cx={size*0.65} cy={size*0.4} r="2.5" fill={color} />
      <path d={`M${size*0.3} ${size*0.6} Q${size/2} ${size*0.75} ${size*0.7} ${size*0.6}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  )
}

function BrowserIcon({ x, y, size = 40, color = '#facc15' }) {
  return (
    <g transform={`translate(${x - size/2}, ${y - size/2})`}>
      <rect x="2" y="2" width={size-4} height={size-4} rx="4" fill="none" stroke={color} strokeWidth="1.5" />
      <line x1="2" y1={size*0.3} x2={size-2} y2={size*0.3} stroke={color} strokeWidth="1.5" />
      <circle cx={size*0.15} cy={size*0.17} r="2" fill={color} />
      <circle cx={size*0.27} cy={size*0.17} r="2" fill={color} />
      <circle cx={size*0.39} cy={size*0.17} r="2" fill={color} />
    </g>
  )
}

function LockIcon({ x, y, size = 36, color = '#4ade80' }) {
  return (
    <g transform={`translate(${x - size/2}, ${y - size/2})`}>
      <rect x={size*0.2} y={size*0.45} width={size*0.6} height={size*0.45} rx="3" fill="none" stroke={color} strokeWidth="1.5" />
      <path d={`M${size*0.3} ${size*0.45} V${size*0.3} C${size*0.3} ${size*0.1} ${size*0.7} ${size*0.1} ${size*0.7} ${size*0.3} V${size*0.45}`} fill="none" stroke={color} strokeWidth="1.5" />
    </g>
  )
}

function VectorDBIcon({ x, y, size = 40, color = '#2dd4bf' }) {
  return (
    <g transform={`translate(${x - size/2}, ${y - size/2})`}>
      <polygon points={`${size/2},${size*0.05} ${size*0.95},${size*0.3} ${size*0.95},${size*0.7} ${size/2},${size*0.95} ${size*0.05},${size*0.7} ${size*0.05},${size*0.3}`} fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={size/2} cy={size*0.35} r="2" fill={color} />
      <circle cx={size*0.35} cy={size*0.55} r="2" fill={color} />
      <circle cx={size*0.65} cy={size*0.55} r="2" fill={color} />
      <line x1={size/2} y1={size*0.35} x2={size*0.35} y2={size*0.55} stroke={color} strokeWidth="0.8" />
      <line x1={size/2} y1={size*0.35} x2={size*0.65} y2={size*0.55} stroke={color} strokeWidth="0.8" />
    </g>
  )
}

function DocumentIcon({ x, y, size = 36, color = '#fbbf24' }) {
  return (
    <g transform={`translate(${x - size/2}, ${y - size/2})`}>
      <path d={`M${size*0.2} ${size*0.05} H${size*0.6} L${size*0.8} ${size*0.25} V${size*0.95} H${size*0.2} Z`} fill="none" stroke={color} strokeWidth="1.5" />
      <path d={`M${size*0.6} ${size*0.05} V${size*0.25} H${size*0.8}`} fill="none" stroke={color} strokeWidth="1.5" />
      <line x1={size*0.3} y1={size*0.45} x2={size*0.7} y2={size*0.45} stroke={color} strokeWidth="1" opacity="0.6" />
      <line x1={size*0.3} y1={size*0.6} x2={size*0.7} y2={size*0.6} stroke={color} strokeWidth="1" opacity="0.6" />
      <line x1={size*0.3} y1={size*0.75} x2={size*0.55} y2={size*0.75} stroke={color} strokeWidth="1" opacity="0.6" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Icon renderer (with background circle)
// ---------------------------------------------------------------------------

const iconComponents = {
  cloud: CloudIcon,
  server: ServerIcon,
  database: DatabaseIcon,
  firewall: FirewallIcon,
  router: RouterIcon,
  user: UserIcon,
  agent: AgentIcon,
  browser: BrowserIcon,
  lock: LockIcon,
  vectordb: VectorDBIcon,
  document: DocumentIcon,
}

function RenderIcon({ icon, x, y, color }) {
  const Comp = iconComponents[icon]
  if (!Comp) return null
  return (
    <g>
      <circle cx={x} cy={y} r={22} className="node-bg" />
      <Comp x={x} y={y} color={color} />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Diagram configurations for all 21 risks
// ---------------------------------------------------------------------------

const diagramConfigs = {
  DSGAI01: {
    nodes: [
      { id: 'attacker', icon: 'user', label: 'Attacker', x: 77, y: 225, color: '#f87171' },
      { id: 'llm', icon: 'cloud', label: 'LLM / LoRA', x: 386, y: 90, color: '#60a5fa' },
      { id: 'training', icon: 'database', label: 'Training Data', x: 180, y: 90, color: '#2dd4bf' },
      { id: 'vdb', icon: 'vectordb', label: 'Vector Store', x: 386, y: 225, color: '#2dd4bf' },
      { id: 'rag', icon: 'server', label: 'RAG Pipeline', x: 386, y: 360, color: '#a78bfa' },
      { id: 'docs', icon: 'document', label: 'Corp Docs', x: 180, y: 360, color: '#fbbf24' },
      { id: 'output', icon: 'document', label: 'PII / Secrets', x: 643, y: 225, color: '#f87171' },
      { id: 'logs', icon: 'server', label: 'Logs / Traces', x: 643, y: 360, color: '#a78bfa' },
      { id: 'victim', icon: 'user', label: 'Data Subject', x: 823, y: 225, color: '#60a5fa' },
    ],
    edges: [
      { from: 'attacker', to: 'llm', color: '#f87171', animated: true, label: 'Extract', labelPos: 0.3 },
      { from: 'training', to: 'llm', color: '#2dd4bf', animated: true, label: 'Memorized' },
      { from: 'attacker', to: 'vdb', color: '#f87171', animated: true, label: 'Semantic probe', labelPos: 0.7 },
      { from: 'docs', to: 'rag', color: '#fbbf24', animated: true, label: 'Overshared' },
      { from: 'rag', to: 'vdb', color: '#a78bfa', animated: true, label: 'No ACL' },
      { from: 'llm', to: 'output', color: '#f87171', animated: true, label: 'Verbatim leak', labelPos: 0.3 },
      { from: 'vdb', to: 'output', color: '#f87171', animated: true, label: 'Retrieved PII', labelPos: 0.7 },
      { from: 'output', to: 'logs', color: '#f87171', animated: true, label: 'Logged' },
    ],
    dangerZone: { x: 540, y: 146, width: 206, height: 180, label: 'Sensitive Output' },
  },

  DSGAI02: {
    nodes: [
      { id: 'operator', icon: 'user', label: 'Operator', x: 77, y: 90, color: '#60a5fa' },
      { id: 'agent', icon: 'agent', label: 'Orchestrator', x: 257, y: 90, color: '#e879f9' },
      { id: 'subagent', icon: 'agent', label: 'Sub-Agent', x: 489, y: 90, color: '#e879f9' },
      { id: 'token', icon: 'lock', label: 'OAuth Token', x: 257, y: 225, color: '#facc15' },
      { id: 'vault', icon: 'server', label: 'Secret Store', x: 77, y: 225, color: '#a78bfa' },
      { id: 'datatier', icon: 'database', label: 'Data Tier', x: 720, y: 90, color: '#2dd4bf' },
      { id: 'poison', icon: 'document', label: 'Injected Doc', x: 489, y: 225, color: '#f87171' },
      { id: 'nhi', icon: 'lock', label: 'Stale Keys', x: 489, y: 360, color: '#f87171' },
      { id: 'exfil', icon: 'user', label: 'Attacker', x: 720, y: 225, color: '#f87171' },
    ],
    edges: [
      { from: 'operator', to: 'agent', color: '#60a5fa', animated: true, label: 'Full OAuth', labelPos: 0.3 },
      { from: 'vault', to: 'token', color: '#a78bfa', animated: true, label: 'Long-lived' },
      { from: 'token', to: 'agent', color: '#facc15', animated: true, label: 'Over-privd', labelPos: 0.7 },
      { from: 'agent', to: 'subagent', color: '#e879f9', animated: true, label: 'Inherits token' },
      { from: 'poison', to: 'subagent', color: '#f87171', animated: true, label: 'Prompt inject', labelPos: 0.7 },
      { from: 'subagent', to: 'datatier', color: '#f87171', animated: true, label: 'Full access', labelPos: 0.3 },
      { from: 'datatier', to: 'exfil', color: '#f87171', animated: true, label: 'Exfiltrate', labelPos: 0.3 },
      { from: 'nhi', to: 'exfil', color: '#f87171', animated: true, label: 'Orphan creds', labelPos: 0.7 },
    ],
    dangerZone: { x: 399, y: 146, width: 193, height: 158, label: 'Token Inheritance' },
  },

  DSGAI03: {
    nodes: [
      { id: 'employee', icon: 'user', label: 'Employee', x: 77, y: 225, color: '#60a5fa' },
      { id: 'corpdata', icon: 'database', label: 'Corp Data', x: 77, y: 360, color: '#2dd4bf' },
      { id: 'casb', icon: 'firewall', label: 'CASB / DLP', x: 257, y: 225, color: '#f87171' },
      { id: 'chatgpt', icon: 'cloud', label: 'ChatGPT etc.', x: 489, y: 90, color: '#60a5fa' },
      { id: 'saasai', icon: 'cloud', label: 'SaaS + AI', x: 489, y: 225, color: '#60a5fa' },
      { id: 'internal', icon: 'server', label: 'Ungoverned Tool', x: 489, y: 360, color: '#a78bfa' },
      { id: 'vendor', icon: 'server', label: 'Vendor Storage', x: 720, y: 90, color: '#a78bfa' },
      { id: 'train', icon: 'document', label: 'Trains on Data', x: 720, y: 225, color: '#f87171' },
      { id: 'breach', icon: 'user', label: 'Breach / Leak', x: 823, y: 360, color: '#f87171' },
    ],
    edges: [
      { from: 'employee', to: 'chatgpt', color: '#f87171', animated: true, label: 'Pastes PII', labelPos: 0.3 },
      { from: 'corpdata', to: 'employee', color: '#2dd4bf', animated: true, label: 'Copies' },
      { from: 'employee', to: 'saasai', color: '#f87171', animated: true, label: 'Bypasses CASB', labelPos: 0.5 },
      { from: 'employee', to: 'internal', color: '#f87171', animated: true, label: 'No review', labelPos: 0.7 },
      { from: 'chatgpt', to: 'vendor', color: '#f87171', animated: true, label: 'Retained' },
      { from: 'saasai', to: 'train', color: '#f87171', animated: true, label: 'Used to train' },
      { from: 'vendor', to: 'breach', color: '#f87171', animated: true, label: 'Vendor breach' },
    ],
    dangerZone: { x: 386, y: 34, width: 411, height: 146, label: 'No Governance' },
  },

  DSGAI04: {
    nodes: [
      { id: 'attacker', icon: 'user', label: 'Attacker', x: 77, y: 90, color: '#f87171' },
      { id: 'hub', icon: 'cloud', label: 'Model Hub', x: 257, y: 90, color: '#60a5fa' },
      { id: 'artifact', icon: 'document', label: 'Pickle / GGUF', x: 450, y: 90, color: '#f87171' },
      { id: 'registry', icon: 'server', label: 'Model Registry', x: 643, y: 90, color: '#a78bfa' },
      { id: 'pipeline', icon: 'server', label: 'ML Pipeline', x: 450, y: 225, color: '#a78bfa' },
      { id: 'ragcorpus', icon: 'database', label: 'RAG Corpus', x: 257, y: 360, color: '#2dd4bf' },
      { id: 'vdb', icon: 'vectordb', label: 'Vector Store', x: 450, y: 360, color: '#2dd4bf' },
      { id: 'model', icon: 'cloud', label: 'Prod Model', x: 720, y: 225, color: '#60a5fa' },
      { id: 'victim', icon: 'user', label: 'Users', x: 823, y: 360, color: '#60a5fa' },
    ],
    edges: [
      { from: 'attacker', to: 'hub', color: '#f87171', animated: true, label: 'Upload bad', labelPos: 0.3 },
      { from: 'hub', to: 'artifact', color: '#f87171', animated: true, label: 'Pickle RCE' },
      { from: 'artifact', to: 'registry', color: '#f87171', animated: true, label: 'No sig check' },
      { from: 'attacker', to: 'ragcorpus', color: '#f87171', animated: true, label: 'Inject docs', labelPos: 0.7 },
      { from: 'ragcorpus', to: 'vdb', color: '#f87171', animated: true, label: 'Embed poison' },
      { from: 'registry', to: 'pipeline', color: '#a78bfa', animated: true, label: 'Load' },
      { from: 'pipeline', to: 'model', color: '#a78bfa', animated: true, label: 'Deploy', labelPos: 0.3 },
      { from: 'vdb', to: 'model', color: '#f87171', animated: true, label: 'Poison context', labelPos: 0.7 },
      { from: 'model', to: 'victim', color: '#f87171', animated: true, label: 'Backdoor out' },
    ],
    dangerZone: { x: 154, y: 34, width: 399, height: 124, label: 'Supply Chain Attack' },
  },

  DSGAI05: {
    nodes: [
      { id: 'attacker', icon: 'user', label: 'Attacker', x: 77, y: 135, color: '#f87171' },
      { id: 'input', icon: 'document', label: '../../etc/cron', x: 257, y: 90, color: '#f87171' },
      { id: 'schema', icon: 'server', label: 'Schema Check', x: 450, y: 90, color: '#a78bfa' },
      { id: 'snapshot', icon: 'document', label: 'Qdrant Snap', x: 257, y: 225, color: '#fbbf24' },
      { id: 'vectordb', icon: 'vectordb', label: 'Vector Store', x: 450, y: 225, color: '#2dd4bf' },
      { id: 'filesystem', icon: 'server', label: 'Filesystem', x: 643, y: 135, color: '#f87171' },
      { id: 'labelq', icon: 'document', label: 'Label Queue', x: 257, y: 360, color: '#fbbf24' },
      { id: 'pipeline', icon: 'server', label: 'Training Pipe', x: 450, y: 360, color: '#a78bfa' },
      { id: 'corrupt', icon: 'database', label: 'Corrupted', x: 720, y: 293, color: '#f87171' },
    ],
    edges: [
      { from: 'attacker', to: 'input', color: '#f87171', animated: true, label: 'Path traversal', labelPos: 0.3 },
      { from: 'input', to: 'schema', color: '#f87171', animated: true, label: 'Passes format' },
      { from: 'schema', to: 'filesystem', color: '#f87171', animated: true, label: 'Arb. write' },
      { from: 'attacker', to: 'snapshot', color: '#f87171', animated: true, label: 'Craft snap', labelPos: 0.5 },
      { from: 'snapshot', to: 'vectordb', color: '#f87171', animated: true, label: 'Restore' },
      { from: 'attacker', to: 'labelq', color: '#f87171', animated: true, label: 'Inject labels', labelPos: 0.7 },
      { from: 'labelq', to: 'pipeline', color: '#f87171', animated: true, label: 'Silent corrupt' },
      { from: 'pipeline', to: 'corrupt', color: '#f87171', animated: true, label: 'Bad model' },
    ],
    dangerZone: { x: 553, y: 68, width: 206, height: 135, label: 'CVE-2024-3584' },
  },

  DSGAI06: {
    nodes: [
      { id: 'user', icon: 'user', label: 'User', x: 77, y: 225, color: '#60a5fa' },
      { id: 'llm', icon: 'cloud', label: 'LLM Core', x: 257, y: 225, color: '#60a5fa' },
      { id: 'context', icon: 'document', label: 'Full Context', x: 257, y: 90, color: '#fbbf24' },
      { id: 'mcp', icon: 'agent', label: 'MCP Server', x: 514, y: 90, color: '#e879f9' },
      { id: 'plugin', icon: 'agent', label: 'Plugin (v2)', x: 514, y: 225, color: '#e879f9' },
      { id: 'a2a', icon: 'agent', label: 'Rogue Agent', x: 514, y: 360, color: '#f87171' },
      { id: 'exfil', icon: 'server', label: 'C2 Server', x: 746, y: 225, color: '#f87171' },
      { id: 'metadata', icon: 'document', label: 'Tool Manifest', x: 720, y: 90, color: '#f87171' },
    ],
    edges: [
      { from: 'user', to: 'llm', color: '#60a5fa', animated: true, label: 'Prompt' },
      { from: 'llm', to: 'context', color: '#fbbf24', animated: true, label: 'Assembles' },
      { from: 'context', to: 'mcp', color: '#f87171', animated: true, label: 'Full context', labelPos: 0.3 },
      { from: 'context', to: 'plugin', color: '#f87171', animated: true, label: 'No scoping', labelPos: 0.7 },
      { from: 'plugin', to: 'exfil', color: '#f87171', animated: true, label: 'Update exfil', labelPos: 0.7 },
      { from: 'a2a', to: 'llm', color: '#f87171', animated: true, label: 'Rogue via A2A' },
      { from: 'metadata', to: 'mcp', color: '#f87171', animated: true, label: 'Bad manifest', labelPos: 0.7 },
      { from: 'mcp', to: 'exfil', color: '#f87171', animated: true, label: 'Drain context', labelPos: 0.3 },
    ],
    dangerZone: { x: 411, y: 34, width: 231, height: 383, label: 'Untrusted Endpoints' },
  },

  DSGAI07: {
    nodes: [
      { id: 'source', icon: 'database', label: 'Source DB', x: 77, y: 225, color: '#2dd4bf' },
      { id: 'label', icon: 'document', label: 'Classified', x: 77, y: 90, color: '#facc15' },
      { id: 'pipeline', icon: 'server', label: 'Ingest Pipe', x: 283, y: 225, color: '#a78bfa' },
      { id: 'embeddings', icon: 'vectordb', label: 'Embeddings', x: 489, y: 90, color: '#2dd4bf' },
      { id: 'weights', icon: 'cloud', label: 'Model Weights', x: 489, y: 225, color: '#60a5fa' },
      { id: 'backups', icon: 'database', label: 'Backups', x: 489, y: 360, color: '#2dd4bf' },
      { id: 'delete', icon: 'lock', label: 'GDPR Delete', x: 77, y: 360, color: '#f87171' },
      { id: 'nolabel', icon: 'document', label: 'No Labels', x: 720, y: 158, color: '#f87171' },
      { id: 'persist', icon: 'document', label: 'Data Persists', x: 720, y: 315, color: '#f87171' },
    ],
    edges: [
      { from: 'label', to: 'source', color: '#facc15', animated: true, label: 'Classified' },
      { from: 'source', to: 'pipeline', color: '#2dd4bf', animated: true, label: 'Ingest' },
      { from: 'pipeline', to: 'embeddings', color: '#a78bfa', animated: true, label: 'No label', labelPos: 0.3 },
      { from: 'pipeline', to: 'weights', color: '#a78bfa', animated: true, label: 'No label', labelPos: 0.5 },
      { from: 'pipeline', to: 'backups', color: '#a78bfa', animated: true, label: 'No label', labelPos: 0.7 },
      { from: 'delete', to: 'source', color: '#f87171', animated: true, label: 'Deleted' },
      { from: 'embeddings', to: 'nolabel', color: '#f87171', animated: true, label: 'Orphaned' },
      { from: 'weights', to: 'persist', color: '#f87171', animated: true, label: 'Still active', labelPos: 0.3 },
      { from: 'backups', to: 'persist', color: '#f87171', animated: true, label: 'Retained', labelPos: 0.7 },
    ],
    dangerZone: { x: 617, y: 90, width: 206, height: 293, label: 'Label Gap' },
  },

  DSGAI08: {
    nodes: [
      { id: 'regulator', icon: 'user', label: 'Regulator', x: 77, y: 90, color: '#facc15' },
      { id: 'dsr', icon: 'document', label: 'Art.17 Request', x: 257, y: 90, color: '#fbbf24' },
      { id: 'system', icon: 'server', label: 'AI Platform', x: 450, y: 225, color: '#a78bfa' },
      { id: 'sourcedb', icon: 'database', label: 'Source (Deleted)', x: 257, y: 225, color: '#2dd4bf' },
      { id: 'weights', icon: 'cloud', label: 'Weights (Stuck)', x: 643, y: 135, color: '#f87171' },
      { id: 'vectors', icon: 'vectordb', label: 'Vectors (Live)', x: 643, y: 315, color: '#f87171' },
      { id: 'evidence', icon: 'document', label: 'No Evidence', x: 823, y: 225, color: '#f87171' },
      { id: 'fine', icon: 'document', label: '4% Revenue', x: 823, y: 90, color: '#f87171' },
    ],
    edges: [
      { from: 'regulator', to: 'dsr', color: '#facc15', animated: true, label: 'Audit demand' },
      { from: 'dsr', to: 'system', color: '#fbbf24', animated: true, label: 'Prove erasure' },
      { from: 'system', to: 'sourcedb', color: '#a78bfa', animated: true, label: 'Deleted OK', labelPos: 0.3 },
      { from: 'system', to: 'weights', color: '#f87171', animated: true, label: 'Can\'t unlearn', labelPos: 0.5 },
      { from: 'system', to: 'vectors', color: '#f87171', animated: true, label: 'Still indexed', labelPos: 0.7 },
      { from: 'weights', to: 'evidence', color: '#f87171', animated: true, label: 'No proof', labelPos: 0.3 },
      { from: 'vectors', to: 'evidence', color: '#f87171', animated: true, label: 'No proof', labelPos: 0.7 },
      { from: 'evidence', to: 'fine', color: '#f87171', animated: true, label: 'Enforcement' },
    ],
    dangerZone: { x: 540, y: 68, width: 193, height: 315, label: 'Compliance Gap' },
  },

  DSGAI09: {
    nodes: [
      { id: 'user', icon: 'user', label: 'User Upload', x: 77, y: 135, color: '#60a5fa' },
      { id: 'image', icon: 'document', label: 'Image + EXIF', x: 257, y: 90, color: '#fbbf24' },
      { id: 'audio', icon: 'document', label: 'Audio / Video', x: 257, y: 315, color: '#fbbf24' },
      { id: 'ocr', icon: 'server', label: 'OCR Engine', x: 489, y: 90, color: '#a78bfa' },
      { id: 'asr', icon: 'server', label: 'ASR / STT', x: 489, y: 315, color: '#a78bfa' },
      { id: 'storage', icon: 'database', label: 'Bucket (Public)', x: 694, y: 203, color: '#f87171' },
      { id: 'biometric', icon: 'document', label: 'Biometric Data', x: 489, y: 203, color: '#f87171' },
      { id: 'attacker', icon: 'user', label: 'Attacker', x: 823, y: 90, color: '#f87171' },
    ],
    edges: [
      { from: 'user', to: 'image', color: '#60a5fa', animated: true, label: 'Upload', labelPos: 0.3 },
      { from: 'user', to: 'audio', color: '#60a5fa', animated: true, label: 'Record', labelPos: 0.7 },
      { from: 'image', to: 'ocr', color: '#fbbf24', animated: true, label: 'GPS, device ID' },
      { from: 'audio', to: 'asr', color: '#fbbf24', animated: true, label: 'Voiceprint' },
      { from: 'ocr', to: 'biometric', color: '#f87171', animated: true, label: 'Unclassified', labelPos: 0.3 },
      { from: 'asr', to: 'biometric', color: '#f87171', animated: true, label: 'Unclassified', labelPos: 0.7 },
      { from: 'biometric', to: 'storage', color: '#f87171', animated: true, label: 'No labels' },
      { from: 'storage', to: 'attacker', color: '#f87171', animated: true, label: 'Misconfig' },
    ],
    dangerZone: { x: 591, y: 124, width: 206, height: 169, label: 'Art.9 Violation' },
  },

  DSGAI10: {
    nodes: [
      { id: 'realdata', icon: 'database', label: 'Real PII Data', x: 77, y: 225, color: '#2dd4bf' },
      { id: 'deid', icon: 'server', label: 'De-ID Pipeline', x: 257, y: 225, color: '#a78bfa' },
      { id: 'synthetic', icon: 'document', label: '"Anonymous"', x: 450, y: 135, color: '#fbbf24' },
      { id: 'model', icon: 'cloud', label: 'Fine-tuned', x: 643, y: 135, color: '#60a5fa' },
      { id: 'shared', icon: 'document', label: 'Shared Broadly', x: 643, y: 293, color: '#fbbf24' },
      { id: 'attacker', icon: 'user', label: 'Attacker', x: 823, y: 225, color: '#f87171' },
      { id: 'external', icon: 'database', label: 'Public Data', x: 823, y: 90, color: '#f87171' },
      { id: 'reid', icon: 'document', label: 'Re-identified', x: 823, y: 360, color: '#f87171' },
    ],
    edges: [
      { from: 'realdata', to: 'deid', color: '#2dd4bf', animated: true, label: 'Export' },
      { from: 'deid', to: 'synthetic', color: '#a78bfa', animated: true, label: 'k-anon fails' },
      { from: 'synthetic', to: 'model', color: '#fbbf24', animated: true, label: 'Train', labelPos: 0.3 },
      { from: 'synthetic', to: 'shared', color: '#fbbf24', animated: true, label: 'False safety', labelPos: 0.7 },
      { from: 'model', to: 'attacker', color: '#f87171', animated: true, label: 'MI >0.9', labelPos: 0.3 },
      { from: 'external', to: 'attacker', color: '#f87171', animated: true, label: 'Quasi-IDs', labelPos: 0.7 },
      { from: 'attacker', to: 'reid', color: '#f87171', animated: true, label: 'Linkage attack' },
    ],
    dangerZone: { x: 720, y: 56, width: 167, height: 169, label: 'Re-identification' },
  },

  DSGAI11: {
    nodes: [
      { id: 'tenantA', icon: 'user', label: 'Tenant A', x: 77, y: 90, color: '#60a5fa' },
      { id: 'tenantB', icon: 'user', label: 'Tenant B', x: 77, y: 360, color: '#4ade80' },
      { id: 'gateway', icon: 'server', label: 'API Gateway', x: 283, y: 225, color: '#a78bfa' },
      { id: 'kvcache', icon: 'server', label: 'KV Cache', x: 489, y: 90, color: '#f87171' },
      { id: 'vdb', icon: 'vectordb', label: 'Shared Index', x: 489, y: 225, color: '#2dd4bf' },
      { id: 'sessions', icon: 'lock', label: 'Session Store', x: 489, y: 360, color: '#f87171' },
      { id: 'llm', icon: 'cloud', label: 'LLM', x: 720, y: 225, color: '#60a5fa' },
      { id: 'leak', icon: 'document', label: 'A Data in B', x: 823, y: 360, color: '#f87171' },
    ],
    edges: [
      { from: 'tenantA', to: 'gateway', color: '#60a5fa', animated: true, label: 'Query', labelPos: 0.3 },
      { from: 'tenantB', to: 'gateway', color: '#4ade80', animated: true, label: 'Query', labelPos: 0.7 },
      { from: 'gateway', to: 'kvcache', color: '#f87171', animated: true, label: 'Shared cache', labelPos: 0.3 },
      { from: 'gateway', to: 'vdb', color: '#a78bfa', animated: true, label: 'No namespace', labelPos: 0.5 },
      { from: 'gateway', to: 'sessions', color: '#f87171', animated: true, label: 'Weak session', labelPos: 0.7 },
      { from: 'vdb', to: 'llm', color: '#f87171', animated: true, label: 'Cross-tenant', labelPos: 0.7 },
      { from: 'kvcache', to: 'llm', color: '#f87171', animated: true, label: 'Timing leak', labelPos: 0.3 },
      { from: 'llm', to: 'leak', color: '#f87171', animated: true, label: 'A data to B' },
    ],
    dangerZone: { x: 386, y: 34, width: 206, height: 383, label: 'Isolation Failure' },
  },

  DSGAI12: {
    nodes: [
      { id: 'user', icon: 'user', label: 'User', x: 77, y: 225, color: '#60a5fa' },
      { id: 'llm', icon: 'cloud', label: 'NL-to-SQL LLM', x: 283, y: 225, color: '#60a5fa' },
      { id: 'sql', icon: 'document', label: 'Generated SQL', x: 489, y: 225, color: '#fbbf24' },
      { id: 'conn', icon: 'lock', label: 'DBA Account', x: 489, y: 90, color: '#f87171' },
      { id: 'db1', icon: 'database', label: 'Customer DB', x: 694, y: 135, color: '#2dd4bf' },
      { id: 'db2', icon: 'database', label: 'Finance DB', x: 694, y: 315, color: '#2dd4bf' },
      { id: 'exfil', icon: 'document', label: 'UNION Dump', x: 823, y: 225, color: '#f87171' },
      { id: 'inject', icon: 'document', label: 'RAG Payload', x: 77, y: 90, color: '#f87171' },
    ],
    edges: [
      { from: 'user', to: 'llm', color: '#60a5fa', animated: true, label: 'NL query', labelPos: 0.3 },
      { from: 'inject', to: 'llm', color: '#f87171', animated: true, label: 'Inject via RAG', labelPos: 0.7 },
      { from: 'llm', to: 'sql', color: '#fbbf24', animated: true, label: 'Generates' },
      { from: 'conn', to: 'sql', color: '#f87171', animated: true, label: 'Elevated privs' },
      { from: 'sql', to: 'db1', color: '#f87171', animated: true, label: 'SELECT *', labelPos: 0.3 },
      { from: 'sql', to: 'db2', color: '#f87171', animated: true, label: 'UNION JOIN', labelPos: 0.7 },
      { from: 'db1', to: 'exfil', color: '#f87171', animated: true, label: 'Bulk dump', labelPos: 0.3 },
      { from: 'db2', to: 'exfil', color: '#f87171', animated: true, label: 'Cross-tenant', labelPos: 0.7 },
    ],
    dangerZone: { x: 386, y: 34, width: 206, height: 146, label: 'DBA-Level Access' },
  },

  DSGAI13: {
    nodes: [
      { id: 'attacker', icon: 'user', label: 'Attacker', x: 77, y: 225, color: '#f87171' },
      { id: 'api', icon: 'router', label: 'Unauth API', x: 283, y: 225, color: '#fb923c' },
      { id: 'vdb', icon: 'vectordb', label: 'Vector Store', x: 489, y: 225, color: '#2dd4bf' },
      { id: 'knn', icon: 'document', label: 'k-NN Sweep', x: 283, y: 90, color: '#f87171' },
      { id: 'snapshot', icon: 'document', label: 'Snapshot File', x: 489, y: 360, color: '#fbbf24' },
      { id: 'rce', icon: 'server', label: 'Server (RCE)', x: 720, y: 360, color: '#f87171' },
      { id: 'index', icon: 'document', label: 'Full Index', x: 720, y: 90, color: '#f87171' },
      { id: 'invert', icon: 'document', label: 'Text Recovery', x: 720, y: 225, color: '#f87171' },
    ],
    edges: [
      { from: 'attacker', to: 'api', color: '#f87171', animated: true, label: 'No auth', labelPos: 0.3 },
      { from: 'attacker', to: 'knn', color: '#f87171', animated: true, label: 'Systematic', labelPos: 0.7 },
      { from: 'knn', to: 'vdb', color: '#f87171', animated: true, label: '1000s queries' },
      { from: 'api', to: 'vdb', color: '#fb923c', animated: true, label: 'Full access' },
      { from: 'vdb', to: 'snapshot', color: '#2dd4bf', animated: true, label: 'Export', labelPos: 0.3 },
      { from: 'snapshot', to: 'rce', color: '#f87171', animated: true, label: 'Path traversal' },
      { from: 'vdb', to: 'index', color: '#f87171', animated: true, label: 'Reconstruct', labelPos: 0.7 },
      { from: 'index', to: 'invert', color: '#f87171', animated: true, label: 'Embed to text' },
    ],
    dangerZone: { x: 617, y: 281, width: 206, height: 146, label: 'CVE-2024-3829' },
  },

  DSGAI14: {
    nodes: [
      { id: 'llm', icon: 'cloud', label: 'LLM Runtime', x: 103, y: 225, color: '#60a5fa' },
      { id: 'debug', icon: 'server', label: 'Debug: ON', x: 309, y: 90, color: '#f87171' },
      { id: 'logpipe', icon: 'server', label: 'Log Pipeline', x: 309, y: 225, color: '#a78bfa' },
      { id: 'apm', icon: 'cloud', label: '3rd Party APM', x: 309, y: 360, color: '#60a5fa' },
      { id: 'siem', icon: 'database', label: 'SIEM', x: 566, y: 225, color: '#2dd4bf' },
      { id: 'pii', icon: 'document', label: 'Full Prompts', x: 566, y: 90, color: '#f87171' },
      { id: 'analyst', icon: 'user', label: 'Phished Analyst', x: 771, y: 225, color: '#f87171' },
      { id: 'export', icon: 'document', label: 'Bulk Export', x: 771, y: 90, color: '#f87171' },
    ],
    edges: [
      { from: 'llm', to: 'debug', color: '#f87171', animated: true, label: 'Full bodies', labelPos: 0.3 },
      { from: 'llm', to: 'logpipe', color: '#a78bfa', animated: true, label: 'Prompts+resp', labelPos: 0.5 },
      { from: 'llm', to: 'apm', color: '#60a5fa', animated: true, label: 'Tokens+traces', labelPos: 0.7 },
      { from: 'debug', to: 'pii', color: '#f87171', animated: true, label: 'PII captured' },
      { from: 'logpipe', to: 'siem', color: '#a78bfa', animated: true, label: 'Aggregated' },
      { from: 'pii', to: 'siem', color: '#f87171', animated: true, label: 'No redaction' },
      { from: 'siem', to: 'analyst', color: '#f87171', animated: true, label: 'Compromised' },
      { from: 'analyst', to: 'export', color: '#f87171', animated: true, label: 'Months data' },
    ],
    dangerZone: { x: 206, y: 34, width: 219, height: 124, label: 'Debug Left On' },
  },

  DSGAI15: {
    nodes: [
      { id: 'user', icon: 'user', label: 'User', x: 77, y: 225, color: '#60a5fa' },
      { id: 'query', icon: 'document', label: '"What is status?"', x: 77, y: 90, color: '#fbbf24' },
      { id: 'gateway', icon: 'server', label: 'LLM Gateway', x: 309, y: 225, color: '#a78bfa' },
      { id: 'crm', icon: 'database', label: 'CRM 360°', x: 309, y: 360, color: '#2dd4bf' },
      { id: 'context', icon: 'document', label: 'SSN + CC + Addr', x: 540, y: 225, color: '#f87171' },
      { id: 'provider', icon: 'cloud', label: 'External LLM', x: 720, y: 225, color: '#60a5fa' },
      { id: 'cache', icon: 'server', label: 'Edge Cache', x: 720, y: 360, color: '#f87171' },
      { id: 'retained', icon: 'document', label: 'Provider Logs', x: 823, y: 90, color: '#f87171' },
    ],
    edges: [
      { from: 'user', to: 'gateway', color: '#60a5fa', animated: true, label: 'Simple query', labelPos: 0.3 },
      { from: 'crm', to: 'gateway', color: '#2dd4bf', animated: true, label: 'Auto-append', labelPos: 0.7 },
      { from: 'gateway', to: 'context', color: '#f87171', animated: true, label: '+ full profile' },
      { from: 'context', to: 'provider', color: '#f87171', animated: true, label: 'All PII sent' },
      { from: 'provider', to: 'retained', color: '#f87171', animated: true, label: 'Logged', labelPos: 0.3 },
      { from: 'provider', to: 'cache', color: '#f87171', animated: true, label: 'Cached', labelPos: 0.7 },
    ],
    dangerZone: { x: 437, y: 146, width: 206, height: 158, label: 'PII Over-Sharing' },
  },

  DSGAI16: {
    nodes: [
      { id: 'page', icon: 'browser', label: 'Malicious Page', x: 77, y: 90, color: '#f87171' },
      { id: 'browser', icon: 'browser', label: 'Browser', x: 283, y: 225, color: '#facc15' },
      { id: 'extension', icon: 'agent', label: 'AI Extension', x: 489, y: 225, color: '#e879f9' },
      { id: 'perms', icon: 'lock', label: 'Read All Sites', x: 489, y: 90, color: '#f87171' },
      { id: 'local', icon: 'server', label: '.env, SSH keys', x: 283, y: 360, color: '#4ade80' },
      { id: 'intranet', icon: 'database', label: 'Intranet', x: 77, y: 360, color: '#2dd4bf' },
      { id: 'exfil', icon: 'server', label: 'C2 Server', x: 720, y: 225, color: '#f87171' },
      { id: 'update', icon: 'document', label: 'Malicious Update', x: 720, y: 90, color: '#f87171' },
    ],
    edges: [
      { from: 'page', to: 'browser', color: '#f87171', animated: true, label: '#HashJack' },
      { from: 'perms', to: 'extension', color: '#f87171', animated: true, label: 'Broad perms', labelPos: 0.3 },
      { from: 'browser', to: 'extension', color: '#facc15', animated: true, label: 'DOM + URL', labelPos: 0.5 },
      { from: 'local', to: 'extension', color: '#f87171', animated: true, label: 'File access', labelPos: 0.3 },
      { from: 'intranet', to: 'extension', color: '#f87171', animated: true, label: 'Scrape', labelPos: 0.7 },
      { from: 'extension', to: 'exfil', color: '#f87171', animated: true, label: 'Exfil all' },
      { from: 'update', to: 'extension', color: '#f87171', animated: true, label: 'Supply chain', labelPos: 0.7 },
    ],
    dangerZone: { x: 386, y: 34, width: 219, height: 135, label: 'Over-Permissioned' },
  },

  DSGAI17: {
    nodes: [
      { id: 'user', icon: 'user', label: 'User', x: 77, y: 225, color: '#60a5fa' },
      { id: 'llm', icon: 'cloud', label: 'LLM', x: 283, y: 225, color: '#60a5fa' },
      { id: 'primary', icon: 'vectordb', label: 'Primary DB', x: 489, y: 90, color: '#2dd4bf' },
      { id: 'replica', icon: 'vectordb', label: 'Stale Replica', x: 489, y: 360, color: '#f87171' },
      { id: 'fail', icon: 'firewall', label: 'Overloaded', x: 720, y: 90, color: '#f87171' },
      { id: 'deleted', icon: 'document', label: 'DSR Deleted', x: 283, y: 90, color: '#f87171' },
      { id: 'fallback', icon: 'router', label: 'Auto-Failover', x: 489, y: 225, color: '#fb923c' },
      { id: 'misinfo', icon: 'document', label: 'Stale Output', x: 720, y: 360, color: '#f87171' },
    ],
    edges: [
      { from: 'user', to: 'llm', color: '#60a5fa', animated: true, label: 'Query' },
      { from: 'llm', to: 'fallback', color: '#60a5fa', animated: true, label: 'Fetch data' },
      { from: 'fallback', to: 'primary', color: '#2dd4bf', animated: true, label: 'Try primary', labelPos: 0.3 },
      { from: 'fail', to: 'primary', color: '#f87171', animated: true, label: 'Saturated', labelPos: 0.7 },
      { from: 'deleted', to: 'primary', color: '#f87171', animated: true, label: 'Erased here', labelPos: 0.3 },
      { from: 'fallback', to: 'replica', color: '#f87171', animated: true, label: 'Silent switch', labelPos: 0.7 },
      { from: 'replica', to: 'misinfo', color: '#f87171', animated: true, label: 'DSR data lives' },
    ],
    dangerZone: { x: 386, y: 281, width: 206, height: 146, label: 'Stale + DSR Violation' },
  },

  DSGAI18: {
    nodes: [
      { id: 'attacker', icon: 'user', label: 'Attacker', x: 77, y: 225, color: '#f87171' },
      { id: 'probes', icon: 'document', label: '10K+ Probes', x: 257, y: 90, color: '#f87171' },
      { id: 'llm', icon: 'cloud', label: 'Target Model', x: 450, y: 225, color: '#60a5fa' },
      { id: 'vdb', icon: 'vectordb', label: 'Vector Store', x: 257, y: 360, color: '#2dd4bf' },
      { id: 'confidence', icon: 'document', label: 'Confidence Scores', x: 643, y: 90, color: '#fbbf24' },
      { id: 'knn', icon: 'document', label: 'k-NN Results', x: 643, y: 360, color: '#fbbf24' },
      { id: 'analysis', icon: 'server', label: 'Statistical ML', x: 746, y: 225, color: '#a78bfa' },
      { id: 'result', icon: 'document', label: 'Member: Yes 93%', x: 823, y: 90, color: '#f87171' },
    ],
    edges: [
      { from: 'attacker', to: 'probes', color: '#f87171', animated: true, label: 'Craft queries', labelPos: 0.3 },
      { from: 'probes', to: 'llm', color: '#f87171', animated: true, label: 'Iterative' },
      { from: 'attacker', to: 'vdb', color: '#f87171', animated: true, label: 'k-NN sweep', labelPos: 0.7 },
      { from: 'llm', to: 'confidence', color: '#fbbf24', animated: true, label: 'Loss values', labelPos: 0.3 },
      { from: 'vdb', to: 'knn', color: '#fbbf24', animated: true, label: 'Neighbors', labelPos: 0.7 },
      { from: 'confidence', to: 'analysis', color: '#a78bfa', animated: true, label: 'Accumulate', labelPos: 0.3 },
      { from: 'knn', to: 'analysis', color: '#a78bfa', animated: true, label: 'Inversion', labelPos: 0.7 },
      { from: 'analysis', to: 'result', color: '#f87171', animated: true, label: 'Confirmed' },
    ],
    dangerZone: { x: 540, y: 146, width: 231, height: 158, label: 'Signal Accumulation' },
  },

  DSGAI19: {
    nodes: [
      { id: 'db', icon: 'database', label: 'Patient Records', x: 77, y: 225, color: '#2dd4bf' },
      { id: 'export', icon: 'server', label: 'Export Job', x: 283, y: 225, color: '#a78bfa' },
      { id: 'platform', icon: 'cloud', label: 'Crowd Platform', x: 514, y: 225, color: '#60a5fa' },
      { id: 'labelerA', icon: 'user', label: 'Labeler (Clean)', x: 720, y: 90, color: '#60a5fa' },
      { id: 'labelerB', icon: 'user', label: 'Labeler (Comp.)', x: 720, y: 360, color: '#f87171' },
      { id: 'fullpii', icon: 'document', label: 'Full PHI', x: 283, y: 90, color: '#f87171' },
      { id: 'malware', icon: 'document', label: 'Malware', x: 823, y: 360, color: '#f87171' },
      { id: 'creep', icon: 'document', label: 'Field Creep', x: 514, y: 90, color: '#f87171' },
    ],
    edges: [
      { from: 'db', to: 'export', color: '#2dd4bf', animated: true, label: 'Full records' },
      { from: 'export', to: 'fullpii', color: '#f87171', animated: true, label: 'No redaction' },
      { from: 'fullpii', to: 'platform', color: '#f87171', animated: true, label: 'PHI exposed', labelPos: 0.3 },
      { from: 'creep', to: 'platform', color: '#f87171', animated: true, label: 'Fields added', labelPos: 0.7 },
      { from: 'platform', to: 'labelerA', color: '#60a5fa', animated: true, label: 'Views PII', labelPos: 0.3 },
      { from: 'platform', to: 'labelerB', color: '#f87171', animated: true, label: 'Views PII', labelPos: 0.7 },
      { from: 'labelerB', to: 'malware', color: '#f87171', animated: true, label: 'Exfiltrate' },
    ],
    dangerZone: { x: 617, y: 281, width: 231, height: 146, label: 'Compromised Endpoint' },
  },

  DSGAI20: {
    nodes: [
      { id: 'attacker', icon: 'user', label: 'Attacker', x: 77, y: 225, color: '#f87171' },
      { id: 'accounts', icon: 'lock', label: 'Multi-Account', x: 77, y: 90, color: '#f87171' },
      { id: 'api', icon: 'router', label: 'Model API', x: 309, y: 225, color: '#fb923c' },
      { id: 'model', icon: 'cloud', label: 'Proprietary LLM', x: 514, y: 225, color: '#60a5fa' },
      { id: 'cot', icon: 'document', label: 'CoT Coercion', x: 514, y: 90, color: '#f87171' },
      { id: 'pairs', icon: 'document', label: '100K+ I/O Pairs', x: 720, y: 135, color: '#fbbf24' },
      { id: 'student', icon: 'cloud', label: 'Student Model', x: 720, y: 315, color: '#f87171' },
      { id: 'clone', icon: 'server', label: 'Competitor', x: 823, y: 225, color: '#f87171' },
    ],
    edges: [
      { from: 'attacker', to: 'api', color: '#f87171', animated: true, label: 'Legit API', labelPos: 0.3 },
      { from: 'accounts', to: 'api', color: '#f87171', animated: true, label: 'Distributed', labelPos: 0.7 },
      { from: 'api', to: 'model', color: '#fb923c', animated: true, label: 'Queries', labelPos: 0.3 },
      { from: 'cot', to: 'model', color: '#f87171', animated: true, label: 'Force CoT', labelPos: 0.7 },
      { from: 'model', to: 'pairs', color: '#fbbf24', animated: true, label: 'Harvest' },
      { from: 'pairs', to: 'student', color: '#f87171', animated: true, label: 'Distill' },
      { from: 'student', to: 'clone', color: '#f87171', animated: true, label: 'Deploy copy' },
    ],
    dangerZone: { x: 617, y: 68, width: 219, height: 135, label: 'IP Theft' },
  },

  DSGAI21: {
    nodes: [
      { id: 'attacker', icon: 'user', label: 'Attacker', x: 77, y: 90, color: '#f87171' },
      { id: 'wiki', icon: 'document', label: 'Internal Wiki', x: 283, y: 90, color: '#fbbf24' },
      { id: 'corpus', icon: 'database', label: 'Open Corpus', x: 283, y: 315, color: '#2dd4bf' },
      { id: 'trusted', icon: 'database', label: 'Trusted Source', x: 514, y: 225, color: '#2dd4bf' },
      { id: 'rag', icon: 'cloud', label: 'RAG System', x: 694, y: 225, color: '#60a5fa' },
      { id: 'grounded', icon: 'document', label: '"Grounded" Lie', x: 694, y: 90, color: '#f87171' },
      { id: 'victim', icon: 'user', label: 'Decision Maker', x: 823, y: 225, color: '#60a5fa' },
      { id: 'crisis', icon: 'document', label: 'Crisis Timing', x: 77, y: 225, color: '#f87171' },
    ],
    edges: [
      { from: 'attacker', to: 'wiki', color: '#f87171', animated: true, label: 'Write access', labelPos: 0.3 },
      { from: 'attacker', to: 'corpus', color: '#f87171', animated: true, label: 'Seed false', labelPos: 0.7 },
      { from: 'crisis', to: 'attacker', color: '#f87171', animated: true, label: 'Crisis' },
      { from: 'wiki', to: 'trusted', color: '#f87171', animated: true, label: 'Indexed', labelPos: 0.3 },
      { from: 'corpus', to: 'trusted', color: '#f87171', animated: true, label: 'Ingested', labelPos: 0.7 },
      { from: 'trusted', to: 'rag', color: '#2dd4bf', animated: true, label: 'Retrieved' },
      { from: 'rag', to: 'grounded', color: '#f87171', animated: true, label: 'Cited', labelPos: 0.3 },
      { from: 'rag', to: 'victim', color: '#f87171', animated: true, label: 'Misled', labelPos: 0.7 },
    ],
    dangerZone: { x: 180, y: 34, width: 437, height: 135, label: 'Poisoned Sources' },
  },
}

// ---------------------------------------------------------------------------
// Helper: get category metadata
// ---------------------------------------------------------------------------

function getCategoryMeta(categoryId) {
  return categories.find(c => c.id === categoryId) || categories[0]
}

// ---------------------------------------------------------------------------
// Flow line with animated packet and arrowhead
// ---------------------------------------------------------------------------

function FlowEdge({ fromNode, toNode, color, animated, label, idx, diagramId, curveOffset }) {
  const x1 = fromNode.x
  const y1 = fromNode.y
  const x2 = toNode.x
  const y2 = toNode.y

  const isAttack = color === '#f87171'
  const dur = [2, 2.5, 3, 3.5][idx % 4]
  const markerId = `arrow-${diagramId}-${idx}`
  const pathId = `path-${diagramId}-${idx}`

  // Compute curve control point: offset perpendicular to the line
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = -dy / len
  const ny = dx / len

  // Each edge curves by a different amount so they don't stack
  const offset = curveOffset != null ? curveOffset : [30, -30, 45, -45, 20, -20, 35, -35][idx % 8]
  const cx = (x1 + x2) / 2 + nx * offset
  const cy = (y1 + y2) / 2 + ny * offset

  // The label sits at the curve apex (the control point)
  const labelX = cx
  const labelY = cy

  const pathD = `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`

  return (
    <g>
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>

      {/* Curved flow line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={isAttack ? 2 : 1.5}
        strokeOpacity={isAttack ? 0.7 : 0.4}
        className={isAttack ? 'flow-line-attack' : 'flow-line'}
        markerEnd={`url(#${markerId})`}
      />

      {/* Hidden path for packet animation */}
      <path id={pathId} d={pathD} fill="none" stroke="none" />

      {/* Animated data packet along curve */}
      {animated && (
        <circle r={isAttack ? 4 : 3} fill={color} opacity="0.85">
          <animateMotion dur={`${dur}s`} repeatCount="indefinite">
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      )}

      {/* Label at curve apex with background */}
      {label && (
        <g>
          <rect
            x={labelX - label.length * 3.6}
            y={labelY - 9}
            width={label.length * 7.2}
            height={16}
            rx="4"
            className="node-bg"
            style={{ opacity: 0.92 }}
          />
          <text
            x={labelX}
            y={labelY + 3}
            fontSize="11"
            fontFamily="monospace"
            fontWeight="600"
            textAnchor="middle"
            className="diagram-sublabel"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Single Network Diagram card
// ---------------------------------------------------------------------------

function NetworkDiagram({ risk }) {
  const config = diagramConfigs[risk.id]
  const cat = getCategoryMeta(risk.category)

  if (!config) return null

  const nodeMap = {}
  config.nodes.forEach(n => { nodeMap[n.id] = n })

  const cveCount = risk.cves ? risk.cves.filter(c => c).length : 0

  return (
    <div
      className="card-stagger bg-owasp-card rounded-xl border border-owasp-border overflow-hidden hover:border-owasp-hover transition-colors"
      style={{ borderLeftWidth: '3px', borderLeftColor: cat.color }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-owasp-border">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className="shrink-0 text-xs font-mono font-bold px-2 py-0.5 rounded mt-0.5"
            style={{ backgroundColor: cat.bgColor, color: cat.color, border: `1px solid ${cat.borderColor}` }}
          >
            {risk.id}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-owasp-text truncate">{risk.title}</h3>
            {risk.tagline && (
              <p className="text-xs text-owasp-muted mt-0.5 line-clamp-2">{risk.tagline}</p>
            )}
          </div>
        </div>
      </div>

      {/* SVG Diagram */}
      <div className="p-4">
        <svg viewBox="0 0 900 450" width="100%" className="block">
          {/* Background */}
          <rect x="0" y="0" width="900" height="450" rx="8" className="diagram-bg" />

          {/* Grid lines for topology feel */}
          {[90, 180, 270, 360].map(y => (
            <line key={`h-${y}`} x1="0" y1={y} x2="900" y2={y} strokeWidth="1" className="diagram-grid" />
          ))}
          {[180, 360, 540, 720].map(x => (
            <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="450" strokeWidth="1" className="diagram-grid" />
          ))}

          {/* Danger zone */}
          {config.dangerZone && (
            <g>
              <rect
                x={config.dangerZone.x}
                y={config.dangerZone.y}
                width={config.dangerZone.width}
                height={config.dangerZone.height}
                rx="6"
                className="danger-zone-fill danger-zone-stroke"
                strokeWidth="1.5"
                strokeDasharray="6 3"
                opacity="0.6"
              />
              <text
                x={config.dangerZone.x + config.dangerZone.width / 2}
                y={config.dangerZone.y + 18}
                fontSize="13"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                opacity="0.9"
                className="danger-zone-text"
              >
                {config.dangerZone.label}
              </text>
            </g>
          )}

          {/* Edges */}
          {config.edges.map((edge, i) => {
            const fromNode = nodeMap[edge.from]
            const toNode = nodeMap[edge.to]
            if (!fromNode || !toNode) return null
            return (
              <FlowEdge
                key={`edge-${i}`}
                fromNode={fromNode}
                toNode={toNode}
                color={edge.color}
                animated={edge.animated}
                label={edge.label}
                curveOffset={edge.curveOffset}
                idx={i}
                diagramId={risk.id}
              />
            )
          })}

          {/* Nodes */}
          {config.nodes.map(node => (
            <g key={node.id}>
              {/* Node background circle */}
              <circle cx={node.x} cy={node.y} r="26" className="node-bg" />
              {/* Icon */}
              <RenderIcon icon={node.icon} x={node.x} y={node.y} color={node.color} />
              {/* Label with background pill */}
              <rect
                x={node.x - node.label.length * 4}
                y={node.y + 27}
                width={node.label.length * 8}
                height={17}
                rx="4"
                className="node-bg"
              />
              <text
                x={node.x}
                y={node.y + 40}
                fontSize="13"
                fontFamily="monospace"
                fontWeight="600"
                textAnchor="middle"
                className="diagram-label"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-owasp-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded"
            style={{ backgroundColor: cat.bgColor, color: cat.color, border: `1px solid ${cat.borderColor}` }}
          >
            {cat.label}
          </span>
          {cveCount > 0 && (
            <span className="text-[10px] font-mono text-owasp-muted bg-owasp-bg px-1.5 py-0.5 rounded border border-owasp-border">
              {cveCount} CVE{cveCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <Link
          to={`/risks/${risk.id}`}
          className="shrink-0 flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-md border border-owasp-border text-owasp-muted hover:text-owasp-text hover:border-owasp-hover transition-colors"
        >
          View Details
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Legend Component
// ---------------------------------------------------------------------------

function DiagramLegend() {
  return (
    <div className="bg-owasp-card rounded-lg border border-owasp-border px-4 py-3">
      <p className="text-xs font-semibold text-owasp-text mb-2">Legend</p>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {/* Flow types */}
        <div className="flex items-center gap-2">
          <svg width="32" height="10" viewBox="0 0 32 10">
            <line x1="0" y1="5" x2="32" y2="5" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="6 4" />
          </svg>
          <span className="text-xs text-owasp-muted">Normal flow</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="32" height="10" viewBox="0 0 32 10">
            <line x1="0" y1="5" x2="32" y2="5" stroke="#f87171" strokeWidth="2" strokeDasharray="8 3" />
          </svg>
          <span className="text-xs text-owasp-muted">Attack path</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="24" height="16" viewBox="0 0 24 16">
            <rect x="1" y="1" width="22" height="14" rx="3" fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
          </svg>
          <span className="text-xs text-owasp-muted">Danger zone</span>
        </div>

        {/* Icon types */}
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="5" r="3" fill="none" stroke="#60a5fa" strokeWidth="1" />
            <path d="M3 14 C3 10 6 8 8 8 C10 8 13 10 13 14" fill="none" stroke="#60a5fa" strokeWidth="1" />
          </svg>
          <span className="text-xs text-owasp-muted">User / Actor</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect x="1" y="2" width="14" height="5" rx="2" fill="none" stroke="#a78bfa" strokeWidth="1" />
            <rect x="1" y="9" width="14" height="5" rx="2" fill="none" stroke="#a78bfa" strokeWidth="1" />
          </svg>
          <span className="text-xs text-owasp-muted">Server</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <ellipse cx="8" cy="4" rx="6" ry="3" fill="none" stroke="#2dd4bf" strokeWidth="1" />
            <line x1="2" y1="4" x2="2" y2="12" stroke="#2dd4bf" strokeWidth="1" />
            <line x1="14" y1="4" x2="14" y2="12" stroke="#2dd4bf" strokeWidth="1" />
            <ellipse cx="8" cy="12" rx="6" ry="3" fill="none" stroke="#2dd4bf" strokeWidth="1" />
          </svg>
          <span className="text-xs text-owasp-muted">Database</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M3 10 C1 10 0 9 0 7.5 C0 5.5 2 4 4 4 C4.5 2 6 1 8 1 C10.5 1 12 2.5 12.5 4 C14 4.5 15 5.5 15 7 C15 8.5 13.5 10 12 10 Z" fill="none" stroke="#60a5fa" strokeWidth="1" />
          </svg>
          <span className="text-xs text-owasp-muted">Cloud / LLM</span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function Diagrams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { dark } = useTheme()

  const activeCat = searchParams.get('cat') || 'all'

  const setActiveCat = (catId) => {
    if (catId === 'all') {
      searchParams.delete('cat')
    } else {
      searchParams.set('cat', catId)
    }
    setSearchParams(searchParams, { replace: true })
  }

  const filtered = useMemo(() => {
    if (activeCat === 'all') return risks
    return risks.filter(r => r.category === activeCat)
  }, [activeCat])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Network className="w-7 h-7 text-cat-leakage" />
          <h1 className="text-2xl font-bold text-owasp-text">Network Diagrams</h1>
        </div>
        <p className="text-owasp-muted text-sm max-w-2xl">
          Visual network topology diagrams showing infrastructure attack flows for each of the 21 OWASP GenAI data security risks. Animated packets indicate data flow direction; red highlights mark attack paths and danger zones.
        </p>
      </div>

      {/* Legend */}
      <DiagramLegend />

      {/* Jump-to navigation */}
      <div className="bg-owasp-card rounded-xl border border-owasp-border p-4">
        <p className="text-xs font-semibold text-owasp-text mb-3">Jump to Diagram</p>
        <div className="flex flex-wrap gap-2">
          {filtered.map(risk => {
            const rCat = getCategoryMeta(risk.category)
            return (
              <button
                key={risk.id}
                onClick={() => {
                  const el = document.getElementById(`diagram-${risk.id}`)
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border border-owasp-border hover:border-owasp-hover bg-owasp-dark transition-colors cursor-pointer"
                style={{ color: rCat.color }}
              >
                {risk.id}
              </button>
            )
          })}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCat('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            activeCat === 'all'
              ? 'bg-owasp-border text-owasp-text border-owasp-hover font-bold'
              : 'bg-owasp-card text-owasp-muted border-owasp-border hover:border-owasp-hover'
          }`}
        >
          All Risks
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeCat === cat.id
                ? 'border-transparent'
                : 'bg-owasp-card text-owasp-muted border-owasp-border hover:border-owasp-hover'
            }`}
            style={
              activeCat === cat.id
                ? { backgroundColor: cat.bgColor, color: cat.color, borderColor: cat.borderColor }
                : undefined
            }
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Diagrams — single column, full width */}
      <div className="flex flex-col gap-8">
        {filtered.map(risk => (
          <div key={risk.id} id={`diagram-${risk.id}`} className="scroll-mt-20">
            <NetworkDiagram risk={risk} />
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-owasp-muted">
          <p className="text-sm">No risks found for this category.</p>
        </div>
      )}
    </div>
  )
}
