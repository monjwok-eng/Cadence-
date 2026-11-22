'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  Globe,
  MessageSquare,
  PhoneMissed,
  Plus,
  UserPlus,
  X,
} from 'lucide-react';
import { useApp } from '@/components/providers/app-provider';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton, TableSkeleton } from '@/components/ui/skeleton';
import { CallOutcome, CallRecord } from '@/lib/types';

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function outcomeLabel(status: CallOutcome): string {
  if (status === 'lead_captured') return 'Lead Captured';
  if (status === 'completed') return 'Completed';
  if (status === 'voicemail') return 'Callback Requested';
  return 'Dropped';
}

export function OverviewView() {
  const {
    isReady,
    user,
    activeWorkspace,
    agents,
    calls,
    leads,
    knowledgeSources,
    openCreateWizard,
  } = useApp();
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const activeCount = agents.filter((a) => a.status === 'Active').length;
  const totalConversations = calls.length;
  const totalDurationSec = calls.reduce((acc, c) => acc + c.durationSeconds, 0);
  const avgDurationSec = totalConversations > 0 ? Math.round(totalDurationSec / totalConversations) : 0;
  const totalLeads = Math.max(
    leads.length,
    calls.filter((c) => c.callStatus === 'lead_captured').length
  );
  const embeddedSitesCount = agents.filter(
    (a) => Boolean(a.websiteUrl?.trim()) || (a.allowedDomains?.length ?? 0) > 0
  ).length;
  const maxAgentConversations = Math.max(1, ...agents.map((a) => a.callsCount));

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {activeWorkspace?.name || 'Workspace'} · Website voice chatbots, training sources, and visitor leads
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/embed"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 whitespace-nowrap shrink-0"
          >
            Embed &amp; Install
          </Link>
          <Link
            href="/voice-test"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 whitespace-nowrap shrink-0"
          >
            Voice Chat Test
          </Link>
          <button
            type="button"
            onClick={openCreateWizard}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" />
            Create Chatbot
          </button>
        </div>
      </div>

      {/* KPI Row */}
      {!isReady ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="mt-3 h-7 w-20" />
              <Skeleton className="mt-2 h-3 w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Voice Chatbots
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 tabular-nums dark:text-neutral-100">
              {agents.length}
            </p>
            <p className="mt-1 text-xs text-neutral-500 tabular-nums dark:text-neutral-400">
              {activeCount} active · {embeddedSitesCount} with website URLs
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Knowledge Sources
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 tabular-nums dark:text-neutral-100">
              {knowledgeSources.length}
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {knowledgeSources.length === 0 ? 'Add website URLs or docs' : 'Indexed & ready for RAG'}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Conversations
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 tabular-nums dark:text-neutral-100">
              {totalConversations.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-neutral-500 tabular-nums dark:text-neutral-400">
              {totalConversations > 0
                ? `Avg ${formatDuration(avgDurationSec)} per chat`
                : 'Test live in Voice Playground'}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Leads Captured
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 tabular-nums dark:text-neutral-100">
              {totalLeads.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-neutral-500 tabular-nums dark:text-neutral-400">
              {totalConversations > 0 ? ((totalLeads / totalConversations) * 100).toFixed(1) : '0.0'}% visitor conversion
            </p>
          </div>
        </div>
      )}

      {/* Main Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Recent Conversations */}
        <section className="lg:col-span-7">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Recent Conversations
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Voice sessions logged across your website chatbots
              </p>
            </div>
            <Link
              href="/calls"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 whitespace-nowrap"
            >
              All logs
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {!isReady ? (
            <TableSkeleton rows={4} />
          ) : calls.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No conversations yet"
              description="Create a voice chatbot, train it on your website URL or documents, and test a live spoken conversation."
              actionLabel="Create Chatbot"
              onAction={openCreateWizard}
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-medium text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-400">
                      <th className="px-4 py-2.5">Visitor</th>
                      <th className="px-4 py-2.5">Chatbot</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {calls.slice(0, 5).map((call) => (
                      <tr
                        key={call.id}
                        onClick={() => setSelectedCall(call)}
                        className="cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            {call.callerName}
                          </p>
                          <p className="text-xs text-neutral-500 tabular-nums dark:text-neutral-400">
                            {call.phoneNumber || 'Website Widget'} · {call.timestamp}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-700 dark:text-neutral-300">
                          {call.agentName}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                              call.callStatus === 'lead_captured'
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : call.callStatus === 'completed'
                                  ? 'text-indigo-700 dark:text-indigo-400'
                                  : call.callStatus === 'voicemail'
                                    ? 'text-amber-700 dark:text-amber-400'
                                    : 'text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            {call.callStatus === 'lead_captured' ? (
                              <UserPlus className="h-3.5 w-3.5" />
                            ) : call.callStatus === 'completed' ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : call.callStatus === 'voicemail' ? (
                              <Globe className="h-3.5 w-3.5" />
                            ) : (
                              <PhoneMissed className="h-3.5 w-3.5" />
                            )}
                            {outcomeLabel(call.callStatus)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-neutral-600 tabular-nums dark:text-neutral-400">
                          {formatDuration(call.durationSeconds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Chatbot Performance Overview */}
        <section className="lg:col-span-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Chatbot Performance
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Conversations handled and leads captured per chatbot
              </p>
            </div>
            <Link
              href="/agents"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 whitespace-nowrap"
            >
              Manage
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {!isReady ? (
            <TableSkeleton rows={4} />
          ) : agents.length === 0 ? (
            <EmptyState
              icon={Bot}
              title="No chatbots in this workspace"
              description="Create your first AI voice chatbot with your website URL, custom greeting, and voice personality."
              actionLabel="Create Chatbot"
              onAction={openCreateWizard}
            />
          ) : (
            <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
              {agents.slice(0, 5).map((agent) => {
                const pct = Math.round((agent.callsCount / maxAgentConversations) * 100);
                return (
                  <div key={agent.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {agent.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
                          {agent.websiteUrl || agent.businessName} · {agent.voiceLabel}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-neutral-900 tabular-nums dark:text-neutral-100">
                          {agent.callsCount} chats
                        </p>
                        <p className="text-xs text-neutral-500 tabular-nums dark:text-neutral-400">
                          {agent.leadsCaptured} leads
                        </p>
                      </div>
                    </div>
                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
                        style={{ width: `${Math.max(pct, agent.callsCount > 0 ? 6 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Call Detail Drawer */}
      {selectedCall && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-neutral-950/40"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex h-full w-full max-w-md flex-col border-l border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {selectedCall.callerName}
                </h3>
                <p className="text-xs text-neutral-500 tabular-nums dark:text-neutral-400">
                  {selectedCall.phoneNumber} · {selectedCall.timestamp}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCall(null)}
                aria-label="Close call details"
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-xs dark:border-neutral-800 dark:bg-neutral-950">
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400">Agent</span>
                  <p className="mt-0.5 font-medium text-neutral-900 dark:text-neutral-100">
                    {selectedCall.agentName}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400">Duration</span>
                  <p className="mt-0.5 flex items-center gap-1 font-mono font-medium text-neutral-900 tabular-nums dark:text-neutral-100">
                    <Clock className="h-3 w-3 text-neutral-400" />
                    {formatDuration(selectedCall.durationSeconds)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Transcript
                </h4>
                <div className="mt-2.5 rounded-lg border border-neutral-200 bg-neutral-50/70 p-3.5 text-sm leading-relaxed whitespace-pre-wrap text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-300">
                  {selectedCall.transcript || 'No transcript recorded for this call.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
