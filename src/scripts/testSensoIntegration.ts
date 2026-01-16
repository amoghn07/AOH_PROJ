import 'dotenv/config';
import { queryContractByInvoice, querySpecificTerms } from '../services/sensoService';
import { logger } from '../utils/logger';

/**
 * Test Senso integration with sample queries
 */
async function testSensoIntegration() {
  logger.info('===============================================');
  logger.info('SENSO INTEGRATION TEST');
  logger.info('===============================================');
  logger.info('');

  if (!process.env.SENSO_API_KEY) {
    logger.warn('⚠️  SENSO_API_KEY not configured');
    logger.warn('Senso integration is optional. Add SENSO_API_KEY to .env to enable.');
    logger.warn('Get your API key from: https://console.senso.ai');
    logger.info('');
    logger.info('The system will continue to work using local contract data.');
    return;
  }

  logger.info('Testing Senso contract queries...');
  logger.info('');

  // Test 1: Query contract by invoice number
  logger.info('Test 1: Query contract for invoice INV-2024-0004');
  logger.info('-----------------------------------------------');
  
  const contract1 = await queryContractByInvoice(
    'INV-2024-0004',
    'billing@techsupply.com'
  );

  if (contract1) {
    logger.info('✅ Contract found!', {
      contractNumber: contract1.contractNumber,
      vendorName: contract1.vendorName,
      paymentTerms: contract1.terms.paymentTerms,
    });
  } else {
    logger.warn('❌ No contract found for this invoice');
    logger.warn('This may be expected if contracts have not been uploaded to Senso yet.');
    logger.warn('Run: npm run upload-contracts');
  }

  logger.info('');

  // Test 2: Query specific terms
  logger.info('Test 2: Query specific payment terms');
  logger.info('-----------------------------------------------');
  
  const terms = await querySpecificTerms(
    'INV-2024-0004',
    'What are the early payment discount terms for this invoice?'
  );

  if (terms) {
    logger.info('✅ Terms retrieved:', { terms });
  } else {
    logger.warn('❌ No terms found');
  }

  logger.info('');

  // Test 3: Query another invoice
  logger.info('Test 3: Query contract for invoice OSI-INV-521');
  logger.info('-----------------------------------------------');
  
  const contract2 = await queryContractByInvoice(
    'OSI-INV-521',
    'accounts@officesolutions.com'
  );

  if (contract2) {
    logger.info('✅ Contract found!', {
      contractNumber: contract2.contractNumber,
      vendorName: contract2.vendorName,
      disputeResolution: contract2.terms.disputeResolution,
    });
  } else {
    logger.warn('❌ No contract found for this invoice');
  }

  logger.info('');
  logger.info('===============================================');
  logger.info('TEST COMPLETE');
  logger.info('===============================================');
  logger.info('');
  
  if (contract1 || contract2) {
    logger.info('✅ Senso integration is working!');
    logger.info('Your email analysis will now use Senso for contract retrieval.');
  } else {
    logger.warn('⚠️  No contracts were found in Senso');
    logger.warn('Make sure you have uploaded contracts first:');
    logger.warn('  npm run upload-contracts');
    logger.info('');
    logger.info('The system will fall back to local contract data in the meantime.');
  }
}

// Run the test
testSensoIntegration()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Test failed', { error });
    process.exit(1);
  });
