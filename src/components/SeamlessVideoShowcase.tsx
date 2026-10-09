import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  ArrowRightLeft,
  Zap,
  ShieldCheck,
  Building2,
  Globe,
  Wallet,
} from 'lucide-react';
import { useScrollReveal } from '@/components/CinematicEffects';

export function SeamlessVideoShowcase() {
  const sectionRef = useScrollReveal();
  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentStep((s) => (s + 1) % 3);
    }, 3500);

    return () => window.clearInterval(timer);
  }, []);

  const handleSelectStep = (idx: number) => {
    setCurrentStep(idx);
  };

  return (
    <section
      ref={sectionRef}
      id="demo"
      className="reveal-section relative w-full overflow-hidden select-none px-5 py-20 sm:py-28 lg:px-12 bg-gradient-to-b from-white via-[#faf8f2] to-white"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Warm Ambient Illumination */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[950px] h-[500px] rounded-full opacity-60"
        style={{
          background:
            'radial-gradient(circle, rgba(223, 114, 91, 0.09) 0%, rgba(248, 207, 98, 0.09) 35%, rgba(56, 189, 248, 0.05) 70%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto max-w-5xl z-10">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="cinematic-paragraph-reveal inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs backdrop-blur-md mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#df725b] animate-ping" />
            Live Platform Walkthrough
          </div>
          <h2 className="cinematic-heading-reveal font-serif text-3xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight">
            Watch the workflow in action.
          </h2>
          <p className="cinematic-paragraph-reveal mt-3 text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
            See the entire automated cycle from currency selection to instantaneous USDT network verification and direct local cash payout.
          </p>
        </div>

        {/* Showcase Chassis */}
        <div className="cinematic-image-reveal relative mx-auto max-w-4xl">
          {/* Subtle Dynamic Ambient Halo */}
          <div className="pointer-events-none absolute -inset-2 rounded-[2.5rem] bg-gradient-to-b from-[#f8cf62]/20 via-[#df725b]/15 to-transparent blur-xl" />

          {/* Master Frame */}
          <div className="relative rounded-3xl lg:rounded-[2.5rem] bg-gradient-to-b from-white/95 via-white/90 to-[#fbf9f5] border border-slate-200/90 p-4 sm:p-6 shadow-xl">
            {/* Top Specular Rim */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent" />

            {/* 3 Colorful Stage Tabs */}
            <div className="mb-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {[
                  {
                    step: 0,
                    num: '1',
                    title: 'Send USDT',
                    subtitle: 'Choose Country & Amount',
                    color: 'from-emerald-500 to-teal-600',
                    activeBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    indicatorColor: 'bg-emerald-500',
                  },
                  {
                    step: 1,
                    num: '2',
                    title: 'Auto Verify',
                    subtitle: 'Blockchain Clearance',
                    color: 'from-cyan-500 to-blue-600',
                    activeBadge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
                    indicatorColor: 'bg-cyan-500',
                  },
                  {
                    step: 2,
                    num: '3',
                    title: 'Receive Funds',
                    subtitle: 'Direct Bank & Wallets',
                    color: 'from-amber-500 to-[#df725b]',
                    activeBadge: 'bg-amber-50 text-amber-900 border-amber-200',
                    indicatorColor: 'bg-amber-500',
                  },
                ].map((item) => {
                  const isActive = currentStep === item.step;
                  const isCompleted = currentStep > item.step;

                  return (
                    <button
                      key={item.step}
                      type="button"
                      onClick={() => handleSelectStep(item.step)}
                      className={`group flex flex-col gap-2 p-2 sm:p-2.5 rounded-2xl transition-all cursor-pointer border ${
                        isActive
                          ? `${item.activeBadge} shadow-xs`
                          : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      {/* Progress Fill Bar */}
                      <div className="h-1.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500 ease-out ${
                            isActive || isCompleted ? 'w-full' : 'w-0'
                          }`}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span
                          className={`h-5 w-5 rounded-full grid place-items-center text-[10px] font-bold text-white shrink-0 ${
                            isActive ? item.indicatorColor : 'bg-slate-300'
                          }`}
                        >
                          {item.num}
                        </span>
                        <div className="min-w-0 text-left">
                          <p
                            className={`text-xs font-bold truncate ${
                              isActive ? 'text-slate-900' : 'text-slate-600'
                            }`}
                          >
                            {item.title}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate hidden sm:block">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* VIEWPORT: Multi-Country Global Fintech Architecture */}
            <div className="relative w-full min-h-[350px] sm:min-h-[380px] overflow-hidden rounded-2xl lg:rounded-3xl bg-[#f8fafc] border border-slate-200/70 p-6 sm:p-8 flex items-center justify-center">
              {/* SCENE 0: Step 1 — Send USDT */}
              {currentStep === 0 && (
                <div className="animate-rise-in flex flex-col items-center text-center max-w-md w-full">
                  <div className="w-full rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-slate-800">
                          Real-Time Multi-Country Settlement
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        <span>Global Rate Lock</span>
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-3 sm:p-4">
                        <div className="text-left">
                          <span className="text-[11px] font-semibold text-emerald-800">You Send (Crypto)</span>
                          <p className="font-mono text-2xl font-black text-slate-900">100.00</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-white border border-emerald-300 px-3 py-1.5 shadow-2xs">
                          <span className="h-6 w-6 rounded-full bg-[#26a17b] text-white grid place-items-center font-bold text-xs">
                            ₮
                          </span>
                          <span className="font-bold text-sm text-slate-900">USDT</span>
                        </div>
                      </div>

                      <div className="flex justify-center -my-1">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-r from-emerald-500 to-[#df725b] text-white grid place-items-center shadow-xs">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl bg-amber-50/70 border border-amber-200/80 p-3 sm:p-4">
                        <div className="text-left">
                          <span className="text-[11px] font-semibold text-amber-800">You Receive (Native Fiat)</span>
                          <p className="font-mono text-xl sm:text-2xl font-black text-slate-900">Direct Currency</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-white border border-amber-300 px-3 py-1.5 shadow-2xs">
                          <span className="h-6 w-6 rounded-full bg-amber-500 text-white grid place-items-center">
                            <Building2 className="h-3.5 w-3.5" />
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-slate-900">Bank &amp; Wallet</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    <span>Zero Hidden Fees • Guaranteed Instant Lock</span>
                  </p>
                </div>
              )}

              {/* SCENE 1: Step 2 — Auto Verify */}
              {currentStep === 1 && (
                <div className="animate-rise-in flex flex-col items-center text-center max-w-md w-full">
                  <div className="w-full rounded-3xl border border-cyan-200/90 bg-white p-6 shadow-md">
                    <div className="relative mx-auto my-3 h-24 w-24">
                      <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
                      <div className="h-full w-full rounded-full bg-cyan-50 grid place-items-center">
                        <ShieldCheck className="h-10 w-10 text-cyan-600 animate-pulse" />
                      </div>
                    </div>

                    <span className="inline-block mt-2 font-mono text-xs font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-full">
                      Blockchain Network Clearance
                    </span>

                    <h3 className="mt-3 text-xl font-bold text-slate-900">Payment Verified On-Chain</h3>
                    <p className="mt-1 text-xs text-slate-600">Autonomous multi-network smart contract verification</p>
                  </div>

                  <p className="mt-4 text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Dispatching local payment channels...</span>
                  </p>
                </div>
              )}

              {/* SCENE 2: Step 3 — Direct Settlement */}
              {currentStep === 2 && (
                <div className="animate-rise-in flex flex-col items-center text-center max-w-md w-full">
                  <div className="w-full rounded-3xl border border-emerald-200/90 bg-white p-6 shadow-md">
                    <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center shadow-xs">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>

                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Payout Settled Successfully
                    </span>

                    <p className="mt-3 font-mono text-2xl sm:text-3xl font-black text-slate-900">Funds Disbursed</p>

                    <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5">
                      <span className="h-5 w-5 rounded-full bg-emerald-600 text-white grid place-items-center">
                        <Wallet className="h-3 w-3" />
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        Credited directly to local bank &amp; mobile wallet
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Instant payout across all supported countries</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature Cards below video */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-4xl mx-auto">
          <div className="cinematic-card cinematic-card-reveal cinematic-stagger-1 flex items-center gap-4 rounded-3xl bg-white border border-slate-200/90 p-5 shadow-xs">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Instant Verification</h4>
              <p className="text-xs text-slate-500 mt-0.5">Automated on-chain confirmation</p>
            </div>
          </div>

          <div className="cinematic-card cinematic-card-reveal cinematic-stagger-2 flex items-center gap-4 rounded-3xl bg-white border border-slate-200/90 p-5 shadow-xs">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-50 border border-orange-200/60 text-orange-600">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Locked Exchange Rate</h4>
              <p className="text-xs text-slate-500 mt-0.5">No surprise slippage or hidden fees</p>
            </div>
          </div>

          <div className="cinematic-card cinematic-card-reveal cinematic-stagger-3 flex items-center gap-4 rounded-3xl bg-white border border-slate-200/90 p-5 shadow-xs">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-50 border border-sky-200/60 text-sky-600">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Direct Disbursement</h4>
              <p className="text-xs text-slate-500 mt-0.5">Immediate credit to bank or wallet</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
