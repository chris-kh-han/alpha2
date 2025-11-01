// pnpm add cheerio
import * as cheerio from "cheerio";
import fs from "fs/promises";

const KW = /(sale|markdown|clearance|outlet|promotion|promo|deals|event|할인|세일|특가|기획전|핫딜|쿠폰|프로모션|행사|이벤트)/i;

async function get(url:string) {
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(String(r.status));
  return r.text();
}
async function fromSitemap(base:string) {
  console.log("📍 Checking sitemaps...");
  const out:string[] = [];
  const paths = new Set(["/sitemap.xml", "/sitemap_index.xml"]);
  
  // robots.txt에서 sitemap 경로 추출
  try {
    const robots = await get(new URL("/robots.txt", base).toString());
    const sitemapLines = robots.match(/Sitemap:\s*(https?:\/\/[^\s]+)/gi) || [];
    for (const line of sitemapLines) {
      const url = line.replace(/Sitemap:\s*/i, '').trim();
      paths.add(new URL(url).pathname);
    }
    console.log(`  Found ${paths.size} sitemap(s)`);
  } catch {}
  
  // 모든 sitemap 경로 시도
  for (const p of Array.from(paths)) {
    try {
      const xml = await get(new URL(p, base).toString());
      const locs = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map(m=>m[1]);
      for (const u of locs) if (KW.test(u)) out.push(u);
    } catch {}
  }
  console.log(`  ✅ Found ${out.length} sale URLs from sitemaps`);
  return out;
}
async function crawl(base:string, max=120) {
  console.log("🕷️  Crawling website...");
  const origin = new URL(base).origin;
  const q=[origin]; const seen=new Set<string>(); const found=new Set<string>();
  while(q.length && seen.size<max){
    const u=q.shift()!; if(seen.has(u)) continue; seen.add(u);
    if (seen.size % 10 === 0) console.log(`  Crawled ${seen.size} pages...`);
    try{
      const html = await get(u); const $=cheerio.load(html);
      $("a[href]").each((_,a)=>{
        const href=$(a).attr("href")||""; try{
          const link=new URL(href, origin);
          if(link.origin!==origin) return;
          const s=link.toString();
          const hay=[s,$(a).text(),$("title").text()].join(" ");
          if(KW.test(hay)) found.add(s);
          if(!seen.has(s) && q.length<max) q.push(s);
        }catch{}
      });
    }catch{}
  }
  console.log(`  ✅ Found ${found.size} sale URLs from crawling`);
  return Array.from(found);
}
async function main(domain:string){
  console.log(`\n🚀 Starting discovery for: ${domain}\n`);
  const base = domain.startsWith("http")?domain:`https://${domain}`;
  const guesses = ["/collections/sale","/collections/markdown","/pages/promotion"].map(p=>new URL(p,base).toString());
  const list = Array.from(new Set([...(await fromSitemap(base)), ...(await crawl(base)), ...guesses]));
  
  console.log(`\n💾 Saving to data/sale_pages.json...`);
  await fs.mkdir("data", { recursive: true });
  await fs.writeFile("data/sale_pages.json", JSON.stringify(list, null, 2));
  console.log(`\n✅ Done! Found ${list.length} sale pages total\n`);
}




main(process.argv[2] || "www.nike.com");
