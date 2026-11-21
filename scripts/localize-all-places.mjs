import fs from 'node:fs';

const places = JSON.parse(fs.readFileSync('src/data/geo/places.json', 'utf8'));

// ---------- 1. Hangul Composer (Biblical Phonetic -> Korean) ----------
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function makeSyllable(cho, jung, jong = '') {
  const ci = CHO.indexOf(cho);
  const ji = JUNG.indexOf(jung);
  const ti = JONG.indexOf(jong);
  if (ci < 0 || ji < 0 || ti < 0) return cho + jung + jong;
  return String.fromCharCode(0xac00 + ci * 21 * 28 + ji * 28 + ti);
}

const KO_PREFIXES = [
  [/^beth[-\s]?/i, '벧'],
  [/^baal[-\s]?/i, '바알'],
  [/^kiriath[-\s]?/i, '기럇'],
  [/^kirjath[-\s]?/i, '기럇'],
  [/^beer[-\s]?/i, '브엘'],
  [/^abel[-\s]?/i, '아벨'],
  [/^hazar[-\s]?/i, '하살'],
  [/^hazer[-\s]?/i, '하셀'],
  [/^ramath[-\s]?/i, '라맛'],
  [/^gath[-\s]?/i, '갓'],
  [/^en[-\s]/i, '엔'],
  [/^ein[-\s]/i, '에인 '],
  [/^ain[-\s]/i, '아인 '],
  [/^tel[-\s]/i, '텔 '],
  [/^tell[-\s]/i, '텔 '],
  [/^wadi[-\s]/i, '와디 '],
  [/^khirbet[-\s]/i, '키르벳 '],
  [/^khirbat[-\s]/i, '키르바트 '],
  [/^jebel[-\s]/i, '제벨 '],
  [/^jabal[-\s]/i, '자발 '],
  [/^deir[-\s]/i, '데이르 '],
  [/^beit[-\s]/i, '베이트 '],
  [/^umm[-\s]/i, '움 '],
  [/^ras[-\s]/i, '라스 '],
  [/^nahr[-\s]/i, '나흐르 '],
  [/^bahr[-\s]/i, '바흐르 '],
  [/^abu[-\s]/i, '아부 '],
  [/^al[-\s]/i, '알'],
  [/^el[-\s]/i, '엘'],
  [/^es[-\s]/i, '에스'],
  [/^er[-\s]/i, '에르'],
  [/^et[-\s]/i, '에트'],
];

function romanWordToKorean(rawWord) {
  let w = rawWord.trim();
  if (!w) return '';
  if (/^\d+$/.test(w)) return w;

  let out = '';
  for (const [re, rep] of KO_PREFIXES) {
    if (re.test(w)) {
      out += rep;
      w = w.replace(re, '');
      break;
    }
  }
  w = w.toLowerCase().replace(/[^a-z']/g, '').replace(/'/g, '');
  if (!w) return out.trim();

  // Tokenize into consonant + vowel chunks
  let i = 0;
  const isVowel = (c) => 'aeiouy'.includes(c);

  const readConsonant = () => {
    const rest = w.slice(i);
    if (rest.startsWith('sh')) { i += 2; return 'ㅅ'; }
    if (rest.startsWith('ch')) { i += 2; return 'ㅎ'; }
    if (rest.startsWith('kh')) { i += 2; return 'ㅋ'; }
    if (rest.startsWith('ph')) { i += 2; return 'ㅂ'; }
    if (rest.startsWith('th')) { i += 2; return 'ㄷ'; }
    if (rest.startsWith('ts') || rest.startsWith('tz')) { i += 2; return 'ㅈ'; }
    if (rest.startsWith('gh')) { i += 2; return 'ㄱ'; }
    if (rest.startsWith('qu')) { i += 2; return 'ㅋ'; }
    const c = w[i++];
    const map = {
      b: 'ㅂ', c: 'ㄱ', d: 'ㄷ', f: 'ㅍ', g: 'ㄱ', h: 'ㅎ',
      j: 'ㅇ', k: 'ㄱ', l: 'ㄹ', m: 'ㅁ', n: 'ㄴ', p: 'ㅂ',
      q: 'ㅋ', r: 'ㄹ', s: 'ㅅ', t: 'ㄷ', v: 'ㅂ', w: 'ㅇ',
      x: 'ㅅ', z: 'ㅅ',
    };
    return map[c] ?? 'ㅇ';
  };

  const readVowel = (prevChar) => {
    const rest = w.slice(i);
    if (rest.startsWith('ai')) { i += 2; return 'ㅏㅣ'; }
    if (rest.startsWith('ei')) { i += 2; return 'ㅔㅣ'; }
    if (rest.startsWith('au') || rest.startsWith('aw')) { i += 2; return 'ㅏㅜ'; }
    if (rest.startsWith('ou') || rest.startsWith('oo')) { i += 2; return 'ㅜ'; }
    if (rest.startsWith('ee') || rest.startsWith('ea') || rest.startsWith('ie')) { i += 2; return 'ㅣ'; }
    if (rest.startsWith('ia')) { i += 2; return 'ㅣㅏ'; }
    if (rest.startsWith('io')) { i += 2; return 'ㅣㅗ'; }
    if (rest.startsWith('oa')) { i += 2; return 'ㅗㅏ'; }
    if (rest.startsWith('ue')) { i += 2; return 'ㅜㅔ'; }
    const v = w[i++];
    if (prevChar === 'j') {
      if (v === 'a') return 'ㅑ';
      if (v === 'e') return 'ㅖ';
      if (v === 'o') return 'ㅛ';
      if (v === 'u') return 'ㅠ';
      return 'ㅣ';
    }
    if (prevChar === 'w') {
      if (v === 'a') return 'ㅘ';
      if (v === 'e') return 'ㅞ';
      if (v === 'i') return 'ㅟ';
      return 'ㅗ';
    }
    const vmap = { a: 'ㅏ', e: 'ㅔ', i: 'ㅣ', o: 'ㅗ', u: 'ㅜ', y: 'ㅣ' };
    return vmap[v] ?? 'ㅡ';
  };

  while (i < w.length) {
    let cho = 'ㅇ';
    let prevRaw = '';
    if (!isVowel(w[i])) {
      prevRaw = w[i];
      cho = readConsonant();
    }
    if (i < w.length && isVowel(w[i])) {
      const vStr = readVowel(prevRaw);
      const vowels = [...vStr];
      // Check coda (final consonant if next is end or followed by another consonant)
      let jong = '';
      if (vowels.length === 1 && i < w.length && !isVowel(w[i])) {
        const nextIsEnd = i + 1 >= w.length;
        const nextIsCons = i + 1 < w.length && !isVowel(w[i + 1]) && !w.slice(i, i + 2).match(/^(sh|ch|kh|ph|th|ts|tz|gh)$/);
        if (nextIsEnd || nextIsCons) {
          const c = w[i];
          const codaMap = { n: 'ㄴ', m: 'ㅁ', l: 'ㄹ', r: 'ㄹ', b: 'ㅂ', p: 'ㅂ', k: 'ㄱ', g: 'ㄱ', t: 'ㅅ', d: 'ㄷ', s: 'ㅅ' };
          if (codaMap[c]) {
            jong = codaMap[c];
            i++;
          } else if (c === 'h' && nextIsEnd) {
            i++; // silent final h in Hebrew names (e.g. Ramah -> 라마)
          }
        }
      }
      if (vowels.length === 1) {
        out += makeSyllable(cho, vowels[0], jong);
      } else {
        out += makeSyllable(cho, vowels[0], '');
        for (let k = 1; k < vowels.length; k++) {
          out += makeSyllable('ㅇ', vowels[k], '');
        }
      }
    } else {
      // Standalone consonant
      if (prevRaw !== 'h') {
        out += makeSyllable(cho, 'ㅡ', '');
      }
    }
  }
  return out;
}

// ---------- 2. Katakana Composer (Biblical Phonetic -> Japanese) ----------
const KATA_MAP = {
  a: 'ア', i: 'イ', u: 'ウ', e: 'エ', o: 'オ',
  ka: 'カ', ki: 'キ', ku: 'ク', ke: 'ケ', ko: 'コ',
  ga: 'ガ', gi: 'ギ', gu: 'グ', ge: 'ゲ', go: 'ゴ',
  sa: 'サ', si: 'シ', su: 'ス', se: 'セ', so: 'ソ',
  sha: 'シャ', shi: 'シ', shu: 'シュ', she: 'シェ', sho: 'ショ',
  za: 'ザ', zi: 'ジ', zu: 'ズ', ze: 'ゼ', zo: 'ゾ',
  ta: 'タ', ti: 'ティ', tu: 'トゥ', te: 'テ', to: 'ト',
  tha: 'タ', thi: 'ティ', thu: 'トゥ', the: 'テ', tho: 'ト',
  da: 'ダ', di: 'ディ', du: 'ドゥ', de: 'デ', do: 'ド',
  na: 'ナ', ni: 'ニ', nu: 'ヌ', ne: 'ネ', no: 'ノ',
  ha: 'ハ', hi: 'ヒ', hu: 'フ', he: 'ヘ', ho: 'ホ',
  ba: 'バ', bi: 'ビ', bu: 'ブ', be: 'ベ', bo: 'ボ',
  pa: 'パ', pi: 'ピ', pu: 'プ', pe: 'ペ', po: 'ポ',
  fa: 'ファ', fi: 'フィ', fu: 'フ', fe: 'フェ', fo: 'フォ',
  ma: 'マ', mi: 'ミ', mu: 'ム', me: 'メ', mo: 'モ',
  ya: 'ヤ', yi: 'イ', yu: 'ユ', ye: 'イェ', yo: 'ヨ',
  ja: 'ヤ', ji: 'イ', ju: 'ユ', je: 'エ', jo: 'ヨ',
  ra: 'ラ', ri: 'リ', ru: 'ル', re: 'レ', ro: 'ロ',
  la: 'ラ', li: 'リ', lu: 'ル', le: 'レ', lo: 'ロ',
  wa: 'ワ', wi: 'ウィ', wu: 'ウ', we: 'ウェ', wo: 'ウォ',
  va: 'ヴァ', vi: 'ヴィ', vu: 'ヴ', ve: 'ヴェ', vo: 'ヴォ',
  ca: 'カ', ci: 'シ', cu: 'ク', ce: 'セ', co: 'コ',
  cha: 'ハ', chi: 'ヒ', chu: 'フ', che: 'ヘ', cho: 'ホ',
  kha: 'ハ', khi: 'ヒ', khu: 'フ', khe: 'ヘ', kho: 'ホ',
  pha: 'ファ', phi: 'フィ', phu: 'フ', phe: 'フェ', pho: 'フォ',
};
const KATA_CODA = {
  b: 'ブ', c: 'ク', d: 'ド', f: 'フ', g: 'グ', h: '', j: 'ジ', k: 'ク',
  l: 'ル', m: 'ム', n: 'ン', p: 'プ', q: 'ク', r: 'ル', s: 'ス', t: 'ト',
  v: 'ヴ', w: 'ウ', x: 'クス', y: 'イ', z: 'ズ',
};

function romanWordToJapanese(rawWord) {
  let w = rawWord.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return rawWord;
  let out = '';
  let i = 0;
  while (i < w.length) {
    const t3 = w.slice(i, i + 3);
    const t2 = w.slice(i, i + 2);
    const t1 = w[i];
    if (KATA_MAP[t3]) { out += KATA_MAP[t3]; i += 3; }
    else if (KATA_MAP[t2]) { out += KATA_MAP[t2]; i += 2; }
    else if (KATA_MAP[t1]) { out += KATA_MAP[t1]; i += 1; }
    else { out += KATA_CODA[t1] ?? ''; i += 1; }
  }
  return out || rawWord;
}

// ---------- 3. Chinese Biblical Phonetic Mapper ----------
const ZH_SYL = {
  a: '亚', i: '以', u: '乌', e: '以', o: '俄',
  ba: '巴', bi: '比', bu: '布', be: '伯', bo: '波',
  pa: '帕', pi: '毗', pu: '普', pe: '佩', po: '波',
  ma: '玛', mi: '米', mu: '木', me: '米', mo: '摩',
  fa: '法', fi: '非', fu: '夫', fe: '非', fo: '佛',
  da: '大', di: '底', du: '都', de: '得', do: '多',
  ta: '他', ti: '提', tu: '土', te: '特', to: '陀',
  na: '拿', ni: '尼', nu: '努', ne: '尼', no: '挪',
  la: '拉', li: '利', lu: '路', le: '勒', lo: '罗',
  ra: '拉', ri: '利', ru: '路', re: '利', ro: '罗',
  ga: '迦', gi: '基', gu: '古', ge: '基', go: '哥',
  ka: '迦', ki: '基', ku: '古', ke: '基', ko: '哥',
  ca: '迦', ci: '西', cu: '古', ce: '西', co: '哥',
  ha: '哈', hi: '希', hu: '户', he: '希', ho: '何',
  sa: '撒', si: '西', su: '苏', se: '西', so: '琐',
  sha: '沙', shi: '示', shu: '书', she: '示', sho: '朔',
  za: '撒', zi: '洗', zu: '苏', ze: '洗', zo: '琐',
  ja: '雅', ji: '以', ju: '犹', je: '耶', jo: '约',
  ya: '雅', yi: '以', yu: '犹', ye: '耶', yo: '约',
  wa: '瓦', wi: '威', wu: '乌', we: '威', wo: '沃',
  va: '瓦', vi: '维', vu: '乌', ve: '维', vo: '沃',
  cha: '哈', chi: '基', chu: '古', che: '基', cho: '哥',
  kha: '哈', khi: '希', khu: '户', khe: '希', kho: '何',
  pha: '法', phi: '非', phu: '普', phe: '非', pho: '佛',
  tha: '他', thi: '提', thu: '土', the: '特', tho: '陀',
};
const ZH_CODA = {
  b: '伯', c: '克', d: '德', f: '夫', g: '格', h: '', j: '吉', k: '克',
  l: '勒', m: '姆', n: '嫩', p: '普', q: '克', r: '珥', s: '斯', t: '特',
  v: '夫', w: '', x: '克斯', y: '伊', z: '兹',
};

function romanWordToChinese(rawWord) {
  let w = rawWord.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return rawWord;
  let out = '';
  let i = 0;
  while (i < w.length) {
    const t3 = w.slice(i, i + 3);
    const t2 = w.slice(i, i + 2);
    const t1 = w[i];
    if (ZH_SYL[t3]) { out += ZH_SYL[t3]; i += 3; }
    else if (ZH_SYL[t2]) { out += ZH_SYL[t2]; i += 2; }
    else if (ZH_SYL[t1]) { out += ZH_SYL[t1]; i += 1; }
    else { out += ZH_CODA[t1] ?? ''; i += 1; }
  }
  return out || rawWord;
}

// ---------- 4. Arabic Phonetic Mapper ----------
function romanWordToArabic(rawWord) {
  let w = rawWord.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return rawWord;
  w = w
    .replace(/sh/g, 'ش')
    .replace(/kh|ch/g, 'خ')
    .replace(/th/g, 'ث')
    .replace(/ph/g, 'ف')
    .replace(/gh/g, 'غ')
    .replace(/^al/g, 'ال')
    .replace(/^el/g, 'ال')
    .replace(/a/g, 'ا').replace(/b/g, 'ب').replace(/c/g, 'ك').replace(/d/g, 'د')
    .replace(/e/g, 'ي').replace(/f/g, 'ف').replace(/g/g, 'ج').replace(/h/g, 'ه')
    .replace(/i/g, 'ي').replace(/j/g, 'ي').replace(/k/g, 'ك').replace(/l/g, 'ل')
    .replace(/m/g, 'م').replace(/n/g, 'ن').replace(/o/g, 'و').replace(/p/g, 'ب')
    .replace(/q/g, 'ق').replace(/r/g, 'ر').replace(/s/g, 'س').replace(/t/g, 'ت')
    .replace(/u/g, 'و').replace(/v/g, 'ف').replace(/w/g, 'و').replace(/x/g, 'كس')
    .replace(/y/g, 'ي').replace(/z/g, 'ز');
  return w;
}

// ---------- 5. Compound Biblical Phrase Rules ----------
const COMPOUND_RULES = [
  { re: /^Mount\s+(.+)$/i, fmt: { ko: (x) => `${x} 산`, ja: (x) => `${x}山`, 'zh-Hans': (x) => `${x}山`, 'zh-Hant': (x) => `${x}山`, es: (x) => `Monte ${x}`, pt: (x) => `Monte ${x}`, fr: (x) => `Mont ${x}`, de: (x) => `Berg ${x}`, ar: (x) => `جبل ${x}` } },
  { re: /^Valley of (?:the )?(.+)$/i, fmt: { ko: (x) => `${x} 골짜기`, ja: (x) => `${x}の谷`, 'zh-Hans': (x) => `${x}谷`, 'zh-Hant': (x) => `${x}谷`, es: (x) => `Valle de ${x}`, pt: (x) => `Vale de ${x}`, fr: (x) => `Vallée de ${x}`, de: (x) => `Tal ${x}`, ar: (x) => `وادي ${x}` } },
  { re: /^Wilderness of (?:the )?(.+)$/i, fmt: { ko: (x) => `${x} 광야`, ja: (x) => `${x}の荒野`, 'zh-Hans': (x) => `${x}旷野`, 'zh-Hant': (x) => `${x}曠野`, es: (x) => `Desierto de ${x}`, pt: (x) => `Deserto de ${x}`, fr: (x) => `Désert de ${x}`, de: (x) => `Wüste ${x}`, ar: (x) => `برية ${x}` } },
  { re: /^Desert of (?:the )?(.+)$/i, fmt: { ko: (x) => `${x} 사막`, ja: (x) => `${x}の砂漠`, 'zh-Hans': (x) => `${x}沙漠`, 'zh-Hant': (x) => `${x}沙漠`, es: (x) => `Desierto de ${x}`, pt: (x) => `Deserto de ${x}`, fr: (x) => `Désert de ${x}`, de: (x) => `Wüste ${x}`, ar: (x) => `صحراء ${x}` } },
  { re: /^Plains? of (?:the )?(.+)$/i, fmt: { ko: (x) => `${x} 평지`, ja: (x) => `${x}の平野`, 'zh-Hans': (x) => `${x}平原`, 'zh-Hant': (x) => `${x}平原`, es: (x) => `Llanura de ${x}`, pt: (x) => `Planície de ${x}`, fr: (x) => `Plaine de ${x}`, de: (x) => `Ebene ${x}`, ar: (x) => `سهل ${x}` } },
  { re: /^Brook (?:of )?(.+)$/i, fmt: { ko: (x) => `${x} 시내`, ja: (x) => `${x}の川`, 'zh-Hans': (x) => `${x}溪`, 'zh-Hant': (x) => `${x}溪`, es: (x) => `Arroyo de ${x}`, pt: (x) => `Ribero de ${x}`, fr: (x) => `Torrent de ${x}`, de: (x) => `Bach ${x}`, ar: (x) => `وادي ${x}` } },
  { re: /^River (?:of )?(.+)$/i, fmt: { ko: (x) => `${x} 강`, ja: (x) => `${x}川`, 'zh-Hans': (x) => `${x}河`, 'zh-Hant': (x) => `${x}河`, es: (x) => `Río ${x}`, pt: (x) => `Rio ${x}`, fr: (x) => `Fleuve ${x}`, de: (x) => `Fluss ${x}`, ar: (x) => `نهر ${x}` } },
  { re: /^Sea of (?:the )?(.+)$/i, fmt: { ko: (x) => `${x} 바다`, ja: (x) => `${x}の海`, 'zh-Hans': (x) => `${x}海`, 'zh-Hant': (x) => `${x}海`, es: (x) => `Mar de ${x}`, pt: (x) => `Mar de ${x}`, fr: (x) => `Mer de ${x}`, de: (x) => `Meer von ${x}`, ar: (x) => `بحر ${x}` } },
  { re: /^Pool of (?:the )?(.+)$/i, fmt: { ko: (x) => `${x} 못`, ja: (x) => `${x}の池`, 'zh-Hans': (x) => `${x}池`, 'zh-Hant': (x) => `${x}池`, es: (x) => `Estanque de ${x}`, pt: (x) => `Tanque de ${x}`, fr: (x) => `Piscine de ${x}`, de: (x) => `Teich ${x}`, ar: (x) => `بركة ${x}` } },
  { re: /^Hill (?:Country )?of (?:the )?(.+)$/i, fmt: { ko: (x) => `${x} 산지`, ja: (x) => `${x}の山地`, 'zh-Hans': (x) => `${x}山地`, 'zh-Hant': (x) => `${x}山地`, es: (x) => `Montes de ${x}`, pt: (x) => `Montes de ${x}`, fr: (x) => `Montagne de ${x}`, de: (x) => `Bergland ${x}`, ar: (x) => `جبل ${x}` } },
  { re: /^Land of (?:the )?(.+)$/i, fmt: { ko: (x) => `${x} 땅`, ja: (x) => `${x}の地`, 'zh-Hans': (x) => `${x}地`, 'zh-Hant': (x) => `${x}地`, es: (x) => `Tierra de ${x}`, pt: (x) => `Terra de ${x}`, fr: (x) => `Pays de ${x}`, de: (x) => `Land ${x}`, ar: (x) => `أرض ${x}` } },
  { re: /^City of (?:the )?(.+)$/i, fmt: { ko: (x) => `${x} 성`, ja: (x) => `${x}の町`, 'zh-Hans': (x) => `${x}城`, 'zh-Hant': (x) => `${x}城`, es: (x) => `Ciudad de ${x}`, pt: (x) => `Cidade de ${x}`, fr: (x) => `Ville de ${x}`, de: (x) => `Stadt ${x}`, ar: (x) => `مدينة ${x}` } },
  { re: /^Tower of (?:the )?(.+)$/i, fmt: { ko: (x) => `${x} 망대`, ja: (x) => `${x}の塔`, 'zh-Hans': (x) => `${x}楼`, 'zh-Hant': (x) => `${x}樓`, es: (x) => `Torre de ${x}`, pt: (x) => `Torre de ${x}`, fr: (x) => `Tour de ${x}`, de: (x) => `Turm ${x}`, ar: (x) => `برج ${x}` } },
  { re: /^(.+)\s+Gate$/i, fmt: { ko: (x) => `${x} 문`, ja: (x) => `${x}の門`, 'zh-Hans': (x) => `${x}门`, 'zh-Hant': (x) => `${x}門`, es: (x) => `Puerta de ${x}`, pt: (x) => `Porta de ${x}`, fr: (x) => `Porte de ${x}`, de: (x) => `${x}-Tor`, ar: (x) => `باب ${x}` } },
  { re: /^Upper\s+(.+)$/i, fmt: { ko: (x) => `윗 ${x}`, ja: (x) => `上${x}`, 'zh-Hans': (x) => `上${x}`, 'zh-Hant': (x) => `上${x}`, es: (x) => `${x} Superior`, pt: (x) => `${x} Superior`, fr: (x) => `${x} Supérieur`, de: (x) => `Ober-${x}`, ar: (x) => `${x} العليا` } },
  { re: /^Lower\s+(.+)$/i, fmt: { ko: (x) => `아랫 ${x}`, ja: (x) => `下${x}`, 'zh-Hans': (x) => `下${x}`, 'zh-Hant': (x) => `下${x}`, es: (x) => `${x} Inferior`, pt: (x) => `${x} Inferior`, fr: (x) => `${x} Inférieur`, de: (x) => `Unter-${x}`, ar: (x) => `${x} السفلى` } },
  { re: /^another name for (?:the )?(.+)$/i, fmt: { ko: (x) => `${x} (별칭)`, ja: (x) => `${x}（別名）`, 'zh-Hans': (x) => `${x}（别称）`, 'zh-Hant': (x) => `${x}（別稱）`, es: (x) => `${x} (otro nombre)`, pt: (x) => `${x} (outro nome)`, fr: (x) => `${x} (autre nom)`, de: (x) => `${x} (anderer Name)`, ar: (x) => `${x} (اسم آخر)` } },
  { re: /^within (\d+(?:\.\d+)?)\s*km of (?:the )?(.+)$/i, fmt: { ko: (x, n) => `${x} 인근 (${n}km 이내)`, ja: (x, n) => `${x}付近（${n}km圏内）`, 'zh-Hans': (x, n) => `${x}附近（${n}公里内）`, 'zh-Hant': (x, n) => `${x}附近（${n}公里內）`, es: (x, n) => `Cerca de ${x} (${n} km)`, pt: (x, n) => `Perto de ${x} (${n} km)`, fr: (x, n) => `Près de ${x} (${n} km)`, de: (x, n) => `Nahe ${x} (${n} km)`, ar: (x, n) => `بالقرب من ${x} (${n} كم)` } },
];

// Build lookup of already-translated names from existing places.json
const knownByEn = new Map();
for (const p of places) {
  if (typeof p.ancientName === 'object' && p.ancientName.en) {
    knownByEn.set(p.ancientName.en.toLowerCase(), p.ancientName);
  }
}

function translateAnyName(enRaw) {
  const clean = enRaw.replace(/\s+\d+$/, '').trim();
  const hit = knownByEn.get(clean.toLowerCase());
  if (hit) return { ...hit, en: clean };

  // Check compound rules
  for (const rule of COMPOUND_RULES) {
    const m = clean.match(rule.re);
    if (m) {
      if (m.length === 3 && /^\d/.test(m[1])) {
        const sub = translateAnyName(m[2]);
        return {
          en: clean,
          ko: rule.fmt.ko(sub.ko, m[1]),
          ja: rule.fmt.ja(sub.ja, m[1]),
          'zh-Hans': rule.fmt['zh-Hans'](sub['zh-Hans'], m[1]),
          'zh-Hant': rule.fmt['zh-Hant'](sub['zh-Hant'], m[1]),
          es: rule.fmt.es(sub.es, m[1]),
          pt: rule.fmt.pt(sub.pt, m[1]),
          fr: rule.fmt.fr(sub.fr, m[1]),
          de: rule.fmt.de(sub.de, m[1]),
          ar: rule.fmt.ar(sub.ar, m[1]),
        };
      }
      const sub = translateAnyName(m[1]);
      return {
        en: clean,
        ko: rule.fmt.ko(sub.ko),
        ja: rule.fmt.ja(sub.ja),
        'zh-Hans': rule.fmt['zh-Hans'](sub['zh-Hans']),
        'zh-Hant': rule.fmt['zh-Hant'](sub['zh-Hant']),
        es: rule.fmt.es(sub.es),
        pt: rule.fmt.pt(sub.pt),
        fr: rule.fmt.fr(sub.fr),
        de: rule.fmt.de(sub.de),
        ar: rule.fmt.ar(sub.ar),
      };
    }
  }

  // Word-by-word phonetic transliteration
  const tokens = clean.split(/(\s+|-)/);
  const mapTokens = (fn) =>
    tokens
      .map((t) => {
        if (/^\s+$/.test(t)) return ' ';
        if (t === '-') return ' ';
        if (t.toLowerCase() === 'of' || t.toLowerCase() === 'the') return '';
        const kHit = knownByEn.get(t.toLowerCase());
        if (kHit) return kHit;
        return fn(t);
      })
      .join('')
      .replace(/\s+/g, ' ')
      .trim();

  const resolveLang = (lang, fn) =>
    tokens
      .map((t) => {
        if (/^\s+$/.test(t)) return ' ';
        if (t === '-') return lang === 'ja' ? '・' : ' ';
        if (t.toLowerCase() === 'of' || t.toLowerCase() === 'the') return '';
        const kHit = knownByEn.get(t.toLowerCase());
        if (kHit && kHit[lang]) return kHit[lang];
        return fn(t);
      })
      .join('')
      .replace(/\s+/g, ' ')
      .trim();

  return {
    en: clean,
    ko: resolveLang('ko', romanWordToKorean),
    ja: resolveLang('ja', romanWordToJapanese),
    'zh-Hans': resolveLang('zh-Hans', romanWordToChinese),
    'zh-Hant': resolveLang('zh-Hant', romanWordToChinese),
    es: clean,
    pt: clean,
    fr: clean,
    de: clean,
    ar: resolveLang('ar', romanWordToArabic),
  };
}

let ancientDone = 0;
let modernDone = 0;

for (const p of places) {
  if (typeof p.ancientName === 'string') {
    p.ancientName = translateAnyName(p.ancientName);
    ancientDone++;
  }
  if (typeof p.modernName === 'string') {
    p.modernName = translateAnyName(p.modernName);
    modernDone++;
  }
}

fs.writeFileSync('src/data/geo/places.json', JSON.stringify(places));

// Audit: verify ZERO plain string ancientName or modernName remain
const remainingAncient = places.filter((p) => typeof p.ancientName === 'string').length;
const remainingModern = places.filter((p) => typeof p.modernName === 'string').length;
const asciiInKo = places.filter((p) => /[a-zA-Z]{2,}/.test(p.ancientName.ko)).length;
console.log({
  total: places.length,
  ancientDone,
  modernDone,
  remainingAncient,
  remainingModern,
  asciiInKo,
  fileSizeKB: Math.round(fs.statSync('src/data/geo/places.json').size / 1024),
});
console.log('Sample localized entries:', places.slice(120, 126).map((p) => ({
  en: p.ancientName.en,
  ko: p.ancientName.ko,
  ja: p.ancientName.ja,
  zh: p.ancientName['zh-Hans'],
  ar: p.ancientName.ar,
  modernKo: p.modernName.ko,
})));
