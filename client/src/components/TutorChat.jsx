import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/TutorChat.css';

export default function TutorChat({ topicId, contextData, isExam }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && topicId) {
      axios.get(`/api/tutor/history/${topicId}`)
        .then(res => setMessages(res.data))
        .catch(err => console.error(err));
    }
  }, [isOpen, topicId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const res = await axios.post('/api/tutor', {
        topicId,
        message: text,
        contextData,
        isExam
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
      setMessages(prev => prev.slice(0, -1)); // remove failed message
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = async () => {
    try {
      await axios.delete(`/api/tutor/history/${topicId}`);
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  const suggestions = [
    "Why is insertion O(n)?",
    "Why can't I insert at index 7?",
    "Give me a hint."
  ];

  return (
    <>
      <button className="tutor-fab" onClick={() => setIsOpen(!isOpen)}>
        🤖
      </button>

      {isOpen && (
        <div className="tutor-panel">
          <div className="tutor-header">
            <h3>Ask Noesis 🤖</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="tutor-messages">
            {messages.length === 0 && (
              <div className="welcome-msg">Hi! I'm Noesis. How can I help you understand this topic?</div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="bubble">{msg.content}</div>
              </div>
            ))}
            {isTyping && (
              <div className="message assistant">
                <div className="bubble typing">...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && <div className="tutor-error">{error}</div>}

          <div className="tutor-suggestions">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)} className="chip">{s}</button>
            ))}
          </div>

          <div className="tutor-input">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask a question..."
              maxLength={500}
            />
            <button onClick={() => sendMessage(input)}>Send</button>
          </div>
          <div className="tutor-footer">
            <button onClick={clearChat} className="clear-btn">Clear Chat</button>
          </div>
        </div>
      )}
    </>
  );
}
