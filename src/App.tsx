import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  LogOut,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  SunMedium,
  X,
  Menu,
  Wallet,
  Clock3,
  Copy,
  Check,
  Search,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Link, Redirect, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/pages/not-found';
import {
  auth,
  db,
  signInWithGoogle,
  signInWithGoogleRedirect,
  checkRedirectResult,
  logoutUser,
  onAuthStateChanged,
  type FirebaseUser,
} from './firebase';
import { doc, getDoc, collection, query, onSnapshot } from 'firebase/firestore';
import { CryptoPayCheckout } from './checkout/CryptoPayCheckout';
import { type PayoutOrder } from './checkout/types';
import { clearActiveCheckoutSession } from './checkout/services/accountStorage';
import { pollTelegramGlobalApproval } from './checkout/services/telegramService';
import {
  CinematicLightDust,
  CinematicAmbientGlow,
  PremiumBackgroundChorki,
  useScrollReveal,
} from '@/components/CinematicEffects';
import { ElectricCurrentHero } from '@/components/ElectricCurrentHero';
import { SeamlessVideoShowcase } from '@/components/SeamlessVideoShowcase';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

// -------------------------------------------------------------
// Authentication State Management (Firebase Auth + Firestore)
// -------------------------------------------------------------

export interface AppUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  provider: 'google' | 'password';
  lastLoginAt?: string;
}

interface AuthContextType {
  user: AppUserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogleAccount: () => Promise<FirebaseUser>;
  signOutAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  signInWithGoogleAccount: async () => {
    throw new Error('AuthProvider not initialized');
  },
  signOutAccount: async () => {},
});

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('coinbridge_saved_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkRedirectResult().catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        let cleanEmail = (
          fbUser.email ||
          fbUser.providerData?.[0]?.email ||
          auth.currentUser?.email ||
          auth.currentUser?.providerData?.[0]?.email ||
          ''
        ).toLowerCase().trim();

        try {
          const docSnap = await getDoc(doc(db, 'users', fbUser.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data?.email && !cleanEmail) {
              cleanEmail = (data.email as string).toLowerCase().trim();
            }
          }
        } catch {
          // ignore
        }

        const profileName =
          fbUser.displayName ||
          fbUser.providerData?.[0]?.displayName ||
          (cleanEmail ? cleanEmail.split('@')[0] : 'Google User');
        const photo = fbUser.photoURL || fbUser.providerData?.[0]?.photoURL || '';
        const providerType: 'google' | 'password' =
          fbUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'password';

        const profile: AppUserProfile = {
          uid: fbUser.uid,
          email: cleanEmail,
          displayName: profileName,
          photoURL: photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileName)}`,
          emailVerified: fbUser.emailVerified || providerType === 'google',
          provider: providerType,
          lastLoginAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setUser(profile);
        try {
          localStorage.setItem('coinbridge_saved_user', JSON.stringify(profile));
          if (cleanEmail) {
            localStorage.setItem('coinbridge_active_user_email', cleanEmail);
          }
        } catch {}
      } else {
        setUser(null);
        try {
          localStorage.removeItem('coinbridge_saved_user');
          localStorage.removeItem('coinbridge_active_user_email');
        } catch {}
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogleAccount = async () => {
    const fbUser = await signInWithGoogle();
    if (fbUser) {
      const cleanEmail = (
        fbUser.email ||
        fbUser.providerData?.[0]?.email ||
        auth.currentUser?.email ||
        auth.currentUser?.providerData?.[0]?.email ||
        ''
      ).toLowerCase().trim();
      const cleanName =
        fbUser.displayName ||
        fbUser.providerData?.[0]?.displayName ||
        (cleanEmail ? cleanEmail.split('@')[0] : 'Google User');
      const photo = fbUser.photoURL || fbUser.providerData?.[0]?.photoURL || '';
      const profile: AppUserProfile = {
        uid: fbUser.uid,
        email: cleanEmail,
        displayName: cleanName,
        photoURL: photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
        emailVerified: fbUser.emailVerified || true,
        provider: 'google',
        lastLoginAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      try {
        localStorage.setItem('coinbridge_saved_user', JSON.stringify(profile));
        if (cleanEmail) {
          localStorage.setItem('coinbridge_active_user_email', cleanEmail);
        }
      } catch {}
      setUser(profile);
    }
    return fbUser;
  };

  const signOutAccount = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    try {
      const oldEmail = (user?.email || auth.currentUser?.email || '').toLowerCase().trim();
      localStorage.removeItem('coinbridge_saved_user');
      localStorage.removeItem('coinbridge_active_user_email');
      localStorage.removeItem('coinbridge_all_orders');
      localStorage.removeItem('cb_orders_guest');
      if (oldEmail) {
        clearActiveCheckoutSession(oldEmail);
      }
      clearActiveCheckoutSession();
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signInWithGoogleAccount,
        signOutAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

// -------------------------------------------------------------
// Google Brand & Token Icons
// -------------------------------------------------------------

function UsdtIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 2000 2000" aria-hidden="true">
      <path
        fill="#26A17B"
        d="M1000 0c552.28 0 1000 447.72 1000 1000s-447.72 1000-1000 1000S0 1552.28 0 1000 447.72 0 1000 0z"
      />
      <path
        fill="#FFFFFF"
        d="M1150.3 759.6V562.9h324.9V400H524.8v162.9h324.9v196.7C594.3 770.8 400 812.5 400 862.6c0 50.1 194.3 91.8 449.7 103v434.4h300.6V965.6c255.4-11.2 449.7-52.9 449.7-103 0-50.1-194.3-91.8-449.7-103z"
      />
    </svg>
  );
}

function GoogleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

// -------------------------------------------------------------
// Brand Mark Component (CoinBridge)
// -------------------------------------------------------------

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1b2230] p-2 shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
        <svg viewBox="0 0 40 40" fill="none" className="h-6 w-6" aria-hidden="true">
          <defs>
            <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <path
            d="M15 11C9.5 11 5 15.5 5 21C5 26.5 9.5 31 15 31C19.5 31 23 27.5 25 23"
            stroke="url(#emeraldGrad)"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          <path
            d="M25 29C30.5 29 35 24.5 35 19C35 13.5 30.5 9 25 9C20.5 9 17 12.5 15 17"
            stroke="url(#goldGrad)"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          <rect
            x="16.5"
            y="16.5"
            width="7"
            height="7"
            rx="2"
            transform="rotate(45 20 20)"
            fill="#ffffff"
          />
          <circle cx="20" cy="20" r="1.6" fill="#1b2230" />
        </svg>
      </span>
      {!compact && (
        <span className="font-serif text-2xl font-bold tracking-tight text-[#252c3c]">
          CoinBridge
        </span>
      )}
    </Link>
  );
}

// -------------------------------------------------------------
// Google Sign-In Bottom Sheet Modal
// -------------------------------------------------------------

function GoogleSignInBottomSheet({
  isOpen,
  onClose,
  title = 'Sign in',
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}) {
  const { signInWithGoogleAccount } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const fbUser = await signInWithGoogleAccount();
      if (fbUser) {
        onClose();
        setLocation('/user-portal');
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setErrorMessage('');
        return;
      }
      if (err.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        const currentHost = window.location.hostname;
        setErrorMessage(
          `Domain "${currentHost}" is not authorized. In Firebase Console, go to Authentication > Settings > Authorized Domains and add this domain.`
        );
      } else if (err.code === 'auth/popup-blocked') {
        try {
          await signInWithGoogleRedirect();
          return;
        } catch {
          setErrorMessage('Popup was blocked by your browser. Please allow popups or redirects for this site.');
        }
      } else {
        setErrorMessage(err.message || 'Failed to authenticate with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-t-[36px] sm:rounded-3xl bg-white px-6 pt-4 pb-12 sm:pb-8 shadow-[0_-16px_50px_rgba(0,0,0,0.18)] border border-slate-100 animate-slide-up-sheet"
        role="dialog"
        aria-modal="true"
      >
        {/* Drag handle indicator */}
        <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto" />

        {/* Header */}
        <div className="flex items-center justify-between mt-3 mb-4">
          <span className="font-bold text-xl text-slate-900 tracking-tight">{title}</span>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-950 text-xs border border-amber-200 flex items-start gap-2.5 mb-4">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3.5 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3.5 px-4 shadow-sm transition-all cursor-pointer text-base disabled:opacity-60"
        >
          {loading ? (
            <RefreshCw className="h-5 w-5 animate-spin text-[#df725b]" />
          ) : (
            <GoogleIcon className="h-5.5 w-5.5 shrink-0" />
          )}
          <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Legal Policies Modal
// -------------------------------------------------------------

type LegalDocType = 'privacy' | 'terms' | 'aml' | 'risk';

function LegalModal({
  docType,
  onClose,
}: {
  docType: LegalDocType | null;
  onClose: () => void;
}) {
  if (!docType) return null;

  const contentMap: Record<LegalDocType, { title: string; subtitle: string; content: ReactNode }> = {
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'Last updated: September 2026',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-[#4f5866] leading-relaxed">
          <p>
            CoinBridge is dedicated to protecting your personal privacy. We only process data strictly necessary to execute cryptocurrency payouts and prevent unlawful transactions.
          </p>
          <p>
            Your account identifiers, receiving wallet information, and disbursement addresses are transmitted over encrypted transport layers and never shared with unauthorized third parties.
          </p>
        </div>
      ),
    },
    terms: {
      title: 'Terms of Service',
      subtitle: 'Last updated: September 2026',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-[#4f5866] leading-relaxed">
          <p>
            By accessing CoinBridge or utilizing our cryptocurrency conversion platform, you agree to be bound by these Terms of Service.
          </p>
          <p>
            You represent that the funds transferred originate from lawful sources and that you are the lawful owner of the receiving mobile banking account or bank details provided.
          </p>
        </div>
      ),
    },
    aml: {
      title: 'Anti-Money Laundering (AML)',
      subtitle: 'Regulatory Compliance Standard',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-[#4f5866] leading-relaxed">
          <p>
            All cryptocurrency transfers and fiat disbursements strictly adhere to international Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) regulations.
          </p>
          <p>
            Transactions exceeding designated thresholds or demonstrating unusual patterns are subject to manual compliance review and on-chain forensics scrutiny.
          </p>
        </div>
      ),
    },
    risk: {
      title: 'Risk Disclosure',
      subtitle: 'Market & Network Notice',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-[#4f5866] leading-relaxed">
          <p>
            Cryptocurrency transactions are irreversible once confirmed on the blockchain network.
          </p>
          <p>
            Please ensure you are transferring funds using the correct network and supported USDT contract to avoid unrecoverable loss of capital.
          </p>
        </div>
      ),
    },
  };

  const current = contentMap[docType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative flex flex-col w-full max-w-xl max-h-[85vh] rounded-2xl border border-[#ded5c6] bg-[#faf6eb] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#e2d8c7] px-6 py-4 bg-[#f5f1e8]">
          <div>
            <h3 className="text-lg font-bold text-[#252c3c] tracking-tight">{current.title}</h3>
            <p className="text-xs text-[#7a8391] font-medium">{current.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#667080] hover:bg-[#eae3d4] hover:text-[#252c3c] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 text-left">{current.content}</div>
        <div className="border-t border-[#e2d8c7] px-6 py-3 bg-[#f5f1e8] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#252c3c] px-4 py-1.5 text-xs font-semibold text-[#faf6eb] hover:bg-[#343d52] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Landing Page (Home)
// -------------------------------------------------------------

function Home({ initialAuthOpen = false, initialTitle = 'Sign in' }: { initialAuthOpen?: boolean; initialTitle?: string }) {
  const { user, loading } = useAuth();
  const [showAuthSheet, setShowAuthSheet] = useState(initialAuthOpen);
  const [authSheetTitle, setAuthSheetTitle] = useState(initialTitle);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType | null>(null);

  const heroRef = useScrollReveal();
  const processRef = useScrollReveal();
  const howRef = useScrollReveal();
  const coverageRef = useScrollReveal();

  useEffect(() => {
    if (initialAuthOpen) {
      setShowAuthSheet(true);
      setAuthSheetTitle(initialTitle);
    }
  }, [initialAuthOpen, initialTitle]);

  if (!loading && user) {
    return <Redirect to="/user-portal" />;
  }

  return (
    <main className="grain relative min-h-[100dvh] overflow-hidden bg-[#FAF9F5] text-slate-900 selection:bg-[#df725b]/20 selection:text-slate-900">
      <CinematicAmbientGlow />
      <PremiumBackgroundChorki />
      <CinematicLightDust />

      {/* Floating Architectural Header with generous space and frosted glass */}
      <header className="fixed top-3.5 sm:top-5 left-3 sm:left-8 right-3 sm:right-8 z-50 mx-auto max-w-7xl rounded-2xl sm:rounded-full border border-slate-200/80 bg-white/80 shadow-md backdrop-blur-xl">
        <div className="mx-auto flex w-full items-center justify-between px-4 py-3 sm:px-8 sm:py-3.5">
          {/* Left: Original CoinBridge Logo + Vertical Divider + Brand Name */}
          <Link href="/" className="group flex items-center gap-3 sm:gap-4 focus:outline-none">
            {/* CoinBridge Emerald & Gold Diamond Badge Logo */}
            <span className="relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1b2230] p-2 shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
              <svg viewBox="0 0 40 40" fill="none" className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true">
                <defs>
                  <linearGradient id="emeraldGradPill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="goldGradPill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
                <path
                  d="M15 11C9.5 11 5 15.5 5 21C5 26.5 9.5 31 15 31C19.5 31 23 27.5 25 23"
                  stroke="url(#emeraldGradPill)"
                  strokeWidth="3.6"
                  strokeLinecap="round"
                />
                <path
                  d="M25 29C30.5 29 35 24.5 35 19C35 13.5 30.5 9 25 9C20.5 9 17 12.5 15 17"
                  stroke="url(#goldGradPill)"
                  strokeWidth="3.6"
                  strokeLinecap="round"
                />
                <rect
                  x="16.5"
                  y="16.5"
                  width="7"
                  height="7"
                  rx="2"
                  transform="rotate(45 20 20)"
                  fill="#ffffff"
                />
                <circle cx="20" cy="20" r="1.6" fill="#1b2230" />
              </svg>
            </span>

            {/* Vertical Divider Line */}
            <span className="h-7 sm:h-8 w-[2px] bg-slate-200 rounded-full" />

            {/* Brand Title */}
            <span className="font-poppins font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
              CoinBridge
            </span>
          </Link>

          {/* Center Navigation Links (desktop) */}
          <nav className="hidden items-center gap-8 text-sm lg:text-base font-medium text-slate-600 md:flex">
            <a href="#coverage" className="relative py-1 transition-colors hover:text-[#5f22d9]">
              Coverage
            </a>
            <a href="#why" className="relative py-1 transition-colors hover:text-[#5f22d9]">
              Process
            </a>
            <a href="#how" className="relative py-1 transition-colors hover:text-[#5f22d9]">
              How It Works
            </a>
            <a href="#demo" className="relative py-1 transition-colors hover:text-[#5f22d9]">
              Demo
            </a>
          </nav>

          {/* Right: Vibrant Purple Pill Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAuthSheetTitle('Sign up');
                setShowAuthSheet(true);
              }}
              className="cinematic-sheen rounded-full bg-[#5f22d9] hover:bg-[#501bc0] hover:scale-[1.02] active:scale-[0.98] px-5 py-2 sm:px-6 sm:py-2.5 text-sm font-bold text-white shadow-md transition-all cursor-pointer"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* Large Panoramic Cinematic Hero Section */}
      <section
        ref={heroRef}
        className="reveal-section relative mx-auto max-w-7xl px-5 pt-32 sm:pt-40 lg:pt-44 pb-20 sm:pb-28 lg:pb-32 overflow-hidden"
      >
        {/* Top Editorial Kicker & Monumental Heading */}
        <div className="mx-auto max-w-4xl text-center mb-12 sm:mb-16">
          <div className="cinematic-paragraph-reveal inline-flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs backdrop-blur-md mb-6">
            <span className="h-2 w-2 rounded-full bg-[#df725b] animate-pulse" />
            <span>USDT &amp; Local Currency Service</span>
          </div>

          <h1 className="cinematic-heading-reveal font-poppins font-black text-[clamp(2.75rem,6.8vw,5.75rem)] leading-[1.05] text-slate-900 tracking-tight">
            <span className="block sm:inline">Select </span>
            <span className="block sm:inline">country &amp; </span>
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#df725b] via-[#ea580c] to-[#f59e0b] bg-clip-text text-transparent">
              local currency
            </span>
          </h1>

          {/* Primary Action Button & Security Micro-copy */}
          <div className="cinematic-button-reveal mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => {
                setAuthSheetTitle('Sign in');
                setShowAuthSheet(true);
              }}
              className="cinematic-sheen group inline-flex items-center gap-3 rounded-full bg-[#df725b] hover:bg-[#d05c45] px-8 py-4 text-base font-bold text-white shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Get started</span>
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </button>
            <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Secure • Direct local wallet payout</span>
            </span>
          </div>
        </div>

        {/* Cinematic Visual Arena: Large Showcase Pedestal + Asymmetrical Layered Card */}
        <div className="relative mx-auto max-w-6xl">
          {/* Subtle architectural background grid accent */}
          <div className="paper-grid absolute -right-6 -top-10 h-72 w-72 rounded-full opacity-35 sm:-right-12 sm:-top-14" />

          {/* Main Visual Arena Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-8 lg:gap-10 items-center">
            {/* Centerpiece Realistic Image with Dynamic Flowing Electric Current Conduits */}
            <div className="cinematic-image-reveal relative w-full">
              <ElectricCurrentHero />
            </div>

            {/* Asymmetrical Layered Cinematic Feature Card with Real Depth */}
            <div className="cinematic-card-reveal relative w-full">
              <div className="animate-float-soft relative min-h-[420px] sm:min-h-[460px] rounded-3xl lg:rounded-[2.5rem] border border-slate-200/90 bg-white/95 p-6 sm:p-8 shadow-xl backdrop-blur-xl flex flex-col justify-between">
                {/* Left accent indicator bar */}
                <div className="absolute left-0 top-12 h-24 w-1.5 rounded-r-full bg-[#df725b]" />

                {/* Card Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="font-mono text-[10px] uppercase tracking-[.2em] text-slate-500">
                    USDT / Local Payout
                  </span>
                  <SunMedium className="h-4 w-4 text-[#c95e4c]" />
                </div>

                <div className="flex h-[320px] sm:h-[350px] flex-col justify-between py-6 text-left">
                  <div>
                    <p className="font-mono text-xs text-slate-500">Instant Settlement</p>
                    <p className="mt-3.5 max-w-sm font-serif text-4xl sm:text-5xl lg:text-6xl leading-[.92] tracking-tight text-slate-900">
                      Crypto to native currency.
                    </p>
                  </div>

                  <div className="relative">
                    {/* Nested Verified Payout subcard */}
                    <div className="ml-auto max-w-[300px] rotate-[-2deg] rounded-2xl border border-slate-200/90 bg-white p-4 shadow-md">
                      <div className="mb-3.5 flex items-center justify-between">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-50 shadow-xs border border-slate-200/60">
                          <UsdtIcon className="h-5 w-5" />
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">VERIFIED PAYOUT</span>
                      </div>
                      <div className="space-y-2 text-xs text-slate-900">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>Exclusively USDT Networks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>Bank &amp; Mobile Wallet Delivery</span>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                        Funds arrive instantly through local payment services upon verification.
                      </p>
                    </div>

                    {/* Accent Sparkles badge */}
                    <div className="animate-breathe absolute -bottom-2 left-2 sm:left-4 grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl bg-amber-50 border border-amber-200/80 text-[#df725b] shadow-sm">
                      <Sparkles className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 01: Process (Asymmetrical Cinematic Editorial Layout) */}
      <section
        ref={processRef}
        id="why"
        className="reveal-section cinematic-divider-glow border-y border-slate-200/80 bg-[#f4f1ea] px-5 py-20 sm:px-8 lg:px-12 relative overflow-hidden"
      >
        <div className="pointer-events-none absolute right-[-6%] top-[15%] w-[450px] h-[450px] rounded-full bg-[#df725b]/10 blur-3xl" />
        <div className="mx-auto max-w-7xl relative z-10 text-left">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-20 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="cinematic-paragraph-reveal font-mono text-[11px] uppercase tracking-[.2em] text-[#df725b]">
                01 / Process
              </p>
              <h2 className="cinematic-heading-reveal mt-5 max-w-sm font-serif text-5xl leading-[.94] tracking-tight text-slate-900">
                Simple, accurate, and reliable.
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="cinematic-card cinematic-card-reveal cinematic-stagger-1 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                <span className="font-mono text-xs font-bold text-[#df725b]">01</span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">Select Country &amp; Currency</h3>
                <p className="mt-2.5 leading-relaxed text-sm text-slate-600">
                  Choose your country, select your local currency, and specify the exact payout amount you want to receive.
                </p>
              </div>

              <div className="cinematic-card cinematic-card-reveal cinematic-stagger-2 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                <span className="font-mono text-xs font-bold text-[#df725b]">02</span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">USDT Network Payment</h3>
                <p className="mt-2.5 leading-relaxed text-sm text-slate-600">
                  Send and confirm payment using only supported USDT networks for minimal fees and rapid processing.
                </p>
              </div>

              <div className="cinematic-card cinematic-card-reveal cinematic-stagger-3 sm:col-span-2 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                <span className="font-mono text-xs font-bold text-[#df725b]">03</span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">Direct Local Currency Payout</h3>
                <p className="mt-2.5 max-w-xl leading-relaxed text-sm text-slate-600">
                  Once the crypto transaction is verified on the network, local payment services immediately disburse your funds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 02: How It Works */}
      <section
        ref={howRef}
        id="how"
        className="reveal-section cinematic-divider-glow border-b border-slate-200/80 bg-white px-5 py-20 sm:px-8 lg:px-12 relative overflow-hidden"
      >
        <div className="pointer-events-none absolute left-[-6%] top-[25%] w-[500px] h-[500px] rounded-full bg-[#f8cf62]/10 blur-3xl" />
        <div className="mx-auto max-w-7xl relative z-10 text-left">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-20 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="cinematic-paragraph-reveal font-mono text-[11px] uppercase tracking-[.2em] text-[#df725b]">
                02 / Step-by-Step
              </p>
              <h2 className="cinematic-heading-reveal mt-5 max-w-sm font-serif text-5xl leading-[.94] tracking-tight text-slate-900">
                How settlement works.
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="cinematic-card cinematic-card-reveal cinematic-stagger-1 rounded-3xl border border-slate-200/90 bg-[#faf8f2] p-6 shadow-xs">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#df725b] to-[#ea580c] text-white font-bold text-sm shadow-xs">
                  1
                </span>
                <h3 className="mt-5 text-base font-bold text-slate-900">Select Currency &amp; Amount</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Select your country and local currency, then enter how much money you wish to receive.
                </p>
              </div>

              <div className="cinematic-card cinematic-card-reveal cinematic-stagger-2 rounded-3xl border border-slate-200/90 bg-[#faf8f2] p-6 shadow-xs">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#df725b] to-[#ea580c] text-white font-bold text-sm shadow-xs">
                  2
                </span>
                <h3 className="mt-5 text-base font-bold text-slate-900">USDT Payment Confirmation</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Transfer using only your preferred USDT network and confirm your payment details.
                </p>
              </div>

              <div className="cinematic-card cinematic-card-reveal cinematic-stagger-3 rounded-3xl border border-slate-200/90 bg-[#faf8f2] p-6 shadow-xs">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#df725b] to-[#ea580c] text-white font-bold text-sm shadow-xs">
                  3
                </span>
                <h3 className="mt-5 text-base font-bold text-slate-900">Receive in Native Currency</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Once the crypto payment is verified, your funds arrive directly in your chosen bank account, wallet, or payout service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Width Video Showcase right below How Settlement Works */}
      <SeamlessVideoShowcase />

      {/* Global Coverage & Network Scale Section */}
      <section
        ref={coverageRef}
        id="coverage"
        className="reveal-section cinematic-divider-glow border-t border-slate-200/80 bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-12 relative overflow-hidden"
      >
        <div className="pointer-events-none absolute right-[10%] top-[30%] w-[550px] h-[550px] rounded-full bg-[#a8c8bd]/15 blur-3xl" />
        <div className="mx-auto max-w-6xl relative z-10 text-center">
          <div className="mx-auto max-w-3xl text-center">
            <div className="cinematic-paragraph-reveal inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#df725b]" />
              Global Coverage &amp; Infrastructure
            </div>
            <h2 className="cinematic-heading-reveal font-poppins font-black text-3xl sm:text-5xl lg:text-[46px] text-slate-900 tracking-tight">
              Global coverage. Instant local settlement.
            </h2>
            <p className="cinematic-paragraph-reveal mt-3.5 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Enterprise-grade financial rails converting multi-chain stablecoin liquidity into direct local bank payouts across 100+ jurisdictions.
            </p>
          </div>

          <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
            {/* Stat 1 */}
            <div className="cinematic-card cinematic-card-reveal cinematic-stagger-1 flex flex-col items-center justify-center p-6 rounded-3xl bg-[#faf8f2] border border-slate-200/80 shadow-xs">
              <span className="font-poppins font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#df725b]">
                100+
              </span>
              <span className="mt-3 text-base sm:text-lg font-bold text-slate-900">Countries</span>
              <span className="mt-1 text-xs text-slate-500 font-medium">Worldwide global access</span>
            </div>

            {/* Stat 2 */}
            <div className="cinematic-card cinematic-card-reveal cinematic-stagger-2 flex flex-col items-center justify-center p-6 rounded-3xl bg-[#faf8f2] border border-slate-200/80 shadow-xs">
              <span className="font-poppins font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-emerald-600">
                20+
              </span>
              <span className="mt-3 text-base sm:text-lg font-bold text-slate-900">Payment Methods</span>
              <span className="mt-1 text-xs text-slate-500 font-medium">Bank transfer &amp; mobile wallets</span>
            </div>

            {/* Stat 3 */}
            <div className="cinematic-card cinematic-card-reveal cinematic-stagger-3 flex flex-col items-center justify-center p-6 rounded-3xl bg-[#faf8f2] border border-slate-200/80 shadow-xs">
              <span className="font-poppins font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-amber-500">
                1
              </span>
              <span className="mt-3 text-base sm:text-lg font-bold text-slate-900">Stablecoin &amp; Networks</span>
              <span className="mt-1 text-xs text-slate-500 font-medium">USDT (Polygon, BEP20, Solana)</span>
            </div>

            {/* Stat 4 */}
            <div className="cinematic-card cinematic-card-reveal cinematic-stagger-4 flex flex-col items-center justify-center p-6 rounded-3xl bg-[#faf8f2] border border-slate-200/80 shadow-xs">
              <span className="font-poppins font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-slate-800">
                20+
              </span>
              <span className="mt-3 text-base sm:text-lg font-bold text-slate-900">Local Cash Payouts</span>
              <span className="mt-1 text-xs text-slate-500 font-medium">Cash pickup &amp; delivery channels</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-[#f8fafc] text-slate-700 px-5 pt-16 pb-12 sm:px-8 lg:px-12 text-left">
        <div className="mx-auto max-w-7xl">
          <div className="border-b border-slate-200/80 pb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 group focus:outline-none">
                <span className="font-poppins font-black text-3xl sm:text-4xl tracking-tight text-slate-900 flex items-center">
                  coinbridge
                  <svg viewBox="0 0 24 24" fill="currentColor" className="inline-block h-6 w-6 text-[#df725b] ml-1.5 -mt-1">
                    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                  </svg>
                </span>
              </Link>
              <p className="mt-2 text-base text-slate-600 font-medium">
                Sell crypto and local cash
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setAuthSheetTitle('Sign up');
                  setShowAuthSheet(true);
                }}
                className="cinematic-sheen rounded-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 text-sm font-bold shadow-sm transition-all cursor-pointer"
              >
                Get started
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-12 py-12 text-sm">
            {/* Column 1 */}
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-slate-500 text-xs tracking-wider uppercase">Help</h4>
              <div className="flex flex-col gap-3 text-slate-700">
                <a
                  href="https://t.me/coinbridgea"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:text-[#5f22d9] transition-colors inline-flex items-center gap-1.5"
                >
                  Contact support (@coinbridgea)
                </a>
                <a
                  href="mailto:CoinBridgea@proton.me"
                  className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Business: <span className="text-slate-700 font-medium">CoinBridgea@proton.me</span>
                </a>
                <a
                  href="mailto:supportcoinbridge@protonmail.com"
                  className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Support: <span className="text-slate-700 font-medium">supportcoinbridge@protonmail.com</span>
                </a>
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-slate-500 text-xs tracking-wider uppercase">References</h4>
              <div className="flex flex-col gap-3 text-slate-700">
                <a href="#how" className="font-medium hover:text-[#5f22d9] transition-colors">
                  Blog &amp; updates
                </a>
                <a href="#coverage" className="font-medium hover:text-[#5f22d9] transition-colors">
                  Coverage
                </a>
                <button
                  type="button"
                  onClick={() => setActiveLegalDoc('terms')}
                  className="text-left font-medium hover:text-[#5f22d9] transition-colors cursor-pointer"
                >
                  Terms and Conditions
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLegalDoc('privacy')}
                  className="text-left font-medium hover:text-[#5f22d9] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLegalDoc('aml')}
                  className="text-left text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  AML &amp; Compliance Policy
                </button>
              </div>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-slate-500 text-xs tracking-wider uppercase">Follow CoinBridge</h4>
              <div className="flex flex-col gap-3 text-slate-700">
                <a
                  href="https://x.com/coinbridge_lol"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:text-slate-900 transition-colors inline-flex items-center gap-2 group"
                >
                  <svg className="h-4 w-4 fill-current text-slate-500 group-hover:text-slate-900 transition-colors shrink-0" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>Follow us on X</span>
                </a>
                <a
                  href="https://t.me/coinbridgea"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:text-[#229ED9] transition-colors inline-flex items-center gap-2 group"
                >
                  <svg className="h-4 w-4 fill-current text-[#229ED9] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                  <span>Follow us on Telegram</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/80 pt-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 CoinBridge</p>
            <p className="text-slate-400">Secure instant settlement infrastructure</p>
          </div>
        </div>
      </footer>

      <LegalModal docType={activeLegalDoc} onClose={() => setActiveLegalDoc(null)} />
      <GoogleSignInBottomSheet
        isOpen={showAuthSheet}
        onClose={() => setShowAuthSheet(false)}
        title={authSheetTitle}
      />
    </main>
  );
}

// -------------------------------------------------------------
// Checkout / User Portal Page
// -------------------------------------------------------------

function formatOrderDate(isoString?: string): string {
  if (!isoString) return 'Just now';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

function getSavedOrdersList(email?: string): PayoutOrder[] {
  if (!email || !email.trim()) return [];
  try {
    const cleanEmail = email.toLowerCase().trim();
    const raw = localStorage.getItem(`cb_orders_${cleanEmail}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const list = parsed.filter((o: PayoutOrder) => {
      if (!o || !o.id || o.id.startsWith('ord_cb')) return false;
      const orderEmail = (o.userEmail || '').toLowerCase().trim();
      return orderEmail === cleanEmail;
    });
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return list;
  } catch {
    return [];
  }
}

function UserPortal() {
  const { user, loading, signOutAccount } = useAuth();
  const [, setLocation] = useLocation();
  const [activeView, setActiveView] = useState<'checkout' | 'history'>('checkout');
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const userEmail = (
    user?.email ||
    auth.currentUser?.email ||
    auth.currentUser?.providerData?.[0]?.email ||
    (() => {
      try {
        const raw = localStorage.getItem('coinbridge_saved_user');
        return raw ? JSON.parse(raw).email : '';
      } catch {
        return '';
      }
    })() ||
    (() => {
      try {
        return localStorage.getItem('coinbridge_active_user_email') || '';
      } catch {
        return '';
      }
    })() ||
    ''
  ).trim();

  const userDisplayName = (
    user?.displayName ||
    auth.currentUser?.displayName ||
    auth.currentUser?.providerData?.[0]?.displayName ||
    (() => {
      try {
        const raw = localStorage.getItem('coinbridge_saved_user');
        return raw ? JSON.parse(raw).displayName : '';
      } catch {
        return '';
      }
    })() ||
    (userEmail ? userEmail.split('@')[0] : '') ||
    'Google User'
  );

  const userPhoto = (
    user?.photoURL ||
    auth.currentUser?.photoURL ||
    auth.currentUser?.providerData?.[0]?.photoURL ||
    (() => {
      try {
        const raw = localStorage.getItem('coinbridge_saved_user');
        return raw ? JSON.parse(raw).photoURL : '';
      } catch {
        return '';
      }
    })() ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userDisplayName)}`
  );

  const currentUser: AppUserProfile = {
    uid: user?.uid || auth.currentUser?.uid || 'user',
    email: userEmail,
    displayName: userDisplayName,
    photoURL: userPhoto,
    emailVerified: user?.emailVerified ?? true,
    provider: (user?.provider || 'google') as 'google' | 'password',
  };

  const [userOrders, setUserOrders] = useState<PayoutOrder[]>(() => {
    return getSavedOrdersList(currentUser.email);
  });

  // Re-sync local orders immediately if currentUser changes
  useEffect(() => {
    setUserOrders(getSavedOrdersList(currentUser.email));
  }, [currentUser.email]);

  // Real-time Firestore sync: Live order records strictly isolated for this logged-in Gmail
  useEffect(() => {
    const cleanEmail = (currentUser.email || '').toLowerCase().trim();
    if (!cleanEmail) {
      setUserOrders([]);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    try {
      const q = query(collection(db, 'payout_orders'));
      unsubscribe = onSnapshot(
        q,
        (snap) => {
          const list: PayoutOrder[] = [];
          snap.forEach((d) => {
            const data = d.data() as any;
            if (d.id.startsWith('ord_cb')) return; // ignore templates
            const orderEmail = (data.userEmail || '').toLowerCase().trim();

            // STRICT ACCOUNT ISOLATION:
            const isMatch = cleanEmail && orderEmail === cleanEmail;
            if (isMatch) {
              list.push({ id: d.id, ...data });
            }
          });
          list.sort((a, b) => {
            const timeA = new Date(a.createdAt || 0).getTime();
            const timeB = new Date(b.createdAt || 0).getTime();
            return timeB - timeA;
          });
          setUserOrders(list);

          // Save strictly to this specific Gmail account's private storage
          if (cleanEmail) {
            try {
              localStorage.setItem(`cb_orders_${cleanEmail}`, JSON.stringify(list));
            } catch {}
          }
        },
        (err) => {
          console.warn('Firestore live sync note:', err);
        }
      );
    } catch (err) {
      console.warn('Firestore subscription setup note:', err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser.email, currentUser.uid]);

  // Active Telegram update listener for pending/processing orders:
  useEffect(() => {
    const activeOrderIds = userOrders
      .filter((o) => o.status === 'pending' || o.status === 'processing')
      .map((o) => o.id);

    if (activeOrderIds.length === 0) return;

    const stop = pollTelegramGlobalApproval(activeOrderIds, (approvedId) => {
      setUserOrders((prev) =>
        prev.map((o) =>
          o.id === approvedId ? { ...o, status: 'completed', completedAt: new Date().toISOString() } : o
        )
      );
    });

    return () => stop();
  }, [userOrders]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Close full-screen menu on Escape key press
  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Checking Google session...</span>
        </div>
      </div>
    );
  }

  if (!user && !auth.currentUser) {
    return <Redirect to="/sign-in" />;
  }

  const pendingCount = userOrders.filter((o) => o.status === 'pending').length;
  const processingCount = userOrders.filter((o) => o.status === 'processing' || !!o.verifiedOnChain).length;
  const completedCount = userOrders.filter((o) => o.status === 'completed' || o.status === 'success').length;
  const totalVolume = userOrders.reduce((sum, o) => sum + (Number(o.cryptoAmount) || 0), 0);

  const filteredOrders = userOrders.filter((ord) => {
    if (historyFilter === 'pending' && ord.status !== 'pending') return false;
    if (historyFilter === 'processing' && ord.status !== 'processing' && !ord.verifiedOnChain) return false;
    if (historyFilter === 'completed' && ord.status !== 'completed' && ord.status !== 'success') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = (ord.id || '').toLowerCase().includes(q);
      const matchAccount = (ord.accountNumber || '').toLowerCase().includes(q);
      const matchEmail = (ord.userEmail || '').toLowerCase().includes(q);
      const matchCountry = (ord.country || '').toLowerCase().includes(q);
      const matchMethod = (ord.paymentMethod || '').toLowerCase().includes(q);
      const matchFiat = (ord.fiatCurrencyCode || '').toLowerCase().includes(q);
      return matchId || matchAccount || matchEmail || matchCountry || matchMethod || matchFiat;
    }
    return true;
  });

  return (
    <div
      className={`relative min-h-screen ${
        activeView === 'checkout'
          ? 'bg-white'
          : 'bg-gradient-to-b from-[#FAF8F2] via-[#F7F4EA] to-[#FAF6EB]'
      } text-[#0F172A] flex flex-col font-sans overflow-x-hidden selection:bg-[#df725b]/20`}
    >
      {/* Header: Clean edge-to-edge header aligned on top */}
      <header className="relative z-30 sticky top-0 w-full bg-white border-b border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Official CoinBridge Logo & Brand Name */}
          <div className="flex items-center gap-2.5 sm:gap-3 select-none">
            <span className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-[#1b2230] p-1.5 shadow-xs">
              <svg viewBox="0 0 40 40" fill="none" className="h-5 w-5 sm:h-5.5 sm:w-5.5" aria-hidden="true">
                <defs>
                  <linearGradient id="portalLogoEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="portalLogoGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
                <path
                  d="M15 11C9.5 11 5 15.5 5 21C5 26.5 9.5 31 15 31C19.5 31 23 27.5 25 23"
                  stroke="url(#portalLogoEmerald)"
                  strokeWidth="3.6"
                  strokeLinecap="round"
                />
                <path
                  d="M25 29C30.5 29 35 24.5 35 19C35 13.5 30.5 9 25 9C20.5 9 17 12.5 15 17"
                  stroke="url(#portalLogoGold)"
                  strokeWidth="3.6"
                  strokeLinecap="round"
                />
                <rect
                  x="16.5"
                  y="16.5"
                  width="7"
                  height="7"
                  rx="2"
                  transform="rotate(45 20 20)"
                  fill="#ffffff"
                />
                <circle cx="20" cy="20" r="1.6" fill="#1b2230" />
              </svg>
            </span>
            <span className="h-7 w-[2px] bg-slate-200 rounded-full" />
            <span className="font-poppins font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
              CoinBridge
            </span>
          </div>

          {/* Right: 3-Bar Options Menu Button that opens the Full-Screen Page */}
          <button
            id="portal-menu-button"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(true);
            }}
            aria-label="Account details and navigation menu"
            className="h-10 w-10 rounded-2xl flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Options and Account Details"
          >
            <Menu className="h-5 w-5" strokeWidth={2.3} />
          </button>
        </div>
      </header>

      {/* Full-Screen Page / Modal opened by the menu button */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF8F2] flex flex-col overflow-y-auto animate-in fade-in duration-200">
          {/* Top Bar of Full-Screen Page */}
          <div className="w-full px-5 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-200/80 bg-white">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1b2230] p-1.5 shadow-xs">
                <svg viewBox="0 0 40 40" fill="none" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M15 11C9.5 11 5 15.5 5 21C5 26.5 9.5 31 15 31C19.5 31 23 27.5 25 23"
                    stroke="#34d399"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M25 29C30.5 29 35 24.5 35 19C35 13.5 30.5 9 25 9C20.5 9 17 12.5 15 17"
                    stroke="#fbbf24"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                  />
                  <rect
                    x="16.5"
                    y="16.5"
                    width="7"
                    height="7"
                    rx="2"
                    transform="rotate(45 20 20)"
                    fill="#ffffff"
                  />
                  <circle cx="20" cy="20" r="1.6" fill="#1b2230" />
                </svg>
              </span>
              <span className="font-poppins font-black text-xl text-slate-900 tracking-tight">
                CoinBridge
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="h-10 w-10 rounded-2xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              aria-label="Close Full Screen Page"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Full Screen Body Content */}
          <div className="flex-1 max-w-lg w-full mx-auto p-5 sm:p-8 flex flex-col justify-center space-y-6">
            {/* Signed-in Google User Account Info Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm text-center relative overflow-hidden">
              <div className="relative inline-block mb-3.5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-slate-100 to-slate-50 border-2 border-slate-200/80 overflow-hidden mx-auto flex items-center justify-center shadow-xs">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Google Account'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <GoogleIcon className="h-10 w-10" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white shadow-xs border border-slate-200">
                  <GoogleIcon className="h-4 w-4" />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentUser.displayName || 'Google User'}
              </h3>

              <div className="mt-2.5 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80">
                  <Mail className="h-3.5 w-3.5 text-[#EA4335] shrink-0" />
                  <span className="font-mono text-xs sm:text-sm font-semibold truncate select-all">
                    {currentUser.email || 'No email associated'}
                  </span>
                  {currentUser.email && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(currentUser.email, 'email_copy');
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Copy Gmail address"
                    >
                      {copiedId === 'email_copy' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Verified Google Account</span>
                </div>
              </div>
            </div>

            {/* Navigation / Actions Options */}
            <div className="space-y-3">
              {/* 1. Checkout Page Option */}
              <button
                type="button"
                onClick={() => {
                  setActiveView('checkout');
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-4 sm:p-4.5 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer ${
                  activeView === 'checkout'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      activeView === 'checkout'
                        ? 'bg-white/10 text-emerald-400'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-base font-bold block">Checkout</span>
                    <span
                      className={`text-xs block mt-0.5 ${
                        activeView === 'checkout' ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      Crypto settlement &amp; direct local currency transfer
                    </span>
                  </div>
                </div>
                <ChevronRight className={`h-5 w-5 ${activeView === 'checkout' ? 'text-slate-400' : 'text-slate-400'}`} />
              </button>

              {/* 2. Payout History Option */}
              <button
                type="button"
                onClick={() => {
                  setActiveView('history');
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-4 sm:p-4.5 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer ${
                  activeView === 'history'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      activeView === 'history'
                        ? 'bg-white/10 text-amber-400'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-base font-bold block">Payout History</span>
                    <span
                      className={`text-xs block mt-0.5 ${
                        activeView === 'history' ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      All order records, pending &amp; completed transactions
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {userOrders.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-black">
                      {userOrders.length}
                    </span>
                  )}
                  <ChevronRight className={`h-5 w-5 ${activeView === 'history' ? 'text-slate-400' : 'text-slate-400'}`} />
                </div>
              </button>

              {/* 3. Sign Out Option */}
              <button
                type="button"
                onClick={async () => {
                  setMenuOpen(false);
                  await signOutAccount();
                  setLocation('/');
                }}
                className="w-full flex items-center justify-between p-4 sm:p-4.5 rounded-2xl sm:rounded-3xl bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200/80 text-rose-700 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-rose-100/90 flex items-center justify-center text-rose-600 shrink-0">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-base font-bold block">Sign Out</span>
                    <span className="text-xs text-rose-600/80 block mt-0.5">
                      Securely sign out of your Google account session
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-rose-400" />
              </button>
            </div>

            {/* Close Button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
                <span>Close &amp; Return</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Area */}
      <main
        className={`relative z-10 flex-1 flex flex-col items-center justify-start w-full ${
          activeView === 'checkout' ? 'px-0 pt-0 pb-0 bg-white' : 'p-3 sm:p-6'
        }`}
      >
        {/* ONLY COINBRIDGE CHECKOUT — Kept mounted so QR code, countdown & blockchain scanner are never reset */}
        <div
          className={`w-full flex-1 flex justify-center pt-0 pb-10 sm:pb-16 px-0 bg-white ${
            activeView === 'checkout' ? 'block' : 'hidden'
          }`}
        >
          <CryptoPayCheckout
            userUid={currentUser.uid}
            userName={currentUser.displayName}
            userEmail={currentUser.email}
            onOrderCreated={(order) => {
              setUserOrders((prev) => {
                const map = new Map<string, PayoutOrder>();
                map.set(order.id, order);
                prev.forEach((o) => map.set(o.id, o));
                const updated = Array.from(map.values());
                updated.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                const cleanEmail = (currentUser.email || '').toLowerCase().trim();
                if (cleanEmail) {
                  try {
                    localStorage.setItem(`cb_orders_${cleanEmail}`, JSON.stringify(updated));
                  } catch {}
                }
                return updated;
              });
            }}
          />
        </div>

        {/* Payout History Ledger Dashboard */}
        {activeView === 'history' && (
          <div className="w-full max-w-3xl space-y-4 my-2 sm:my-4 animate-in fade-in duration-150">
            {/* Top Card: Header & Stats */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-200/90 space-y-5 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real-Time On-Chain Ledger</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight mt-1">
                    Payout History
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentUser.email
                      ? `Signed in as: ${currentUser.email} • Real-time order transactions`
                      : 'Live transaction records and payout order status'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView('checkout')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Back to Checkout</span>
                </button>
              </div>

              {/* 5 Quick Stat Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
                <div className="col-span-2 sm:col-span-1 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                  <span className="text-[11px] font-semibold text-slate-300 block">Total Payout</span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 block truncate">
                    {totalVolume.toFixed(2)} <span className="text-xs text-slate-300 font-sans">USDT</span>
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 block">Total Orders</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 block">
                    {userOrders.length}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[11px] font-semibold text-amber-900">Awaiting</span>
                  </div>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-amber-950 mt-0.5 block">
                    {pendingCount}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
                    <span className="text-[11px] font-semibold text-purple-900">Processing</span>
                  </div>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-purple-950 mt-0.5 block">
                    {processingCount}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span className="text-[11px] font-semibold text-emerald-900">Completed</span>
                  </div>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-950 mt-0.5 block">
                    {completedCount}
                  </span>
                </div>
              </div>

              {/* Controls: Filter Pills & Search Input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                {/* Status Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setHistoryFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      historyFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({userOrders.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setHistoryFilter('pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      historyFilter === 'pending'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-amber-800 hover:bg-amber-50'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${historyFilter === 'pending' ? 'bg-white' : 'bg-amber-500'}`} />
                    <span>Awaiting ({pendingCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHistoryFilter('processing')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      historyFilter === 'processing'
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-purple-800 hover:bg-purple-50'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${historyFilter === 'processing' ? 'bg-white' : 'bg-purple-600'}`} />
                    <span>Processing ({processingCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHistoryFilter('completed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      historyFilter === 'completed'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-emerald-800 hover:bg-emerald-50'
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Completed ({completedCount})</span>
                  </button>
                </div>

                {/* Search Box */}
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Order ID, email, or account number..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200/80 text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Orders Feed List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/90 shadow-xs space-y-4">
                <div className="h-14 w-14 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                  {searchQuery ? <Search className="h-6 w-6" /> : <Clock3 className="h-6 w-6 text-slate-400" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {searchQuery ? 'No results found' : 'No payout orders yet'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {searchQuery
                      ? `No orders matching "${searchQuery}"`
                      : 'Your transactions will be securely saved here after completing a payout order.'}
                  </p>
                </div>
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-semibold text-[#df725b] hover:underline cursor-pointer"
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveView('checkout')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Wallet className="h-4 w-4 text-emerald-400" />
                    <span>Create a new payout order</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((ord) => {
                  const isPending = ord.status === 'pending';
                  const isProcessing = ord.status === 'processing' || !!ord.verifiedOnChain;
                  const isSuccess = ord.status === 'completed' || ord.status === 'success';

                  return (
                    <div
                      key={ord.id}
                      className={`rounded-3xl p-4 sm:p-5 shadow-xs border transition-all text-left ${
                        isProcessing
                          ? 'bg-gradient-to-b from-white to-purple-50/25 border-purple-200/90 hover:border-purple-300'
                          : isPending
                          ? 'bg-gradient-to-b from-white to-amber-50/20 border-amber-200/80 hover:border-amber-300'
                          : 'bg-gradient-to-b from-white to-emerald-50/15 border-slate-200/90 hover:border-emerald-200'
                      }`}
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                            #{ord.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(ord.id, ord.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Copy Order ID"
                          >
                            {copiedId === ord.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {ord.verifiedOnChain && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-pulse" />
                              <span>On-Chain Verified</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          {ord.userEmail && (
                            <span className="font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/60">
                              {ord.userEmail}
                            </span>
                          )}
                          <span>•</span>
                          <span>{formatOrderDate(ord.createdAt)}</span>
                        </div>
                      </div>

                      {/* Middle Financials */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                              {ord.fiatCurrencySymbol || 'Tk'}{' '}
                              {typeof ord.fiatAmount === 'number'
                                ? ord.fiatAmount.toLocaleString()
                                : Number(ord.fiatAmount || 0).toLocaleString()}
                            </span>
                            <span className="font-bold text-sm text-slate-700">
                              {ord.fiatCurrencyCode || 'BDT'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                              ₮ {ord.cryptoAmount ?? 0} {ord.tokenSymbol || 'USDT'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              Network: {ord.tokenNetwork || 'Polygon'}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="self-start sm:self-auto">
                          {isProcessing ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100/90 text-purple-900 border border-purple-200 text-xs font-bold">
                              <span className="h-2 w-2 rounded-full bg-purple-600 animate-ping" />
                              <span>Processing</span>
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-200 text-xs font-bold">
                              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                              <span>Awaiting Payment</span>
                            </span>
                          ) : isSuccess ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/90 text-emerald-900 border border-emerald-200 text-xs font-bold">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold">
                              <Clock3 className="h-3.5 w-3.5 text-slate-600" />
                              <span>{ord.status}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Box */}
                      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                            {ord.paymentMethod || 'bKash'} {ord.accountType ? `(${ord.accountType})` : ''}
                          </span>
                          {ord.accountNumber && (
                            <div className="flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                              <span className="font-mono font-semibold text-slate-800">
                                {ord.accountNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(ord.accountNumber || '', `acc_${ord.id}`)}
                                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                title="Copy account number"
                              >
                                {copiedId === `acc_${ord.id}` ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          )}
                          <span className="text-[11px] text-slate-500 font-medium">
                            {ord.country || 'Bangladesh'}
                          </span>
                          {ord.txHash && (
                            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md">
                              <span>
                                Tx: {ord.txHash.length > 14 ? `${ord.txHash.slice(0, 8)}...${ord.txHash.slice(-6)}` : ord.txHash}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(ord.txHash || '', `tx_${ord.id}`)}
                                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                title="Copy tx hash"
                              >
                                {copiedId === `tx_${ord.id}` ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Status label */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isProcessing ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-pulse" />
                              <span>USDT Received • Payout in Progress</span>
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Awaiting Transfer</span>
                            </span>
                          ) : isSuccess ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span>Paid &amp; Completed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 text-slate-600 font-semibold border border-slate-200">
                              <span>{ord.status}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// -------------------------------------------------------------
// App Routing
// -------------------------------------------------------------

function Router() {
  return (
    <Switch>
      <Route path="/">{() => <Home />}</Route>
      <Route path="/sign-in">{() => <Home initialAuthOpen={true} initialTitle="Sign in" />}</Route>
      <Route path="/sign-up">{() => <Home initialAuthOpen={true} initialTitle="Sign up" />}</Route>
      <Route path="/user-portal" component={UserPortal} />
      <Route path="/checkout" component={UserPortal} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WouterRouter base={basePath}>
          <Router />
        </WouterRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
