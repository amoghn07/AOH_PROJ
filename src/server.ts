import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import emailAnalysisAgent from '../agents/emailAnalysisAgent';
import {
  getVendorById,
  getContractByVendorId,
  formatVendorContext,
  formatContractContext,
} from '../data/vendors';
import { formatPaymentHistory } from '../data/paymentHistory';
import { Email } from '../types/email';
import { logger } from '../utils/logger';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, '../../public')));

// API Routes

/**
 * POST /api/analyze
 * Analyze a vendor email and return dispute analysis
 */
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { vendorId, subject, body } = req.body;

    if (!vendorId || !subject || !body) {
      return res.status(400).json({
        error: 'Missing required fields: vendorId, subject, body',
      });
    }

    logger.info('Received email analysis request', { vendorId, subject });

    // Get vendor context
    const vendor = getVendorById(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: `Vendor not found: ${vendorId}` });
    }

    const contract = getContractByVendorId(vendorId);
    if (!contract) {
      return res.status(404).json({
        error: `No contract found for vendor: ${vendorId}`,
      });
    }

    // Format context
    const vendorContext = formatVendorContext(vendor);
    const contractContext = formatContractContext(contract);
    const paymentContext = formatPaymentHistory(vendorId);

    // Create email object
    const email: Email = {
      id: `EMAIL-${Date.now()}`,
      from: vendor.email,
      to: 'finance@company.com',
      subject,
      body,
      receivedAt: new Date(),
      vendorId,
    };

    // Process through agent
    const result = await emailAnalysisAgent.processEmail(
      email,
      vendorContext,
      contractContext,
      paymentContext
    );

    // Return structured response
    res.json({
      success: true,
      caseId: result.resolutionCase.analysis.caseId,
      vendorName: vendor.name,
      analysis: {
        recommendation: result.resolutionCase.analysis.recommendedAction,
        confidence: result.resolutionCase.analysis.confidence,
        reasoning: result.resolutionCase.analysis.reasoning,
        requiredApprovals: result.resolutionCase.analysis.requiredApprovals,
      },
      draftResponse: result.resolutionCase.analysis.draftResponse,
      fullAnalysis: result.emailAnalysis,
      caseData: result.resolutionCase,
    });
  } catch (error) {
    logger.error('Email analysis failed', error);
    res.status(500).json({
      error: 'Failed to analyze email',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/vendors
 * Get list of available vendors for testing
 */
app.get('/api/vendors', (req: Request, res: Response) => {
  try {
    const { getVendors } = require('../data/vendors');
    const vendors = require('../data/vendors').sampleVendors.map((v: any) => ({
      id: v.id,
      name: v.name,
      email: v.email,
      contactPerson: v.contactPerson,
    }));

    res.json({
      success: true,
      vendors,
    });
  } catch (error) {
    logger.error('Failed to fetch vendors', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

/**
 * GET /api/sample-emails
 * Get sample emails for testing
 */
app.get('/api/sample-emails', (req: Request, res: Response) => {
  try {
    const { sampleEmails } = require('../data/sampleEmails');

    const emails = sampleEmails.map((e: any) => ({
      id: e.id,
      from: e.from,
      subject: e.subject,
      vendorId: e.vendorId,
      body: e.body,
    }));

    res.json({
      success: true,
      emails,
    });
  } catch (error) {
    logger.error('Failed to fetch sample emails', error);
    res.status(500).json({ error: 'Failed to fetch sample emails' });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiKey: process.env.ANTHROPIC_API_KEY ? '✓ configured' : '✗ missing',
  });
});

// Serve frontend
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response) => {
  logger.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running at http://localhost:${PORT}`);
  logger.info(`📊 API available at http://localhost:${PORT}/api`);
  logger.info(`💻 Frontend at http://localhost:${PORT}`);
});

export default app;
