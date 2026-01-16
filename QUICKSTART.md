# Quick Start Guide

## Project Overview

This is a complete **Vendor Dispute Management System** that automates end-to-end handling of vendor disputes and payment inquiries using:

- **Claude 3.5 Sonnet** - AI-powered dispute analysis
- **Retool** - Human-in-the-loop dashboard (foundation ready)
- **Senso** - Knowledge base for contracts (integration ready)
- **Auth0** - Security layer (integration ready)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Anthropic API key (get one at https://console.anthropic.com)

## Installation

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `@anthropic-ai/sdk` - Claude API client
- `typescript` & `ts-node` - TypeScript support
- `dotenv` - Environment configuration
- Other dev tools

### 2. Set Up API Key

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
NODE_ENV=development
LOG_LEVEL=info
```

**⚠️ Important:** Never commit `.env` to version control. It's already in `.gitignore`.

## Running the Agent

### Option 1: Run the Demo (Recommended)

Process sample vendor emails through the complete pipeline:

```bash
npm run analyze-email
```

This will:
1. Load 3 sample vendor emails
2. Parse dispute details
3. Retrieve vendor context and contracts
4. Analyze using Claude
5. Generate draft responses
6. Create resolution cases for Retool approval

**Output:** Logs printed to console + JSON cases saved to `cases/` directory

### Option 2: Development Mode

Start the development environment:

```bash
npm run dev
```

This validates the API key and confirms the system is ready.

### Option 3: Compile and Run

Build the TypeScript to JavaScript:

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── agents/                          # Core agent logic
│   ├── emailAnalysisAgent.ts       # Main email processing agent
│   └── demoRunner.ts               # Demo email processor
├── services/
│   └── anthropicService.ts         # Claude API integration
├── types/                          # TypeScript interfaces
│   ├── email.ts                    # Email structures
│   ├── dispute.ts                  # Dispute & case types
│   └── vendor.ts                   # Vendor & contract types
├── data/                           # Sample data
│   ├── vendors.ts                  # Vendor database
│   ├── contracts.ts                # Contract terms
│   ├── paymentHistory.ts           # Payment records
│   └── sampleEmails.ts             # Test emails
├── config/
│   └── constants.ts                # Claude config & prompts
├── utils/
│   ├── logger.ts                   # Logging utility
│   └── validators.ts               # Helper functions
└── index.ts                        # Entry point

tests/                              # Test suite (future)
cases/                              # Generated resolution cases
logs/                               # Application logs
```

## How It Works

### 1. Email Ingestion
Vendor sends email about underpayment/discrepancy → System receives it

### 2. Email Parsing
Agent extracts:
- Vendor name & contact
- Invoice numbers
- Dollar amounts
- Type of complaint (underpayment, late payment, etc.)
- Vendor tone (professional, frustrated, hostile)

### 3. Context Retrieval
Agent queries:
- Vendor contract terms & special clauses
- Payment history (paid/pending/overdue)
- Original invoice details

### 4. Claude Analysis
System prompt makes Claude act as Finance Analyst:
- Review contract terms
- Check payment history
- Generate objective analysis
- Make recommendation: approve/reject/partial/investigate
- Draft professional vendor response

### 5. Case Creation
Package everything into a "Resolution Case":
- Case ID
- Analysis & reasoning
- Confidence level (high/medium/low)
- Recommended action
- Required approvals (Finance Manager, Vendor Manager, Legal, etc.)
- Draft email response

### 6. Retool Dashboard (Future)
Finance Manager sees case in Retool:
- Reviews Claude's analysis & draft response
- Clicks "Approve" or "Reject"
- Approved: email sent & payment authorized
- Rejected: reply explaining decision

### 7. Audit Trail
- Who approved what
- When decisions were made
- What was sent to vendor
- Resolution status

## Sample Emails

Three realistic vendor dispute scenarios are included:

1. **TechSupply Co.** - Invoice payment delay, questions about early payment discount
2. **Office Solutions** - Dispute over custom modification charges
3. **Logistics Express** - Question about fuel surcharge application

Run `npm run analyze-email` to see how the system handles each one.

## Key Features of the Agent

### 1. Professional Analysis
- Cites specific contract clauses
- References payment history
- Maintains objective tone
- Suggests cost-optimal resolution

### 2. Confidence Scoring
- **High**: Clear contract terms, documented evidence
- **Medium**: Some ambiguity, needs more info
- **Low**: Conflicting information, escalate

### 3. Smart Approval Routing
Different actions require different approvals:
- Approve payment → Finance Manager
- Reject claim → Finance Manager + Legal (if >$5K)
- Partial payment → Finance Manager + Vendor Manager
- Investigate → Finance Manager + Legal

### 4. Draft Responses
Generates professional email responses that:
- Acknowledge vendor's concern
- Cite relevant contract terms
- Explain company position clearly
- Maintain vendor relationships

## Configuration

### Claude Model & Parameters

Edit `src/config/constants.ts`:

```typescript
export const MODEL = 'claude-3-5-sonnet-20241022';
export const MAX_TOKENS = 2048;           // Response length
export const TEMPERATURE = 0.7;           // Reasoning vs creativity

export const SYSTEM_PROMPT_TEMPLATE = `...`; // Role definition
```

### System Prompt

The system prompt in `src/config/constants.ts` defines Claude's behavior:
- Act as Finance Analyst
- Be objective and fair
- Cite contract clauses
- Suggest cost-effective solutions
- Maintain professional tone

Modify this to match your company policies!

## Next Steps

### 1. Integrate Senso (Knowledge Base)
Currently uses static sample data. Upgrade to query Senso for:
- Real vendor contracts
- Live payment data from ERP
- Updated vendor status

**File to modify:** `src/services/sensoService.ts` (create new)

### 2. Build Retool Backend
Create API endpoints for:
- POST `/api/cases` - Receive new cases
- GET `/api/cases/:caseId` - Fetch case details  
- PUT `/api/cases/:caseId/approve` - Manager approves
- PUT `/api/cases/:caseId/reject` - Manager rejects

### 3. Add Email Integration
Current system processes email text. Add:
- IMAP/SMTP connector to pull real vendor emails
- Send approved responses directly
- Auto-forward rejected cases to vendor managers

### 4. Implement Auth0
Secure Retool dashboard:
- Only Finance Managers see cases
- Managers auth via Auth0
- Role-based approval limits ($5K, $50K, unlimited)

### 5. Add Email Sending
After approval, automatically:
- Send draft response to vendor
- Copy company stakeholders
- Log communication in ERP
- Update dispute status

### 6. Webhook to ERP
When case approved:
- Create/update payment in ERP
- Adjust aging reports
- Trigger payment run
- Update vendor scorecard

## Logging

Logs are saved to the `logs/` directory:
- `app.log` - General application logs
- `error.log` - Errors only

Set log level in `.env`:
```
LOG_LEVEL=info    # info, debug, warn, error
```

## Troubleshooting

### "ANTHROPIC_API_KEY is not set"
**Solution:** Create `.env` file with your API key

```bash
cp .env.example .env
# Edit .env with your key
```

### "API call failed"
**Possible causes:**
1. Invalid API key
2. Rate limited (wait a minute)
3. Network connectivity issue
4. API service down

**Check status:** https://status.anthropic.com

### "Module not found"
**Solution:** Install dependencies

```bash
npm install
```

### "TypeScript compilation error"
**Solution:** Verify Node version

```bash
node --version  # Should be 18+
npm install    # Reinstall
npm run build  # Rebuild
```

## Development Workflow

### Adding a New Dispute Type

1. Add type to `src/types/dispute.ts`
2. Update `determineDisputeType()` in `src/agents/emailAnalysisAgent.ts`
3. Adjust system prompt if needed in `src/config/constants.ts`
4. Add test email to `src/data/sampleEmails.ts`
5. Run `npm run analyze-email` to validate

### Customizing Claude's Behavior

Edit the `SYSTEM_PROMPT_TEMPLATE` in `src/config/constants.ts`:

```typescript
export const SYSTEM_PROMPT_TEMPLATE = `
  You are a Finance Dispute Analyst...
  [Customize behavior here]
  [Add company-specific policies]
  [Adjust tone and requirements]
`;
```

### Testing an Email Manually

Create a new email in `src/data/sampleEmails.ts`:

```typescript
{
  id: 'EMAIL-TEST',
  from: 'vendor@test.com',
  to: 'finance@company.com',
  subject: 'Your issue here',
  body: `Your email text here`,
  receivedAt: new Date(),
  vendorId: 'VENDOR-001',
}
```

Then run `npm run analyze-email`

## Architecture Docs

For deeper technical details, see:

- **[README.md](./README.md)** - Project overview
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Component design & data flows

## Support

For issues:

1. Check the logs: `tail logs/app.log` or `tail logs/error.log`
2. Review the error message
3. Consult ARCHITECTURE.md for technical details
4. Check `.env` configuration

## What's Next?

The system is ready for:

✅ Processing vendor disputes  
✅ Analyzing with Claude  
✅ Generating draft responses  
✅ Creating approval cases  

Coming soon:

⏳ Retool UI integration  
⏳ Senso knowledge base integration  
⏳ Auth0 security layer  
⏳ ERP/payment system integration  
⏳ Real email ingestion  

---

**Ready to test?** Run:

```bash
npm install
npm run analyze-email
```

Then check the `cases/` directory for generated resolution cases!
