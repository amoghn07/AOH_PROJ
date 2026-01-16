# Vendor Dispute Management System

An end-to-end automation platform for managing vendor disputes and payment inquiries using Claude AI, Retool, Senso, and Auth0.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Email Ingestion (Incoming Vendor Emails)                │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│ Claude Email Analysis Agent (src/agents)                │
│ - Parse email content                                   │
│ - Extract dispute details                               │
│ - Query knowledge base                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│ Dispute Resolution Engine                               │
│ - Contract verification (Senso)                         │
│ - Payment history lookup                                │
│ - Generate draft response                               │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│ Retool Dashboard (Human-in-the-Loop)                    │
│ - Display drafted resolution                            │
│ - Finance manager approves/rejects                      │
│ - Auth0 secures access                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│ Action Execution                                        │
│ - Send approved response                                │
│ - Update ERP system                                     │
│ - Log case resolution                                   │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
src/
├── agents/                 # Claude agent implementations
│   ├── emailAnalysisAgent.ts
│   └── disputeResolutionAgent.ts
├── services/              # External service integrations
│   ├── anthropicService.ts
│   ├── sensoService.ts
│   └── retoolService.ts
├── types/                 # TypeScript interfaces
│   ├── email.ts
│   ├── dispute.ts
│   └── vendor.ts
├── data/                  # Sample data and knowledge base
│   ├── contracts.ts
│   ├── paymentHistory.ts
│   └── vendors.ts
├── config/               # Configuration files
│   └── constants.ts
├── utils/                # Utility functions
│   ├── logger.ts
│   └── validators.ts
└── index.ts              # Entry point

tests/
└── agents/              # Agent tests
```

## Getting Started

### Prerequisites
- Node.js 18+
- Anthropic API key (Claude Opus 4 access)
- Senso API key (optional, for enhanced contract retrieval)

### Installation

1. Clone and install:
```bash
npm install
```

2. Set up environment:
```bash
cp .env.example .env
# Edit .env with your API keys:
# - ANTHROPIC_API_KEY (required)
# - SENSO_API_KEY (optional, for contract knowledge base)
```

3. **(Optional) Upload contracts to Senso:**
```bash
npm run upload-contracts
```
This indexes your vendor contracts in Senso's knowledge base for intelligent retrieval.

4. Run email analysis agent:
```bash
npm run analyze-email
```

## Key Components

### Email Analysis Agent
The core Claude-powered agent that:
- Parses vendor emails
- Extracts dispute/inquiry details
- **Queries Senso knowledge base for contract information** (if configured)
- Falls back to local contract data if Senso is unavailable
- References vendor contracts and payment history
- Generates reasoned responses with policy justification

### Contract Retrieval (Senso Integration)
When an invoice number is detected in an email, the system:
1. Queries Senso's knowledge base for the corresponding vendor contract
2. Retrieves payment terms, special clauses, and dispute resolution procedures
3. Uses this intelligence to inform Claude's analysis
4. Falls back to local contract data if Senso is not configured

**Benefits of Senso:**
- Natural language queries against contract documents
- Semantic search across all vendor agreements
- Always up-to-date contract information
- Reduces manual contract lookup time by 90%

### Dispute Resolution Engine
Coordinates between:
- Knowledge retrieval (Senso)
- Policy enforcement
- Human approval (Retool)
- Action execution

### Human-in-the-Loop Dashboard (Retool)
Provides managers with:
- Drafted resolutions with reasoning
- One-click approval/rejection
- Audit trail and case history
- Secure access via Auth0

## Usage Example

### Basic Email Analysis (without Senso)
```bash
npm run analyze-email
```

### With Senso Contract Intelligence
```bash
# 1. First upload contracts to Senso (one-time setup)
npm run upload-contracts

# 2. Add SENSO_API_KEY to your .env file
# SENSO_API_KEY=your_senso_key_here

# 3. Run analysis with enhanced contract retrieval
npm run analyze-email
```

This will:
1. Load sample vendor emails
2. **Query Senso for contract details based on invoice numbers** (if configured)
3. Query vendor contract and payment data
4. Generate analysis and draft response with Claude
5. Output case details for Retool dashboard

## Next Steps

- [x] Integrate Senso for contract retrieval ✅
- [ ] Connect Senso contract queries to live production data
- [ ] Build Retool backend API
- [ ] Implement Auth0 security layer
- [ ] Create ERP integration module
- [ ] Add email sending functionality
