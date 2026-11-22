'use client';

import React, { useMemo, useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Globe,
  Save,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useApp } from '@/components/providers/app-provider';
import { CadenceBotFaceIcon } from '@/components/embed/cadence-bot-icon';
import { VoiceWidgetPopup } from '@/components/embed/voice-widget-popup';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { VoiceAgent, WidgetPosition, WidgetTheme } from '@/lib/types';

const COLOR_PRESETS = ['#2563eb', '#4f46e5', '#f94c1f', '#0f172a', '#059669'];

type InstallPlatform = 'html' | 'react' | 'wordpress' | 'shopify';

export function EmbedView() {
  const { isReady, agents, openCreateWizard } = useApp();
  const [selectedId, setSelectedId] = useState<string>('');

  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === selectedId) || agents[0] || null,
    [agents, selectedId]
  );

  if (!isReady) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (agents.length === 0 || !selectedAgent) {
    return (
      <div className="space-y-6">
        <div className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Embed &amp; Install
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Customize your floating website voice widget and copy the install snippet for your site.
          </p>
        </div>

        <EmptyState
          icon={Code2}
          title="No voice chatbots to embed yet"
          description="Create your first website voice chatbot first, then customize its floating launcher button and copy the live embed code here."
          actionLabel="Create Chatbot"
          onAction={openCreateWizard}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Embed &amp; Install
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Customize your floating circular chatbot launcher, test it live, and copy the embed script for any website.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label
            htmlFor="embed-agent-select"
            className="text-xs font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap"
          >
            Chatbot:
          </label>
          <select
            id="embed-agent-select"
            value={selectedAgent.id}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.businessName})
              </option>
            ))}
          </select>
        </div>
      </div>

      <EmbedEditor key={selectedAgent.id} selectedAgent={selectedAgent} />
    </div>
  );
}

function EmbedEditor({ selectedAgent }: { selectedAgent: VoiceAgent }) {
  const { knowledgeSources, updateAgent, pushToast } = useApp();
  const [platform, setPlatform] = useState<InstallPlatform>('html');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [websiteUrl, setWebsiteUrl] = useState(selectedAgent.websiteUrl || '');
  const [launcherLabel, setLauncherLabel] = useState(
    selectedAgent.launcherLabel || 'Talk with us'
  );
  const [welcomeMessage, setWelcomeMessage] = useState(
    selectedAgent.welcomeMessage ||
      `Hi! Ask me anything about ${selectedAgent.businessName}.`
  );
  const [accentColor, setAccentColor] = useState(
    selectedAgent.accentColor || '#2563eb'
  );
  const [widgetPosition, setWidgetPosition] = useState<WidgetPosition>(
    selectedAgent.widgetPosition || 'bottom-right'
  );
  const [widgetTheme, setWidgetTheme] = useState<WidgetTheme>(
    selectedAgent.widgetTheme || 'light'
  );
  const [leadCaptureEnabled, setLeadCaptureEnabled] = useState(
    selectedAgent.leadCaptureEnabled ?? true
  );
  const [allowedDomainsInput, setAllowedDomainsInput] = useState(
    (selectedAgent.allowedDomains || []).join(', ')
  );

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://cadence.app';

  const safeAccent = /^#[0-9a-fA-F]{3,8}$/.test(accentColor.trim())
    ? accentColor.trim()
    : '#2563eb';

  const relevantKnowledgeItems = useMemo(
    () =>
      knowledgeSources
        .filter(
          (s) =>
            (s.agentId === selectedAgent.id || s.agentId === 'all' || !s.agentId) &&
            typeof s.content === 'string' &&
            s.content.trim().length > 0
        )
        .map((s) => ({
          sourceName: s.sourceName,
          sourceType: s.sourceType,
          content: s.content || '',
        })),
    [knowledgeSources, selectedAgent.id]
  );

  const embedSnippet = useMemo(() => {
    const id = selectedAgent.id || 'your_chatbot_id';
    if (platform === 'react') {
      return `import Script from 'next/script';\n\nexport function CadenceVoiceWidget() {\n  return (\n    <Script\n      src="${origin}/widget/${id}.js"\n      strategy="afterInteractive"\n    />\n  );\n}`;
    }
    if (platform === 'wordpress') {
      return `<!-- Paste before </body> in Appearance -> Theme File Editor (footer.php) or WPCode -->\n<script type="text/javascript">window.$cadence=[];(function(){var d=document;var s=d.createElement("script");s.src="${origin}/widget/${id}.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();</script>`;
    }
    if (platform === 'shopify') {
      return `<!-- Paste above </body> in Online Store -> Themes -> Edit Code -> theme.liquid -->\n<script type="text/javascript">window.$cadence=[];(function(){var d=document;var s=d.createElement("script");s.src="${origin}/widget/${id}.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();</script>`;
    }
    return `<script type="text/javascript">window.$cadence=[];(function(){var d=document;var s=d.createElement("script");s.src="${origin}/widget/${id}.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();</script>`;
  }, [origin, platform, selectedAgent.id]);

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(embedSnippet);
      setCopied(true);
      pushToast({
        title: 'Embed snippet copied',
        description:
          'Paste before </body> on your website to launch the floating voice chatbot.',
        variant: 'success',
      });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      pushToast({
        title: 'Copy failed',
        description: 'Select the snippet and copy manually.',
        variant: 'error',
      });
    }
  };

  const handleSaveWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const domains = allowedDomainsInput
        .split(/[\s,]+/)
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 20);
      await updateAgent(selectedAgent.id, {
        websiteUrl: websiteUrl.trim(),
        launcherLabel: launcherLabel.trim() || 'Talk with us',
        welcomeMessage:
          welcomeMessage.trim() ||
          `Hi! Ask me anything about ${selectedAgent.businessName}.`,
        accentColor: safeAccent,
        widgetPosition,
        widgetTheme,
        leadCaptureEnabled,
        allowedDomains: domains,
      });
      pushToast({
        title: 'Widget published & saved',
        description: `Updated live widget settings for ${selectedAgent.name}.`,
        variant: 'success',
      });
    } catch (err) {
      pushToast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Unable to update widget.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left: Widget Configuration */}
      <form
        onSubmit={handleSaveWidget}
        className="space-y-5 rounded-xl border border-neutral-200 bg-white p-6 lg:col-span-6 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Widget Appearance &amp; Behavior
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              Changes sync live to your embedded script on every website.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              selectedAgent.status === 'Active'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                selectedAgent.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            {selectedAgent.status === 'Active' ? 'Live on Web' : selectedAgent.status}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Target Website URL
          </label>
          <div className="relative mt-1.5">
            <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourcompany.com"
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Hover Greeting Tooltip
            </label>
            <input
              type="text"
              maxLength={60}
              value={launcherLabel}
              onChange={(e) => setLauncherLabel(e.target.value)}
              placeholder="Talk with us"
              className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Button &amp; Brand Color
            </label>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  aria-label={`Select accent color ${c}`}
                  style={{ backgroundColor: c }}
                  className={`h-7 w-7 rounded-md border transition-transform ${
                    accentColor.toLowerCase() === c
                      ? 'scale-110 border-neutral-900 ring-2 ring-indigo-500/40 dark:border-white'
                      : 'border-black/10'
                  }`}
                />
              ))}
              <input
                type="text"
                maxLength={20}
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-24 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 font-mono text-xs text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Welcome Greeting
          </label>
          <textarea
            rows={2}
            maxLength={500}
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Screen Position
            </label>
            <div className="mt-1.5 flex rounded-lg border border-neutral-200 bg-neutral-100/70 p-1 dark:border-neutral-800 dark:bg-neutral-950">
              {(['bottom-right', 'bottom-left'] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setWidgetPosition(pos)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    widgetPosition === pos
                      ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-100'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
                  }`}
                >
                  {pos === 'bottom-right' ? 'Bottom Right' : 'Bottom Left'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Widget Surface
            </label>
            <div className="mt-1.5 flex rounded-lg border border-neutral-200 bg-neutral-100/70 p-1 dark:border-neutral-800 dark:bg-neutral-950">
              {(['light', 'dark'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setWidgetTheme(mode)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                    widgetTheme === mode
                      ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-100'
                      : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Allowed Domains (Optional)
          </label>
          <input
            type="text"
            value={allowedDomainsInput}
            onChange={(e) => setAllowedDomainsInput(e.target.value)}
            placeholder="e.g., yourcompany.com, *.yourcompany.com"
            className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            Leave blank to allow any website, or specify hostnames to restrict loading.
          </p>
        </div>

        <label className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 text-sm dark:border-neutral-800">
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              Capture Visitor Leads
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Allow visitors to leave name, email &amp; phone inside the floating widget.
            </p>
          </div>
          <input
            type="checkbox"
            checked={leadCaptureEnabled}
            onChange={(e) => setLeadCaptureEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
          />
        </label>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 whitespace-nowrap"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Widget Settings'}
          </button>
        </div>
      </form>

      {/* Right: Real Embed Code + Interactive Floating Circular Widget Preview */}
      <div className="space-y-6 lg:col-span-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Website Install Code
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                Paste before &lt;/body&gt; on your live website. Your floating voice button loads automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopySnippet}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 whitespace-nowrap"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {(
              [
                { id: 'html', label: 'HTML' },
                { id: 'react', label: 'Next.js / React' },
                { id: 'wordpress', label: 'WordPress' },
                { id: 'shopify', label: 'Shopify' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPlatform(tab.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  platform === tab.id
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <pre className="mt-4 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-950 p-4 font-mono text-xs leading-relaxed text-neutral-100 dark:border-neutral-800">
            <code>{embedSnippet}</code>
          </pre>

          {selectedAgent.status !== 'Active' && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
              This chatbot is currently <strong>{selectedAgent.status}</strong>. Switch its status to <strong>Active</strong> in Voice Chatbots so external visitors can load it.
            </p>
          )}
        </div>

        {/* Live Interactive Website Canvas Preview */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Live Floating Widget Preview
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Tap the floating bot circle in the corner to open &amp; test voice chat.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen((o) => !o)}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              {previewOpen ? 'Minimize Widget' : 'Open Widget'}
            </button>
          </div>

          {/* Mini Browser Mock Site Canvas */}
          <div className="relative mt-4 h-[520px] w-full overflow-hidden rounded-xl border border-neutral-200 bg-[#f6f8fc] dark:border-neutral-800 dark:bg-neutral-950">
            {/* Browser Chrome Top */}
            <div className="flex items-center gap-2 border-b border-neutral-200/80 bg-white px-3.5 py-2 dark:border-neutral-800 dark:bg-neutral-900">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <div className="ml-2 flex-1 truncate rounded-md bg-neutral-100 px-2.5 py-1 font-mono text-[11px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                {websiteUrl.trim() || 'https://yourbusiness.com'}
              </div>
            </div>

            {/* Simulated Business Website Background Content */}
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {selectedAgent.businessName}
              </p>
              <h4 className="mt-2 max-w-xs text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                Welcome to {selectedAgent.businessName}
              </h4>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                Tap the floating Cadence voice chatbot button in the bottom corner to start a real voice or text conversation grounded in your trained website &amp; documents.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 max-w-sm">
                <div className="h-16 rounded-lg border border-neutral-200/70 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="h-2 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
                  <div className="mt-2 h-2 w-24 rounded bg-neutral-100 dark:bg-neutral-800/60" />
                </div>
                <div className="h-16 rounded-lg border border-neutral-200/70 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="h-2 w-14 rounded bg-neutral-200 dark:bg-neutral-800" />
                  <div className="mt-2 h-2 w-20 rounded bg-neutral-100 dark:bg-neutral-800/60" />
                </div>
              </div>
            </div>

            {/* Floating Expandable Voice Chatbot Panel */}
            {previewOpen && (
              <div
                className={`absolute bottom-20 z-20 h-[405px] w-[320px] max-w-[calc(100%-24px)] overflow-hidden rounded-2xl border shadow-2xl ${
                  widgetPosition === 'bottom-left' ? 'left-4' : 'right-4'
                } ${
                  widgetTheme === 'dark'
                    ? 'border-neutral-800 bg-neutral-950'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                <VoiceWidgetPopup
                  widget={{
                    id: selectedAgent.id,
                    name: selectedAgent.name,
                    businessName: selectedAgent.businessName,
                    voiceId: selectedAgent.voiceId,
                    voiceLabel: selectedAgent.voiceLabel,
                    language: selectedAgent.language,
                    welcomeMessage,
                    accentColor: safeAccent,
                    widgetTheme,
                    launcherLabel,
                    leadCaptureEnabled,
                    status: selectedAgent.status,
                  }}
                  hostDomain={
                    typeof window !== 'undefined' ? window.location.hostname : ''
                  }
                  sourcePageUrl={websiteUrl}
                  onClose={() => setPreviewOpen(false)}
                  fallbackInteractContext={{
                    agentConfig: {
                      name: selectedAgent.name,
                      businessName: selectedAgent.businessName,
                      personality: selectedAgent.personality,
                      customInstructions: selectedAgent.customInstructions,
                      language: selectedAgent.language,
                      websiteUrl: websiteUrl.trim() || selectedAgent.websiteUrl,
                    },
                    knowledgeItems: relevantKnowledgeItems,
                  }}
                />
              </div>
            )}

            {/* Floating Circular Bot Button (Tap to Open) */}
            <div
              className={`group absolute bottom-4 z-30 flex items-center gap-2.5 ${
                widgetPosition === 'bottom-left'
                  ? 'left-4 flex-row-reverse'
                  : 'right-4 flex-row'
              }`}
            >
              {!previewOpen && launcherLabel.trim() && (
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold shadow-md transition-opacity ${
                    widgetTheme === 'dark'
                      ? 'border border-neutral-800 bg-neutral-900 text-neutral-100'
                      : 'border border-neutral-200/80 bg-white text-neutral-800'
                  }`}
                >
                  {launcherLabel}
                </span>
              )}

              <button
                type="button"
                onClick={() => setPreviewOpen((o) => !o)}
                aria-label={
                  previewOpen
                    ? `Minimize ${selectedAgent.name}`
                    : `Open ${selectedAgent.name}`
                }
                style={{ backgroundColor: safeAccent }}
                className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-transform duration-150 hover:scale-105 active:scale-95"
              >
                {previewOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <CadenceBotFaceIcon
                    className="h-8 w-8 text-white"
                    eyeStroke={safeAccent}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
