# agents.md — Korea “All Benefits At A Glance”

> Desktop-first Next.js project with AI-assisted aggregation of **public, no‑login** benefits (payments, cards/banks public pages, telco memberships, retailers, public sector).

---

## 0) Principles (필수 원칙)

* **No login / no personal data scraping.** 공개 랜딩/공지/보도자료만 대상으로 함.
* **Legal & robots.txt first.** 각 도메인 ToS, robots.txt 준수. Blocked path는 제외.
* **Polite crawling.** User-Agent 지정, ETag/If-Modified-Since 사용, 도메인별 쿨다운 적용.
* **Deterministic JSON contracts.** 모든 에이전트는 아래 공용 스키마로 입·출력을 주고받음.
* **Human-in-the-loop.** 커뮤니티 제보/운영자 승인 큐를 둬서 품질 보정.

---

## 1) Data Contracts (JSON Schemas)

### 1.1 Source (수집 대상)

```json
{
  "provider": "kakaopay|toss|naverpay|card|bank|telco|merchant|public",
  "brand": "Agoda",
  "url": "https://www.agoda.com/ko-kr/kakaopay-deal",
  "selectors": ["h1", ".promo", "time[datetime]"],
  "region": "KR",
  "notes": "공개 랜딩. 쿠폰 코드 본문 포함"
}
```

### 1.2 Deal (정규화된 혜택)

```json
{
  "id": "sha256(provider|brand|title|value_text|source_url)",
  "provider": "kakaopay",
  "brand": "Agoda",
  "title": "카카오페이 결제 11% 할인",
  "benefit_type": "discount|cashback|coupon|points",
  "value_text": "최대 1만원",
  "category": ["여행"],
  "channel": "online|offline|both",
  "region": "KR",
  "start_date": "2025-10-01",
  "end_date": "2025-11-30",
  "login_required": false,
  "source_url": "https://...",
  "source_badge": "official|partner|editorial|community",
  "season": ["black-friday"],
  "score": 0,
  "last_seen": "2025-10-31T12:00:00+09:00",
  "raw_excerpt": "본문 160~220자 요약"
}
```

### 1.3 Change Event (변경 감지)

```json
{
  "source_url": "https://...",
  "brand": "Agoda",
  "old_hash": "...",
  "new_hash": "...",
  "diff_summary": "할인율 8%→11%",
  "detected_at": "2025-10-31T10:12:00+09:00"
}
```

---

## 2) Agents (역할 정의)

### A. Source Catalog Agent (소스 카탈로그)

* 역할: `data/sources.*.json` 유지. 신규 브랜드/공식 페이지 추가, 죽은 링크 제거.
* 입력: 운영자 PR 또는 제보 폼.
* 출력: 최신 소스 JSON.

### B. Static Crawl Agent (정적 수집)

* 역할: axios + Cheerio로 정적 HTML에서 텍스트/타이틀/타임스탬프 추출.
* 출력: `raw/{date}/{host}.html` (옵션), `staging/raw.jsonl`.

### C. Dynamic Crawl Agent (동적 폴백)

* 역할: Playwright headless로 렌더 후 동일 추출.
* 정책: 필요 도메인에만 제한적으로 사용 (무거움).

### D. Diff Agent (변경 감지)

* 역할: 정상화된 텍스트 → `normalize()` → SHA-256 해시 비교. 바뀐 페이지만 이벤트 생성.
* 출력: `events/changes.jsonl`, Slack/Discord 알림 페이로드.

### E. Extraction Agent (AI NER)

* 역할: 본문에서 `benefit_type/value_text/channel/start/end/login_required/category/season` 추출.
* 방법: OpenAI/Anthropic JSON 모드 프롬프트, 실패 시 규칙 기반 정규식 백업.
* 출력: `staging/extracted.jsonl`.

### F. Dedup & Merge Agent (중복/정합)

* 역할: `brand` 표준화(동의어 사전), 동일 `brand+title+value_text` 병합, 최고 할인치 우선.
* 출력: `build/deals.json` (최종 통합본).

### G. Ranking Agent (스코어링)

* 규칙 예시: +3(만료 ≤7일), +2(할인 수치 검출), +2(공식/파트너 배지), +1(48h 내 최신), +Season boost.

### H. Seasonality Agent (시즌 필터)

* 역할: 블랙프라이데이/추석/신학기/여름휴가 등 키워드·기간 매칭해 `season` 태깅.

### I. Moderation Agent (모더레이션)

* 역할: 커뮤니티 제보/스팸 필터, 18+/불법/사기성 링크 차단.

### J. Notification Agent (알림)

* 역할: “신규/변경/만료 임박” 묶음 요약을 Slack/Telegram/Email로 배포.

### K. Admin Copilot Agent (운영 코파일럿)

* 역할: `/add-source`, `/mute-domain`, `/rebuild`, `/rank-tune weight=season:3` 같은 슬래시 명령 지원.

---

## 3) Workflows

### Daily Scheduled (GitHub Actions / 4–6h)

1. Static Crawl → Dynamic Crawl 폴백
2. Diff → Changes 이벤트 생성
3. Extraction (AI) → 실패 시 regex 백업
4. Dedup & Rank → `public/deals.json` 갱신
5. Notify 요약 전송

### On-Demand (운영자)

* `/crawl url=...` 특정 도메인 즉시 수집
* `/rebuild` 파이프라인 전체 재실행

---

## 4) Prompt Templates (요약)

**ko/en Deal Extraction (JSON only)**

```
You are an information extraction agent for public Korean deals.
Return strict JSON with keys: benefit_type, value_text, channel, region, start_date, end_date, login_required, category, season, source_badge.
If unknown, set null.
Text:
---
{{TEXT}}
---
URL: {{URL}}
```

**Season Tagger**

```
Classify if the text is about seasonal campaigns: black-friday, cyber-monday, chuseok, new-year, back-to-school, summer.
Return an array of slugs.
```

---

## 5) Scheduling & Limits

* GitHub Actions cron: `0 */6 * * *` (11월 넷째 주 임시 `*/2`).
* Per-domain rate: 1 req / 5–10s, 백오프: 5s, 15s, 45s…
* Timeout: 20–45s (dynamic 60s).

---

## 6) Metrics (운영 지표)

* Freshness(48h 내 업데이트 %) / Duplicate rate / Extraction failure rate
* CTR(원문 이동), Report rate, Mean time-to-publish

---

## 7) Security & Compliance

* PI 최소화(없음), HTTPS only, 서드파티 스크립트 제한.
* 출처 배지 및 원문 링크 의무 표기. 허위/사기 신고 채널 제공.

---

## 8) Local Dev Runbook

* `pnpm crawl` → `staging/raw.jsonl`
* `pnpm extract` → `staging/extracted.jsonl`
* `pnpm build:deals` → `public/deals.json`
* `pnpm dev` → Next.js UI

`.env.example`

```
OPENAI_API_KEY=
SLACK_WEBHOOK_URL=
```

---

## 9) Future

* Browser extension badge ("혜택 있음")
* User submission queue with AI pre-check
* Public data partnerships (지자체/기관 RSS)

---

**End of agents.md**
