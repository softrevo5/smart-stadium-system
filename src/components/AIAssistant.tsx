'use client';

import React, { useState, useRef, useEffect } from 'react';
import { StadiumState } from '../lib/mockData';
import { Send, MessageSquare, X, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface AIAssistantProps {
  role: string;
  stadiumState: StadiumState;
  systemMessage: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export default function AIAssistant({ role, stadiumState, systemMessage }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [speakEnabled, setSpeakEnabled] = useState<boolean>(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Quick Action Chips depending on active user role
  const getQuickActions = () => {
    switch (role) {
      case 'fan':
        return [
          '🧭 Route me around Gate B queues',
          '💧 Nearest free water refill?',
          '🚌 How do I take the green shuttle?',
          '🍔 Food with eco-friendly options?'
        ];
      case 'organizer':
        return [
          '🚨 Dispatch action plan for Cardiac Event',
          '📊 Analyze all gate traffic & flow rates',
          '🔋 Give solar microgrid efficiency report',
          '📝 List unresolved incident details'
        ];
      case 'volunteer':
        return [
          '🧒 Protocol for lost child reported',
          '🎫 Ticket scanner login troubleshooting',
          '♻️ Guidelines for fan recycling bins'
        ];
      case 'staff':
        return [
          '🔧 Turnstile network scanner setup',
          '🧹 Clean spill Section 104 log',
          '📢 Broadcast crowd flow redirection'
        ];
      default:
        return [];
    }
  };

  const handleSpeech = (text: string) => {
    if (!speakEnabled || typeof window === 'undefined') return;
    
    // Clean markdown before speaking
    const cleanText = text.replace(/[*#`_\-]/g, '');
    
    // Cancel existing speak
    window.speechSynthesis?.cancel();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    window.speechSynthesis?.speak(utterance);
  };

  const handleGeminiQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setInputVal('');

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          stadiumState,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      
      if (data.content) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'model',
          content: data.content
        };
        setMessages(prev => [...prev, aiMsg]);
        handleSpeech(data.content);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'API Offline';
      setMessages(prev => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'model', content: `❌ **Error connecting to AI advisor:** ${errMsg}. Running in offline simulation mode.` }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Add initial greeting based on role
  useEffect(() => {
    let greeting = '';
    if (role === 'fan') {
      greeting = '👋 Hello! I am your FIFA 2026 Stadium Companion. Ask me about **shortest gate lines**, **accessible seating paths**, **compostable recycling**, or **free green shuttles**!';
    } else if (role === 'organizer') {
      greeting = '🤖 Operations Advisor Online. I am ready to process incident dispatch logs, calculate solar peak generation, and provide real-time decision support.';
    } else if (role === 'volunteer') {
      greeting = '🤝 Volunteer Support Core active. Ask me about safety protocols, shift assignments, and crowd direction procedures.';
    } else {
      greeting = '🛠️ Venue Crew Dispatch System active. Ask me for hardware configurations, maintenance tickets, and cleanup logs.';
    }

    const timer = setTimeout(() => {
      setMessages([
        { id: 'greeting', role: 'model', content: greeting }
      ]);
    }, 0);
    return () => clearTimeout(timer);
  }, [role]);

  // Keep chat scrolled to bottom
  useEffect(() => {
    if (chatEndRef.current && typeof chatEndRef.current.scrollIntoView === 'function') {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Listen to system message triggers (e.g. from Incident Desk clicks)
  useEffect(() => {
    if (systemMessage) {
      const timer = setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { id: `sys-${Date.now()}`, role: 'user', content: `[System Update]: ${systemMessage}` }
        ]);
        // Trigger AI reply immediately
        handleGeminiQuery(`A system event was triggered: "${systemMessage}". Analyze operations and update dispatch status.`);
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemMessage]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGeminiQuery(inputVal);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={floatingToggleStyle}
          className="wayfinding-glow"
          aria-label="Open GenAI Assistant Panel"
        >
          <MessageSquare size={24} />
          <span style={toggleBadgeStyle}>AI</span>
        </button>
      )}

      {/* Main Chat Drawer */}
      {isOpen && (
        <div style={drawerStyle} className="glass-panel" aria-label="GenAI Copilot Chat Interface">
          {/* Drawer Header */}
          <div style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--color-primary)" />
              <h2 style={titleStyle}>GenAI Stadium Copilot</h2>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setSpeakEnabled(!speakEnabled)}
                style={speakEnabled ? activeIconBtnStyle : iconBtnStyle}
                title={speakEnabled ? 'Disable speech output' : 'Enable voice reader'}
                aria-pressed={speakEnabled}
              >
                {speakEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                style={iconBtnStyle}
                aria-label="Close Assistant Panel"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div style={messagesAreaStyle}>
            {messages.map(msg => (
              <div 
                key={msg.id} 
                style={{
                  ...messageContainerStyle,
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  ...bubbleStyle,
                  background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(112, 0, 255, 0.15))' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: msg.role === 'user' ? 'rgba(0, 240, 255, 0.25)' : 'var(--border-subtle)',
                  borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                  borderBottomLeftRadius: msg.role === 'user' ? '12px' : '2px',
                }}>
                  {/* Bubble Header */}
                  <span style={bubbleRoleStyle}>
                    {msg.role === 'user' ? 'YOU' : 'GEMINI COPILOT'}
                  </span>
                  
                  {/* Bubble Content - basic custom markdown rendering */}
                  <div style={bubbleContentStyle}>
                    {msg.content.split('\n').map((para, idx) => {
                      if (!para.trim()) return <div key={idx} style={{ height: '8px' }} />;
                      
                      let currentText = para;
                      let isBullet = false;
                      let isHeader = false;

                      if (para.trim().startsWith('-') || para.trim().startsWith('*')) {
                        isBullet = true;
                        currentText = para.trim().replace(/^[\-\*]\s*/, '');
                      } else if (para.trim().startsWith('###')) {
                        isHeader = true;
                        currentText = para.trim().replace(/^###\s*/, '');
                      }

                      // Replace bold markdown **text**
                      const boldRegex = /\*\*(.*?)\*\*/g;
                      const parts: (string | React.JSX.Element)[] = [];
                      let lastIndex = 0;
                      let match;
                      
                      while ((match = boldRegex.exec(currentText)) !== null) {
                        if (match.index > lastIndex) {
                          parts.push(currentText.substring(lastIndex, match.index));
                        }
                        parts.push(<strong key={match.index} style={{ color: 'var(--color-primary)' }}>{match[1]}</strong>);
                        lastIndex = boldRegex.lastIndex;
                      }
                      if (lastIndex < currentText.length) {
                        parts.push(currentText.substring(lastIndex));
                      }
                      
                      const contentNode = parts.length > 0 ? parts : currentText;

                      if (isBullet) {
                        return <li key={idx} style={{ marginLeft: '12px', listStyleType: 'square', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{contentNode}</li>;
                      }

                      if (isHeader) {
                        return <h4 key={idx} style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ffffff', marginTop: '8px', marginBottom: '4px' }}>{contentNode}</h4>;
                      }

                      return <p key={idx} style={{ marginBottom: '6px' }}>{contentNode}</p>;
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ ...messageContainerStyle, justifyContent: 'flex-start' }}>
                <div style={{ ...bubbleStyle, background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed' }}>
                  <span style={bubbleRoleStyle}>GEMINI</span>
                  <div style={typingContainerStyle}>
                    <span className="typing-dot" style={typingDotStyle} />
                    <span className="typing-dot" style={{ ...typingDotStyle, animationDelay: '0.2s' }} />
                    <span className="typing-dot" style={{ ...typingDotStyle, animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div style={chipsContainerStyle} aria-label="Suggested Prompts">
            {getQuickActions().map((chip, idx) => (
              <button 
                key={idx}
                onClick={() => handleGeminiQuery(chip.substring(2))} // Strip emoji prefix
                style={chipStyle}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleFormSubmit} style={formStyle} aria-label="Send message to AI assistant">
            <input 
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder={`Ask Gemini (${role} mode)...`}
              style={inputStyle}
              aria-label="Chat input message text"
              required
            />
            <button 
              type="submit" 
              style={sendBtnStyle}
              aria-label="Send message"
              disabled={isTyping}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

// Styling definitions
const floatingToggleStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
  color: '#000000',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 8px 30px rgba(0, 240, 255, 0.4)',
  zIndex: 1000,
  transition: 'transform 0.2s ease',
};

const toggleBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-2px',
  right: '-2px',
  background: 'var(--color-accent)',
  color: '#ffffff',
  fontSize: '0.65rem',
  fontWeight: 'bold',
  padding: '2px 5px',
  borderRadius: '6px',
  border: '2px solid var(--bg-main)',
};

const drawerStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  width: '380px',
  height: '560px',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  borderRadius: '16px',
};


const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: '1px solid var(--border-subtle)',
  background: 'rgba(7, 10, 22, 0.4)',
};

const titleStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: 700,
};

const iconBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.2s ease',
};

const activeIconBtnStyle: React.CSSProperties = {
  ...iconBtnStyle,
  color: 'var(--color-primary)',
  background: 'rgba(0, 240, 255, 0.08)',
};

const messagesAreaStyle: React.CSSProperties = {
  flex: 1,
  padding: '20px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const messageContainerStyle: React.CSSProperties = {
  display: 'flex',
  width: '100%',
};

const bubbleStyle: React.CSSProperties = {
  maxWidth: '85%',
  padding: '10px 14px',
  borderRadius: '12px',
  border: '1px solid var(--border-subtle)',
};

const bubbleRoleStyle: React.CSSProperties = {
  fontSize: '0.6rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  color: 'var(--color-text-muted)',
  display: 'block',
  marginBottom: '4px',
};

const bubbleContentStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  lineHeight: '1.45',
  color: 'var(--color-text-primary)',
};

const typingContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 0',
};

const typingDotStyle: React.CSSProperties = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: 'var(--color-primary)',
  animation: 'pulseGlow 1.2s infinite ease-in-out',
};

const chipsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  padding: '8px 16px',
  overflowX: 'auto',
  borderTop: '1px solid var(--border-subtle)',
  background: 'rgba(5, 7, 18, 0.2)',
  whiteSpace: 'nowrap',
};

const chipStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--color-text-secondary)',
  borderRadius: '20px',
  padding: '6px 12px',
  fontSize: '0.75rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  borderTop: '1px solid var(--border-subtle)',
  padding: '12px 16px',
  background: 'rgba(7, 10, 22, 0.5)',
  borderBottomLeftRadius: '16px',
  borderBottomRightRadius: '16px',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  color: '#ffffff',
  fontSize: '0.85rem',
  outline: 'none',
  paddingRight: '12px',
};

const sendBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--color-primary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px',
};
