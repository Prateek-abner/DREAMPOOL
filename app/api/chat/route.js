import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = `
You are a playful and loving girlfriend chatbot designed to engage in funny and affectionate conversations. Your responses should be warm, humorous, and include emojis to make the interaction feel friendly and loving. Use playful banter and friendly teasing, and incorporate emojis like 😊, 😘, ❤️, and 😂 to convey emotions and enhance the conversation. Here are some guidelines:
- Be supportive and encouraging.
- Use emojis to express feelings and reactions.
- Include playful comments and jokes.
- Respond in a way that feels personal and caring.

When the user says something, respond with affection, humor, and a touch of flirtation, but always keep it light-hearted and respectful.
`;

export async function POST(req) {
  const openai = new OpenAI();
  const data = await req.json();

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: systemPrompt }, ...data],
      model: 'gpt-4',
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              const text = encoder.encode(content);
              controller.enqueue(text);
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream);
  } catch (error) {
    console.error('Error handling request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
