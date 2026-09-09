import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  X, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  Paperclip
} from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';

export function CaseChatModal({ isOpen, onClose, caseId = 'obs_seed_104_1', fieldId = '104' }) {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [threadData, setThreadData] = useState({ context: null, messages: [] });
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && caseId) {
      loadThread();
      const interval = setInterval(loadThread, 4000); // Near real-time polling
      return () => clearInterval(interval);
    }
  }, [isOpen, caseId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadData.messages]);

  const loadThread = async () => {
    try {
      const data = await api.getCaseMessages(caseId);
      setThreadData(data);
    } catch (err) {
      console.error('Failed to load case chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || sending) return;

    // Determine receiver: If farmer, send to expert. If expert/officer, send to farmer.
    const receiverId = role === 'Farmer' ? 'usr_expert_1' : 'usr_farmer_1';

    setSending(true);
    try {
      await api.sendCaseMessage({
        case_id: caseId,
        field_id: fieldId,
        receiver_id: receiverId,
        text: inputText.trim()
      });
      setInputText('');
      await loadThread();
    } catch (err) {
      console.error('Failed to send case message:', err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const ctx = threadData.context || {
    crop: 'Tomato (Pusa Ruby)',
    primary_diagnosis: 'Early Blight',
    confidence_pct: 0.54,
    current_risk_score: 82,
    image_url: '/samples/early_blight_concentric.jpg'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col h-[650px] overflow-hidden">
        
        {/* Header with Case Diagnostic Context */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate">
                  Case Discussion #{caseId.slice(-8)}
                </h3>
                <Badge variant="warning" size="sm">Direct RBAC Channel</Badge>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {role === 'Farmer' ? 'Direct line with Dr. Meera Nair (Assigned Agronomist)' : 'Direct consultation with Farmer Ramesh Patil'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Case Diagnostic Context Strip */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <img
              src={ctx.image_url || '/samples/early_blight_concentric.jpg'}
              alt="Specimen"
              className="w-10 h-10 rounded-lg object-cover border border-slate-700 bg-slate-800 shrink-0"
              onError={(e) => { e.target.src = '/samples/early_blight_concentric.jpg'; }}
            />
            <div>
              <p className="font-semibold text-white">
                {ctx.crop || 'Crop'} · <span className="text-amber-400">{ctx.primary_diagnosis || 'Early Blight'}</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Confidence: <strong className="text-slate-200">{Math.round((ctx.confidence_pct || 0.54) * 100)}%</strong> · 
                Field Risk: <strong className="text-rose-400">{ctx.current_risk_score || 82}/100</strong>
              </p>
            </div>
          </div>
          <Badge variant="outline" size="sm" className="hidden sm:inline-flex">
            Field #{fieldId}
          </Badge>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/60">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              Loading case consultation history...
            </div>
          ) : threadData.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-6">
              <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-300">No messages in this case yet</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                Initiate clinical dialogue regarding symptoms, sampling instructions, or safe IPM practices.
              </p>
            </div>
          ) : (
            threadData.messages.map((m) => {
              const isMe = m.sender_id === user?.user_id || m.sender_role === role;
              return (
                <div
                  key={m.message_id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      {isMe ? 'You' : m.sender_name}
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      {m.sender_role}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      isMe
                        ? 'bg-emerald-600 text-slate-950 font-medium rounded-tr-none shadow-md shadow-emerald-600/20'
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Reply Chips */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-[10px] font-bold text-slate-500 shrink-0">Suggested:</span>
          {role === 'Farmer' ? (
            <>
              <button
                onClick={() => setInputText('Uploaded leaf underside close-up for review.')}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap cursor-pointer"
              >
                📷 Uploaded underside photo
              </button>
              <button
                onClick={() => setInputText('Pruned 3 bottom leaves as advised. Awaiting next step.')}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap cursor-pointer"
              >
                ✂️ Pruned bottom leaves
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setInputText('Inspection confirmed Early Blight. Proceed with Trichoderma viride foliar spray.')}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap cursor-pointer"
              >
                🌿 Advise Trichoderma spray
              </button>
              <button
                onClick={() => setInputText('Please avoid overhead irrigation and keep field aerated.')}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap cursor-pointer"
              >
                💧 Restrict furrow flooding
              </button>
            </>
          )}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={role === 'Farmer' ? 'Message Dr. Meera Nair regarding this scan...' : 'Send clinical guidance to farmer...'}
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!inputText.trim() || sending}
            className="shrink-0"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Send
          </Button>
        </form>

      </div>
    </div>
  );
}
