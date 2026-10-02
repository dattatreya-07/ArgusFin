import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default function AskPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = useTranslations('placeholders');

  return (
    <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
      <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
        💬
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('askTitle')}</h1>
      <p className="text-slate-600 text-sm">{t('askDesc')}</p>
      <div>
        <Link
          href="/"
          className="inline-block px-5 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition"
        >
          ← Return to Home
        </Link>
      </div>
    </div>
  );
}
