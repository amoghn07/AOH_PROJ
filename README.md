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
- Anthropic API key (Claude 3.5 Sonnet access)

### Installation

1. Clone and install:
```bash
npm install
```

2. Set up environment:
```bash
cp .env.example .env
# Edit .env with your Anthropic API key
```

3. Run email analysis agent:
```bash
npm run analyze-email
```

## Key Components

### Email Analysis Agent
The core Claude-powered agent that:
- Parses vendor emails
- Extracts dispute/inquiry details
- References vendor contracts and payment history
- Generates reasoned responses with policy justification

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

```bash
npm run analyze-email
```

This will:
1. Load a sample vendor email
2. Query vendor contract and payment data
3. Generate analysis and draft response
4. Output case details for Retool dashboard

## Next Steps

- [ ] Integrate Senso for contract retrieval
- [ ] Build Retool backend API
- [ ] Implement Auth0 security layer
- [ ] Create ERP integration module
- [ ] Add email sending functionality
