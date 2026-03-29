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
      { id: 'user', icon: 'user', label: 'User', x: 80, y: 200, color: '#60a5fa' },
      { id: 'fw', icon: 'firewall', label: 'Firewall', x: 200, y: 200, color: '#f87171' },
      { id: 'llm', icon: 'cloud', label: 'LLM', x: 350, y: 120, color: '#60a5fa' },
      { id: 'db', icon: 'database', label: 'RAG Store', x: 350, y: 280, color: '#2dd4bf' },
      { id: 'vdb', icon: 'vectordb', label: 'VectorDB', x: 200, y: 320, color: '#2dd4bf' },
      { id: 'attacker', icon: 'user', label: 'Attacker', x: 580, y: 200, color: '#f87171' },
    ],
    edges: [
      { from: 'user', to: 'fw', color: '#60a5fa', animated: true, label: 'Query' },
      { from: 'fw', to: 'llm', color: '#60a5fa', animated: true, label: '' },
      { from: 'db', to: 'llm', color: '#2dd4bf', animated: true, label: 'Context' },
      { from: 'vdb', to: 'db', color: '#2dd4bf', animated: true, label: 'Embeddings' },
      { from: 'llm', to: 'attacker', color: '#f87171', animated: true, label: 'PII Leak' },
    ],
    dangerZone: { x: 440, y: 140, width: 200, height: 120, label: 'Data Exfiltration' },
  },

  DSGAI02: {
    nodes: [
      { id: 'user', icon: 'user', label: 'User', x: 80, y: 80, color: '#60a5fa' },
      { id: 'agent', icon: 'agent', label: 'Agent', x: 220, y: 80, color: '#e879f9' },
      { id: 'subagent', icon: 'agent', label: 'Sub-Agent', x: 380, y: 80, color: '#e879f9' },
      { id: 'db', icon: 'database', label: 'Database', x: 550, y: 80, color: '#2dd4bf' },
      { id: 'token', icon: 'server', label: 'Token Store', x: 220, y: 280, color: '#a78bfa' },
      { id: 'lock', icon: 'lock', label: 'Credentials', x: 380, y: 280, color: '#4ade80' },
    ],
    edges: [
      { from: 'user', to: 'agent', color: '#60a5fa', animated: true, label: 'Request' },
      { from: 'agent', to: 'subagent', color: '#e879f9', animated: true, label: 'Delegate' },
      { from: 'subagent', to: 'db', color: '#e879f9', animated: true, label: 'Access' },
      { from: 'agent', to: 'token', color: '#a78bfa', animated: true, label: 'Fetch' },
      { from: 'token', to: 'lock', color: '#f87171', animated: true, label: 'Inherit' },
      { from: 'lock', to: 'subagent', color: '#f87171', animated: true, label: 'Over-Priv' },
    ],
    dangerZone: { x: 160, y: 200, width: 280, height: 140, label: 'Credential Sharing' },
  },

  DSGAI03: {
    nodes: [
      { id: 'user', icon: 'user', label: 'Employee', x: 80, y: 200, color: '#60a5fa' },
      { id: 'fw', icon: 'firewall', label: 'Firewall', x: 180, y: 200, color: '#f87171' },
      { id: 'browser', icon: 'browser', label: 'Browser', x: 300, y: 200, color: '#facc15' },
      { id: 'saas', icon: 'cloud', label: 'Shadow SaaS', x: 470, y: 120, color: '#60a5fa' },
      { id: 'ext', icon: 'server', label: 'Ext. Server', x: 620, y: 120, color: '#a78bfa' },
      { id: 'doc', icon: 'document', label: 'Corp Data', x: 300, y: 320, color: '#fbbf24' },
    ],
    edges: [
      { from: 'user', to: 'browser', color: '#60a5fa', animated: true, label: 'Paste Data' },
      { from: 'doc', to: 'browser', color: '#fbbf24', animated: true, label: 'Copy' },
      { from: 'browser', to: 'saas', color: '#f87171', animated: true, label: 'Bypasses FW' },
      { from: 'saas', to: 'ext', color: '#f87171', animated: true, label: 'Forwards' },
    ],
    dangerZone: { x: 380, y: 60, width: 280, height: 130, label: 'Unmonitored Zone' },
  },

  DSGAI04: {
    nodes: [
      { id: 'ext', icon: 'user', label: 'Attacker', x: 80, y: 120, color: '#f87171' },
      { id: 'doc', icon: 'document', label: 'Poison Docs', x: 200, y: 120, color: '#fbbf24' },
      { id: 'pipeline', icon: 'server', label: 'Pipeline', x: 350, y: 200, color: '#a78bfa' },
      { id: 'model', icon: 'cloud', label: 'Model', x: 520, y: 200, color: '#60a5fa' },
      { id: 'vdb', icon: 'vectordb', label: 'VectorDB', x: 350, y: 320, color: '#2dd4bf' },
      { id: 'user', icon: 'user', label: 'Victim', x: 620, y: 320, color: '#60a5fa' },
    ],
    edges: [
      { from: 'ext', to: 'doc', color: '#f87171', animated: true, label: 'Inject' },
      { from: 'doc', to: 'pipeline', color: '#f87171', animated: true, label: 'Ingest' },
      { from: 'vdb', to: 'pipeline', color: '#2dd4bf', animated: true, label: 'Poisoned' },
      { from: 'pipeline', to: 'model', color: '#f87171', animated: true, label: 'Train' },
      { from: 'model', to: 'user', color: '#f87171', animated: true, label: 'Bad Output' },
    ],
    dangerZone: { x: 120, y: 60, width: 300, height: 130, label: 'Poisoned Data Path' },
  },

  DSGAI05: {
    nodes: [
      { id: 'doc', icon: 'document', label: 'Input', x: 80, y: 200, color: '#fbbf24' },
      { id: 'router', icon: 'router', label: 'Router', x: 220, y: 200, color: '#fb923c' },
      { id: 'validate', icon: 'server', label: 'Validation', x: 380, y: 200, color: '#a78bfa' },
      { id: 'db', icon: 'database', label: 'Database', x: 550, y: 200, color: '#2dd4bf' },
      { id: 'badpath', icon: 'document', label: 'Malformed', x: 220, y: 80, color: '#f87171' },
      { id: 'corrupt', icon: 'database', label: 'Corrupted', x: 550, y: 80, color: '#f87171' },
    ],
    edges: [
      { from: 'doc', to: 'router', color: '#fbbf24', animated: true, label: 'Submit' },
      { from: 'router', to: 'validate', color: '#fb923c', animated: true, label: 'Route' },
      { from: 'validate', to: 'db', color: '#2dd4bf', animated: true, label: 'Store' },
      { from: 'badpath', to: 'router', color: '#f87171', animated: true, label: 'Bypass' },
      { from: 'router', to: 'corrupt', color: '#f87171', animated: true, label: 'No Check' },
    ],
    dangerZone: { x: 150, y: 30, width: 460, height: 100, label: 'Validation Bypass' },
  },

  DSGAI06: {
    nodes: [
      { id: 'llm', icon: 'cloud', label: 'LLM', x: 150, y: 200, color: '#60a5fa' },
      { id: 'router', icon: 'router', label: 'Dispatcher', x: 320, y: 200, color: '#fb923c' },
      { id: 'plugin', icon: 'agent', label: 'Plugin', x: 500, y: 80, color: '#e879f9' },
      { id: 'mcp', icon: 'agent', label: 'MCP Tool', x: 500, y: 200, color: '#e879f9' },
      { id: 'srv', icon: 'server', label: 'Ext. API', x: 500, y: 320, color: '#a78bfa' },
      { id: 'user', icon: 'user', label: 'User', x: 50, y: 200, color: '#60a5fa' },
    ],
    edges: [
      { from: 'user', to: 'llm', color: '#60a5fa', animated: true, label: 'Prompt' },
      { from: 'llm', to: 'router', color: '#60a5fa', animated: true, label: 'Call' },
      { from: 'router', to: 'plugin', color: '#f87171', animated: true, label: 'Untrusted' },
      { from: 'router', to: 'mcp', color: '#f87171', animated: true, label: 'Untrusted' },
      { from: 'router', to: 'srv', color: '#f87171', animated: true, label: 'Untrusted' },
    ],
    dangerZone: { x: 420, y: 30, width: 170, height: 340, label: 'External Endpoints' },
  },

  DSGAI07: {
    nodes: [
      { id: 'source', icon: 'database', label: 'Source DB', x: 80, y: 200, color: '#2dd4bf' },
      { id: 'pipeline', icon: 'server', label: 'Pipeline', x: 250, y: 200, color: '#a78bfa' },
      { id: 'vdb', icon: 'vectordb', label: 'VectorDB', x: 420, y: 120, color: '#2dd4bf' },
      { id: 'model', icon: 'cloud', label: 'Fine-tuned', x: 420, y: 280, color: '#60a5fa' },
      { id: 'del', icon: 'document', label: 'Deleted', x: 80, y: 80, color: '#f87171' },
      { id: 'stale', icon: 'document', label: 'Still Active', x: 580, y: 200, color: '#f87171' },
    ],
    edges: [
      { from: 'source', to: 'pipeline', color: '#2dd4bf', animated: true, label: 'Ingest' },
      { from: 'pipeline', to: 'vdb', color: '#a78bfa', animated: true, label: 'Embed' },
      { from: 'pipeline', to: 'model', color: '#a78bfa', animated: true, label: 'Train' },
      { from: 'del', to: 'source', color: '#f87171', animated: true, label: 'Delete' },
      { from: 'vdb', to: 'stale', color: '#f87171', animated: true, label: 'Orphaned' },
      { from: 'model', to: 'stale', color: '#f87171', animated: true, label: 'Retained' },
    ],
    dangerZone: { x: 490, y: 130, width: 160, height: 140, label: 'Stale Copies' },
  },

  DSGAI08: {
    nodes: [
      { id: 'reg', icon: 'user', label: 'Regulator', x: 80, y: 200, color: '#facc15' },
      { id: 'dsr', icon: 'document', label: 'DSR Request', x: 220, y: 200, color: '#fbbf24' },
      { id: 'srv', icon: 'server', label: 'AI System', x: 380, y: 200, color: '#a78bfa' },
      { id: 'db', icon: 'database', label: 'Database', x: 540, y: 120, color: '#2dd4bf' },
      { id: 'cloud', icon: 'cloud', label: 'Model Wts', x: 540, y: 280, color: '#60a5fa' },
      { id: 'fail', icon: 'lock', label: 'No Proof', x: 640, y: 200, color: '#f87171' },
    ],
    edges: [
      { from: 'reg', to: 'dsr', color: '#facc15', animated: true, label: 'Audit' },
      { from: 'dsr', to: 'srv', color: '#fbbf24', animated: true, label: 'Erase?' },
      { from: 'srv', to: 'db', color: '#a78bfa', animated: true, label: 'Delete' },
      { from: 'srv', to: 'cloud', color: '#a78bfa', animated: true, label: 'Unlearn?' },
      { from: 'db', to: 'fail', color: '#f87171', animated: true, label: 'Partial' },
      { from: 'cloud', to: 'fail', color: '#f87171', animated: true, label: 'Stuck' },
    ],
    dangerZone: { x: 580, y: 140, width: 110, height: 130, label: 'Compliance Gap' },
  },

  DSGAI09: {
    nodes: [
      { id: 'user', icon: 'user', label: 'User', x: 80, y: 120, color: '#60a5fa' },
      { id: 'media', icon: 'document', label: 'Media Files', x: 220, y: 120, color: '#fbbf24' },
      { id: 'cam', icon: 'browser', label: 'Camera/Mic', x: 220, y: 280, color: '#facc15' },
      { id: 'ocr', icon: 'server', label: 'OCR / STT', x: 400, y: 200, color: '#a78bfa' },
      { id: 'store', icon: 'database', label: 'Storage', x: 570, y: 200, color: '#2dd4bf' },
      { id: 'leak', icon: 'user', label: 'Attacker', x: 620, y: 80, color: '#f87171' },
    ],
    edges: [
      { from: 'user', to: 'media', color: '#60a5fa', animated: true, label: 'Upload' },
      { from: 'cam', to: 'ocr', color: '#facc15', animated: true, label: 'Stream' },
      { from: 'media', to: 'ocr', color: '#fbbf24', animated: true, label: 'Extract' },
      { from: 'ocr', to: 'store', color: '#a78bfa', animated: true, label: 'No Classify' },
      { from: 'store', to: 'leak', color: '#f87171', animated: true, label: 'Exfil' },
    ],
    dangerZone: { x: 500, y: 30, width: 180, height: 120, label: 'Unclassified Data' },
  },

  DSGAI10: {
    nodes: [
      { id: 'db', icon: 'database', label: 'Real Data', x: 80, y: 200, color: '#2dd4bf' },
      { id: 'deid', icon: 'server', label: 'De-ID', x: 240, y: 200, color: '#a78bfa' },
      { id: 'finetune', icon: 'cloud', label: 'Fine-tune', x: 420, y: 200, color: '#60a5fa' },
      { id: 'attacker', icon: 'user', label: 'Attacker', x: 600, y: 200, color: '#f87171' },
      { id: 'doc', icon: 'document', label: 'Synthetic', x: 330, y: 100, color: '#fbbf24' },
      { id: 'reid', icon: 'document', label: 'Re-IDed', x: 600, y: 100, color: '#f87171' },
    ],
    edges: [
      { from: 'db', to: 'deid', color: '#2dd4bf', animated: true, label: 'Export' },
      { from: 'deid', to: 'doc', color: '#a78bfa', animated: true, label: 'Generate' },
      { from: 'doc', to: 'finetune', color: '#fbbf24', animated: true, label: 'Train' },
      { from: 'finetune', to: 'attacker', color: '#f87171', animated: true, label: 'Probe' },
      { from: 'attacker', to: 'reid', color: '#f87171', animated: true, label: 'Re-ID' },
    ],
    dangerZone: { x: 520, y: 50, width: 150, height: 120, label: 'Re-identification' },
  },

  DSGAI11: {
    nodes: [
      { id: 'tenantA', icon: 'user', label: 'Tenant A', x: 80, y: 100, color: '#60a5fa' },
      { id: 'tenantB', icon: 'user', label: 'Tenant B', x: 80, y: 300, color: '#4ade80' },
      { id: 'vdb', icon: 'vectordb', label: 'Shared Index', x: 350, y: 200, color: '#2dd4bf' },
      { id: 'llm', icon: 'cloud', label: 'LLM', x: 550, y: 200, color: '#60a5fa' },
      { id: 'docA', icon: 'document', label: 'A Data', x: 200, y: 100, color: '#60a5fa' },
      { id: 'docB', icon: 'document', label: 'B Data', x: 200, y: 300, color: '#4ade80' },
    ],
    edges: [
      { from: 'tenantA', to: 'docA', color: '#60a5fa', animated: true, label: 'Upload' },
      { from: 'tenantB', to: 'docB', color: '#4ade80', animated: true, label: 'Upload' },
      { from: 'docA', to: 'vdb', color: '#60a5fa', animated: true, label: 'Embed' },
      { from: 'docB', to: 'vdb', color: '#4ade80', animated: true, label: 'Embed' },
      { from: 'vdb', to: 'llm', color: '#f87171', animated: true, label: 'Cross-Leak' },
    ],
    dangerZone: { x: 280, y: 130, width: 150, height: 140, label: 'Shared Space' },
  },

  DSGAI12: {
    nodes: [
      { id: 'user', icon: 'user', label: 'User', x: 80, y: 200, color: '#60a5fa' },
      { id: 'llm', icon: 'cloud', label: 'NL Gateway', x: 270, y: 200, color: '#60a5fa' },
      { id: 'db1', icon: 'database', label: 'Orders DB', x: 470, y: 120, color: '#2dd4bf' },
      { id: 'db2', icon: 'database', label: 'Users DB', x: 470, y: 280, color: '#2dd4bf' },
      { id: 'doc', icon: 'document', label: 'SQL', x: 370, y: 200, color: '#fbbf24' },
      { id: 'leak', icon: 'user', label: 'Data Dump', x: 620, y: 200, color: '#f87171' },
    ],
    edges: [
      { from: 'user', to: 'llm', color: '#60a5fa', animated: true, label: 'NL Query' },
      { from: 'llm', to: 'doc', color: '#fbbf24', animated: true, label: 'Generate' },
      { from: 'doc', to: 'db1', color: '#f87171', animated: true, label: 'DROP?' },
      { from: 'doc', to: 'db2', color: '#f87171', animated: true, label: 'SELECT *' },
      { from: 'db2', to: 'leak', color: '#f87171', animated: true, label: 'Dump' },
    ],
    dangerZone: { x: 300, y: 140, width: 240, height: 130, label: 'Dangerous SQL' },
  },

  DSGAI13: {
    nodes: [
      { id: 'attacker', icon: 'user', label: 'Attacker', x: 80, y: 200, color: '#f87171' },
      { id: 'api', icon: 'router', label: 'API', x: 230, y: 200, color: '#fb923c' },
      { id: 'vdb', icon: 'vectordb', label: 'VectorDB', x: 400, y: 200, color: '#2dd4bf' },
      { id: 'ext', icon: 'server', label: 'Exfil Server', x: 580, y: 200, color: '#a78bfa' },
      { id: 'knn', icon: 'document', label: 'k-NN Sweep', x: 230, y: 100, color: '#f87171' },
      { id: 'snap', icon: 'document', label: 'Snapshot', x: 400, y: 320, color: '#f87171' },
    ],
    edges: [
      { from: 'attacker', to: 'api', color: '#f87171', animated: true, label: 'Probe' },
      { from: 'api', to: 'vdb', color: '#fb923c', animated: true, label: 'Query' },
      { from: 'attacker', to: 'knn', color: '#f87171', animated: true, label: 'k-NN' },
      { from: 'knn', to: 'vdb', color: '#f87171', animated: true, label: 'Sweep' },
      { from: 'vdb', to: 'snap', color: '#f87171', animated: true, label: 'Extract' },
      { from: 'vdb', to: 'ext', color: '#f87171', animated: true, label: 'Exfil' },
    ],
    dangerZone: { x: 330, y: 250, width: 150, height: 130, label: 'Extraction' },
  },

  DSGAI14: {
    nodes: [
      { id: 'llm', icon: 'cloud', label: 'LLM', x: 100, y: 200, color: '#60a5fa' },
      { id: 'logs', icon: 'server', label: 'Log Server', x: 280, y: 120, color: '#a78bfa' },
      { id: 'siem', icon: 'database', label: 'SIEM', x: 460, y: 120, color: '#2dd4bf' },
      { id: 'attacker', icon: 'user', label: 'Attacker', x: 620, y: 120, color: '#f87171' },
      { id: 'debug', icon: 'document', label: 'Debug Logs', x: 280, y: 280, color: '#fbbf24' },
      { id: 'pii', icon: 'document', label: 'PII in Logs', x: 460, y: 280, color: '#f87171' },
    ],
    edges: [
      { from: 'llm', to: 'logs', color: '#60a5fa', animated: true, label: 'Emit' },
      { from: 'llm', to: 'debug', color: '#fbbf24', animated: true, label: 'Debug' },
      { from: 'logs', to: 'siem', color: '#a78bfa', animated: true, label: 'Forward' },
      { from: 'debug', to: 'pii', color: '#f87171', animated: true, label: 'Contains PII' },
      { from: 'siem', to: 'attacker', color: '#f87171', animated: true, label: 'Access' },
    ],
    dangerZone: { x: 210, y: 210, width: 310, height: 120, label: 'Sensitive Telemetry' },
  },

  DSGAI15: {
    nodes: [
      { id: 'user', icon: 'user', label: 'User', x: 80, y: 200, color: '#60a5fa' },
      { id: 'gw', icon: 'server', label: 'Gateway', x: 240, y: 200, color: '#a78bfa' },
      { id: 'ext', icon: 'cloud', label: 'Ext. LLM', x: 440, y: 200, color: '#60a5fa' },
      { id: 'provider', icon: 'server', label: 'Provider', x: 600, y: 200, color: '#a78bfa' },
      { id: 'ctx', icon: 'document', label: 'Full PII', x: 340, y: 100, color: '#f87171' },
      { id: 'query', icon: 'document', label: 'Simple Q', x: 140, y: 100, color: '#fbbf24' },
    ],
    edges: [
      { from: 'user', to: 'gw', color: '#60a5fa', animated: true, label: 'Query' },
      { from: 'query', to: 'gw', color: '#fbbf24', animated: true, label: '' },
      { from: 'gw', to: 'ctx', color: '#f87171', animated: true, label: 'Expand' },
      { from: 'ctx', to: 'ext', color: '#f87171', animated: true, label: '+PII' },
      { from: 'ext', to: 'provider', color: '#f87171', animated: true, label: 'Exposed' },
    ],
    dangerZone: { x: 270, y: 40, width: 150, height: 120, label: 'Over-Broad Context' },
  },

  DSGAI16: {
    nodes: [
      { id: 'user', icon: 'user', label: 'User', x: 100, y: 80, color: '#60a5fa' },
      { id: 'browser', icon: 'browser', label: 'Browser', x: 100, y: 200, color: '#facc15' },
      { id: 'dom', icon: 'document', label: 'DOM / Files', x: 280, y: 120, color: '#fbbf24' },
      { id: 'ext', icon: 'agent', label: 'Extension', x: 280, y: 280, color: '#e879f9' },
      { id: 'exfil', icon: 'server', label: 'Exfil Server', x: 500, y: 280, color: '#f87171' },
      { id: 'lock', icon: 'lock', label: 'Local Files', x: 100, y: 320, color: '#4ade80' },
    ],
    edges: [
      { from: 'user', to: 'browser', color: '#60a5fa', animated: true, label: 'Browse' },
      { from: 'browser', to: 'dom', color: '#facc15', animated: true, label: 'Read DOM' },
      { from: 'browser', to: 'ext', color: '#facc15', animated: true, label: 'Extension' },
      { from: 'lock', to: 'ext', color: '#f87171', animated: true, label: 'Read' },
      { from: 'dom', to: 'ext', color: '#f87171', animated: true, label: 'Scrape' },
      { from: 'ext', to: 'exfil', color: '#f87171', animated: true, label: 'Exfil' },
    ],
    dangerZone: { x: 410, y: 210, width: 170, height: 130, label: 'Exfiltration' },
  },

  DSGAI17: {
    nodes: [
      { id: 'llm', icon: 'cloud', label: 'LLM', x: 350, y: 80, color: '#60a5fa' },
      { id: 'primary', icon: 'vectordb', label: 'Primary', x: 180, y: 240, color: '#2dd4bf' },
      { id: 'stale', icon: 'vectordb', label: 'Stale Replica', x: 520, y: 240, color: '#f87171' },
      { id: 'user', icon: 'user', label: 'User', x: 350, y: 340, color: '#60a5fa' },
      { id: 'fail', icon: 'firewall', label: 'FAIL', x: 180, y: 120, color: '#f87171' },
      { id: 'fallback', icon: 'router', label: 'Failover', x: 350, y: 200, color: '#fb923c' },
    ],
    edges: [
      { from: 'user', to: 'llm', color: '#60a5fa', animated: true, label: 'Query' },
      { from: 'llm', to: 'primary', color: '#2dd4bf', animated: true, label: 'Fetch' },
      { from: 'fail', to: 'primary', color: '#f87171', animated: true, label: 'Down' },
      { from: 'primary', to: 'fallback', color: '#f87171', animated: true, label: 'Fail' },
      { from: 'fallback', to: 'stale', color: '#f87171', animated: true, label: 'Stale' },
      { from: 'stale', to: 'llm', color: '#f87171', animated: true, label: 'Old Data' },
    ],
    dangerZone: { x: 440, y: 170, width: 170, height: 130, label: 'Stale Replica' },
  },

  DSGAI18: {
    nodes: [
      { id: 'attacker', icon: 'user', label: 'Attacker', x: 80, y: 200, color: '#f87171' },
      { id: 'llm', icon: 'cloud', label: 'LLM', x: 300, y: 200, color: '#60a5fa' },
      { id: 'analysis', icon: 'server', label: 'Analysis', x: 500, y: 120, color: '#a78bfa' },
      { id: 'recon', icon: 'document', label: 'Reconstructed', x: 640, y: 200, color: '#f87171' },
      { id: 'probes', icon: 'document', label: 'Probes', x: 180, y: 100, color: '#fbbf24' },
      { id: 'signals', icon: 'document', label: 'Signals', x: 400, y: 100, color: '#fbbf24' },
    ],
    edges: [
      { from: 'attacker', to: 'probes', color: '#f87171', animated: true, label: 'Craft' },
      { from: 'probes', to: 'llm', color: '#f87171', animated: true, label: 'Probe' },
      { from: 'llm', to: 'signals', color: '#fbbf24', animated: true, label: 'Leak' },
      { from: 'signals', to: 'analysis', color: '#a78bfa', animated: true, label: 'Collect' },
      { from: 'analysis', to: 'recon', color: '#f87171', animated: true, label: 'Rebuild' },
    ],
    dangerZone: { x: 560, y: 130, width: 140, height: 130, label: 'Reconstruction' },
  },

  DSGAI19: {
    nodes: [
      { id: 'db', icon: 'database', label: 'PII Data', x: 80, y: 200, color: '#2dd4bf' },
      { id: 'export', icon: 'server', label: 'Export', x: 230, y: 200, color: '#a78bfa' },
      { id: 'platform', icon: 'cloud', label: 'Label Platform', x: 400, y: 200, color: '#60a5fa' },
      { id: 'labelerA', icon: 'user', label: 'Labeler A', x: 570, y: 120, color: '#f87171' },
      { id: 'labelerB', icon: 'user', label: 'Labeler B', x: 570, y: 280, color: '#f87171' },
      { id: 'pii', icon: 'document', label: 'PII Exposed', x: 400, y: 80, color: '#f87171' },
    ],
    edges: [
      { from: 'db', to: 'export', color: '#2dd4bf', animated: true, label: 'Export' },
      { from: 'export', to: 'platform', color: '#a78bfa', animated: true, label: 'No Redact' },
      { from: 'platform', to: 'pii', color: '#f87171', animated: true, label: 'Exposed' },
      { from: 'platform', to: 'labelerA', color: '#f87171', animated: true, label: 'View PII' },
      { from: 'platform', to: 'labelerB', color: '#f87171', animated: true, label: 'View PII' },
    ],
    dangerZone: { x: 490, y: 60, width: 160, height: 280, label: 'PII Exposure' },
  },

  DSGAI20: {
    nodes: [
      { id: 'attacker', icon: 'user', label: 'Attacker', x: 80, y: 200, color: '#f87171' },
      { id: 'api', icon: 'router', label: 'API', x: 230, y: 200, color: '#fb923c' },
      { id: 'model', icon: 'cloud', label: 'Model', x: 400, y: 200, color: '#60a5fa' },
      { id: 'student', icon: 'server', label: 'Student Model', x: 600, y: 200, color: '#f87171' },
      { id: 'pairs', icon: 'document', label: '100K Pairs', x: 500, y: 100, color: '#fbbf24' },
      { id: 'clone', icon: 'cloud', label: 'Clone', x: 600, y: 320, color: '#f87171' },
    ],
    edges: [
      { from: 'attacker', to: 'api', color: '#f87171', animated: true, label: 'Automate' },
      { from: 'api', to: 'model', color: '#fb923c', animated: true, label: 'Query' },
      { from: 'model', to: 'pairs', color: '#fbbf24', animated: true, label: 'I/O Pairs' },
      { from: 'pairs', to: 'student', color: '#f87171', animated: true, label: 'Train' },
      { from: 'student', to: 'clone', color: '#f87171', animated: true, label: 'Distill' },
    ],
    dangerZone: { x: 420, y: 40, width: 240, height: 120, label: 'Model Theft' },
  },

  DSGAI21: {
    nodes: [
      { id: 'attacker', icon: 'user', label: 'Attacker', x: 60, y: 120, color: '#f87171' },
      { id: 'false', icon: 'document', label: 'False Data', x: 200, y: 120, color: '#fbbf24' },
      { id: 'trusted', icon: 'database', label: 'Trusted DB', x: 370, y: 200, color: '#2dd4bf' },
      { id: 'rag', icon: 'cloud', label: 'RAG System', x: 530, y: 200, color: '#60a5fa' },
      { id: 'victim', icon: 'user', label: 'Victim', x: 650, y: 280, color: '#60a5fa' },
      { id: 'auth', icon: 'document', label: 'Authoritative', x: 530, y: 320, color: '#f87171' },
    ],
    edges: [
      { from: 'attacker', to: 'false', color: '#f87171', animated: true, label: 'Inject' },
      { from: 'false', to: 'trusted', color: '#f87171', animated: true, label: 'Poison' },
      { from: 'trusted', to: 'rag', color: '#2dd4bf', animated: true, label: 'Retrieve' },
      { from: 'rag', to: 'auth', color: '#f87171', animated: true, label: 'Cite' },
      { from: 'rag', to: 'victim', color: '#f87171', animated: true, label: 'Misinfo' },
    ],
    dangerZone: { x: 130, y: 60, width: 310, height: 120, label: 'Poisoned Source' },
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

function FlowEdge({ fromNode, toNode, color, animated, label, idx, diagramId }) {
  const x1 = fromNode.x
  const y1 = fromNode.y
  const x2 = toNode.x
  const y2 = toNode.y

  const isAttack = color === '#f87171'
  const dur = [2, 2.5, 3, 3.5][idx % 4]
  const markerId = `arrow-${diagramId}-${idx}`
  const pathId = `motion-${diagramId}-${fromNode.id}-${toNode.id}-${idx}`

  // Offset label perpendicular to line to avoid overlap
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const mx = (x1 + x2) / 2 + nx * 10
  const my = (y1 + y2) / 2 + ny * 10

  return (
    <g>
      {/* Per-edge arrow marker */}
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>

      {/* Flow line */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={isAttack ? 2 : 1.5}
        strokeOpacity={isAttack ? 0.8 : 0.5}
        className={isAttack ? 'flow-line-attack' : 'flow-line'}
        markerEnd={`url(#${markerId})`}
      />

      {/* Invisible path for animateMotion */}
      <path
        id={pathId}
        d={`M${x1},${y1} L${x2},${y2}`}
        fill="none"
        stroke="none"
      />

      {/* Animated data packet */}
      {animated && (
        <circle
          r={isAttack ? 4 : 3}
          fill={color}
          opacity="0.9"
        >
          <animateMotion dur={`${dur}s`} repeatCount="indefinite">
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      )}

      {/* Edge label */}
      {label && (
        <text
          x={mx}
          y={my}
          fontSize="9"
          fontFamily="monospace"
          textAnchor="middle"
          className="diagram-sublabel"
        >
          {label}
        </text>
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
      <div className="p-3">
        <svg viewBox="0 0 700 400" width="100%" className="block">
          {/* Background */}
          <rect x="0" y="0" width="700" height="400" rx="8" className="diagram-bg" />

          {/* Grid lines for topology feel */}
          {[80, 160, 240, 320].map(y => (
            <line key={`h-${y}`} x1="0" y1={y} x2="700" y2={y} strokeWidth="1" className="diagram-grid" />
          ))}
          {[140, 280, 420, 560].map(x => (
            <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="400" strokeWidth="1" className="diagram-grid" />
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
                y={config.dangerZone.y + 14}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                opacity="0.7"
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
                idx={i}
                diagramId={risk.id}
              />
            )
          })}

          {/* Nodes */}
          {config.nodes.map(node => (
            <g key={node.id}>
              {/* Icon with background circle */}
              <RenderIcon icon={node.icon} x={node.x} y={node.y} color={node.color} />
              {/* Label */}
              <text
                x={node.x}
                y={node.y + 32}
                fontSize="10"
                fontFamily="monospace"
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
          <span className="text-[11px] text-owasp-muted">Normal flow</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="32" height="10" viewBox="0 0 32 10">
            <line x1="0" y1="5" x2="32" y2="5" stroke="#f87171" strokeWidth="2" strokeDasharray="8 3" />
          </svg>
          <span className="text-[11px] text-owasp-muted">Attack path</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="24" height="16" viewBox="0 0 24 16">
            <rect x="1" y="1" width="22" height="14" rx="3" fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
          </svg>
          <span className="text-[11px] text-owasp-muted">Danger zone</span>
        </div>

        {/* Icon types */}
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="5" r="3" fill="none" stroke="#60a5fa" strokeWidth="1" />
            <path d="M3 14 C3 10 6 8 8 8 C10 8 13 10 13 14" fill="none" stroke="#60a5fa" strokeWidth="1" />
          </svg>
          <span className="text-[11px] text-owasp-muted">User / Actor</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect x="1" y="2" width="14" height="5" rx="2" fill="none" stroke="#a78bfa" strokeWidth="1" />
            <rect x="1" y="9" width="14" height="5" rx="2" fill="none" stroke="#a78bfa" strokeWidth="1" />
          </svg>
          <span className="text-[11px] text-owasp-muted">Server</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <ellipse cx="8" cy="4" rx="6" ry="3" fill="none" stroke="#2dd4bf" strokeWidth="1" />
            <line x1="2" y1="4" x2="2" y2="12" stroke="#2dd4bf" strokeWidth="1" />
            <line x1="14" y1="4" x2="14" y2="12" stroke="#2dd4bf" strokeWidth="1" />
            <ellipse cx="8" cy="12" rx="6" ry="3" fill="none" stroke="#2dd4bf" strokeWidth="1" />
          </svg>
          <span className="text-[11px] text-owasp-muted">Database</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M3 10 C1 10 0 9 0 7.5 C0 5.5 2 4 4 4 C4.5 2 6 1 8 1 C10.5 1 12 2.5 12.5 4 C14 4.5 15 5.5 15 7 C15 8.5 13.5 10 12 10 Z" fill="none" stroke="#60a5fa" strokeWidth="1" />
          </svg>
          <span className="text-[11px] text-owasp-muted">Cloud / LLM</span>
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

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCat('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            activeCat === 'all'
              ? 'bg-owasp-text text-owasp-bg border-owasp-text'
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

      {/* Diagram Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filtered.map(risk => (
          <NetworkDiagram key={risk.id} risk={risk} />
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
