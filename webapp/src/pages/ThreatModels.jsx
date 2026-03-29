import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, AlertTriangle, ChevronDown, ChevronUp,
  Download, ExternalLink, Target, FileText,
} from 'lucide-react'
import { risks, categories } from '../data/risks'
import { useTheme } from '../components/ThemeContext'

// ---------------------------------------------------------------------------
// Category color maps (mirrors existing pattern in the codebase)
// ---------------------------------------------------------------------------
const catColorClass = {
  leakage: 'text-cat-leakage',
  identity: 'text-cat-identity',
  governance: 'text-cat-governance',
  poisoning: 'text-cat-poisoning',
  infra: 'text-cat-infra',
  compliance: 'text-cat-compliance',
  attack: 'text-cat-attack',
}
const catBgSoftClass = {
  leakage: 'bg-cat-leakage-bg',
  identity: 'bg-cat-identity-bg',
  governance: 'bg-cat-governance-bg',
  poisoning: 'bg-cat-poisoning-bg',
  infra: 'bg-cat-infra-bg',
  compliance: 'bg-cat-compliance-bg',
  attack: 'bg-cat-attack-bg',
}
const catBorderClass = {
  leakage: 'border-cat-leakage',
  identity: 'border-cat-identity',
  governance: 'border-cat-governance',
  poisoning: 'border-cat-poisoning',
  infra: 'border-cat-infra',
  compliance: 'border-cat-compliance',
  attack: 'border-cat-attack',
}

// ---------------------------------------------------------------------------
// Threat Model Data — All 21 DSGAI Risks
// ---------------------------------------------------------------------------
const threatModelData = {
  DSGAI01: {
    assets: ['Training data', 'RAG corpus', 'Vector embeddings', 'Model weights', 'User prompts'],
    trustBoundaries: ['Model API boundary', 'RAG retrieval layer', 'Vector store access layer', 'Output rendering'],
    stride: {
      spoofing: { applicable: true, threat: 'Attacker impersonates legitimate user to extract training data via crafted prompts', likelihood: 'High', impact: 'High' },
      tampering: { applicable: true, threat: 'Adversarial inputs modify retrieval results to surface sensitive documents', likelihood: 'Medium', impact: 'High' },
      repudiation: { applicable: true, threat: 'No audit trail linking specific queries to data leakage events', likelihood: 'Medium', impact: 'Medium' },
      informationDisclosure: { applicable: true, threat: 'Model memorization enables verbatim extraction of PII/secrets from training data', likelihood: 'High', impact: 'Critical' },
      denialOfService: { applicable: false, threat: '', likelihood: '', impact: '' },
      elevationOfPrivilege: { applicable: true, threat: 'RAG retrieval bypasses document-level ACLs, returning restricted content', likelihood: 'Medium', impact: 'High' },
    },
    dataFlows: [
      { from: 'User', to: 'LLM API', data: 'Prompts', classification: 'Variable' },
      { from: 'LLM API', to: 'Vector Store', data: 'Embedding queries', classification: 'Internal' },
      { from: 'Vector Store', to: 'LLM API', data: 'Retrieved passages', classification: 'Confidential' },
      { from: 'LLM API', to: 'User', data: 'Generated response', classification: 'Variable' },
    ],
    controls: ['Input sanitization', 'Output DLP scanning', 'Per-document ACLs on retrieval', 'Rate limiting on queries', 'Prompt injection detection'],
    residualRisks: ['Memorization in model weights cannot be fully eliminated', 'Machine unlearning limitations persist'],
  },
  DSGAI02: {
    assets: ['Agent credentials', 'API keys', 'OAuth tokens', 'Service accounts', 'Credential vaults'],
    trustBoundaries: ['Agent runtime boundary', 'Credential store interface', 'External API boundary'],
    stride: {
      spoofing: { applicable: true, threat: 'Stolen agent credentials used to impersonate automated workflows', likelihood: 'High', impact: 'Critical' },
      tampering: { applicable: true, threat: 'Credential rotation metadata altered to extend token lifetimes', likelihood: 'Low', impact: 'High' },
      repudiation: { applicable: true, threat: 'Agent actions with shared credentials cannot be attributed to specific invocations', likelihood: 'High', impact: 'Medium' },
      informationDisclosure: { applicable: true, threat: 'API keys logged in plaintext via debug output or telemetry', likelihood: 'Medium', impact: 'Critical' },
      denialOfService: { applicable: true, threat: 'Credential revocation locks out dependent agent workflows', likelihood: 'Low', impact: 'Medium' },
      elevationOfPrivilege: { applicable: true, threat: 'Agent assumes broader permissions than intended via over-scoped service account', likelihood: 'High', impact: 'Critical' },
    },
    dataFlows: [
      { from: 'Agent Runtime', to: 'Credential Vault', data: 'Credential requests', classification: 'Restricted' },
      { from: 'Credential Vault', to: 'Agent Runtime', data: 'Tokens/keys', classification: 'Restricted' },
      { from: 'Agent Runtime', to: 'External API', data: 'Authenticated requests', classification: 'Confidential' },
      { from: 'External API', to: 'Agent Runtime', data: 'API responses', classification: 'Variable' },
    ],
    controls: ['Short-lived token issuance', 'Least-privilege scoping per agent', 'Credential rotation automation', 'Secrets scanning in logs', 'Per-invocation audit trail', 'Hardware-backed key storage'],
    residualRisks: ['Credential caching in agent memory during execution', 'Third-party API key exposure outside org control'],
  },
  DSGAI03: {
    assets: ['Corporate data stores', 'User documents', 'SaaS application data', 'Browser extension data', 'Clipboard contents'],
    trustBoundaries: ['Corporate network perimeter', 'SaaS API gateway', 'Browser sandbox', 'Endpoint DLP boundary'],
    stride: {
      spoofing: { applicable: true, threat: 'Shadow AI tools impersonate sanctioned services to bypass DLP', likelihood: 'Medium', impact: 'High' },
      tampering: { applicable: false, threat: '', likelihood: '', impact: '' },
      repudiation: { applicable: true, threat: 'Unsanctioned tool usage leaves no audit trail in corporate SIEM', likelihood: 'High', impact: 'Medium' },
      informationDisclosure: { applicable: true, threat: 'Employees paste confidential data into unauthorized AI chatbots', likelihood: 'High', impact: 'Critical' },
      denialOfService: { applicable: false, threat: '', likelihood: '', impact: '' },
      elevationOfPrivilege: { applicable: true, threat: 'Browser extensions gain access to all page content including auth sessions', likelihood: 'Medium', impact: 'High' },
    },
    dataFlows: [
      { from: 'Employee', to: 'Unsanctioned AI', data: 'Corporate documents', classification: 'Confidential' },
      { from: 'Unsanctioned AI', to: 'Third-party Cloud', data: 'Training data', classification: 'Restricted' },
      { from: 'Browser Extension', to: 'External Server', data: 'Page content', classification: 'Variable' },
    ],
    controls: ['AI usage policy enforcement', 'Network-level blocking of unsanctioned AI domains', 'Endpoint DLP for clipboard/upload monitoring', 'Sanctioned AI catalog with SSO integration', 'Periodic shadow AI discovery scans'],
    residualRisks: ['Personal device usage bypasses corporate controls', 'New AI tools appear faster than policy can adapt'],
  },
  DSGAI04: {
    assets: ['Training datasets', 'Fine-tuning data', 'Model artifacts', 'Data pipelines', 'Model registry'],
    trustBoundaries: ['Data ingestion boundary', 'Training pipeline perimeter', 'Model registry access layer', 'Artifact distribution channel'],
    stride: {
      spoofing: { applicable: true, threat: 'Attacker injects poisoned samples disguised as legitimate training data', likelihood: 'Medium', impact: 'Critical' },
      tampering: { applicable: true, threat: 'Training data modified in transit to embed backdoor triggers', likelihood: 'Medium', impact: 'Critical' },
      repudiation: { applicable: true, threat: 'No provenance tracking for individual training samples', likelihood: 'High', impact: 'Medium' },
      informationDisclosure: { applicable: true, threat: 'Poisoning attacks reveal which data was used in training via probing', likelihood: 'Low', impact: 'Medium' },
      denialOfService: { applicable: true, threat: 'Corrupted training data causes model training failures or degradation', likelihood: 'Medium', impact: 'High' },
      elevationOfPrivilege: { applicable: true, threat: 'Compromised model artifact in registry gains elevated runtime permissions', likelihood: 'Low', impact: 'Critical' },
    },
    dataFlows: [
      { from: 'Data Sources', to: 'Ingestion Pipeline', data: 'Raw training data', classification: 'Confidential' },
      { from: 'Ingestion Pipeline', to: 'Training Cluster', data: 'Processed datasets', classification: 'Internal' },
      { from: 'Training Cluster', to: 'Model Registry', data: 'Model artifacts', classification: 'Restricted' },
      { from: 'Model Registry', to: 'Serving Infrastructure', data: 'Deployed models', classification: 'Restricted' },
    ],
    controls: ['Cryptographic signing of training data', 'Model artifact integrity verification', 'Data provenance tracking', 'Anomaly detection in training metrics', 'Supply chain SBOM for datasets'],
    residualRisks: ['Subtle poisoning may not be detectable by statistical methods', 'Pre-trained base models inherit upstream risks'],
  },
  DSGAI05: {
    assets: ['Input validation schemas', 'Data quality pipelines', 'Feature stores', 'ETL workflows', 'Labeled datasets'],
    trustBoundaries: ['Data ingestion API', 'Feature store access layer', 'Labeling platform boundary'],
    stride: {
      spoofing: { applicable: false, threat: '', likelihood: '', impact: '' },
      tampering: { applicable: true, threat: 'Malformed input data bypasses schema validation and corrupts feature store', likelihood: 'High', impact: 'High' },
      repudiation: { applicable: true, threat: 'Data quality failures cannot be traced to source due to missing lineage', likelihood: 'Medium', impact: 'Medium' },
      informationDisclosure: { applicable: true, threat: 'Validation error messages expose internal schema details', likelihood: 'Low', impact: 'Low' },
      denialOfService: { applicable: true, threat: 'Volume of malformed data overwhelms validation pipeline', likelihood: 'Medium', impact: 'High' },
      elevationOfPrivilege: { applicable: false, threat: '', likelihood: '', impact: '' },
    },
    dataFlows: [
      { from: 'External Sources', to: 'Validation Engine', data: 'Raw input data', classification: 'Variable' },
      { from: 'Validation Engine', to: 'Feature Store', data: 'Validated features', classification: 'Internal' },
      { from: 'Feature Store', to: 'Training Pipeline', data: 'Feature vectors', classification: 'Internal' },
      { from: 'Labeling Platform', to: 'Training Pipeline', data: 'Labeled data', classification: 'Confidential' },
    ],
    controls: ['Schema-enforced input validation', 'Data lineage tracking', 'Automated data quality scoring', 'Drift detection on feature distributions', 'Input sanitization at ingestion boundary'],
    residualRisks: ['Semantic data quality issues escape syntactic validation', 'Label noise from human annotators persists'],
  },
  DSGAI06: {
    assets: ['Tool/plugin APIs', 'Agent orchestration state', 'Inter-tool data payloads', 'Plugin credentials', 'Sandbox runtime'],
    trustBoundaries: ['Plugin sandbox boundary', 'Agent orchestrator interface', 'External tool API boundary', 'Data serialization layer'],
    stride: {
      spoofing: { applicable: true, threat: 'Malicious plugin impersonates trusted tool to intercept data flow', likelihood: 'Medium', impact: 'High' },
      tampering: { applicable: true, threat: 'Plugin modifies agent state or tool output to inject malicious payloads', likelihood: 'Medium', impact: 'Critical' },
      repudiation: { applicable: true, threat: 'Plugin actions not logged, preventing forensic analysis', likelihood: 'High', impact: 'Medium' },
      informationDisclosure: { applicable: true, threat: 'Over-permissioned plugin accesses data beyond its intended scope', likelihood: 'High', impact: 'High' },
      denialOfService: { applicable: true, threat: 'Misbehaving plugin consumes all available agent runtime resources', likelihood: 'Medium', impact: 'Medium' },
      elevationOfPrivilege: { applicable: true, threat: 'Plugin escapes sandbox to access host system resources', likelihood: 'Low', impact: 'Critical' },
    },
    dataFlows: [
      { from: 'Agent Orchestrator', to: 'Plugin/Tool', data: 'Task context + parameters', classification: 'Confidential' },
      { from: 'Plugin/Tool', to: 'External API', data: 'API requests', classification: 'Variable' },
      { from: 'External API', to: 'Plugin/Tool', data: 'API responses', classification: 'Variable' },
      { from: 'Plugin/Tool', to: 'Agent Orchestrator', data: 'Tool results', classification: 'Internal' },
    ],
    controls: ['Plugin sandboxing with resource limits', 'Capability-based permission model', 'Tool output validation/sanitization', 'Plugin registry with signed manifests', 'Per-tool audit logging'],
    residualRisks: ['Sandbox escape via zero-day vulnerabilities', 'Complex tool chains create emergent data exposure paths'],
  },
  DSGAI07: {
    assets: ['Data classification policies', 'Retention schedules', 'Data catalog', 'Consent records', 'Lineage metadata'],
    trustBoundaries: ['Policy engine boundary', 'Data catalog API', 'Consent management interface'],
    stride: {
      spoofing: { applicable: false, threat: '', likelihood: '', impact: '' },
      tampering: { applicable: true, threat: 'Classification labels downgraded to circumvent handling restrictions', likelihood: 'Medium', impact: 'High' },
      repudiation: { applicable: true, threat: 'Policy override decisions made without approval trail', likelihood: 'High', impact: 'High' },
      informationDisclosure: { applicable: true, threat: 'Data catalog exposes sensitive metadata to unauthorized roles', likelihood: 'Medium', impact: 'Medium' },
      denialOfService: { applicable: false, threat: '', likelihood: '', impact: '' },
      elevationOfPrivilege: { applicable: true, threat: 'Self-service data access bypasses classification-based controls', likelihood: 'Medium', impact: 'High' },
    },
    dataFlows: [
      { from: 'Data Sources', to: 'Classification Engine', data: 'Raw data samples', classification: 'Variable' },
      { from: 'Classification Engine', to: 'Data Catalog', data: 'Labels & metadata', classification: 'Internal' },
      { from: 'Data Catalog', to: 'Policy Engine', data: 'Classification policies', classification: 'Internal' },
      { from: 'Policy Engine', to: 'AI Pipelines', data: 'Access decisions', classification: 'Internal' },
    ],
    controls: ['Automated data classification at ingestion', 'Retention policy enforcement', 'Lineage graph for all AI data assets', 'Classification-aware access controls', 'Periodic governance audits'],
    residualRisks: ['Unstructured data resists automated classification', 'Cross-border data flows complicate lifecycle management'],
  },
  DSGAI08: {
    assets: ['Compliance documentation', 'Audit logs', 'Consent databases', 'Regulatory filings', 'DPIA records'],
    trustBoundaries: ['Compliance reporting boundary', 'Audit log storage', 'Regulatory submission interface'],
    stride: {
      spoofing: { applicable: false, threat: '', likelihood: '', impact: '' },
      tampering: { applicable: true, threat: 'Audit logs altered to conceal non-compliant AI processing', likelihood: 'Low', impact: 'Critical' },
      repudiation: { applicable: true, threat: 'Absence of immutable logs enables denial of regulatory violations', likelihood: 'High', impact: 'Critical' },
      informationDisclosure: { applicable: true, threat: 'Compliance reports inadvertently include PII in evidence attachments', likelihood: 'Medium', impact: 'High' },
      denialOfService: { applicable: false, threat: '', likelihood: '', impact: '' },
      elevationOfPrivilege: { applicable: true, threat: 'Compliance officer role escalated to modify retention policies', likelihood: 'Low', impact: 'High' },
    },
    dataFlows: [
      { from: 'AI Systems', to: 'Audit Logger', data: 'Processing records', classification: 'Internal' },
      { from: 'Audit Logger', to: 'Compliance Dashboard', data: 'Aggregated metrics', classification: 'Confidential' },
      { from: 'Compliance Dashboard', to: 'Regulatory Bodies', data: 'Compliance reports', classification: 'Restricted' },
    ],
    controls: ['Immutable append-only audit logs', 'Automated DPIA generation for AI use cases', 'Regulatory change monitoring', 'Consent lifecycle management', 'Cross-jurisdictional data flow mapping', 'Annual compliance attestation workflow'],
    residualRisks: ['Regulatory landscape evolves faster than internal controls can adapt', 'Algorithmic transparency requirements still maturing'],
  },
  DSGAI09: {
    assets: ['Image/audio/video inputs', 'Multimodal model pipelines', 'OCR text extractions', 'Audio transcripts', 'Screen captures'],
    trustBoundaries: ['Media ingestion boundary', 'Multimodal processing pipeline', 'Cross-modal output interface', 'Content delivery layer'],
    stride: {
      spoofing: { applicable: true, threat: 'Deepfake audio/video spoofs identity verification in multimodal pipeline', likelihood: 'Medium', impact: 'Critical' },
      tampering: { applicable: true, threat: 'Steganographic payloads embedded in images alter model behavior', likelihood: 'Low', impact: 'High' },
      repudiation: { applicable: true, threat: 'No provenance tracking for multimodal inputs across channels', likelihood: 'Medium', impact: 'Medium' },
      informationDisclosure: { applicable: true, threat: 'OCR extraction from screenshots captures credentials visible on screen', likelihood: 'High', impact: 'Critical' },
      denialOfService: { applicable: true, threat: 'Large media files exhaust processing pipeline resources', likelihood: 'Medium', impact: 'Medium' },
      elevationOfPrivilege: { applicable: false, threat: '', likelihood: '', impact: '' },
    },
    dataFlows: [
      { from: 'User', to: 'Media Preprocessor', data: 'Images/audio/video', classification: 'Variable' },
      { from: 'Media Preprocessor', to: 'Multimodal Model', data: 'Extracted features', classification: 'Internal' },
      { from: 'Multimodal Model', to: 'Output Renderer', data: 'Cross-modal response', classification: 'Variable' },
      { from: 'OCR Engine', to: 'Text Pipeline', data: 'Extracted text', classification: 'Confidential' },
    ],
    controls: ['Media content scanning before ingestion', 'Deepfake detection on audio/video inputs', 'PII redaction in OCR outputs', 'Input size and format validation', 'Cross-channel data flow tagging'],
    residualRisks: ['Novel steganographic techniques may evade detection', 'Multimodal context windows create combinatorial leakage paths'],
  },
  DSGAI10: {
    assets: ['Synthetic datasets', 'Anonymized records', 'Transformation pipelines', 'Original source data', 'De-identification models'],
    trustBoundaries: ['Anonymization pipeline boundary', 'Synthetic data generator interface', 'Data consumer access layer'],
    stride: {
      spoofing: { applicable: false, threat: '', likelihood: '', impact: '' },
      tampering: { applicable: true, threat: 'Anonymization parameters weakened to preserve data utility at cost of privacy', likelihood: 'Medium', impact: 'High' },
      repudiation: { applicable: true, threat: 'No audit trail for anonymization parameter selection decisions', likelihood: 'Medium', impact: 'Medium' },
      informationDisclosure: { applicable: true, threat: 'Synthetic data retains statistical patterns enabling re-identification', likelihood: 'High', impact: 'Critical' },
      denialOfService: { applicable: false, threat: '', likelihood: '', impact: '' },
      elevationOfPrivilege: { applicable: true, threat: 'Access to both anonymized and auxiliary data enables linkage attacks', likelihood: 'Medium', impact: 'High' },
    },
    dataFlows: [
      { from: 'Source Data', to: 'Anonymization Engine', data: 'Raw PII records', classification: 'Restricted' },
      { from: 'Anonymization Engine', to: 'Synthetic Generator', data: 'Statistical distributions', classification: 'Confidential' },
      { from: 'Synthetic Generator', to: 'Data Consumers', data: 'Synthetic datasets', classification: 'Internal' },
      { from: 'Audit System', to: 'Compliance', data: 'Anonymization parameters', classification: 'Internal' },
    ],
    controls: ['k-anonymity / l-diversity / t-closeness verification', 'Re-identification risk scoring', 'Differential privacy guarantees', 'Synthetic data quality validation', 'Access controls on auxiliary datasets'],
    residualRisks: ['Composition attacks across multiple synthetic releases', 'Utility-privacy tradeoff cannot be fully resolved'],
  },
  DSGAI11: {
    assets: ['Conversation histories', 'Session state', 'User context windows', 'Shared memory stores', 'Tenant isolation boundaries'],
    trustBoundaries: ['Session isolation boundary', 'Multi-tenant data partition', 'Shared memory access layer', 'Context window boundary'],
    stride: {
      spoofing: { applicable: true, threat: 'Session token reuse allows attacker to access another user conversation', likelihood: 'Medium', impact: 'Critical' },
      tampering: { applicable: true, threat: 'Shared context store allows one user to inject content into another session', likelihood: 'Medium', impact: 'High' },
      repudiation: { applicable: true, threat: 'Conversation bleed events cannot be attributed to root cause', likelihood: 'Medium', impact: 'Medium' },
      informationDisclosure: { applicable: true, threat: 'Residual context from prior user session leaks into new conversation', likelihood: 'High', impact: 'Critical' },
      denialOfService: { applicable: true, threat: 'Context window exhaustion from leaked cross-session state', likelihood: 'Low', impact: 'Medium' },
      elevationOfPrivilege: { applicable: true, threat: 'Admin conversation context bleeds into standard user sessions', likelihood: 'Low', impact: 'Critical' },
    },
    dataFlows: [
      { from: 'User A', to: 'Session Manager', data: 'Conversation input', classification: 'Confidential' },
      { from: 'Session Manager', to: 'LLM Runtime', data: 'Session context', classification: 'Confidential' },
      { from: 'LLM Runtime', to: 'Shared Memory', data: 'Conversation state', classification: 'Restricted' },
      { from: 'Shared Memory', to: 'User B (unintended)', data: 'Leaked context', classification: 'Restricted' },
    ],
    controls: ['Strict session isolation with unique context IDs', 'Tenant-partitioned memory stores', 'Context window purging between sessions', 'Session state encryption at rest', 'Cross-session leakage detection monitoring'],
    residualRisks: ['LLM internal state may retain cross-session patterns', 'Shared infrastructure caching creates subtle leakage vectors'],
  },
  DSGAI12: {
    assets: ['Database schemas', 'SQL/Graph query engines', 'Natural language interfaces', 'Query result sets', 'Database credentials'],
    trustBoundaries: ['NL-to-query translation boundary', 'Database access layer', 'Query result filtering layer'],
    stride: {
      spoofing: { applicable: true, threat: 'Crafted natural language input generates queries under a privileged database role', likelihood: 'Medium', impact: 'Critical' },
      tampering: { applicable: true, threat: 'LLM generates UPDATE/DELETE statements from manipulated natural language input', likelihood: 'High', impact: 'Critical' },
      repudiation: { applicable: true, threat: 'Generated queries not logged, preventing attribution of destructive operations', likelihood: 'Medium', impact: 'High' },
      informationDisclosure: { applicable: true, threat: 'LLM constructs queries that bypass row-level security to access other tenants data', likelihood: 'High', impact: 'Critical' },
      denialOfService: { applicable: true, threat: 'LLM generates cartesian joins or recursive queries causing database overload', likelihood: 'Medium', impact: 'High' },
      elevationOfPrivilege: { applicable: true, threat: 'Natural language injection escalates to database admin operations via GRANT statements', likelihood: 'Low', impact: 'Critical' },
    },
    dataFlows: [
      { from: 'User', to: 'NL-to-SQL Engine', data: 'Natural language query', classification: 'Internal' },
      { from: 'NL-to-SQL Engine', to: 'Query Validator', data: 'Generated SQL', classification: 'Internal' },
      { from: 'Query Validator', to: 'Database', data: 'Sanitized query', classification: 'Restricted' },
      { from: 'Database', to: 'Result Filter', data: 'Raw results', classification: 'Confidential' },
      { from: 'Result Filter', to: 'User', data: 'Filtered results', classification: 'Variable' },
    ],
    controls: ['Read-only database connections by default', 'SQL allowlist validation (no DDL/DML)', 'Row-level security enforcement', 'Query cost estimation and timeouts', 'Generated query audit logging', 'Result set size limits'],
    residualRisks: ['Novel SQL injection via natural language is an evolving attack surface', 'Schema inference from query errors remains possible'],
  },
  DSGAI13: {
    assets: ['Vector embeddings', 'Vector store indices', 'Metadata filters', 'Embedding model', 'Tenant namespace data'],
    trustBoundaries: ['Vector store API boundary', 'Tenant isolation layer', 'Embedding generation boundary'],
    stride: {
      spoofing: { applicable: true, threat: 'Attacker crafts embeddings that mimic legitimate queries to probe restricted namespaces', likelihood: 'Medium', impact: 'High' },
      tampering: { applicable: true, threat: 'Injection of adversarial vectors to manipulate nearest-neighbor search results', likelihood: 'Medium', impact: 'High' },
      repudiation: { applicable: true, threat: 'Vector store queries lack attribution to originating user or application', likelihood: 'High', impact: 'Medium' },
      informationDisclosure: { applicable: true, threat: 'Cross-tenant namespace leakage exposes embeddings from other organizations', likelihood: 'High', impact: 'Critical' },
      denialOfService: { applicable: true, threat: 'High-dimensional adversarial queries degrade index performance', likelihood: 'Medium', impact: 'Medium' },
      elevationOfPrivilege: { applicable: true, threat: 'Metadata filter bypass allows access to restricted document embeddings', likelihood: 'Medium', impact: 'High' },
    },
    dataFlows: [
      { from: 'Application', to: 'Embedding Model', data: 'Text/queries', classification: 'Variable' },
      { from: 'Embedding Model', to: 'Vector Store', data: 'Vector embeddings', classification: 'Internal' },
      { from: 'Vector Store', to: 'Application', data: 'Nearest neighbors + metadata', classification: 'Confidential' },
      { from: 'Admin', to: 'Vector Store', data: 'Index management operations', classification: 'Restricted' },
    ],
    controls: ['Tenant-isolated namespaces/collections', 'Metadata-based ACL filtering at query time', 'Embedding encryption at rest', 'API authentication and rate limiting', 'Vector store access audit logging'],
    residualRisks: ['Embedding inversion attacks may reconstruct source text', 'Shared infrastructure side channels in managed vector stores'],
  },
  DSGAI14: {
    assets: ['Telemetry data', 'Application logs', 'Monitoring dashboards', 'Trace spans', 'Prompt/response logs'],
    trustBoundaries: ['Telemetry collection boundary', 'Log aggregation pipeline', 'Dashboard access layer'],
    stride: {
      spoofing: { applicable: false, threat: '', likelihood: '', impact: '' },
      tampering: { applicable: true, threat: 'Log tampering to conceal security incidents or policy violations', likelihood: 'Low', impact: 'High' },
      repudiation: { applicable: true, threat: 'Disabled or incomplete logging enables unattributable actions', likelihood: 'Medium', impact: 'High' },
      informationDisclosure: { applicable: true, threat: 'Prompt/response pairs logged verbatim expose PII and secrets to log consumers', likelihood: 'High', impact: 'Critical' },
      denialOfService: { applicable: true, threat: 'Log volume from verbose telemetry overwhelms aggregation infrastructure', likelihood: 'Medium', impact: 'Medium' },
      elevationOfPrivilege: { applicable: true, threat: 'Monitoring dashboard access grants visibility into sensitive operational data', likelihood: 'Medium', impact: 'High' },
    },
    dataFlows: [
      { from: 'AI Application', to: 'Telemetry Collector', data: 'Traces, metrics, logs', classification: 'Confidential' },
      { from: 'Telemetry Collector', to: 'Log Aggregator', data: 'Structured logs', classification: 'Internal' },
      { from: 'Log Aggregator', to: 'Monitoring Dashboard', data: 'Aggregated metrics', classification: 'Internal' },
      { from: 'Log Aggregator', to: 'SIEM', data: 'Security events', classification: 'Confidential' },
    ],
    controls: ['PII/secret scrubbing in log pipeline', 'Log access RBAC with need-to-know', 'Immutable append-only log storage', 'Telemetry sampling for cost/privacy balance', 'Prompt/response redaction before logging'],
    residualRisks: ['Novel PII patterns may escape scrubbing rules', 'Operational necessity sometimes requires verbose logging of sensitive context'],
  },
  DSGAI15: {
    assets: ['System prompts', 'Context window contents', 'User conversation history', 'Injected documents', 'Few-shot examples'],
    trustBoundaries: ['Context window boundary', 'Prompt construction layer', 'Document injection interface'],
    stride: {
      spoofing: { applicable: true, threat: 'Injected documents masquerade as system instructions to hijack model behavior', likelihood: 'High', impact: 'High' },
      tampering: { applicable: true, threat: 'Excessive context injection dilutes safety instructions with adversarial content', likelihood: 'Medium', impact: 'High' },
      repudiation: { applicable: true, threat: 'No record of what was included in context window at inference time', likelihood: 'High', impact: 'Medium' },
      informationDisclosure: { applicable: true, threat: 'Over-broad context includes documents the user should not see in model output', likelihood: 'High', impact: 'Critical' },
      denialOfService: { applicable: true, threat: 'Context window saturation prevents legitimate instructions from being processed', likelihood: 'Medium', impact: 'Medium' },
      elevationOfPrivilege: { applicable: false, threat: '', likelihood: '', impact: '' },
    },
    dataFlows: [
      { from: 'Application', to: 'Prompt Builder', data: 'System prompt + user query', classification: 'Internal' },
      { from: 'Document Store', to: 'Prompt Builder', data: 'Context documents', classification: 'Variable' },
      { from: 'Prompt Builder', to: 'LLM', data: 'Full context window', classification: 'Confidential' },
      { from: 'LLM', to: 'User', data: 'Generated response', classification: 'Variable' },
    ],
    controls: ['Context window content auditing', 'Document-level access control before injection', 'Prompt template parameterization', 'Context relevance scoring to limit over-sharing', 'System prompt integrity verification'],
    residualRisks: ['Long context windows increase attack surface for indirect prompt injection', 'Relevance scoring may include borderline sensitive documents'],
  },
  DSGAI16: {
    assets: ['Browser DOM content', 'Desktop application data', 'Clipboard contents', 'Screen content', 'Local file system'],
    trustBoundaries: ['Browser extension sandbox', 'OS process isolation', 'Application permission boundary', 'Network egress boundary'],
    stride: {
      spoofing: { applicable: true, threat: 'Browser assistant spoofs trusted UI elements to harvest credentials', likelihood: 'Medium', impact: 'Critical' },
      tampering: { applicable: true, threat: 'Assistant modifies page DOM to alter displayed information or inject scripts', likelihood: 'Medium', impact: 'High' },
      repudiation: { applicable: true, threat: 'Assistant actions on behalf of user cannot be distinguished from user actions', likelihood: 'High', impact: 'Medium' },
      informationDisclosure: { applicable: true, threat: 'Assistant reads all visible page content including banking/medical portals', likelihood: 'High', impact: 'Critical' },
      denialOfService: { applicable: false, threat: '', likelihood: '', impact: '' },
      elevationOfPrivilege: { applicable: true, threat: 'Desktop assistant escalates from user-space to access system-level APIs', likelihood: 'Low', impact: 'Critical' },
    },
    dataFlows: [
      { from: 'Browser/Desktop', to: 'AI Assistant', data: 'Page/screen content', classification: 'Variable' },
      { from: 'AI Assistant', to: 'Cloud API', data: 'Context + queries', classification: 'Confidential' },
      { from: 'Cloud API', to: 'AI Assistant', data: 'Suggestions/actions', classification: 'Internal' },
      { from: 'AI Assistant', to: 'Browser/Desktop', data: 'Automated actions', classification: 'Internal' },
    ],
    controls: ['Granular per-site permission model', 'Content classification before cloud transmission', 'Action confirmation for sensitive operations', 'Network egress DLP filtering', 'Periodic permission review and attestation'],
    residualRisks: ['Users grant blanket permissions for convenience', 'Screen content classification cannot catch all sensitive data'],
  },
  DSGAI17: {
    assets: ['Model serving infrastructure', 'Training compute clusters', 'Data pipeline orchestrators', 'Backup systems', 'CDN/edge caches'],
    trustBoundaries: ['Infrastructure management boundary', 'Backup/restore interface', 'Pipeline orchestration layer'],
    stride: {
      spoofing: { applicable: false, threat: '', likelihood: '', impact: '' },
      tampering: { applicable: true, threat: 'Backup corruption renders recovery artifacts unusable after incident', likelihood: 'Low', impact: 'Critical' },
      repudiation: { applicable: false, threat: '', likelihood: '', impact: '' },
      informationDisclosure: { applicable: true, threat: 'Stale model artifacts in CDN cache serve outdated data after model update', likelihood: 'Medium', impact: 'Medium' },
      denialOfService: { applicable: true, threat: 'Single point of failure in inference pipeline causes complete service outage', likelihood: 'High', impact: 'Critical' },
      elevationOfPrivilege: { applicable: true, threat: 'Infrastructure management credentials provide access to all tenant data', likelihood: 'Low', impact: 'Critical' },
    },
    dataFlows: [
      { from: 'Data Pipeline', to: 'Training Cluster', data: 'Training data batches', classification: 'Confidential' },
      { from: 'Training Cluster', to: 'Model Store', data: 'Trained artifacts', classification: 'Restricted' },
      { from: 'Model Store', to: 'Serving Fleet', data: 'Model weights', classification: 'Restricted' },
      { from: 'Serving Fleet', to: 'CDN/Edge', data: 'Cached responses', classification: 'Variable' },
    ],
    controls: ['Multi-region redundancy for serving', 'Automated failover and health checks', 'Immutable backup verification', 'Pipeline circuit breakers', 'Infrastructure-as-code with drift detection'],
    residualRisks: ['Correlated failures across regions during major incidents', 'Recovery time for large model artifacts may exceed SLAs'],
  },
  DSGAI18: {
    assets: ['Model outputs', 'Embedding vectors', 'Gradient information', 'Confidence scores', 'Training data (inferred)'],
    trustBoundaries: ['Model inference API', 'Confidence score exposure boundary', 'Embedding export interface'],
    stride: {
      spoofing: { applicable: false, threat: '', likelihood: '', impact: '' },
      tampering: { applicable: false, threat: '', likelihood: '', impact: '' },
      repudiation: { applicable: true, threat: 'Inference attacks leave no trace in standard monitoring', likelihood: 'High', impact: 'Medium' },
      informationDisclosure: { applicable: true, threat: 'Membership inference determines if specific records were in training data', likelihood: 'High', impact: 'Critical' },
      denialOfService: { applicable: false, threat: '', likelihood: '', impact: '' },
      elevationOfPrivilege: { applicable: true, threat: 'Model inversion reconstructs sensitive training inputs from output distributions', likelihood: 'Medium', impact: 'Critical' },
    },
    dataFlows: [
      { from: 'Attacker', to: 'Model API', data: 'Probing queries', classification: 'Public' },
      { from: 'Model API', to: 'Attacker', data: 'Outputs + confidence scores', classification: 'Internal' },
      { from: 'Attacker', to: 'Reconstruction Engine', data: 'Collected responses', classification: 'Internal' },
      { from: 'Reconstruction Engine', to: 'Attacker', data: 'Reconstructed training data', classification: 'Restricted' },
    ],
    controls: ['Confidence score rounding/suppression', 'Output perturbation (differential privacy)', 'Rate limiting on inference API', 'Query pattern anomaly detection', 'Embedding access restriction'],
    residualRisks: ['Sophisticated attackers can work with limited signal', 'Differential privacy degrades model utility'],
  },
  DSGAI19: {
    assets: ['Labeling platforms', 'Annotator workstations', 'Raw labeling data', 'Annotator PII', 'Quality review queues'],
    trustBoundaries: ['Labeling platform access boundary', 'Data exposure interface', 'Annotator network boundary'],
    stride: {
      spoofing: { applicable: true, threat: 'Unauthorized annotator gains access to labeling platform via shared credentials', likelihood: 'Medium', impact: 'High' },
      tampering: { applicable: true, threat: 'Malicious annotator intentionally mislabels data to bias model behavior', likelihood: 'Medium', impact: 'High' },
      repudiation: { applicable: true, threat: 'Annotation decisions not attributed to individual labelers', likelihood: 'High', impact: 'Medium' },
      informationDisclosure: { applicable: true, threat: 'Labelers exposed to sensitive PII/PHI without appropriate clearance or training', likelihood: 'High', impact: 'Critical' },
      denialOfService: { applicable: false, threat: '', likelihood: '', impact: '' },
      elevationOfPrivilege: { applicable: false, threat: '', likelihood: '', impact: '' },
    },
    dataFlows: [
      { from: 'Data Pipeline', to: 'Labeling Platform', data: 'Unlabeled samples', classification: 'Confidential' },
      { from: 'Labeling Platform', to: 'Annotators', data: 'Data + instructions', classification: 'Confidential' },
      { from: 'Annotators', to: 'Labeling Platform', data: 'Labels + annotations', classification: 'Internal' },
      { from: 'Labeling Platform', to: 'Training Pipeline', data: 'Labeled datasets', classification: 'Confidential' },
    ],
    controls: ['Data minimization for labeling tasks', 'Annotator background checks and NDAs', 'PII redaction before labeling exposure', 'Per-annotator audit trails', 'Annotation quality cross-validation'],
    residualRisks: ['Annotators may photograph or memorize sensitive content', 'Offshore labeling teams face varying privacy regulations'],
  },
  DSGAI20: {
    assets: ['Model weights', 'Model architecture details', 'Distillation outputs', 'Model APIs', 'Proprietary training techniques'],
    trustBoundaries: ['Model serving API', 'Model storage boundary', 'Distillation/export interface', 'IP protection boundary'],
    stride: {
      spoofing: { applicable: true, threat: 'Attacker deploys stolen model replica claiming it as their own', likelihood: 'Medium', impact: 'High' },
      tampering: { applicable: true, threat: 'Exfiltrated model modified to remove watermarks or fingerprints', likelihood: 'Medium', impact: 'High' },
      repudiation: { applicable: true, threat: 'Model theft difficult to prove without embedded watermarks', likelihood: 'High', impact: 'High' },
      informationDisclosure: { applicable: true, threat: 'Model extraction via systematic API querying reconstructs model behavior', likelihood: 'High', impact: 'Critical' },
      denialOfService: { applicable: false, threat: '', likelihood: '', impact: '' },
      elevationOfPrivilege: { applicable: true, threat: 'Access to model weights reveals proprietary architecture and training methodology', likelihood: 'Medium', impact: 'High' },
    },
    dataFlows: [
      { from: 'Model Store', to: 'Serving Infrastructure', data: 'Model weights', classification: 'Restricted' },
      { from: 'Attacker', to: 'Model API', data: 'Extraction queries', classification: 'Public' },
      { from: 'Model API', to: 'Attacker', data: 'Outputs for distillation', classification: 'Internal' },
      { from: 'Attacker', to: 'Replica Model', data: 'Distilled weights', classification: 'Restricted' },
    ],
    controls: ['Model watermarking and fingerprinting', 'API query rate limiting and pattern detection', 'Model weight encryption at rest and in transit', 'Access controls on model registry', 'Legal protections (patents, trade secrets)', 'Output perturbation to hinder distillation'],
    residualRisks: ['Sufficiently resourced adversaries can extract models despite protections', 'Watermark removal techniques continue to advance'],
  },
  DSGAI21: {
    assets: ['Public-facing AI outputs', 'Content generation pipelines', 'Training data sources', 'Fact-checking systems', 'Content moderation filters'],
    trustBoundaries: ['Content generation boundary', 'Fact-checking interface', 'Public distribution channel', 'Training data ingestion'],
    stride: {
      spoofing: { applicable: true, threat: 'AI-generated disinformation mimics trusted source formatting and style', likelihood: 'High', impact: 'Critical' },
      tampering: { applicable: true, threat: 'Training data poisoned with disinformation to embed false narratives in model', likelihood: 'Medium', impact: 'Critical' },
      repudiation: { applicable: true, threat: 'AI-generated content lacks provenance, preventing attribution to source', likelihood: 'High', impact: 'High' },
      informationDisclosure: { applicable: false, threat: '', likelihood: '', impact: '' },
      denialOfService: { applicable: true, threat: 'Flood of AI-generated disinformation overwhelms content moderation systems', likelihood: 'High', impact: 'High' },
      elevationOfPrivilege: { applicable: false, threat: '', likelihood: '', impact: '' },
    },
    dataFlows: [
      { from: 'Attacker', to: 'Training Pipeline', data: 'Poisoned data sources', classification: 'Public' },
      { from: 'Poisoned Model', to: 'Content Pipeline', data: 'Biased/false outputs', classification: 'Internal' },
      { from: 'Content Pipeline', to: 'Public Channels', data: 'Disinformation', classification: 'Public' },
      { from: 'Fact-Check System', to: 'Content Pipeline', data: 'Verification signals', classification: 'Internal' },
    ],
    controls: ['AI content provenance and watermarking (C2PA)', 'Automated fact-checking integration', 'Content moderation with human review', 'Training data source verification', 'Output grounding with citation requirements'],
    residualRisks: ['Adversarial actors constantly evolve disinformation tactics', 'Grounding cannot fully prevent hallucinated citations'],
  },
}

// ---------------------------------------------------------------------------
// STRIDE labels & styling helpers
// ---------------------------------------------------------------------------
const strideLabels = {
  spoofing: { short: 'S', full: 'Spoofing', icon: '🎭' },
  tampering: { short: 'T', full: 'Tampering', icon: '✏️' },
  repudiation: { short: 'R', full: 'Repudiation', icon: '❓' },
  informationDisclosure: { short: 'I', full: 'Information Disclosure', icon: '📄' },
  denialOfService: { short: 'D', full: 'Denial of Service', icon: '🚫' },
  elevationOfPrivilege: { short: 'E', full: 'Elevation of Privilege', icon: '⬆️' },
}

function severityColor(level, dark) {
  const map = {
    Critical: dark ? 'bg-red-900/50 text-red-300 border border-red-500/40' : 'bg-red-100 text-red-800 border border-red-300',
    High: dark ? 'bg-orange-900/50 text-orange-300 border border-orange-500/40' : 'bg-orange-100 text-orange-800 border border-orange-300',
    Medium: dark ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/40' : 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    Low: dark ? 'bg-green-900/50 text-green-300 border border-green-500/40' : 'bg-green-100 text-green-800 border border-green-300',
  }
  return map[level] || (dark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600')
}

function classificationBadge(classification, dark) {
  const map = {
    Public: dark ? 'bg-green-900/50 text-green-300 border-green-500/40' : 'bg-green-100 text-green-800 border-green-300',
    Internal: dark ? 'bg-blue-900/50 text-blue-300 border-blue-500/40' : 'bg-blue-100 text-blue-800 border-blue-300',
    Confidential: dark ? 'bg-amber-900/50 text-amber-300 border-amber-500/40' : 'bg-amber-100 text-amber-800 border-amber-300',
    Restricted: dark ? 'bg-red-900/50 text-red-300 border-red-500/40' : 'bg-red-100 text-red-800 border-red-300',
    Variable: dark ? 'bg-purple-900/50 text-purple-300 border-purple-500/40' : 'bg-purple-100 text-purple-800 border-purple-300',
  }
  return map[classification] || (dark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600')
}

// ---------------------------------------------------------------------------
// Export helper
// ---------------------------------------------------------------------------
function exportThreatModel(riskId, risk, model) {
  const blob = new Blob([JSON.stringify({
    riskId,
    riskTitle: risk.title,
    category: risk.category,
    generatedAt: new Date().toISOString(),
    framework: 'OWASP DSGAI',
    methodology: 'STRIDE',
    ...model,
  }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `threat-model-${riskId}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Threat Model Card Component
// ---------------------------------------------------------------------------
function ThreatModelCard({ risk, model, dark }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-xl border ${dark ? 'bg-owasp-card border-owasp-border' : 'bg-white border-gray-200'} transition-all duration-200`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-mono font-bold ${dark ? 'bg-owasp-blue/20 text-owasp-blue' : 'bg-blue-100 text-blue-800'}`}>
            {risk.id}
          </span>
          <h3 className={`text-lg font-semibold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
            {risk.title}
          </h3>
          <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${catBgSoftClass[risk.category]} ${catColorClass[risk.category]}`}>
            {risk.categoryLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <span className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            {Object.values(model.stride).filter(s => s.applicable).length}/6 STRIDE
          </span>
          {expanded ? (
            <ChevronUp className={`w-5 h-5 ${dark ? 'text-gray-400' : 'text-gray-500'}`} />
          ) : (
            <ChevronDown className={`w-5 h-5 ${dark ? 'text-gray-400' : 'text-gray-500'}`} />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className={`border-t ${dark ? 'border-owasp-border' : 'border-gray-200'} p-5 space-y-6`}>

          {/* Assets */}
          <div>
            <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Target className="w-4 h-4" /> Assets
            </h4>
            <div className="flex flex-wrap gap-2">
              {model.assets.map((asset, i) => (
                <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${dark ? 'bg-blue-900/30 text-blue-300 border border-blue-500/30' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                  {asset}
                </span>
              ))}
            </div>
          </div>

          {/* Trust Boundaries */}
          <div>
            <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Shield className="w-4 h-4" /> Trust Boundaries
            </h4>
            <div className="flex flex-wrap gap-2">
              {model.trustBoundaries.map((tb, i) => (
                <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-medium border-l-4 ${dark ? 'bg-gray-800 border-owasp-blue text-gray-300' : 'bg-gray-50 border-blue-500 text-gray-700'}`}>
                  {tb}
                </span>
              ))}
            </div>
          </div>

          {/* STRIDE Table */}
          <div>
            <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <AlertTriangle className="w-4 h-4" /> STRIDE Analysis
            </h4>
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                <thead>
                  <tr className={`${dark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                    <th className="text-left px-3 py-2 font-medium w-10"></th>
                    <th className="text-left px-3 py-2 font-medium">Category</th>
                    <th className="text-left px-3 py-2 font-medium">Threat</th>
                    <th className="text-center px-3 py-2 font-medium">Likelihood</th>
                    <th className="text-center px-3 py-2 font-medium">Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(model.stride).map(([key, val]) => (
                    <tr key={key} className={`border-t ${dark ? 'border-gray-700/50' : 'border-gray-100'} ${!val.applicable ? (dark ? 'opacity-40' : 'opacity-40') : ''}`}>
                      <td className="px-3 py-2.5 font-mono font-bold text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold ${val.applicable ? (dark ? 'bg-owasp-blue/20 text-owasp-blue' : 'bg-blue-100 text-blue-700') : (dark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400')}`}>
                          {strideLabels[key].short}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-medium whitespace-nowrap">{strideLabels[key].full}</td>
                      <td className={`px-3 py-2.5 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {val.applicable ? val.threat : <span className="italic">Not applicable</span>}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {val.applicable && val.likelihood && (
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${severityColor(val.likelihood, dark)}`}>
                            {val.likelihood}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {val.applicable && val.impact && (
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${severityColor(val.impact, dark)}`}>
                            {val.impact}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Flows */}
          <div>
            <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <FileText className="w-4 h-4" /> Data Flows
            </h4>
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                <thead>
                  <tr className={`${dark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                    <th className="text-left px-3 py-2 font-medium">From</th>
                    <th className="text-left px-3 py-2 font-medium">To</th>
                    <th className="text-left px-3 py-2 font-medium">Data</th>
                    <th className="text-center px-3 py-2 font-medium">Classification</th>
                  </tr>
                </thead>
                <tbody>
                  {model.dataFlows.map((flow, i) => (
                    <tr key={i} className={`border-t ${dark ? 'border-gray-700/50' : 'border-gray-100'}`}>
                      <td className="px-3 py-2.5 font-medium">{flow.from}</td>
                      <td className="px-3 py-2.5 font-medium">{flow.to}</td>
                      <td className={`px-3 py-2.5 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{flow.data}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${classificationBadge(flow.classification, dark)}`}>
                          {flow.classification}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommended Controls */}
          <div>
            <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Shield className="w-4 h-4" /> Recommended Controls
            </h4>
            <ul className="space-y-1.5">
              {model.controls.map((ctrl, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-xs ${dark ? 'bg-green-900/40 text-green-400 border border-green-500/30' : 'bg-green-100 text-green-600 border border-green-200'}`}>
                    ✓
                  </span>
                  <span className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{ctrl}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Residual Risks */}
          <div>
            <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <AlertTriangle className="w-4 h-4" /> Residual Risks
            </h4>
            <div className="space-y-2">
              {model.residualRisks.map((rr, i) => (
                <div key={i} className={`flex items-start gap-2 p-3 rounded-lg border-l-4 ${dark ? 'bg-amber-900/10 border-amber-500/60 text-amber-300' : 'bg-amber-50 border-amber-400 text-amber-800'}`}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rr}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => exportThreatModel(risk.id, risk, model)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dark ? 'bg-owasp-blue/20 text-owasp-blue hover:bg-owasp-blue/30 border border-owasp-blue/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'}`}
            >
              <Download className="w-4 h-4" />
              Export as JSON
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------
export default function ThreatModels() {
  const { dark } = useTheme()
  const [activeCat, setActiveCat] = useState('all')

  const filtered = activeCat === 'all'
    ? risks
    : risks.filter(r => r.category === activeCat)

  const risksWithModels = filtered.filter(r => threatModelData[r.id])

  return (
    <div className="py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${dark ? 'bg-owasp-blue/20' : 'bg-blue-100'}`}>
            <Shield className={`w-7 h-7 ${dark ? 'text-owasp-blue' : 'text-blue-700'}`} />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
              Threat Model Templates
            </h1>
            <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              STRIDE-based threat models for OWASP DSGAI risks
            </p>
          </div>
        </div>
        <p className={`max-w-3xl ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
          Pre-built threat models for each of the 21 DSGAI risks using the STRIDE methodology. Each model identifies
          assets, trust boundaries, data flows, and recommended controls. Export individual models as JSON for integration
          with your threat modeling workflow.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCat('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeCat === 'all'
            ? (dark ? 'bg-owasp-blue text-white' : 'bg-blue-600 text-white')
            : (dark ? 'bg-gray-800 text-gray-400 hover:text-gray-300' : 'bg-gray-100 text-gray-600 hover:text-gray-800')
          }`}
        >
          All ({risks.filter(r => threatModelData[r.id]).length})
        </button>
        {categories.map(cat => {
          const count = risks.filter(r => r.category === cat.id && threatModelData[r.id]).length
          if (count === 0) return null
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeCat === cat.id
                ? (dark ? 'bg-owasp-blue text-white' : 'bg-blue-600 text-white')
                : (dark ? 'bg-gray-800 text-gray-400 hover:text-gray-300' : 'bg-gray-100 text-gray-600 hover:text-gray-800')
              }`}
            >
              {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Threat Model Cards */}
      <div className="space-y-4">
        {risksWithModels.map(risk => (
          <ThreatModelCard
            key={risk.id}
            risk={risk}
            model={threatModelData[risk.id]}
            dark={dark}
          />
        ))}
      </div>

      {risksWithModels.length === 0 && (
        <div className={`text-center py-16 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No threat models found for this category.</p>
        </div>
      )}
    </div>
  )
}
