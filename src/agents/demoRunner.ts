import * as fs from 'fs';
import * as path from 'path';
import emailAnalysisAgent from '../agents/emailAnalysisAgent';
import { sampleEmails, getEmailById } from '../data/sampleEmails';
import {
  getVendorById,
  getContractByVendorId,
  formatVendorContext,
  formatContractContext,
} from '../data/vendors';
import { formatPaymentHistory } from '../data/paymentHistory';
import { logger } from '../utils/logger';

/**
 * Demo runner for the Email Analysis Agent
 *
 * This script demonstrates the end-to-end process of:
 * 1. Loading a vendor email
 * 2. Parsing email content
 * 3. Retrieving vendor context and contract terms
 * 4. Analyzing the dispute using Claude
 * 5. Creating a resolution case for Retool approval
 */

async function runDemo() {
  logger.info('='.repeat(80));
  logger.info('VENDOR DISPUTE MANAGEMENT SYSTEM - EMAIL ANALYSIS DEMO');
  logger.info('='.repeat(80));

  // Process each sample email
  for (const email of sampleEmails) {
    logger.info('');
    logger.info('Processing Email', { emailId: email.id });
    logger.info('-'.repeat(80));

    try {
      // Get vendor context
      const vendor = getVendorById(email.vendorId);
      if (!vendor) {
        logger.error(`Vendor not found: ${email.vendorId}`);
        continue;
      }

      const contract = getContractByVendorId(email.vendorId);
      if (!contract) {
        logger.error(`Contract not found for vendor: ${email.vendorId}`);
        continue;
      }

      // Format context for the agent
      const vendorContext = formatVendorContext(vendor);
      const contractContext = formatContractContext(contract);
      const paymentContext = formatPaymentHistory(email.vendorId);

      logger.info(`Processing email from: ${vendor.name}`);

      // Process the email through the agent
      const result = await emailAnalysisAgent.processEmail(
        email,
        vendorContext,
        contractContext,
        paymentContext
      );

      // Display the resolution case
      const caseData = result.resolutionCase;
      logger.info('');
      logger.info('RESOLUTION CASE CREATED');
      logger.info('-'.repeat(40));
      logger.info(`Case ID: ${caseData.analysis.caseId}`);
      logger.info(`Vendor: ${caseData.analysis.vendorId}`);
      logger.info(`Status: ${caseData.status}`);
      logger.info(`Recommendation: ${caseData.analysis.recommendedAction}`);
      logger.info(`Confidence Level: ${caseData.analysis.confidence}`);
      logger.info(`Required Approvals: ${caseData.analysis.requiredApprovals.join(', ')}`);
      logger.info('');
      logger.info('ANALYSIS:');
      logger.info(result.emailAnalysis);
      logger.info('');
      logger.info('DRAFT RESPONSE TO VENDOR:');
      logger.info(caseData.analysis.draftResponse);
      logger.info('');
      logger.info('=> Ready for Retool Dashboard Approval');

      // Save case to JSON for inspection
      const caseFile = path.join(
        __dirname,
        '..',
        '..',
        'cases',
        `${caseData.analysis.caseId}.json`
      );
      const casesDir = path.dirname(caseFile);
      if (!fs.existsSync(casesDir)) {
        fs.mkdirSync(casesDir, { recursive: true });
      }

      fs.writeFileSync(caseFile, JSON.stringify(caseData, null, 2));
      logger.info(`Case saved to: ${caseFile}`);
    } catch (error) {
      logger.error(`Failed to process email ${email.id}`, error);
    }

    logger.info('');
    logger.info('='.repeat(80));
  }

  logger.info('');
  logger.info('Demo completed! Check the cases/ directory for resolution cases.');
  logger.info('These cases are ready for review in the Retool dashboard.');
}

// Run the demo
runDemo().catch((error) => {
  logger.error('Demo failed', error);
  process.exit(1);
});
