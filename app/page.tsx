'use client';

import { useEffect, useMemo, useState } from 'react';
import DealCard from '@/components/DealCard';

type Deal = {
  id: string;
  title: string;
  store: string;
  store_url: string;
  img?: string;
  price_now: number;
  price_was?: number | null;
  currency?: string;
  discount_pct?: number | null;
  ends_at?: string | null;
  category?: string[];
};

export default function Page() {
  const [q, setQ] = useState('');
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    fetch('/product_deals.json', { cache: 'no-store' })
      .then(r => r.json())
      .then(setDeals)
      .catch(() => setDeals([]));
  }, []);

  const filtered = useMemo(() => {
    const k = q.toLowerCase();
    return deals.filter(d =>
      [d.store, d.title, (d.category || []).join(' ')].join(' ').toLowerCase().includes(k)
    );
  }, [deals, q]);

  console.log(filtered);

  return (
    <main className="mx-auto max-w-prose p-6 min-h-screen ">
      <h1 className="text-3xl font-semibold text-text-primary mb-6 tracking-tight bg-background-primary text-center">
        세일 모아보기
      </h1>
      
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="검색: nike, black friday, thanksgiving..."
        className="w-full bg-background-tertiary border border-border-primary rounded-md px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-fast mb-6"
      />
      
      <ul className="space-y-3">
        {filtered.map((d, i) => (
          <DealCard key={i} {...d} />
        ))}
      </ul>
    </main>
  );
}
