import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckSquare,
  Square,
  Clock,
  Wrench,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Download,
} from 'lucide-react'
import { risks, categories, tierLabels } from '../data/risks'
import { useTheme } from '../components/ThemeContext'

// ---------------------------------------------------------------------------
// Theme color maps
// ---------------------------------------------------------------------------

const tierColorsDark = {
  tier1: { accent: '#16a34a', bg: '#0f1a14', border: '#166534', text: '#86efac' },
  tier2: { accent: '#d97706', bg: '#1a1a0d', border: '#92400e', text: '#fcd34d' },
  tier3: { accent: '#9333ea', bg: '#1a1530', border: '#6b21a8', text: '#d8b4fe' },
}
const tierColorsLight = {
  tier1: { accent: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
  tier2: { accent: '#d97706', bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
  tier3: { accent: '#9333ea', bg: '#faf5ff', border: '#e9d5ff', text: '#6b21a8' },
}

const scopeColorsDark = {
  Buy:   { bg: '#1e3a5f', text: '#93c5fd' },
  Build: { bg: '#064e3b', text: '#6ee7b7' },
  Both:  { bg: '#312e81', text: '#c4b5fd' },
}
const scopeColorsLight = {
  Buy:   { bg: '#dbeafe', text: '#1d4ed8' },
  Build: { bg: '#d1fae5', text: '#047857' },
  Both:  { bg: '#ede9fe', text: '#6d28d9' },
}

function getScopeStyle(scope, dark) {
  const sc = dark ? scopeColorsDark : scopeColorsLight
  if (scope.includes('Buy') && scope.includes('Build')) return sc.Both
  if (scope.includes('Buy')) return sc.Buy
  if (scope.includes('Build')) return sc.Build
  return sc.Both
}

const catColorMap = Object.fromEntries(categories.map(c => [c.id, c]))

// ---------------------------------------------------------------------------
// Effort color helper
// ---------------------------------------------------------------------------

function getEffortStyle(effort, dark) {
  const lower = effort.toLowerCase()
  const isShort = /^(1|2|3|4|<1|0\.5)\s*(hour|day|hr)/i.test(lower) || lower.includes('< 1 week') || lower.includes('<1 week')
  const isMed = /(1[- ]2 week|5[- ]10 day|1 week)/i.test(lower)
  // Everything else is long/red
  if (isShort) {
    return dark
      ? { bg: '#064e3b', text: '#6ee7b7' }
      : { bg: '#d1fae5', text: '#047857' }
  }
  if (isMed) {
    return dark
      ? { bg: '#713f12', text: '#fde68a' }
      : { bg: '#fef3c7', text: '#a16207' }
  }
  return dark
    ? { bg: '#7f1d1d', text: '#fca5a5' }
    : { bg: '#fee2e2', text: '#b91c1c' }
}

// ---------------------------------------------------------------------------
// Checklist metadata — enhanced info for each risk / tier / item
// ---------------------------------------------------------------------------

const checklistMeta = {
  DSGAI01: {
    tier1: [
      { effort: '1-2 days', tools: ['AWS Macie', 'Microsoft Purview', 'Google DLP'], prereqs: 'Data classification policy defined', doneWhen: 'No-train/no-retain tags enforced on all user upload endpoints' },
      { effort: '2-3 days', tools: ['Microsoft Purview', 'Nightfall AI'], prereqs: 'Inventory of RAG data sources', doneWhen: 'All over-broad permissions remediated in RAG feeder systems' },
      { effort: '1-2 days', tools: ['AWS Macie', 'Nightfall AI', 'Google DLP'], prereqs: 'PII taxonomy agreed upon', doneWhen: 'Pre-processing pipeline scans 100% of training inputs for PII' },
      { effort: '1 day', tools: ['Prompt management framework'], prereqs: 'Prompt template repository exists', doneWhen: 'All prompt templates use parameterized references, no inline secrets' },
      { effort: '2-3 days', tools: ['Pinecone ACL', 'Weaviate RBAC', 'Qdrant namespaces'], prereqs: 'RAG pipeline documented', doneWhen: 'Document-level permissions enforced on all RAG retrieval paths' },
      { effort: '1 day', tools: ['API gateway', 'Kong', 'Envoy'], prereqs: 'API gateway deployed', doneWhen: 'Per-user rate limits active; extraction attack patterns blocked' },
      { effort: '2-3 days', tools: ['OPA', 'Lakera Guard', 'Prompt Armor'], prereqs: 'Output policy definitions approved', doneWhen: 'Policy compliance checks gate 100% of model responses' },
    ],
    tier2: [
      { effort: '1-2 weeks', tools: ['HashiCorp Vault', 'AWS KMS', 'Azure Key Vault'], prereqs: 'Encryption key management strategy', doneWhen: 'All pipeline artifacts encrypted at rest and in transit' },
      { effort: '1-2 weeks', tools: ['Nightfall AI', 'Microsoft Purview', 'Google DLP'], prereqs: 'DLP rules tuned for AI context', doneWhen: 'Real-time DLP scanning on all model I/O with <100ms latency impact' },
      { effort: '2-3 weeks', tools: ['Custom ML pipeline tooling'], prereqs: 'Threat model for model extraction', doneWhen: 'Distillation defense measures verified via red-team test' },
      { effort: '1-2 weeks', tools: ['Lakera Guard', 'Prompt Armor', 'Rebuff'], prereqs: 'Indirect injection taxonomy', doneWhen: 'Indirect prompt injection exfiltration blocked in automated tests' },
      { effort: '1 week', tools: ['FF3-1 libraries', 'Voltage SecureData'], prereqs: 'Fields requiring FPE identified', doneWhen: 'Format-preserving encryption on all sensitive fields in pipeline' },
      { effort: '1-2 weeks', tools: ['Pinecone', 'Weaviate', 'Qdrant'], prereqs: 'RAG retrieval pipeline instrumented', doneWhen: 'Relevance score thresholds and output grounding checks active' },
    ],
    tier3: [
      { effort: '2-4 weeks', tools: ['Internal red team', 'Adversarial NLP toolkit'], prereqs: 'Red-team charter approved', doneWhen: 'Quarterly red-team report with no critical extraction findings' },
      { effort: '3-6 weeks', tools: ['TensorFlow Privacy', 'PyTorch Opacus', 'Opaque Systems'], prereqs: 'Privacy budget (epsilon) defined', doneWhen: 'Model trained with DP guarantees; epsilon within budget' },
      { effort: '4-8 weeks', tools: ['Custom unlearning pipeline', 'SISA framework'], prereqs: 'Verifiable erasure requirements documented', doneWhen: 'Erasure requests verified via membership inference testing post-unlearning' },
    ],
  },

  DSGAI02: {
    tier1: [
      { effort: '2-3 days', tools: ['AWS IAM', 'Azure AD', 'CyberArk'], prereqs: 'Identity governance policy exists', doneWhen: 'All agent identities use short-lived tokens with minimum required scopes' },
      { effort: '1-2 days', tools: ['HashiCorp Vault', 'AWS Secrets Manager', 'CyberArk'], prereqs: 'Secrets management platform deployed', doneWhen: 'Zero embedded credentials; all secrets fetched from vault at runtime' },
      { effort: '2-3 days', tools: ['Splunk', 'Microsoft Sentinel', 'Elastic SIEM'], prereqs: 'Log aggregation infrastructure', doneWhen: 'Tamper-proof audit logs cover all credential usage and token issuance' },
    ],
    tier2: [
      { effort: '1-2 weeks', tools: ['Auth0', 'Okta', 'AWS IAM'], prereqs: 'OAuth 2.0 infrastructure', doneWhen: 'Task-scoped tokens issued per sub-agent invocation; no inherited tokens' },
      { effort: '1-2 weeks', tools: ['Astrix Security', 'Oasis Security', 'CyberArk'], prereqs: 'NHI baseline inventory', doneWhen: 'Continuous NHI discovery running; stale credentials auto-rotated' },
      { effort: '1-2 weeks', tools: ['Splunk UBA', 'Microsoft Sentinel', 'Elastic SIEM'], prereqs: 'Baseline agent access patterns', doneWhen: 'Anomaly alerts firing on out-of-scope credential usage' },
    ],
    tier3: [
      { effort: '3-6 weeks', tools: ['SPIFFE/SPIRE', 'HashiCorp Vault PKI'], prereqs: 'PKI infrastructure planned', doneWhen: 'All agents authenticate with PKI-backed identities; mTLS enforced' },
    ],
  },

  DSGAI03: {
    tier1: [
      { effort: '1-2 days', tools: ['Confluence', 'SharePoint', 'Internal wiki'], prereqs: 'Legal review of policy', doneWhen: 'AUP published and acknowledged by all employees' },
      { effort: '2-3 days', tools: ['Zscaler', 'Netskope', 'Microsoft Defender for Cloud Apps'], prereqs: 'CASB deployed or procurable', doneWhen: 'Traffic to known GenAI endpoints detected and logged' },
      { effort: '1 day', tools: ['LMS platform', 'KnowBe4', 'Proofpoint SAT'], prereqs: 'Training content developed', doneWhen: 'All employees complete GenAI data classification training' },
    ],
    tier2: [
      { effort: '1-2 weeks', tools: ['ServiceNow', 'Internal catalog'], prereqs: 'Procurement process for AI tools', doneWhen: 'Vetted GenAI catalog published with DPA summaries' },
      { effort: '1-2 weeks', tools: ['Nightfall AI', 'Microsoft Purview', 'Netskope DLP'], prereqs: 'DLP rules defined for AI context', doneWhen: 'DLP blocks classified data from reaching unapproved GenAI services' },
      { effort: '1 week', tools: ['Legal review templates', 'OneTrust'], prereqs: 'Contract review checklist for AI features', doneWhen: 'All SaaS contracts reviewed for AI data processing terms' },
    ],
    tier3: [
      { effort: '2-4 weeks', tools: ['Zscaler', 'Netskope', 'Custom detection'], prereqs: 'GenAI endpoint database maintained', doneWhen: 'Real-time discovery and blocking of unsanctioned GenAI tools' },
      { effort: '3-6 weeks', tools: ['BigID', 'OneTrust', 'Custom data flow mapper'], prereqs: 'SaaS inventory complete', doneWhen: 'Automated data flow maps cover all SaaS including embedded AI features' },
    ],
  },

  DSGAI04: {
    tier1: [
      { effort: '1-2 days', tools: ['Sigstore', 'cosign', 'Hugging Face safetensors'], prereqs: 'Artifact signing key infrastructure', doneWhen: 'All model loads verify signatures; pickle deserialization blocked' },
      { effort: '2-3 days', tools: ['MLflow', 'Weights & Biases', 'DVC'], prereqs: 'Model registry selected', doneWhen: 'Immutable registry with full provenance for every artifact' },
      { effort: '2-3 days', tools: ['Custom validation pipeline', 'Semgrep'], prereqs: 'RAG ingestion pipeline documented', doneWhen: 'All RAG documents validated for integrity and adversarial patterns' },
    ],
    tier2: [
      { effort: '1 week', tools: ['SHA-256 chain', 'Sigstore'], prereqs: 'Pipeline stages inventoried', doneWhen: 'Hash verification at every stage promotion gate' },
      { effort: '1-2 weeks', tools: ['MLflow', 'Custom eval harness'], prereqs: 'Golden evaluation datasets prepared', doneWhen: 'Automated drift detection running on every model update' },
      { effort: '1-2 weeks', tools: ['Snyk', 'SPDX', 'CycloneDX'], prereqs: 'Dependency tracking process', doneWhen: 'SBOM/DBOM generated and tracked for all AI artifacts' },
    ],
    tier3: [
      { effort: '4-8 weeks', tools: ['Custom formal methods tooling'], prereqs: 'Behavioral boundaries defined', doneWhen: 'Formal verification passing for all defined boundary conditions' },
      { effort: '2-4 weeks', tools: ['Internal red team', 'Neural Cleanse', 'STRIP'], prereqs: 'Red-team engagement scoped', doneWhen: 'Red-team report confirms no planted backdoors detected' },
      { effort: '3-6 weeks', tools: ['Intel SGX', 'AMD SEV', 'AWS Nitro Enclaves'], prereqs: 'TEE infrastructure available', doneWhen: 'Training pipeline runs in TEE with hardware attestation' },
    ],
  },

  DSGAI05: {
    tier1: [
      { effort: '1-2 days', tools: ['JSON Schema', 'Pydantic', 'Cerberus'], prereqs: 'Input schema specifications', doneWhen: 'All pipeline inputs validated against strict schemas' },
      { effort: '1-2 days', tools: ['OWASP ZAP', 'Custom sanitizers'], prereqs: 'Input sanitization requirements', doneWhen: 'Path traversal and encoding attacks blocked on all input channels' },
      { effort: '1 day', tools: ['Docker', 'Linux capabilities'], prereqs: 'Container orchestration', doneWhen: 'Import operations run with read-only filesystem except designated dirs' },
    ],
    tier2: [
      { effort: '1-2 weeks', tools: ['Custom validation framework', 'Semgrep'], prereqs: 'Content validation rules defined', doneWhen: 'Semantic content checks catch adversarial patterns in test suite' },
      { effort: '1 week', tools: ['Qdrant', 'Weaviate', 'Milvus'], prereqs: 'Snapshot workflow documented', doneWhen: 'Hash chain verification and path validation on all snapshot restores' },
      { effort: '1-2 weeks', tools: ['Firecracker', 'gVisor', 'Kata Containers'], prereqs: 'Sandbox runtime available', doneWhen: 'All import and restore operations execute in isolated sandbox' },
    ],
    tier3: [
      { effort: '2-4 weeks', tools: ['AFL', 'LibFuzzer', 'Atheris'], prereqs: 'Fuzzing harnesses written', doneWhen: 'Adversarial fuzzing integrated into CI/CD; zero critical bypasses' },
      { effort: '3-6 weeks', tools: ['ANTLR', 'Custom grammar parsers'], prereqs: 'Formal grammar specifications', doneWhen: 'Formal grammar enforcement rejects all non-conforming inputs' },
    ],
  },

  DSGAI06: {
    tier1: [
      { effort: '1-2 days', tools: ['ServiceNow', 'Internal CMDB'], prereqs: 'Tool discovery completed', doneWhen: 'Centralized tool inventory with approval status for every integration' },
      { effort: '2-3 days', tools: ['Custom MCP proxy', 'LangChain middleware'], prereqs: 'Tool invocation paths mapped', doneWhen: 'Context forwarding stripped to minimum required fields per tool' },
      { effort: '1 day', tools: ['Git pinning', 'Dependabot lockfiles'], prereqs: 'MCP server list maintained', doneWhen: 'All MCP servers pinned to approved versions; updates require review' },
    ],
    tier2: [
      { effort: '1-2 weeks', tools: ['Custom payload filter', 'OPA'], prereqs: 'Field-level scoping rules defined', doneWhen: 'Per-tool payload schemas enforce field-level access control' },
      { effort: '1-2 weeks', tools: ['Splunk', 'Datadog', 'Microsoft Sentinel'], prereqs: 'Runtime monitoring infrastructure', doneWhen: 'Tool behavior monitoring alerts on anomalous network calls or data access' },
      { effort: '1 week', tools: ['Sigstore', 'cosign'], prereqs: 'Signing infrastructure available', doneWhen: 'All tools require signed manifests; unsigned tools rejected' },
    ],
    tier3: [
      { effort: '2-4 weeks', tools: ['Firecracker', 'gVisor', 'Wasm sandboxes'], prereqs: 'Sandbox runtime selected', doneWhen: 'All tools execute in sandboxes with capability-based security' },
      { effort: '2-4 weeks', tools: ['Custom flow analysis', 'OpenTelemetry'], prereqs: 'Agent architecture documented', doneWhen: 'Automated data flow analysis detects anomalous agent forwarding' },
    ],
  },

  DSGAI07: {
    tier1: [
      { effort: '2-3 days', tools: ['Collibra', 'BigID', 'Immuta'], prereqs: 'Existing classification framework', doneWhen: 'Classification framework extended to cover embeddings, weights, and caches' },
      { effort: '2-3 days', tools: ['Apache Atlas', 'OpenLineage', 'Marquez'], prereqs: 'Data lineage tooling selected', doneWhen: 'Lineage tracked from source records through all derivative stores' },
      { effort: '1-2 days', tools: ['Immuta', 'Custom lifecycle scripts'], prereqs: 'Retention policy defined', doneWhen: 'Retention and deletion policies applied to all derivative data stores' },
    ],
    tier2: [
      { effort: '1-2 weeks', tools: ['BigID', 'Custom propagation service'], prereqs: 'Label propagation rules defined', doneWhen: 'Labels automatically propagate from source to derived artifacts' },
      { effort: '2-3 weeks', tools: ['Custom orchestration', 'Apache Airflow'], prereqs: 'Deletion workflow documented', doneWhen: 'Coordinated deletion confirmed across all derivative artifacts' },
      { effort: '1-2 weeks', tools: ['CycloneDX', 'SPDX', 'Custom DBOM'], prereqs: 'Artifact inventory complete', doneWhen: 'DBOM maintained for every AI system with full data lineage' },
    ],
    tier3: [
      { effort: '3-6 weeks', tools: ['Custom cryptographic proof system'], prereqs: 'Deletion verification requirements', doneWhen: 'Verifiable deletion certificates generated for every erasure request' },
      { effort: '2-4 weeks', tools: ['BigID', 'OneTrust', 'Custom auditing'], prereqs: 'Compliance audit criteria defined', doneWhen: 'Automated compliance auditing verifies lifecycle across full lineage graph' },
    ],
  },

  DSGAI08: {
    tier1: [
      { effort: '2-3 days', tools: ['OneTrust', 'BigID', 'TrustArc'], prereqs: 'Legal basis review completed', doneWhen: 'Lawful basis tracked and documented for every AI data source' },
      { effort: '2-3 days', tools: ['OneTrust', 'Custom DSR tooling'], prereqs: 'DSR workflow exists', doneWhen: 'DSR workflow covers vector DBs, model registries, and inference caches' },
      { effort: '1-2 days', tools: ['Spreadsheet/GRC tool'], prereqs: 'Regulatory requirements inventoried', doneWhen: 'Regulatory map published covering every AI pipeline stage' },
    ],
    tier2: [
      { effort: '1-2 weeks', tools: ['OneTrust', 'Custom evidence generator'], prereqs: 'Evidence requirements defined', doneWhen: 'Automated evidence generation produces audit-ready artifacts on demand' },
      { effort: '1-2 weeks', tools: ['BigID', 'OneTrust', 'Immuta'], prereqs: 'Data flow inventory', doneWhen: 'Cross-jurisdiction data flows tracked with transfer mechanism documentation' },
      { effort: '1-2 weeks', tools: ['Internal risk assessment tool'], prereqs: 'EU AI Act classification criteria', doneWhen: 'All AI systems classified per EU AI Act with documentation maintained' },
    ],
    tier3: [
      { effort: '2-4 weeks', tools: ['BigID', 'Custom monitoring', 'OneTrust'], prereqs: 'Compliance baseline established', doneWhen: 'Continuous compliance monitoring alerts on regulatory non-conformance' },
      { effort: '2-4 weeks', tools: ['Custom automation', 'GRC platform'], prereqs: 'Audit framework defined', doneWhen: 'Audit artifacts auto-generated and audit-ready within 24 hours' },
    ],
  },

  DSGAI09: {
    tier1: [
      { effort: '1 day', tools: ['ExifTool', 'Sharp', 'Pillow'], prereqs: 'Media upload pipeline identified', doneWhen: 'All EXIF/GPS/device metadata stripped on upload before processing' },
      { effort: '1-2 days', tools: ['BigID', 'Collibra'], prereqs: 'OCR/ASR output stores identified', doneWhen: 'Classification labels applied to all OCR/ASR derivative outputs' },
      { effort: '1-2 days', tools: ['AWS S3 policies', 'Azure Blob ACL', 'GCS IAM'], prereqs: 'Storage bucket inventory', doneWhen: 'Strict ACLs and encryption enforced on all media derivative buckets' },
    ],
    tier2: [
      { effort: '1-2 weeks', tools: ['Nightfall AI', 'Microsoft Purview', 'Google DLP'], prereqs: 'DLP extended to derivative stores', doneWhen: 'DLP scanning covers all multimodal derivative stores' },
      { effort: '1-2 weeks', tools: ['OneTrust', 'Custom consent tracker'], prereqs: 'Consent framework for media', doneWhen: 'Consent status tracked for all media used in AI training' },
      { effort: '1-2 weeks', tools: ['Custom re-ID test harness'], prereqs: 'Re-identification test methodology', doneWhen: 'Cross-modal re-identification tests pass with acceptable risk levels' },
    ],
    tier3: [
      { effort: '3-6 weeks', tools: ['Custom CV pipeline', 'Azure AI Face API'], prereqs: 'Biometric detection requirements', doneWhen: 'Automated biometric detection and redaction in all media pipelines' },
      { effort: '3-6 weeks', tools: ['Opaque Systems', 'Custom privacy pipeline'], prereqs: 'Privacy-preserving methods selected', doneWhen: 'Feature extraction preserves utility without retaining identifiable data' },
    ],
  },

  DSGAI10: {
    tier1: [
      { effort: '2-3 days', tools: ['ARX', 'sdcMicro', 'Custom k-anon checks'], prereqs: 'De-identification methodology documented', doneWhen: 'k-anonymity and l-diversity validated before any de-identified data release' },
      { effort: '2-3 days', tools: ['ML Privacy Meter', 'TensorFlow Privacy'], prereqs: 'Membership inference test methodology', doneWhen: 'MI attack accuracy below threshold on all synthetic/de-ID outputs' },
      { effort: '1-2 days', tools: ['Apache Airflow', 'Custom audit pipeline'], prereqs: 'Transformation pipeline documented', doneWhen: 'Every transformation step validated and audit-logged' },
    ],
    tier2: [
      { effort: '2-3 weeks', tools: ['PyTorch Opacus', 'TensorFlow Privacy', 'Smartnoise'], prereqs: 'Privacy budget (epsilon) approved', doneWhen: 'Synthetic data generation uses DP with tracked epsilon budget' },
      { effort: '1-2 weeks', tools: ['BigID', 'ARX', 'Custom QID detector'], prereqs: 'External linkage datasets identified', doneWhen: 'Quasi-identifier combinations detected and suppressed automatically' },
      { effort: '1-2 weeks', tools: ['Custom risk assessment framework'], prereqs: 'Re-ID risk assessment schedule', doneWhen: 'Periodic re-identification risk assessments completed and documented' },
    ],
    tier3: [
      { effort: '4-8 weeks', tools: ['TensorFlow Privacy', 'PyTorch Opacus', 'OpenDP'], prereqs: 'Formal DP framework selected', doneWhen: 'Epsilon budgets tracked; cumulative privacy loss within defined bounds' },
      { effort: '2-4 weeks', tools: ['Custom monitoring', 'BigID'], prereqs: 'External data source monitoring', doneWhen: 'Continuous monitoring detects new re-identification risks from external data' },
    ],
  },

  DSGAI11: {
    tier1: [
      { effort: '2-3 days', tools: ['Pinecone namespaces', 'Weaviate tenants', 'Qdrant collections'], prereqs: 'Multi-tenant architecture documented', doneWhen: 'Per-tenant namespace isolation enforced in all vector stores' },
      { effort: '1 day', tools: ['CSPRNG libraries', 'UUID v4'], prereqs: 'Session management framework', doneWhen: 'All session IDs use cryptographically random, non-enumerable values' },
      { effort: '2-3 days', tools: ['vLLM', 'TGI', 'Custom inference server'], prereqs: 'Inference server architecture reviewed', doneWhen: 'KV-cache isolation between user sessions verified' },
    ],
    tier2: [
      { effort: '1 week', tools: ['Custom retrieval middleware', 'OPA'], prereqs: 'Tenant filtering rules defined', doneWhen: 'Server-side tenant filtering active on all retrieval endpoints' },
      { effort: '1-2 weeks', tools: ['Custom CI/CD test suite', 'Playwright'], prereqs: 'Multi-tenant test harness', doneWhen: 'Automated bleed testing in CI/CD catches cross-tenant leaks' },
      { effort: '1-2 weeks', tools: ['Splunk', 'Elastic SIEM', 'Custom monitoring'], prereqs: 'Query logging infrastructure', doneWhen: 'Cross-tenant contamination monitoring active with alerting' },
    ],
    tier3: [
      { effort: '4-8 weeks', tools: ['Custom formal verification tooling'], prereqs: 'Isolation model defined formally', doneWhen: 'Formal verification proves isolation guarantees for deployment architecture' },
      { effort: '4-8 weeks', tools: ['Custom inference architecture'], prereqs: 'Side-channel threat model', doneWhen: 'Inference architecture resistant to KV-cache and timing side-channels' },
    ],
  },

  DSGAI12: {
    tier1: [
      { effort: '1-2 days', tools: ['PostgreSQL RLS', 'MySQL views', 'Snowflake RLS'], prereqs: 'Database connection inventory', doneWhen: 'All NL-to-SQL connections use read-only accounts with minimal schema' },
      { effort: '1-2 days', tools: ['Custom SQL parser', 'sqlparse', 'OPA'], prereqs: 'Dangerous query patterns identified', doneWhen: 'Allowlist/blocklist enforced; DROP, DELETE, UNION blocked' },
      { effort: '2-3 days', tools: ['PostgreSQL RLS', 'Snowflake RBAC'], prereqs: 'Row-level security supported', doneWhen: 'User identity propagated through generated queries; RLS enforced' },
    ],
    tier2: [
      { effort: '1-2 weeks', tools: ['sqlparse', 'Custom AST validator'], prereqs: 'SQL validation rules defined', doneWhen: 'All LLM-generated SQL parsed, validated, and parameterized before execution' },
      { effort: '1 week', tools: ['Custom schema proxy', 'OPA'], prereqs: 'Schema sensitivity classification', doneWhen: 'Sensitive schema elements masked; table-level ACLs per user role' },
      { effort: '1-2 weeks', tools: ['Splunk', 'Elastic SIEM', 'Custom audit'], prereqs: 'Query audit pipeline', doneWhen: 'All generated queries logged with user attribution; anomaly detection active' },
    ],
    tier3: [
      { effort: '3-6 weeks', tools: ['Custom grammar parser', 'ANTLR'], prereqs: 'Per-role query grammar defined', doneWhen: 'Formal SQL grammar restriction per role rejects non-conforming queries' },
      { effort: '2-4 weeks', tools: ['Lakera Guard', 'Custom adversarial test suite'], prereqs: 'Adversarial test methodology', doneWhen: 'Adversarial prompt testing finds no SQL injection paths' },
    ],
  },

  DSGAI13: {
    tier1: [
      { effort: '1-2 days', tools: ['Pinecone API keys', 'Weaviate OIDC', 'Qdrant API keys'], prereqs: 'Vector store deployment inventory', doneWhen: 'Authentication and RBAC enforced on all vector store endpoints' },
      { effort: '1 day', tools: ['AWS KMS', 'Azure Key Vault', 'GCP KMS'], prereqs: 'Encryption key management', doneWhen: 'All embeddings encrypted at rest; TLS enforced for all API traffic' },
      { effort: '1-2 days', tools: ['AWS VPC', 'Azure Private Link', 'GCP VPC'], prereqs: 'Network architecture reviewed', doneWhen: 'Vector stores behind private endpoints; no public API exposure' },
    ],
    tier2: [
      { effort: '1 week', tools: ['API gateway', 'Custom rate limiter'], prereqs: 'Normal query patterns baselined', doneWhen: 'Rate-limiting blocks k-NN sweep patterns; anomaly alerts active' },
      { effort: '1 week', tools: ['Pinecone', 'Weaviate', 'Qdrant'], prereqs: 'Snapshot access policy defined', doneWhen: 'Snapshot operations restricted to authorized admins with integrity checks' },
      { effort: '1-2 weeks', tools: ['Custom namespace enforcement', 'OPA'], prereqs: 'Tenant namespace architecture', doneWhen: 'Server-side namespace enforcement prevents all cross-tenant query results' },
    ],
    tier3: [
      { effort: '3-6 weeks', tools: ['Custom watermarking library'], prereqs: 'Watermarking methodology selected', doneWhen: 'Embeddings watermarked for provenance; tampering detectable' },
      { effort: '2-4 weeks', tools: ['Custom k-NN detection', 'Splunk'], prereqs: 'k-NN sweep threat model', doneWhen: 'Specialized detection identifies and blocks k-NN sweep patterns' },
    ],
  },

  DSGAI14: {
    tier1: [
      { effort: '1 day', tools: ['Application config', 'Feature flags'], prereqs: 'Log verbosity levels defined', doneWhen: 'Default logging excludes full prompt/response bodies in production' },
      { effort: '1-2 days', tools: ['Custom log pipeline', 'Fluentd', 'Logstash'], prereqs: 'Log pipeline architecture', doneWhen: 'Tokenization/redaction applied to sensitive fields before log storage' },
      { effort: '1 day', tools: ['Feature flags', 'TTL policies'], prereqs: 'Debug trace retention policy', doneWhen: 'Debug traces auto-purged within hours; no indefinite retention' },
    ],
    tier2: [
      { effort: '1 week', tools: ['Splunk RBAC', 'Elastic Security', 'Microsoft Sentinel'], prereqs: 'Observability platform deployed', doneWhen: 'Role-based access controls limit who can search/export AI logs' },
      { effort: '1-2 weeks', tools: ['Nightfall AI', 'Microsoft Purview'], prereqs: 'PII scanning for log pipeline', doneWhen: 'Automated PII detection masks sensitive data before aggregation' },
      { effort: '1 week', tools: ['Custom approval workflow', 'PagerDuty'], prereqs: 'Debug mode approval process', doneWhen: 'Debug mode requires approval with automatic time-limited activation' },
    ],
    tier3: [
      { effort: '2-4 weeks', tools: ['Custom exposure monitoring', 'BigID'], prereqs: 'Telemetry exposure baseline', doneWhen: 'Continuous telemetry monitoring detects new sensitive data patterns' },
      { effort: '1-2 weeks', tools: ['Vendor assessment framework', 'SIG Lite'], prereqs: 'APM vendor list', doneWhen: 'Regular security assessments completed for all APM vendors' },
    ],
  },

  DSGAI15: {
    tier1: [
      { effort: '2-3 days', tools: ['Code review', 'Custom audit scripts'], prereqs: 'LLM integration inventory', doneWhen: 'All integrations reviewed; only task-required data included in prompts' },
      { effort: '1 day', tools: ['Framework configuration', 'LangChain', 'LlamaIndex'], prereqs: 'Framework auto-context features identified', doneWhen: 'Auto-context defaults disabled; manual context configuration required' },
      { effort: '1-2 days', tools: ['Custom audit scripts', 'Prompt management tool'], prereqs: 'Prompt template repository', doneWhen: 'All prompt templates audited; unnecessary fields removed' },
    ],
    tier2: [
      { effort: '1-2 weeks', tools: ['Custom intent classifier', 'NLU pipeline'], prereqs: 'Query intent taxonomy', doneWhen: 'Dynamic context scoping adjusts included fields based on query intent' },
      { effort: '1 week', tools: ['OneTrust', 'Contractual controls'], prereqs: 'Provider DPA agreements', doneWhen: 'Provider data retention verified through contractual and technical controls' },
      { effort: '1-2 weeks', tools: ['Nightfall AI', 'Microsoft Purview', 'Google DLP'], prereqs: 'DLP rules for prompt scanning', doneWhen: 'Prompt-level DLP blocks prompts with excessive sensitive data' },
    ],
    tier3: [
      { effort: '3-6 weeks', tools: ['Custom optimization pipeline', 'A/B testing'], prereqs: 'Prompt quality metrics defined', doneWhen: 'Automated system identifies minimum context for adequate performance' },
      { effort: '3-6 weeks', tools: ['OPA', 'Cedar', 'Custom policy engine'], prereqs: 'Purpose limitation definitions', doneWhen: 'Formal purpose enforcement blocks data inclusion without matching purpose' },
    ],
  },

  DSGAI16: {
    tier1: [
      { effort: '1-2 days', tools: ['Chrome Enterprise', 'Intune', 'Jamf'], prereqs: 'Endpoint management deployed', doneWhen: 'All AI extensions reviewed for least-privilege; over-broad permissions blocked' },
      { effort: '1 day', tools: ['Chrome Enterprise', 'Group Policy', 'Intune'], prereqs: 'Extension management capability', doneWhen: 'Allowlisted extensions only; unapproved extensions blocked via policy' },
      { effort: '1 day', tools: ['LMS platform', 'Security awareness training'], prereqs: 'Training content created', doneWhen: 'Users trained on extension risks; guidance to disable for sensitive work' },
    ],
    tier2: [
      { effort: '1-2 weeks', tools: ['CrowdStrike', 'Microsoft Defender for Endpoint'], prereqs: 'Endpoint monitoring capability', doneWhen: 'Extension behavior monitoring alerts on anomalous file/network access' },
      { effort: '1 week', tools: ['Custom sanitizer', 'Extension middleware'], prereqs: 'URL fragment attack vectors documented', doneWhen: 'URL fragment sanitization prevents HashJack injection in extensions' },
      { effort: '1 week', tools: ['CSP headers', 'Web server config'], prereqs: 'Internal page inventory', doneWhen: 'CSP headers deployed on sensitive pages limiting extension access' },
    ],
    tier3: [
      { effort: '2-4 weeks', tools: ['Custom security assessment tooling'], prereqs: 'Extension assessment framework', doneWhen: 'Formal security assessment completed for all approved AI extensions' },
      { effort: '2-4 weeks', tools: ['Chrome Enterprise', 'Browser vendor engagement'], prereqs: 'Browser sandboxing requirements', doneWhen: 'AI-specific sandboxing adopted in enterprise browser deployment' },
    ],
  },

  DSGAI17: {
    tier1: [
      { effort: '1-2 days', tools: ['AWS Backup', 'Azure Backup', 'Velero'], prereqs: 'Backup infrastructure exists', doneWhen: 'Encrypted backups tested quarterly; restore integrity verified' },
      { effort: '1-2 days', tools: ['API gateway', 'Kong', 'Envoy'], prereqs: 'Rate limiting infrastructure', doneWhen: 'Rate limits and abuse detection active on all vector store endpoints' },
      { effort: '1-2 days', tools: ['Custom validation scripts'], prereqs: 'Restore validation requirements', doneWhen: 'Post-restore integrity checks verify compliance state before serving' },
    ],
    tier2: [
      { effort: '1-2 weeks', tools: ['Custom staleness detector', 'OpenTelemetry'], prereqs: 'Failover architecture documented', doneWhen: 'Staleness detection signals degraded mode when serving from stale replica' },
      { effort: '1-2 weeks', tools: ['Custom deletion propagator'], prereqs: 'Replica topology mapped', doneWhen: 'Deletions propagate synchronously to all replicas before acknowledgment' },
      { effort: '1 week', tools: ['Internal SLA documentation'], prereqs: 'RTO/RPO requirements defined', doneWhen: 'RTO/RPO defined and enforced for all AI data dependencies' },
    ],
    tier3: [
      { effort: '2-4 weeks', tools: ['Chaos Monkey', 'Litmus', 'Gremlin'], prereqs: 'Chaos engineering framework selected', doneWhen: 'Chaos engineering exercises test failover and staleness scenarios' },
      { effort: '2-4 weeks', tools: ['Custom integrity checker'], prereqs: 'Replica divergence detection requirements', doneWhen: 'Continuous integrity verification across all replicas with alerting' },
    ],
  },

  DSGAI18: {
    tier1: [
      { effort: '1-2 days', tools: ['API response configuration'], prereqs: 'API response fields inventoried', doneWhen: 'Confidence scores, logits, and distributions suppressed or coarsened' },
      { effort: '1-2 days', tools: ['API gateway', 'Custom rate limiter'], prereqs: 'Repetitive pattern definitions', doneWhen: 'Rate-limiting detects and blocks systematic probing patterns' },
      { effort: '1-2 days', tools: ['Custom perturbation layer'], prereqs: 'Perturbation budget defined', doneWhen: 'Calibrated noise added to outputs; inference signal degraded' },
    ],
    tier2: [
      { effort: '1-2 weeks', tools: ['ML Privacy Meter', 'TensorFlow Privacy'], prereqs: 'MI test methodology documented', doneWhen: 'Membership inference testing integrated into model evaluation pipeline' },
      { effort: '1-2 weeks', tools: ['Splunk', 'Custom anomaly detection'], prereqs: 'Normal query pattern baseline', doneWhen: 'Query pattern anomaly detection identifies systematic probing' },
      { effort: '1 week', tools: ['API gateway', 'Custom ACL'], prereqs: 'Embedding access policies defined', doneWhen: 'Embedding access rate-limited; k-NN sweep patterns blocked' },
    ],
    tier3: [
      { effort: '3-6 weeks', tools: ['PyTorch Opacus', 'TensorFlow Privacy', 'Opaque Systems'], prereqs: 'DP training infrastructure', doneWhen: 'Model trained with DP; formal guarantees limit individual record influence' },
      { effort: '2-4 weeks', tools: ['OpenDP', 'Custom epsilon tracker'], prereqs: 'Privacy budget framework', doneWhen: 'Formal privacy auditing tracks cumulative epsilon across all queries' },
      { effort: '2-4 weeks', tools: ['Internal red team', 'Academic attack tooling'], prereqs: 'Inference red-team charter', doneWhen: 'Red-team report confirms resilience to state-of-the-art inference attacks' },
    ],
  },

  DSGAI19: {
    tier1: [
      { effort: '1-2 days', tools: ['Custom export pipeline', 'Data masking tools'], prereqs: 'Export pipeline identified', doneWhen: 'All labeling exports contain only task-required fields; no full records' },
      { effort: '1-2 days', tools: ['Scale AI', 'Labelbox', 'Custom platform'], prereqs: 'Labeler agreements drafted', doneWhen: 'Granular access controls and NDAs enforced for all labelers' },
      { effort: '1-2 days', tools: ['Splunk', 'Custom audit logger'], prereqs: 'Labeling platform supports audit', doneWhen: 'All labeler data access events logged with record, duration, and endpoint' },
    ],
    tier2: [
      { effort: '1-2 weeks', tools: ['Nightfall AI', 'Microsoft Purview', 'Custom PII redactor'], prereqs: 'PII redaction rules for labeling', doneWhen: 'Automated PII redaction in export pipeline before data reaches labelers' },
      { effort: '1-2 weeks', tools: ['Citrix', 'Amazon WorkSpaces', 'Custom VDI'], prereqs: 'Secure labeling environment specs', doneWhen: 'Labelers use secure environments with DLP preventing screenshots/downloads' },
      { effort: '1 week', tools: ['Custom drift checker', 'Config audit scripts'], prereqs: 'Export configuration baseline', doneWhen: 'Regular minimization drift checks catch field creep in export configs' },
    ],
    tier3: [
      { effort: '4-8 weeks', tools: ['Custom federated labeling platform'], prereqs: 'Federated labeling architecture designed', doneWhen: 'Labelers annotate in-place without any data export to external platforms' },
      { effort: '2-4 weeks', tools: ['Vendor assessment framework', 'SIG questionnaire'], prereqs: 'Labeling platform assessment criteria', doneWhen: 'Formal security assessment of labeling platform and workforce completed' },
    ],
  },

  DSGAI20: {
    tier1: [
      { effort: '1-2 days', tools: ['API gateway', 'Kong', 'Envoy'], prereqs: 'API management infrastructure', doneWhen: 'Rate limits and usage monitoring active per account; query patterns tracked' },
      { effort: '1 day', tools: ['Legal review', 'ToS management'], prereqs: 'Legal approval for anti-distillation clauses', doneWhen: 'Anti-distillation clauses in ToS with technical enforcement' },
      { effort: '2-3 days', tools: ['Custom watermarking library'], prereqs: 'Watermarking methodology selected', doneWhen: 'Statistical watermarks embedded in all model outputs' },
    ],
    tier2: [
      { effort: '1-2 weeks', tools: ['Custom analytics pipeline', 'Splunk'], prereqs: 'Query pattern baseline established', doneWhen: 'Distillation-indicative query patterns detected across accounts' },
      { effort: '1-2 weeks', tools: ['Splunk', 'Custom anomaly detection'], prereqs: 'Per-account usage baseline', doneWhen: 'Anomaly detection flags unusual query distributions and timing' },
      { effort: '1-2 weeks', tools: ['Custom response perturbation layer'], prereqs: 'Perturbation strategy defined', doneWhen: 'Response diversity degrades distillation training signal quality' },
    ],
    tier3: [
      { effort: '3-6 weeks', tools: ['Custom adversarial defense pipeline'], prereqs: 'Extraction defense research reviewed', doneWhen: 'Proactive extraction defense degrades student model quality on detection' },
      { effort: '3-6 weeks', tools: ['Legal framework', 'Technical protection suite'], prereqs: 'IP protection requirements documented', doneWhen: 'Formal IP protection framework with technical, legal, and operational measures' },
    ],
  },

  DSGAI21: {
    tier1: [
      { effort: '1-2 days', tools: ['Apache Atlas', 'Custom provenance tracker'], prereqs: 'RAG document sources inventoried', doneWhen: 'Provenance tracked and displayed for all RAG-retrieved documents' },
      { effort: '1-2 days', tools: ['Wiki ACLs', 'SharePoint permissions', 'Git branch protection'], prereqs: 'RAG source access policies defined', doneWhen: 'Write-access controls enforced on all RAG-feeding sources' },
      { effort: '1-2 days', tools: ['Custom review workflow', 'Approval pipeline'], prereqs: 'High-impact content identified', doneWhen: 'Human review gates active for content changes in high-impact RAG sources' },
    ],
    tier2: [
      { effort: '1-2 weeks', tools: ['Custom corroboration engine'], prereqs: 'Multi-source retrieval architecture', doneWhen: 'Critical retrievals require multi-source corroboration before presentation' },
      { effort: '1-2 weeks', tools: ['Custom change monitor', 'Git diff webhooks'], prereqs: 'Content change monitoring plan', doneWhen: 'Unexpected content changes flagged with alerts for altered factual claims' },
      { effort: '1 week', tools: ['Custom scoring engine'], prereqs: 'Trust scoring methodology defined', doneWhen: 'Freshness and trust scores assigned to all retrieved content' },
    ],
    tier3: [
      { effort: '2-4 weeks', tools: ['Internal red team'], prereqs: 'Content injection threat model', doneWhen: 'Red-team confirms resilience to adversarial content injection in RAG sources' },
      { effort: '3-6 weeks', tools: ['Custom cryptographic verification'], prereqs: 'Trust chain requirements defined', doneWhen: 'Formal trust chain verification with cryptographic proof for retrieved content' },
    ],
  },
}

// ---------------------------------------------------------------------------
// LocalStorage key
// ---------------------------------------------------------------------------

const LS_KEY = 'dsgai-checklist-progress'

function loadChecked() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveChecked(obj) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(obj))
  } catch { /* quota exceeded — silently ignore */ }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a flat list of all checklist item keys for a given risk. */
function keysForRisk(risk) {
  const keys = []
  for (const tier of ['tier1', 'tier2', 'tier3']) {
    const items = risk.mitigations?.[tier] || []
    items.forEach((_, i) => keys.push(`${risk.id}-${tier}-${i}`))
  }
  return keys
}

/** Count total checklist items across all risks. */
function totalItemCount() {
  let n = 0
  for (const r of risks) {
    for (const tier of ['tier1', 'tier2', 'tier3']) {
      n += (r.mitigations?.[tier] || []).length
    }
  }
  return n
}

function pct(num, den) {
  return den === 0 ? 0 : Math.round((num / den) * 100)
}

function scopeLabel(scope) {
  if (scope.includes('Buy') && scope.includes('Build')) return 'Both'
  if (scope.includes('Buy')) return 'Buy'
  if (scope.includes('Build')) return 'Build'
  return scope
}

// ---------------------------------------------------------------------------
// Export helper
// ---------------------------------------------------------------------------

function exportProgress(checkedItems) {
  const lines = [
    'DSGAI Implementation Checklist Progress Report',
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    `${'='.repeat(60)}`,
    '',
  ]

  const total = totalItemCount()
  const checked = Object.values(checkedItems).filter(Boolean).length
  lines.push(`Overall Progress: ${checked} / ${total} (${pct(checked, total)}%)`)
  lines.push('')

  for (const risk of risks) {
    const rKeys = keysForRisk(risk)
    const rChecked = rKeys.filter(k => checkedItems[k]).length
    lines.push(`${risk.id} - ${risk.title}: ${rChecked}/${rKeys.length} (${pct(rChecked, rKeys.length)}%)`)

    for (const tier of ['tier1', 'tier2', 'tier3']) {
      const items = risk.mitigations?.[tier] || []
      if (items.length === 0) continue
      lines.push(`  ${tierLabels[tier]} (${tier.replace('tier', 'Tier ')}):`)
      items.forEach((item, i) => {
        const key = `${risk.id}-${tier}-${i}`
        const mark = checkedItems[key] ? '[x]' : '[ ]'
        lines.push(`    ${mark} ${item.title}`)
      })
    }
    lines.push('')
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dsgai-checklist-${new Date().toISOString().slice(0, 10)}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressBar({ value, max, accent, bg, height = 8 }) {
  const p = pct(value, max)
  return (
    <div style={{ width: '100%', height, borderRadius: height / 2, background: bg, overflow: 'hidden' }}>
      <div
        style={{
          width: `${p}%`,
          height: '100%',
          borderRadius: height / 2,
          background: accent,
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  )
}

function ChecklistItem({ item, itemKey, checked, onToggle, meta, dark }) {
  const [expanded, setExpanded] = useState(false)
  const tierColors = dark ? tierColorsDark : tierColorsLight
  const sStyle = getScopeStyle(item.scope, dark)
  const sLabel = scopeLabel(item.scope)

  const effortStyle = meta?.effort ? getEffortStyle(meta.effort, dark) : null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 16px',
        borderBottom: `1px solid ${dark ? '#1e2030' : '#e5e7eb'}`,
        background: checked ? (dark ? '#0a1a12' : '#f0fdf4') : 'transparent',
        transition: 'background 0.2s',
      }}
    >
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Checkbox */}
        <button
          onClick={() => onToggle(itemKey)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginTop: 2,
            flexShrink: 0,
            color: checked ? '#16a34a' : (dark ? '#6b7a99' : '#9ca3af'),
          }}
          aria-label={checked ? 'Uncheck item' : 'Check item'}
        >
          {checked
            ? <CheckSquare size={20} />
            : <Square size={20} />
          }
        </button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title + badges row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'left',
                font: 'inherit',
                color: dark ? '#e2e8f0' : '#1e293b',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: checked ? 'line-through' : 'none',
                opacity: checked ? 0.7 : 1,
              }}
            >
              {item.title}
            </button>

            {/* Scope badge */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 9999,
                background: sStyle.bg,
                color: sStyle.text,
                whiteSpace: 'nowrap',
              }}
            >
              {sLabel}
            </span>

            {/* Effort badge */}
            {meta?.effort && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  background: effortStyle.bg,
                  color: effortStyle.text,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  whiteSpace: 'nowrap',
                }}
              >
                <Clock size={10} />
                {meta.effort}
              </span>
            )}
          </div>

          {/* Tool pills */}
          {meta?.tools && meta.tools.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {meta.tools.map((tool, ti) => (
                <span
                  key={ti}
                  style={{
                    fontSize: 11,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: dark ? '#1e2030' : '#f1f5f9',
                    color: dark ? '#8896b0' : '#475569',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <Wrench size={9} />
                  {tool}
                </span>
              ))}
            </div>
          )}

          {/* Prerequisites */}
          {meta?.prereqs && (
            <div style={{ fontSize: 12, color: dark ? '#6b7a99' : '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={10} style={{ flexShrink: 0 }} />
              <span><strong>Prereq:</strong> {meta.prereqs}</span>
            </div>
          )}

          {/* Done-when */}
          {meta?.doneWhen && (
            <div style={{ fontSize: 12, color: dark ? '#6b7a99' : '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckSquare size={10} style={{ flexShrink: 0 }} />
              <span><strong>Done when:</strong> {meta.doneWhen}</span>
            </div>
          )}

          {/* Expandable description */}
          {expanded && (
            <div
              style={{
                fontSize: 13,
                color: dark ? '#94a3b8' : '#475569',
                marginTop: 8,
                padding: '8px 12px',
                borderRadius: 6,
                background: dark ? '#0d1117' : '#f8fafc',
                borderLeft: `3px solid ${dark ? '#334155' : '#cbd5e1'}`,
                lineHeight: 1.5,
              }}
            >
              {item.description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TierSection({ risk, tier, checkedItems, onToggle, dark, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const items = risk.mitigations?.[tier] || []
  const meta = checklistMeta[risk.id]?.[tier] || []
  const tierColor = (dark ? tierColorsDark : tierColorsLight)[tier]
  const checkedCount = items.filter((_, i) => checkedItems[`${risk.id}-${tier}-${i}`]).length

  if (items.length === 0) return null

  return (
    <div style={{ marginBottom: 4 }}>
      {/* Tier header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          background: tierColor.bg,
          border: `1px solid ${tierColor.border}`,
          borderRadius: open ? '8px 8px 0 0' : 8,
          cursor: 'pointer',
          color: tierColor.text,
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: tierColor.accent,
            flexShrink: 0,
          }} />
          {tierLabels[tier]} ({tier.replace('tier', 'Tier ')})
          <span style={{ fontWeight: 400, opacity: 0.8 }}>
            {checkedCount}/{items.length} completed
          </span>
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Items */}
      {open && (
        <div
          style={{
            border: `1px solid ${tierColor.border}`,
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            overflow: 'hidden',
          }}
        >
          {items.map((item, i) => (
            <ChecklistItem
              key={i}
              item={item}
              itemKey={`${risk.id}-${tier}-${i}`}
              checked={!!checkedItems[`${risk.id}-${tier}-${i}`]}
              onToggle={onToggle}
              meta={meta[i] || null}
              dark={dark}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function RiskChecklistCard({ risk, checkedItems, onToggle, dark }) {
  const [expanded, setExpanded] = useState(false)
  const rKeys = keysForRisk(risk)
  const rChecked = rKeys.filter(k => checkedItems[k]).length
  const progress = pct(rChecked, rKeys.length)
  const cat = catColorMap[risk.category] || {}

  const cardBg = dark ? '#13151f' : '#ffffff'
  const cardBorder = dark ? '#1e2030' : '#e2e8f0'
  const headerBg = dark ? '#0d1117' : '#f8fafc'

  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid ${cardBorder}`,
        background: cardBg,
        overflow: 'hidden',
        marginBottom: 16,
      }}
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: headerBg,
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          {/* Risk ID */}
          <Link
            to={`/risk/${risk.id}`}
            onClick={e => e.stopPropagation()}
            style={{
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              color: dark ? '#60a5fa' : '#2563eb',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            {risk.id}
          </Link>

          {/* Title */}
          <span style={{
            fontSize: 15,
            fontWeight: 600,
            color: dark ? '#e2e8f0' : '#1e293b',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {risk.title}
          </span>

          {/* Category badge */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 9999,
              background: dark ? (cat.color + '20') : cat.bgColor,
              color: dark ? cat.color : cat.color,
              border: `1px solid ${dark ? (cat.color + '40') : cat.borderColor}`,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {risk.categoryLabel}
          </span>
        </div>

        {/* Progress summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 120 }}>
            <ProgressBar
              value={rChecked}
              max={rKeys.length}
              accent={progress === 100 ? '#16a34a' : '#3b82f6'}
              bg={dark ? '#1e2030' : '#e2e8f0'}
            />
          </div>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: progress === 100 ? '#16a34a' : (dark ? '#94a3b8' : '#64748b'),
            whiteSpace: 'nowrap',
            minWidth: 50,
            textAlign: 'right',
          }}>
            {rChecked}/{rKeys.length}
          </span>
          {expanded ? <ChevronUp size={18} color={dark ? '#6b7a99' : '#9ca3af'} /> : <ChevronDown size={18} color={dark ? '#6b7a99' : '#9ca3af'} />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '12px 16px 16px' }}>
          {['tier1', 'tier2', 'tier3'].map(tier => (
            <TierSection
              key={tier}
              risk={risk}
              tier={tier}
              checkedItems={checkedItems}
              onToggle={onToggle}
              dark={dark}
              defaultOpen={tier === 'tier1'}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function Checklists() {
  const { dark } = useTheme()
  const [checkedItems, setCheckedItems] = useState(loadChecked)
  const [searchQuery, setSearchQuery] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Persist checked items
  useEffect(() => {
    saveChecked(checkedItems)
  }, [checkedItems])

  const onToggle = useCallback((key) => {
    setCheckedItems(prev => {
      const next = { ...prev }
      if (next[key]) {
        delete next[key]
      } else {
        next[key] = true
      }
      return next
    })
  }, [])

  // Filter risks
  const filteredRisks = useMemo(() => {
    let result = risks
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(r =>
        r.id.toLowerCase().includes(q) || r.title.toLowerCase().includes(q)
      )
    }
    if (categoryFilter !== 'all') {
      result = result.filter(r => r.category === categoryFilter)
    }
    // tierFilter doesn't exclude risks, but we handle display in the component
    return result
  }, [searchQuery, categoryFilter])

  // Progress computation
  const total = useMemo(() => totalItemCount(), [])
  const checkedCount = Object.values(checkedItems).filter(Boolean).length

  const tierProgress = useMemo(() => {
    const result = {}
    for (const tier of ['tier1', 'tier2', 'tier3']) {
      let tTotal = 0
      let tChecked = 0
      for (const r of risks) {
        const items = r.mitigations?.[tier] || []
        tTotal += items.length
        items.forEach((_, i) => {
          if (checkedItems[`${r.id}-${tier}-${i}`]) tChecked++
        })
      }
      result[tier] = { total: tTotal, checked: tChecked }
    }
    return result
  }, [checkedItems])

  // Colors
  const pageBg = dark ? '#0a0c14' : '#f1f5f9'
  const cardBg = dark ? '#13151f' : '#ffffff'
  const cardBorder = dark ? '#1e2030' : '#e2e8f0'
  const textPrimary = dark ? '#e2e8f0' : '#1e293b'
  const textSecondary = dark ? '#94a3b8' : '#64748b'
  const inputBg = dark ? '#0d1117' : '#ffffff'
  const inputBorder = dark ? '#1e2030' : '#d1d5db'

  return (
    <div style={{ minHeight: '100vh', background: pageBg, padding: '32px 16px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: textPrimary, margin: 0 }}>
            Implementation Checklists
          </h1>
          <p style={{ fontSize: 15, color: textSecondary, marginTop: 8, lineHeight: 1.6 }}>
            Convert OWASP DSGAI mitigations into actionable, trackable implementation tasks.
            Check off items as your team completes them. Progress is saved locally in your browser.
          </p>
        </div>

        {/* Progress Overview */}
        <div
          style={{
            borderRadius: 12,
            border: `1px solid ${cardBorder}`,
            background: cardBg,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: 0 }}>
              Overall Progress
            </h2>
            <span style={{ fontSize: 14, fontWeight: 600, color: checkedCount === total ? '#16a34a' : textSecondary }}>
              {checkedCount} / {total} ({pct(checkedCount, total)}%)
            </span>
          </div>

          <ProgressBar
            value={checkedCount}
            max={total}
            accent={checkedCount === total ? '#16a34a' : '#3b82f6'}
            bg={dark ? '#1e2030' : '#e2e8f0'}
            height={10}
          />

          {/* Per-tier progress */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
            {['tier1', 'tier2', 'tier3'].map(tier => {
              const tp = tierProgress[tier]
              const tc = (dark ? tierColorsDark : tierColorsLight)[tier]
              return (
                <div key={tier} style={{ padding: '10px 12px', borderRadius: 8, background: tc.bg, border: `1px solid ${tc.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: tc.text }}>
                      {tierLabels[tier]}
                    </span>
                    <span style={{ fontSize: 11, color: tc.text, opacity: 0.8 }}>
                      {tp.checked}/{tp.total}
                    </span>
                  </div>
                  <ProgressBar value={tp.checked} max={tp.total} accent={tc.accent} bg={dark ? '#0a0c14' : '#ffffff'} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            borderRadius: 12,
            border: `1px solid ${cardBorder}`,
            background: cardBg,
            padding: '12px 16px',
            marginBottom: 24,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
          }}
        >
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 200px', minWidth: 180 }}>
            <Search size={16} color={textSecondary} />
            <input
              type="text"
              placeholder="Search by risk ID or title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 6,
                border: `1px solid ${inputBorder}`,
                background: inputBg,
                color: textPrimary,
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          {/* Tier filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} color={textSecondary} />
            {['all', 'tier1', 'tier2', 'tier3'].map(t => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: `1px solid ${tierFilter === t ? '#3b82f6' : inputBorder}`,
                  background: tierFilter === t ? (dark ? '#1e3a5f' : '#dbeafe') : 'transparent',
                  color: tierFilter === t ? (dark ? '#93c5fd' : '#1d4ed8') : textSecondary,
                  fontSize: 12,
                  fontWeight: tierFilter === t ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {t === 'all' ? 'All Tiers' : tierLabels[t]}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: `1px solid ${inputBorder}`,
              background: inputBg,
              color: textPrimary,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          {/* Export */}
          <button
            onClick={() => exportProgress(checkedItems)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              border: `1px solid ${inputBorder}`,
              background: dark ? '#1e3a5f' : '#dbeafe',
              color: dark ? '#93c5fd' : '#1d4ed8',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
            Export Progress
          </button>
        </div>

        {/* Risk Checklist Cards */}
        {filteredRisks.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 40,
            color: textSecondary,
            fontSize: 14,
          }}>
            No risks match your filters.
          </div>
        )}

        {filteredRisks.map(risk => {
          // If tier filter is active, only show risks that have items in that tier
          if (tierFilter !== 'all') {
            const items = risk.mitigations?.[tierFilter] || []
            if (items.length === 0) return null
          }

          return (
            <RiskChecklistCard
              key={risk.id}
              risk={risk}
              checkedItems={checkedItems}
              onToggle={onToggle}
              dark={dark}
            />
          )
        })}

      </div>
    </div>
  )
}
