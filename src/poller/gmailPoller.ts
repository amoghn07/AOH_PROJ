import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import emailAnalysisAgent from '../agents/emailAnalysisAgent';
import { listUnreadMessageIds, fetchMessage, markMessageAsRead } from '../services/gmailService';
import { getVendorByEmail, getContractByVendorId, formatVendorContext, formatContractContext } from '../data/vendors';
import { formatPaymentHistory } from '../data/paymentHistory';
import { Email } from '../types/email';
import { logger } from '../utils/logger';

const POLL_INTERVAL_MS = Number(process.env.GMAIL_POLL_INTERVAL_MS || 5 * 60 * 1000); // default 5 minutes
const MAX_MESSAGES_PER_POLL = Number(process.env.GMAIL_MAX_MESSAGES || 10);

function extractEmailAddress(fromHeader: string): string {
  const match = fromHeader.match(/<([^>]+)>/);
  return (match ? match[1] : fromHeader).trim();
}

async function processMessage(messageId: string): Promise<void> {
  const normalized = await fetchMessage(messageId);
  if (!normalized) {
    logger.warn('Skipping message with no payload', { messageId });
    return;
  }

  const fromEmail = extractEmailAddress(normalized.from);
  const vendor = getVendorByEmail(fromEmail);
  if (!vendor) {
    logger.warn('Vendor not found for incoming email; leaving unread', { messageId, fromEmail });
    return;
  }

  const contract = getContractByVendorId(vendor.id);
  if (!contract) {
    logger.warn('Contract not found for vendor; leaving unread', { vendorId: vendor.id, messageId });
    return;
  }

  const vendorContext = formatVendorContext(vendor);
  const contractContext = formatContractContext(contract);
  const paymentContext = formatPaymentHistory(vendor.id);

  const email: Email = {
    id: messageId,
    from: fromEmail,
    to: normalized.to,
    subject: normalized.subject,
    body: normalized.body,
    receivedAt: normalized.receivedAt,
    vendorId: vendor.id,
  };

  try {
    const result = await emailAnalysisAgent.processEmail(
      email,
      vendorContext,
      contractContext,
      paymentContext
    );

    // Persist case JSON similar to demo
    const caseData = result.resolutionCase;
    const caseFile = path.join(__dirname, '..', '..', 'cases', `${caseData.analysis.caseId}.json`);
    const casesDir = path.dirname(caseFile);
    if (!fs.existsSync(casesDir)) {
      fs.mkdirSync(casesDir, { recursive: true });
    }
    fs.writeFileSync(caseFile, JSON.stringify(caseData, null, 2));
    logger.info('Case saved from Gmail message', { caseFile, messageId });

    // Mark message as read so we do not reprocess
    await markMessageAsRead(messageId);
  } catch (error) {
    logger.error('Failed to process Gmail message', { messageId, error });
  }
}

async function pollOnce(): Promise<void> {
  try {
    const ids = await listUnreadMessageIds(MAX_MESSAGES_PER_POLL);
    if (ids.length === 0) {
      logger.info('No unread Gmail messages to process');
      return;
    }

    logger.info('Found unread Gmail messages', { count: ids.length });
    for (const id of ids) {
      await processMessage(id);
    }
  } catch (error) {
    logger.error('Gmail polling error', error);
  }
}

function startPolling() {
  logger.info('Starting Gmail poller', { intervalMs: POLL_INTERVAL_MS, maxMessages: MAX_MESSAGES_PER_POLL });
  void pollOnce();
  setInterval(pollOnce, POLL_INTERVAL_MS);
}

startPolling();
