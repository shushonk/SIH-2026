import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Languages, 
  FileText, 
  ExternalLink,
  Loader2
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  "What happened in this field over the last month?",
  "Why is Field 104 high risk?",
  "Which fields should I inspect today?",
  "Are there verified cases nearby?",
  "Early Blight prevention and safe next steps"
];

export function CopilotDrawer({ isOpen, onClose }) {
  const { role, selectedFieldId } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'copilot',
      text: `Namaste! I am your KrishiRaksha AI Agricultural Copilot. I answer using verified ground truth from Field #${selectedFieldId}, our regional spatial clusters, and the certified disease knowledge base. What would you like to investigate?`,
      citations: [`Field Passport #${selectedFieldId}`, 'ICAR IPM Guidelines'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (queryText = input) => {
    const textToSend = queryText.trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.askCopilot({
        query: textToSend,
        role: role,
        field_id: selectedFieldId,
        language: lang
      });

      const botMsg = {
        id: 'bot_' + Date.now(),
        sender: 'copilot',
        text: response.response,
        citations: response.citations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);

      // Simulated voice synthesis if audio enabled
      if (audioFeedback && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response.response.replace(/[*_#•]/g, ''));
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'copilot',
          text: `Error retrieving grounded answer: ${e.message}`,
          citations: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMicToggle = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Speech recognition API not supported in this browser, using text input simulation.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;

    if (!isListening) {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              AI Agricultural Copilot
              <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Grounded RAG
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Citing Field #{selectedFieldId} database records & knowledge documents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className={`px-2 py-1 rounded-md text-xs font-semibold border flex items-center gap-1 transition-colors ${
              lang === 'hi'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title="Toggle between English and Hindi"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Audio speech toggle */}
          <button
            onClick={() => setAudioFeedback(!audioFeedback)}
            className={`p-1.5 rounded-md border transition-colors ${
              audioFeedback
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={audioFeedback ? "Voice feedback enabled" : "Voice feedback disabled"}
          >
            {audioFeedback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Questions Pills */}
      <div className="p-3 bg-slate-950 border-b border-slate-800/80 overflow-x-auto flex gap-1.5 no-scrollbar">
        {SUGGESTED_QUERIES.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isBot = m.sender === 'copilot';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isBot
                    ? 'glass-panel border-slate-700 text-slate-200'
                    : 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-700/20'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {/* Citations badge footer */}
                {isBot && m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-700/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-3 h-3 text-emerald-400" /> Grounded In:
                    </span>
                    {m.citations.map((c, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700 flex items-center gap-1"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs p-3 glass-panel rounded-xl max-w-xs">
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Retrieving grounded facts from database…</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice wave indicator when listening */}
      {isListening && (
        <div className="px-4 py-2 bg-emerald-950/80 border-t border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs text-emerald-300 font-medium">Listening in {lang === 'hi' ? 'Hindi' : 'English'}…</span>
          </div>
          <div className="flex items-center gap-1">
            {[40, 70, 30, 90, 60, 40].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-emerald-400 rounded-full animate-pulse"
                style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleMicToggle}
            className={`p-2 rounded-xl border transition-colors ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Simulate / trigger voice dictation"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={lang === 'hi' ? 'खेत या रोग के बारे में पूछें...' : 'Ask about field history, risk factors, or safe steps…'}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-500 mt-2 text-center">
          Safe Action: AI never prescribes unverified chemical dosages; all actions align with KVK IPM guidance.
        </p>
      </div>

    </div>
  );
}
