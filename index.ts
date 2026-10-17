import { router, json, error, ai } from '@appdeploy/sdk';

export const handler = router({
  'GET /api/_healthcheck': [async () => json({ message: 'Success' })],
  'POST /api/chat': [
    async ({ body }) => {
      const input = body as {
        messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
      };
      if (!Array.isArray(input?.messages) || input.messages.length === 0)
        return error('Please send a message.', 400);
      const messages = input.messages
        .slice(-12)
        .filter(
          m =>
            (m.role === 'user' || m.role === 'assistant') &&
            typeof m.content === 'string' &&
            m.content.trim()
        )
        .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
      if (!messages.length) return error('Please send a valid message.', 400);
      try {
        const result = await ai.generate({
          system:
            'You are Ronak AI, a friendly, clear, helpful general assistant for a student. Keep answers concise by default, explain school concepts simply, and be honest when uncertain. Never ask for passwords or secrets.',
          messages,
          maxTokens: 700,
          thinkingMode: 'FAST',
        });
        return json({ text: result.text });
      } catch (e) {
        console.error('AI chat request failed', e);
        return error(
          'The AI service is temporarily unavailable. Please try again.',
          503
        );
      }
    },
  ],
});
