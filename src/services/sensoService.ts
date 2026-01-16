import { logger } from '../utils/logger';

/**
 * Senso API Service - Knowledge base integration for contract retrieval
 * Docs: https://docs.senso.ai/
 */

const SENSO_API_URL = process.env.SENSO_API_URL || 'https://sdk.senso.ai/api/v1';
const SENSO_API_KEY = process.env.SENSO_API_KEY;

export interface SensoSearchResult {
  answer: string;
  sources: Array<{
    id: string;
    title: string;
    content: string;
    score: number;
  }>;
  total_results: number;
  processing_time_ms: number;
}

export interface ContractQueryResult {
  contractNumber: string;
  vendorName: string;
  terms: {
    paymentTerms: string;
    serviceDescription: string;
    disputeResolution: string;
    specialClauses: string[];
  };
  effectiveDate: string;
  expirationDate: string;
  rawContext: string;
}

/**
 * Query Senso knowledge base for vendor contract information based on invoice number
 */
export async function queryContractByInvoice(
  invoiceNumber: string,
  vendorEmail?: string
): Promise<ContractQueryResult | null> {
  try {
    logger.info('Querying Senso for contract information', { invoiceNumber, vendorEmail });

    // Build search query
    const query = buildContractQuery(invoiceNumber, vendorEmail);

    // Call Senso search API
    const searchResult = await searchSenso(query);

    if (!searchResult || searchResult.total_results === 0) {
      logger.warn('No contract information found in Senso', { invoiceNumber });
      return null;
    }

    // Parse and structure the contract information
    const contractInfo = parseContractFromSenso(searchResult);

    logger.info('Contract retrieved from Senso', {
      contractNumber: contractInfo.contractNumber,
      vendorName: contractInfo.vendorName,
    });

    return contractInfo;
  } catch (error) {
    logger.error('Error querying Senso', { error, invoiceNumber });
    return null;
  }
}

/**
 * Query Senso for specific contract terms or clauses
 */
export async function querySpecificTerms(
  invoiceNumber: string,
  termsQuery: string
): Promise<string | null> {
  try {
    const query = `For invoice ${invoiceNumber}: ${termsQuery}`;
    
    const searchResult = await searchSenso(query);

    if (!searchResult || searchResult.total_results === 0) {
      logger.warn('No information found for specific terms query', { invoiceNumber, termsQuery });
      return null;
    }

    return searchResult.answer;
  } catch (error) {
    logger.error('Error querying specific terms from Senso', { error, invoiceNumber });
    return null;
  }
}

/**
 * Search Senso knowledge base
 */
async function searchSenso(query: string, maxResults: number = 5): Promise<SensoSearchResult | null> {
  if (!SENSO_API_KEY) {
    logger.warn('Senso API key not configured, skipping search');
    return null;
  }

  try {
    const response = await fetch(`${SENSO_API_URL}/search`, {
      method: 'POST',
      headers: {
        'X-API-Key': SENSO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        max_results: maxResults,
      }),
    });

    if (!response.ok) {
      logger.error('Senso API error', { status: response.status, statusText: response.statusText });
      return null;
    }

    const result = await response.json() as SensoSearchResult;
    return result;
  } catch (error) {
    logger.error('Error calling Senso API', { error });
    return null;
  }
}

/**
 * Build optimized query for contract retrieval
 */
function buildContractQuery(invoiceNumber: string, vendorEmail?: string): string {
  let query = `Find the vendor contract details for invoice number ${invoiceNumber}`;
  
  if (vendorEmail) {
    query += ` from vendor ${vendorEmail}`;
  }
  
  query += `. Include payment terms, service description, dispute resolution process, and special clauses.`;
  
  return query;
}

/**
 * Parse Senso search results into structured contract information
 */
function parseContractFromSenso(searchResult: SensoSearchResult): ContractQueryResult {
  // Extract contract information from the answer and sources
  const answer = searchResult.answer;
  const sources = searchResult.sources;

  // Build raw context from all sources
  const rawContext = sources.map(s => s.content).join('\n\n');

  // Parse structured fields from the answer
  // This is a simplified parser - in production you'd use more robust NLP
  const contractInfo: ContractQueryResult = {
    contractNumber: extractField(answer, 'contract number', 'contract'),
    vendorName: extractField(answer, 'vendor name', 'vendor'),
    terms: {
      paymentTerms: extractField(answer, 'payment terms', 'net'),
      serviceDescription: extractField(answer, 'service description', 'services'),
      disputeResolution: extractField(answer, 'dispute resolution', 'process'),
      specialClauses: extractList(answer, 'special clauses', 'clause'),
    },
    effectiveDate: extractField(answer, 'effective date', 'date'),
    expirationDate: extractField(answer, 'expiration date', 'expires'),
    rawContext: rawContext,
  };

  return contractInfo;
}

/**
 * Extract a specific field from Senso response text
 */
function extractField(text: string, fieldName: string, fallbackKeyword: string): string {
  const regex = new RegExp(`${fieldName}[:\\s]+([^\\n\\.]+)`, 'i');
  const match = text.match(regex);
  
  if (match) {
    return match[1].trim();
  }

  // Fallback: search for keyword
  const fallbackRegex = new RegExp(`${fallbackKeyword}[^\\n]*`, 'i');
  const fallbackMatch = text.match(fallbackRegex);
  
  return fallbackMatch ? fallbackMatch[0].trim() : 'Not specified';
}

/**
 * Extract list items from Senso response
 */
function extractList(text: string, listName: string, itemPrefix: string): string[] {
  const items: string[] = [];
  
  // Look for bullet points or numbered lists
  const bulletRegex = /[•\-\*]\s*([^\n]+)/g;
  const numberedRegex = /\d+\.\s*([^\n]+)/g;
  
  let match;
  while ((match = bulletRegex.exec(text)) !== null) {
    items.push(match[1].trim());
  }
  
  while ((match = numberedRegex.exec(text)) !== null) {
    items.push(match[1].trim());
  }
  
  return items.length > 0 ? items : ['No special clauses found'];
}

/**
 * Upload contract documents to Senso knowledge base
 * Call this during onboarding to index vendor contracts
 */
export async function uploadContractToSenso(
  contractData: {
    contractNumber: string;
    vendorId: string;
    vendorName: string;
    content: string;
    metadata?: Record<string, any>;
  }
): Promise<string | null> {
  if (!SENSO_API_KEY) {
    logger.warn('Senso API key not configured, skipping upload');
    return null;
  }

  try {
    logger.info('Uploading contract to Senso', { 
      contractNumber: contractData.contractNumber,
      vendor: contractData.vendorName 
    });

    const response = await fetch(`${SENSO_API_URL}/content/raw`, {
      method: 'POST',
      headers: {
        'X-API-Key': SENSO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `Contract ${contractData.contractNumber} - ${contractData.vendorName}`,
        summary: `Vendor contract ${contractData.contractNumber} for ${contractData.vendorName}`,
        text: contractData.content,
        metadata: {
          contractNumber: contractData.contractNumber,
          vendorId: contractData.vendorId,
          vendorName: contractData.vendorName,
          ...contractData.metadata,
        },
      }),
    });

    if (!response.ok) {
      logger.error('Failed to upload contract to Senso', { 
        status: response.status,
        contractNumber: contractData.contractNumber 
      });
      return null;
    }

    const result = await response.json() as { id: string };
    const contentId = result.id;

    logger.info('Contract uploaded to Senso successfully', { 
      contentId,
      contractNumber: contractData.contractNumber 
    });

    return contentId;
  } catch (error) {
    logger.error('Error uploading contract to Senso', { error });
    return null;
  }
}

export default {
  queryContractByInvoice,
  querySpecificTerms,
  uploadContractToSenso,
};
