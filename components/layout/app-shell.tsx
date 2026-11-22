'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  Check,
  ChevronsUpDown,
  Code2,
  LayoutDashboard,
  LogOut,
  MailCheck,
  Menu,
  MessageSquare,
  Mic,
  Moon,
  Plus,
  Puzzle,
  RefreshCw,
  Settings,
  Sun,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import { useApp } from '@/components/providers/app-provider';
import { AgentWizardModal } from '@/components/agents/agent-wizard-modal';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { BrandLoader, BrandMark } from '@/components/ui/brand-loader';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/agents', label: 'Voice Chatbots', icon: Bot },
  { href: '/knowledge-base', label: 'Knowledge Sources', icon: BookOpen },
  { href: '/voice-test', label: 'Voice Chat Test', icon: Mic },
  { href: '/embed', label: 'Embed & Install', icon: Code2 },
  { href: '/calls', label: 'Conversation Logs', icon: MessageSquare },
  { href: '/leads', label: 'Leads', icon: UserPlus },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/integrations', label: 'Integrations', icon: Puzzle },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;

const PUBLIC_ROUTES = ['/', '/login', '/forgot-password', '/reset-password', '/embed/widget'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    authReady,
    isReady,
    firebaseUser,
    isEmailVerified,
    backendError,
    theme,
    toggleTheme,
    user,
    workspaces,
    activeWorkspace,
    setActiveWorkspaceId,
    createWorkspace,
    openCreateWizard,
    logout,
    resendVerificationEmail,
    refreshAuthUser,
    pushToast,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [newWorkspaceModal, setNewWorkspaceModal] = useState(false);
  const [wsName, setWsName] = useState('');
  const [wsIndustry, setWsIndustry] = useState('');
  const [creatingWs, setCreatingWs] = useState(false);
  const [verifyingCheck, setVerifyingCheck] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const isPublicRoute =
    pathname === '/' ||
    PUBLIC_ROUTES.some((route) => route !== '/' && pathname.startsWith(route));

  useEffect(() => {
    if (!isPublicRoute && authReady && !firebaseUser) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isPublicRoute, authReady, firebaseUser, pathname, router]);

  if (isPublicRoute) {
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  if (!authReady || !firebaseUser) {
    return <BrandLoader themeAware />;
  }

  if (!isEmailVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-950">
        <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <MailCheck className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Verify your email address
          </h1>
          <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
            We sent a verification link to{' '}
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {firebaseUser.email}
            </span>
            . Confirm your email before accessing your workspace.
          </p>

          <div className="mt-6 space-y-2.5">
            <button
              type="button"
              disabled={verifyingCheck}
              onClick={async () => {
                setVerifyingCheck(true);
                try {
                  const verified = await refreshAuthUser();
                  if (!verified) {
                    pushToast({
                      title: 'Not verified yet',
                      description: 'Please click the link in your inbox, then try again.',
                    });
                  } else {
                    pushToast({ title: 'Email verified', variant: 'success' });
                  }
                } catch (err) {
                  pushToast({
                    title: 'Check failed',
                    description:
                      err instanceof Error ? err.message : 'Unable to verify status.',
                    variant: 'error',
                  });
                } finally {
                  setVerifyingCheck(false);
                }
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${verifyingCheck ? 'animate-spin' : ''}`}
              />
              I verified my email — continue
            </button>

            <button
              type="button"
              disabled={resendingEmail}
              onClick={async () => {
                setResendingEmail(true);
                try {
                  await resendVerificationEmail();
                  pushToast({
                    title: 'Verification email sent',
                    description: `Check ${firebaseUser.email} (including spam).`,
                    variant: 'success',
                  });
                } catch (err) {
                  pushToast({
                    title: 'Unable to send email',
                    description:
                      err instanceof Error ? err.message : 'Try again shortly.',
                    variant: 'error',
                  });
                } finally {
                  setResendingEmail(false);
                }
              }}
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              {resendingEmail ? 'Sending...' : 'Resend verification email'}
            </button>

            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
              className="w-full rounded-lg px-4 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              Sign out and use a different account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentNav =
    NAV_ITEMS.find((item) =>
      item.href === '/dashboard'
        ? pathname === '/dashboard'
        : pathname.startsWith(item.href)
    ) || NAV_ITEMS[0];

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName.trim() || creatingWs) return;
    setCreatingWs(true);
    try {
      await createWorkspace(wsName, wsIndustry);
      setWsName('');
      setWsIndustry('');
      setNewWorkspaceModal(false);
      setWorkspaceMenuOpen(false);
    } catch (err) {
      pushToast({
        title: 'Failed to create workspace',
        description: err instanceof Error ? err.message : 'Try again.',
        variant: 'error',
      });
    } finally {
      setCreatingWs(false);
    }
  };

  const handleSignOut = async () => {
    setProfileMenuOpen(false);
    await logout();
    router.push('/login');
  };

  const SidebarContent = (
    <div className="flex h-full flex-col bg-white dark:bg-neutral-950">
      {/* Brand */}
      <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 text-neutral-900 dark:text-neutral-100 whitespace-nowrap shrink-0"
          onClick={() => setMobileMenuOpen(false)}
        >
          <BrandMark className="h-6 w-7 text-indigo-600 dark:text-indigo-400" />
          <span className="font-display text-base font-semibold tracking-tight">
            Cadence
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation"
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 lg:hidden dark:hover:bg-neutral-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Workspace Switcher */}
      <div className="relative border-b border-neutral-200 p-3 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => {
            setWorkspaceMenuOpen((o) => !o);
            setProfileMenuOpen(false);
          }}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-neutral-50/80 px-3 py-2 text-left transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/80"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-xs font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
              {activeWorkspace?.name?.[0]?.toUpperCase() || 'W'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {activeWorkspace?.name || 'Loading workspace...'}
              </p>
              <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                {activeWorkspace ? `${activeWorkspace.planName} Plan` : 'Initializing'}
              </p>
            </div>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
        </button>

        {workspaceMenuOpen && (
          <div className="absolute left-3 right-3 top-full z-30 mt-1.5 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
            <p className="px-2.5 py-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              Workspaces
            </p>
            <div className="space-y-0.5">
              {workspaces.map((ws) => {
                const active = ws.id === activeWorkspace?.id;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => {
                      setActiveWorkspaceId(ws.id);
                      setWorkspaceMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                      active
                        ? 'bg-neutral-100 font-semibold text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                        : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {active && (
                      <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-1 border-t border-neutral-200 pt-1 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setWorkspaceMenuOpen(false);
                  setNewWorkspaceModal(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
              >
                <Plus className="h-3.5 w-3.5" />
                Create workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        aria-label="Primary navigation"
        className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                active
                  ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800/90 dark:text-neutral-100'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  active
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-neutral-400 dark:text-neutral-500'
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Menu */}
      <div className="relative border-t border-neutral-200 p-3 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => {
            setProfileMenuOpen((o) => !o);
            setWorkspaceMenuOpen(false);
          }}
          className="flex w-full items-center justify-between gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
              {user?.initials || 'U'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {user?.fullName || firebaseUser.displayName || 'Account'}
              </p>
              <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                {user?.email || firebaseUser.email}
              </p>
            </div>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
        </button>

        {profileMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 z-30 mb-2 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
            <Link
              href="/settings"
              onClick={() => {
                setProfileMenuOpen(false);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <User className="h-3.5 w-3.5 text-neutral-400" />
              Profile &amp; Workspace Settings
            </Link>
            <button
              type="button"
              onClick={() => {
                toggleTheme();
                setProfileMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              {theme === 'light' ? (
                <Moon className="h-3.5 w-3.5 text-neutral-400" />
              ) : (
                <Sun className="h-3.5 w-3.5 text-neutral-400" />
              )}
              Switch to {theme === 'light' ? 'Dark' : 'Light'} theme
            </button>
            <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-neutral-200 lg:block dark:border-neutral-800">
        <div className="sticky top-0 h-screen">{SidebarContent}</div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-neutral-950/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-50 w-72 max-w-[85vw] border-r border-neutral-200 dark:border-neutral-800">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-neutral-200 bg-white/95 px-4 backdrop-blur-xs sm:px-6 lg:px-8 dark:border-neutral-800 dark:bg-neutral-950/95">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-100 lg:hidden dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="hidden truncate text-neutral-500 sm:inline dark:text-neutral-400">
                {activeWorkspace?.name || 'Workspace'}
              </span>
              <span className="hidden text-neutral-300 sm:inline dark:text-neutral-700">
                /
              </span>
              <span className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                {currentNav.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={openCreateWizard}
              disabled={!isReady || !activeWorkspace}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Chatbot
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {backendError && (
              <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{backendError}</span>
              </div>
            )}
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>
      </div>

      <AgentWizardModal />

      {/* New Workspace Modal */}
      {newWorkspaceModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleCreateWorkspace}
            className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <Building2 className="h-4 w-4" />
                </span>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Create Workspace
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setNewWorkspaceModal(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Workspace name
                </label>
                <input
                  type="text"
                  required
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  placeholder="e.g., Summit Property Group"
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Industry
                </label>
                <input
                  type="text"
                  value={wsIndustry}
                  onChange={(e) => setWsIndustry(e.target.value)}
                  placeholder="e.g., Real Estate"
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setNewWorkspaceModal(false)}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingWs}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {creatingWs ? 'Creating...' : 'Create Workspace'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
