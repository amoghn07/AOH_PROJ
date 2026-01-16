import { google, gmail_v1 } from 'googleapis';
import { logger } from '../utils/logger';

function getOAuthClient() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || 'https://developers.google.com/oauthplayground';

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Gmail credentials missing. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN.');
  }

  const oAuth2Client = new google.auth.OAuth2({
    clientId,
    clientSecret,
    redirectUri,
  });

  oAuth2Client.setCredentials({ refresh_token: refreshToken });
  return oAuth2Client;
}

function getGmail() {
  const auth = getOAuthClient();
  return google.gmail({ version: 'v1', auth });
}

function decodeBase64Url(data?: string | null): string {
  if (!data) return '';
  const padded = data.replace(/-/g, '+').replace(/_/g, '/');
  const buffer = Buffer.from(padded, 'base64');
  return buffer.toString('utf-8');
}

function extractHeader(payload: gmail_v1.Schema$MessagePart | undefined, name: string): string {
  if (!payload?.headers) return '';
  const header = payload.headers.find((h) => h.name?.toLowerCase() === name.toLowerCase());
  return header?.value || '';
}

function extractBody(payload: gmail_v1.Schema$MessagePart | undefined): string {
  if (!payload) return '';

  // If the body is directly on this part
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  // If multipart, search for text/plain first, then text/html
  if (payload.parts && payload.parts.length > 0) {
    const textPart = payload.parts.find((p) => p.mimeType === 'text/plain');
    if (textPart?.body?.data) {
      return decodeBase64Url(textPart.body.data);
    }

    const htmlPart = payload.parts.find((p) => p.mimeType === 'text/html');
    if (htmlPart?.body?.data) {
      return decodeBase64Url(htmlPart.body.data);
    }

    // Fall back to first part recursively
    return extractBody(payload.parts[0]);
  }

  return '';
}

export interface GmailNormalizedMessage {
  id: string;
  threadId?: string | null;
  from: string;
  to: string;
  subject: string;
  body: string;
  receivedAt: Date;
  raw: gmail_v1.Schema$Message;
}

export async function listUnreadMessageIds(maxResults = 10): Promise<string[]> {
  const gmail = getGmail();
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread in:inbox',
    maxResults,
  });

  const messages = res.data.messages || [];
  return messages.map((m) => m.id!).filter(Boolean);
}

export async function fetchMessage(id: string): Promise<GmailNormalizedMessage | null> {
  const gmail = getGmail();
  const res = await gmail.users.messages.get({
    userId: 'me',
    id,
    format: 'full',
  });

  const message = res.data;
  if (!message.payload) return null;

  const from = extractHeader(message.payload, 'From');
  const to = extractHeader(message.payload, 'To');
  const subject = extractHeader(message.payload, 'Subject') || '(no subject)';
  const dateHeader = extractHeader(message.payload, 'Date');
  const body = extractBody(message.payload);

  const receivedAt = dateHeader ? new Date(dateHeader) : new Date();

  return {
    id,
    threadId: message.threadId,
    from,
    to,
    subject,
    body,
    receivedAt,
    raw: message,
  };
}

export async function markMessageAsRead(id: string): Promise<void> {
  const gmail = getGmail();
  await gmail.users.messages.modify({
    userId: 'me',
    id,
    requestBody: {
      removeLabelIds: ['UNREAD'],
    },
  });
  logger.info('Marked message as read', { messageId: id });
}

export async function archiveMessage(id: string): Promise<void> {
  const gmail = getGmail();
  await gmail.users.messages.modify({
    userId: 'me',
    id,
    requestBody: {
      removeLabelIds: ['INBOX'],
    },
  });
  logger.info('Archived message', { messageId: id });
}
