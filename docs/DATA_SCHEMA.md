# Data Schema & TypeScript Interfaces

> **문서 목적**: 이 문서는 성경 본문, 9개 언어 지원, 고대↔현대 지명 해설, 시대별 여정 GeoJSON, 그리고 Phase 1(IndexedDB) / Phase 2(PostgreSQL) 저장소 스키마를 정의합니다. Hydrogen 모델은 이 파일의 TypeScript 타입을 `src/types/`에 그대로 복사하여 사용할 수 있습니다.

---

## 1. Core TypeScript Interfaces (`src/types/bible.ts`)

```typescript
export type LanguageCode =
  | 'en'      // English (Default)
  | 'ko'      // Korean
  | 'ja'      // Japanese
  | 'zh-Hans' // Chinese Simplified
  | 'zh-Hant' // Chinese Traditional
  | 'es'      // Spanish
  | 'pt'      // Portuguese
  | 'fr'      // French
  | 'de'      // German
  | 'ar';     // Arabic

export type WritingMode = 'ltr' | 'rtl' | 'vertical-rl';

export type EnglishVersionId = 'NIV' | 'ESV' | 'NRSV' | 'KJV';

export type BibleVersionId =
  | EnglishVersionId
  | 'KRV'     // Korean Revised Version (PD)
  | 'KOUGO'   // Japanese Kougo-yaku (PD)
  | 'CUVS'    // Chinese Union Version Simplified (PD)
  | 'CUVT'    // Chinese Union Version Traditional (PD)
  | 'RV1909'  // Spanish Reina-Valera 1909 (PD)
  | 'ACF'     // Portuguese Almeida (PD)
  | 'LSG'     // French Louis Segond 1910 (PD)
  | 'LUT1912' // German Luther 1912 (PD)
  | 'SVD';    // Arabic Smith & Van Dyck (PD)

export interface BibleVersionMeta {
  id: BibleVersionId;
  name: string;
  abbreviation: string;
  language: LanguageCode;
  copyrightNotice: string;
  isPublicDomain: boolean;
  allowOfflineCache: boolean; // 저작권 보호 역본(NIV, ESV, NRSV)은 false
  providerType: 'local-pd' | 'esv-api' | 'api-bible';
}

export interface BibleVerse {
  verse: number;
  text: string;
  placeIds?: string[]; // 해당 절에 등장하는 지명 ID 목록 (예: ["damascus"])
}

export interface BibleChapter {
  version: BibleVersionId;
  bookId: string;       // OSIS/USFM 표준 3자리 코드 (예: "GEN", "MAT", "ACT")
  bookName: string;     // 현재 언어 책 이름
  chapter: number;
  totalChapters: number;
  verses: BibleVerse[];
  copyright: string;
}

export interface BibleProvider {
  readonly id: string;
  supportsVersion(version: BibleVersionId): boolean;
  getChapter(
    version: BibleVersionId,
    bookId: string,
    chapter: number
  ): Promise<BibleChapter>;
  search?(
    version: BibleVersionId,
    query: string,
    limit?: number
  ): Promise<Array<{ bookId: string; chapter: number; verse: number; text: string }>>;
}
```

---

## 2. 성경 지명 & 역사·지리 해설 스키마 (`src/types/geo.ts`)

```typescript
export type LocationConfidence = 'certain' | 'probable' | 'uncertain';

export type BiblicalEra =
  | 'patriarchs'     // 족장 시대
  | 'exodus'         // 출애굽 & 광야
  | 'conquest'       // 사사 & 정복 시대
  | 'united_kingdom' // 통일 왕국
  | 'divided_kingdom'// 분열 왕국 & 포로기
  | 'gospels'        // 복음서 (예수님 사역)
  | 'apostolic';     // 사도행전 & 초대교회

export interface LocalizedText {
  en: string;
  ko: string;
  ja: string;
  'zh-Hans': string;
  'zh-Hant': string;
  es: string;
  pt: string;
  fr: string;
  de: string;
  ar: string;
}

export interface BiblicalPlace {
  id: string;                      // 고유 슬러그 (예: "damascus")
  ancientName: LocalizedText;      // 성경 속 고대 지명 (예: en: "Damascus", ko: "다메섹")
  modernName: LocalizedText;       // 현대 도시명 (예: ko: "다마스쿠스")
  modernCountry: LocalizedText;    // 현대 국가명 (예: ko: "시리아", en: "Syria")
  modernCountryCode: string;       // ISO 3166-1 alpha-2 (예: "SY")
  coordinates: [number, number];   // [longitude, latitude] (GeoJSON 표준 순서)
  confidence: LocationConfidence;
  eras: BiblicalEra[];
  aliases: Record<LanguageCode, string[]>; // 본문 매칭 및 검색용 별칭 배열
  commentary: {
    summary: LocalizedText;        // 한 줄 핵심 요약
    geography: LocalizedText;      // 지리적 특징 및 배경
    biblicalEvents: LocalizedText; // 성경 속 주요 사건
    modernContext: LocalizedText;  // 현재 모습 및 고고학 정보
  };
  keyVerses: Array<{
    bookId: string;
    chapter: number;
    verse: number;
    label: LocalizedText;
  }>;
}

export interface BiblicalJourney {
  id: string;                      // 예: "paul-conversion-damascus"
  era: BiblicalEra;
  title: LocalizedText;
  description: LocalizedText;
  color: string;                   // 지도 경로 색상 (Hex)
  waypoints: Array<{
    step: number;
    placeId: string;
    title: LocalizedText;
    description: LocalizedText;
    verseRef: { bookId: string; chapter: number; verse: number };
  }>;
  geometry: {
    type: 'LineString';
    coordinates: Array<[number, number]>; // [lng, lat] 배열
  };
}
```

### 2.1 지명 데이터 샘플 (`src/data/geo/places.json` 예시 — 다메섹)

```json
[
  {
    "id": "damascus",
    "ancientName": {
      "en": "Damascus",
      "ko": "다메섹",
      "ja": "ダマスコ",
      "zh-Hans": "大马士革",
      "zh-Hant": "大馬士革",
      "es": "Damasco",
      "pt": "Damasco",
      "fr": "Damas",
      "de": "Damaskus",
      "ar": "دمشق"
    },
    "modernName": {
      "en": "Damascus",
      "ko": "다마스쿠스",
      "ja": "ダマスカス",
      "zh-Hans": "大马士革",
      "zh-Hant": "大馬士革",
      "es": "Damasco",
      "pt": "Damasco",
      "fr": "Damas",
      "de": "Damaskus",
      "ar": "دمشق"
    },
    "modernCountry": {
      "en": "Syria",
      "ko": "시리아",
      "ja": "シリア",
      "zh-Hans": "叙利亚",
      "zh-Hant": "敘利亞",
      "es": "Siria",
      "pt": "Síria",
      "fr": "Syrie",
      "de": "Syrien",
      "ar": "سوريا"
    },
    "modernCountryCode": "SY",
    "coordinates": [36.2913, 33.5138],
    "confidence": "certain",
    "eras": ["patriarchs", "divided_kingdom", "apostolic"],
    "aliases": {
      "en": ["Damascus"],
      "ko": ["다메섹", "다마스쿠스"],
      "ja": ["ダマスコ", "ダマスカス"],
      "zh-Hans": ["大马士革"],
      "zh-Hant": ["大馬士革"],
      "es": ["Damasco"],
      "pt": ["Damasco"],
      "fr": ["Damas"],
      "de": ["Damaskus"],
      "ar": ["دمشق"]
    },
    "commentary": {
      "summary": {
        "en": "Ancient oasis capital of Aram and Syria, site of Saul's (Paul's) conversion.",
        "ko": "아람(시리아)의 고대 오아시스 수도이자, 사울(바울)이 부활하신 예수를 만나 회심한 곳입니다.",
        "ja": "アラムの古代オアシス都市であり、サウロ（パウロ）が回心した地として知られます。",
        "zh-Hans": "亚兰古国的绿洲首都，也是扫罗（保罗）归主的地方。",
        "zh-Hant": "亞蘭古國的綠洲首都，也是掃羅（保羅）歸主的地方。",
        "es": "Antigua capital oasis de Aram, lugar de la conversión de Saulo (Pablo).",
        "pt": "Antiga capital oásis de Arã, local da conversão de Saulo (Paulo).",
        "fr": "Ancienne capitale oasis d'Aram, lieu de la conversion de Saul (Paul).",
        "de": "Antike Oasenstadt von Aram, Ort der Bekehrung des Saulus (Paulus).",
        "ar": "عاصمة آرام القديمة وواحة تاريخية، ومكان اهتداء شاول (بولس)."
      },
      "geography": {
        "en": "Located east of the Anti-Lebanon mountains, watered by the Barada (Abana) River.",
        "ko": "안티레바논 산맥 동쪽 기슭에 위치하며 바라다(아바나) 강이 사막을 적셔 비옥한 오아시스를 이룹니다.",
        "ja": "アンチレバノン山脈の東麓に位置し、バラダ川（アバナ川）の恵みを受けたオアシス都市です。",
        "zh-Hans": "位于安提黎巴嫩山脉东麓，因巴拉达河（亚罢拿河）灌溉而成为肥沃绿洲。",
        "zh-Hant": "位於安提黎巴嫩山脈東麓，因巴拉達河（亞罷拿河）灌溉而成為肥沃綠洲。",
        "es": "Situada al este de las montañas del Antilíbano, regada por el río Barada (Abana).",
        "pt": "Localizada a leste das montanhas do Antilíbano, irrigada pelo rio Barada (Abana).",
        "fr": "Située à l'est de l'Anti-Liban, irriguée par la rivière Barada (Abana).",
        "de": "Östlich des Antilibanon-Gebirges gelegen, bewässert vom Fluss Barada (Abana).",
        "ar": "تقع شرق جبال لبنان الشرقية ويرويها نهر بردى (أبانة)."
      },
      "biblicalEvents": {
        "en": "Mentioned in Genesis 14-15 (Eliezer of Damascus), 2 Kings 5 (Naaman), and Acts 9 (Paul's conversion and Straight Street).",
        "ko": "창세기 15장(아브라함의 종 엘리에셀), 열왕기하 5장(나아만 장군), 사도행전 9장(사울의 회심과 '직가'라 불리는 거리)에 등장합니다.",
        "ja": "創世記15章（エリエゼル）、列王記下5章（ナアマン）、使徒言行録9章（パウロの回心と『まっすぐな通り』）に登場します。",
        "zh-Hans": "见于创世记15章（以利以谢）、列王纪下5章（乃缦）以及使徒行传9章（保罗归主与直街）。",
        "zh-Hant": "見於創世記15章（以利以謝）、列王紀下5章（乃縵）以及使徒行傳9章（保羅歸主與直街）。",
        "es": "Mencionada en Génesis 15, 2 Reyes 5 (Naamán) y Hechos 9 (conversión de Pablo y la calle llamada Derecha).",
        "pt": "Mencionada em Gênesis 15, 2 Reis 5 (Naamã) e Atos 9 (conversão de Paulo e a Rua Direita).",
        "fr": "Mentionnée dans Genèse 15, 2 Rois 5 (Naaman) et Actes 9 (conversion de Paul et la rue Droite).",
        "de": "Erwähnt in 1. Mose 15, 2. Könige 5 (Naaman) und Apostelgeschichte 9 (Bekehrung des Paulus und die Gerade Straße).",
        "ar": "ورد ذكرها في تكوين 15، وملوك الثاني 5 (نعمان)، وأعمال الرسل 9 (اهتداء بولس والشارع المستقيم)."
      },
      "modernContext": {
        "en": "Today's Damascus is the capital of Syria and one of the oldest continuously inhabited cities in the world; 'Straight Street' (Via Recta) still exists in the Old City.",
        "ko": "오늘날 시리아의 수도이며 세계에서 가장 오래된 연속 거주 도시 중 하나입니다. 사도행전에 기록된 '직가(Via Recta)'는 현재 다마스쿠스 구시가지에도 보존되어 있습니다.",
        "ja": "現在のシリアの首都であり、世界で最も古くから人が住み続ける都市の一つです。使徒言行録の『まっすぐな通り』も旧市街に残っています。",
        "zh-Hans": "今天的叙利亚首都，是世界上最古老的持续有人居住的城市之一；使徒行传中的“直街”至今仍存在于老城区。",
        "zh-Hant": "今天的敘利亞首都，是世界上最古老的持續有人居住的城市之一；使徒行傳中的「直街」至今仍存在於老城區。",
        "es": "Hoy es la capital de Siria y una de las ciudades continuamente habitadas más antiguas del mundo; la Calle Derecha aún existe.",
        "pt": "Hoje é a capital da Síria e uma das cidades continuamente habitadas mais antigas do mundo; a Rua Direita ainda existe.",
        "fr": "Aujourd'hui capitale de la Syrie, c'est l'une des plus anciennes villes habitées sans interruption; la rue Droite existe toujours.",
        "de": "Heute die Hauptstadt Syriens und eine der ältesten ununterbrochen bewohnten Städte der Welt; die Gerade Straße existiert noch heute.",
        "ar": "عاصمة سوريا اليوم وإحدى أقدم المدن المأهولة باستمرار في العالم؛ ولا يزال الشارع المستقيم قائماً في المدينة القديمة."
      }
    },
    "keyVerses": [
      { "bookId": "ACT", "chapter": 9, "verse": 3, "label": { "en": "Saul's Conversion", "ko": "사울의 회심", "ja": "サウロの回心", "zh-Hans": "扫罗归主", "zh-Hant": "掃羅歸主", "es": "Conversión de Saulo", "pt": "Conversão de Saulo", "fr": "Conversion de Saul", "de": "Bekehrung des Saulus", "ar": "اهتداء شاول" } },
      { "bookId": "ACT", "chapter": 9, "verse": 11, "label": { "en": "Street Called Straight", "ko": "직가라 하는 거리", "ja": "まっすぐな通り", "zh-Hans": "直街", "zh-Hant": "直街", "es": "La calle Derecha", "pt": "Rua Direita", "fr": "La rue Droite", "de": "Die Gerade Straße", "ar": "الزقاق المستقيم" } }
    ]
  }
]
```

---

## 3. Phase 1 로컬 저장소 스키마 (IndexedDB / Dexie.js)

`src/lib/db/dexie.ts`에 아래 6개 테이블을 정의합니다:

| 테이블명 | Primary Key & Indexes | 용도 |
| :--- | :--- | :--- |
| `preferences` | `id` (`"user_prefs"`) | 언어(`locale`), 역본(`version`), 읽기 방향(`writingMode`), 글씨 크기(`fontSize`), 줄간격(`lineHeight`), 서체(`fontFamily`), 테마(`theme`) |
| `bookmarks` | `++id, [bookId+chapter+verse], createdAt` | 사용자가 저장한 북마크 구절 |
| `highlights` | `++id, [bookId+chapter+verse], color, createdAt` | 4색 형광펜 하이라이트 (`yellow`, `green`, `blue`, `pink`) |
| `notes` | `++id, [bookId+chapter+verse], updatedAt` | 개인 묵상 메모 (Markdown/텍스트) |
| `readingHistory` | `++id, [version+bookId+chapter], visitedAt` | 최근 읽은 장 기록 및 이어 읽기 |
| `cachedChapters` | `[version+bookId+chapter], cachedAt` | **퍼블릭 도메인 역본 전용** 오프라인 본문 캐시 (`allowOfflineCache === true`인 경우만 저장) |

---

## 4. Phase 2 클라우드 확장 스키마 (PostgreSQL / Supabase 초안)

추후 로그인 및 기기 간 동기화를 도입할 때 IndexedDB 데이터를 그대로 동기화할 수 있도록 동일한 키 구조의 SQL 스키마를 예비 설계합니다:

```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  locale TEXT NOT NULL DEFAULT 'en',
  default_version TEXT NOT NULL DEFAULT 'KJV',
  writing_mode TEXT NOT NULL DEFAULT 'ltr',
  font_size INT NOT NULL DEFAULT 18,
  line_height NUMERIC(3,2) NOT NULL DEFAULT 1.80,
  theme TEXT NOT NULL DEFAULT 'light',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('bookmark', 'highlight', 'note')),
  book_id TEXT NOT NULL,
  chapter INT NOT NULL,
  verse INT NOT NULL,
  color TEXT,
  note_body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_annotations_lookup ON user_annotations (user_id, book_id, chapter);
```
