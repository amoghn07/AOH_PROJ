import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';
import { MODEL, MAX_TOKENS, TEMPERATURE } from '../config/constants';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MOCK_MODE = process.env.MOCK_API === 'true';

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MOCK_RESPONSES = {
  emailParse: {
    vendorName: 'TechSupply Co.',
    vendorEmail: 'billing@techsupply.com',
    invoiceNumbers: ['INV-2024-1256', 'INV-2024-1257'],
    amounts: [4250, 1875],
    mainComplaint: 'Two invoices totaling $6,125 submitted on 12/15/2024 remain unpaid. Payment was due by 01/14/2025 per Net 30 terms. Please advise on payment status.',
    evidenceProvided: ['invoice numbers', 'dates', 'payment terms reference'],
    tone: 'professional',
  },
  disputeAnalysis: `SUMMARY:
Vendor claims non-payment of two invoices totaling $6,125 now 2 days overdue under Net 30 terms. Invoice dates and amounts are clearly documented and reference contract terms.

KEY FACTS:
- Invoice INV-2024-1256: $4,250 (due 01/14/2025)
- Invoice INV-2024-1257: $1,875 (due 01/14/2025)
- Payment terms: Net 30 per contract
- Current status: Overdue by 2 days
- Vendor contact: professional tone, no escalation language

CONTRACT REFERENCE:
Per CONTRACT-2024-001 with TechSupply Co.:
- Standard Payment Days: 30
- Early Payment Discount: 2% if paid within 10 days (not applicable, past discount window)
- Late Fee: 1.5% per contract
- Service Description: Supply of IT equipment and accessories

ANALYSIS:
The vendor's claim appears valid. Both invoices fall within our contract scope for IT equipment purchases. Invoices are properly dated and reference correct contract terms. The claim is professionally presented with clear documentation. Payment is now 2 days overdue, and late fees are accruing per our agreement.

RECOMMENDATION: approve_payment

CONFIDENCE: high

DRAFT RESPONSE:
Dear John,

Thank you for your email regarding invoices INV-2024-1256 and INV-2024-1257. We have reviewed your account and confirmed that both invoices are valid and fall within the payment terms of our service agreement.

We sincerely apologize for the delay. These invoices should have been processed by January 14th per our Net 30 terms. We are prioritizing immediate payment and expect the transfer to clear within 2 business days.

We appreciate your patience and professional handling of this matter. Please let us know if you have any additional questions.

Best regards,
Finance Team`,
};

export class AnthropicService {
  async analyzeWithSystemPrompt(
    userMessage: string,
    systemPrompt: string,
    conversationHistory: AnthropicMessage[] = []
  ): Promise<string> {
    try {
      if (MOCK_MODE) {
        logger.info('MOCK MODE: Returning simulated response', { model: MODEL });
        // Return appropriate mock response based on the prompt content
        if (userMessage.includes('Extract dispute information')) {
          return JSON.stringify(MOCK_RESPONSES.emailParse);
        }
        return MOCK_RESPONSES.disputeAnalysis;
      }

      logger.info('Calling Anthropic API', { model: MODEL });

      const messages: AnthropicMessage[] = [...conversationHistory, { role: 'user', content: userMessage }];

      const response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        system: systemPrompt,
        messages: messages,
      });

      if (response.content[0].type === 'text') {
        logger.info('Anthropic API response received', { tokensUsed: response.usage });
        return response.content[0].text;
      }

      throw new Error('Unexpected response type from Claude');
    } catch (error) {
      logger.error('Error calling Anthropic API', error);
      throw error;
    }
  }

  async analyzeEmail(emailContent: string, systemPrompt: string): Promise<string> {
    const userMessage = `Analyze this vendor email:\n\n${emailContent}`;
    return this.analyzeWithSystemPrompt(userMessage, systemPrompt);
  }
}

export default new AnthropicService();
