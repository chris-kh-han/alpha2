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

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const node = JSON.parse($(el).text());
      const arr = Array.isArray(node) ? node : [node];
      for (const obj of arr) {
        const types = ([] as string[]).concat(obj["@type"] ?? []);
        if (!types.includes("Product")) continue;
        const offer = Array.isArray(obj.offers) ? obj.offers[0] : obj.offers;
        const now = Number(offer?.price ?? 0);
        const was = Number(offer?.priceSpecification?.price ?? 0) || null;
        out.push({
          id: (obj.sku || obj.name || obj.url || url)+":"+(offer?.sku||""),
          title: obj.name,
          store: host,
          store_url: obj.url || url,
          img: Array.isArray(obj.image) ? obj.image[0] : obj.image,
          price_now: now,
          price_was: was,
          currency: offer?.priceCurrency || "KRW",
          discount_pct: pct(now, was),
          ends_at: null,
          category: obj.category ? ([] as string[]).concat(obj.category) : []
        });
      }
    } catch {}
  });
  console.log(`    ✅ Found ${out.length} products`);
  return out;
}

(async () => {
  console.log("\n🚀 Starting product extraction...\n");
  
  const urls: string[] = JSON.parse(await fs.readFile("data/sale_pages.json","utf-8"));
  console.log(`📋 Found ${urls.length} sale pages (processing max 40)\n`);
  
  const all: PD[] = [];
  let processed = 0;
  for (const u of urls.slice(0, 40)) {                // 과도한 호출 방지(최대 40)
    processed++;
    console.log(`[${processed}/40]`);
    try { all.push(...await parsePage(u)); } catch {}
    await new Promise(r => setTimeout(r, 1500));      // polite delay
  }
  
  console.log(`\n📊 Total products extracted: ${all.length}`);
  const deals = all.filter(d => (d.discount_pct ?? 0) > 0 || (d.price_was ?? 0) > d.price_now);
  console.log(`💰 Products with discounts: ${deals.length}\n`);
  
  await fs.writeFile("public/product_deals.json", JSON.stringify(deals, null, 2));
  console.log(`✅ Saved to public/product_deals.json\n`);
})();
