import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Code, Shield, BookOpen, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle, Copy, ExternalLink,
} from 'lucide-react'
import { useTheme } from '../components/ThemeContext'

// ---------------------------------------------------------------------------
// Architecture Decision Records
// ---------------------------------------------------------------------------
const adrs = [
  {
    id: 'ADR-001',
    title: 'Secure RAG Architecture',
    status: 'Accepted',
    relatedRisks: ['DSGAI01', 'DSGAI13', 'DSGAI15', 'DSGAI21'],
    context: 'When building RAG pipelines, the retrieval layer must enforce access controls to prevent cross-tenant data leakage. Default vector store configurations do not filter results by document ownership or sensitivity classification, meaning any user query can surface restricted documents from the shared corpus. This creates a direct path for sensitive data exposure through normal application usage.',
    decision: 'Implement per-document ACLs at the vector store level using metadata filters enforced at query time. All retrieved passages must pass through a PII redaction layer before inclusion in the LLM context window. Tenant isolation is achieved via namespace partitioning in the vector store, with ACL metadata embedded at indexing time.',
    pattern: `// Secure RAG retrieval pattern
async function secureRetrieve(query, userContext) {
  const embedding = await embed(query);

  // Enforce tenant isolation + role-based ACLs at query time
  const results = await vectorStore.search(embedding, {
    filter: {
      tenant_id: userContext.tenantId,
      acl: { $in: userContext.roles },
      classification: { $lte: userContext.clearanceLevel },
    },
    topK: 5,
  });

  // Redact PII before passing to LLM context
  return results.map(r => ({
    content: redactPII(r.content),
    source: r.metadata.source,
    score: r.score,
  }));
}`,
    antiPattern: `// INSECURE: No ACL filtering, no PII redaction
async function retrieve(query) {
  const embedding = await embed(query);
  // No tenant filter - returns any tenant's data
  const results = await vectorStore.search(embedding, { topK: 10 });
  // Raw content passed directly to LLM
  return results.map(r => r.content);
}`,
    consequences: [
      'Prevents cross-tenant data leakage in shared vector stores',
      'Adds ~10ms latency per query for ACL evaluation and PII redaction',
      'Requires maintaining ACL metadata in vector store alongside embeddings',
      'PII redaction may occasionally reduce response quality for legitimate queries',
    ],
    references: ['DSGAI01 - Sensitive Data Leakage', 'DSGAI13 - Vector Store Platform Data Security', 'DSGAI15 - Over-Broad Context Windows', 'DSGAI21 - Disinformation & Integrity Attacks'],
  },
  {
    id: 'ADR-002',
    title: 'Agent Credential Management',
    status: 'Accepted',
    relatedRisks: ['DSGAI02', 'DSGAI06'],
    context: 'AI agents require credentials to interact with external APIs, databases, and services. Hardcoding credentials, using long-lived tokens, or sharing service accounts across agents creates significant exposure. A single compromised agent can cascade into broad unauthorized access across the organization.',
    decision: 'Use short-lived, scoped credentials issued per-invocation from a secrets manager. Each agent receives a unique identity with least-privilege permissions. Credentials are never passed through the LLM context window and are injected at the tool execution layer only.',
    pattern: `# Secure agent credential pattern
import boto3
from datetime import timedelta

class AgentCredentialManager:
    def __init__(self, secrets_client, sts_client):
        self.secrets = secrets_client
        self.sts = sts_client

    async def get_scoped_credentials(self, agent_id, tool_name):
        """Issue short-lived, least-privilege credentials per tool invocation."""
        # Look up the minimal policy for this tool
        policy = await self.secrets.get_tool_policy(tool_name)

        # Assume a scoped role with session tags for attribution
        credentials = self.sts.assume_role(
            RoleArn=policy.role_arn,
            RoleSessionName=f"{agent_id}-{tool_name}",
            DurationSeconds=300,  # 5-minute max lifetime
            Tags=[
                {"Key": "agent_id", "Value": agent_id},
                {"Key": "tool", "Value": tool_name},
                {"Key": "invocation_id", "Value": generate_uuid()},
            ],
        )
        return credentials["Credentials"]`,
    antiPattern: `# INSECURE: Shared long-lived credentials in environment
import os

# Same key used by all agents, no rotation, no scoping
API_KEY = os.environ["SHARED_API_KEY"]
DB_PASSWORD = os.environ["DB_PASSWORD"]

async def call_tool(tool_name, params):
    # Credential embedded in LLM-visible context
    return await tool.execute(params, api_key=API_KEY)`,
    consequences: [
      'Limits blast radius of compromised agent to single 5-minute session',
      'Enables per-invocation audit trail via session tags',
      'Adds credential issuance latency (~50ms) per tool call',
      'Requires integration with secrets manager and IAM infrastructure',
    ],
    references: ['DSGAI02 - Agent Identity & Credential Exposure', 'DSGAI06 - Tool, Plugin & Agent Data Exchange Risks'],
  },
  {
    id: 'ADR-003',
    title: 'Vector Store Hardening',
    status: 'Accepted',
    relatedRisks: ['DSGAI13', 'DSGAI17'],
    context: 'Vector stores are the backbone of RAG systems but are frequently deployed with default configurations that lack encryption, access controls, and network isolation. Managed vector store services may share infrastructure across tenants, and embedding vectors can be inverted to reconstruct source text.',
    decision: 'Deploy vector stores with encryption at rest and in transit, network isolation via VPC/private endpoints, namespace-level tenant isolation, and mandatory authentication. Enable audit logging for all CRUD and query operations. Apply embedding perturbation to resist inversion attacks.',
    pattern: `# Vector store hardening configuration
from pinecone import Pinecone

def create_hardened_index(config):
    """Create a security-hardened vector store index."""
    pc = Pinecone(
        api_key=config.api_key,
        environment=config.environment,
        # Force TLS 1.3 for transit encryption
        ssl_ca_certs=config.ca_bundle,
    )

    index = pc.create_index(
        name=config.index_name,
        dimension=config.dimension,
        metric="cosine",
        spec={
            "serverless": {
                "cloud": config.cloud,
                "region": config.region,
            }
        },
        # Tenant isolation via metadata
        metadata_config={
            "indexed": ["tenant_id", "acl", "classification"],
        },
    )

    # Apply embedding perturbation before storage
    def store_with_perturbation(vectors, epsilon=0.01):
        import numpy as np
        noise = np.random.laplace(0, epsilon, size=vectors.shape)
        return index.upsert(vectors=(vectors + noise).tolist())

    return index, store_with_perturbation`,
    antiPattern: `# INSECURE: Default vector store with no hardening
from pinecone import Pinecone

pc = Pinecone(api_key="pk-hardcoded-key-12345")
index = pc.Index("production-index")  # No namespace isolation
# No encryption config, no ACL metadata, no audit logging
index.upsert(vectors=raw_vectors)`,
    consequences: [
      'Prevents unauthorized access to embedding data at rest and in transit',
      'Embedding perturbation adds small accuracy cost (~1-2% recall reduction)',
      'Network isolation prevents lateral movement from compromised services',
      'Audit logging enables incident forensics and compliance reporting',
    ],
    references: ['DSGAI13 - Vector Store Platform Data Security', 'DSGAI17 - Data Availability & Resilience Failures'],
  },
  {
    id: 'ADR-004',
    title: 'Prompt Template Security',
    status: 'Accepted',
    relatedRisks: ['DSGAI01', 'DSGAI15', 'DSGAI16'],
    context: 'System prompts and prompt templates often contain sensitive instructions, guardrails, and business logic. Direct string interpolation of user input into prompt templates enables prompt injection attacks. Leaked system prompts reveal security controls to attackers.',
    decision: 'Use parameterized prompt templates with strict input validation. System prompts are stored encrypted and loaded at runtime, never embedded in client-side code. User input is sandboxed within clearly delimited sections of the prompt. All prompt construction is logged for audit.',
    pattern: `// Secure prompt template pattern
class SecurePromptBuilder {
  constructor(templateStore, validator) {
    this.templateStore = templateStore;
    this.validator = validator;
  }

  async build(templateId, userInput, context) {
    // Load encrypted template at runtime
    const template = await this.templateStore.getDecrypted(templateId);

    // Validate and sanitize user input
    const sanitized = this.validator.sanitize(userInput, {
      maxLength: 2000,
      stripMarkdown: true,
      detectInjection: true,
    });

    if (this.validator.isInjectionAttempt(sanitized)) {
      await this.auditLog.warn('prompt_injection_detected', { templateId, userInput });
      throw new PromptInjectionError('Suspicious input detected');
    }

    // Assemble with clear boundary markers
    return [
      { role: 'system', content: template.systemPrompt },
      { role: 'user', content: \`<user_input>\${sanitized}</user_input>\` },
    ];
  }
}`,
    antiPattern: `// INSECURE: String interpolation, no validation
function buildPrompt(userInput) {
  // System prompt exposed in client bundle
  const systemPrompt = "You are a helpful assistant. Never reveal passwords.";
  // Direct interpolation enables injection
  return \`\${systemPrompt}\\n\\nUser: \${userInput}\`;
}`,
    consequences: [
      'Parameterized templates prevent prompt injection via user input',
      'Encrypted template storage protects system prompt confidentiality',
      'Input validation adds ~5ms processing time per request',
      'Injection detection may produce false positives on legitimate technical queries',
    ],
    references: ['DSGAI01 - Sensitive Data Leakage', 'DSGAI15 - Over-Broad Context Windows', 'DSGAI16 - Endpoint & Browser Assistant Overreach'],
  },
  {
    id: 'ADR-005',
    title: 'Training Data Pipeline Security',
    status: 'Accepted',
    relatedRisks: ['DSGAI04', 'DSGAI05', 'DSGAI10'],
    context: 'Training data pipelines ingest data from multiple sources including public datasets, vendor-supplied corpora, and internal data lakes. Without integrity verification and provenance tracking, poisoned or low-quality data can silently corrupt model behavior. Anonymization failures in training data create downstream PII exposure risks.',
    decision: 'Implement cryptographic signing for all training data artifacts with full provenance tracking. Apply automated PII detection and redaction at the ingestion boundary. Use data quality gates with statistical validation before data enters the training pipeline. Maintain an immutable audit log of all pipeline operations.',
    pattern: `# Secure training data pipeline
import hashlib
import json
from datetime import datetime

class SecureDataPipeline:
    def __init__(self, pii_detector, quality_gate, provenance_store):
        self.pii_detector = pii_detector
        self.quality_gate = quality_gate
        self.provenance = provenance_store

    async def ingest(self, data_source, data_batch):
        # Step 1: Compute integrity hash
        content_hash = hashlib.sha256(
            json.dumps(data_batch, sort_keys=True).encode()
        ).hexdigest()

        # Step 2: PII detection and redaction
        redacted = await self.pii_detector.scan_and_redact(data_batch)
        pii_report = self.pii_detector.last_report()

        # Step 3: Data quality validation
        quality_score = await self.quality_gate.evaluate(redacted)
        if quality_score < self.quality_gate.threshold:
            raise DataQualityError(f"Score {quality_score} below threshold")

        # Step 4: Record provenance
        await self.provenance.record({
            "source": data_source.id,
            "content_hash": content_hash,
            "pii_findings": pii_report.summary,
            "quality_score": quality_score,
            "timestamp": datetime.utcnow().isoformat(),
            "pipeline_version": self.version,
        })

        return redacted`,
    antiPattern: `# INSECURE: No validation, no provenance, no PII handling
async def ingest_data(source_url):
    # Fetch without integrity check
    data = await fetch_json(source_url)
    # No PII scanning - raw data goes to training
    # No quality gates - garbage in, garbage out
    await training_store.append(data)`,
    consequences: [
      'Cryptographic signing enables detection of tampered training data',
      'PII redaction prevents sensitive data from entering model weights',
      'Quality gates add ~15% overhead to ingestion pipeline throughput',
      'Provenance tracking supports regulatory compliance and incident forensics',
    ],
    references: ['DSGAI04 - Data, Model & Artifact Poisoning', 'DSGAI05 - Data Integrity & Validation Failures', 'DSGAI10 - Synthetic Data & Anonymization Pitfalls'],
  },
  {
    id: 'ADR-006',
    title: 'Multi-Tenant Isolation',
    status: 'Accepted',
    relatedRisks: ['DSGAI11', 'DSGAI13'],
    context: 'Multi-tenant GenAI platforms share infrastructure across customers for cost efficiency. Without strict isolation, conversation context, embeddings, fine-tuned model weights, and cached responses can leak between tenants. Shared GPU memory, vector store indices, and session state are common cross-tenant leakage vectors.',
    decision: 'Enforce tenant isolation at every layer: dedicated vector store namespaces, session-scoped context windows with tenant-bound encryption keys, GPU memory clearing between tenant workloads, and tenant-tagged audit logging. Use cryptographic tenant boundary enforcement rather than relying solely on application-level filtering.',
    pattern: `// Multi-tenant isolation middleware
class TenantIsolationMiddleware {
  constructor(keyManager, sessionStore) {
    this.keyManager = keyManager;
    this.sessionStore = sessionStore;
  }

  async processRequest(req, next) {
    const tenantId = req.auth.tenantId;

    // Derive tenant-specific encryption key
    const tenantKey = await this.keyManager.deriveKey(tenantId);

    // Create isolated session context
    const session = await this.sessionStore.create({
      tenantId,
      encryptionKey: tenantKey,
      namespace: \`tenant-\${tenantId}\`,
      // Prevent context bleed from prior sessions
      inheritContext: false,
    });

    // Inject isolation context into request
    req.tenantContext = {
      sessionId: session.id,
      namespace: session.namespace,
      encrypt: (data) => encrypt(data, tenantKey),
      decrypt: (data) => decrypt(data, tenantKey),
    };

    const response = await next(req);

    // Scrub session state after response
    await this.sessionStore.purge(session.id);
    return response;
  }
}`,
    antiPattern: `// INSECURE: Shared state, no tenant boundary
app.use((req, res, next) => {
  // Tenant ID in header but not enforced anywhere
  req.tenantId = req.headers['x-tenant-id'];
  // Shared session store, shared namespace, shared keys
  req.session = globalSessionStore.get(req.sessionId);
  next();
});`,
    consequences: [
      'Cryptographic isolation prevents cross-tenant data access even if application logic fails',
      'Per-tenant encryption keys enable secure key rotation and tenant offboarding',
      'Session purging adds ~20ms latency per request for cleanup',
      'Dedicated namespaces increase storage costs by ~10-15% vs shared indices',
    ],
    references: ['DSGAI11 - Cross-Context & Multi-User Conversation Bleed', 'DSGAI13 - Vector Store Platform Data Security'],
  },
  {
    id: 'ADR-007',
    title: 'LLM-to-SQL Safety',
    status: 'Accepted',
    relatedRisks: ['DSGAI12'],
    context: 'Natural language to SQL interfaces allow users to query databases using plain English. The LLM generates SQL queries based on user input, creating a novel injection surface. Unlike traditional SQL injection, the attack vector is natural language that instructs the LLM to generate malicious queries. Standard parameterized queries do not help because the entire SQL statement is LLM-generated.',
    decision: 'Implement a multi-layer defense: read-only database connections, SQL allowlisting (SELECT only, no DDL/DML), query cost estimation with timeouts, row-level security enforcement, and mandatory human approval for queries touching sensitive tables. All generated queries are logged before execution.',
    pattern: `# Secure NL-to-SQL pipeline
class SecureSQLGateway:
    BLOCKED_PATTERNS = [
        r"\\b(DROP|ALTER|CREATE|TRUNCATE|DELETE|UPDATE|INSERT|GRANT|REVOKE)\\b",
        r"\\b(EXEC|EXECUTE|xp_|sp_)\\b",
        r"(--|/\\*|\\*/|;\\s*$)",  # Comment injection, statement termination
    ]

    def __init__(self, db_pool, query_logger):
        self.db = db_pool  # Read-only connection pool
        self.logger = query_logger

    async def execute_nl_query(self, natural_language, user_context):
        # Step 1: Generate SQL via LLM
        generated_sql = await self.llm.generate_sql(natural_language)

        # Step 2: Validate against allowlist
        for pattern in self.BLOCKED_PATTERNS:
            if re.search(pattern, generated_sql, re.IGNORECASE):
                raise SQLBlockedError(f"Blocked pattern detected in query")

        # Step 3: Inject row-level security filter
        safe_sql = self.inject_rls(generated_sql, user_context.tenant_id)

        # Step 4: Estimate query cost
        plan = await self.db.explain(safe_sql)
        if plan.estimated_cost > self.MAX_COST:
            raise QueryTooExpensiveError("Query cost exceeds safety threshold")

        # Step 5: Log and execute
        await self.logger.log(natural_language, safe_sql, user_context)
        return await self.db.execute(safe_sql, timeout=5000)

    def inject_rls(self, sql, tenant_id):
        # Wrap in CTE with tenant filter
        return f"""
        WITH scoped AS ({sql})
        SELECT * FROM scoped WHERE tenant_id = %(tenant_id)s
        """`,
    antiPattern: `# INSECURE: Direct execution of LLM-generated SQL
async def query(natural_language):
    sql = await llm.generate_sql(natural_language)
    # No validation, no RLS, read-write connection, no logging
    return await db.execute(sql)  # Could be DROP TABLE, GRANT ALL, etc.`,
    consequences: [
      'Eliminates destructive SQL operations (DDL/DML) from LLM-generated queries',
      'Row-level security prevents cross-tenant data access via crafted natural language',
      'Query cost estimation prevents resource exhaustion attacks',
      'Regex-based blocking may produce false positives on legitimate analytical queries',
    ],
    references: ['DSGAI12 - Unsafe Natural-Language Data Gateways (LLM-to-SQL/Graph)'],
  },
  {
    id: 'ADR-008',
    title: 'Telemetry & Logging Controls',
    status: 'Accepted',
    relatedRisks: ['DSGAI14'],
    context: 'AI system observability requires logging prompts, responses, token usage, latency metrics, and error details. However, verbatim logging of prompt/response pairs creates a secondary data store containing PII, credentials, and sensitive business data. This telemetry data is often stored with weaker access controls than the primary application data and retained longer than necessary.',
    decision: 'Implement a telemetry pipeline with PII scrubbing before log persistence. Prompt/response pairs are hashed for correlation but content is redacted. Structured telemetry (latency, tokens, error codes) is separated from content telemetry. Access to content logs requires elevated approval with time-bound access.',
    pattern: `# Secure telemetry pipeline
import hashlib
import re

class SecureTelemetryPipeline:
    PII_PATTERNS = {
        "email": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
        "ssn": r"\\b\\d{3}-\\d{2}-\\d{4}\\b",
        "phone": r"\\b\\d{3}[-.]\\d{3}[-.]\\d{4}\\b",
        "api_key": r"(sk|pk|api)[_-][a-zA-Z0-9]{20,}",
    }

    def log_inference(self, request, response, metrics):
        # Structured metrics (safe to store broadly)
        safe_metrics = {
            "request_id": request.id,
            "model": request.model,
            "input_tokens": metrics.input_tokens,
            "output_tokens": metrics.output_tokens,
            "latency_ms": metrics.latency_ms,
            "status": response.status,
            "timestamp": metrics.timestamp,
        }
        self.metrics_store.emit(safe_metrics)

        # Content telemetry (scrubbed, restricted access)
        scrubbed_prompt = self._scrub_pii(request.prompt)
        content_log = {
            "request_hash": hashlib.sha256(request.prompt.encode()).hexdigest(),
            "prompt_preview": scrubbed_prompt[:200] + "...",
            "response_preview": self._scrub_pii(response.text[:200]),
            "pii_detected": self._has_pii(request.prompt),
        }
        self.content_store.emit(content_log, access_tier="restricted")

    def _scrub_pii(self, text):
        for name, pattern in self.PII_PATTERNS.items():
            text = re.sub(pattern, f"[REDACTED_{name.upper()}]", text)
        return text`,
    antiPattern: `# INSECURE: Verbatim logging with no scrubbing
import logging
logger = logging.getLogger("ai_app")

def log_request(prompt, response):
    # Full PII-containing content in application logs
    logger.info(f"Prompt: {prompt}")
    logger.info(f"Response: {response}")
    # Logs shipped to shared Elasticsearch with broad access`,
    consequences: [
      'PII scrubbing prevents sensitive data accumulation in log stores',
      'Separated metrics vs content telemetry enables appropriate access controls',
      'Scrubbing regex may miss novel PII patterns, requiring periodic rule updates',
      'Content preview truncation may limit debugging capability for complex issues',
    ],
    references: ['DSGAI14 - Excessive Telemetry & Monitoring Leakage'],
  },
  {
    id: 'ADR-009',
    title: 'Plugin/Tool Sandboxing',
    status: 'Accepted',
    relatedRisks: ['DSGAI06', 'DSGAI16'],
    context: 'AI agents invoke external tools and plugins to perform actions like web browsing, code execution, API calls, and file operations. Plugins execute with the agent runtime permissions and can access shared memory, network, and filesystem. A malicious or compromised plugin can exfiltrate data, modify agent state, or escalate privileges.',
    decision: 'Execute all plugins in isolated sandboxes with capability-based permissions. Each plugin declares required capabilities in a signed manifest. The sandbox enforces network egress restrictions, filesystem isolation, memory limits, and execution timeouts. Plugin outputs are validated and sanitized before returning to the agent orchestrator.',
    pattern: `// Plugin sandbox execution pattern
class PluginSandbox {
  constructor(runtime, policyEngine) {
    this.runtime = runtime;
    this.policyEngine = policyEngine;
  }

  async execute(plugin, input, agentContext) {
    // Verify plugin manifest signature
    if (!await this.verifyManifest(plugin.manifest)) {
      throw new PluginTrustError('Invalid plugin manifest signature');
    }

    // Create isolated execution environment
    const sandbox = await this.runtime.createSandbox({
      memoryLimitMb: plugin.manifest.resources.maxMemoryMb || 256,
      timeoutMs: plugin.manifest.resources.maxTimeoutMs || 10000,
      networkPolicy: {
        allowedDomains: plugin.manifest.network.allowlist || [],
        blockInternal: true,  // No access to internal services
      },
      filesystem: 'none',  // No filesystem access by default
      env: {},  // Clean environment, no inherited secrets
    });

    // Execute with capability enforcement
    const rawOutput = await sandbox.run(plugin.entrypoint, input);

    // Validate and sanitize output
    const validated = await this.policyEngine.validateOutput(
      rawOutput,
      plugin.manifest.outputSchema,
    );

    // Destroy sandbox (scrub memory)
    await sandbox.destroy();

    return validated;
  }
}`,
    antiPattern: `// INSECURE: Plugin runs in main process with full access
async function runPlugin(plugin, input) {
  // Plugin executes in same process, same permissions
  const result = await plugin.run(input);
  // No output validation, no resource limits
  return result;  // Plugin could have modified global state
}`,
    consequences: [
      'Sandbox isolation limits blast radius of compromised plugins to the sandbox',
      'Capability-based permissions prevent unauthorized access to agent resources',
      'Sandbox creation adds ~100ms overhead per plugin invocation',
      'Some legitimate plugins may require capabilities that expand the attack surface',
    ],
    references: ['DSGAI06 - Tool, Plugin & Agent Data Exchange Risks', 'DSGAI16 - Endpoint & Browser Assistant Overreach'],
  },
  {
    id: 'ADR-010',
    title: 'Model Artifact Integrity',
    status: 'Proposed',
    relatedRisks: ['DSGAI04', 'DSGAI20'],
    context: 'Model artifacts (weights, configurations, tokenizers) are downloaded from registries, transferred between environments, and deployed to serving infrastructure. Supply chain attacks can introduce backdoored models, and tampered artifacts can alter model behavior in production. Without integrity verification, organizations cannot distinguish legitimate models from compromised ones.',
    decision: 'Implement end-to-end model artifact integrity using cryptographic signing at build time, verification at deployment time, and continuous runtime attestation. Maintain a model bill of materials (MBOM) tracking all dependencies, training data provenance, and build environment details. Use content-addressable storage for immutable artifact management.',
    pattern: `# Model artifact integrity verification
import hashlib
import json
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization

class ModelIntegrityManager:
    def __init__(self, signing_key, registry_client):
        self.signing_key = signing_key
        self.registry = registry_client

    def sign_artifact(self, model_path, mbom):
        """Sign model artifact with provenance metadata."""
        # Compute content hash
        with open(model_path, 'rb') as f:
            content_hash = hashlib.sha256(f.read()).hexdigest()

        manifest = {
            "model_hash": content_hash,
            "mbom": mbom,  # Model Bill of Materials
            "build_env": self._capture_build_env(),
            "signed_at": datetime.utcnow().isoformat(),
        }

        # Sign the manifest
        signature = self.signing_key.sign(
            json.dumps(manifest, sort_keys=True).encode(),
            ec.ECDSA(hashes.SHA256()),
        )

        return {"manifest": manifest, "signature": signature.hex()}

    def verify_before_deploy(self, model_path, signed_manifest):
        """Verify artifact integrity before deployment."""
        with open(model_path, 'rb') as f:
            actual_hash = hashlib.sha256(f.read()).hexdigest()

        if actual_hash != signed_manifest["manifest"]["model_hash"]:
            raise IntegrityError("Model artifact hash mismatch - possible tampering")

        # Verify signature
        self.verify_key.verify(
            bytes.fromhex(signed_manifest["signature"]),
            json.dumps(signed_manifest["manifest"], sort_keys=True).encode(),
            ec.ECDSA(hashes.SHA256()),
        )
        return True`,
    antiPattern: `# INSECURE: No integrity checks on model artifacts
def deploy_model(model_url):
    # Download from untrusted URL with no verification
    model = download(model_url)
    # No hash check, no signature verification
    # Could be backdoored, tampered, or completely different model
    serving.load(model)`,
    consequences: [
      'Cryptographic signing detects tampered model artifacts before deployment',
      'MBOM provides full supply chain transparency for audit and compliance',
      'Signing/verification adds ~2-5 seconds per deployment for large models',
      'Key management complexity increases with multiple signing authorities',
    ],
    references: ['DSGAI04 - Data, Model & Artifact Poisoning', 'DSGAI20 - Model Exfiltration & IP Replication'],
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function statusStyle(status, dark) {
  const map = {
    Accepted: dark ? 'bg-green-900/50 text-green-300 border border-green-500/40' : 'bg-green-100 text-green-800 border border-green-300',
    Proposed: dark ? 'bg-amber-900/50 text-amber-300 border border-amber-500/40' : 'bg-amber-100 text-amber-800 border border-amber-300',
    Deprecated: dark ? 'bg-red-900/50 text-red-300 border border-red-500/40' : 'bg-red-100 text-red-800 border border-red-300',
  }
  return map[status] || (dark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600')
}

function statusIcon(status) {
  if (status === 'Accepted') return <CheckCircle className="w-3.5 h-3.5" />
  if (status === 'Proposed') return <AlertTriangle className="w-3.5 h-3.5" />
  return <AlertTriangle className="w-3.5 h-3.5" />
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {})
}

// ---------------------------------------------------------------------------
// ADR Card Component
// ---------------------------------------------------------------------------
function ADRCard({ adr, dark }) {
  const [expanded, setExpanded] = useState(false)
  const [copiedPattern, setCopiedPattern] = useState(false)
  const [copiedAnti, setCopiedAnti] = useState(false)

  const handleCopy = (text, setter) => {
    copyToClipboard(text)
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  return (
    <div className={`rounded-xl border ${dark ? 'bg-owasp-card border-owasp-border' : 'bg-white border-gray-200'} transition-all duration-200`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3 min-w-0 flex-wrap">
          <span className={`flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-mono font-bold ${dark ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-800 border border-purple-200'}`}>
            {adr.id}
          </span>
          <h3 className={`text-lg font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>
            {adr.title}
          </h3>
          <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusStyle(adr.status, dark)}`}>
            {statusIcon(adr.status)}
            {adr.status}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <span className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            {adr.relatedRisks.length} risks
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

          {/* Related Risks */}
          <div>
            <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Shield className="w-4 h-4" /> Related Risks
            </h4>
            <div className="flex flex-wrap gap-2">
              {adr.relatedRisks.map(riskId => (
                <Link
                  key={riskId}
                  to={`/risks/${riskId}`}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${dark ? 'bg-owasp-blue/20 text-owasp-blue hover:bg-owasp-blue/30 border border-owasp-blue/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'}`}
                >
                  {riskId}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </div>

          {/* Context */}
          <div>
            <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <BookOpen className="w-4 h-4" /> Context
            </h4>
            <p className={`text-sm leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
              {adr.context}
            </p>
          </div>

          {/* Decision */}
          <div>
            <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <CheckCircle className="w-4 h-4" /> Decision
            </h4>
            <p className={`text-sm leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
              {adr.decision}
            </p>
          </div>

          {/* Pattern (code block with green accent) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`text-sm font-semibold flex items-center gap-2 ${dark ? 'text-green-400' : 'text-green-700'}`}>
                <Code className="w-4 h-4" /> Recommended Pattern
              </h4>
              <button
                onClick={() => handleCopy(adr.pattern, setCopiedPattern)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${dark ? 'bg-gray-700 text-gray-400 hover:text-gray-300' : 'bg-gray-100 text-gray-500 hover:text-gray-700'}`}
              >
                <Copy className="w-3 h-3" />
                {copiedPattern ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className={`rounded-lg border-l-4 overflow-x-auto ${dark ? 'bg-gray-900 border-green-500' : 'bg-gray-950 border-green-500'}`}>
              <pre className="p-4 text-sm font-mono text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                <code>{adr.pattern}</code>
              </pre>
            </div>
          </div>

          {/* Anti-Pattern (code block with red accent) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`text-sm font-semibold flex items-center gap-2 ${dark ? 'text-red-400' : 'text-red-700'}`}>
                <AlertTriangle className="w-4 h-4" /> Anti-Pattern
              </h4>
              <button
                onClick={() => handleCopy(adr.antiPattern, setCopiedAnti)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${dark ? 'bg-gray-700 text-gray-400 hover:text-gray-300' : 'bg-gray-100 text-gray-500 hover:text-gray-700'}`}
              >
                <Copy className="w-3 h-3" />
                {copiedAnti ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className={`rounded-lg border-l-4 overflow-x-auto ${dark ? 'bg-gray-900 border-red-500' : 'bg-gray-950 border-red-500'}`}>
              <pre className="p-4 text-sm font-mono text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                <code>{adr.antiPattern}</code>
              </pre>
            </div>
          </div>

          {/* Consequences */}
          <div>
            <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <AlertTriangle className="w-4 h-4" /> Consequences
            </h4>
            <ul className="space-y-1.5">
              {adr.consequences.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${dark ? 'bg-amber-400' : 'bg-amber-500'}`} />
                  <span className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* References */}
          <div>
            <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <BookOpen className="w-4 h-4" /> References
            </h4>
            <ul className="space-y-1">
              {adr.references.map((ref, i) => (
                <li key={i} className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {ref}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------
export default function ADRs() {
  const { dark } = useTheme()
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')

  // Collect all unique related risk IDs
  const allRelatedRisks = [...new Set(adrs.flatMap(a => a.relatedRisks))].sort()
  const statuses = [...new Set(adrs.map(a => a.status))]

  const filtered = adrs.filter(adr => {
    if (statusFilter !== 'all' && adr.status !== statusFilter) return false
    if (riskFilter !== 'all' && !adr.relatedRisks.includes(riskFilter)) return false
    return true
  })

  return (
    <div className="py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${dark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
            <BookOpen className={`w-7 h-7 ${dark ? 'text-purple-400' : 'text-purple-700'}`} />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
              Architecture Decision Records
            </h1>
            <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              Secure-by-default patterns for GenAI systems
            </p>
          </div>
        </div>
        <p className={`max-w-3xl ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
          Documented architecture decisions with concrete code patterns and anti-patterns for building secure GenAI
          systems. Each ADR addresses specific DSGAI risks and provides copy-ready implementation guidance.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Status:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all'
                ? (dark ? 'bg-owasp-blue text-white' : 'bg-blue-600 text-white')
                : (dark ? 'bg-gray-800 text-gray-400 hover:text-gray-300' : 'bg-gray-100 text-gray-600 hover:text-gray-800')
              }`}
            >
              All
            </button>
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s
                  ? (dark ? 'bg-owasp-blue text-white' : 'bg-blue-600 text-white')
                  : (dark ? 'bg-gray-800 text-gray-400 hover:text-gray-300' : 'bg-gray-100 text-gray-600 hover:text-gray-800')
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Filter */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Risk:</span>
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${dark
              ? 'bg-gray-800 text-gray-300 border-gray-700 focus:border-owasp-blue'
              : 'bg-white text-gray-700 border-gray-300 focus:border-blue-500'
            } outline-none`}
          >
            <option value="all">All Risks</option>
            {allRelatedRisks.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ADR Cards */}
      <div className="space-y-4">
        {filtered.map(adr => (
          <ADRCard key={adr.id} adr={adr} dark={dark} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={`text-center py-16 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No ADRs match the current filters.</p>
        </div>
      )}
    </div>
  )
}
