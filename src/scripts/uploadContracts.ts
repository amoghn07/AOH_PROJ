import 'dotenv/config';
import { uploadContractToSenso } from '../services/sensoService';
import { vendors } from '../data/vendors';
import { logger } from '../utils/logger';

/**
 * Upload all vendor contracts to Senso knowledge base
 */
async function uploadAllContracts() {
  logger.info('='.repeat(60));
  logger.info('UPLOADING VENDOR CONTRACTS TO SENSO');
  logger.info('='.repeat(60));
  logger.info('');

  if (!process.env.SENSO_API_KEY) {
    logger.error('SENSO_API_KEY not found in environment variables');
    logger.error('Please add SENSO_API_KEY to your .env file');
    process.exit(1);
  }

  let successCount = 0;
  let failureCount = 0;

  for (const vendor of vendors) {
    try {
      logger.info(`Uploading contract for ${vendor.name}...`);

      // Format contract as a document
      const contractDocument = `
# Vendor Contract: ${vendor.contractNumber}

**Vendor Name:** ${vendor.name}
**Vendor ID:** ${vendor.id}
**Contact Email:** ${vendor.contactEmail}
**Contract Number:** ${vendor.contractNumber}

## Contract Terms

**Payment Terms:** ${vendor.contract.paymentTerms}
**Service Description:** ${vendor.contract.serviceDescription}
**Dispute Resolution:** ${vendor.contract.disputeResolution}

## Special Clauses
${vendor.contract.specialClauses.map((clause, i) => `${i + 1}. ${clause}`).join('\n')}

## Key Information
- **Effective Date:** ${vendor.contract.effectiveDate}
- **Expiration Date:** ${vendor.contract.expirationDate}
- **Status:** ${vendor.contract.status}

## Payment Terms Details
- **Standard Payment Days:** ${vendor.contract.paymentTerms.split(' ')[1] || 'Net 30'} days
- **Currency:** USD
- **Late Payment Fee:** Typically 1.5% per month (unless specified otherwise in special clauses)

## Invoice Prefixes
This vendor typically uses invoice numbers starting with patterns like:
- ${vendor.contractNumber.split('-')[0]}-INV-*
- INV-${vendor.id.split('-')[1]}-*
`;

      const result = await uploadContractToSenso({
        contractNumber: vendor.contractNumber,
        vendorId: vendor.id,
        vendorName: vendor.name,
        content: contractDocument,
        metadata: {
          vendorEmail: vendor.contactEmail,
          effectiveDate: vendor.contract.effectiveDate,
          expirationDate: vendor.contract.expirationDate,
          paymentTerms: vendor.contract.paymentTerms,
        },
      });

      if (result) {
        logger.info(`✅ Successfully uploaded: ${vendor.contractNumber}`);
        successCount++;
      } else {
        logger.error(`❌ Failed to upload: ${vendor.contractNumber}`);
        failureCount++;
      }
    } catch (error) {
      logger.error(`❌ Error uploading contract for ${vendor.name}`, { error });
      failureCount++;
    }

    // Small delay between uploads to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  logger.info('');
  logger.info('='.repeat(60));
  logger.info('UPLOAD COMPLETE');
  logger.info(`✅ Successful: ${successCount}`);
  logger.info(`❌ Failed: ${failureCount}`);
  logger.info('='.repeat(60));
}

// Run the upload
uploadAllContracts()
  .then(() => {
    logger.info('Contract upload completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Contract upload failed', { error });
    process.exit(1);
  });
