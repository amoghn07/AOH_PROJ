# Example Output

When you run `npm run analyze-email`, here's what the system produces:

## Console Output Example

```
════════════════════════════════════════════════════════════════════════════════
VENDOR DISPUTE MANAGEMENT SYSTEM - EMAIL ANALYSIS DEMO
════════════════════════════════════════════════════════════════════════════════

Processing Email
- emailId: EMAIL-001

────────────────────────────────────────────────────────────────────────────────
Processing email from: TechSupply Co.

Email from: billing@techsupply.com
Subject: Invoice INV-2024-0004 - Underpayment Issue

[Email body is parsed]

Parsing email
- emailId: EMAIL-001
- from: billing@techsupply.com

Email parsed successfully
- parsed: {
    vendorName: "TechSupply Co.",
    vendorEmail: "billing@techsupply.com",
    invoiceNumbers: ["INV-2024-0004"],
    amounts: [2000],
    mainComplaint: "Invoice payment pending, question about early payment discount eligibility",
    evidenceProvided: ["invoice date", "contract terms", "discount window dates"],
    tone: "professional"
  }

Analyzing dispute
- emailId: EMAIL-001

Calling Anthropic API
- model: claude-3-5-sonnet-20241022

Anthropic API response received
- tokensUsed: { input_tokens: 1242, output_tokens: 456 }

Dispute analysis completed
- emailId: EMAIL-001

Creating resolution case
- caseId: CASE-1736932456-ABC123

Resolution case created
- caseId: CASE-1736932456-ABC123
- status: drafted
- recommendation: approve_payment

Email processing completed successfully
- caseId: CASE-1736932456-ABC123

RESOLUTION CASE CREATED
────────────────────────────────────────────────────────────────────────────────
Case ID: CASE-1736932456-ABC123
Vendor: VENDOR-001
Status: drafted
Recommendation: approve_payment
Confidence Level: high
Required Approvals: Finance Manager, Department Head

ANALYSIS:
The vendor TechSupply Co. has inquired about the payment status and early payment 
discount eligibility for invoice INV-2024-0004 totaling $2,000. 

KEY FACTS:
- Invoice INV-2024-0004 for $2,000
- Invoice dated December 15, 2024
- Due date: January 14, 2025 (Net 30)
- Vendor is asking about 2% early payment discount
- Discount window: 10 days from invoice date (expired December 25)
- No payment has been made yet
- Vendor tone is professional and collaborative

CONTRACT REFERENCE:
Contract TSC-2024-001 between TechSupply Co. includes:
- Early Payment Discount: 2% if paid within 10 days of invoice date
- Late Fee: 1.5% per month on unpaid balances
- Dispute resolution requires initial contact with Account Manager

ANALYSIS:
This is not truly a dispute but rather a vendor inquiry about discount eligibility. 
The vendor's concern is understandable—they want to know if they can still qualify 
for the 2% ($40) discount. However, the discount window has passed (invoice dated 
Dec 15, discount expired Dec 25). We are now in the standard Net 30 payment period.

The vendor is being professional and collaborative, which suggests they may accept 
an explanation about the discount terms. There is no evidence of underpayment or 
breach by either party.

RECOMMENDATION: approve_payment

We should:
1. Pay the full $2,000 (no discount applies)
2. Send a professional response explaining the discount terms
3. Confirm payment timeline (within Net 30)
4. Maintain positive vendor relationship

This is a straightforward payment with no financial risk.

CONFIDENCE: high

The facts are clear, contract terms are unambiguous, and vendor is professional.

DRAFT RESPONSE TO VENDOR:

Subject: Re: Invoice INV-2024-0004 - Payment Status Update

Dear John,

Thank you for your inquiry regarding invoice INV-2024-0004.

Per our contract (TSC-2024-001), we offer a 2% early payment discount if payment 
is made within 10 days of the invoice date. Your invoice was dated December 15, 
2024, which means the discount window closed on December 25, 2024.

As we are now in January, we have moved beyond the discount period, and the 2% 
discount is no longer applicable. However, we are still within our standard Net 30 
payment terms, and your invoice remains a current obligation.

We will process payment of the full invoice amount of $2,000 within the next 
5 business days. Please let us know if you have any other questions.

Best regards,
Finance Team

=> Ready for Retool Dashboard Approval

Case saved to: C:\VENDLER\AOH_PROJ\cases\CASE-1736932456-ABC123.json

════════════════════════════════════════════════════════════════════════════════

[Similar output for EMAIL-002 and EMAIL-003...]

════════════════════════════════════════════════════════════════════════════════

Demo completed! Check the cases/ directory for resolution cases.
These cases are ready for review in the Retool dashboard.
```

## JSON Case Output Example

**File:** `cases/CASE-1736932456-ABC123.json`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "disputeId": "550e8400-e29b-41d4-a716-446655440001",
  "vendorId": "VENDOR-001",
  "analysis": {
    "caseId": "CASE-1736932456-ABC123",
    "vendorId": "VENDOR-001",
    "initialAnalysis": "The vendor TechSupply Co. has inquired about the payment status and early payment discount eligibility for invoice INV-2024-0004 totaling $2,000. [Full analysis text...]",
    "contractReference": "Contract TSC-2024-001: Early Payment Discount 2% if paid within 10 days of invoice date",
    "paymentHistory": "Previous invoices (INV-2024-0001: $2,500 paid 12/25, INV-2024-0002: $1,500 paid 1/5, INV-2024-0003: $3,000 paid on time)",
    "confidence": "high",
    "recommendedAction": "approve_payment",
    "reasoning": "Invoice discount window has expired (Dec 25), we are within Net 30. Vendor is professional. No breach. Pay full amount.",
    "draftResponse": "Dear John,\n\nThank you for your inquiry regarding invoice INV-2024-0004. [Full email...]",
    "requiredApprovals": [
      "Finance Manager",
      "Department Head"
    ]
  },
  "status": "drafted",
  "createdBy": "email-analysis-agent",
  "notes": "Case created from email: Invoice INV-2024-0004 - Underpayment Issue"
}
```

## Key Output Elements

### 1. **Case ID**
```
CASE-1736932456-ABC123
├─ Timestamp: 1736932456
└─ Random suffix: ABC123
```
Unique identifier for tracking in Retool dashboard

### 2. **Recommendation**
```
approve_payment      ← Full payment recommended
reject_claim         ← Vendor claim not valid
partial_payment      ← Compromise settlement
further_investigation ← Need more info
```

### 3. **Confidence Level**
```
high     ← Clear facts, contract terms unambiguous
medium   ← Some details need clarification
low      ← Conflicting info, needs escalation
```

### 4. **Required Approvals**
```
Finance Manager       ← Standard for all cases
Department Head       ← For payment approvals
Vendor Manager        ← For relationship issues
Legal                 ← For contract disputes >$5K
```

### 5. **Draft Response**
```
Professional email to vendor that:
✓ Acknowledges their concern
✓ Cites specific contract clauses
✓ Explains company position
✓ Suggests resolution path
✓ Maintains professional relationship
```

## Logging Output

**File:** `logs/app.log`

```
[2025-01-16T14:32:45.123Z] INFO: Vendor Dispute Management System initialized
[2025-01-16T14:32:46.456Z] INFO: Starting email processing { emailId: 'EMAIL-001' }
[2025-01-16T14:32:47.789Z] INFO: Parsing email { emailId: 'EMAIL-001', from: 'billing@techsupply.com' }
[2025-01-16T14:32:48.234Z] INFO: Email parsed successfully { parsed: {...} }
[2025-01-16T14:32:49.567Z] INFO: Analyzing dispute { emailId: 'EMAIL-001' }
[2025-01-16T14:32:51.890Z] INFO: Calling Anthropic API { model: 'claude-3-5-sonnet-20241022' }
[2025-01-16T14:32:53.123Z] INFO: Anthropic API response received { tokensUsed: { input_tokens: 1242, output_tokens: 456 } }
[2025-01-16T14:32:54.456Z] INFO: Dispute analysis completed { emailId: 'EMAIL-001' }
[2025-01-16T14:32:55.789Z] INFO: Creating resolution case { caseId: 'CASE-1736932456-ABC123' }
[2025-01-16T14:32:56.234Z] INFO: Resolution case created { caseId: 'CASE-1736932456-ABC123', status: 'drafted', recommendation: 'approve_payment' }
[2025-01-16T14:32:57.567Z] INFO: Email processing completed successfully { caseId: 'CASE-1736932456-ABC123' }
```

**File:** `logs/error.log`

```
[Only errors are logged here if they occur]
```

## Sample Dispute Analysis Breakdown

For **EMAIL-002** (Office Solutions - Custom Modification Charges):

```
DISPUTE TYPE: invoice_discrepancy

Vendor Claims:
- Invoice OSI-INV-521 for $4,500
- Included custom chair modifications worth $500
- Payment received: $4,500
- Missing: $500 for custom modifications

Contract Terms:
- Custom modifications are non-refundable
- Custom items should be charged at full price
- Standard office items have 14-day return window

RECOMMENDATION: further_investigation
- Requires clarification: Was custom work pre-approved?
- Need internal approval docs
- Need order confirmation with vendor
- May need to negotiate compromise

CONFIDENCE: medium
- Vendor claim has merit (contract supports their position)
- But we need internal documentation
- Possible that modifications weren't formally requested

REQUIRED APPROVALS: Finance Manager + Vendor Manager
- Need vendor manager to check order records
- Finance manager to approve any settlement
```

## Multiple Email Processing

Running the demo processes all 3 sample emails:

```
EMAIL-001: TechSupply Co.
└─ Status: Ready for Approval
   └─ Case: CASE-1736932456-ABC123
      └─ Recommendation: approve_payment
         └─ Amount: $2,000

EMAIL-002: Office Solutions
└─ Status: Pending Investigation  
   └─ Case: CASE-1736932456-DEF456
      └─ Recommendation: further_investigation
         └─ Amount: $500 (disputed)

EMAIL-003: Logistics Express
└─ Status: Pending Clarification
   └─ Case: CASE-1736932456-GHI789
      └─ Recommendation: partial_payment
         └─ Amount: $6,000 (base) + $300 (fuel surcharge TBD)
```

All cases saved to `cases/` directory as individual JSON files for Retool ingestion.

## Integration with Retool

The JSON cases are ready to be POSTed to Retool:

```javascript
// Example: Send case to Retool
const case = JSON.parse(fs.readFileSync('cases/CASE-1736932456-ABC123.json'));

const response = await fetch('https://retool-backend/api/cases', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(case)
});

// Retool displays case in dashboard
// Manager clicks "Approve"
// System executes action (send email, process payment, etc.)
```

---

This example demonstrates the complete output pipeline: email parsing → Claude analysis → case generation → JSON output → ready for Retool dashboard approval.
