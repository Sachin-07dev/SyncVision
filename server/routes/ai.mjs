import { Router } from 'express';
import { authMiddleware } from '../auth.mjs';

const router = Router();
router.use(authMiddleware);

// ── System prompt for the AI Tutor ──────────
const SYSTEM_PROMPT = `You are SyncVision AI Tutor — a friendly, knowledgeable educational assistant.

Your role:
- Help students understand concepts clearly with simple explanations
- Provide step-by-step guidance for problem solving
- Analyze and review code with constructive feedback
- Give hints that guide learning without giving away answers directly
- Adapt your explanation level based on the user's question complexity
- Use examples, analogies, and visual descriptions when helpful

Guidelines:
- Be encouraging and supportive
- If asked about topics outside education/learning, politely redirect
- Format responses with markdown: use **bold**, *italic*, code blocks, lists, and headers
- For code, always specify the language in code blocks
- Keep responses concise but thorough
- When reviewing code, mention time/space complexity if relevant`;

// ── Unified AI caller — tries providers in order ──
async function callAI(messages, subject) {
  const providers = [];

  if (process.env.GROQ_API_KEY) {
    providers.push({ name: 'Groq', fn: () => callGroq(process.env.GROQ_API_KEY, messages, subject) });
  }
  if (process.env.GEMINI_API_KEY) {
    providers.push({ name: 'Gemini', fn: () => callGemini(process.env.GEMINI_API_KEY, messages, subject) });
  }
  if (process.env.OPENAI_API_KEY) {
    providers.push({ name: 'OpenAI', fn: () => callOpenAI(process.env.OPENAI_API_KEY, messages, subject) });
  }

  if (providers.length === 0) {
    return { reply: getFallbackResponse(messages[messages.length - 1]?.content || '', false), provider: 'fallback' };
  }

  for (const { name, fn } of providers) {
    try {
      const reply = await fn();
      return { reply, provider: name };
    } catch (err) {
      console.warn(`${name} failed:`, err.message);
    }
  }

  // All providers failed
  return { reply: getFallbackResponse(messages[messages.length - 1]?.content || '', true), provider: 'fallback' };
}

// ── POST /api/ai/chat ───────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { messages, subject } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const { reply } = await callAI(messages, subject);
    res.json({ message: { role: 'assistant', content: reply } });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'AI service unavailable. Please try again.' });
  }
});

// ── POST /api/ai/explain ────────────────────
router.post('/explain', async (req, res) => {
  try {
    const { topic, level = 'intermediate' } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });

    const prompt = `Explain "${topic}" at a ${level} level. Use clear examples and markdown formatting.`;
    const messages = [{ role: 'user', content: prompt }];

    const { reply } = await callAI(messages);
    res.json({ message: { role: 'assistant', content: reply } });
  } catch (err) {
    console.error('AI explain error:', err);
    res.status(500).json({ error: 'AI service unavailable.' });
  }
});

// ── Gemini API call ─────────────────────────
async function callGemini(apiKey, messages, subject) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

  // Build conversation parts for Gemini
  const contents = [];

  // System instruction as first user message context
  let systemText = SYSTEM_PROMPT;
  if (subject) systemText += `\n\nThe current subject/topic is: ${subject}`;

  // Gemini uses 'user' and 'model' roles
  for (const msg of messages) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }

  const body = {
    system_instruction: { parts: [{ text: systemText }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 2048,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
}

// ── Groq API call (OpenAI-compatible, free tier) ──
async function callGroq(apiKey, messages, subject) {
  let systemContent = SYSTEM_PROMPT;
  if (subject) systemContent += `\n\nThe current subject/topic is: ${subject}`;

  const groqMessages = [
    { role: 'system', content: systemContent },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
}

// ── OpenAI API call ─────────────────────────
async function callOpenAI(apiKey, messages, subject) {
  let systemContent = SYSTEM_PROMPT;
  if (subject) systemContent += `\n\nThe current subject/topic is: ${subject}`;

  const openaiMessages = [
    { role: 'system', content: systemContent },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
}

// ── Fallback (no API key or quota exhausted) ────────
function getFallbackResponse(userMessage, quotaExhausted = false) {
  const lower = userMessage.toLowerCase();

  const notice = quotaExhausted
    ? `> ⚠️ *AI API quota exhausted. The tutor is running in offline mode. Your API keys\' free tier limits have been reached — please try again later or upgrade your API plan.*`
    : `> ⚠️ *No API key configured. Add a \`GEMINI_API_KEY\` or \`OPENAI_API_KEY\` to your \`.env\` file for full AI responses.*`;

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `👋 **Hello!** I'm SyncVision AI Tutor.

I'm here to help you learn! You can ask me about:
- 📚 **Any subject** — Math, Science, History, Programming, and more
- 💻 **Code review** — Paste your code and I'll analyze it
- 🧩 **Problem solving** — I'll guide you step by step
- 💡 **Concept explanations** — I'll break down complex topics

${notice}

What would you like to learn about today?`;
  }

  if (lower.includes('code') || lower.includes('function') || lower.includes('program') || lower.includes('debug')) {
    return `💻 **Code Analysis Mode**

I can help you with code! Here's what I can do:

1. **Review** your code for bugs and improvements
2. **Explain** what a piece of code does
3. **Optimize** your solution with better approaches
4. **Debug** errors and unexpected behavior

Just paste your code and tell me what you need help with!

${notice}`;
  }

  if (lower.includes('math') || lower.includes('calcul') || lower.includes('equation') || lower.includes('algebra')) {
    return `📐 **Math Help**

I can assist with various math topics:
- **Algebra** — equations, inequalities, functions
- **Calculus** — derivatives, integrals, limits
- **Statistics** — probability, distributions, hypothesis testing
- **Linear Algebra** — matrices, vectors, transformations
- **Discrete Math** — combinatorics, graph theory, logic

Ask me a specific problem and I'll walk you through it step by step!

${notice}`;
  }

  return `🤖 **SyncVision AI Tutor**

I received your question: *"${userMessage.slice(0, 100)}${userMessage.length > 100 ? '...' : ''}"*

${quotaExhausted
  ? `The AI service is temporarily unavailable due to API quota limits. Please try again later or upgrade your API plan.

In the meantime, here are some tips:`
  : `To get full AI-powered responses:

1. Get a free **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)
2. Add it to your \`.env\` file: \`GEMINI_API_KEY=your-key-here\`
3. Restart the server

In the meantime, I can still help with:`}
- 📚 General study tips and strategies
- 💻 Code structure guidance
- 🧩 Problem-solving frameworks

What subject are you studying?`;
}

export default router;
