// Playwright로 Nike 같은 SPA 사이트에서 동적 데이터 추출
// pnpm add playwright && pnpm exec playwright install chromium
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';

type PD = {
  id: string; title: string; store: string; store_url: string;
  img?: string; price_now: number; price_was?: number|null;
  currency?: string; discount_pct?: number|null; ends_at?: string|null; category?: string[];
};

const pct = (now:number, was?:number|null) => was && was>0 ? Math.round((1 - now/was)*100) : null;

async function parsePageWithBrowser(url: string): Promise<PD[]> {
  console.log(`  🌐 Opening browser for: ${url}`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForTimeout(3000);
    
    const host = new URL(url).hostname;
    const out: PD[] = [];
    
    // 먼저 페이지에서 직접 추출 시도 (browser 닫기 전에)
    console.log(`    🔍 Extracting data from rendered page...`);
    
    const productData = await page.evaluate(() => {
      // DOM에서 직접 추출 - Nike 특화 셀렉터
      const title = document.querySelector('h1#pdp_product_title')?.textContent?.trim() || 
                   document.querySelector('h1[data-test*="product"]')?.textContent?.trim() ||
                   document.querySelector('h1')?.textContent?.trim() || '';
      
      // 디버깅: 모든 가격 관련 엘리먼트 찾기
      const debugInfo: string[] = [];
      
      // 가격 추출 - Nike의 다양한 가격 표시 방식
      let price = '';
      let wasPrice = '';
      
      // 방법 1: data-test 속성 - 할인가와 정가 모두 찾기
      const currentPriceEl = document.querySelector('[data-test="product-price"]');
      const fullPriceEl = document.querySelector('[data-test="product-price-reduced"]') || 
                         document.querySelector('[data-test="product-price-reduced-price"]');
      
      if (currentPriceEl) {
        debugInfo.push(`currentPriceEl: ${currentPriceEl.textContent}`);
        const text = currentPriceEl.textContent || '';
        // 여러 가격이 한 엘리먼트 안에 있을 수 있음: "₩50,000 ₩100,000"
        const allPrices = text.match(/[\d,]+(?:\.\d+)?/g);
        if (allPrices && allPrices.length > 0) {
          price = allPrices[0].replace(/,/g, '');
          if (allPrices.length > 1) {
            wasPrice = allPrices[1].replace(/,/g, '');
            debugInfo.push(`Found both prices in currentPriceEl: ${price} / ${wasPrice}`);
          }
        }
      } else {
        debugInfo.push('currentPriceEl NOT found');
      }
      
      if (fullPriceEl) {
        debugInfo.push(`fullPriceEl: ${fullPriceEl.textContent}`);
        const text = fullPriceEl.textContent || '';
        const match = text.match(/[\d,]+(?:\.\d+)?/);
        if (match && !wasPrice) {
          wasPrice = match[0].replace(/,/g, '');
          debugInfo.push(`Found wasPrice in fullPriceEl: ${wasPrice}`);
        }
      }
      
      // 방법 2: CSS 클래스 기반 - 정가 찾기
      if (!wasPrice) {
        const priceSelectors = [
          '[class*="full-price"]',
          '[class*="strikethrough"]',
          '[class*="was-price"]',
          '[class*="original-price"]',
          's[class*="price"]',  // <s> 태그 (취소선)
          'del[class*="price"]' // <del> 태그
        ];
        
        for (const sel of priceSelectors) {
          const el = document.querySelector(sel);
          if (el) {
            debugInfo.push(`${sel} found: ${el.textContent}`);
            const text = el.textContent || '';
            const match = text.match(/[\d,]+(?:\.\d+)?/);
            if (match) {
              wasPrice = match[0].replace(/,/g, '');
              debugInfo.push(`Found wasPrice via ${sel}: ${wasPrice}`);
              break;
            }
          }
        }
      }
      
      // 방법 3: 할인 표시가 있는 경우 주변 텍스트에서 찾기
      if (!wasPrice) {
        const saleIndicators = document.querySelectorAll('[class*="sale"], [class*="discount"], [data-test*="sale"]');
        saleIndicators.forEach(indicator => {
          if (!wasPrice) {
            const parent = indicator.parentElement;
            if (parent) {
              const text = parent.textContent || '';
              const prices = text.match(/[\d,]+(?:\.\d+)?/g);
              if (prices && prices.length > 1) {
                // 첫 번째가 할인가, 두 번째가 정가일 가능성
                if (!price) price = prices[0].replace(/,/g, '');
                wasPrice = prices[1].replace(/,/g, '');
                debugInfo.push(`Found prices near sale indicator: ${price} / ${wasPrice}`);
              }
            }
          }
        });
      }
      
      // 현재가 없으면 기본 셀렉터로 찾기
      if (!price) {
        const selectors = [
          '.product-price',
          '[class*="product-price"]',
          '[class*="currentPrice"]',
          '[class*="ProductPrice"]',
          'div[class*="price"] span',
        ];
        
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el) {
            debugInfo.push(`${sel} found: ${el.textContent}`);
            const text = el.textContent || '';
            const match = text.match(/[\d,]+(?:\.\d+)?/);
            if (match) {
              price = match[0].replace(/,/g, '');
              break;
            }
          }
        }
      }
      
      // 이미지
      const img = document.querySelector('img[data-test*="product"]')?.getAttribute('src') || 
                 document.querySelector('picture img')?.getAttribute('src') || 
                 document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
      
      return JSON.stringify({ title, price, wasPrice, img, debugInfo });
    });
    
    // HTML도 가져오기 (JSON-LD 파싱용)
    const html = await page.content();
    
    // 이제 브라우저 닫기
    await browser.close();
    
    // JSON-LD 파싱 시도
    const $ = cheerio.load(html);
    $('script[type="application/ld+json"]').each((_, el) => {
      const text = $(el).text().trim();
      if (!text) return;
      
      try {
        const node = JSON.parse(text);
        const arr = Array.isArray(node) ? node : [node];
        
        for (const entry of arr) {
          const candidates = entry['@graph'] ? ([] as any[]).concat(entry['@graph']) : [entry];
          for (const obj of candidates) {
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
              currency: offer?.priceCurrency || 'USD',
              discount_pct: pct(now, was),
              ends_at: null,
              category: obj.category ? ([] as string[]).concat(obj.category) : []
            });
          }
        }
      } catch {}
    });
    
    // JSON-LD 실패 시 DOM 추출 데이터 사용
    if (out.length === 0) {
      try {
        const data = JSON.parse(productData);
        
        // 디버깅 정보 출력
        if (data.debugInfo && data.debugInfo.length > 0) {
          console.log(`    🔍 Debug info:`);
          data.debugInfo.forEach((info: string) => console.log(`       ${info}`));
        }
        
        console.log(`    📦 Parsed data: title="${data.title?.substring(0,40)}...", price="${data.price}", wasPrice="${data.wasPrice || 'N/A'}"`);
        
        if (data.title && data.price) {
          const now = parseFloat(data.price);
          const was = data.wasPrice ? parseFloat(data.wasPrice) : null;
          
          if (!isNaN(now) && now > 0) {
            out.push({
              id: url,
              title: data.title,
              store: host,
              store_url: url,
              img: data.img || undefined,
              price_now: now,
              price_was: was && !isNaN(was) ? was : null,
              currency: data.price.includes('.') ? 'USD' : 'KRW',
              discount_pct: pct(now, was),
              ends_at: null,
              category: []
            });
          }
        }
      } catch (e) {
        console.log(`    ⚠️  Failed to parse extracted data: ${(e as Error).message}`);
      }
    }
    
    console.log(`    ✅ Found ${out.length} products`);
    return out;
    
  } catch (err) {
    console.log(`    ❌ Browser error: ${(err as Error).message}`);
    await browser.close();
    return [];
  }
}

(async () => {
  console.log("\n🚀 Starting product extraction with browser automation...\n");
  
  const rawArg = process.argv[2] || process.env.MAX_URLS || "";
  let urls: string[] = [];
  
  if (rawArg && /^https?:\/\//i.test(rawArg)) {
    urls = [rawArg];
  } else {
    urls = JSON.parse(await fs.readFile("data/sale_pages.json","utf-8"));
  }
  
  const requested = Number(rawArg || 0) || 0;
  const defaultCap = 10; // 브라우저 자동화는 느리므로 기본 10개로 제한
  const max = requested > 0 ? Math.min(requested, urls.length) : Math.min(urls.length, defaultCap);
  console.log(`📋 Found ${urls.length} sale pages (processing max ${max} with browser)\n`);
  console.log(`⚠️  This will be slower due to browser rendering...\n`);
  
  const all: PD[] = [];
  let processed = 0;
  
  for (const u of urls.slice(0, max)) {
    processed++;
    console.log(`[${processed}/${max}]`);
    try {
      all.push(...await parsePageWithBrowser(u));
    } catch (err) {
      console.log(`    parse error: ${(err as Error).message}`);
    }
    await new Promise(r => setTimeout(r, 2000)); // 더 긴 딜레이
  }
  
  console.log(`\n📊 Total products extracted: ${all.length}`);
  
  // discover.ts가 이미 sale 컨텍스트에서 URL을 수집했으므로
  // 유효한 상품 데이터(가격 있음)는 모두 세일 관련으로 간주
  const deals = all.filter(d => d.price_now > 0);
  
  console.log(`💰 Valid sale products: ${deals.length}\n`);
  
  await fs.writeFile("public/product_deals.json", JSON.stringify(deals, null, 2));
  console.log(`✅ Saved ${deals.length} sale products to public/product_deals.json\n`);
})();
