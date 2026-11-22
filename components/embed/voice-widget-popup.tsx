'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Mic,
  MicOff,
  Send,
  UserPlus,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { BrandMark } from '@/components/ui/brand-loader';
import { CadenceBotFaceIcon } from '@/components/embed/cadence-bot-icon';
import { pickBrowserVoice } from '@/lib/voice-speech';
import { WidgetTheme } from '@/lib/types';

export interface WidgetPopupConfig {
  id: string;
  name: string;
  businessName: string;
  voiceId: string;
  voiceLabel: string;
  language: string;
  welcomeMessage: string;
  accentColor: string;
  widgetTheme: WidgetTheme;
  launcherLabel?: string;
  leadCaptureEnabled: boolean;
  status?: 'Active' | 'Draft' | 'Inactive';
}

interface ChatTurn {
  id: string;
  speaker: 'user' | 'agent';
  content: string;
  sources?: string[];
}

interface SpeechRecLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function VoiceWidgetPopup({
  widget,
  hostDomain = '',
  sourcePageUrl = '',
  onClose,
  fallbackInteractContext,
}: {
  widget: WidgetPopupConfig;
  hostDomain?: string;
  sourcePageUrl?: string;
  onClose?: () => void;
  fallbackInteractContext?: {
    agentConfig: {
      name: string;
      businessName: string;
      personality: string;
      customInstructions: string;
      language: string;
      websiteUrl?: string;
    };
    knowledgeItems: { sourceName: string; sourceType: string; content: string }[];
  };
}) {
  const [sessionId] = useState(
    () => `wsess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );
  const [messages, setMessages] = useState<ChatTurn[]>(() => [
    {
      id: 'welcome',
      speaker: 'agent',
      content:
        widget.welcomeMessage?.trim() ||
        `Hi! Ask me anything about ${widget.businessName}.`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>(
    'idle'
  );
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Lead form state
  const [leadDrawerOpen, setLeadDrawerOpen] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadNotes, setLeadNotes] = useState('');
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecLike | null>(null);
  const speakerMutedRef = useRef(speakerMuted);
  useEffect(() => {
    speakerMutedRef.current = speakerMuted;
  }, [speakerMuted]);

  const isDark = widget.widgetTheme === 'dark';
  const safeAccent = /^#[0-9a-fA-F]{3,8}$/.test(widget.accentColor || '')
    ? widget.accentColor
    : '#2563eb';

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, voiceState, leadDrawerOpen]);

  const speakResponse = (text: string) => {
    if (
      speakerMutedRef.current ||
      typeof window === 'undefined' ||
      !('speechSynthesis' in window)
    ) {
      setVoiceState('idle');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const match = pickBrowserVoice(voices, widget.voiceId, widget.language);
      if (match.voice) utterance.voice = match.voice;
      utterance.lang = match.lang;
      utterance.pitch = match.pitch;
      utterance.rate = match.rate;
      utterance.onstart = () => setVoiceState('speaking');
      utterance.onend = () => setVoiceState('idle');
      utterance.onerror = () => setVoiceState('idle');
      window.speechSynthesis.speak(utterance);
    } catch {
      setVoiceState('idle');
    }
  };

  const sendMessage = async (rawText: string) => {
    const cleanText = rawText.trim();
    if (!cleanText || voiceState === 'thinking') return;

    setNotice(null);
    const userTurn: ChatTurn = {
      id: `u_${Date.now()}`,
      speaker: 'user',
      content: cleanText,
    };

    const nextHistory = [...messages, userTurn];
    setMessages(nextHistory);
    setInputValue('');
    setVoiceState('thinking');

    try {
      const useFallbackDraftEndpoint =
        widget.status && widget.status !== 'Active' && Boolean(fallbackInteractContext);

      const res = useFallbackDraftEndpoint
        ? await fetch('/api/voice/interact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agentId: widget.id,
              userMessage: cleanText,
              conversationHistory: nextHistory.map((m) => ({
                speaker: m.speaker,
                content: m.content,
              })),
              agentConfig: fallbackInteractContext?.agentConfig,
              knowledgeItems: fallbackInteractContext?.knowledgeItems,
            }),
          })
        : await fetch(`/api/widget/${encodeURIComponent(widget.id)}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              host:
                hostDomain ||
                (typeof window !== 'undefined' ? window.location.hostname : ''),
              userMessage: cleanText,
              conversationHistory: nextHistory.map((m) => ({
                speaker: m.speaker,
                content: m.content,
              })),
            }),
          });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to reach assistant.');
      }

      const replyText =
        data.responseText ||
        `Thanks for contacting ${widget.businessName}. How can I help further?`;

      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          speaker: 'agent',
          content: replyText,
          sources: Array.isArray(data.sourcesUsed) ? data.sourcesUsed : undefined,
        },
      ]);

      speakResponse(replyText);
    } catch (err) {
      setVoiceState('idle');
      setNotice(err instanceof Error ? err.message : 'Unable to send message.');
    }
  };

  const toggleMicrophone = async () => {
    if (voiceState === 'listening') {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
      setVoiceState('idle');
      return;
    }

    if (typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecLike;
      webkitSpeechRecognition?: new () => SpeechRecLike;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setNotice('Voice microphone capture is unsupported in this browser — type your message below.');
      return;
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch {
      setNotice('Microphone permission was denied. You can still type your question below.');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = widget.language?.toLowerCase().includes('spanish')
        ? 'es-ES'
        : widget.language?.toLowerCase().includes('uk')
          ? 'en-GB'
          : 'en-US';

      recognition.onresult = (event) => {
        const idx = event.results.length - 1;
        const spoken = event.results[idx]?.[0]?.transcript?.trim();
        if (spoken) {
          sendMessage(spoken);
        } else {
          setVoiceState('idle');
        }
      };

      recognition.onerror = () => {
        setVoiceState('idle');
        setNotice('Could not hear speech clearly. Try again or type below.');
      };

      recognition.onend = () => {
        setVoiceState((curr) => (curr === 'listening' ? 'idle' : curr));
      };

      recognitionRef.current = recognition;
      setNotice(null);
      setVoiceState('listening');
      recognition.start();
    } catch {
      setVoiceState('idle');
      setNotice('Microphone could not start. Please type your message below.');
    }
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadEmail.trim() || leadSubmitting) return;
    setLeadSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/widget/${encodeURIComponent(widget.id)}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorName: leadName.trim(),
          visitorEmail: leadEmail.trim(),
          visitorPhone: leadPhone.trim(),
          inquirySummary:
            leadNotes.trim() ||
            messages
              .filter((m) => m.speaker === 'user')
              .map((m) => m.content)
              .slice(-2)
              .join(' | ') ||
            'Requested follow-up from website voice widget',
          sourcePageUrl:
            sourcePageUrl ||
            (typeof window !== 'undefined' ? window.location.href : ''),
          host:
            hostDomain ||
            (typeof window !== 'undefined' ? window.location.hostname : ''),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit details.');
      setLeadSubmitted(true);
      setLeadDrawerOpen(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `lead_ok_${Date.now()}`,
          speaker: 'agent',
          content: `Thank you, ${leadName.trim()}! Our team at ${widget.businessName} has received your contact information and will follow up shortly.`,
        },
      ]);
      speakResponse(
        `Thank you, ${leadName.trim()}! Our team will follow up with you shortly.`
      );
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Unable to send contact details.');
    } finally {
      setLeadSubmitting(false);
    }
  };

  const handleCloseClick = () => {
    if (onClose) {
      onClose();
    } else if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage(
        { type: 'cadence-widget-close', agentId: widget.id },
        '*'
      );
    }
  };

  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden ${
        isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-white text-neutral-900'
      }`}
    >
      {/* Header */}
      <div
        style={{ backgroundColor: safeAccent }}
        className="flex shrink-0 items-center justify-between px-4 py-3 text-white"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
            <CadenceBotFaceIcon className="h-6 w-6 text-white" eyeStroke={safeAccent} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              {widget.name}
            </p>
            <p className="truncate text-[11px] text-white/85">
              {widget.businessName} · {widget.voiceLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              const next = !speakerMuted;
              setSpeakerMuted(next);
              if (next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                if (voiceState === 'speaking') setVoiceState('idle');
              }
            }}
            title={speakerMuted ? 'Unmute voice output' : 'Mute voice output'}
            aria-label={speakerMuted ? 'Unmute speaker' : 'Mute speaker'}
            className="rounded-lg p-1.5 text-white/90 transition-colors hover:bg-white/20"
          >
            {speakerMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={handleCloseClick}
            title="Minimize chat"
            aria-label="Minimize chat"
            className="rounded-lg p-1.5 text-white/90 transition-colors hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Acoustic Status Bar */}
      <div
        className={`flex shrink-0 items-center justify-between border-b px-4 py-2 text-[11px] ${
          isDark
            ? 'border-neutral-800 bg-neutral-900/70 text-neutral-400'
            : 'border-neutral-100 bg-neutral-50 text-neutral-500'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-3.5 items-center gap-0.5">
            {[10, 16, 12, 18, 9].map((h, i) => (
              <span
                key={i}
                style={{
                  backgroundColor: safeAccent,
                  height:
                    voiceState === 'listening' || voiceState === 'speaking'
                      ? `${h}px`
                      : '5px',
                }}
                className={`w-0.5 rounded-full transition-all duration-200 ${
                  voiceState === 'listening' || voiceState === 'speaking'
                    ? 'animate-pulse opacity-100'
                    : 'opacity-40'
                }`}
              />
            ))}
          </div>
          <span className="font-medium">
            {voiceState === 'listening'
              ? 'Listening to your voice...'
              : voiceState === 'thinking'
                ? 'Searching knowledge & replying...'
                : voiceState === 'speaking'
                  ? 'Speaking response...'
                  : 'Ready — tap mic or type'}
          </span>
        </div>

        {widget.leadCaptureEnabled && !leadSubmitted && (
          <button
            type="button"
            onClick={() => setLeadDrawerOpen((o) => !o)}
            style={{ color: safeAccent }}
            className="inline-flex items-center gap-1 font-semibold hover:underline"
          >
            <UserPlus className="h-3 w-3" />
            {leadDrawerOpen ? 'Back to chat' : 'Leave contact'}
          </button>
        )}
      </div>

      {/* Scrollable Conversation / Lead Form */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3.5">
        {leadDrawerOpen ? (
          <form
            onSubmit={handleSubmitLead}
            className={`space-y-3 rounded-xl border p-3.5 ${
              isDark
                ? 'border-neutral-800 bg-neutral-900'
                : 'border-neutral-200 bg-neutral-50/70'
            }`}
          >
            <div>
              <p className="text-xs font-semibold">Request a follow-up</p>
              <p
                className={`mt-0.5 text-[11px] ${
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                }`}
              >
                Leave your details for {widget.businessName}.
              </p>
            </div>
            <input
              type="text"
              required
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              placeholder="Your name *"
              className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none ${
                isDark
                  ? 'border-neutral-700 bg-neutral-950 text-white placeholder:text-neutral-500'
                  : 'border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400'
              }`}
            />
            <input
              type="email"
              required
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
              placeholder="Email address *"
              className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none ${
                isDark
                  ? 'border-neutral-700 bg-neutral-950 text-white placeholder:text-neutral-500'
                  : 'border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400'
              }`}
            />
            <input
              type="tel"
              value={leadPhone}
              onChange={(e) => setLeadPhone(e.target.value)}
              placeholder="Phone (optional)"
              className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none ${
                isDark
                  ? 'border-neutral-700 bg-neutral-950 text-white placeholder:text-neutral-500'
                  : 'border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400'
              }`}
            />
            <textarea
              rows={2}
              value={leadNotes}
              onChange={(e) => setLeadNotes(e.target.value)}
              placeholder="How can we help?"
              className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none ${
                isDark
                  ? 'border-neutral-700 bg-neutral-950 text-white placeholder:text-neutral-500'
                  : 'border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400'
              }`}
            />
            <button
              type="submit"
              disabled={leadSubmitting}
              style={{ backgroundColor: safeAccent }}
              className="w-full rounded-lg py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {leadSubmitting ? 'Sending...' : 'Send Details'}
            </button>
          </form>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.speaker === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                style={
                  msg.speaker === 'user'
                    ? { backgroundColor: safeAccent }
                    : undefined
                }
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.speaker === 'user'
                    ? 'rounded-tr-xs text-white'
                    : isDark
                      ? 'rounded-tl-xs bg-neutral-900 text-neutral-100'
                      : 'rounded-tl-xs bg-neutral-100 text-neutral-800'
                }`}
              >
                {msg.content}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {msg.sources.map((src) => (
                    <span
                      key={src}
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${
                        isDark
                          ? 'bg-neutral-900 text-neutral-400'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {voiceState === 'thinking' && (
          <div className="flex items-start">
            <div
              className={`rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-xs ${
                isDark
                  ? 'bg-neutral-900 text-neutral-400'
                  : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              Thinking...
            </div>
          </div>
        )}

        {notice && (
          <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-[11px] text-rose-500">
            {notice}
          </p>
        )}
      </div>

      {/* Bottom Voice + Text Input Dock */}
      <div
        className={`shrink-0 border-t p-3 ${
          isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-100 bg-white'
        }`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputValue);
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleMicrophone}
            disabled={voiceState === 'thinking'}
            aria-label={voiceState === 'listening' ? 'Stop voice input' : 'Start voice input'}
            title={voiceState === 'listening' ? 'Stop listening' : 'Tap to speak'}
            style={
              voiceState === 'listening'
                ? { backgroundColor: '#ef4444' }
                : { backgroundColor: safeAccent }
            }
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-xs transition-transform active:scale-95 disabled:opacity-50`}
          >
            {voiceState === 'listening' ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question or tap mic..."
            className={`min-w-0 flex-1 rounded-full border px-3.5 py-2 text-xs focus:outline-none ${
              isDark
                ? 'border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-500'
                : 'border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400'
            }`}
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || voiceState === 'thinking'}
            aria-label="Send message"
            style={{ backgroundColor: safeAccent }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* Mandatory Powered by Cadence Footer */}
      <div
        className={`flex shrink-0 items-center justify-center gap-1.5 border-t px-4 py-2 text-[11px] ${
          isDark
            ? 'border-neutral-800 bg-neutral-900/90 text-neutral-400'
            : 'border-neutral-100 bg-neutral-50/90 text-neutral-500'
        }`}
      >
        <span>Powered by</span>
        <BrandMark
          className={`h-3.5 w-4 ${isDark ? 'text-white' : 'text-[#14110f]'}`}
        />
        <span
          className={`font-display font-semibold tracking-tight ${
            isDark ? 'text-white' : 'text-[#14110f]'
          }`}
        >
          Cadence
        </span>
      </div>
    </div>
  );
}
