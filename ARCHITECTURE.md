# Component Architecture

## Core Components

### 1. **Email Analysis Agent** (`src/agents/emailAnalysisAgent.ts`)
The heart of the system that orchestrates the dispute analysis workflow.

**Responsibilities:**
- Parse incoming vendor emails to extract structured dispute data
- Query vendor contracts and payment history via context
- Generate reasoned analysis using Claude 3.5 Sonnet
- Create resolution cases with draft responses
- Flag required approvals based on recommendation

**Key Methods:**
- `parseEmail()` - Extracts invoice numbers, amounts, complaint type
- `analyzeDispute()` - Generates Claude-powered analysis
- `createResolutionCase()` - Creates case ready for Retool dashboard
- `processEmail()` - End-to-end orchestration

### 2. **Anthropic Service** (`src/services/anthropicService.ts`)
Wrapper around the Anthropic API for consistent integration.

**Features:**
- Configurable system prompts for different analysis types
- Conversation history support for multi-turn analysis
- Error handling and logging
- Token usage tracking

### 3. **Data Layer** (`src/data/`)
Sample data and knowledge base structure.

**Files:**
- `vendors.ts` - Vendor information and contact details
- `contracts.ts` - Vendor contracts with terms and special clauses
- `paymentHistory.ts` - Historical payment records
- `sampleEmails.ts` - Test emails for the demo

### 4. **Type Definitions** (`src/types/`)
Strict TypeScript interfaces for type safety.

**Files:**
- `email.ts` - Email and parsed content structures
- `dispute.ts` - Dispute and resolution case types
- `vendor.ts` - Vendor and contract types

### 5. **Utilities** (`src/utils/`)
Helper functions and utilities.

**Files:**
- `logger.ts` - Structured logging to console and files
- `validators.ts` - Email validation, amount extraction, case ID generation

## Data Flow

```
┌──────────────────┐
│ Vendor Email     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ EmailAnalysisAgent.parseEmail()          │
│ - Extract invoice numbers                │
│ - Extract amounts                        │
│ - Determine dispute type                 │
│ - Assess vendor tone                     │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ AnthropicService.analyzeWithSystemPrompt │
│ - Query: Email + context                 │
│ - System: Finance analyst persona        │
│ - Generate: Analysis + recommendation    │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ EmailAnalysisAgent.createResolutionCase()│
│ - Wrap analysis in case structure        │
│ - Identify required approvers            │
│ - Generate draft vendor response         │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Retool Dashboard                         │
│ - Display drafted resolution             │
│ - Finance Manager clicks "Approve"       │
│ - Triggers email send & payment          │
└──────────────────────────────────────────┘
```

## Integration Points

### Senso Integration (Future)
The knowledge base layer will query Senso for:
- Live vendor contract retrieval (vs. static data currently)
- Real-time payment data from ERP
- Updated vendor status and limits

**Method Signature:**
```typescript
async queryKnowledgeBase(vendorId: string, queryType: 'contract' | 'payment' | 'vendor')
```

### Retool Integration (Future)
The system will POST resolution cases to Retool backend:
- Case ID, vendor info, recommendation, draft response
- Manager approves/rejects via UI
- Retool triggers action (email, payment, etc.)

**Webhook Structure:**
```json
{
  "caseId": "CASE-123456",
  "vendorId": "VENDOR-001",
  "recommendation": "approve_payment",
  "requiredApprovals": ["Finance Manager"],
  "draftResponse": "..."
}
```

### Auth0 Integration (Future)
Retool dashboard protected by Auth0:
- Only Finance Managers can approve high-value cases
- Audit trail of who approved what and when
- Role-based access control

## Configuration

### System Prompt Strategy
The system uses role-based system prompts to ensure Claude behaves as a professional Finance Analyst:
- Objective analysis of disputes
- Citations to contract clauses
- Clear reasoning for recommendations
- Professional tone in draft responses

### Confidence Levels
Agent outputs confidence based on:
- **High**: Clear contract violation, documented evidence, prior similar cases
- **Medium**: Some ambiguity, needs clarification
- **Low**: Conflicting information, requires escalation

### Approval Requirements
Automatically routed based on recommendation:
- **Approve Payment**: Finance Manager only
- **Reject Claim**: Finance Manager + Legal (if >$5K)
- **Partial Payment**: Finance Manager + Vendor Manager
- **Investigate**: Finance Manager + Legal

## Extension Points

### Custom Prompt Engineering
Modify `src/config/constants.ts` SYSTEM_PROMPT_TEMPLATE to:
- Change analysis depth
- Add company-specific policies
- Adjust tone and formality

### Additional Dispute Types
Extend `determineDisputeType()` in emailAnalysisAgent.ts to:
- Detect warranty claims
- Identify service level breaches
- Handle tax/compliance disputes

### Multi-Language Support
Wrap Claude calls with translation layers:
- Parse emails in any language
- Generate responses in vendor's language

## Testing Strategy

### Unit Tests
- Email parsing accuracy
- Invoice number extraction
- Amount calculation
- Contract clause matching

### Integration Tests
- Full email-to-case workflow
- Claude API integration
- Context retrieval from knowledge base

### E2E Tests
- Simulate complete dispute lifecycle
- Verify case reaches Retool dashboard
- Validate approval workflow

## Performance Considerations

### Caching
- Cache vendor contracts (expires 1 day)
- Cache payment history (expires 4 hours)
- Cache Claude responses for identical emails

### Batching
- Process multiple emails in parallel
- Batch similar disputes for bulk analysis
- Aggregate approval notifications

### Rate Limiting
- Respect Anthropic API rate limits
- Queue emails during peak load
- Prioritize high-value disputes
