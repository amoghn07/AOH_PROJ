import { v4 as uuidv4 } from 'uuid';
import anthropicService from '../services/anthropicService';
import sensoService from '../services/sensoService';
import { Email, ParsedEmailContent } from '../types/email';
import { Dispute, DisputeAnalysis, ResolutionCase } from '../types/dispute';
import { logger } from '../utils/logger';
import { SYSTEM_PROMPT_TEMPLATE } from '../config/constants';
import { extractInvoiceNumbers, extractAmounts, generateCaseId } from '../utils/validators';

/**
 * Email Analysis Agent
 * 
 * Responsibilities:
 * 1. Parse vendor emails to extract dispute details
 * 2. Generate dispute analysis using Claude
 * 3. Create resolution cases with draft responses
 */
export class EmailAnalysisAgent {
  /**
   * Parse email and extract key dispute information
   */
  async parseEmail(email: Email): Promise<ParsedEmailContent> {
    logger.info('Parsing email', { emailId: email.id, from: email.from });

    const parsePrompt = `Extract dispute information from this email:

Subject: ${email.subject}
Body: ${email.body}

Return a JSON object with:
- vendorName: name of the vendor
- vendorEmail: email address of the vendor
- invoiceNumbers: array of invoice numbers mentioned
- amounts: array of dollar amounts in dispute
- mainComplaint: 2-3 sentence summary of the complaint
- evidenceProvided: array of evidence types mentioned
- tone: professional | frustrated | hostile | neutral`;

    const systemPrompt =
      'You are an expert at extracting structured information from vendor emails. Always respond with valid JSON only.';

    const response = await anthropicService.analyzeWithSystemPrompt(parsePrompt, systemPrompt);

    try {
      // Remove markdown code blocks if present
      let jsonString = response.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const parsed = JSON.parse(jsonString);
      logger.info('Email parsed successfully', { parsed });
      return parsed as ParsedEmailContent;
    } catch (error) {
      logger.error('Failed to parse email response as JSON', { response });
      throw new Error('Failed to extract email content');
    }
  }

  /**
   * Analyze dispute and generate resolution recommendation
   * Enhanced with Senso contract retrieval
   */
  async analyzeDispute(
    email: Email,
    parsedContent: ParsedEmailContent,
    vendorContext: string,
    contractContext: string,
    paymentHistory: string
  ): Promise<DisputeAnalysis> {
    logger.info('Analyzing dispute', { emailId: email.id });

    // Try to retrieve contract from Senso if invoice number is available
    let sensoContractContext = '';
    if (parsedContent.invoiceNumbers.length > 0) {
      logger.info('Querying Senso for contract information', {
        invoiceNumber: parsedContent.invoiceNumbers[0],
        vendorEmail: email.from,
      });

      const sensoContract = await sensoService.queryContractByInvoice(
        parsedContent.invoiceNumbers[0],
        email.from
      );

      if (sensoContract) {
        logger.info('Contract retrieved from Senso', {
          contractNumber: sensoContract.contractNumber,
          vendorName: sensoContract.vendorName,
        });

        sensoContractContext = `
SENSO CONTRACT INTELLIGENCE:
Contract Number: ${sensoContract.contractNumber}
Vendor: ${sensoContract.vendorName}
Effective: ${sensoContract.effectiveDate} to ${sensoContract.expirationDate}

Payment Terms: ${sensoContract.terms.paymentTerms}
Service Description: ${sensoContract.terms.serviceDescription}
Dispute Resolution: ${sensoContract.terms.disputeResolution}

Special Clauses:
${sensoContract.terms.specialClauses.map((c) => `- ${c}`).join('\n')}

Full Context:
${sensoContract.rawContext}
`;
      } else {
        logger.warn('No contract found in Senso, falling back to local data', {
          invoiceNumber: parsedContent.invoiceNumbers[0],
        });
      }
    }

    const analysisPrompt = `You are analyzing a vendor dispute. Here is the context:

VENDOR EMAIL:
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}

PARSED DISPUTE INFO:
- Vendor: ${parsedContent.vendorName}
- Invoice(s): ${parsedContent.invoiceNumbers.join(', ')}
- Amount(s) in Dispute: $${parsedContent.amounts.join(', $')}
- Main Complaint: ${parsedContent.mainComplaint}
- Tone: ${parsedContent.tone}

VENDOR CONTEXT:
${vendorContext}

${sensoContractContext ? sensoContractContext : `CONTRACT TERMS (Local Data):\n${contractContext}`}

PAYMENT HISTORY:
${paymentHistory}

Provide your analysis with:
1. SUMMARY: 2-3 sentence overview
2. KEY FACTS: Bullet points of critical information
3. CONTRACT REFERENCE: Relevant contract terms
4. ANALYSIS: Detailed reasoning
5. RECOMMENDATION: approve_payment | reject_claim | partial_payment | further_investigation
6. CONFIDENCE: high | medium | low
7. DRAFT RESPONSE: Professional email response to vendor addressing their concern`;

    const response = await anthropicService.analyzeWithSystemPrompt(
      analysisPrompt,
      SYSTEM_PROMPT_TEMPLATE
    );

    logger.info('Dispute analysis completed', { emailId: email.id });

    // Parse the response and structure it
    const analysis: DisputeAnalysis = {
      caseId: generateCaseId(),
      vendorId: email.vendorId,
      initialAnalysis: response,
      confidence: extractConfidenceLevel(response),
      recommendedAction: extractRecommendation(response),
      reasoning: extractReasoning(response),
      draftResponse: extractDraftResponse(response),
      requiredApprovals: getRequiredApprovals(extractRecommendation(response)),
    };

    return analysis;
  }

  /**
   * Create a resolution case ready for Retool dashboard approval
   */
  async createResolutionCase(
    email: Email,
    parsedContent: ParsedEmailContent,
    analysis: DisputeAnalysis
  ): Promise<ResolutionCase> {
    logger.info('Creating resolution case', { caseId: analysis.caseId });

    const dispute: Dispute = {
      id: uuidv4(),
      caseId: analysis.caseId,
      vendorId: email.vendorId,
      vendorName: parsedContent.vendorName,
      disputeType: determineDisputeType(parsedContent.mainComplaint),
      amount: parsedContent.amounts[0] || 0,
      currency: 'USD',
      invoiceNumber: parsedContent.invoiceNumbers[0] || 'UNKNOWN',
      status: 'in_analysis',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const resolutionCase: ResolutionCase = {
      id: uuidv4(),
      disputeId: dispute.id,
      vendorId: email.vendorId,
      analysis: analysis,
      status: 'drafted',
      createdBy: 'email-analysis-agent',
      notes: `Case created from email: ${email.subject}`,
    };

    logger.info('Resolution case created', {
      caseId: analysis.caseId,
      status: resolutionCase.status,
      recommendation: analysis.recommendedAction,
    });

    return resolutionCase;
  }

  /**
   * End-to-end email processing
   */
  async processEmail(
    email: Email,
    vendorContext: string,
    contractContext: string,
    paymentHistory: string
  ): Promise<{ resolutionCase: ResolutionCase; emailAnalysis: string }> {
    logger.info('Starting email processing', { emailId: email.id });

    try {
      // Step 1: Parse email
      const parsedContent = await this.parseEmail(email);

      // Step 2: Analyze dispute
      const analysis = await this.analyzeDispute(
        email,
        parsedContent,
        vendorContext,
        contractContext,
        paymentHistory
      );

      // Step 3: Create resolution case
      const resolutionCase = await this.createResolutionCase(email, parsedContent, analysis);

      logger.info('Email processing completed successfully', { caseId: analysis.caseId });

      return {
        resolutionCase,
        emailAnalysis: analysis.initialAnalysis,
      };
    } catch (error) {
      logger.error('Email processing failed', error);
      throw error;
    }
  }
}

// Helper functions
function extractConfidenceLevel(response: string): 'high' | 'medium' | 'low' {
  const lowerResponse = response.toLowerCase();
  if (lowerResponse.includes('high confidence')) return 'high';
  if (lowerResponse.includes('low confidence')) return 'low';
  return 'medium';
}

function extractRecommendation(response: string): 'approve_payment' | 'reject_claim' | 'partial_payment' | 'further_investigation' {
  const lowerResponse = response.toLowerCase();
  if (lowerResponse.includes('approve') && lowerResponse.includes('payment'))
    return 'approve_payment';
  if (lowerResponse.includes('reject') || lowerResponse.includes('deny'))
    return 'reject_claim';
  if (lowerResponse.includes('partial') || lowerResponse.includes('compromise'))
    return 'partial_payment';
  return 'further_investigation';
}

function extractReasoning(response: string): string {
  const analysisMatch = response.match(/ANALYSIS:?\s*([\s\S]*?)(?=\n\d+\.|RECOMMENDATION:?)/i);
  return analysisMatch ? analysisMatch[1].trim() : 'See full analysis above';
}

function extractDraftResponse(response: string): string {
  const draftMatch = response.match(/DRAFT RESPONSE:?\s*([\s\S]*?)$/i);
  return draftMatch ? draftMatch[1].trim() : '';
}

function getRequiredApprovals(action: string): string[] {
  switch (action) {
    case 'approve_payment':
      return ['Finance Manager', 'Department Head'];
    case 'reject_claim':
      return ['Finance Manager'];
    case 'partial_payment':
      return ['Finance Manager', 'Vendor Manager'];
    case 'further_investigation':
      return ['Finance Manager', 'Legal'];
    default:
      return ['Finance Manager'];
  }
}

function determineDisputeType(complaint: string): Dispute['disputeType'] {
  const lower = complaint.toLowerCase();
  if (lower.includes('underpay') || lower.includes('short') || lower.includes('less than'))
    return 'underpayment';
  if (lower.includes('late') || lower.includes('delay') || lower.includes('overdue'))
    return 'late_payment';
  if (lower.includes('invoice') || lower.includes('amount') || lower.includes('discrepanc'))
    return 'invoice_discrepancy';
  if (lower.includes('contract') || lower.includes('agreement') || lower.includes('terms'))
    return 'contract_violation';
  return 'other';
}

export default new EmailAnalysisAgent();
