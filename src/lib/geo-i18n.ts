import type { LanguageCode } from '@/types/bible';

export const PLACE_TYPE_LABELS: Record<string, Record<LanguageCode, string>> = {
  settlement: {
    en: 'City / Town', ko: '성읍 / 도시', ja: '町・都市', 'zh-Hans': '城邑 / 城市', 'zh-Hant': '城邑 / 城市',
    es: 'Ciudad', pt: 'Cidade', fr: 'Ville', de: 'Stadt', ar: 'مدينة',
  },
  region: {
    en: 'Region', ko: '지역', ja: '地域', 'zh-Hans': '地区', 'zh-Hant': '地區',
    es: 'Región', pt: 'Região', fr: 'Région', de: 'Region', ar: 'منطقة',
  },
  'people group': {
    en: 'Region / People', ko: '지역 / 민족', ja: '地域・民族', 'zh-Hans': '地区 / 民族', 'zh-Hant': '地區 / 民族',
    es: 'Región / Pueblo', pt: 'Região / Povo', fr: 'Région / Peuple', de: 'Region / Volk', ar: 'منطقة / شعب',
  },
  river: {
    en: 'River', ko: '강', ja: '川', 'zh-Hans': '河流', 'zh-Hant': '河流',
    es: 'Río', pt: 'Rio', fr: 'Fleuve', de: 'Fluss', ar: 'نهر',
  },
  wadi: {
    en: 'Wadi / Valley', ko: '시내 / 골짜기', ja: 'ワディ・谷', 'zh-Hans': '溪谷', 'zh-Hant': '溪谷',
    es: 'Torrente / Valle', pt: 'Ribero / Vale', fr: 'Torrent / Vallée', de: 'Bach / Tal', ar: 'وادي',
  },
  mountain: {
    en: 'Mountain', ko: '산', ja: '山', 'zh-Hans': '山', 'zh-Hant': '山',
    es: 'Monte', pt: 'Monte', fr: 'Mont', de: 'Berg', ar: 'جبل',
  },
  'mountain range': {
    en: 'Mountain Range', ko: '산맥 / 산지', ja: '山脈', 'zh-Hans': '山脉', 'zh-Hant': '山脈',
    es: 'Cordillera', pt: 'Cordilheira', fr: 'Chaîne de montagnes', de: 'Gebirge', ar: 'سلسلة جبال',
  },
  hill: {
    en: 'Hill', ko: '언덕', ja: '丘', 'zh-Hans': '山丘', 'zh-Hant': '山丘',
    es: 'Colina', pt: 'Colina', fr: 'Colline', de: 'Hügel', ar: 'تل',
  },
  valley: {
    en: 'Valley', ko: '골짜기', ja: '谷', 'zh-Hans': '山谷', 'zh-Hant': '山谷',
    es: 'Valle', pt: 'Vale', fr: 'Vallée', de: 'Tal', ar: 'وادٍ',
  },
  'body of water': {
    en: 'Sea / Lake', ko: '바다 / 호수', ja: '海・湖', 'zh-Hans': '海 / 湖', 'zh-Hant': '海 / 湖',
    es: 'Mar / Lago', pt: 'Mar / Lago', fr: 'Mer / Lac', de: 'Meer / See', ar: 'بحر / بحيرة',
  },
  island: {
    en: 'Island', ko: '섬', ja: '島', 'zh-Hans': '岛屿', 'zh-Hant': '島嶼',
    es: 'Isla', pt: 'Ilha', fr: 'Île', de: 'Insel', ar: 'جزيرة',
  },
  desert: {
    en: 'Wilderness / Desert', ko: '광야 / 사막', ja: '荒野・砂漠', 'zh-Hans': '旷野 / 沙漠', 'zh-Hant': '曠野 / 沙漠',
    es: 'Desierto', pt: 'Deserto', fr: 'Désert', de: 'Wüste', ar: 'برية / صحراء',
  },
  spring: {
    en: 'Spring / Well', ko: '샘 / 우물', ja: '泉・井戸', 'zh-Hans': '泉 / 井', 'zh-Hant': '泉 / 井',
    es: 'Manantial / Pozo', pt: 'Fonte / Poço', fr: 'Source / Puits', de: 'Quelle / Brunnen', ar: 'نبع / بئر',
  },
  structure: {
    en: 'Landmark / Structure', ko: '성소 / 유적', ja: '建造物・聖所', 'zh-Hans': '建筑 / 圣所', 'zh-Hant': '建築 / 聖所',
    es: 'Estructura', pt: 'Estrutura', fr: 'Édifice', de: 'Bauwerk', ar: 'معلم',
  },
  place: {
    en: 'Biblical Place', ko: '성경 지명', ja: '聖書の地名', 'zh-Hans': '圣经地名', 'zh-Hant': '聖經地名',
    es: 'Lugar bíblico', pt: 'Lugar bíblico', fr: 'Lieu biblique', de: 'Biblischer Ort', ar: 'مكان كتابي',
  },
};

export function localizePlaceType(type: string | undefined, locale: LanguageCode): string {
  if (!type) return PLACE_TYPE_LABELS.place[locale];
  const key = type.toLowerCase();
  const entry = PLACE_TYPE_LABELS[key] ?? PLACE_TYPE_LABELS.place;
  return entry[locale] ?? entry.en;
}

const COUNTRY_NAMES: Record<string, Record<LanguageCode, string>> = {
  IL_PS: {
    en: 'Israel / Palestine', ko: '이스라엘 / 팔레스타인', ja: 'イスラエル / パレスチナ',
    'zh-Hans': '以色列 / 巴勒斯坦', 'zh-Hant': '以色列 / 巴勒斯坦',
    es: 'Israel / Palestina', pt: 'Israel / Palestina', fr: 'Israël / Palestine', de: 'Israel / Palästina', ar: 'إسرائيل / فلسطين',
  },
  JO: {
    en: 'Jordan', ko: '요르단', ja: 'ヨルダン', 'zh-Hans': '约旦', 'zh-Hant': '約旦',
    es: 'Jordania', pt: 'Jordânia', fr: 'Jordanie', de: 'Jordanien', ar: 'الأردن',
  },
  EG: {
    en: 'Egypt', ko: '이집트', ja: 'エジプト', 'zh-Hans': '埃及', 'zh-Hant': '埃及',
    es: 'Egipto', pt: 'Egito', fr: 'Égypte', de: 'Ägypten', ar: 'مصر',
  },
  LB: {
    en: 'Lebanon', ko: '레바논', ja: 'レバノン', 'zh-Hans': '黎巴嫩', 'zh-Hant': '黎巴嫩',
    es: 'Líbano', pt: 'Líbano', fr: 'Liban', de: 'Libanon', ar: 'لبنان',
  },
  SY: {
    en: 'Syria', ko: '시리아', ja: 'シリア', 'zh-Hans': '叙利亚', 'zh-Hant': '敘利亞',
    es: 'Siria', pt: 'Síria', fr: 'Syrie', de: 'Syrien', ar: 'سوريا',
  },
  TR: {
    en: 'Turkey', ko: '튀르키예', ja: 'トルコ', 'zh-Hans': '土耳其', 'zh-Hant': '土耳其',
    es: 'Turquía', pt: 'Turquia', fr: 'Turquie', de: 'Türkei', ar: 'تركيا',
  },
  IQ: {
    en: 'Iraq', ko: '이라크', ja: 'イラク', 'zh-Hans': '伊拉克', 'zh-Hant': '伊拉克',
    es: 'Irak', pt: 'Iraque', fr: 'Irak', de: 'Irak', ar: 'العراق',
  },
  IR: {
    en: 'Iran', ko: '이란', ja: 'イラン', 'zh-Hans': '伊朗', 'zh-Hant': '伊朗',
    es: 'Irán', pt: 'Irã', fr: 'Iran', de: 'Iran', ar: 'إيران',
  },
  GR: {
    en: 'Greece', ko: '그리스', ja: 'ギリシャ', 'zh-Hans': '希腊', 'zh-Hant': '希臘',
    es: 'Grecia', pt: 'Grécia', fr: 'Grèce', de: 'Griechenland', ar: 'اليونان',
  },
  IT: {
    en: 'Italy', ko: '이탈리아', ja: 'イタリア', 'zh-Hans': '意大利', 'zh-Hant': '義大利',
    es: 'Italia', pt: 'Itália', fr: 'Italie', de: 'Italien', ar: 'إيطاليا',
  },
  CY: {
    en: 'Cyprus', ko: '키프로스', ja: 'キプロス', 'zh-Hans': '塞浦路斯', 'zh-Hant': '賽普勒斯',
    es: 'Chipre', pt: 'Chipre', fr: 'Chypre', de: 'Zypern', ar: 'قبرص',
  },
  NEAR_EAST: {
    en: 'Biblical Near East / Mediterranean', ko: '고대 근동 / 지중해 연안', ja: '古代近東・地中海地域',
    'zh-Hans': '古代近东 / 地中海地区', 'zh-Hant': '古代近東 / 地中海地區',
    es: 'Oriente Próximo / Mediterráneo', pt: 'Oriente Próximo / Mediterrâneo',
    fr: 'Proche-Orient / Méditerranée', de: 'Naher Osten / Mittelmeerraum', ar: 'الشرق الأدنى / المتوسط',
  },
};

export function inferModernCountry([lng, lat]: [number, number], locale: LanguageCode): {
  name: string;
  code: string;
} {
  let key = 'NEAR_EAST';
  let code = '';

  if (lng >= 34.2 && lng <= 35.65 && lat >= 29.5 && lat <= 33.35) {
    key = 'IL_PS'; code = 'IL/PS';
  } else if (lng > 35.65 && lng <= 39.2 && lat >= 29.2 && lat <= 33.35) {
    key = 'JO'; code = 'JO';
  } else if (lng >= 35.1 && lng <= 36.6 && lat > 33.35 && lat <= 34.7) {
    key = 'LB'; code = 'LB';
  } else if (lng >= 35.7 && lng <= 42.3 && lat > 33.35 && lat <= 37.2) {
    key = 'SY'; code = 'SY';
  } else if (lng >= 25.0 && lng <= 34.9 && lat >= 22.0 && lat <= 31.6) {
    key = 'EG'; code = 'EG';
  } else if (lng >= 32.2 && lng <= 34.6 && lat >= 34.5 && lat <= 35.7) {
    key = 'CY'; code = 'CY';
  } else if (lng >= 26.0 && lng <= 44.5 && lat > 36.0 && lat <= 42.1) {
    key = 'TR'; code = 'TR';
  } else if (lng >= 19.3 && lng <= 28.5 && lat >= 34.8 && lat <= 41.7) {
    key = 'GR'; code = 'GR';
  } else if (lng >= 6.6 && lng <= 18.6 && lat >= 36.6 && lat <= 47.0) {
    key = 'IT'; code = 'IT';
  } else if (lng >= 38.8 && lng <= 48.6 && lat >= 29.0 && lat <= 37.4) {
    key = 'IQ'; code = 'IQ';
  } else if (lng > 44.0 && lng <= 63.3 && lat >= 25.0 && lat <= 39.8) {
    key = 'IR'; code = 'IR';
  }

  return { name: COUNTRY_NAMES[key][locale] ?? COUNTRY_NAMES[key].en, code };
}

export function formatLocalizedSummary(
  ancient: string,
  modern: string,
  country: string,
  placeTypeLabel: string,
  verseCount: number,
  locale: LanguageCode
): string {
  switch (locale) {
    case 'ko':
      return `${ancient}(${placeTypeLabel})은(는) 현대의 ${modern} (${country}) 지역으로 비정되며, 성경 전체에서 총 ${verseCount}개 구절에 등장합니다.`;
    case 'ja':
      return `${ancient}（${placeTypeLabel}）は現代の${modern}（${country}）に比定され、聖書全体で${verseCount}節に登場します。`;
    case 'zh-Hans':
      return `${ancient}（${placeTypeLabel}）对应现代的${modern}（${country}），在圣经中共出现于${verseCount}处经文。`;
    case 'zh-Hant':
      return `${ancient}（${placeTypeLabel}）對應現代的${modern}（${country}），在聖經中共出現於${verseCount}處經文。`;
    case 'es':
      return `${ancient} (${placeTypeLabel}) se identifica con la actual ${modern} (${country}) y aparece en ${verseCount} versículos bíblicos.`;
    case 'pt':
      return `${ancient} (${placeTypeLabel}) é identificado com a atual ${modern} (${country}) e aparece em ${verseCount} versículos bíblicos.`;
    case 'fr':
      return `${ancient} (${placeTypeLabel}) correspond à l'actuelle ${modern} (${country}) et apparaît dans ${verseCount} versets bibliques.`;
    case 'de':
      return `${ancient} (${placeTypeLabel}) entspricht dem heutigen ${modern} (${country}) und wird in ${verseCount} Bibelversen erwähnt.`;
    case 'ar':
      return `يُحدَّد موقع ${ancient} (${placeTypeLabel}) في ${modern} الحديثة (${country})، وقد ورد ذكره في ${verseCount} آية في الكتاب المقدس.`;
    default:
      return `${ancient} (${placeTypeLabel}) is identified with modern ${modern} (${country}) and appears in ${verseCount} Bible verse(s).`;
  }
}
