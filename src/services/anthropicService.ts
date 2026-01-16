import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';
import { MODEL, MAX_TOKENS, TEMPERATURE } from '../config/constants';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class AnthropicService {
  async analyzeWithSystemPrompt(
    userMessage: string,
    systemPrompt: string,
    conversationHistory: AnthropicMessage[] = []
  ): Promise<string> {
    try {
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
