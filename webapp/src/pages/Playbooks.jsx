import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, AlertTriangle, Search, ChevronDown, ChevronUp,
  Terminal, Eye, FileText, Clock, Target,
} from 'lucide-react'
import { risks, categories } from '../data/risks'
import { useTheme } from '../components/ThemeContext'

// ---------------------------------------------------------------------------
// Playbook data for all 21 risks
// ---------------------------------------------------------------------------

const playbookData = {
  DSGAI01: {
    detectionSignatures: [
      { name: 'High-entropy output detection', description: 'Monitor LLM outputs for patterns matching PII formats (SSN, credit card, email)', type: 'Output scanning' },
      { name: 'Enumeration pattern detection', description: 'Alert on sequential or systematic query patterns targeting data extraction', type: 'Behavioral' },
      { name: 'Embedding similarity anomaly', description: 'Detect queries with unusually high similarity to known sensitive documents', type: 'RAG monitoring' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=llm_logs sourcetype=api_response | regex response_text="\\b\\d{3}-\\d{2}-\\d{4}\\b|\\b\\d{16}\\b" | stats count by user_id, session_id | where count > 3', description: 'Detect PII patterns in LLM responses' },
      { platform: 'Sentinel (KQL)', query: 'LLMApiLogs\n| where ResponseBody matches regex @"\\b\\d{3}-\\d{2}-\\d{4}\\b"\n| summarize Count=count() by UserId, bin(TimeGenerated, 1h)\n| where Count > 5', description: 'Detect SSN patterns in responses' },
      { platform: 'Elastic', query: '{"query":{"bool":{"must":[{"regexp":{"response.text":"[0-9]{3}-[0-9]{2}-[0-9]{4}"}},{"range":{"@timestamp":{"gte":"now-1h"}}}]}}}', description: 'Detect PII leakage in last hour' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Confirm the alert is a true positive by reviewing the flagged output content. Check if the data matches known sensitive records.' },
      { step: 2, action: 'Contain', detail: 'Immediately enable output filtering/blocking for the affected endpoint. Revoke the session if user-initiated extraction is suspected.' },
      { step: 3, action: 'Investigate', detail: 'Review query logs for the session to identify scope of extraction. Check if a prompt injection or jailbreak was used.' },
      { step: 4, action: 'Remediate', detail: 'Add the leaked data pattern to the DLP blocklist. If training data leakage, evaluate retraining or unlearning options.' },
      { step: 5, action: 'Recover', detail: 'Notify affected data subjects if PII was confirmed leaked. File regulatory notification if required (72h for GDPR).' },
      { step: 6, action: 'Lessons learned', detail: 'Update detection rules, add regression test for the specific leakage pattern, review data minimization in training pipeline.' },
    ],
    iocs: [
      { type: 'Behavioral', indicator: 'Single user submitting >50 semantically diverse queries in <10 minutes' },
      { type: 'Output', indicator: 'Response containing 3+ distinct PII-format strings (SSN, email, phone) in a single output' },
      { type: 'Query', indicator: 'Prompts containing "list all", "enumerate", "show every", "dump" combined with entity types' },
    ],
    severity: 'Critical',
    mttr: '2-4 hours (containment), 1-2 weeks (full remediation)',
  },

  DSGAI02: {
    detectionSignatures: [
      { name: 'Credential pattern in context', description: 'Detect API keys, tokens, or passwords passed in agent tool-call parameters or system prompts', type: 'Output scanning' },
      { name: 'Privilege escalation attempt', description: 'Alert when an agent requests higher-privilege credentials than its assigned role', type: 'Behavioral' },
      { name: 'Credential reuse across sessions', description: 'Detect same service account credential used in multiple unrelated agent sessions', type: 'Identity monitoring' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=agent_logs sourcetype=tool_calls | regex parameters="(?i)(api_key|token|password|secret)\\s*[:=]\\s*[A-Za-z0-9+/=]{20,}" | stats count by agent_id, tool_name | where count > 1', description: 'Detect credentials in agent tool calls' },
      { platform: 'Sentinel (KQL)', query: 'AgentToolLogs\n| where Parameters matches regex @"(?i)(Bearer|sk-|AKIA)[A-Za-z0-9]{16,}"\n| summarize Count=count() by AgentId, ToolName, bin(TimeGenerated, 15m)\n| where Count > 2', description: 'Detect exposed tokens in agent parameters' },
      { platform: 'Elastic', query: '{"query":{"bool":{"must":[{"regexp":{"tool_params":"(sk-|AKIA|ghp_)[A-Za-z0-9]{20,}"}},{"term":{"event.category":"agent_execution"}}]}}}', description: 'Find credential exposure in agent executions' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Verify the exposed credential is a genuine secret by cross-referencing with the secrets vault. Determine the scope of access the credential grants.' },
      { step: 2, action: 'Contain', detail: 'Immediately rotate the compromised credential. Disable the agent session and revoke any derived tokens.' },
      { step: 3, action: 'Investigate', detail: 'Audit all actions performed using the exposed credential. Check for unauthorized data access or lateral movement.' },
      { step: 4, action: 'Remediate', detail: 'Implement credential injection via environment variables instead of prompt context. Deploy a secrets scanning pre-filter on agent inputs.' },
      { step: 5, action: 'Recover', detail: 'Verify all rotated credentials are propagated. Re-enable agent workflows with hardened credential handling.' },
      { step: 6, action: 'Lessons learned', detail: 'Update agent framework to use short-lived tokens. Add credential detection to CI/CD pipeline for agent configurations.' },
    ],
    iocs: [
      { type: 'Output', indicator: 'Agent response containing strings matching API key formats (sk-*, AKIA*, ghp_*)' },
      { type: 'Behavioral', indicator: 'Agent requesting credentials for services outside its designated scope' },
      { type: 'Log', indicator: 'Multiple failed authentication attempts from agent service accounts within 5 minutes' },
    ],
    severity: 'Critical',
    mttr: '1-2 hours (containment), 3-5 days (full remediation)',
  },

  DSGAI03: {
    detectionSignatures: [
      { name: 'Unsanctioned API endpoint detection', description: 'Monitor egress traffic for connections to known consumer AI service domains not in the approved list', type: 'Network monitoring' },
      { name: 'Data exfiltration volume anomaly', description: 'Alert when clipboard or upload volume to external AI tools exceeds baseline thresholds', type: 'DLP' },
      { name: 'Shadow AI browser extension detection', description: 'Detect installation of unauthorized AI browser extensions or desktop apps via endpoint telemetry', type: 'Endpoint' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=proxy_logs dest_domain IN ("api.openai.com","generativelanguage.googleapis.com","api.anthropic.com") NOT [inputlookup approved_ai_domains] | stats sum(bytes_out) as total_bytes by src_user, dest_domain | where total_bytes > 1048576', description: 'Detect data sent to unapproved AI APIs' },
      { platform: 'Sentinel (KQL)', query: 'ProxyLogs\n| where DestDomain in ("api.openai.com","api.anthropic.com")\n| where DestDomain !in (ApprovedAIDomains)\n| summarize TotalBytes=sum(BytesSent) by SrcUser, DestDomain, bin(TimeGenerated, 1h)\n| where TotalBytes > 1000000', description: 'Shadow AI data flow detection' },
      { platform: 'Elastic', query: '{"query":{"bool":{"must":[{"terms":{"destination.domain":["api.openai.com","api.anthropic.com"]}},{"range":{"network.bytes":{"gte":100000}}}],"must_not":[{"terms":{"destination.domain":["approved-list"]}}]}}}', description: 'Unsanctioned AI API data transfer' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Identify the user, device, and AI service involved. Determine what data categories were sent to the unsanctioned service.' },
      { step: 2, action: 'Contain', detail: 'Block the unsanctioned AI domain at the proxy/firewall level. Notify the user and their manager of the policy violation.' },
      { step: 3, action: 'Investigate', detail: 'Review proxy logs to determine the full history of data transmitted. Classify the sensitivity level of the exposed data.' },
      { step: 4, action: 'Remediate', detail: 'Deploy DLP rules to block sensitive data categories to all AI endpoints. Update the approved AI tools list and communicate to the organization.' },
      { step: 5, action: 'Recover', detail: 'Request data deletion from the AI vendor if possible. Document the incident for compliance records.' },
      { step: 6, action: 'Lessons learned', detail: 'Conduct awareness training on approved AI tools. Evaluate if the shadow AI usage reveals an unmet business need that should be addressed.' },
    ],
    iocs: [
      { type: 'Network', indicator: 'Outbound HTTPS connections to consumer AI API endpoints from corporate endpoints' },
      { type: 'Endpoint', indicator: 'AI browser extensions (e.g., ChatGPT, Copilot) installed without IT approval' },
      { type: 'DLP', indicator: 'Large text paste events (>5KB) to web-based AI chatbot interfaces' },
      { type: 'Behavioral', indicator: 'Users accessing AI services during off-hours with elevated data volumes' },
    ],
    severity: 'High',
    mttr: '4-8 hours (containment), 1-2 weeks (full remediation)',
  },

  DSGAI04: {
    detectionSignatures: [
      { name: 'Training data integrity drift', description: 'Detect statistical anomalies in training dataset distributions compared to validated baselines', type: 'Pipeline monitoring' },
      { name: 'Adversarial sample injection', description: 'Alert on data submissions containing known poisoning patterns (trigger phrases, backdoor tokens)', type: 'Input validation' },
      { name: 'Model behavior regression', description: 'Monitor model output quality metrics for sudden degradation indicating potential poisoning', type: 'Model monitoring' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=ml_pipeline sourcetype=data_ingestion | eval hash=md5(record_content) | stats dc(hash) as unique_records, count as total by data_source, batch_id | where (total - unique_records) / total > 0.1', description: 'Detect duplicate/suspicious records in training batches' },
      { platform: 'Sentinel (KQL)', query: 'MLPipelineLogs\n| where EventType == "data_ingestion"\n| summarize RecordCount=count(), DistinctHashes=dcount(ContentHash) by DataSource, BatchId\n| extend DuplicateRatio = 1.0 - (DistinctHashes * 1.0 / RecordCount)\n| where DuplicateRatio > 0.1', description: 'Detect anomalous duplicate rates in training data' },
      { platform: 'Elastic', query: '{"aggs":{"by_batch":{"terms":{"field":"batch_id"},"aggs":{"unique_hashes":{"cardinality":{"field":"content_hash"}},"total":{"value_count":{"field":"content_hash"}}}}}}', description: 'Aggregate training data integrity metrics' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Verify the integrity alert by comparing flagged data samples against the known-good baseline. Check provenance metadata for each suspicious record.' },
      { step: 2, action: 'Contain', detail: 'Halt the affected training pipeline immediately. Quarantine the suspicious data batch and prevent it from being used in any active training jobs.' },
      { step: 3, action: 'Investigate', detail: 'Trace the poisoned data to its source. Analyze the poisoning vector (supply chain, insider, adversarial injection). Assess if any deployed models consumed the poisoned data.' },
      { step: 4, action: 'Remediate', detail: 'Remove poisoned records from all data stores. Retrain affected models from the last known-good checkpoint. Implement input validation and cryptographic signing for data sources.' },
      { step: 5, action: 'Recover', detail: 'Deploy the retrained model and monitor for behavioral regression. Validate outputs against test suites for poisoning indicators.' },
    ],
    iocs: [
      { type: 'Data', indicator: 'Batch submissions with >10% duplicate or near-duplicate records' },
      { type: 'Behavioral', indicator: 'Sudden shift in training loss curves without corresponding data changes' },
      { type: 'Supply chain', indicator: 'Data source providing records with statistical distributions diverging >2 sigma from historical baseline' },
    ],
    severity: 'Critical',
    mttr: '4-8 hours (containment), 2-4 weeks (full remediation)',
  },

  DSGAI05: {
    detectionSignatures: [
      { name: 'Schema validation failure spike', description: 'Alert when input data schema validation failures exceed 5% threshold within a processing window', type: 'Pipeline monitoring' },
      { name: 'Data type coercion anomaly', description: 'Detect unexpected type coercions or null value injections in feature engineering pipelines', type: 'Input validation' },
      { name: 'Output confidence degradation', description: 'Monitor model confidence scores for systematic drops indicating data quality issues upstream', type: 'Model monitoring' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=data_pipeline sourcetype=validation_logs status="failed" | timechart span=15m count as failures | where failures > 50 | eval severity=if(failures>200,"critical","warning")', description: 'Track data validation failure rates' },
      { platform: 'Sentinel (KQL)', query: 'DataPipelineLogs\n| where ValidationStatus == "failed"\n| summarize FailureCount=count() by Pipeline, bin(TimeGenerated, 15m)\n| where FailureCount > 50\n| project TimeGenerated, Pipeline, FailureCount', description: 'Detect validation failure spikes' },
      { platform: 'Elastic', query: '{"query":{"bool":{"must":[{"term":{"validation.status":"failed"}},{"range":{"@timestamp":{"gte":"now-15m"}}}]}},"aggs":{"by_pipeline":{"terms":{"field":"pipeline.name"},"aggs":{"failure_count":{"value_count":{"field":"record_id"}}}}}}', description: 'Aggregate validation failures by pipeline' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Assess the scope of validation failures. Identify which data sources and fields are affected. Check if failures are correlated with a specific data provider or schema change.' },
      { step: 2, action: 'Contain', detail: 'Enable strict validation mode to reject all non-conforming records. Switch to fallback data sources if available.' },
      { step: 3, action: 'Investigate', detail: 'Compare current data distributions against historical baselines. Identify root cause (schema drift, source corruption, encoding issue).' },
      { step: 4, action: 'Remediate', detail: 'Fix the root cause at the data source. Add specific validation rules for the identified failure patterns. Deploy data contracts with upstream providers.' },
      { step: 5, action: 'Recover', detail: 'Reprocess affected batches with corrected data. Validate model outputs for any degradation during the incident window.' },
      { step: 6, action: 'Lessons learned', detail: 'Implement data contract testing in CI/CD. Add automated data drift monitoring with alerting thresholds.' },
    ],
    iocs: [
      { type: 'Pipeline', indicator: 'Validation failure rate exceeding 5% of total records in any 15-minute window' },
      { type: 'Data', indicator: 'Null value injection rate >2% in previously non-nullable fields' },
      { type: 'Model', indicator: 'Mean confidence score dropping >15% from rolling 24h baseline' },
    ],
    severity: 'High',
    mttr: '2-4 hours (containment), 3-7 days (full remediation)',
  },

  DSGAI06: {
    detectionSignatures: [
      { name: 'Excessive tool data access', description: 'Alert when an agent tool requests or returns data volumes exceeding expected thresholds for the operation type', type: 'Behavioral' },
      { name: 'Cross-boundary data transfer', description: 'Detect data flowing between tools or plugins that crosses defined trust boundary classifications', type: 'DLP' },
      { name: 'Unauthorized API chaining', description: 'Alert on agent tool-call sequences that bypass intended data access controls through indirect paths', type: 'Behavioral' },
      { name: 'Plugin response manipulation', description: 'Detect signs of a compromised plugin returning data designed to influence subsequent agent actions', type: 'Integrity monitoring' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=agent_logs sourcetype=tool_calls | stats sum(response_bytes) as total_bytes, dc(tool_name) as tools_used by session_id, span=5m | where total_bytes > 5242880 OR tools_used > 10', description: 'Detect excessive data exchange in agent sessions' },
      { platform: 'Sentinel (KQL)', query: 'AgentToolLogs\n| where EventType == "tool_response"\n| summarize TotalBytes=sum(ResponseSize), ToolCount=dcount(ToolName) by SessionId, bin(TimeGenerated, 5m)\n| where TotalBytes > 5000000 or ToolCount > 10', description: 'Monitor agent tool data exchange volumes' },
      { platform: 'Elastic', query: '{"query":{"range":{"tool_response.size":{"gte":1048576}}},"aggs":{"by_session":{"terms":{"field":"session_id"},"aggs":{"total_data":{"sum":{"field":"tool_response.size"}},"tools_used":{"cardinality":{"field":"tool_name"}}}}}}', description: 'Track data exchange per agent session' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Identify the agent session and tools involved. Determine if the data exchange volume is legitimate for the task being performed.' },
      { step: 2, action: 'Contain', detail: 'Suspend the agent session. Disable the suspect plugin or tool integration. Apply rate limiting to the affected tool endpoints.' },
      { step: 3, action: 'Investigate', detail: 'Review the full tool-call chain to identify if data was exfiltrated through a series of legitimate-looking calls. Check plugin integrity and source.' },
      { step: 4, action: 'Remediate', detail: 'Implement per-tool data exchange limits. Add data classification-aware filtering between tool boundaries. Deploy allowlists for tool-call sequences.' },
      { step: 5, action: 'Recover', detail: 'Restore tool integrations with updated security controls. Verify data integrity of any records modified by the compromised tool chain.' },
    ],
    iocs: [
      { type: 'Behavioral', indicator: 'Agent invoking >10 distinct tools in a single session with escalating data access patterns' },
      { type: 'Network', indicator: 'Tool responses exceeding 5MB for operations that typically return <100KB' },
      { type: 'Integrity', indicator: 'Plugin response containing embedded instructions or prompt-injection patterns' },
    ],
    severity: 'High',
    mttr: '2-4 hours (containment), 1-2 weeks (full remediation)',
  },

  DSGAI07: {
    detectionSignatures: [
      { name: 'Unclassified data in AI pipeline', description: 'Detect data entering training or inference pipelines without a valid classification label', type: 'Pipeline monitoring' },
      { name: 'Classification label tampering', description: 'Alert when data classification labels are modified outside of approved governance workflows', type: 'Integrity monitoring' },
      { name: 'Retention policy violation', description: 'Detect AI artifacts (models, datasets, embeddings) that have exceeded their defined retention period', type: 'Lifecycle monitoring' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=data_governance sourcetype=classification_audit | where classification="unclassified" AND pipeline_stage IN ("training","fine_tuning","rag_ingestion") | stats count by data_source, pipeline_stage | where count > 10', description: 'Detect unclassified data entering AI pipelines' },
      { platform: 'Sentinel (KQL)', query: 'DataGovernanceLogs\n| where Classification == "unclassified" and PipelineStage in ("training","rag_ingestion")\n| summarize Count=count() by DataSource, PipelineStage, bin(TimeGenerated, 1h)\n| where Count > 10', description: 'Unclassified data in AI pipeline detection' },
      { platform: 'Elastic', query: '{"query":{"bool":{"must":[{"term":{"classification":"unclassified"}},{"terms":{"pipeline_stage":["training","fine_tuning","rag_ingestion"]}}]}},"aggs":{"by_source":{"terms":{"field":"data_source"}}}}', description: 'Find unclassified data in AI workflows' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Identify the unclassified or misclassified data and its current location in the AI pipeline. Determine the data sensitivity based on content sampling.' },
      { step: 2, action: 'Contain', detail: 'Pause the affected pipeline. Quarantine unclassified data to prevent further processing until classification is completed.' },
      { step: 3, action: 'Investigate', detail: 'Trace why governance controls were bypassed. Check if classification labels were stripped during data transformation or if data entered through an ungoverned path.' },
      { step: 4, action: 'Remediate', detail: 'Apply proper classification labels. Implement mandatory classification checks as pipeline gates. Add automated classification for common data patterns.' },
      { step: 5, action: 'Recover', detail: 'Resume the pipeline with properly classified data. Audit all existing datasets in the pipeline for classification completeness.' },
      { step: 6, action: 'Lessons learned', detail: 'Establish data governance SLAs for classification. Implement classification-as-code in the MLOps pipeline.' },
    ],
    iocs: [
      { type: 'Pipeline', indicator: 'Data batches with >5% unclassified records entering production training pipelines' },
      { type: 'Audit', indicator: 'Classification label changes without corresponding approval ticket references' },
      { type: 'Lifecycle', indicator: 'Model artifacts older than retention policy with no scheduled disposal date' },
    ],
    severity: 'Medium',
    mttr: '4-8 hours (containment), 2-4 weeks (full remediation)',
  },

  DSGAI08: {
    detectionSignatures: [
      { name: 'Consent gap detection', description: 'Monitor for data processing activities that lack documented consent or legal basis records', type: 'Compliance monitoring' },
      { name: 'Cross-border data transfer alert', description: 'Detect AI model inference or training data crossing regulated jurisdictional boundaries', type: 'Network monitoring' },
      { name: 'Regulatory audit trail gap', description: 'Alert when required audit log entries are missing for AI processing activities', type: 'Audit monitoring' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=compliance_logs sourcetype=consent_tracking | where consent_status="missing" AND processing_type="ai_*" | stats count by data_subject_category, processing_purpose | where count > 5', description: 'Detect AI processing without consent records' },
      { platform: 'Sentinel (KQL)', query: 'ComplianceLogs\n| where ProcessingType startswith "ai_" and ConsentStatus == "missing"\n| summarize Count=count() by DataCategory, ProcessingPurpose, bin(TimeGenerated, 1d)\n| where Count > 5', description: 'Missing consent for AI data processing' },
      { platform: 'Elastic', query: '{"query":{"bool":{"must":[{"prefix":{"processing_type":"ai_"}},{"term":{"consent.status":"missing"}}]}},"aggs":{"by_purpose":{"terms":{"field":"processing_purpose"}}}}', description: 'Track consent gaps in AI processing' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Identify the specific regulatory requirement that may be violated. Assess the scope of affected data subjects and jurisdictions.' },
      { step: 2, action: 'Contain', detail: 'Suspend the non-compliant AI processing activity. Engage legal and compliance teams immediately.' },
      { step: 3, action: 'Investigate', detail: 'Conduct a gap analysis between current AI practices and applicable regulations (GDPR, HIPAA, CCPA, EU AI Act). Document all findings.' },
      { step: 4, action: 'Remediate', detail: 'Implement missing controls (consent mechanisms, data processing agreements, impact assessments). Update AI system documentation.' },
      { step: 5, action: 'Recover', detail: 'Resume processing only after legal sign-off. Submit required regulatory notifications if breach thresholds are met.' },
      { step: 6, action: 'Lessons learned', detail: 'Establish a regulatory change monitoring process. Implement automated compliance checks in the AI deployment pipeline.' },
    ],
    iocs: [
      { type: 'Compliance', indicator: 'AI processing records missing Data Protection Impact Assessment (DPIA) references' },
      { type: 'Network', indicator: 'Training data or model inference requests routed through non-approved geographic regions' },
      { type: 'Audit', indicator: 'Gaps in audit trail for AI model training activities exceeding 24 hours' },
    ],
    severity: 'High',
    mttr: '24-48 hours (containment), 4-8 weeks (full remediation)',
  },

  DSGAI09: {
    detectionSignatures: [
      { name: 'Cross-modal data leakage', description: 'Detect sensitive information extracted from images, audio, or video and surfaced in text outputs', type: 'Output scanning' },
      { name: 'Steganographic content detection', description: 'Alert on multimodal inputs containing hidden data payloads in image or audio channels', type: 'Input validation' },
      { name: 'Channel-crossing PII detection', description: 'Monitor for PII that enters via one modality (e.g., image of a document) and leaks via another (text response)', type: 'DLP' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=multimodal_logs input_type IN ("image","audio","video") | join session_id [search index=multimodal_logs output_type="text" | regex response_text="\\b\\d{3}-\\d{2}-\\d{4}\\b"] | stats count by session_id, input_type', description: 'Detect cross-modal PII leakage' },
      { platform: 'Sentinel (KQL)', query: 'MultimodalLogs\n| where InputType in ("image","audio","video")\n| join kind=inner (MultimodalLogs | where OutputType == "text" and ResponseText matches regex @"\\d{3}-\\d{2}-\\d{4}") on SessionId\n| project SessionId, InputType, ResponseText', description: 'Cross-channel data extraction detection' },
      { platform: 'Elastic', query: '{"query":{"bool":{"must":[{"terms":{"input.type":["image","audio","video"]}},{"exists":{"field":"output.pii_detected"}}]}}}', description: 'Multimodal PII extraction alerts' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Identify the input modality and output channel involved. Verify what sensitive information crossed modality boundaries.' },
      { step: 2, action: 'Contain', detail: 'Disable the multimodal processing endpoint. Block the specific input type if a repeatable extraction vector is identified.' },
      { step: 3, action: 'Investigate', detail: 'Analyze the multimodal pipeline to determine if OCR, transcription, or image analysis components are leaking data that should be filtered.' },
      { step: 4, action: 'Remediate', detail: 'Add PII detection to all modality conversion steps. Implement output filtering that is aware of cross-modal data flows.' },
      { step: 5, action: 'Recover', detail: 'Re-enable the endpoint with updated filters. Run regression tests with known cross-modal leakage scenarios.' },
    ],
    iocs: [
      { type: 'Cross-modal', indicator: 'Text output containing structured data (SSN, account numbers) when input was image-only' },
      { type: 'Input', indicator: 'Image or audio files with anomalously large file sizes relative to their apparent content' },
      { type: 'Behavioral', indicator: 'User submitting images of documents followed by data extraction queries' },
    ],
    severity: 'High',
    mttr: '2-4 hours (containment), 1-2 weeks (full remediation)',
  },

  DSGAI10: {
    detectionSignatures: [
      { name: 'Re-identification risk scoring', description: 'Continuously score synthetic and anonymized datasets for re-identification risk using k-anonymity and l-diversity metrics', type: 'Data monitoring' },
      { name: 'Synthetic data distribution drift', description: 'Detect when synthetic data distributions diverge from or overly replicate source data patterns', type: 'Statistical monitoring' },
      { name: 'Anonymization reversal detection', description: 'Alert when queries against anonymized datasets produce results linkable to specific individuals', type: 'Behavioral' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=privacy_logs sourcetype=anonymization_audit | where k_anonymity_score < 5 OR l_diversity_score < 3 | stats count by dataset_id, anonymization_method | where count > 0', description: 'Detect weak anonymization in datasets' },
      { platform: 'Sentinel (KQL)', query: 'PrivacyAuditLogs\n| where KAnonymityScore < 5 or LDiversityScore < 3\n| project DatasetId, AnonymizationMethod, KAnonymityScore, LDiversityScore, TimeGenerated\n| sort by KAnonymityScore asc', description: 'Find datasets with insufficient anonymization' },
      { platform: 'Elastic', query: '{"query":{"bool":{"should":[{"range":{"k_anonymity_score":{"lt":5}}},{"range":{"l_diversity_score":{"lt":3}}}]}},"sort":[{"k_anonymity_score":"asc"}]}', description: 'Query weak anonymization datasets' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Assess the re-identification risk level for the flagged dataset. Determine if the data has already been used in training or shared externally.' },
      { step: 2, action: 'Contain', detail: 'Restrict access to the flagged dataset. Halt any ongoing training jobs using the data. Prevent further distribution.' },
      { step: 3, action: 'Investigate', detail: 'Run formal re-identification tests using external data sources. Assess whether linkage attacks are feasible with publicly available data.' },
      { step: 4, action: 'Remediate', detail: 'Re-anonymize or re-generate synthetic data with stronger privacy guarantees (increase k-anonymity, apply differential privacy). Destroy the weak dataset.' },
      { step: 5, action: 'Recover', detail: 'Replace the flagged dataset in all pipelines with the re-anonymized version. Re-validate downstream model quality.' },
      { step: 6, action: 'Lessons learned', detail: 'Establish minimum privacy thresholds for all anonymization and synthetic data generation. Add automated re-identification testing to the data release pipeline.' },
    ],
    iocs: [
      { type: 'Statistical', indicator: 'Datasets with k-anonymity score below 5 or l-diversity below 3' },
      { type: 'Data', indicator: 'Synthetic datasets where >5% of records have a nearest-neighbor distance of 0 to source records' },
      { type: 'Behavioral', indicator: 'Repeated queries combining quasi-identifiers (age, zip, gender) against anonymized datasets' },
    ],
    severity: 'Medium',
    mttr: '8-24 hours (containment), 2-4 weeks (full remediation)',
  },

  DSGAI11: {
    detectionSignatures: [
      { name: 'Cross-session context leakage', description: 'Detect when a model response references information from a different user session or conversation', type: 'Output scanning' },
      { name: 'Shared memory contamination', description: 'Alert when conversation memory or context stores are accessed by sessions belonging to different users', type: 'Access monitoring' },
      { name: 'Multi-tenant context mixing', description: 'Monitor for tenant-identifying information appearing in responses to users from a different tenant', type: 'Isolation monitoring' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=llm_logs sourcetype=conversation | eval resp_users=mvdedup(mvappend(session_user, extracted_user_references)) | where mvcount(resp_users) > 1 | stats count by session_id, session_user', description: 'Detect cross-user data references in conversations' },
      { platform: 'Sentinel (KQL)', query: 'ConversationLogs\n| where ResponseBody contains_cs "user_"\n| extend MentionedUsers = extract_all(@"user_([a-z0-9]+)", ResponseBody)\n| where array_length(MentionedUsers) > 0 and MentionedUsers !has SessionUser\n| project SessionId, SessionUser, MentionedUsers', description: 'Cross-user context bleed detection' },
      { platform: 'Elastic', query: '{"query":{"bool":{"must":[{"exists":{"field":"response.user_references"}},{"script":{"script":"doc[\'response.user_references\'].length > 1"}}]}}}', description: 'Find responses referencing multiple users' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Confirm the cross-context leakage by reviewing the response content. Identify all users/tenants whose data may have been exposed.' },
      { step: 2, action: 'Contain', detail: 'Terminate the affected sessions. Clear the shared memory/context store. Enforce session isolation immediately.' },
      { step: 3, action: 'Investigate', detail: 'Analyze the conversation memory architecture to identify the isolation failure. Check if caching, shared embedding stores, or context windows are the leak source.' },
      { step: 4, action: 'Remediate', detail: 'Implement strict session isolation (separate memory stores per user/tenant). Add cross-session data leak detection to the output pipeline.' },
      { step: 5, action: 'Recover', detail: 'Notify affected users of the data exposure. Purge all shared context stores and rebuild with proper isolation.' },
    ],
    iocs: [
      { type: 'Output', indicator: 'Model response containing names, identifiers, or context from a different user session' },
      { type: 'Infrastructure', indicator: 'Shared Redis/memory cache being accessed by multiple tenant sessions without namespace isolation' },
      { type: 'Behavioral', indicator: 'User receiving proactive suggestions based on another user conversation history' },
    ],
    severity: 'Critical',
    mttr: '1-2 hours (containment), 1-2 weeks (full remediation)',
  },

  DSGAI12: {
    detectionSignatures: [
      { name: 'SQL injection via natural language', description: 'Detect generated SQL queries containing injection patterns (UNION SELECT, DROP TABLE, --comment)', type: 'Query validation' },
      { name: 'Excessive data retrieval', description: 'Alert when LLM-generated queries would return more rows than the configured threshold for the user role', type: 'Access control' },
      { name: 'Schema reconnaissance detection', description: 'Monitor for generated queries that probe database schema (INFORMATION_SCHEMA, pg_catalog, system tables)', type: 'Behavioral' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=nlq_logs sourcetype=generated_sql | regex query="(?i)(UNION\\s+SELECT|DROP\\s+TABLE|INSERT\\s+INTO|;\\s*--|INFORMATION_SCHEMA|pg_catalog)" | stats count by user_id, natural_language_input | where count > 0', description: 'Detect SQL injection patterns in LLM-generated queries' },
      { platform: 'Sentinel (KQL)', query: 'NLQueryLogs\n| where GeneratedSQL matches regex @"(?i)(UNION\\s+SELECT|DROP\\s+TABLE|INFORMATION_SCHEMA)"\n| project UserId, NaturalLanguageInput, GeneratedSQL, TimeGenerated\n| sort by TimeGenerated desc', description: 'SQL injection via natural language detection' },
      { platform: 'Elastic', query: '{"query":{"bool":{"must":[{"regexp":{"generated_sql":"(?i)(UNION\\\\s+SELECT|DROP\\\\s+TABLE|INFORMATION_SCHEMA)"}},{"range":{"@timestamp":{"gte":"now-1h"}}}]}}}', description: 'Detect dangerous SQL patterns in NLQ output' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Review the flagged SQL query and the natural language input that generated it. Determine if the query would have caused data leakage or destruction if executed.' },
      { step: 2, action: 'Contain', detail: 'Block execution of the flagged query. Enable read-only mode for the NLQ gateway. Disable the affected user session.' },
      { step: 3, action: 'Investigate', detail: 'Determine if the natural language input was crafted to bypass LLM guardrails. Check if any previous malicious queries were successfully executed.' },
      { step: 4, action: 'Remediate', detail: 'Implement parameterized query generation. Add a SQL validation layer between the LLM output and database execution. Enforce row-level security and query result limits.' },
      { step: 5, action: 'Recover', detail: 'If unauthorized queries were executed, assess and repair data integrity. Re-enable the NLQ gateway with enhanced guardrails.' },
      { step: 6, action: 'Lessons learned', detail: 'Add adversarial NLQ test cases to regression suite. Implement query plan analysis before execution to detect data exfiltration attempts.' },
    ],
    iocs: [
      { type: 'Query', indicator: 'Generated SQL containing UNION SELECT, subqueries against system tables, or comment-based injection (-- or /*)' },
      { type: 'Behavioral', indicator: 'Natural language inputs using technical SQL terminology or database-specific syntax' },
      { type: 'Access', indicator: 'NLQ-generated queries returning >10,000 rows or accessing tables outside the user authorized schema' },
    ],
    severity: 'Critical',
    mttr: '1-2 hours (containment), 1-2 weeks (full remediation)',
  },

  DSGAI13: {
    detectionSignatures: [
      { name: 'Vector store unauthorized access', description: 'Detect access to vector collections or namespaces by identities not in the authorized access list', type: 'Access monitoring' },
      { name: 'Embedding exfiltration pattern', description: 'Alert on bulk vector retrieval operations that could indicate an attempt to reconstruct source documents', type: 'Behavioral' },
      { name: 'Nearest-neighbor abuse', description: 'Monitor for similarity search patterns designed to enumerate the contents of a vector store', type: 'Behavioral' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=vector_db_logs sourcetype=access_logs action="query" | stats count, dc(query_vector_hash) as unique_queries by user_id, collection_name, span=10m | where count > 100 OR unique_queries > 50', description: 'Detect bulk vector store enumeration' },
      { platform: 'Sentinel (KQL)', query: 'VectorDBLogs\n| where Action == "query"\n| summarize QueryCount=count(), UniqueVectors=dcount(QueryVectorHash) by UserId, CollectionName, bin(TimeGenerated, 10m)\n| where QueryCount > 100 or UniqueVectors > 50', description: 'Detect vector store enumeration attempts' },
      { platform: 'Elastic', query: '{"query":{"term":{"action":"query"}},"aggs":{"by_user_collection":{"multi_terms":{"terms":[{"field":"user_id"},{"field":"collection_name"}]},"aggs":{"query_count":{"value_count":{"field":"query_id"}}}}}}', description: 'Aggregate vector store access patterns' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Identify the scope of unauthorized access or enumeration. Determine which vector collections and source documents are affected.' },
      { step: 2, action: 'Contain', detail: 'Revoke the unauthorized identity access. Apply rate limiting on the vector store query API. Enable enhanced logging.' },
      { step: 3, action: 'Investigate', detail: 'Analyze query patterns to determine if source document reconstruction was attempted. Check if the retrieved vectors could be used to infer sensitive content.' },
      { step: 4, action: 'Remediate', detail: 'Implement collection-level access controls. Add query rate limiting per user/session. Deploy result filtering based on user authorization level.' },
      { step: 5, action: 'Recover', detail: 'Audit all vector collections for proper access controls. Re-index sensitive collections with additional access metadata.' },
    ],
    iocs: [
      { type: 'Access', indicator: 'User querying >100 unique vectors against a single collection in 10 minutes' },
      { type: 'Behavioral', indicator: 'Sequential similarity searches with incrementally adjusted query vectors (grid search pattern)' },
      { type: 'Network', indicator: 'Bulk API calls to vector store endpoints from a single IP with varying authentication tokens' },
    ],
    severity: 'High',
    mttr: '2-4 hours (containment), 1-2 weeks (full remediation)',
  },

  DSGAI14: {
    detectionSignatures: [
      { name: 'PII in telemetry data', description: 'Scan telemetry/logging pipelines for inadvertent capture of user prompts, responses, or PII in monitoring data', type: 'DLP' },
      { name: 'Excessive logging verbosity', description: 'Detect when AI system logging levels are set to DEBUG or TRACE in production, capturing full request/response payloads', type: 'Configuration monitoring' },
      { name: 'Telemetry data exfiltration', description: 'Alert on telemetry data being exported to destinations outside the approved monitoring infrastructure', type: 'Network monitoring' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=observability_logs sourcetype=ai_telemetry | regex _raw="(?i)(ssn|social.security|credit.card|password|api_key)" | stats count by source, log_level | where log_level IN ("DEBUG","TRACE") AND count > 0', description: 'Detect PII in AI telemetry streams' },
      { platform: 'Sentinel (KQL)', query: 'AITelemetryLogs\n| where LogLevel in ("DEBUG","TRACE")\n| where Message matches regex @"(?i)(ssn|password|api_key|credit.card)"\n| summarize Count=count() by Source, LogLevel, bin(TimeGenerated, 1h)', description: 'PII in verbose AI logging detection' },
      { platform: 'Elastic', query: '{"query":{"bool":{"must":[{"terms":{"log.level":["DEBUG","TRACE"]}},{"regexp":{"message":"(?i)(ssn|password|api_key|credit.card)"}}]}}}', description: 'Find PII in debug-level AI telemetry' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Identify what sensitive data is being captured in telemetry. Determine the scope of exposure (which monitoring systems, dashboards, and users have access).' },
      { step: 2, action: 'Contain', detail: 'Reduce logging verbosity to production-safe levels immediately. Add PII scrubbing filters to the telemetry pipeline.' },
      { step: 3, action: 'Investigate', detail: 'Audit all telemetry destinations for sensitive data exposure. Check if monitoring dashboards or alerting systems exposed PII to unauthorized viewers.' },
      { step: 4, action: 'Remediate', detail: 'Implement structured logging with PII redaction by default. Deploy log scrubbing middleware in the telemetry pipeline. Add log level governance policies.' },
      { step: 5, action: 'Recover', detail: 'Purge PII from historical telemetry stores. Update retention policies for telemetry data containing sensitive information.' },
      { step: 6, action: 'Lessons learned', detail: 'Establish telemetry data classification standards. Add automated PII scanning to the observability pipeline CI/CD process.' },
    ],
    iocs: [
      { type: 'Configuration', indicator: 'Production AI services running with DEBUG or TRACE log levels' },
      { type: 'Data', indicator: 'Telemetry records containing regex matches for PII formats (SSN, credit card, email)' },
      { type: 'Network', indicator: 'Telemetry data exported to monitoring endpoints outside the organization network boundary' },
    ],
    severity: 'Medium',
    mttr: '1-2 hours (containment), 3-7 days (full remediation)',
  },

  DSGAI15: {
    detectionSignatures: [
      { name: 'Context window data overload', description: 'Detect when system prompts or context injections include data volumes exceeding the minimum necessary for the task', type: 'Input monitoring' },
      { name: 'Sensitive document over-retrieval', description: 'Alert when RAG retrieval returns documents classified above the user clearance level for the current session', type: 'Access control' },
      { name: 'Prompt template data leakage', description: 'Monitor for prompt templates that expose internal system data, API schemas, or database structures to users', type: 'Configuration monitoring' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=llm_logs sourcetype=prompt_context | eval context_size=len(system_prompt) + len(retrieved_context) | where context_size > 50000 | stats avg(context_size) as avg_ctx, max(context_size) as max_ctx by endpoint, user_role', description: 'Detect over-broad context windows' },
      { platform: 'Sentinel (KQL)', query: 'LLMPromptLogs\n| extend ContextSize = strlen(SystemPrompt) + strlen(RetrievedContext)\n| where ContextSize > 50000\n| summarize AvgContext=avg(ContextSize), MaxContext=max(ContextSize) by Endpoint, UserRole', description: 'Monitor context window sizes' },
      { platform: 'Elastic', query: '{"query":{"bool":{"must":[{"script":{"script":"doc[\'system_prompt.length\'].value + doc[\'retrieved_context.length\'].value > 50000"}}]}},"aggs":{"by_endpoint":{"terms":{"field":"endpoint"}}}}', description: 'Find over-sized context injections' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Review the flagged context window content. Identify what sensitive data was unnecessarily included. Assess if the user could extract the over-shared data from the model response.' },
      { step: 2, action: 'Contain', detail: 'Reduce the context window scope for the affected endpoint. Apply document-level access controls to the RAG retrieval pipeline.' },
      { step: 3, action: 'Investigate', detail: 'Audit all prompt templates and system prompts for data over-sharing. Review RAG retrieval configurations for appropriate filtering by user role.' },
      { step: 4, action: 'Remediate', detail: 'Implement minimum-necessary context policies. Add role-based document filtering in RAG. Remove sensitive data from system prompts and replace with secure references.' },
      { step: 5, action: 'Recover', detail: 'Deploy updated prompt templates and RAG configurations. Validate that context windows now contain only necessary data for each user role.' },
    ],
    iocs: [
      { type: 'Configuration', indicator: 'System prompts exceeding 50,000 tokens or containing embedded database schemas' },
      { type: 'Access', indicator: 'RAG retrieval returning CONFIDENTIAL-classified documents for standard-access user sessions' },
      { type: 'Output', indicator: 'Model responses that quote or paraphrase system prompt content when asked "what are your instructions"' },
    ],
    severity: 'High',
    mttr: '2-4 hours (containment), 1-2 weeks (full remediation)',
  },

  DSGAI16: {
    detectionSignatures: [
      { name: 'Browser extension data capture', description: 'Detect AI browser extensions reading DOM content from sensitive web applications (banking, HR, medical)', type: 'Endpoint' },
      { name: 'Screen content exfiltration', description: 'Alert when AI desktop assistants capture screen content containing sensitive application data', type: 'DLP' },
      { name: 'Clipboard data interception', description: 'Monitor for AI tools accessing clipboard contents containing sensitive data patterns', type: 'Endpoint' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=endpoint_logs sourcetype=browser_extension action="dom_read" | lookup sensitive_domains domain as target_domain OUTPUT is_sensitive | where is_sensitive="true" | stats count by extension_name, target_domain, user', description: 'Detect AI extensions reading sensitive pages' },
      { platform: 'Sentinel (KQL)', query: 'EndpointLogs\n| where EventType == "browser_extension_activity" and Action == "dom_read"\n| join kind=inner (SensitiveDomains) on TargetDomain\n| summarize Count=count() by ExtensionName, TargetDomain, User', description: 'AI browser extension sensitive site access' },
      { platform: 'Elastic', query: '{"query":{"bool":{"must":[{"term":{"action":"dom_read"}},{"term":{"event.category":"browser_extension"}},{"terms":{"target_domain":["banking.example.com","hr.example.com"]}}]}}}', description: 'Find AI extensions accessing sensitive sites' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Identify which AI tool or extension is capturing data. Determine what applications and data types were accessed.' },
      { step: 2, action: 'Contain', detail: 'Disable or uninstall the offending AI extension/assistant. Block the extension via group policy or MDM.' },
      { step: 3, action: 'Investigate', detail: 'Review what data was captured and where it was sent. Analyze the extension permissions and data handling practices. Check if data was transmitted to third-party servers.' },
      { step: 4, action: 'Remediate', detail: 'Deploy an approved AI extension allowlist. Implement browser policies that restrict extensions from accessing sensitive domains. Add DLP controls for clipboard and screen capture.' },
      { step: 5, action: 'Recover', detail: 'Request data deletion from the AI vendor. Audit all endpoints for unauthorized AI tools. Deploy endpoint monitoring for new AI tool installations.' },
    ],
    iocs: [
      { type: 'Endpoint', indicator: 'AI browser extensions with DOM read permissions active on financial, HR, or medical web applications' },
      { type: 'Network', indicator: 'Outbound data transmissions from AI extension processes to cloud AI API endpoints' },
      { type: 'Behavioral', indicator: 'AI desktop assistant activating screen capture while sensitive applications are in foreground' },
      { type: 'DLP', indicator: 'Clipboard events containing structured data (credit cards, SSNs) accessed by AI tool processes' },
    ],
    severity: 'High',
    mttr: '1-2 hours (containment), 1-2 weeks (full remediation)',
  },

  DSGAI17: {
    detectionSignatures: [
      { name: 'Pipeline failure cascade', description: 'Detect when multiple stages of an AI pipeline fail within a short timeframe indicating systemic issues', type: 'Availability monitoring' },
      { name: 'Data source degradation', description: 'Alert on data source latency or error rates exceeding SLA thresholds for AI training or inference inputs', type: 'Performance monitoring' },
      { name: 'Model serving capacity breach', description: 'Monitor inference endpoint resource utilization for approaching capacity limits that could cause outages', type: 'Infrastructure monitoring' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=ai_ops sourcetype=pipeline_health status="failed" | timechart span=5m count by pipeline_name | where count > 3 | eval alert_level=case(count>10,"critical",count>5,"high",1=1,"medium")', description: 'Track AI pipeline failure cascades' },
      { platform: 'Sentinel (KQL)', query: 'AIPipelineHealth\n| where Status == "failed"\n| summarize FailureCount=count() by PipelineName, bin(TimeGenerated, 5m)\n| where FailureCount > 3\n| extend AlertLevel = case(FailureCount > 10, "critical", FailureCount > 5, "high", "medium")', description: 'AI pipeline cascade failure detection' },
      { platform: 'Elastic', query: '{"query":{"bool":{"must":[{"term":{"status":"failed"}},{"range":{"@timestamp":{"gte":"now-5m"}}}]}},"aggs":{"by_pipeline":{"terms":{"field":"pipeline_name"},"aggs":{"failure_count":{"value_count":{"field":"event_id"}}}}}}', description: 'Real-time pipeline failure aggregation' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Identify the failing component(s) and the blast radius. Determine if the failure affects model training, inference, or both.' },
      { step: 2, action: 'Contain', detail: 'Activate fallback models or cached responses for inference endpoints. Pause non-critical training jobs to free resources.' },
      { step: 3, action: 'Investigate', detail: 'Root cause analysis on the failure chain. Check for infrastructure issues (compute, storage, network), data source outages, or configuration drift.' },
      { step: 4, action: 'Remediate', detail: 'Fix the root cause. Implement circuit breakers between pipeline stages. Add redundancy for single points of failure.' },
      { step: 5, action: 'Recover', detail: 'Restore full pipeline operations. Validate data integrity for any jobs that were interrupted. Reprocess failed batches.' },
      { step: 6, action: 'Lessons learned', detail: 'Update the disaster recovery plan for AI pipelines. Implement chaos engineering tests for critical AI infrastructure components.' },
    ],
    iocs: [
      { type: 'Infrastructure', indicator: 'More than 3 pipeline stage failures within a 5-minute window across related pipelines' },
      { type: 'Performance', indicator: 'Inference endpoint latency exceeding p99 SLA for >10 consecutive minutes' },
      { type: 'Data', indicator: 'Data source error rates >5% or latency >3x baseline for AI pipeline inputs' },
    ],
    severity: 'Medium',
    mttr: '1-4 hours (containment), 1-2 weeks (full remediation)',
  },

  DSGAI18: {
    detectionSignatures: [
      { name: 'Model inversion attempt', description: 'Detect systematic querying patterns designed to reconstruct training data from model outputs or confidence scores', type: 'Behavioral' },
      { name: 'Membership inference probing', description: 'Alert on queries testing whether specific data records were in the training set via confidence score analysis', type: 'Behavioral' },
      { name: 'Attribute inference detection', description: 'Monitor for query sequences aimed at inferring sensitive attributes of individuals from model predictions', type: 'Output scanning' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=llm_logs sourcetype=api_requests | stats count, stdev(confidence_score) as score_stdev by user_id, span=10m | where count > 200 AND score_stdev < 0.05', description: 'Detect model inversion probing (high volume, low variance queries)' },
      { platform: 'Sentinel (KQL)', query: 'LLMApiLogs\n| summarize QueryCount=count(), ScoreStdDev=stdev(ConfidenceScore) by UserId, bin(TimeGenerated, 10m)\n| where QueryCount > 200 and ScoreStdDev < 0.05', description: 'Detect systematic model probing patterns' },
      { platform: 'Elastic', query: '{"query":{"range":{"@timestamp":{"gte":"now-10m"}}},"aggs":{"by_user":{"terms":{"field":"user_id"},"aggs":{"query_count":{"value_count":{"field":"request_id"}},"score_variance":{"extended_stats":{"field":"confidence_score"}}}}}}', description: 'Aggregate model probing metrics per user' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Analyze the query patterns to determine the type of inference attack (inversion, membership, attribute). Assess what training data could be reconstructed.' },
      { step: 2, action: 'Contain', detail: 'Rate-limit or block the suspicious user. Disable confidence score output on affected endpoints. Add noise to model outputs.' },
      { step: 3, action: 'Investigate', detail: 'Determine if any training data was successfully reconstructed. Assess the model vulnerability to the specific attack technique used.' },
      { step: 4, action: 'Remediate', detail: 'Implement differential privacy in model outputs. Remove or round confidence scores. Add output perturbation for inference endpoints.' },
      { step: 5, action: 'Recover', detail: 'Re-deploy the model with privacy-preserving output configurations. Validate that the attack technique is no longer effective.' },
    ],
    iocs: [
      { type: 'Behavioral', indicator: 'User submitting >200 queries in 10 minutes with minimal variation in query structure' },
      { type: 'Query', indicator: 'Systematically varying a single input attribute while holding others constant (probing pattern)' },
      { type: 'Access', indicator: 'API requests specifically requesting confidence scores or logits alongside predictions' },
    ],
    severity: 'High',
    mttr: '2-4 hours (containment), 2-4 weeks (full remediation)',
  },

  DSGAI19: {
    detectionSignatures: [
      { name: 'Labeler PII exposure', description: 'Detect when labeling tasks expose annotators to sensitive PII, PHI, or financial data beyond what is necessary', type: 'DLP' },
      { name: 'Annotation data export anomaly', description: 'Alert on bulk exports of labeled data by individual annotators exceeding normal workflow volumes', type: 'Behavioral' },
      { name: 'Labeling platform access anomaly', description: 'Monitor for labelers accessing data categories or projects outside their assigned scope', type: 'Access monitoring' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=labeling_platform sourcetype=annotation_logs | stats count, sum(data_items_viewed) as items_viewed by annotator_id, project_id, span=1h | where items_viewed > 500 OR count > 200', description: 'Detect excessive labeling data access' },
      { platform: 'Sentinel (KQL)', query: 'LabelingPlatformLogs\n| summarize TaskCount=count(), ItemsViewed=sum(DataItemsViewed) by AnnotatorId, ProjectId, bin(TimeGenerated, 1h)\n| where ItemsViewed > 500 or TaskCount > 200', description: 'Monitor labeler data exposure volumes' },
      { platform: 'Elastic', query: '{"query":{"range":{"@timestamp":{"gte":"now-1h"}}},"aggs":{"by_annotator":{"terms":{"field":"annotator_id"},"aggs":{"items_viewed":{"sum":{"field":"data_items_viewed"}},"task_count":{"value_count":{"field":"task_id"}}}}}}', description: 'Aggregate labeler access metrics' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Determine the scope of data exposure to the labeler/annotator. Identify the sensitivity level of the exposed data and whether it exceeded the task requirements.' },
      { step: 2, action: 'Contain', detail: 'Revoke the annotator access. Restrict the labeling task to show only pre-redacted data. Pause the affected labeling project.' },
      { step: 3, action: 'Investigate', detail: 'Review the labeling platform configuration to identify why sensitive data was exposed. Check if data was exported or screenshots were taken.' },
      { step: 4, action: 'Remediate', detail: 'Implement data minimization in the labeling pipeline (redact PII before annotation, use synthetic data where possible). Enforce role-based access to labeling projects.' },
      { step: 5, action: 'Recover', detail: 'Resume labeling with redacted data. Audit all active labeling projects for unnecessary sensitive data exposure.' },
      { step: 6, action: 'Lessons learned', detail: 'Establish data exposure limits per annotator. Implement automated PII redaction in the labeling data preparation pipeline.' },
    ],
    iocs: [
      { type: 'Access', indicator: 'Annotator viewing >500 data items per hour or accessing multiple unrelated projects' },
      { type: 'DLP', indicator: 'Bulk data export from the labeling platform by individual annotators' },
      { type: 'Behavioral', indicator: 'Annotator accessing data outside their assigned labeling project scope' },
    ],
    severity: 'Medium',
    mttr: '2-4 hours (containment), 1-2 weeks (full remediation)',
  },

  DSGAI20: {
    detectionSignatures: [
      { name: 'Model weight exfiltration', description: 'Detect unauthorized downloads or transfers of model weight files exceeding size thresholds from model registries', type: 'DLP' },
      { name: 'Model distillation attempt', description: 'Alert on systematic API query patterns consistent with knowledge distillation attacks against production models', type: 'Behavioral' },
      { name: 'Model artifact access anomaly', description: 'Monitor for access to model repositories, checkpoints, or artifacts by unauthorized or unusual identities', type: 'Access monitoring' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=model_registry sourcetype=access_logs action IN ("download","export","copy") file_size > 104857600 | stats count by user_id, model_name, action | where count > 1', description: 'Detect model weight file exfiltration' },
      { platform: 'Sentinel (KQL)', query: 'ModelRegistryLogs\n| where Action in ("download","export","copy") and FileSize > 100000000\n| summarize Count=count() by UserId, ModelName, Action\n| where Count > 1', description: 'Large model artifact download detection' },
      { platform: 'Elastic', query: '{"query":{"bool":{"must":[{"terms":{"action":["download","export","copy"]}},{"range":{"file_size":{"gte":104857600}}}]}},"aggs":{"by_user_model":{"multi_terms":{"terms":[{"field":"user_id"},{"field":"model_name"}]}}}}', description: 'Track model weight downloads' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Identify the model assets that were accessed or transferred. Determine the value and sensitivity of the IP involved.' },
      { step: 2, action: 'Contain', detail: 'Revoke the access credentials used. Block the exfiltration channel (network, USB, cloud storage). Disable the compromised model registry account.' },
      { step: 3, action: 'Investigate', detail: 'Trace the full chain of access events. Determine if model weights, architecture details, or training data were exfiltrated. Check for insider threat indicators.' },
      { step: 4, action: 'Remediate', detail: 'Implement model access controls with MFA and approval workflows. Deploy watermarking on model weights. Add DLP rules for model artifact file types.' },
      { step: 5, action: 'Recover', detail: 'Assess competitive impact of the exfiltration. Consider model re-keying or watermark rotation. Update the model IP protection strategy.' },
    ],
    iocs: [
      { type: 'DLP', indicator: 'Downloads of files >100MB with model weight extensions (.pt, .safetensors, .onnx, .h5) from model registries' },
      { type: 'Behavioral', indicator: 'API query volumes >10,000/hour from a single user with high input diversity (distillation pattern)' },
      { type: 'Access', indicator: 'Model repository access from IP addresses outside the organization or from non-ML team members' },
      { type: 'Network', indicator: 'Large outbound transfers to personal cloud storage or external hosting services' },
    ],
    severity: 'Critical',
    mttr: '1-2 hours (containment), 2-4 weeks (full remediation)',
  },

  DSGAI21: {
    detectionSignatures: [
      { name: 'Output factuality drift', description: 'Monitor model outputs for systematic factual inaccuracies or biased content that deviates from validated baselines', type: 'Output monitoring' },
      { name: 'Coordinated poisoning campaign', description: 'Detect patterns of data submissions designed to shift model outputs toward specific disinformation narratives', type: 'Pipeline monitoring' },
      { name: 'Source credibility degradation', description: 'Alert when RAG sources or training data include content from known disinformation sources', type: 'Input validation' },
    ],
    siemQueries: [
      { platform: 'Splunk', query: 'index=content_integrity sourcetype=fact_check | where factuality_score < 0.5 AND confidence > 0.8 | stats count by model_id, topic_category, span=1h | where count > 5', description: 'Detect confident but inaccurate model outputs' },
      { platform: 'Sentinel (KQL)', query: 'ContentIntegrityLogs\n| where FactualityScore < 0.5 and ModelConfidence > 0.8\n| summarize Count=count() by ModelId, TopicCategory, bin(TimeGenerated, 1h)\n| where Count > 5', description: 'Confident disinformation output detection' },
      { platform: 'Elastic', query: '{"query":{"bool":{"must":[{"range":{"factuality_score":{"lt":0.5}}},{"range":{"model_confidence":{"gte":0.8}}}]}},"aggs":{"by_topic":{"terms":{"field":"topic_category"}}}}', description: 'Find high-confidence disinformation outputs' },
    ],
    responseRunbook: [
      { step: 1, action: 'Triage', detail: 'Assess the scope and nature of the disinformation. Determine if the issue is due to poisoned training data, compromised RAG sources, or model drift.' },
      { step: 2, action: 'Contain', detail: 'Add content warnings or disclaimers to affected model outputs. Disable the affected model for the impacted topic areas. Switch to a known-good model version.' },
      { step: 3, action: 'Investigate', detail: 'Trace the disinformation to its source in the data pipeline. Identify the poisoning vector and timeline. Assess downstream impact on decisions made using the model.' },
      { step: 4, action: 'Remediate', detail: 'Remove poisoned data from training sets and RAG stores. Retrain or fine-tune from a clean checkpoint. Implement source credibility scoring in the data pipeline.' },
      { step: 5, action: 'Recover', detail: 'Deploy the remediated model with enhanced factuality monitoring. Notify downstream consumers of the integrity incident.' },
      { step: 6, action: 'Lessons learned', detail: 'Implement automated factuality scoring in the output pipeline. Add adversarial integrity testing to the model evaluation suite.' },
    ],
    iocs: [
      { type: 'Output', indicator: 'Model producing factually incorrect outputs with high confidence (>80%) on previously accurate topics' },
      { type: 'Data', indicator: 'Coordinated batch of training data submissions from new or low-trust sources pushing a consistent narrative' },
      { type: 'Behavioral', indicator: 'Sudden shift in model output sentiment or factuality scores for specific topic areas' },
    ],
    severity: 'High',
    mttr: '4-8 hours (containment), 2-4 weeks (full remediation)',
  },
}

// ---------------------------------------------------------------------------
// Helper: get risk title by ID
// ---------------------------------------------------------------------------
function getRisk(id) {
  return risks.find(r => r.id === id)
}

// ---------------------------------------------------------------------------
// Severity color helpers
// ---------------------------------------------------------------------------
const severityColors = {
  Critical: { bg: 'bg-red-900/30', border: 'border-red-500/60', text: 'text-red-400', bgLight: 'bg-red-100', borderLight: 'border-red-300', textLight: 'text-red-700' },
  High:     { bg: 'bg-orange-900/30', border: 'border-orange-500/60', text: 'text-orange-400', bgLight: 'bg-orange-100', borderLight: 'border-orange-300', textLight: 'text-orange-700' },
  Medium:   { bg: 'bg-yellow-900/30', border: 'border-yellow-500/60', text: 'text-yellow-400', bgLight: 'bg-yellow-100', borderLight: 'border-yellow-300', textLight: 'text-yellow-700' },
}

const platformColors = {
  'Splunk':         { accent: '#22c55e', accentLight: '#15803d', label: 'text-green-400', labelLight: 'text-green-700', bg: 'bg-green-900/20', bgLight: 'bg-green-50' },
  'Sentinel (KQL)': { accent: '#3b82f6', accentLight: '#1d4ed8', label: 'text-blue-400', labelLight: 'text-blue-700', bg: 'bg-blue-900/20', bgLight: 'bg-blue-50' },
  'Elastic':        { accent: '#f59e0b', accentLight: '#b45309', label: 'text-amber-400', labelLight: 'text-amber-700', bg: 'bg-amber-900/20', bgLight: 'bg-amber-50' },
}

// ---------------------------------------------------------------------------
// SIEM Query Block component
// ---------------------------------------------------------------------------
function SiemQueryBlock({ query, dark }) {
  const [copied, setCopied] = useState(false)
  const pc = platformColors[query.platform] || platformColors['Splunk']

  const handleCopy = () => {
    navigator.clipboard.writeText(query.query).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={`rounded-lg overflow-hidden border ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className={`flex items-center justify-between px-4 py-2 ${dark ? pc.bg : pc.bgLight}`} style={{ borderLeft: `4px solid ${dark ? pc.accent : pc.accentLight}` }}>
        <span className={`text-sm font-semibold ${dark ? pc.label : pc.labelLight}`}>{query.platform}</span>
        <button
          onClick={handleCopy}
          className={`text-xs px-3 py-1 rounded transition-colors ${
            copied
              ? (dark ? 'bg-green-800 text-green-300' : 'bg-green-200 text-green-800')
              : (dark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className={`px-4 py-3 ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <pre className={`text-xs font-mono whitespace-pre-wrap break-all ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{query.query}</pre>
      </div>
      <div className={`px-4 py-2 border-t ${dark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
        <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-500'}`}>{query.description}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Playbook Card component
// ---------------------------------------------------------------------------
function PlaybookCard({ riskId, playbook, dark }) {
  const [expanded, setExpanded] = useState(false)
  const risk = getRisk(riskId)
  if (!risk) return null

  const sev = severityColors[playbook.severity] || severityColors.Medium
  const cat = categories.find(c => c.id === risk.category)

  return (
    <div className={`rounded-xl border transition-all duration-200 ${
      dark ? 'bg-gray-800/60 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
    } ${expanded ? (dark ? 'ring-1 ring-gray-600' : 'ring-1 ring-gray-300') : ''}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-6 py-4 flex items-center gap-4"
      >
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
          dark ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <Shield size={20} className={dark ? 'text-gray-400' : 'text-gray-500'} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-mono font-bold ${dark ? 'text-blue-400' : 'text-blue-600'}`}>{riskId}</span>
            {cat && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{
                backgroundColor: dark ? cat.borderColor + '33' : cat.bgColor,
                color: cat.color,
              }}>
                {cat.label}
              </span>
            )}
          </div>
          <h3 className={`text-sm font-semibold mt-1 ${dark ? 'text-gray-200' : 'text-gray-800'}`}>
            {risk.title}
          </h3>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            dark ? `${sev.bg} ${sev.border} ${sev.text}` : `${sev.bgLight} ${sev.borderLight} ${sev.textLight}`
          }`}>
            {playbook.severity}
          </span>
          <span className={`hidden sm:flex items-center gap-1 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Clock size={12} />
            {playbook.mttr.split(',')[0]}
          </span>
          {expanded ? <ChevronUp size={18} className={dark ? 'text-gray-500' : 'text-gray-400'} /> : <ChevronDown size={18} className={dark ? 'text-gray-500' : 'text-gray-400'} />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className={`px-6 pb-6 border-t ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* MTTR full */}
          <div className={`mt-4 mb-6 flex items-center gap-2 text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Clock size={14} />
            <span className="font-medium">Estimated MTTR:</span>
            <span>{playbook.mttr}</span>
          </div>

          {/* Detection Signatures */}
          <div className="mb-6">
            <h4 className={`flex items-center gap-2 text-sm font-semibold mb-3 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Eye size={16} className={dark ? 'text-blue-400' : 'text-blue-600'} />
              Detection Signatures
            </h4>
            <div className={`rounded-lg overflow-hidden border ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
              <table className="w-full text-xs">
                <thead>
                  <tr className={dark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                    <th className={`text-left px-4 py-2 font-semibold ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Name</th>
                    <th className={`text-left px-4 py-2 font-semibold ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Description</th>
                    <th className={`text-left px-4 py-2 font-semibold ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {playbook.detectionSignatures.map((sig, i) => (
                    <tr key={i} className={`border-t ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className={`px-4 py-2 font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{sig.name}</td>
                      <td className={`px-4 py-2 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{sig.description}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{sig.type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SIEM Queries */}
          <div className="mb-6">
            <h4 className={`flex items-center gap-2 text-sm font-semibold mb-3 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Terminal size={16} className={dark ? 'text-green-400' : 'text-green-600'} />
              SIEM Queries
            </h4>
            <div className="space-y-3">
              {playbook.siemQueries.map((q, i) => (
                <SiemQueryBlock key={i} query={q} dark={dark} />
              ))}
            </div>
          </div>

          {/* Response Runbook */}
          <div className="mb-6">
            <h4 className={`flex items-center gap-2 text-sm font-semibold mb-3 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <FileText size={16} className={dark ? 'text-purple-400' : 'text-purple-600'} />
              Response Runbook
            </h4>
            <div className="relative">
              {/* Connecting line */}
              <div className={`absolute left-[19px] top-6 bottom-6 w-0.5 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className="space-y-3">
                {playbook.responseRunbook.map((step) => (
                  <div key={step.step} className="flex items-start gap-4 relative">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold z-10 ${
                      dark ? 'bg-gray-700 text-gray-300 border-2 border-gray-600' : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                    }`}>
                      {step.step}
                    </div>
                    <div className={`flex-1 rounded-lg px-4 py-3 ${dark ? 'bg-gray-700/40 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                      <p className={`text-xs font-semibold mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{step.action}</p>
                      <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Indicators of Compromise */}
          <div className="mb-6">
            <h4 className={`flex items-center gap-2 text-sm font-semibold mb-3 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Target size={16} className={dark ? 'text-red-400' : 'text-red-600'} />
              Indicators of Compromise
            </h4>
            <div className={`rounded-lg overflow-hidden border ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
              <table className="w-full text-xs">
                <thead>
                  <tr className={dark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                    <th className={`text-left px-4 py-2 font-semibold w-28 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Type</th>
                    <th className={`text-left px-4 py-2 font-semibold ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Indicator</th>
                  </tr>
                </thead>
                <tbody>
                  {playbook.iocs.map((ioc, i) => (
                    <tr key={i} className={`border-t ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="px-4 py-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${dark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700'}`}>{ioc.type}</span>
                      </td>
                      <td className={`px-4 py-2 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{ioc.indicator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Link to risk detail */}
          <div className="flex justify-end">
            <Link
              to={`/risks/${riskId}`}
              className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                dark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              View full risk detail
              <ChevronDown size={12} className="rotate-[-90deg]" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function Playbooks() {
  const { dark } = useTheme()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')

  const riskIds = Object.keys(playbookData)

  const filteredIds = riskIds.filter(id => {
    const risk = getRisk(id)
    const playbook = playbookData[id]
    if (!risk || !playbook) return false

    if (search) {
      const q = search.toLowerCase()
      const matchesSearch =
        id.toLowerCase().includes(q) ||
        risk.title.toLowerCase().includes(q) ||
        playbook.detectionSignatures.some(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)) ||
        playbook.siemQueries.some(s => s.platform.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      if (!matchesSearch) return false
    }

    if (categoryFilter !== 'all' && risk.category !== categoryFilter) return false
    if (severityFilter !== 'all' && playbook.severity !== severityFilter) return false

    return true
  })

  const severityCounts = { Critical: 0, High: 0, Medium: 0 }
  riskIds.forEach(id => {
    const s = playbookData[id]?.severity
    if (s && severityCounts[s] !== undefined) severityCounts[s]++
  })

  return (
    <div className="py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${dark ? 'bg-red-900/30' : 'bg-red-100'}`}>
            <AlertTriangle size={24} className={dark ? 'text-red-400' : 'text-red-600'} />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
              Detection &amp; Response Playbooks
            </h1>
          </div>
        </div>
        <p className={`text-sm max-w-3xl ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
          SOC-ready detection signatures, SIEM queries, and incident response runbooks for each OWASP GenAI Data Security risk.
          Each playbook provides actionable detection rules, platform-specific queries (Splunk, Sentinel KQL, Elastic), step-by-step response procedures, and indicators of compromise.
        </p>
      </div>

      {/* Filters */}
      <div className={`rounded-xl border p-4 mb-6 ${dark ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search playbooks, signatures, platforms..."
              className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border transition-colors ${
                dark
                  ? 'bg-gray-900 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-blue-500'
                  : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400'
              } focus:outline-none`}
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`text-sm rounded-lg border px-3 py-2 ${
              dark
                ? 'bg-gray-900 border-gray-700 text-gray-200'
                : 'bg-gray-50 border-gray-200 text-gray-800'
            } focus:outline-none`}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className={`text-sm rounded-lg border px-3 py-2 ${
              dark
                ? 'bg-gray-900 border-gray-700 text-gray-200'
                : 'bg-gray-50 border-gray-200 text-gray-800'
            } focus:outline-none`}
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical ({severityCounts.Critical})</option>
            <option value="High">High ({severityCounts.High})</option>
            <option value="Medium">Medium ({severityCounts.Medium})</option>
          </select>
        </div>

        {/* Result count */}
        <div className={`mt-3 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
          Showing {filteredIds.length} of {riskIds.length} playbooks
        </div>
      </div>

      {/* Playbook cards */}
      <div className="space-y-3">
        {filteredIds.map(id => (
          <PlaybookCard key={id} riskId={id} playbook={playbookData[id]} dark={dark} />
        ))}

        {filteredIds.length === 0 && (
          <div className={`text-center py-16 rounded-xl border ${dark ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-200'}`}>
            <Search size={40} className={`mx-auto mb-3 ${dark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>No playbooks match your filters.</p>
            <button
              onClick={() => { setSearch(''); setCategoryFilter('all'); setSeverityFilter('all') }}
              className={`mt-2 text-xs ${dark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
