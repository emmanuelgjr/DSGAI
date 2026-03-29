import { useState } from 'react'
import {
  FileText, ChevronRight, ChevronLeft, Download, CheckCircle,
  Building, Shield, Users, Scale, AlertTriangle,
} from 'lucide-react'
import { useTheme } from '../components/ThemeContext'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const industries = [
  'Financial Services', 'Healthcare', 'Technology', 'Government',
  'Retail', 'Manufacturing', 'Other',
]

const regulations = [
  { id: 'gdpr', label: 'GDPR' },
  { id: 'hipaa', label: 'HIPAA' },
  { id: 'ccpa', label: 'CCPA' },
  { id: 'euai', label: 'EU AI Act' },
  { id: 'soc2', label: 'SOC 2' },
  { id: 'pcidss', label: 'PCI DSS' },
  { id: 'nist', label: 'NIST' },
]

const maturityLevels = [
  { id: 'exploration', label: 'Early Exploration', desc: 'Piloting AI with limited use cases' },
  { id: 'development', label: 'Active Development', desc: 'Building custom AI solutions' },
  { id: 'production', label: 'Production Deployment', desc: 'AI in production workloads' },
  { id: 'scaled', label: 'Scaled Operations', desc: 'Enterprise-wide AI adoption' },
]

const policyTypes = [
  {
    id: 'aup',
    title: 'GenAI Acceptable Use Policy',
    description: 'Rules and guidelines for employee use of generative AI tools, including approved tools, data handling, and prohibited activities.',
    pages: '3-4',
    audience: 'All employees, contractors, third parties',
    icon: Users,
  },
  {
    id: 'classification',
    title: 'AI Data Classification Policy',
    description: 'Framework for classifying data in AI contexts, including training data, inference inputs/outputs, and model artifacts.',
    pages: '2-3',
    audience: 'Data owners, AI/ML teams, security',
    icon: Scale,
  },
  {
    id: 'governance',
    title: 'Model Governance Policy',
    description: 'Lifecycle management requirements for AI models from development through deployment, monitoring, and retirement.',
    pages: '3-4',
    audience: 'AI/ML teams, engineering leadership',
    icon: Shield,
  },
  {
    id: 'vendor',
    title: 'AI Vendor Assessment Questionnaire',
    description: 'Structured evaluation questionnaire for assessing the data security practices of AI technology vendors.',
    pages: '2-3',
    audience: 'Procurement, security, legal teams',
    icon: Building,
  },
]

// ---------------------------------------------------------------------------
// Step indicator component
// ---------------------------------------------------------------------------
function StepIndicator({ currentStep, dark }) {
  const steps = [
    { num: 1, label: 'Organization' },
    { num: 2, label: 'Select Policies' },
    { num: 3, label: 'Customize' },
    { num: 4, label: 'Generate' },
  ]

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              currentStep === step.num
                ? 'bg-blue-600 text-white'
                : currentStep > step.num
                ? (dark ? 'bg-green-800 text-green-300' : 'bg-green-100 text-green-700')
                : (dark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400')
            }`}>
              {currentStep > step.num ? <CheckCircle size={18} /> : step.num}
            </div>
            <span className={`text-xs mt-1 hidden sm:block ${
              currentStep === step.num
                ? (dark ? 'text-blue-400' : 'text-blue-600')
                : currentStep > step.num
                ? (dark ? 'text-green-400' : 'text-green-600')
                : (dark ? 'text-gray-500' : 'text-gray-400')
            }`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-12 sm:w-20 h-0.5 mx-2 ${
              currentStep > step.num
                ? (dark ? 'bg-green-700' : 'bg-green-300')
                : (dark ? 'bg-gray-700' : 'bg-gray-200')
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Policy generation functions
// ---------------------------------------------------------------------------

function formatDate() {
  const d = new Date()
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function generateAUP(org, regs, maturity, options) {
  const date = formatDate()
  const regList = regs.length > 0 ? regs.map(r => regulations.find(x => x.id === r)?.label).filter(Boolean).join(', ') : 'None specified'
  const consumerAI = options.allowConsumerAI ? 'ALLOWED WITH RESTRICTIONS' : 'PROHIBITED'
  const codeGen = options.allowCodeGen ? 'ALLOWED WITH RESTRICTIONS' : 'PROHIBITED'
  const managerApproval = options.requireManagerApproval ? 'Required' : 'Not required'

  return `${org.name.toUpperCase()}
GENERATIVE AI ACCEPTABLE USE POLICY
Version 1.0 | ${date} | Based on OWASP GenAI Data Security Framework (DSGAI)

================================================================================

1. PURPOSE

This policy establishes acceptable use guidelines for Generative AI (GenAI) systems and tools within ${org.name}. It defines the boundaries for responsible AI usage, protects organizational data assets, and ensures compliance with applicable regulations.

This policy addresses risks identified in DSGAI01 (Sensitive Data Leakage), DSGAI03 (Shadow AI & Unsanctioned Data Flows), and DSGAI15 (Over-Broad Context Windows & Prompt Over-Sharing).

2. SCOPE

This policy applies to all employees, contractors, consultants, temporary workers, and third parties who access or use Generative AI tools in connection with ${org.name} business operations.

This includes but is not limited to:
  - Cloud-based AI chat interfaces (ChatGPT, Gemini, Claude, etc.)
  - AI-powered code generation tools (GitHub Copilot, Cursor, etc.)
  - AI features embedded in productivity software
  - Custom-built or internally deployed AI models
  - AI-powered browser extensions and desktop assistants

3. DEFINITIONS

3.1  Generative AI (GenAI): Systems that generate text, code, images, audio, video, or other content using machine learning models, including large language models (LLMs), diffusion models, and multimodal systems.

3.2  Shadow AI: The use of unapproved AI tools, services, or APIs outside of organizational governance and oversight. This is a significant risk vector per DSGAI03.

3.3  Approved AI Tools: AI systems that have been vetted and authorized by ${org.name} IT Security and are listed in the Approved AI Tools Registry.

3.4  Sensitive Data: Information classified as Confidential, Restricted, or above per ${org.name} data classification policy, including but not limited to PII, PHI, financial data, trade secrets, and source code.

3.5  AI Output: Any content generated by an AI system, including text, code, images, summaries, and recommendations.

4. APPROVED AI TOOLS

4.1  Only AI tools listed in the ${org.name} Approved AI Tools Registry may be used for business purposes. The registry is maintained by IT Security and reviewed quarterly.

4.2  Consumer AI tools (ChatGPT, Gemini, Copilot, etc.) are: ${consumerAI}
${options.allowConsumerAI ? `     - Consumer AI tools may only be used for non-sensitive tasks
     - No Confidential, Restricted, or Internal data may be submitted
     - Users must not create accounts using corporate email addresses without IT approval` : `     - Use of consumer AI tools for any business purpose is strictly prohibited
     - This includes personal devices when handling company data`}

4.3  AI-powered code generation tools are: ${codeGen}
${options.allowCodeGen ? `     - Generated code must be reviewed before committing to any repository
     - Proprietary algorithms and trade secrets must not be used as context
     - Code review must include AI-output verification per secure coding standards` : `     - AI code generation tools are not permitted in the development workflow
     - This includes IDE plugins, CLI tools, and web-based code assistants`}

4.4  Manager approval for new AI tools: ${managerApproval}
${options.requireManagerApproval ? `     - All requests for new AI tools must be submitted via the IT Service Desk
     - Manager and IT Security approval is required before use
     - Approved tools will be added to the registry within 5 business days` : ''}

5. DATA HANDLING REQUIREMENTS

5.1  The following data MUST NOT be submitted to any AI system (including approved tools unless explicitly authorized):
     - Personally Identifiable Information (PII): Names, SSNs, addresses, phone numbers
     - Protected Health Information (PHI): Medical records, diagnosis, treatment data
     - Financial data: Credit card numbers, bank account details, financial statements
     - Authentication credentials: Passwords, API keys, tokens, certificates
     - Trade secrets and proprietary algorithms
     - Customer data not explicitly approved for AI processing
     - Legal privileged communications

5.2  Data that MAY be submitted to approved AI tools:
     - Publicly available information
     - De-identified or synthetic data
     - Data explicitly classified as "AI-Approved" per the data classification policy

5.3  All AI interactions involving business data must be conducted through approved, enterprise-licensed tools with appropriate data processing agreements in place.

6. PROHIBITED ACTIVITIES

6.1  Users MUST NOT:
     - Use AI to generate content that impersonates real individuals
     - Submit proprietary source code to unauthorized AI services (DSGAI20)
     - Attempt to bypass AI safety filters or guardrails (jailbreaking)
     - Use AI outputs without verification in safety-critical decisions
     - Share AI-generated content externally without disclosure when required
     - Use AI to process data beyond its approved classification level
     - Disable or circumvent AI monitoring and logging controls (DSGAI14)

7. COMPLIANCE REQUIREMENTS

Applicable regulatory frameworks: ${regList}
${regs.includes('gdpr') ? `
7.1  GDPR: All AI processing of EU personal data must have a documented legal basis. Data subjects must be informed of AI processing. DPIA required for high-risk AI uses. Right to explanation for automated decisions.` : ''}
${regs.includes('hipaa') ? `
7.2  HIPAA: PHI must not be processed by AI systems without a Business Associate Agreement (BAA). AI-generated content containing PHI must be treated as a medical record.` : ''}
${regs.includes('ccpa') ? `
7.3  CCPA: California residents must be notified of AI data collection. Opt-out mechanisms must be available for AI processing of personal information.` : ''}
${regs.includes('euai') ? `
7.4  EU AI Act: AI systems must be classified by risk level. High-risk AI systems require conformity assessments, transparency obligations, and human oversight.` : ''}
${regs.includes('soc2') ? `
7.5  SOC 2: AI systems must comply with Trust Services Criteria. Logging, monitoring, and access controls must be documented and auditable.` : ''}
${regs.includes('pcidss') ? `
7.6  PCI DSS: Cardholder data must never be submitted to AI systems. AI systems processing payment-adjacent data must be within the PCI compliance scope.` : ''}
${regs.includes('nist') ? `
7.7  NIST: AI risk management must align with NIST AI RMF. Security controls must follow NIST CSF and SP 800-53 as applicable.` : ''}

8. MONITORING AND ENFORCEMENT

8.1  All AI tool usage is subject to monitoring and logging per ${org.name} IT Security policies.

8.2  DLP controls are deployed to detect sensitive data submission to AI services (DSGAI01, DSGAI03).

8.3  Network monitoring is in place to detect connections to unapproved AI services.

8.4  Violations of this policy may result in disciplinary action up to and including termination of employment or contract.

9. INCIDENT REPORTING

9.1  Any suspected data exposure through AI tools must be reported immediately to the IT Security team.

9.2  Report incidents via: [Security hotline / email / ticketing system]

9.3  Do not attempt to verify or reproduce suspected data leaks.

10. EXCEPTIONS

10.1  Exceptions to this policy require written approval from the CISO and relevant business unit leader.

10.2  Approved exceptions are documented, time-limited, and subject to enhanced monitoring.

11. REVIEW AND UPDATES

11.1  This policy is reviewed quarterly and updated as the AI landscape evolves.

11.2  Policy owner: Chief Information Security Officer (CISO)

11.3  Next review date: [Quarterly from effective date]

================================================================================
${org.name} | ${org.industry} | AI Maturity: ${maturityLevels.find(m => m.id === org.maturity)?.label || 'Not specified'}
Document generated based on OWASP GenAI Data Security Framework (DSGAI)
`
}

function generateClassificationPolicy(org, regs, maturity, options) {
  const date = formatDate()
  const levels = options.classificationLevels || 4
  const levelNames = levels === 3
    ? ['Public', 'Internal', 'Restricted']
    : levels === 5
    ? ['Public', 'Internal', 'Confidential', 'Restricted', 'Top Secret']
    : ['Public', 'Internal', 'Confidential', 'Restricted']

  return `${org.name.toUpperCase()}
AI DATA CLASSIFICATION POLICY
Version 1.0 | ${date} | Based on OWASP GenAI Data Security Framework (DSGAI)

================================================================================

1. PURPOSE

This policy establishes the data classification framework for all data used in, generated by, or processed through Artificial Intelligence systems at ${org.name}. It extends the existing data classification policy to address the unique challenges of AI data lifecycle management.

This policy addresses DSGAI07 (Data Governance, Lifecycle & Classification for AI Systems) and DSGAI10 (Synthetic Data, Anonymization & Transformation Pitfalls).

2. SCOPE

This policy covers:
  - Training and fine-tuning datasets
  - Retrieval-Augmented Generation (RAG) document stores and vector databases
  - Model inputs (prompts, context, system instructions)
  - Model outputs (generated text, code, images, decisions)
  - Model artifacts (weights, checkpoints, configurations)
  - Synthetic and anonymized datasets derived from classified data
  - Telemetry and monitoring data from AI systems (DSGAI14)
  - Embeddings and vector representations

3. CLASSIFICATION LEVELS

${org.name} uses ${levels} data classification levels for AI data:

${levelNames.map((name, i) => {
    const descriptions = {
      'Public': 'Data that is publicly available or approved for public release. May be freely used in AI systems without restriction.',
      'Internal': 'Data intended for internal use only. May be used in approved AI systems with standard controls. Must not be submitted to consumer AI tools.',
      'Confidential': 'Sensitive business data requiring protection. May only be used in AI systems with enhanced security controls, DLP, and audit logging.',
      'Restricted': 'Highly sensitive data (PII, PHI, financial). AI processing requires explicit authorization, encryption, and enhanced monitoring. Subject to regulatory requirements.',
      'Top Secret': 'Most sensitive organizational data (trade secrets, M&A). AI processing prohibited except with CISO and executive approval with dedicated infrastructure.',
    }
    return `3.${i + 1}  Level ${i + 1} - ${name}
     ${descriptions[name] || 'Classification level requiring appropriate controls.'}`
  }).join('\n\n')}

4. AI-SPECIFIC DATA CATEGORIES
${options.includeAICategories ? `
4.1  Training Data: Data used to train or fine-tune models. Classification inherits the highest classification of any record in the dataset.

4.2  Inference Context: Data provided at inference time (RAG context, system prompts). Must be classified independently and filtered based on the requesting user's clearance level (DSGAI15).

4.3  Model Artifacts: Model weights, configurations, and checkpoints are classified based on the sensitivity of training data and the strategic value of the model IP (DSGAI20).

4.4  AI Outputs: Generated content inherits the classification of input data unless verified to contain no sensitive information. Outputs must not be assumed to be declassified.

4.5  Vector Embeddings: Embeddings derived from classified data inherit the source classification. Vector stores must enforce access controls consistent with the source data classification (DSGAI13).

4.6  Synthetic Data: Synthetic datasets derived from classified data start at the same classification level. Reclassification to a lower level requires formal re-identification risk assessment (DSGAI10).

4.7  Telemetry Data: AI system logs and monitoring data may contain input/output samples and must be classified accordingly (DSGAI14).` : `
4.1  Standard data classification categories apply to AI data. No AI-specific categories are defined at this time.`}

5. CLASSIFICATION REQUIREMENTS

5.1  All data entering an AI pipeline MUST be classified before processing. Unclassified data MUST be treated as the highest classification level until properly classified.

5.2  Data owners are responsible for classifying their data before it is used in AI systems.

5.3  Automated classification tools should be used to supplement manual classification, especially for large-scale training datasets.

5.4  Classification labels must be preserved throughout the AI data lifecycle, including during transformation, embedding, and storage.

5.5  When data from multiple classification levels is combined (e.g., in a training dataset), the resulting dataset inherits the highest classification level present.

6. HANDLING REQUIREMENTS BY LEVEL

${levelNames.map((name, i) => `6.${i + 1}  ${name}:
     - AI tool approval: ${i === 0 ? 'Any approved tool' : i === 1 ? 'Enterprise-licensed tools only' : 'Designated high-security AI systems only'}
     - Encryption: ${i < 2 ? 'Standard (TLS in transit)' : 'AES-256 at rest and in transit'}
     - Access control: ${i === 0 ? 'Standard authentication' : i === 1 ? 'Role-based access' : 'Role-based + need-to-know + MFA'}
     - Audit logging: ${i < 2 ? 'Standard' : 'Enhanced with full input/output capture'}
     - Retention: ${i < 2 ? 'Per standard retention schedule' : 'Per regulatory requirements with documented disposal'}
     - DLP monitoring: ${i === 0 ? 'Not required' : 'Required'}`).join('\n\n')}

7. DATA LIFECYCLE FOR AI

7.1  Collection: Data provenance must be documented. Consent and legal basis must be verified before AI processing.

7.2  Processing: Classification-appropriate controls must be applied throughout the processing pipeline.

7.3  Storage: AI data (training sets, vector stores, model artifacts) must be stored with controls matching their classification.

7.4  Retention: AI data retention schedules must be defined and enforced. Models trained on time-limited data must be retired or retrained when the data retention period expires.

7.5  Disposal: Secure disposal of AI data includes purging from vector stores, model unlearning or retraining, and cryptographic erasure of stored datasets.

8. EXCEPTIONS AND RECLASSIFICATION

8.1  Data reclassification requests must be submitted to the Data Governance Board.

8.2  Reclassification of AI-derived data (synthetic, anonymized) requires a formal privacy impact assessment.

8.3  Emergency reclassification for incident response is authorized by the CISO.

9. REVIEW

9.1  This policy is reviewed semi-annually.
9.2  Policy owner: Chief Data Officer / Data Governance Board

================================================================================
${org.name} | ${org.industry}
Document generated based on OWASP GenAI Data Security Framework (DSGAI)
`
}

function generateGovernancePolicy(org, regs, maturity, options) {
  const date = formatDate()

  return `${org.name.toUpperCase()}
AI MODEL GOVERNANCE POLICY
Version 1.0 | ${date} | Based on OWASP GenAI Data Security Framework (DSGAI)

================================================================================

1. PURPOSE

This policy establishes the governance framework for the lifecycle management of AI and machine learning models at ${org.name}. It ensures that all models are developed, deployed, monitored, and retired in a secure, compliant, and transparent manner.

This policy addresses DSGAI04 (Data, Model & Artifact Poisoning), DSGAI05 (Data Integrity & Validation Failures), DSGAI07 (Data Governance), and DSGAI20 (Model Exfiltration & IP Replication).

2. SCOPE

This policy applies to all AI and ML models developed, deployed, or consumed by ${org.name}, including:
  - Internally developed models
  - Fine-tuned open-source models
  - Third-party AI models accessed via API
  - Embedded AI features in vendor products
  - Models used in research and experimentation

3. MODEL REGISTRY
${options.requireModelRegistry ? `
3.1  All AI models MUST be registered in the ${org.name} Model Registry before deployment to any non-development environment.

3.2  The Model Registry must capture:
     - Model name, version, and unique identifier
     - Model type and architecture
     - Training data sources and classification levels
     - Model owner and responsible team
     - Intended use cases and approved deployment contexts
     - Risk classification (Low / Medium / High / Critical)
     - Deployment status and environment details
     - Performance benchmarks and evaluation metrics
     - Data processing agreements and regulatory compliance status

3.3  The Model Registry is maintained by the AI Governance team and reviewed monthly.

3.4  Models not in the registry are considered unauthorized and must not be used in production.` : `
3.1  A model registry is recommended but not required at this time. Teams are encouraged to maintain internal records of deployed models.`}

4. MODEL DEVELOPMENT

4.1  Training Data Governance:
     - All training data must be classified per the AI Data Classification Policy
     - Data provenance must be documented (source, collection date, consent status)
     - Data integrity validation is required before training (DSGAI05)
     - Poisoning detection controls must be in place for training pipelines (DSGAI04)

4.2  Development Standards:
     - Secure coding practices must be followed for ML pipelines
     - Model development must use approved frameworks and libraries
     - Experiment tracking must be maintained for reproducibility
     - Security testing must be included in the model development lifecycle

4.3  Pre-Deployment Review:
     - All models must pass security review before production deployment
     - Bias and fairness assessments are required for models making decisions about individuals
     - Performance benchmarks must meet defined thresholds
     - Adversarial robustness testing is required for externally-facing models (DSGAI18)

5. MODEL DEPLOYMENT

5.1  Deployment must follow the ${org.name} change management process.

5.2  Models must be deployed to approved infrastructure with appropriate access controls.

5.3  Input validation and output filtering must be implemented for all inference endpoints (DSGAI12, DSGAI15).

5.4  Rate limiting and abuse detection must be configured for externally-accessible model endpoints.

5.5  Rollback procedures must be documented and tested before deployment.

6. HUMAN-IN-THE-LOOP REQUIREMENTS
${options.requireHumanInLoop ? `
6.1  High-risk AI decisions (as classified by the AI Governance team) MUST have human review before execution. High-risk categories include:
     - Decisions affecting individual rights or access
     - Financial decisions above defined thresholds
     - Content moderation for public-facing systems
     - Medical or health-related recommendations
     - Legal or compliance determinations

6.2  Human reviewers must be trained on the specific model capabilities and limitations.

6.3  Override mechanisms must be available for all automated AI decisions.

6.4  Human review decisions must be logged for audit purposes.` : `
6.1  Human-in-the-loop review is recommended for high-risk decisions but not mandated at this time.`}

7. MODEL MONITORING

7.1  All production models must have continuous monitoring for:
     - Performance degradation (accuracy, latency, error rates)
     - Data drift (input distribution changes)
     - Output quality and safety metrics
     - Security anomalies (adversarial inputs, extraction attempts)

7.2  Monitoring alerts must be routed to the model owner and the SOC.

7.3  Monthly model performance reports must be submitted to the AI Governance team.

8. MODEL RETIREMENT
${options.retirementCriteria ? `
8.1  Models MUST be retired when any of the following criteria are met:
     - Performance falls below the minimum acceptable threshold for 30 consecutive days
     - Training data retention period expires and retraining is not feasible
     - A critical security vulnerability is identified and cannot be patched
     - The model is superseded by an improved version that has been validated
     - Regulatory changes make the model non-compliant
     - Business use case is discontinued

8.2  Model retirement process:
     a. Notify all downstream consumers 30 days before retirement
     b. Redirect traffic to replacement model or fallback
     c. Archive model artifacts per retention policy
     d. Purge model from all serving infrastructure
     e. Update the Model Registry with retirement status and reason
     f. Conduct post-retirement review

8.3  Retired model artifacts must be retained for the period required by applicable regulations.` : `
8.1  Models should be reviewed periodically for continued relevance and performance. Formal retirement criteria are not yet defined.`}

9. INCIDENT RESPONSE

9.1  Model-related security incidents must be reported to the SOC immediately.

9.2  The AI Governance team must be notified of all model incidents within 4 hours.

9.3  Model-specific incident response procedures are documented in the Detection & Response Playbooks.

10. REVIEW

10.1  This policy is reviewed quarterly.
10.2  Policy owner: VP of Engineering / AI Governance Board

================================================================================
${org.name} | ${org.industry} | AI Maturity: ${maturityLevels.find(m => m.id === org.maturity)?.label || 'Not specified'}
Document generated based on OWASP GenAI Data Security Framework (DSGAI)
`
}

function generateVendorQuestionnaire(org, regs, maturity, options) {
  const date = formatDate()

  return `${org.name.toUpperCase()}
AI VENDOR SECURITY ASSESSMENT QUESTIONNAIRE
Version 1.0 | ${date} | Based on OWASP GenAI Data Security Framework (DSGAI)

================================================================================

INSTRUCTIONS

This questionnaire must be completed by all vendors providing AI/ML products, services, or APIs to ${org.name}. Responses will be evaluated by the Security and Procurement teams as part of the vendor approval process.

Vendor Name: _______________________________________________
Product/Service: _______________________________________________
Assessment Date: _______________________________________________
Assessor: _______________________________________________

================================================================================

SECTION 1: COMPANY AND MODEL OVERVIEW

1.1  Describe your AI/ML product or service, including the types of models used.
     Response: _______________________________________________

1.2  Where are your AI models developed, trained, and hosted? List all geographic locations.
     Response: _______________________________________________

1.3  Do you use third-party models or datasets in your product? If yes, list all sources.
     Response: _______________________________________________

1.4  What is your model update/retraining frequency?
     Response: _______________________________________________

SECTION 2: DATA HANDLING (Ref: DSGAI01, DSGAI07)

2.1  How is customer data used in your AI system? (Select all that apply)
     [ ] Model training / fine-tuning
     [ ] Inference / real-time processing only
     [ ] RAG / retrieval augmentation
     [ ] Analytics and reporting
     [ ] Not used - customer data is not processed by AI

2.2  Do you train your models on customer data? If yes:
     a. Is customer data segregated per tenant? Yes / No
     b. Can customers opt out of training data usage? Yes / No
     c. What is your data retention period for training data? ___________

2.3  How do you prevent sensitive data leakage in model outputs? (DSGAI01)
     Response: _______________________________________________

2.4  What data classification framework do you use? (DSGAI07)
     Response: _______________________________________________

2.5  How do you handle data subject requests (DSR) and right to be forgotten (RTBF) for data used in AI models?
     Response: _______________________________________________
${options.includeDataResidency ? `
SECTION 3: DATA RESIDENCY AND SOVEREIGNTY

3.1  In which countries/regions is customer data stored?
     Response: _______________________________________________

3.2  In which countries/regions is customer data processed for AI inference?
     Response: _______________________________________________

3.3  Can data residency be restricted to specific regions? Yes / No
     If yes, which regions are available? _______________________________________________

3.4  Do you use sub-processors for AI workloads? If yes, list all sub-processors and their locations.
     Response: _______________________________________________

3.5  How do you handle cross-border data transfers? What legal mechanisms are in place (SCCs, adequacy decisions, etc.)?
     Response: _______________________________________________
` : ''}
SECTION ${options.includeDataResidency ? '4' : '3'}: SECURITY CONTROLS (Ref: DSGAI02, DSGAI13, DSGAI14)

${options.includeDataResidency ? '4' : '3'}.1  Describe your authentication and authorization model for AI API access. (DSGAI02)
     Response: _______________________________________________

${options.includeDataResidency ? '4' : '3'}.2  How are API keys and credentials managed for AI service access?
     Response: _______________________________________________

${options.includeDataResidency ? '4' : '3'}.3  What encryption is used for data in transit and at rest?
     Response: _______________________________________________

${options.includeDataResidency ? '4' : '3'}.4  How do you secure vector stores and embedding databases? (DSGAI13)
     Response: _______________________________________________

${options.includeDataResidency ? '4' : '3'}.5  What telemetry and logging data do you collect from AI interactions? (DSGAI14)
     Response: _______________________________________________

${options.includeDataResidency ? '4' : '3'}.6  What DLP controls are implemented on AI inputs and outputs?
     Response: _______________________________________________

${options.includeDataResidency ? '4' : '3'}.7  Do you have SOC 2 Type II certification? Yes / No
     If yes, provide the most recent report date: ___________
${options.includeModelAccess ? `
SECTION ${options.includeDataResidency ? '5' : '4'}: MODEL ACCESS AND TRANSPARENCY (Ref: DSGAI18, DSGAI20)

${options.includeDataResidency ? '5' : '4'}.1  Do you provide access to model weights or architectures? Yes / No
     If yes, under what licensing terms? _______________________________________________

${options.includeDataResidency ? '5' : '4'}.2  What protections are in place against model extraction or distillation attacks? (DSGAI20)
     Response: _______________________________________________

${options.includeDataResidency ? '5' : '4'}.3  Do you provide model cards or documentation for your AI models?
     Response: _______________________________________________

${options.includeDataResidency ? '5' : '4'}.4  How do you protect against adversarial attacks and prompt injection? (DSGAI18)
     Response: _______________________________________________

${options.includeDataResidency ? '5' : '4'}.5  What confidence scores, explainability, or attribution information do you provide with model outputs?
     Response: _______________________________________________
` : ''}
SECTION ${(options.includeDataResidency ? 4 : 3) + (options.includeModelAccess ? 2 : 1)}: INCIDENT RESPONSE AND COMPLIANCE

${(options.includeDataResidency ? 4 : 3) + (options.includeModelAccess ? 2 : 1)}.1  Describe your AI-specific incident response process.
     Response: _______________________________________________

${(options.includeDataResidency ? 4 : 3) + (options.includeModelAccess ? 2 : 1)}.2  What is your notification timeline for security incidents affecting customer data?
     Response: _______________________________________________

${(options.includeDataResidency ? 4 : 3) + (options.includeModelAccess ? 2 : 1)}.3  Have you experienced any AI-related security incidents in the past 24 months? Yes / No
     If yes, provide details: _______________________________________________

${(options.includeDataResidency ? 4 : 3) + (options.includeModelAccess ? 2 : 1)}.4  List all regulatory certifications and compliance frameworks your AI systems adhere to.
     Response: _______________________________________________

${(options.includeDataResidency ? 4 : 3) + (options.includeModelAccess ? 2 : 1)}.5  Do you conduct regular penetration testing of your AI systems? Yes / No
     If yes, how frequently? _______________________________________________

SECTION ${(options.includeDataResidency ? 4 : 3) + (options.includeModelAccess ? 3 : 2)}: ATTESTATION

I attest that the information provided in this questionnaire is accurate and complete to the best of my knowledge.

Vendor Representative Name: _______________________________________________
Title: _______________________________________________
Signature: _______________________________________________
Date: _______________________________________________

================================================================================
${org.name} | ${org.industry}
Document generated based on OWASP GenAI Data Security Framework (DSGAI)
`
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function PolicyGenerator() {
  const { dark } = useTheme()
  const [step, setStep] = useState(1)

  // Step 1: Org profile
  const [orgName, setOrgName] = useState('')
  const [industry, setIndustry] = useState('Technology')
  const [selectedRegs, setSelectedRegs] = useState([])
  const [maturity, setMaturity] = useState('exploration')

  // Step 2: Policy selection
  const [selectedPolicies, setSelectedPolicies] = useState([])

  // Step 3: Customization options
  const [aupOptions, setAupOptions] = useState({
    allowConsumerAI: false,
    allowCodeGen: true,
    requireManagerApproval: true,
  })
  const [classOptions, setClassOptions] = useState({
    classificationLevels: 4,
    includeAICategories: true,
  })
  const [govOptions, setGovOptions] = useState({
    requireModelRegistry: true,
    requireHumanInLoop: true,
    retirementCriteria: true,
  })
  const [vendorOptions, setVendorOptions] = useState({
    includeDataResidency: true,
    includeModelAccess: true,
  })

  // Step 4: Generated text
  const [generatedPolicies, setGeneratedPolicies] = useState({})

  const toggleReg = (id) => {
    setSelectedRegs(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
  }

  const togglePolicy = (id) => {
    setSelectedPolicies(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const canProceed = () => {
    if (step === 1) return orgName.trim().length > 0
    if (step === 2) return selectedPolicies.length > 0
    return true
  }

  const handleNext = () => {
    if (step === 3) {
      // Generate policies
      const org = { name: orgName, industry, maturity }
      const policies = {}
      if (selectedPolicies.includes('aup')) {
        policies.aup = generateAUP(org, selectedRegs, maturity, aupOptions)
      }
      if (selectedPolicies.includes('classification')) {
        policies.classification = generateClassificationPolicy(org, selectedRegs, maturity, classOptions)
      }
      if (selectedPolicies.includes('governance')) {
        policies.governance = generateGovernancePolicy(org, selectedRegs, maturity, govOptions)
      }
      if (selectedPolicies.includes('vendor')) {
        policies.vendor = generateVendorQuestionnaire(org, selectedRegs, maturity, vendorOptions)
      }
      setGeneratedPolicies(policies)
    }
    setStep(s => Math.min(s + 1, 4))
  }

  const handleDownload = (policyId, title) => {
    const text = generatedPolicies[policyId]
    if (!text) return
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${orgName.replace(/\s+/g, '_')}_${title.replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadAll = () => {
    Object.entries(generatedPolicies).forEach(([id]) => {
      const pt = policyTypes.find(p => p.id === id)
      if (pt) handleDownload(id, pt.title)
    })
  }

  const handlePrint = () => {
    window.print()
  }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const inputCls = `w-full px-4 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none ${
    dark
      ? 'bg-gray-900 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-blue-500'
      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-blue-500'
  }`

  const selectCls = `w-full px-4 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none ${
    dark
      ? 'bg-gray-900 border-gray-700 text-gray-200 focus:border-blue-500'
      : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'
  }`

  const cardCls = `rounded-xl border transition-all ${
    dark ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-200'
  }`

  // ---------------------------------------------------------------------------
  // Step renderers
  // ---------------------------------------------------------------------------

  function renderStep1() {
    return (
      <div className={`${cardCls} p-6 sm:p-8`}>
        <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
          <Building size={20} className={dark ? 'text-blue-400' : 'text-blue-600'} />
          Organization Profile
        </h2>
        <div className="space-y-5">
          {/* Org name */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              Organization Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Enter your organization name"
              className={inputCls}
            />
          </div>

          {/* Industry */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              Industry
            </label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={selectCls}>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Regulatory requirements */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              Regulatory Requirements
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {regulations.map(reg => (
                <label key={reg.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                  selectedRegs.includes(reg.id)
                    ? (dark ? 'bg-blue-900/30 border-blue-500/50 text-blue-300' : 'bg-blue-50 border-blue-300 text-blue-700')
                    : (dark ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300')
                }`}>
                  <input
                    type="checkbox"
                    checked={selectedRegs.includes(reg.id)}
                    onChange={() => toggleReg(reg.id)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                    selectedRegs.includes(reg.id)
                      ? 'bg-blue-600 border-blue-600'
                      : (dark ? 'border-gray-600' : 'border-gray-300')
                  }`}>
                    {selectedRegs.includes(reg.id) && <CheckCircle size={12} className="text-white" />}
                  </div>
                  <span className="text-sm">{reg.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* AI Maturity */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              AI Maturity Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {maturityLevels.map(level => (
                <label key={level.id} className={`flex items-start gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                  maturity === level.id
                    ? (dark ? 'bg-blue-900/30 border-blue-500/50' : 'bg-blue-50 border-blue-300')
                    : (dark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-gray-50 border-gray-200 hover:border-gray-300')
                }`}>
                  <input
                    type="radio"
                    name="maturity"
                    value={level.id}
                    checked={maturity === level.id}
                    onChange={() => setMaturity(level.id)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    maturity === level.id
                      ? 'border-blue-500'
                      : (dark ? 'border-gray-600' : 'border-gray-300')
                  }`}>
                    {maturity === level.id && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      maturity === level.id
                        ? (dark ? 'text-blue-300' : 'text-blue-700')
                        : (dark ? 'text-gray-300' : 'text-gray-700')
                    }`}>{level.label}</p>
                    <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{level.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderStep2() {
    return (
      <div className={`${cardCls} p-6 sm:p-8`}>
        <h2 className={`text-lg font-semibold mb-2 flex items-center gap-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
          <FileText size={20} className={dark ? 'text-blue-400' : 'text-blue-600'} />
          Select Policies to Generate
        </h2>
        <p className={`text-sm mb-6 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          Choose one or more policy documents to generate for {orgName || 'your organization'}.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {policyTypes.map(pt => {
            const Icon = pt.icon
            const selected = selectedPolicies.includes(pt.id)
            return (
              <button
                key={pt.id}
                onClick={() => togglePolicy(pt.id)}
                className={`text-left p-5 rounded-xl border-2 transition-all ${
                  selected
                    ? (dark ? 'bg-blue-900/20 border-blue-500/60 ring-1 ring-blue-500/30' : 'bg-blue-50 border-blue-400 ring-1 ring-blue-200')
                    : (dark ? 'bg-gray-800/40 border-gray-700 hover:border-gray-600' : 'bg-gray-50 border-gray-200 hover:border-gray-300')
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    selected
                      ? (dark ? 'bg-blue-900/50' : 'bg-blue-100')
                      : (dark ? 'bg-gray-700' : 'bg-gray-200')
                  }`}>
                    <Icon size={20} className={
                      selected
                        ? (dark ? 'text-blue-400' : 'text-blue-600')
                        : (dark ? 'text-gray-400' : 'text-gray-500')
                    } />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold mb-1 ${
                      selected
                        ? (dark ? 'text-blue-300' : 'text-blue-700')
                        : (dark ? 'text-gray-200' : 'text-gray-800')
                    }`}>{pt.title}</h3>
                    <p className={`text-xs mb-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{pt.description}</p>
                    <div className={`flex items-center gap-3 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <span>{pt.pages} pages</span>
                      <span>|</span>
                      <span>{pt.audience}</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    selected
                      ? 'bg-blue-600 border-blue-600'
                      : (dark ? 'border-gray-600' : 'border-gray-300')
                  }`}>
                    {selected && <CheckCircle size={14} className="text-white" />}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  function renderStep3() {
    const checkboxRow = (label, checked, onChange) => (
      <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
        checked
          ? (dark ? 'bg-blue-900/20 border-blue-500/40' : 'bg-blue-50 border-blue-200')
          : (dark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-gray-50 border-gray-200 hover:border-gray-300')
      }`}>
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
          checked ? 'bg-blue-600 border-blue-600' : (dark ? 'border-gray-600' : 'border-gray-300')
        }`}>
          {checked && <CheckCircle size={12} className="text-white" />}
        </div>
        <span className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
      </label>
    )

    return (
      <div className="space-y-4">
        {selectedPolicies.includes('aup') && (
          <div className={`${cardCls} p-6`}>
            <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${dark ? 'text-gray-200' : 'text-gray-800'}`}>
              <Users size={16} className={dark ? 'text-blue-400' : 'text-blue-600'} />
              Acceptable Use Policy Options
            </h3>
            <div className="space-y-2">
              {checkboxRow('Allow consumer AI tools (with restrictions)', aupOptions.allowConsumerAI, () => setAupOptions(p => ({ ...p, allowConsumerAI: !p.allowConsumerAI })))}
              {checkboxRow('Allow AI code generation tools (with restrictions)', aupOptions.allowCodeGen, () => setAupOptions(p => ({ ...p, allowCodeGen: !p.allowCodeGen })))}
              {checkboxRow('Require manager approval for new AI tools', aupOptions.requireManagerApproval, () => setAupOptions(p => ({ ...p, requireManagerApproval: !p.requireManagerApproval })))}
            </div>
          </div>
        )}

        {selectedPolicies.includes('classification') && (
          <div className={`${cardCls} p-6`}>
            <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${dark ? 'text-gray-200' : 'text-gray-800'}`}>
              <Scale size={16} className={dark ? 'text-blue-400' : 'text-blue-600'} />
              Data Classification Policy Options
            </h3>
            <div className="space-y-3">
              <div>
                <label className={`block text-sm mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Number of classification levels</label>
                <div className="flex gap-2">
                  {[3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setClassOptions(p => ({ ...p, classificationLevels: n }))}
                      className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                        classOptions.classificationLevels === n
                          ? (dark ? 'bg-blue-900/30 border-blue-500/50 text-blue-300' : 'bg-blue-50 border-blue-300 text-blue-700')
                          : (dark ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300')
                      }`}
                    >
                      {n} levels
                    </button>
                  ))}
                </div>
              </div>
              {checkboxRow('Include AI-specific data categories', classOptions.includeAICategories, () => setClassOptions(p => ({ ...p, includeAICategories: !p.includeAICategories })))}
            </div>
          </div>
        )}

        {selectedPolicies.includes('governance') && (
          <div className={`${cardCls} p-6`}>
            <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${dark ? 'text-gray-200' : 'text-gray-800'}`}>
              <Shield size={16} className={dark ? 'text-blue-400' : 'text-blue-600'} />
              Model Governance Policy Options
            </h3>
            <div className="space-y-2">
              {checkboxRow('Require model registry for all production models', govOptions.requireModelRegistry, () => setGovOptions(p => ({ ...p, requireModelRegistry: !p.requireModelRegistry })))}
              {checkboxRow('Require human-in-the-loop for high-risk decisions', govOptions.requireHumanInLoop, () => setGovOptions(p => ({ ...p, requireHumanInLoop: !p.requireHumanInLoop })))}
              {checkboxRow('Define formal model retirement criteria', govOptions.retirementCriteria, () => setGovOptions(p => ({ ...p, retirementCriteria: !p.retirementCriteria })))}
            </div>
          </div>
        )}

        {selectedPolicies.includes('vendor') && (
          <div className={`${cardCls} p-6`}>
            <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${dark ? 'text-gray-200' : 'text-gray-800'}`}>
              <Building size={16} className={dark ? 'text-blue-400' : 'text-blue-600'} />
              Vendor Assessment Options
            </h3>
            <div className="space-y-2">
              {checkboxRow('Include data residency requirements section', vendorOptions.includeDataResidency, () => setVendorOptions(p => ({ ...p, includeDataResidency: !p.includeDataResidency })))}
              {checkboxRow('Include model access and transparency requirements', vendorOptions.includeModelAccess, () => setVendorOptions(p => ({ ...p, includeModelAccess: !p.includeModelAccess })))}
            </div>
          </div>
        )}
      </div>
    )
  }

  function renderStep4() {
    const [activeTab, setActiveTab] = useState(Object.keys(generatedPolicies)[0] || 'aup')
    const activePolicyText = generatedPolicies[activeTab] || ''
    const activeTitle = policyTypes.find(p => p.id === activeTab)?.title || ''

    return (
      <div className="space-y-4">
        {/* Tab bar */}
        <div className={`flex flex-wrap gap-2 p-1 rounded-xl ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          {Object.keys(generatedPolicies).map(id => {
            const pt = policyTypes.find(p => p.id === id)
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === id
                    ? (dark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 shadow-sm')
                    : (dark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')
                }`}
              >
                {pt?.title || id}
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleDownload(activeTab, activeTitle)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            Download as Text
          </button>
          <button
            onClick={handleDownloadAll}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              dark
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Download size={16} />
            Download All
          </button>
          <button
            onClick={handlePrint}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              dark
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText size={16} />
            Print to PDF
          </button>
        </div>

        {/* Document preview */}
        <div className="rounded-xl border-2 border-dashed overflow-hidden print:border-none"
          style={{ borderColor: dark ? '#374151' : '#d1d5db' }}>
          <div className={`px-3 py-2 text-xs font-medium print:hidden ${dark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
            Document Preview
          </div>
          <div
            className="p-8 sm:p-12 bg-white text-gray-900 print:p-0"
            style={{
              fontFamily: '"Times New Roman", "Georgia", serif',
              fontSize: '13px',
              lineHeight: '1.6',
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
          >
            <pre className="whitespace-pre-wrap font-[inherit] text-[inherit]">{activePolicyText}</pre>
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <div className="py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${dark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
            <FileText size={24} className={dark ? 'text-blue-400' : 'text-blue-600'} />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
              GenAI Security Policy Generator
            </h1>
          </div>
        </div>
        <p className={`text-sm max-w-3xl ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
          Generate customized, downloadable security policy documents for your organization based on the OWASP GenAI Data Security Framework.
          Configure your organization profile, select the policies you need, customize the options, and download professional policy documents.
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} dark={dark} />

      {/* Step content */}
      <div className="mb-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(s => Math.max(s - 1, 1))}
          disabled={step === 1}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
            step === 1
              ? (dark ? 'border-gray-700 text-gray-600 cursor-not-allowed' : 'border-gray-200 text-gray-300 cursor-not-allowed')
              : (dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50')
          }`}
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {step < 4 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              canProceed()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : (dark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')
            }`}
          >
            {step === 3 ? 'Generate Policies' : 'Next'}
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => { setStep(1); setGeneratedPolicies({}) }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
              dark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Start Over
          </button>
        )}
      </div>
    </div>
  )
}
