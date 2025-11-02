// pnpm add cheerio
import * as cheerio from "cheerio";
import fs from "fs/promises";

type PD = {
  id: string; title: string; store: string; store_url: string;
  img?: string; price_now: number; price_was?: number|null;
  currency?: string; discount_pct?: number|null; ends_at?: string|null; category?: string[];
};

const pct = (now:number, was?:number|null) => was && was>0 ? Math.round((1 - now/was)*100) : null;

async function parsePage(url:string): Promise<PD[]> {
  console.log(`  Fetching: ${url}`);
  const r = await fetch(url, { headers: { "User-Agent":"Mozilla/5.0" } });
  if (!r.ok) {
    console.log(`    ❌ Failed (${r.status})`);
    return [];
  }
  const html = await r.text();
  const $ = cheerio.load(html); const host=new URL(url).hostname;
  const out:PD[] = [];

  // More robust JSON-LD parsing: handle arrays, @graph, escaped JSON and small malformed cases
  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).text().trim();
    if (!text) return;

    const tryParse = (s: string) => {
      try { return JSON.parse(s); } catch { return null; }
    };

    // Try raw parse first
    let node = tryParse(text);

    // If raw parse failed, try to extract a JSON substring (recover from surrounding HTML/JS)
    if (!node) {
      const first = text.indexOf("{");
      const last = text.lastIndexOf("}");
      if (first !== -1 && last !== -1 && last > first) {
        node = tryParse(text.slice(first, last + 1));
      }
    }

    // If still not parsed, try unescaping common HTML entities and parse again
    if (!node) {
      const unescaped = text.replace(/&quot;|&#34;/g, '"').replace(/&amp;/g, '&');
      node = tryParse(unescaped);
    }

    if (!node) return;

    const arr = Array.isArray(node) ? node : [node];
    for (const entry of arr) {
      // support top-level @graph arrays
      const candidates = entry['@graph'] ? ([] as any[]).concat(entry['@graph']) : [entry];
      for (const obj of candidates) {
        try {
          const types = ([] as string[]).concat(obj['@type'] ?? []);
          if (!types.includes('Product')) continue;
          const offer = Array.isArray(obj.offers) ? obj.offers[0] : obj.offers;
          const now = Number(offer?.price ?? 0);
          const was = Number(offer?.priceSpecification?.price ?? 0) || null;
          out.push({
            id: (obj.sku || obj.name || obj.url || url) + ':' + (offer?.sku || ''),
            title: obj.name,
            store: host,
            store_url: obj.url || url,
            img: Array.isArray(obj.image) ? obj.image[0] : obj.image,
            price_now: now,
            price_was: was,
            currency: offer?.priceCurrency || 'KRW',
            discount_pct: pct(now, was),
            ends_at: null,
            category: obj.category ? ([] as string[]).concat(obj.category) : []
          });
        } catch (err) {
          // ignore per-object parse errors
        }
      }
    }
  });

  // Fallback: if no JSON-LD Product found, try extracting from meta/og tags
  if (out.length === 0) {
    const title = $('meta[property="og:title"]').attr('content') 
                || $('meta[name="og:title"]').attr('content')
                || $('title').text()
                || $('h1').first().text().trim();
    
    const img = $('meta[property="og:image"]').attr('content')
              || $('meta[name="og:image"]').attr('content');
    
    // Try various price meta tags (og:price:amount, product:price:amount, itemprop="price")
    const priceStr = $('meta[property="og:price:amount"]').attr('content')
                  || $('meta[property="product:price:amount"]').attr('content')
                  || $('meta[itemprop="price"]').attr('content')
                  || $('[itemprop="price"]').attr('content')
                  || $('[data-price]').attr('data-price');
    
    const currency = $('meta[property="og:price:currency"]').attr('content')
                  || $('meta[property="product:price:currency"]').attr('content')
                  || 'KRW';
    
    if (title && priceStr) {
      const now = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
      if (!isNaN(now) && now > 0) {
        out.push({
          id: url,
          title,
          store: host,
          store_url: url,
          img,
          price_now: now,
          price_was: null,
          currency,
          discount_pct: null,
          ends_at: null,
          category: []
        });
        console.log(`    ✅ Found 1 product (via meta/og fallback)`);
      }
    }
  } else {
    console.log(`    ✅ Found ${out.length} products`);
  }
  
  return out;
}

(async () => {
  console.log("\n🚀 Starting product extraction...\n");
  
  const rawArg = process.argv[2] || process.env.MAX_URLS || "";
  let urls: string[] = [];
  // If user passed a single URL as the first arg, process only that URL (helpful for testing)
  if (rawArg && /^https?:\/\//i.test(rawArg)) {
    urls = [rawArg];
  } else {
    urls = JSON.parse(await fs.readFile("data/sale_pages.json","utf-8"));
  }
  // Allow user to override max via numeric CLI arg or env var MAX_URLS
  const requested = Number(rawArg || 0) || 0;
  const defaultCap = 100; // polite default cap to avoid accidental huge runs
  const max = requested > 0 ? Math.min(requested, urls.length) : Math.min(urls.length, defaultCap);
  console.log(`📋 Found ${urls.length} sale pages (processing max ${max})\n`);

  const all: PD[] = [];
  let processed = 0;
  for (const u of urls.slice(0, max)) {
    processed++;
    console.log(`[${processed}/${max}] ${u}`);
    try { all.push(...await parsePage(u)); } catch (err) { console.log(`    parse error: ${(err as Error).message}`); }
    await new Promise(r => setTimeout(r, 1500));      // polite delay
  }
  
  console.log(`\n📊 Total products extracted: ${all.length}`);
  const deals = all.filter(d => (d.discount_pct ?? 0) > 0 || (d.price_was ?? 0) > d.price_now);
  console.log(`💰 Products with discounts: ${deals.length}\n`);
  
  await fs.writeFile("public/product_deals.json", JSON.stringify(deals, null, 2));
  console.log(`✅ Saved to public/product_deals.json\n`);
})();
