export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { messages, model = 'openai/gpt-4o-mini' } = await request.json();
    const token = process.env.GITHUB_TOKEN;
    if (!token) return Response.json({ error: 'GITHUB_TOKEN is not configured.' }, { status: 500 });

    const response = await fetch('https://models.github.ai/inference/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: 1200 }),
    });
    const data = await response.json();
    if (!response.ok) return Response.json({ error: data.error?.message || 'GitHub Models request failed.' }, { status: response.status });
    return Response.json({ content: data.choices?.[0]?.message?.content || '' });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, { status: 500 });
  }
}
