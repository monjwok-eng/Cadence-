'use client';

import React, { useEffect, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Mic,
  Pause,
  Play,
  Sparkles,
  UserCheck,
  Volume2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useApp } from '@/components/providers/app-provider';
import { VOICE_OPTIONS } from '@/lib/demo-data';
import { AgentPersonality, AgentStatus, VoiceAgent, VoiceOption } from '@/lib/types';

const STEPS = [
  { id: 1, title: 'Chatbot Info' },
  { id: 2, title: 'Personality' },
  { id: 3, title: 'Voice' },
  { id: 4, title: 'Review' },
] as const;

const PERSONALITIES: {
  id: AgentPersonality;
  title: string;
  summary: string;
}[] = [
  {
    id: 'Friendly',
    title: 'Friendly',
    summary: 'Warm, approachable, and conversational for website visitors and product questions.',
  },
  {
    id: 'Professional',
    title: 'Professional',
    summary: 'Polished, structured, and reassuring for SaaS, healthcare, finance, and B2B sites.',
  },
  {
    id: 'Casual',
    title: 'Casual',
    summary: 'Relaxed, natural, and concise for modern consumer brands and storefronts.',
  },
];

const INSTRUCTION_TEMPLATES = [
  {
    label: 'Sales & Pricing Guide',
    text: 'Greet visitors warmly, answer pricing and product questions from our website knowledge base, and ask for their name and email if they want a custom demo.',
  },
  {
    label: 'Lead Qualification',
    text: 'Ask about the visitor’s primary goal, timeline, and company size. Summarize their request and invite them to leave their email for a specialist follow-up.',
  },
  {
    label: 'Website Customer Support',
    text: 'Answer onboarding and troubleshooting questions concisely from our indexed documentation, and capture contact details if a human follow-up is needed.',
  },
];

function AgentWizardForm({
  editingAgent,
  defaultBusinessName,
  onClose,
  onSave,
}: {
  editingAgent: VoiceAgent | null;
  defaultBusinessName: string;
  onClose: () => void;
  onSave: (payload: {
    name: string;
    businessName: string;
    description: string;
    websiteUrl: string;
    welcomeMessage: string;
    status: AgentStatus;
    personality: AgentPersonality;
    customInstructions: string;
    voiceId: string;
    voiceLabel: string;
    language: string;
  }) => Promise<void>;
}) {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState(editingAgent?.name || '');
  const [businessName, setBusinessName] = useState(
    editingAgent?.businessName || defaultBusinessName
  );
  const [websiteUrl, setWebsiteUrl] = useState(editingAgent?.websiteUrl || '');
  const [welcomeMessage, setWelcomeMessage] = useState(
    editingAgent?.welcomeMessage || ''
  );
  const [description, setDescription] = useState(editingAgent?.description || '');
  const [status, setStatus] = useState<AgentStatus>(editingAgent?.status || 'Active');
  const [personality, setPersonality] = useState<AgentPersonality>(
    editingAgent?.personality || 'Friendly'
  );
  const [customInstructions, setCustomInstructions] = useState(
    editingAgent?.customInstructions ||
      'Greet website visitors politely, answer questions accurately using indexed knowledge, and invite them to share their name and email if follow-up is needed.'
  );
  const [voiceId, setVoiceId] = useState(editingAgent?.voiceId || VOICE_OPTIONS[0].id);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!previewingVoiceId) return;
    const timer = window.setTimeout(() => {
      setPreviewingVoiceId(null);
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [previewingVoiceId]);

  const selectedVoice =
    VOICE_OPTIONS.find((v) => v.id === voiceId) || VOICE_OPTIONS[0];

  const validateStep = (targetStep: number): boolean => {
    const nextErrors: Record<string, string> = {};
    if (targetStep === 1) {
      if (!name.trim()) nextErrors.name = 'Agent name is required.';
      if (!businessName.trim()) nextErrors.businessName = 'Business name is required.';
      if (!description.trim()) {
        nextErrors.description = 'Add a short description of what this agent handles.';
      }
    }
    if (targetStep === 2) {
      if (customInstructions.trim().length < 15) {
        nextErrors.customInstructions =
          'Provide at least 15 characters of instructions to guide the agent.';
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(4, s + 1));
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || submitting) return;

    const voiceLabel = `${selectedVoice.name} · ${selectedVoice.gender} · ${selectedVoice.language}`;
    setSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        businessName: businessName.trim(),
        description: description.trim(),
        websiteUrl: websiteUrl.trim(),
        welcomeMessage:
          welcomeMessage.trim() ||
          `Hi! Ask me anything about ${businessName.trim()}.`,
        status,
        personality,
        customInstructions: customInstructions.trim(),
        voiceId: selectedVoice.id,
        voiceLabel,
        language: selectedVoice.language,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVoicePreview = (voice: VoiceOption) => {
    if (previewingVoiceId === voice.id) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPreviewingVoiceId(null);
      return;
    }

    setPreviewingVoiceId(voice.id);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(voice.sampleLine);
      utterance.rate = 1.0;
      utterance.pitch = voice.gender === 'Female' ? 1.2 : voice.gender === 'Male' ? 0.8 : 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find((v) => v.lang.includes('en')) || voices[0];
      if (matchingVoice) utterance.voice = matchingVoice;

      utterance.onend = () => setPreviewingVoiceId(null);
      utterance.onerror = () => setPreviewingVoiceId(null);

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPreviewingVoiceId(null), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <div>
          <h2
            id="agent-wizard-title"
            className="text-base font-semibold text-neutral-900 dark:text-neutral-100"
          >
            {editingAgent ? `Edit ${editingAgent.name}` : 'Create Voice Chatbot'}
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            Step {step} of {STEPS.length} — {STEPS[step - 1].title}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close wizard"
          className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Stepper */}
      <div className="border-b border-neutral-200 bg-neutral-50/70 px-6 py-3 dark:border-neutral-800 dark:bg-neutral-950/40">
        <ol className="grid grid-cols-4 gap-2">
          {STEPS.map((item) => {
            const completed = step > item.id;
            const current = step === item.id;
            return (
              <li key={item.id} className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    if (item.id < step) setStep(item.id);
                  }}
                  disabled={item.id > step}
                  className={`flex items-center gap-2 text-left transition-opacity ${
                    item.id > step ? 'cursor-default opacity-60' : 'cursor-pointer'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums ${
                      completed
                        ? 'bg-emerald-600 text-white'
                        : current
                          ? 'bg-indigo-600 text-white'
                          : 'border border-neutral-300 bg-white text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'
                    }`}
                  >
                    {completed ? <Check className="h-3.5 w-3.5" /> : item.id}
                  </span>
                  <span
                    className={`truncate text-xs font-medium ${
                      current
                        ? 'text-neutral-900 dark:text-neutral-100'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    {item.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="agent-name"
                  className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
                >
                  Chatbot name
                </label>
                <input
                  id="agent-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Website Concierge"
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="business-name"
                    className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
                  >
                    Business name
                  </label>
                  <input
                    id="business-name"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., Acme SaaS"
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {errors.businessName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="website-url"
                    className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
                  >
                    Website URL
                  </label>
                  <input
                    id="website-url"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourbusiness.com"
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="agent-description"
                  className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
                >
                  Description
                </label>
                <textarea
                  id="agent-description"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what questions this website voice chatbot will answer..."
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="welcome-message"
                  className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
                >
                  Widget greeting message
                </label>
                <input
                  id="welcome-message"
                  type="text"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Hi! Tap the microphone and ask anything about our pricing or features."
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
              </div>

              <div>
                <span className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Chatbot status
                </span>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(['Active', 'Draft', 'Inactive'] as AgentStatus[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setStatus(option)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                        status === option
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              <div>
                <span className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Conversation personality
                </span>
                <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {PERSONALITIES.map((item) => {
                    const active = personality === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPersonality(item.id)}
                        className={`rounded-xl border p-3.5 text-left transition-colors ${
                          active
                            ? 'border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/40'
                            : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {item.title}
                          </span>
                          {active && (
                            <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                          {item.summary}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="custom-instructions"
                    className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
                  >
                    Custom instructions
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {INSTRUCTION_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.label}
                        type="button"
                        onClick={() => setCustomInstructions(tpl.text)}
                        className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-800/70 dark:text-neutral-300 dark:hover:bg-neutral-800 whitespace-nowrap"
                      >
                        <Sparkles className="h-3 w-3" />
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  id="custom-instructions"
                  rows={5}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Define greeting style, escalation boundaries, and key questions to ask callers..."
                  className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
                {errors.customInstructions && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {errors.customInstructions}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Select a voice profile for your website chatbot.
                </p>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Click Preview to listen
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {VOICE_OPTIONS.map((voice) => {
                  const selected = voice.id === voiceId;
                  const isPreviewing = previewingVoiceId === voice.id;
                  return (
                    <div
                      key={voice.id}
                      onClick={() => setVoiceId(voice.id)}
                      role="radio"
                      aria-checked={selected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setVoiceId(voice.id);
                        }
                      }}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-colors ${
                        selected
                          ? 'border-indigo-600 bg-indigo-50/60 dark:border-indigo-500 dark:bg-indigo-950/35'
                          : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                              {voice.name}
                            </span>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              {voice.gender} · {voice.language}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                            {voice.tone} ({voice.accent})
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVoicePreview(voice);
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                            isPreviewing
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800'
                          }`}
                        >
                          {isPreviewing ? (
                            <>
                              <Pause className="h-3 w-3" />
                              Playing
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3" />
                              Preview
                            </>
                          )}
                        </button>
                      </div>

                      {isPreviewing && (
                        <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-neutral-100 px-2.5 py-2 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                          <Volume2 className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                          <span className="truncate italic">&ldquo;{voice.sampleLine}&rdquo;</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/60">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Agent Information
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    Edit
                  </button>
                </div>
                <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-neutral-500 dark:text-neutral-400">Name</dt>
                    <dd className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500 dark:text-neutral-400">Business</dt>
                    <dd className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {businessName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500 dark:text-neutral-400">Status</dt>
                    <dd className="mt-0.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {status}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-neutral-500 dark:text-neutral-400">Description</dt>
                    <dd className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-300">
                      {description}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/60">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Personality & Instructions
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    Edit
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    <UserCheck className="mr-1.5 inline h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    {personality} tone
                  </p>
                  <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {customInstructions}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/60">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Voice Profile
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    Edit
                  </button>
                </div>
                <div className="mt-2.5 flex items-center gap-2.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  <Mic className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    {selectedVoice.name} · {selectedVoice.gender} · {selectedVoice.language}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50/70 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-950/40">
        <button
          type="button"
          onClick={step === 1 ? onClose : handleBack}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 whitespace-nowrap shrink-0"
        >
          {step === 1 ? (
            'Cancel'
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              Back
            </>
          )}
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 whitespace-nowrap shrink-0"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            <Check className="h-4 w-4" />
            {submitting
              ? editingAgent
                ? 'Saving...'
                : 'Creating...'
              : editingAgent
                ? 'Save Changes'
                : 'Create Chatbot'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function AgentWizardModal() {
  const {
    wizardOpen,
    editingAgent,
    closeWizard,
    activeWorkspace,
    addAgent,
    updateAgent,
    pushToast,
  } = useApp();

  if (!wizardOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 p-3 sm:p-6 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-wizard-title"
    >
      <AgentWizardForm
        key={`${editingAgent?.id || 'new'}_${activeWorkspace?.id || 'none'}`}
        editingAgent={editingAgent}
        defaultBusinessName={activeWorkspace?.name || ''}
        onClose={closeWizard}
        onSave={async (payload) => {
          try {
            if (editingAgent) {
              await updateAgent(editingAgent.id, payload);
              pushToast({
                title: 'Voice chatbot updated',
                description: `${payload.name} changes saved to Firestore.`,
                variant: 'success',
              });
            } else {
              await addAgent(payload);
              pushToast({
                title: 'Voice chatbot created',
                description: `${payload.name} is saved in your workspace.`,
                variant: 'success',
              });
            }
            closeWizard();
          } catch (err) {
            pushToast({
              title: 'Save failed',
              description:
                err instanceof Error ? err.message : 'Unable to save voice chatbot.',
              variant: 'error',
            });
          }
        }}
      />
    </div>
  );
}
