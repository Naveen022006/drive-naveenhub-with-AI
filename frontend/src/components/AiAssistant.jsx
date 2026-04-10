/**
 * AiAssistant — Floating bottom-right panel with smooth open/close.
 */

import { Bot, Send, X, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { chatWithAi } from '../services/api';

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content: "Hello! I'm your NaveenHub AI Assistant. 🚀\n\nI can help you manage your Google Drive files. Try asking:\n\n• \"Find my recent PDFs\"\n• \"Open my project folder\"\n• \"How much storage am I using?\"\n\n_Powered by Kimi-k2.5!_",
  },
];

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);
    
    try {
      const response = await chatWithAi(newMessages);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I had trouble connecting to my brain. Please check the backend connection and API key. ⚠️" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      {/* ── Toggle Button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full cursor-pointer animate-pulse-glow"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 30px rgba(99,102,241,0.3)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          id="ai-toggle-button"
        >
          <Sparkles size={16} />
          <span className="text-sm font-semibold hidden sm:inline">AI Assistant</span>
        </button>
      )}

      {/* ── Panel ── */}
      {isOpen && (
        <div
          className="fixed z-50 flex flex-col animate-slide-up"
          style={{
            bottom: 24,
            right: 24,
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            height: 'min(560px, calc(100vh - 80px))',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 25px 60px -12px rgba(0,0,0,0.55)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full"
                style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)' }}
              >
                <Bot size={16} color="white" />
              </div>
              <div className="leading-tight">
                <h3 className="text-sm font-bold text-white">NaveenHub AI</h3>
                <p className="text-[10px] text-white/60">JARVIS Mode • Beta</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center rounded-lg cursor-pointer"
              style={{
                width: 28, height: 28,
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: 'white',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
              id="ai-close-button"
            >
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '10px 14px',
                    borderRadius: 14,
                    borderBottomRightRadius: msg.role === 'user' ? 4 : 14,
                    borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 14,
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))'
                      : 'var(--color-surface-solid)',
                    color: 'var(--color-text)',
                    fontSize: 13,
                    lineHeight: 1.55,
                  }}
                >
                  {msg.content.split('\n').map((line, j) => (
                    <p key={j} style={{ marginTop: j > 0 ? 4 : 0 }}>{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Typing dots */}
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  className="flex items-center gap-1"
                  style={{
                    padding: '10px 16px',
                    borderRadius: 14,
                    borderBottomLeftRadius: 4,
                    background: 'var(--color-surface-solid)',
                  }}
                >
                  {[0, 150, 300].map((delay) => (
                    <div
                      key={delay}
                      className="animate-bounce"
                      style={{
                        width: 6, height: 6,
                        borderRadius: '50%',
                        background: 'var(--color-text-muted)',
                        animationDelay: `${delay}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: '1px solid var(--color-border-light)' }}>
            <div
              className="flex items-center gap-2 rounded-xl px-3"
              style={{
                height: 42,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything…"
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: 'var(--color-text)', caretColor: 'var(--color-primary)' }}
                disabled={isTyping}
                id="ai-input"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="flex items-center justify-center rounded-lg cursor-pointer disabled:opacity-30"
                style={{
                  width: 32, height: 32,
                  background: input.trim()
                    ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))'
                    : 'transparent',
                  color: input.trim() ? 'white' : 'var(--color-text-dim)',
                  border: 'none',
                  transition: 'var(--transition)',
                }}
                id="ai-send-button"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-[10px] text-center mt-2" style={{ color: 'var(--color-text-dim)' }}>
              Powered by NaveenHub AI • RAG coming soon
            </p>
          </div>
        </div>
      )}
    </>
  );
}
