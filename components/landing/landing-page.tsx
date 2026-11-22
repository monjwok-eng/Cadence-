'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Compass,
  Minus,
  Plus,
  X,
} from 'lucide-react';
import heroImg from '@/src/assets/images/hero_parloa_landscape_1795166054480.jpg';
import testimonialCyclistImg from '@/src/assets/images/testimonial_golden_cyclist_1795171532393.jpg';
import testimonialHorizonImg from '@/src/assets/images/testimonial_golden_horizon_1795171532435.jpg';
import { useApp } from '@/components/providers/app-provider';
import { BrandLoader } from '@/components/ui/brand-loader';
import { CookieConsentBanner } from '@/components/ui/cookie-consent-banner';

const BUILDER_PROMPTS = [
  'Train a voice chatbot on https://acme-saas.com and our pricing PDF so visitors can ask questions aloud',
  'Customize the floating widget color, welcome message, and Powered by Cadence launcher for our storefront',
  'Capture visitor name and email during voice chats and route every lead straight to our Leads inbox',
];

const TESTIMONIALS = [
  {
    quote:
      '“Visitors get spoken answers sourced directly from our docs in seconds—and qualified leads land straight in our team inbox.”',
    author: 'Daniel Aslet, Director of Applied AI Strategy, Transformation, and Training',
    company: 'Waterfield Tech',
    image: testimonialCyclistImg,
    alt: 'Warm golden-hour editorial portrait along a sunlit avenue',
  },
  {
    quote:
      '“We pasted our website URL, uploaded our onboarding guides, and embedded our voice chatbot across every landing page in one afternoon.”',
    author: 'Elena Rostova, VP of Customer Operations',
    company: 'Spotnana',
    image: testimonialHorizonImg,
    alt: 'Warm golden-hour coastal sunset over calm water',
  },
];

const IMPACT_STATS = [
  { metric: '70%', label: 'faster answers for website visitors' },
  { metric: '3X', label: 'more qualified leads captured' },
  { metric: '1-Line', label: 'script install on any website' },
];

const PRICING_TIERS = [
  {
    name: 'Starter',
    audience: 'For early-stage websites',
    price: '$49',
    unit: '/mo',
    limits: [
      'Up to 3 voice chatbots',
      '500 visitor voice chats/mo',
      '2 websites with domain allowlists',
      'Embeddable "Powered by Cadence" widget',
    ],
    featured: false,
  },
  {
    name: 'Growth',
    audience: 'For scaling businesses',
    price: '$199',
    unit: '/mo',
    limits: [
      'Up to 15 voice chatbots',
      '3,000 visitor voice chats/mo',
      'Website URL crawling + PDF/DOCX uploads',
      'Lead capture inbox & role governance',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    audience: 'For multi-site organizations',
    price: 'Custom',
    unit: '',
    limits: [
      'Unlimited voice chatbots & domains',
      'Custom CRM webhooks & SLA',
      'Multi-workspace RBAC governance',
      'Dedicated onboarding & security review',
    ],
    featured: false,
  },
];

const FOOTER_COLUMNS = [
  {
    heading: 'Platform',
    links: [
      { label: 'Overview', href: '#platform' },
      { label: 'Chatbot Builder', href: '/agents' },
      { label: 'Knowledge Sources', href: '/knowledge-base' },
      { label: 'Embed & Install', href: '/embed' },
      { label: 'Conversation Logs', href: '/calls' },
      { label: 'Leads Inbox', href: '/leads' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Analytics', href: '/analytics' },
    ],
  },
  {
    heading: 'Solutions',
    links: [
      { label: 'Website Voice Support', href: '#difference' },
      { label: 'Product & Pricing Q&A', href: '#difference' },
      { label: 'Visitor Lead Capture', href: '#results' },
      { label: 'E-Commerce Guided Buying', href: '#results' },
      { label: 'Docs & Help Center Voice', href: '#difference' },
      { label: 'Multi-Language Websites', href: '#difference' },
    ],
  },
  {
    heading: 'Industries',
    links: [
      { label: 'SaaS & B2B Software', href: '#trusted' },
      { label: 'E-Commerce & Retail', href: '#trusted' },
      { label: 'Healthcare & Clinics', href: '#trusted' },
      { label: 'Financial Services', href: '#trusted' },
      { label: 'Real Estate', href: '#trusted' },
      { label: 'Travel & Hospitality', href: '#trusted' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Customer Stories', href: '#trusted' },
      { label: 'How It Works', href: '#difference' },
      { label: 'Conversion Impact', href: '#results' },
      { label: 'Voice Chat Test', href: '/voice-test' },
      { label: 'Website Training', href: '/knowledge-base' },
    ],
  },
  {
    heading: 'Relationships',
    links: [
      { label: 'Customers', href: '#trusted' },
      { label: 'Partners', href: '#platform' },
      { label: 'Enterprise Teams', href: '#pricing' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Cadence', href: '#platform' },
      { label: 'Workspace Settings', href: '/settings' },
      { label: 'Login', href: '/login' },
      { label: 'Reset Password', href: '/forgot-password' },
    ],
  },
  {
    heading: 'Cadence Studio',
    links: [
      { label: 'Overview', href: '/dashboard' },
      { label: 'Voice Chatbots', href: '/agents' },
      { label: 'Embed Script', href: '/embed' },
      { label: 'Captured Leads', href: '/leads' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy policy', href: '#newsletter' },
      { label: 'Account sign in', href: '/login' },
      { label: 'Domain Security & RBAC', href: '#difference' },
      { label: 'Terms & Policies', href: '#newsletter' },
    ],
  },
];

function BrandMark({ className = 'h-7 w-8' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 12.5C5 6.5 11 3.5 19.5 3.5C24.5 3.5 27.5 6 27.5 9.2C27.5 12.1 24.2 13.8 19.5 13.8C14.2 13.8 10.2 12.2 6.2 14.2C5.4 14.6 5 13.8 5 12.5Z"
        fill="currentColor"
      />
      <path
        d="M27 15.5C27 21.5 21 24.5 12.5 24.5C7.5 24.5 4.5 22 4.5 18.8C4.5 15.9 7.8 14.2 12.5 14.2C17.8 14.2 21.8 15.8 25.8 13.8C26.6 13.4 27 14.2 27 15.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LandingPage() {
  const router = useRouter();
  const { authReady, firebaseUser, openCookieSettings } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenuItem, setExpandedMenuItem] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const [promptIndex, setPromptIndex] = useState(0);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    if (authReady && firebaseUser) {
      router.replace('/dashboard');
    }
  }, [authReady, firebaseUser, router]);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    const handleScroll = () => {
      const currentY = Math.max(0, window.scrollY);
      setIsScrolled(currentY > 36);

      if (currentY <= 36) {
        setNavVisible(true);
        lastScrollYRef.current = currentY;
        return;
      }

      const delta = currentY - lastScrollYRef.current;
      if (delta > 6 && currentY > 72) {
        setNavVisible(false);
        lastScrollYRef.current = currentY;
      } else if (delta < -6) {
        setNavVisible(true);
        lastScrollYRef.current = currentY;
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterError('');
    if (!newsletterEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail.trim())) {
      setNewsletterError('Enter a valid business email address.');
      return;
    }
    if (!newsletterConsent) {
      setNewsletterError('Please confirm consent to subscribe to updates.');
      return;
    }
    setNewsletterSubscribed(true);
  };

  if (!authReady || firebaseUser) {
    return <BrandLoader />;
  }

  return (
    <div className="min-h-screen bg-white text-[#14110f] antialiased">
      {/* Header — Transparent over hero, hides on scroll down, returns white on scroll up */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[transform,background-color,color,border-color] duration-200 ease-out ${
          navVisible || mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        } ${
          isScrolled
            ? 'bg-white text-[#14110f] border-b border-[#f0eee9]'
            : 'bg-transparent text-white'
        }`}
      >
        <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between gap-8 px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className={`flex items-center gap-2.5 whitespace-nowrap shrink-0 transition-colors ${
              isScrolled ? 'text-[#14110f]' : 'text-white'
            }`}
          >
            <BrandMark
              className={`h-7 w-8 transition-colors ${
                isScrolled ? 'text-[#14110f]' : 'text-white'
              }`}
            />
            <span className="font-display text-[22px] sm:text-[23px] font-semibold tracking-[-0.025em]">
              Cadence
            </span>
          </Link>

          <nav
            aria-label="Landing navigation"
            className="hidden items-center gap-8 md:flex"
          >
            <a
              href="#platform"
              className={`text-[15px] font-light transition-colors whitespace-nowrap shrink-0 ${
                isScrolled
                  ? 'text-[#14110f]/80 hover:text-[#14110f]'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Platform
            </a>
            <a
              href="#difference"
              className={`text-[15px] font-light transition-colors whitespace-nowrap shrink-0 ${
                isScrolled
                  ? 'text-[#14110f]/80 hover:text-[#14110f]'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Difference
            </a>
            <a
              href="#results"
              className={`text-[15px] font-light transition-colors whitespace-nowrap shrink-0 ${
                isScrolled
                  ? 'text-[#14110f]/80 hover:text-[#14110f]'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Results
            </a>
            <a
              href="#pricing"
              className={`text-[15px] font-light transition-colors whitespace-nowrap shrink-0 ${
                isScrolled
                  ? 'text-[#14110f]/80 hover:text-[#14110f]'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-5 shrink-0">
            <Link
              href="/login"
              className={`text-[15px] font-light transition-colors whitespace-nowrap shrink-0 ${
                isScrolled
                  ? 'text-[#14110f] hover:opacity-75'
                  : 'text-white/95 hover:text-white'
              }`}
            >
              Login
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className={`flex h-11 w-10 items-center justify-end transition-opacity hover:opacity-80 md:hidden ${
                isScrolled ? 'text-[#14110f]' : 'text-white'
              }`}
            >
              <svg
                className="h-5 w-7"
                viewBox="0 0 28 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <line x1="1" y1="3" x2="27" y2="3" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
                <line x1="1" y1="10" x2="27" y2="10" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
                <line x1="1" y1="17" x2="27" y2="17" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen White Hamburger Menu — Parloa Style */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className="fixed inset-0 z-50 flex flex-col bg-white text-[#14110f] md:hidden"
        >
          <div className="flex h-[70px] shrink-0 items-center justify-between px-5 sm:px-8">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 text-[#14110f] whitespace-nowrap shrink-0"
            >
              <BrandMark className="h-7 w-8 text-[#14110f]" />
              <span className="font-display text-[22px] font-semibold tracking-[-0.025em] text-[#14110f]">
                Cadence
              </span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setExpandedMenuItem(null);
              }}
              aria-label="Close menu"
              className="flex h-11 w-10 items-center justify-end text-[#14110f] transition-opacity hover:opacity-70"
            >
              <X className="h-6 w-6 stroke-[1.35]" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 pt-2 sm:px-8">
            <div className="divide-y divide-[#e8e6e1] border-b border-[#e8e6e1]">
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedMenuItem((prev) => (prev === 'platform' ? null : 'platform'))
                  }
                  aria-expanded={expandedMenuItem === 'platform'}
                  className="flex w-full items-center justify-between py-5 text-left text-[19px] font-normal tracking-[-0.01em] text-[#14110f]"
                >
                  <span>Platform</span>
                  {expandedMenuItem === 'platform' ? (
                    <Minus className="h-5 w-5 stroke-[1.25] text-[#14110f]" />
                  ) : (
                    <Plus className="h-5 w-5 stroke-[1.25] text-[#14110f]" />
                  )}
                </button>
                {expandedMenuItem === 'platform' && (
                  <div className="flex flex-col gap-3 pb-5 pl-1 text-[15px] font-light text-neutral-600">
                    <a
                      href="#platform"
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-[#14110f]"
                    >
                      Overview
                    </a>
                    <a
                      href="#difference"
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-[#14110f]"
                    >
                      Chatbot Builder
                    </a>
                    <Link
                      href="/knowledge-base"
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-[#14110f]"
                    >
                      Website &amp; Docs Training
                    </Link>
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedMenuItem((prev) => (prev === 'solutions' ? null : 'solutions'))
                  }
                  aria-expanded={expandedMenuItem === 'solutions'}
                  className="flex w-full items-center justify-between py-5 text-left text-[19px] font-normal tracking-[-0.01em] text-[#14110f]"
                >
                  <span>Solutions</span>
                  {expandedMenuItem === 'solutions' ? (
                    <Minus className="h-5 w-5 stroke-[1.25] text-[#14110f]" />
                  ) : (
                    <Plus className="h-5 w-5 stroke-[1.25] text-[#14110f]" />
                  )}
                </button>
                {expandedMenuItem === 'solutions' && (
                  <div className="flex flex-col gap-3 pb-5 pl-1 text-[15px] font-light text-neutral-600">
                    <a
                      href="#difference"
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-[#14110f]"
                    >
                      Website Voice Support
                    </a>
                    <a
                      href="#results"
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-[#14110f]"
                    >
                      Visitor Lead Capture
                    </a>
                    <a
                      href="#trusted"
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-[#14110f]"
                    >
                      Customer Stories
                    </a>
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedMenuItem((prev) => (prev === 'resources' ? null : 'resources'))
                  }
                  aria-expanded={expandedMenuItem === 'resources'}
                  className="flex w-full items-center justify-between py-5 text-left text-[19px] font-normal tracking-[-0.01em] text-[#14110f]"
                >
                  <span>Resources</span>
                  {expandedMenuItem === 'resources' ? (
                    <Minus className="h-5 w-5 stroke-[1.25] text-[#14110f]" />
                  ) : (
                    <Plus className="h-5 w-5 stroke-[1.25] text-[#14110f]" />
                  )}
                </button>
                {expandedMenuItem === 'resources' && (
                  <div className="flex flex-col gap-3 pb-5 pl-1 text-[15px] font-light text-neutral-600">
                    <a
                      href="#results"
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-[#14110f]"
                    >
                      Performance Impact
                    </a>
                    <a
                      href="#pricing"
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-[#14110f]"
                    >
                      Pricing
                    </a>
                  </div>
                )}
              </div>

              <div>
                <Link
                  href="/agents"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-between py-5 text-left text-[19px] font-normal tracking-[-0.01em] text-[#14110f]"
                >
                  <span>Cadence Studio</span>
                </Link>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedMenuItem((prev) => (prev === 'account' ? null : 'account'))
                  }
                  aria-expanded={expandedMenuItem === 'account'}
                  className="flex w-full items-center justify-between py-5 text-left text-[19px] font-normal tracking-[-0.01em] text-[#14110f]"
                >
                  <span>Account</span>
                  {expandedMenuItem === 'account' ? (
                    <Minus className="h-5 w-5 stroke-[1.25] text-[#14110f]" />
                  ) : (
                    <Plus className="h-5 w-5 stroke-[1.25] text-[#14110f]" />
                  )}
                </button>
                {expandedMenuItem === 'account' && (
                  <div className="flex flex-col gap-3 pb-5 pl-1 text-[15px] font-light text-neutral-600">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-[#14110f]"
                    >
                      Login
                    </Link>
                    <Link
                      href="/forgot-password"
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-[#14110f]"
                    >
                      Reset password
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </nav>

          <div className="mt-auto px-5 pb-6 pt-4 sm:px-8">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full rounded-[6px] bg-[#f3f1ed] py-4 text-center text-[15px] font-medium text-[#14110f] transition-colors hover:bg-[#e8e4dd]"
            >
              Explore the platform
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section — Full-bleed golden-hour motion-blur backdrop with bottom-left editorial serif & orange CTA */}
      <section
        id="platform"
        className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-[#14110f]"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImg}
            alt="Warm golden-hour motion-blurred countryside landscape"
            fill
            priority
            referrerPolicy="no-referrer"
            className="object-cover object-center scale-[1.03]"
          />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14110f] via-[#14110f]/70 via-32% to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-12 pt-28 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
          <div className="max-w-[350px] sm:max-w-[540px] lg:max-w-[700px]">
            <h1
              className="font-serif font-normal tracking-[-0.03em] text-white"
              style={{
                fontSize: 'clamp(2.65rem, 5.4vw, 4.85rem)',
                lineHeight: 1.03,
              }}
            >
              AI voice chatbots trained on your website, ready in minutes.
            </h1>

            <div className="mt-7">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-[6px] bg-[#f94c1f] px-5 py-3 text-[15px] font-normal text-white transition-colors hover:bg-[#e13f15] whitespace-nowrap"
              >
                Create your voice chatbot
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Monochrome Enterprise Brand Logos — Clean white editorial transition */}
      <section aria-label="Enterprise brands" className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-3 items-center justify-items-center gap-x-6 gap-y-7 md:grid-cols-6">
            {/* Booking.com */}
            <div
              aria-label="Booking.com"
              className="select-none text-[16px] sm:text-[17px] font-bold tracking-[-0.03em] text-[#524d47]"
            >
              Booking<span className="font-semibold text-[#6b655f]">.com</span>
            </div>

            {/* BER Flughafen Berlin Brandenburg */}
            <div
              aria-label="BER Flughafen Berlin Brandenburg"
              className="inline-flex select-none items-center gap-1.5 text-left text-[#524d47]"
            >
              <span className="text-[18px] sm:text-[19px] font-extrabold tracking-[-0.04em] leading-none">
                BER
              </span>
              <span className="flex flex-col text-[6.5px] font-medium leading-[1.15] tracking-[0.04em] text-[#6b655f]">
                <span>FLUGHAFEN</span>
                <span>BERLIN</span>
                <span>BRANDENBURG</span>
              </span>
            </div>

            {/* SAP */}
            <div
              aria-label="SAP"
              className="inline-flex h-[26px] w-[54px] select-none items-center justify-start bg-[#524d47] pl-2 pr-3 [clip-path:polygon(0_0,100%_0,68%_100%,0_100%)]"
            >
              <span className="text-[14px] font-black italic tracking-[-0.05em] leading-none text-white">
                SAP
              </span>
            </div>

            {/* SPOTNANA */}
            <div
              aria-label="Spotnana"
              className="select-none text-[15px] sm:text-[16px] font-bold tracking-[0.04em] text-transparent [-webkit-text-stroke:0.8px_#524d47]"
            >
              SPOTNANA
            </div>

            {/* fever */}
            <div
              aria-label="Fever"
              className="select-none text-[21px] sm:text-[22px] font-extrabold tracking-[-0.05em] leading-none text-[#524d47]"
            >
              fever
            </div>

            {/* Allianz */}
            <div
              aria-label="Allianz"
              className="inline-flex select-none items-center gap-1.5 text-[#524d47]"
            >
              <span className="text-[16px] sm:text-[17px] font-bold tracking-[-0.03em] leading-none">
                Allianz
              </span>
              <span
                aria-hidden="true"
                className="inline-flex h-[18px] w-[18px] items-center justify-center gap-[2px] rounded-full border-[1.5px] border-[#524d47] px-[3px]"
              >
                <span className="h-[8px] w-[1.5px] bg-[#524d47]" />
                <span className="h-[10px] w-[1.5px] bg-[#524d47]" />
                <span className="h-[8px] w-[1.5px] bg-[#524d47]" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* The Difference — White editorial showcase matching Parloa pillars */}
      <section id="difference" className="bg-white pb-20 pt-8 sm:pb-28 sm:pt-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="font-mono text-[13.5px] font-normal tracking-[0.02em] text-[#1c1714]">
              The Difference
            </p>
            <h2
              className="mt-4 font-serif font-normal tracking-[-0.03em] text-[#14110f]"
              style={{
                fontSize: 'clamp(2.6rem, 4.8vw, 4rem)',
                lineHeight: 1.03,
                textWrap: 'balance',
              }}
            >
              Turn your website URL into a live voice chatbot.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-14 lg:grid-cols-3 lg:gap-8">
            {/* Pillar 1 — Orange gradient card with floating Chatbot Builder composer */}
            <div>
              <div className="flex aspect-[1/1.02] items-center justify-center rounded-[8px] bg-[linear-gradient(145deg,#e93c11_0%,#f56a1b_48%,#f2a738_100%)] p-6 sm:p-8">
                <div className="w-[90%] max-w-[300px] rounded-[8px] bg-white p-4 shadow-[0_18px_48px_rgba(120,30,0,0.2)]">
                  <div className="flex items-center gap-2.5 text-[12px] font-normal text-[#1c1714]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-[#f4f2ee] text-[#59544e]">
                      <Compass className="h-3.5 w-3.5" />
                    </span>
                    <span>Cadence Chatbot Builder</span>
                  </div>
                  <div className="mt-3 rounded-[6px] border border-[#e6e3dd] bg-white p-3.5">
                    <p className="min-h-[60px] text-[12px] font-light leading-[1.48] text-[#1c1714]">
                      {BUILDER_PROMPTS[promptIndex]}
                    </p>
                    <div className="mt-2.5 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          setPromptIndex((prev) => (prev + 1) % BUILDER_PROMPTS.length)
                        }
                        aria-label="Preview next chatbot prompt"
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-[#b9b4ac] bg-[#f5f3ef] text-[#3a3531] transition-colors hover:border-[#14110f] hover:text-[#14110f]"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="mt-5 text-[18px] font-normal tracking-[-0.015em] text-[#14110f]">
                1. Train on your website &amp; docs.
              </h3>
              <p className="mt-2.5 text-[15px] font-light leading-[1.55] text-[#4a4540]">
                Enter your website URL, upload PDFs, DOCX, or FAQs, and choose a voice personality and greeting in a guided 4-step studio.
              </p>
            </div>

            {/* Pillar 2 — Misty slate-blue glass gradient with Knowledge Sync progress */}
            <div>
              <div className="flex aspect-[1/1.02] flex-col items-center justify-center rounded-[8px] bg-[radial-gradient(circle_at_25%_75%,#cfd6df_0%,#93a0ae_48%,#646b7d_100%)] p-6 sm:p-8">
                <div className="flex items-center gap-2 text-[12.5px] font-light text-white/95 tabular-nums">
                  <CheckCircle2 className="h-4 w-4 stroke-[1.35] text-white/80" />
                  <span>Website Knowledge Sync 100% Ready</span>
                </div>
                <div className="mt-3.5 h-[14px] w-[80%] max-w-[260px] overflow-hidden rounded-full border border-white/45 bg-white/10 p-[2px]">
                  <div className="h-full w-full rounded-full bg-white" />
                </div>
              </div>
              <h3 className="mt-5 text-[18px] font-normal tracking-[-0.015em] text-[#14110f]">
                2. Customize appearance &amp; test live.
              </h3>
              <p className="mt-2.5 text-[15px] font-light leading-[1.55] text-[#4a4540]">
                Style your voice widget’s accent color, theme, and position, speak with it in the test playground, and publish with Powered by Cadence branding.
              </p>
            </div>

            {/* Pillar 3 — Deep obsidian-plum gradient with glowing pale-ice orb */}
            <div>
              <div className="relative flex aspect-[1/1.02] flex-col items-center justify-center overflow-hidden rounded-[8px] bg-[radial-gradient(circle_at_75%_25%,#4e4254_0%,#24212e_52%,#111116_100%)] p-6 sm:p-8">
                <div className="absolute right-5 top-5 text-right text-[11px] font-normal leading-tight text-white/45">
                  <p>1-Line Embed &amp;</p>
                  <p>Lead Capture</p>
                </div>
                <div className="h-20 w-20 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ffffff_0%,#c7ddf7_55%,#8fb0de_100%)] shadow-[0_0_50px_rgba(185,215,255,0.28)]" />
              </div>
              <h3 className="mt-5 text-[18px] font-normal tracking-[-0.015em] text-[#14110f]">
                3. Embed anywhere &amp; monitor leads.
              </h3>
              <p className="mt-2.5 text-[15px] font-light leading-[1.55] text-[#4a4540]">
                Copy one script snippet onto WordPress, Shopify, React, or HTML, enforce allowed domains, and review every transcript and captured lead.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by Leading Brands — Matches The Difference font scale, container width, and full-bleed mobile peek */}
      <section id="trusted" className="bg-white pb-20 pt-2 sm:pb-28 overflow-x-clip">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <h2
              className="font-serif font-normal tracking-[-0.03em] text-[#14110f]"
              style={{
                fontSize: 'clamp(2.6rem, 4.8vw, 4rem)',
                lineHeight: 1.03,
                textWrap: 'balance',
              }}
            >
              Trusted by leading brands.
            </h2>

            <div className="mt-6 flex flex-wrap items-center gap-y-2 text-[14.5px] text-[#14110f] tabular-nums">
              <div className="flex items-center gap-2.5">
                <span className="font-light text-[#2b2623]">Website Voice Studio</span>
                <span className="font-normal text-[#14110f]">4-Step</span>
              </div>
              <span
                className="mx-5 h-4 w-px bg-[#dcd7ce]"
                aria-hidden="true"
              />
              <div className="flex items-center gap-2.5">
                <span className="font-light text-[#2b2623]">Embed Snippet</span>
                <span className="font-normal text-[#14110f]">1-Line Install</span>
              </div>
            </div>
          </div>

          <div className="-mx-5 mt-10 flex gap-4 overflow-x-auto px-5 pb-2 snap-x snap-mandatory sm:-mx-8 sm:px-8 md:mx-0 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:px-0 md:pb-0">
            {TESTIMONIALS.map((item) => (
              <div
                key={item.author}
                className="relative aspect-[4/4.8] w-[85vw] max-w-[420px] shrink-0 snap-start overflow-hidden rounded-[8px] bg-[#2a2118] sm:w-[440px] md:aspect-[4/4.4] md:w-auto md:max-w-none"
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  referrerPolicy="no-referrer"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/80" />
                <div className="relative z-10 flex h-full flex-col justify-between p-7 text-white sm:p-9">
                  <p className="max-w-lg text-[16.5px] font-light leading-[1.48] text-white sm:text-[19.5px]">
                    {item.quote}
                  </p>
                  <div className="pt-6">
                    <p className="text-[14px] font-normal leading-snug text-white">
                      {item.author}
                    </p>
                    <p className="mt-1 text-[13.5px] font-light text-white/70">
                      {item.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section — Full-bleed warm orange-amber gradient */}
      <section
        id="results"
        className="bg-[linear-gradient(180deg,#e6370f_0%,#f05a16_45%,#efa02e_100%)] py-20 text-white sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <h2
              className="font-serif font-normal tracking-[-0.03em] text-white"
              style={{
                fontSize: 'clamp(2.55rem, 4.6vw, 3.85rem)',
                lineHeight: 1.03,
                textWrap: 'balance',
              }}
            >
              Results teams see with Cadence.
            </h2>
            <p className="mt-5 text-[15.5px] font-light leading-[1.55] text-white/95">
              Turn passive website traffic into spoken answers and qualified pipeline. Track visitor conversations, resolution rates, and captured leads in real time.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-[5px] bg-white px-5 py-3 text-[14.5px] font-normal text-[#14110f] transition-colors hover:bg-neutral-100 whitespace-nowrap"
              >
                Build your chatbot
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-[5px] border border-white/65 bg-transparent px-5 py-3 text-[14.5px] font-normal text-white transition-colors hover:bg-white/10 whitespace-nowrap"
              >
                Open Cadence Studio
              </Link>
            </div>
          </div>

          <div className="mt-14 space-y-8 md:grid md:grid-cols-3 md:gap-10 md:space-y-0 md:border-t md:border-white/25 md:pt-10">
            {IMPACT_STATS.map((stat) => (
              <div key={stat.metric} className="flex items-baseline gap-6 md:block">
                <p className="w-[108px] shrink-0 font-serif text-[48px] font-normal leading-none tracking-[-0.02em] text-white tabular-nums sm:text-[56px] md:w-auto">
                  {stat.metric}
                </p>
                <p className="text-[15px] font-light text-white/90 md:mt-3">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section — Clean white editorial contrast */}
      <section id="pricing" className="bg-white py-20 text-[#14110f] sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <p className="font-mono text-[12.5px] font-normal tracking-wide text-[#f94c1f]">
              Transparent Plans
            </p>
            <h2
              className="mt-3 font-serif font-normal tracking-[-0.025em] text-[#14110f]"
              style={{
                fontSize: 'clamp(2.2rem, 3.8vw, 3.15rem)',
                lineHeight: 1.06,
                textWrap: 'balance',
              }}
            >
              Start free on Starter, scale as visitor conversations grow
            </h2>
            <p className="mt-4 text-[15px] font-light text-[#59544e]">
              Every workspace includes the 4-step Chatbot Builder, Website &amp; Docs Knowledge Base, Embed Studio, and Leads Inbox.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col justify-between rounded-[12px] border p-8 ${
                  tier.featured
                    ? 'border-[#f94c1f] bg-white'
                    : 'border-[#e8e5df] bg-white'
                }`}
              >
                <div>
                  <p className="text-xs font-light text-[#6b655f]">
                    {tier.audience}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-normal text-[#14110f]">
                    {tier.name}
                  </h3>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-serif text-[42px] font-normal leading-none text-[#14110f] tabular-nums">
                      {tier.price}
                    </span>
                    {tier.unit && (
                      <span className="text-xs font-light text-[#6b655f]">
                        {tier.unit}
                      </span>
                    )}
                  </div>
                  <ul className="mt-8 space-y-3 text-sm font-light text-[#3c3733]">
                    {tier.limits.map((lim) => (
                      <li key={lim} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#f94c1f]" />
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/login"
                  className={`mt-10 block w-full rounded-[6px] px-5 py-3 text-center text-sm font-normal transition-colors whitespace-nowrap ${
                    tier.featured
                      ? 'bg-[#f94c1f] text-white hover:bg-[#e13f15]'
                      : 'border border-[#dcd7ce] bg-white text-[#14110f] hover:bg-[#faf8f5]'
                  }`}
                >
                  Start with Starter
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* White Editorial Newsletter & Structured Footer — Parloa Style */}
      <footer id="newsletter" className="border-t border-[#f0eee9] bg-white text-[#14110f]">
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-16 sm:px-8 lg:px-12">
          {/* Top Newsletter Row */}
          <div className="max-w-md">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-[#14110f] whitespace-nowrap"
            >
              <BrandMark className="h-7 w-8 text-[#14110f]" />
              <span className="font-display text-[22px] font-semibold tracking-[-0.025em]">
                Cadence
              </span>
            </Link>

            <h2
              className="mt-8 font-serif font-normal tracking-[-0.025em] text-[#14110f]"
              style={{
                fontSize: 'clamp(2.35rem, 3.8vw, 2.85rem)',
                lineHeight: 1.05,
              }}
            >
              Subscribe to our news.
            </h2>

            {newsletterSubscribed ? (
              <div className="mt-6 flex items-center gap-2.5 rounded-[6px] border border-[#e5e2dc] bg-[#faf8f5] px-4 py-4 text-[14px] font-light text-[#14110f]">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4f6f18]" />
                <span>
                  Subscribed {newsletterEmail.trim()} to Cadence updates.
                </span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} noValidate className="mt-6 space-y-3">
                <div>
                  <label htmlFor="newsletter-email" className="sr-only">
                    Business E-Mail
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      if (newsletterError) setNewsletterError('');
                    }}
                    placeholder="Business E-Mail"
                    className="h-[46px] w-full rounded-[6px] bg-[#f1efec] px-4 text-[14px] font-light text-[#14110f] placeholder:text-[#a29b93] focus:outline-none focus:ring-2 focus:ring-[#1e1815]/20"
                  />
                </div>

                <button
                  type="submit"
                  className="h-[46px] w-full rounded-[6px] bg-[#1e1815] px-5 text-[14.5px] font-normal text-white transition-colors hover:bg-[#2f2723]"
                >
                  Subscribe to newsletter
                </button>

                <label className="flex items-start gap-3 pt-2 text-[12.5px] font-light leading-[1.5] text-[#5c5650] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newsletterConsent}
                    onChange={(e) => {
                      setNewsletterConsent(e.target.checked);
                      if (newsletterError) setNewsletterError('');
                    }}
                    className="mt-0.5 h-[18px] w-[18px] shrink-0 rounded-[4px] border border-[#e2ded7] bg-[#f4f2ef] accent-[#1e1815]"
                  />
                  <span>
                    I am happy to receive Cadence&apos;s latest news &amp; updates on a regular basis. By submitting the form, you acknowledge our Privacy Policy. You can revoke this consent at any time.*
                  </span>
                </label>

                {newsletterError && (
                  <p className="text-xs text-rose-600">{newsletterError}</p>
                )}
              </form>
            )}
          </div>

          {/* Structured 8-Group Directory Grid (2-column mobile pairs, 4-column desktop) */}
          <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-4">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.heading}>
                <p className="text-[17px] font-normal tracking-[-0.01em] text-[#14110f]">
                  {col.heading}
                </p>
                <ul className="mt-5 space-y-3.5 text-[14.5px] font-light leading-snug text-[#4a4540]">
                  {col.links.map((item) => (
                    <li key={item.label}>
                      {item.href.startsWith('#') ? (
                        <a
                          href={item.href}
                          className="hover:text-[#14110f] transition-colors"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className="hover:text-[#14110f] transition-colors"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Social, Language & Copyright */}
          <div className="mt-16 pt-4">
            <div className="flex items-center gap-6 text-[17px] font-normal text-[#14110f]">
              <a href="#platform" className="hover:opacity-75 transition-opacity">
                LinkedIn
              </a>
              <a href="#platform" className="hover:opacity-75 transition-opacity">
                X
              </a>
            </div>
            <p className="mt-5 text-[13.5px] font-normal text-[#14110f]">
              EN <span className="mx-1 text-[#b5afa8]">/</span>{' '}
              <span className="text-[#8a837b]">DE</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] font-light text-[#6b655f]">
              <p>© All rights reserved Cadence 2026</p>
              <button
                type="button"
                onClick={openCookieSettings}
                className="underline decoration-[#c8c2b9] underline-offset-4 transition-colors hover:text-[#14110f]"
              >
                Cookie preferences
              </button>
            </div>
          </div>
        </div>
      </footer>

      <CookieConsentBanner />
    </div>
  );
}
