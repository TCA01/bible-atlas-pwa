# Implementation Guide for Hydrogen AI Coding Model

> **문서 목적**: 이 문서는 AI 코딩 모델(Hydrogen)이 `PRD.md`, `ARCHITECTURE.md`, `DATA_SCHEMA.md`를 바탕으로 실제 애플리케이션을 단계별로 코딩할 때 따라야 할 **구현 순서, 환경 설정, 단계별 프롬프트, 완료 조건(DoD)**을 제공합니다.

---

## 0. Hydrogen 모델 작업 원칙 (Coding Rules)
1. **타입 우선**: 구현 시작 전 `DATA_SCHEMA.md`의 `src/types/bible.ts` 및 `src/types/geo.ts`를 먼저 생성하세요.
2. **CSS Logical Properties 준수**: 아랍어 RTL 지원을 위해 `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-` 대신 반드시 `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`를 사용하세요.
3. **저작권 캐싱 준수**: `NIV`, `ESV`, `NRSV` 어댑터는 `allowOfflineCache: false`를 유지하고, 오프라인 IndexedDB 캐시는 `KJV` 및 퍼블릭 도메인 역본에만 적용하세요.
4. **지명 매칭 안전성**: 9개 언어 모두에서 지명이 누락되지 않도록 `verse-places.json` 인덱스와 `aliases[locale]` 매칭을 결합하세요.

---

## Phase 0: 프로젝트 부트스트랩 (Project Setup)

### 작업 내용
- Next.js 15 (App Router, TypeScript, Tailwind CSS) 프로젝트 초기화
- 필수 패키지 설치: `next-intl`, `zustand`, `dexie`, `maplibre-gl`, `lucide-react`, `@serwist/next`
- `.env.example` 생성 (`ESV_API_KEY=`, `API_BIBLE_KEY=`)
- `messages/` 아래 9개 언어(`en`, `ko`, `ja`, `zh-Hans`, `zh-Hant`, `es`, `pt`, `fr`, `de`, `ar`) 기본 UI 번역 파일 스캐폴딩
- `next-intl` 미들웨어 및 `[locale]/layout.tsx` (`dir="rtl"` for `ar`, `dir="ltr"` for others) 구성

### Hydrogen 실행 프롬프트
> "`docs/ARCHITECTURE.md`와 `docs/PRD.md`를 참고해 Next.js 15 App Router + TypeScript + Tailwind CSS 프로젝트를 초기화하고, `next-intl`로 9개 언어(기본 `en`, `ar`은 `dir="rtl"`) 라우팅과 9개 언어 폰트 로딩, `.env.example`을 구성해줘."

### 완료 조건 (DoD)
- `npm run dev` 실행 시 `/en`, `/ko`, `/ja`, `/ar` 라우트가 정상 렌더링되며 `/ar`에서 `<html dir="rtl">`이 적용됨.

---

## Phase 1: 하이브리드 성경 데이터 계층 (`BibleProvider`) & 시드 데이터

### 작업 내용
- `src/types/bible.ts` 생성
- `src/data/bible-pd/`에 시드 데이터 생성 (예: 창세기 1장, 시편 23편, 마태복음 5장, 사도행전 9장 — `KJV` 및 8개 언어 PD 역본 샘플, 사도행전 9장은 다메섹 지명 테스트용으로 필수 포함)
- `LocalPublicDomainProvider`, `EsvApiProvider`, `ApiBibleProvider` 및 `ProviderRegistry` 구현
- `/api/bible/[version]/[book]/[chapter]/route.ts` Route Handler 구현 (API 키 미설정 시 우아한 폴백 JSON 반환)

### Hydrogen 실행 프롬프트
> "`docs/DATA_SCHEMA.md`와 `docs/ARCHITECTURE.md`의 `BibleProvider` 설계를 바탕으로 `src/lib/bible-providers/` 어댑터들과 `/api/bible/[version]/[book]/[chapter]/route.ts`를 구현해줘. 테스트를 위해 사도행전 9장(다메섹 등장)과 창세기 1장을 포함한 KJV 및 8개 언어 퍼블릭 도메인 시드 데이터를 `src/data/bible-pd/`에 작성해줘."

### 완료 조건 (DoD)
- `GET /api/bible/KJV/ACT/9` 호출 시 200 OK와 사도행전 9장 JSON이 반환됨.
- `GET /api/bible/ESV/ACT/9` 호출 시 API 키가 있으면 ESV 응답을, 없으면 명확한 폴백 안내 코드를 반환함.

---

## Phase 2: 성경 리더 코어 & 문화권별 읽기 엔진 (`LTR / RTL / Vertical-RL`)

### 작업 내용
- `src/store/useReaderStore.ts` (Zustand) 및 `src/lib/db/dexie.ts` (IndexedDB 설정 영구 저장) 구현
- `BibleReader`, `VerseRenderer`, `TypographyDrawer` 구현:
  - 글씨 크기 (`14px`~`32px`), 줄간격 (`1.5`, `1.8`, `2.1`), 서체 (`Serif`/`Sans`), 테마 (`Light`/`Sepia`/`Dark`)
  - 일본어(`ja`) 기본 세로쓰기(`vertical-rl`) + `text-combine-upright: digits 2` 절 번호 + 가로쓰기 전환 토글
  - 중국어 번체(`zh-Hant`) 세로쓰기 선택 토글
  - 마우스 휠 → 가로 스크롤 변환 훅 (`useVerticalWheelScroll`)
- 언어 선택기 (9개 언어) 및 역본 선택기 (영어 선택 시 `NIV, ESV, NRSV, KJV` 노출)

### Hydrogen 실행 프롬프트
> "`docs/PRD.md` 섹션 3과 `docs/ARCHITECTURE.md` 섹션 4를 참고하여 `BibleReader`, `TypographyDrawer`, `LanguageSelector`, `VersionSelector`를 구현해줘. 특히 일본어(`ja`)의 세로쓰기(`vertical-rl`, 절 번호 `text-combine-upright`, 마우스 휠 가로 스크롤)와 아랍어(`ar`)의 RTL 미러링, 그리고 글씨 크기·테마의 IndexedDB 저장이 완벽히 동작해야 해."

### 완료 조건 (DoD)
- 일본어 선택 시 세로쓰기로 렌더링되고 마우스 휠로 자연스럽게 스크롤되며, 토글 버튼으로 가로쓰기 전환 가능.
- 글씨 크기와 Sepia/Dark 테마 변경 후 새로고침해도 설정이 유지됨.

---

## Phase 3: 본문 인라인 지명 하이라이트 & 인터랙티브 지도 패널

### 작업 내용
- `src/types/geo.ts` 생성 및 `src/data/geo/places.json` (다메섹, 예루살렘, 갈릴리, 베들레헴, 바벨론, 고린도, 로마 등 최소 15개 핵심 성경 지명의 9개 언어 고대↔현대 지명 및 해설) 작성
- `src/data/geo/verse-places.json` 작성 (예: `ACT.9.3`, `ACT.9.11` → `["damascus"]`)
- `PlaceHighlight` 컴포넌트 구현 (본문 내 지명 점선 밑줄 + 클릭 시 상태 업데이트)
- `MapPanel` (데스크톱 우측/좌측 사이드 패널) & `BottomSheetMap` (모바일 바텀 시트) 구현
- `BiblicalMap` (`maplibre-gl` + OpenFreeMap 벡터 타일 + `flyTo` 애니메이션) 및 `PlaceCard` (고대↔현대 비교 배지, 9개 언어 해설 탭, 관련 구절 이동 버튼) 구현

### Hydrogen 실행 프롬프트
> "`docs/DATA_SCHEMA.md`의 `BiblicalPlace` 스키마와 다메섹 샘플을 참고해 `src/data/geo/places.json`(핵심 지명 15개 이상)과 `verse-places.json`을 작성하고, 본문 지명 클릭 시 MapLibre GL JS 지도 패널과 고대↔현대 지명 비교 카드가 열리는 기능을 구현해줘. 데스크톱은 사이드 패널, 모바일은 바텀 시트로 반응형 동작해야 해."

### 완료 조건 (DoD)
- 사도행전 9장에서 `Damascus` / `다메섹` / `ダマスコ` / `دمشق` 클릭 시 지도가 시리아 다마스쿠스(`[36.2913, 33.5138]`)로 이동하고 해당 언어의 고대↔현대 해설이 표시됨.

---

## Phase 4: 독립 성경 지도 (Atlas) 탭 & 시대별 여정 오버레이

### 작업 내용
- `src/data/geo/journeys.json` 작성 (출애굽 경로, 예수님 갈릴리-예루살렘 사역, 바울의 다메섹 회심 및 1차 선교여행 GeoJSON)
- `[locale]/atlas/page.tsx` 독립 지도 탐색 페이지 구현
- `JourneyTimeline` 컴포넌트: 여정 선택 → `이전/다음` 스텝으로 경유지 이동 → 지도 경로 하이라이트 + 관련 성경 장 바로 열기
- 다국어 지명 검색 바 (고대 지명/현대 지명 모두 검색 가능)

### Hydrogen 실행 프롬프트
> "`docs/PRD.md` 섹션 4.2에 따라 `/[locale]/atlas` 독립 성경 지도 페이지를 구현해줘. `journeys.json`에 출애굽·예수님 사역·바울 선교여행 GeoJSON 경로를 정의하고, 스텝별 타임라인과 9개 언어 지명 검색 기능을 연결해줘."

### 완료 조건 (DoD)
- Atlas 탭에서 여정을 선택하면 지도 위에 경로 선과 경유지 핀이 그려지고, 스텝 이동 및 지명 검색이 정상 동작함.

---

## Phase 5: Local-First 개인화 기능 & PWA 오프라인 완성

### 작업 내용
- 절 클릭 시 컨텍스트 메뉴: **북마크**, **4색 형광펜 하이라이트**, **묵상 메모 작성/수정** (IndexedDB 저장)
- 내 서재(북마크/하이라이트/메모 모아보기) 드로어/모달
- `Serwist` Service Worker 설정: 앱 셸, PD 성경 JSON, 지리/해설 JSON 오프라인 캐싱
- PWA 매니페스트 및 설치 안내 배너

### Hydrogen 실행 프롬프트
> "Dexie.js(IndexedDB)를 이용해 구절 북마크, 4색 하이라이트, 묵상 메모 기능을 구현하고, Serwist로 PWA 오프라인 캐싱을 적용해줘. 저작권 역본(`allowOfflineCache: false`)은 오프라인 캐시에서 제외되는지 확인해줘."

### 완료 조건 (DoD)
- 브라우저 개발자 도구에서 네트워크를 `Offline`으로 전환해도 KJV 본문과 지도 해설 JSON, 북마크/메모가 정상 작동함.

---

## Phase 6: 최종 검증 & Capacitor 모바일 확장 준비

### 작업 내용
- 9개 언어 × 3가지 읽기 방향(`LTR`, `RTL`, `Vertical-RL`) 반응형 레이아웃 및 접근성(`aria-label`, 키보드 내비게이션) 점검
- `npm run build` 및 TypeScript 타입 체크(`tsc --noEmit`) 통과 확인
- 추후 iOS/Android 패키징을 위한 `capacitor.config.ts` 템플릿 추가 (선택)
