import React, { useState } from 'react';
import api from '../../api/client.js';
import { toast } from '../layout/Toast.jsx';
import { useSoundStore } from '../../store/soundStore.js';

function TutorPanel({ topicId, topicName, levelName, practiceContext, isExam, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hey! I'm Noesis, your DSA tutor 🤖\nAsk me anything about ${topicName || 'arrays'}!` }
  ]);
  const [input, setInput]   = useState('');
  const [sending, setSending] = useState(false);
  const { play }            = useSoundStore();

  const CHIPS = isExam
    ? ['Explain the concept', 'What is O(n)?', 'Give me a hint (no spoilers!)']
    : ['Why is insertion O(n)?', 'When is access O(1)?', 'Explain shifting'];

  const send = async (msg) => {
    if (!msg.trim() || sending) return;
    play('click');
    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);
    try {
      const context = {
        level: levelName,
        topic: topicName,
        isExam,
        ...(practiceContext || {}),
      };
      const { data } = await api.post('/tutor', { message: msg, topicId, context });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      play('correct');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Tutor is having a brain freeze! 🧊';
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
      toast.error(errMsg);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="tutor-panel">
      {/* Header */}
      <div className="tutor-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="mascot" style={{ width: 32, height: 32, fontSize: '1.1rem', borderRadius: 8 }}>🤖</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--ink)' }}>Ask Noesis</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--ink-3)' }}>
              {isExam ? '⚠️ Exam mode — hints only!' : `Topic: ${topicName}`}
            </div>
          </div>
        </div>
        <button className="keycap keycap-ghost keycap-sm" onClick={onClose} aria-label="Close tutor">✕</button>
      </div>

      {/* Messages */}
      <div className="tutor-messages">
        {messages.map((m, i) => (
          <div key={i} className={`tutor-bubble ${m.role}`}>
            {m.content.split('\n').map((line, j) => <span key={j}>{line}<br/></span>)}
          </div>
        ))}
        {sending && (
          <div className="tutor-bubble assistant" style={{ color: 'var(--ink-3)' }}>
            ⏳ thinking...
          </div>
        )}
      </div>

      {/* Suggestion chips */}
      <div className="tutor-chips">
        {CHIPS.map(chip => (
          <button key={chip} className="tutor-chip" onClick={() => send(chip)}>{chip}</button>
        ))}
      </div>

      {/* Input */}
      <div className="tutor-input-area">
        <textarea
          className="input"
          placeholder="Ask a question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={500}
          aria-label="Tutor input"
        />
        <button
          className="keycap keycap-blue keycap-sm"
          onClick={() => send(input)}
          disabled={sending || !input.trim()}
          aria-label="Send"
        >
          ↑
        </button>
      </div>
    </div>
  );
}

export default function TutorButton({ topicId, topicName, levelName, practiceContext, isExam }) {
  const [open, setOpen] = useState(false);
  const { play } = useSoundStore();

  return (
    <>
      {open && (
        <TutorPanel
          topicId={topicId}
          topicName={topicName}
          levelName={levelName}
          practiceContext={practiceContext}
          isExam={isExam}
          onClose={() => setOpen(false)}
        />
      )}
      <button
        className="tutor-fab"
        onClick={() => { play('click'); setOpen(o => !o); }}
        aria-label={open ? 'Close AI tutor' : 'Open AI tutor'}
        title="Ask Noesis"
        style={{ bottom: open ? '28rem' : '1.5rem' }}
      >
        {open ? '✕' : '🤖'}
      </button>
    </>
  );
}
