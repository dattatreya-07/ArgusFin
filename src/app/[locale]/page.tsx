import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { ChannelsShowcase } from '@/components/channels/ChannelsShowcase';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const tHome = useTranslations('home');
  const tCommon = useTranslations('common');

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="text-center py-8 sm:py-12 border-b border-slate-200">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto">
          {tHome('heroTitle')}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          {tHome('heroSubtitle')}
        </p>
        <p className="mt-2 text-xs text-slate-400 italic">
          {tCommon('tagline')}
        </p>
      </section>

      {/* Primary Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Promise Calculator Card */}
        <Link
          href="/calculator"
          className="group block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
            %
          </div>
          <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
            {tHome('calcCardTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {tHome('calcCardDesc')}
          </p>
          <span className="inline-block mt-4 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
            Try Calculator →
          </span>
        </Link>

        {/* Scam Check Card */}
        <Link
          href="/check"
          className="group block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg mb-4">
            🔍
          </div>
          <h2 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition">
            {tHome('checkCardTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {tHome('checkCardDesc')}
          </p>
          <span className="inline-block mt-4 text-xs font-semibold text-amber-600 group-hover:translate-x-1 transition-transform">
            Check Now →
          </span>
        </Link>

        {/* Scam Simulator Card */}
        <Link
          href="/simulate"
          className="group block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg mb-4">
            📉
          </div>
          <h2 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition">
            {tHome('simCardTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {tHome('simCardDesc')}
          </p>
          <span className="inline-block mt-4 text-xs font-semibold text-amber-600 group-hover:translate-x-1 transition-transform">
            Try Simulator →
          </span>
        </Link>

        {/* Authorities Router Card */}
        <Link
          href="/authorities"
          className="group block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
            🛡️
          </div>
          <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
            {tHome('authoritiesCardTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {tHome('authoritiesCardDesc')}
          </p>
          <span className="inline-block mt-4 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
            Find Authority →
          </span>
        </Link>

        {/* Emergency / Report Card */}
        <Link
          href="/report"
          className="group block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-400 transition"
        >
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg mb-4">
            🚨
          </div>
          <h2 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition">
            {tHome('reportCardTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {tHome('reportCardDesc')}
          </p>
          <span className="inline-block mt-4 text-xs font-semibold text-rose-600 group-hover:translate-x-1 transition-transform">
            View Emergency Steps →
          </span>
        </Link>

        {/* Ask Assistant Card */}
        <Link
          href="/ask"
          className="group block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-400 transition"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg mb-4">
            💬
          </div>
          <h2 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition">
            {tHome('askCardTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {tHome('askCardDesc')}
          </p>
          <span className="inline-block mt-4 text-xs font-semibold text-purple-600 group-hover:translate-x-1 transition-transform">
            Ask Questions →
          </span>
        </Link>
      </section>

      {/* Bharat-First Channels Section (PWA Share Target + Telegram + WhatsApp Roadmap) */}
      <section className="pt-4">
        <ChannelsShowcase locale={locale as any} />
      </section>
    </div>
  );
}
