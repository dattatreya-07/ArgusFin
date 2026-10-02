import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { ChannelsShowcase } from '@/components/channels/ChannelsShowcase';
import { TickerMarquee } from '@/components/TickerMarquee';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const tHome = useTranslations('home');
  const tCommon = useTranslations('common');

  return (
    <div className="space-y-12">
      {/* Modern Hero Section */}
      <section className="relative text-center pt-6 pb-8 md:py-12 space-y-6">
        {/* Top Status Badge Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-900 text-xs font-semibold shadow-xs">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Official SEBI / RBI Grounded Ground Truth</span>
          <span className="text-blue-400 font-normal">|</span>
          <span className="text-blue-700">Zero-Data Privacy Shield</span>
        </div>

        {/* Dynamic Main Headline */}
        <div className="space-y-3 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Evidence-Based Scam Defense &amp;{' '}
            <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              Truth in Financial Numbers
            </span>
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            {tHome('heroSubtitle')}
          </p>
        </div>

        {/* Dual Primary Call-to-Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/check"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <span>🔍 Check a Suspicious Message</span>
            <span className="ml-2 font-black">→</span>
          </Link>
          <Link
            href="/calculator"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm sm:text-base shadow-xs hover:shadow-sm transition"
          >
            <span>📊 Yield Reality Ladder</span>
          </Link>
        </div>

        {/* Ecosystem & Social Proof Pill */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="flex -space-x-2 overflow-hidden">
            <span className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
              SEBI
            </span>
            <span className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
              RBI
            </span>
            <span className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
              1930
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            <strong className="text-slate-900 font-bold">14,200+</strong> Verifications Processed • 100% Client-Side Masking
          </p>
        </div>
      </section>

      {/* Dual Opposite Infinite Marquee Tickers */}
      <section className="bg-slate-950 rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800">
        <TickerMarquee />
      </section>

      {/* Primary Feature Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Investor Resilience Toolkit</h2>
            <p className="text-xs text-slate-500">
              Deterministic verification, mathematical reality checks, and official redressal routing
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Promise Calculator Card */}
          <Link
            href="/calculator"
            className="group block p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition transform hover:-translate-y-0.5"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              %
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
              {tHome('calcCardTitle')}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {tHome('calcCardDesc')}
            </p>
            <span className="inline-block mt-4 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              Try Calculator →
            </span>
          </Link>

          {/* Scam Check Card */}
          <Link
            href="/check"
            className="group block p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition transform hover:-translate-y-0.5"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              🔍
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition">
              {tHome('checkCardTitle')}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {tHome('checkCardDesc')}
            </p>
            <span className="inline-block mt-4 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
              Check Message Now →
            </span>
          </Link>

          {/* Scam Simulator Card */}
          <Link
            href="/simulate"
            className="group block p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition transform hover:-translate-y-0.5"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              📉
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition">
              {tHome('simCardTitle')}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {tHome('simCardDesc')}
            </p>
            <span className="inline-block mt-4 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              Try Interactive Simulator →
            </span>
          </Link>

          {/* Authorities Router Card */}
          <Link
            href="/authorities"
            className="group block p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition transform hover:-translate-y-0.5"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              🛡️
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
              {tHome('authoritiesCardTitle')}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {tHome('authoritiesCardDesc')}
            </p>
            <span className="inline-block mt-4 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              Find Official Authority →
            </span>
          </Link>

          {/* Emergency / Report Card */}
          <Link
            href="/report"
            className="group block p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-400 transition transform hover:-translate-y-0.5"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              🚨
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition">
              {tHome('reportCardTitle')}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {tHome('reportCardDesc')}
            </p>
            <span className="inline-block mt-4 text-xs font-bold text-rose-600 group-hover:translate-x-1 transition-transform">
              Generate Pre-Filing Report →
            </span>
          </Link>

          {/* Ask Assistant Card */}
          <Link
            href="/ask"
            className="group block p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-400 transition transform hover:-translate-y-0.5"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              💬
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition">
              {tHome('askCardTitle')}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {tHome('askCardDesc')}
            </p>
            <span className="inline-block mt-4 text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
              Ask Grounded Assistant →
            </span>
          </Link>
        </div>
      </section>

      {/* Bharat-First Channels Section (PWA Share Target + Telegram + WhatsApp Roadmap) */}
      <section className="pt-2">
        <ChannelsShowcase locale={locale as any} />
      </section>
    </div>
  );
}
