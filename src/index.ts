#!/usr/bin/env node

import 'dotenv/config';
import { logger } from './utils/logger';

/**
 * Vendor Dispute Management System
 * Main Entry Point
 */

async function main() {
  logger.info('Vendor Dispute Management System initialized');

  if (!process.env.ANTHROPIC_API_KEY) {
    logger.error('ANTHROPIC_API_KEY environment variable is not set');
    logger.info('Please set your API key in the .env file and try again');
    process.exit(1);
  }

  logger.info('System ready. Use npm run analyze-email to process vendor emails.');
}

main().catch((error) => {
  logger.error('Fatal error', error);
  process.exit(1);
});
