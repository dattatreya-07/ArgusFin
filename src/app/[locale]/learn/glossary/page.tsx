'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { GLOSSARY_TERMS } from '@/lib/education/data';
import { Link } from '@/i18n/routing';
import { Card, CardHeader, CardTitle, CardContent, SectionHeading, Field } from '@/components/ui';

export default function GlossaryPage() {
  const locale = useLocale();
  const langKey = (locale === 'hi' || locale === 'ta' ? locale : 'en') as 'en' | 'hi' | 'ta';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Foundations', 'Metrics', 'Instruments', 'Markets', 'Regulators'];

  const filteredTerms = GLOSSARY_TERMS.filter((t) => {
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const termName = t.term.toLowerCase();
    const def = (t.definition[langKey] || t.definition.en).toLowerCase();

    const matchesQuery = !q || termName.includes(q) || def.includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
        <Link href="/learn" className="hover:text-accent hover:underline">
          ← Back to Learn Hub
        </Link>
        <span>/</span>
        <span className="text-ink font-bold">Financial Glossary</span>
      </div>

      <div className="space-y-2">
        <SectionHeading
          badge="40 Key Financial Terms"
          title="Investor Glossary &amp; Terminology"
          subtitle="Clear, plain-language definitions for beginner investors across English, हिन्दी &amp; தமிழ்."
        />
      </div>

      {/* Filter Controls */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search term (e.g. CAGR, Equity, NSDL, Drawdown)..."
                className="w-full px-3.5 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm text-ink placeholder:text-ink-muted/60"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition font-mono whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-accent text-accent-ink shadow-sm'
                      : 'bg-surface-sunken text-ink-muted hover:text-ink border border-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms Grid */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-ink font-mono block">
          Showing {filteredTerms.length} of {GLOSSARY_TERMS.length} Terms
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTerms.map((item) => {
            const def = item.definition[langKey] || item.definition.en;
            const ex = item.example[langKey] || item.example.en;

            return (
              <Card key={item.slug} id={item.slug} className="border-border hover:border-accent transition-all flex flex-col justify-between">
                <CardHeader className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-ink flex items-center gap-2">
                      <a href={`#${item.slug}`} className="hover:text-accent font-mono">
                        {item.term}
                      </a>
                    </CardTitle>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-sunken text-accent border border-border font-mono">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-xs text-ink-muted leading-relaxed">
                    {def}
                  </p>

                  <div className="p-2.5 bg-surface-sunken rounded-lg border border-border text-[11px] text-ink-muted space-y-0.5 font-sans">
                    <span className="font-bold text-ink block font-mono text-[10px]">Example:</span>
                    <p>{ex}</p>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
