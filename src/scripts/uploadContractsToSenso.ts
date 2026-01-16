import 'dotenv/config';
import { sampleContracts } from '../data/vendors';
import { uploadContractToSenso } from '../services/sensoService';
import { logger } from '../utils/logger';

/**
 * Upload all vendor contracts to Senso knowledge base
 * Run this once to populate Senso with contract information
 */
async function uploadAllContracts() {
  logger.info('===============================================');
  logger.info('SENSO CONTRACT UPLOAD - KNOWLEDGE BASE SETUP');
  logger.info('===============================================');
  logger.info('');

  if (!process.env.SENSO_API_KEY) {
    logger.error('SENSO_API_KEY not found in environment variables');
    logger.error('Please add SENSO_API_KEY to your .env file');
    logger.error('Get your API key from: https://console.senso.ai');
    process.exit(1);
  }

  const results: Array<{ contractNumber: string; success: boolean; contentId?: string }> = [];

  for (const contract of sampleContracts) {
    logger.info('Uploading contract', {
      contractNumber: contract.contractNumber,
      vendorId: contract.vendorId,
    });

    // Format contract content for Senso
    const contractContent = formatContractContent(contract);

    try {
      const contentId = await uploadContractToSenso({
        title: `Vendor Contract ${contract.contractNumber}`,
        contractNumber: contract.contractNumber,
        vendorName: `Vendor ${contract.vendorId}`,
        content: contractContent,
      });

      if (contentId) {
        logger.info('✅ Contract uploaded successfully', {
          contractNumber: contract.contractNumber,
          contentId,
        });
        results.push({ contractNumber: contract.contractNumber, success: true, contentId });
      } else {
        logger.error('❌ Failed to upload contract', {
          contractNumber: contract.contractNumber,
        });
        results.push({ contractNumber: contract.contractNumber, success: false });
      }
    } catch (error) {
      logger.error('❌ Error uploading contract', {
        contractNumber: contract.contractNumber,
        error,
      });
      results.push({ contractNumber: contract.contractNumber, success: false });
    }

    // Wait 1 second between uploads to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  logger.info('');
  logger.info('===============================================');
  logger.info('UPLOAD SUMMARY');
  logger.info('===============================================');
  logger.info(`Total contracts: ${results.length}`);
  logger.info(`Successful: ${results.filter((r) => r.success).length}`);
  logger.info(`Failed: ${results.filter((r) => !r.success).length}`);
  logger.info('');

  if (results.some((r) => !r.success)) {
    logger.warn('Some contracts failed to upload. Check the logs above for details.');
  } else {
    logger.info('✅ All contracts uploaded successfully!');
    logger.info('Senso knowledge base is now ready for contract queries.');
  }
}

/**
 * Format contract data into searchable text for Senso
 */
function formatContractContent(contract: any): string {
  const lines = [
    `# Vendor Contract ${contract.contractNumber}`,
    '',
    `## Contract Information`,
    `- Contract Number: ${contract.contractNumber}`,
    `- Vendor ID: ${contract.vendorId}`,
    `- Effective Date: ${contract.effectiveDate.toISOString().split('T')[0]}`,
    `- Expiration Date: ${contract.expirationDate.toISOString().split('T')[0]}`,
    '',
    `## Payment Terms`,
    `- Terms Name: ${contract.paymentTerms.termsName}`,
    `- Standard Payment Days: ${contract.paymentTerms.standardDays}`,
    `- Early Payment Discount: ${contract.paymentTerms.earlyPaymentDiscount}% if paid within ${contract.paymentTerms.discountDays} days`,
    `- Late Fee: ${contract.paymentTerms.lateFeePercentage}% per month`,
    '',
    `## Contract Terms`,
    `### Service Description`,
    contract.terms.serviceDescription,
    '',
    `### Scope`,
    contract.terms.scope,
    '',
    `### Liabilities`,
    contract.terms.liabilities,
    '',
    `### Dispute Resolution Process`,
    contract.terms.disputeResolution,
    '',
    `### Special Clauses`,
  ];

  for (const clause of contract.terms.specialClauses) {
    lines.push(`- ${clause}`);
  }

  return lines.join('\n');
}

// Run the upload script
uploadAllContracts()
  .then(() => {
    logger.info('Contract upload completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Fatal error during contract upload', { error });
    process.exit(1);
  });
