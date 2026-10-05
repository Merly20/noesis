const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const TutorChat = require('../models/TutorChat');
const { auth } = require('../middleware/auth');
const router = new express.Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'sk-dummy-key',
});

// Basic rate limiting (in-memory for demo, should use Redis for prod)
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_MESSAGES = 20;

const checkRateLimit = (userId) => {
  const now = Date.now();
  let userRecord = rateLimits.get(userId) || { count: 0, windowStart: now };
  
  if (now - userRecord.windowStart > RATE_LIMIT_WINDOW) {
    userRecord = { count: 1, windowStart: now };
  } else {
    userRecord.count++;
  }
  
  rateLimits.set(userId, userRecord);
  return userRecord.count <= MAX_MESSAGES;
};

router.get('/history/:topicId', auth, async (req, res) => {
  try {
    const chat = await TutorChat.findOne({ userId: req.user._id, topicId: req.params.topicId });
    res.json(chat ? chat.messages : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { topicId, message, contextData, isExam } = req.body;

    if (!message || message.length > 500) {
      return res.status(400).json({ error: 'Message must be between 1 and 500 characters' });
    }

    if (!checkRateLimit(req.user._id.toString())) {
      return res.status(429).json({ error: 'Rate limit exceeded (20 messages/hour). Please try again later.' });
    }

    // Fetch or create chat history
    let chat = await TutorChat.findOne({ userId: req.user._id, topicId });
    if (!chat) {
      chat = new TutorChat({ userId: req.user._id, topicId, messages: [] });
    }

    // Add user message to DB
    chat.messages.push({ role: 'user', content: message });
    if (chat.messages.length > 40) { // keep last 40 (20 pairs)
      chat.messages = chat.messages.slice(-40);
    }
    
    // Build context prompt
    const systemPrompt = `You are Noesis, a friendly, playful, beginner-level AI tutor for a Data Structures & Algorithms platform.
Keep your answers short, use small examples, and explain time/space complexity in simple terms.
Stay on topic (DSA and this platform). Politely decline off-topic requests. Use Socratic hints when the learner is stuck.
${isExam ? 'CRITICAL: The user is currently taking an EXAM. You may explain concepts and give hints, but NEVER give the exact solution, code, or operations needed to solve the current task.' : ''}

Current Context:
${contextData ? JSON.stringify(contextData, null, 2) : 'No context provided.'}
`;

    // Convert history for Anthropic API
    const apiMessages = chat.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 300,
      system: systemPrompt,
      messages: apiMessages
    });

    const assistantMsg = response.content[0].text;

    // Add assistant response to DB
    chat.messages.push({ role: 'assistant', content: assistantMsg });
    await chat.save();

    res.json({ response: assistantMsg });
  } catch (error) {
    console.error('Tutor API Error:', error);
    res.status(500).json({ error: 'The AI tutor is currently unavailable. Please try again later.' });
  }
});

router.delete('/history/:topicId', auth, async (req, res) => {
  try {
    await TutorChat.findOneAndDelete({ userId: req.user._id, topicId: req.params.topicId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
