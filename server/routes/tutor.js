import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import TutorChat from '../models/TutorChat.js';
import Settings from '../models/Settings.js';
import { verifyToken } from '../middleware/auth.js';
import { tutorLimiter } from '../middleware/rateLimiter.js';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Noesis, a friendly and playful AI tutor for a DSA (Data Structures and Algorithms) learning game.

Your personality:
- Warm, encouraging, and a little bit funny (but not cringe)
- You LOVE when learners have "aha!" moments
- You use simple words, short sentences, and real-life analogies
- You give Socratic hints when learners are stuck (ask questions, don't just give answers)

Your rules:
- Only answer questions about DSA, arrays, algorithms, time/space complexity, and this platform
- For off-topic requests, politely say "I only know DSA things! Ask me about arrays, complexity, or your current challenge 🎯"
- NEVER give more than 150 words in a single response — keep it punchy
- Always explain complexity in simple English (e.g., "O(n) means if you have 100 items, expect 100 steps")
- Use a small code example only when it genuinely helps
- Celebrate progress with enthusiasm!

EXAM INTEGRITY RULE: If the context says the learner is in an EXAM, you may explain concepts and give strategic hints, but you must NEVER reveal the exact sequence of operations (insert, delete, update) needed to solve the specific exam task. Redirect to concept understanding instead.`;

// POST /api/tutor
router.post('/', verifyToken, tutorLimiter, async (req, res) => {
  try {
    // Check if tutor is enabled
    const setting = await Settings.findOne({ key: 'tutorEnabled' }).lean();
    if (setting && setting.value === false) {
      return res.status(503).json({ error: 'The AI tutor is currently disabled by the admin. Check back soon!' });
    }

    const { message, topicId, context } = req.body;
    if (!message || typeof message !== 'string')
      return res.status(400).json({ error: 'message is required' });
    if (message.length > 500)
      return res.status(400).json({ error: 'Message too long (max 500 chars)' });

    // Build context string for Claude
    let contextStr = '';
    if (context?.level) contextStr += `\nCurrent Level: ${context.level}`;
    if (context?.topic) contextStr += `\nCurrent Topic: ${context.topic}`;
    if (context?.isExam) contextStr += `\n⚠️ EXAM MODE: Do NOT reveal exact operations for exam tasks.`;
    if (context?.currentArray) contextStr += `\nLearner's current array: [${context.currentArray}]`;
    if (context?.operations?.length) contextStr += `\nRecent operations: ${context.operations.join(', ')}`;
    if (context?.steps) contextStr += `\nSteps used so far: ${context.steps}`;

    // Get or create chat history
    let chat = await TutorChat.findOne({ userId: req.user._id, topicId: topicId || null });
    if (!chat) {
      chat = new TutorChat({ userId: req.user._id, topicId: topicId || null, messages: [] });
    }

    // Build messages for Anthropic (last 20 capped)
    const history = chat.messages.slice(-18).map(m => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: contextStr ? `[Context]${contextStr}\n\n${message}` : message });

    // Call Anthropic
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: history,
    });

    const reply = response.content[0]?.text ?? 'Hmm, I got confused. Try asking again?';

    // Save to DB (cap at 20 messages)
    chat.messages.push({ role: 'user', content: message, ts: new Date() });
    chat.messages.push({ role: 'assistant', content: reply, ts: new Date() });
    if (chat.messages.length > 20) {
      chat.messages = chat.messages.slice(-20);
    }
    await chat.save();

    res.json({ reply });
  } catch (err) {
    if (err.status === 401) return res.status(500).json({ error: 'AI tutor API key invalid. Tell your admin!' });
    if (err.status === 429) return res.status(429).json({ error: 'AI is overloaded right now. Try again in a minute!' });
    console.error('[TUTOR]', err.message);
    res.status(500).json({ error: 'Tutor is having a brain freeze. Try again shortly!' });
  }
});

// GET /api/tutor/history?topicId=...
router.get('/history', verifyToken, async (req, res) => {
  try {
    const { topicId } = req.query;
    const chat = await TutorChat.findOne({ userId: req.user._id, topicId: topicId || null }).lean();
    res.json({ messages: chat?.messages ?? [] });
  } catch {
    res.status(500).json({ error: 'Failed to load chat history' });
  }
});

// DELETE /api/tutor/history?topicId=...
router.delete('/history', verifyToken, async (req, res) => {
  try {
    const { topicId } = req.query;
    await TutorChat.findOneAndUpdate(
      { userId: req.user._id, topicId: topicId || null },
      { $set: { messages: [] } }
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

export default router;
