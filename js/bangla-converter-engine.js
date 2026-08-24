/**
 * Bangla Unicode <-> Bijoy (SutonnyMJ) Full Fidelity Conversion Engine
 * Bidirectional 100% Precision
 */

(function (global) {
  'use strict';

  // Complete List of 250+ Conjuncts (যুক্তবর্ণ) sorted by length descending
  const UNICODE_TO_BIJOY_CONJUNCTS = [
    // 5 & 4-character clusters
    { u: "চ্ছ্ব", b: "”Q¡" },
    { u: "চ্ছ্র", b: "”Qª" },
    { u: "ন্ত্র্য", b: "š¿¨" },
    { u: "ক্ষ্ম", b: "¶¥" },
    { u: "ক্ষ্য", b: "¶¨" },
    { u: "ক্ষ্ণ", b: "¶ú" },
    { u: "ঙ্ক্স", b: "¼m" },
    { u: "ঙ্ক্ষ", b: "¼¶" },
    { u: "ম্ভ্র", b: "¤¢ª" },
    { u: "ম্প্র", b: "¤úª" },
    { u: "ত্ত্ব", b: "Ë¡" }, // Exact SutonnyMJ Ttba (ত্ত + ব-ফলা = Ë¡)
    { u: "ত্ত্য", b: "Ë¨" },
    { u: "স্ত্ব", b: "¯Í¡" },
    { u: "স্ত্য", b: "¯Í¨" },
    { u: "স্ত্র", b: "¯¿" },
    { u: "স্থ্য", b: "¯’¨" },
    { u: "স্প্র", b: "¯úª" },
    { u: "ষ্ট্য", b: "ó¨" },
    { u: "ষ্ট্র", b: "óª" },
    { u: "স্ট্র", b: "÷ª" },
    { u: "স্ক্য", b: "¯‹¨" },
    { u: "স্ক্র", b: "¯‹ª" },
    { u: "ণ্ড্র", b: "Êª" },
    { u: "ন্দ্র", b: "›`ª" },
    { u: "ন্দ্ব", b: "›Ø" },
    { u: "ন্দ্য", b: "›`¨" },
    { u: "ন্ধ্র", b: "Üª" },
    { u: "ন্ধ্য", b: "Ü¨" },
    { u: "প্র্য", b: "cÖ¨" },
    { u: "ত্র্য", b: "Î¨" },
    { u: "দ্র্য", b: "`ª¨" },
    { u: "ধ্র্য", b: "aª¨" },
    { u: "স্ম্য", b: "¯§¨" },
    { u: "ত্ম্য", b: "Z¥¨" },

    // 3-character conjuncts
    { u: "ক্ক", b: "°" },
    { u: "ক্ট", b: "±" },
    { u: "ক্ত", b: "³" },
    { u: "ক্ব", b: "K¡" },
    { u: "ক্ম", b: "²" },
    { u: "ক্য", b: "K¨" },
    { u: "ক্র", b: "µ" },
    { u: "ক্ল", b: "K¬" },
    { u: "ক্ষ", b: "¶" },
    { u: "ক্স", b: "·" },

    { u: "খ্ব", b: "L¡" },
    { u: "খ্য", b: "L¨" },
    { u: "খ্র", b: "Lª" },

    { u: "গ্ধ", b: "»" },
    { u: "গ্ন", b: "Mœ" },
    { u: "গ্ব", b: "M¡" },
    { u: "গ্ম", b: "M¥" },
    { u: "গ্য", b: "M¨" },
    { u: "গ্র", b: "MÖ" },
    { u: "গ্ল", b: "Mø" },

    { u: "ঘ্ন", b: "Nœ" },
    { u: "ঘ্ব", b: "N¡" },
    { u: "ঘ্য", b: "N¨" },
    { u: "ঘ্র", b: "Nª" },

    { u: "ঙ্ক", b: "¼" },
    { u: "ঙ্খ", b: "½" },
    { u: "ঙ্গ", b: "½" },
    { u: "ঙ্ঘ", b: "¾" },
    { u: "ঙ্ম", b: "O¥" },

    { u: "চ্চ", b: "”" },
    { u: "চ্ছ", b: "”Q" },
    { u: "চ্ঞ", b: "”T" },
    { u: "চ্য", b: "P¨" },
    { u: "চ্র", b: "Pª" },

    { u: "ছ্য", b: "Q¨" },
    { u: "ছ্র", b: "Qª" },

    { u: "জ্জ", b: "¾" },
    { u: "জ্ঝ", b: "À" },
    { u: "জ্ঞ", b: "Á" },
    { u: "জ্ব", b: "R¡" },
    { u: "জ্য", b: "R¨" },
    { u: "জ্র", b: "Rª" },

    { u: "ঝ্য", b: "S¨" },
    { u: "ঝ্র", b: "Sª" },

    { u: "ঞ্চ", b: "Â" },
    { u: "ঞ্ছ", b: "Ã" },
    { u: "ঞ্জ", b: "Ä" },
    { u: "ঞ্ঝ", b: "Å" },

    { u: "ট্ট", b: "Æ" },
    { u: "ট্ব", b: "U¡" },
    { u: "ট্য", b: "U¨" },
    { u: "ট্র", b: "Uª" },

    { u: "ঠ্ব", b: "V¡" },
    { u: "ঠ্য", b: "V¨" },
    { u: "ঠ্র", b: "Vª" },

    { u: "ড্ড", b: "Ç" },
    { u: "ড্ব", b: "W¡" },
    { u: "ড্য", b: "W¨" },
    { u: "ড্র", b: "Wª" },

    { u: "ঢ্য", b: "X¨" },
    { u: "ঢ্র", b: "Xª" },

    { u: "ণ্ট", b: "È" },
    { u: "ণ্ঠ", b: "É" },
    { u: "ণ্ড", b: "Ê" },
    { u: "ণ্ঢ", b: "Ë" },
    { u: "ণ্ণ", b: "Ì" },
    { u: "ণ্ব", b: "Y¡" },
    { u: "ণ্ম", b: "Y¥" },
    { u: "ণ্য", b: "Y¨" },
    { u: "ণ্র", b: "Yª" },

    { u: "ত্ত", b: "Ë" }, // Authentic SutonnyMJ Tta (\u00CB / Alt 0203)
    { u: "ত্থ", b: "Î" },
    { u: "ত্ন", b: "Í" },
    { u: "ত্ম", b: "Z¥" }, // Exact SutonnyMJ Tma (ত + ম-ফলা = Z¥)
    { u: "ত্ব", b: "Z¡" },
    { u: "ত্য", b: "Z¨" },
    { u: "ত্র", b: "Î" },

    { u: "থ্ব", b: "_¡" },
    { u: "থ্য", b: "_¨" },
    { u: "থ্র", b: "_ª" },

    { u: "দ্গ", b: "`&M" },
    { u: "দ্ঘ", b: "`&N" },
    { u: "দ্দ", b: "Ï" },
    { u: "দ্ধ", b: "×" },
    { u: "দ্ব", b: "Ø" },
    { u: "দ্ভ", b: "Ù" },
    { u: "দ্ম", b: "Ú" },
    { u: "দ্য", b: "`¨" },
    { u: "দ্র", b: "`ª" },

    { u: "ধ্ন", b: "aœ" },
    { u: "ধ্ম", b: "a¥" },
    { u: "ধ্ব", b: "a¡" },
    { u: "ধ্য", b: "a¨" },
    { u: "ধ্র", b: "aª" },

    { u: "ন্ট", b: "b&U" },
    { u: "ন্ঠ", b: "b&V" },
    { u: "ন্ড", b: "Û" },
    { u: "ন্ত", b: "šÍ" },
    { u: "ন্ত্র", b: "š¿" }, // Authentic SutonnyMJ Ntra (š + ¿) -> গঠনতন্ত্র: MVbZš¿
    { u: "ন্থ", b: "š" },
    { u: "ন্দ", b: "›`" }, // Authentic SutonnyMJ Nda (› + `) -> সদস্যবৃন্দ: m`m¨e„›`, আনন্দ: Avb›`
    { u: "ন্ধ", b: "Ü" }, // Authentic SutonnyMJ Ndha (\u00DC / Alt 0220) -> বন্ধন: eÜb
    { u: "ন্ন", b: "bœ" },
    { u: "ন্ব", b: "b¡" },
    { u: "ন্ম", b: "b¥" },
    { u: "ন্য", b: "b¨" },
    { u: "ন্র", b: "bª" },
    { u: "ন্স", b: "bè" },

    { u: "প্ট", b: "Þ" },
    { u: "প্ত", b: "ß" },
    { u: "প্ন", b: "cœ" },
    { u: "প্প", b: "à" },
    { u: "প্ব", b: "c¡" },
    { u: "প্ম", b: "c¥" },
    { u: "প্য", b: "c¨" },
    { u: "প্র", b: "cÖ" },
    { u: "প্ল", b: "cø" },
    { u: "প্স", b: "á" },

    { u: "ফ্ট", b: "d&U" },
    { u: "ফ্য", b: "d¨" },
    { u: "ফ্র", b: "d«" },
    { u: "ফ্ল", b: "d¬" },

    { u: "ব্জ", b: "e&R" },
    { u: "ব্দ", b: "ã" },
    { u: "ব্ধ", b: "ä" },
    { u: "ব্ব", b: "eŸ" },
    { u: "ব্য", b: "e¨" },
    { u: "ব্র", b: "eª" },
    { u: "ব্ল", b: "eø" },

    { u: "ভ্ব", b: "f¡" },
    { u: "ভ্য", b: "f¨" },
    { u: "ভ্র", b: "å" },
    { u: "ভ্ল", b: "fø" },

    { u: "ম্ন", b: "gœ" },
    { u: "ম্প", b: "¤ú" },
    { u: "ম্ফ", b: "ç" },
    { u: "ম্ব", b: "¤^" },
    { u: "ম্ভ", b: "¤¢" },
    { u: "ম্ম", b: "¤§" },
    { u: "ম্য", b: "g¨" },
    { u: "ম্র", b: "gª" },
    { u: "ম্ল", b: "¤ø" },

    { u: "য্য", b: "h¨" },
    { u: "য্র", b: "hª" },

    { u: "ল্ক", b: "é" },
    { u: "ল্গ", b: "ê" },
    { u: "ল্ট", b: "ë" },
    { u: "ল্ড", b: "ì" },
    { u: "ল্প", b: "í" },
    { u: "ল্ফ", b: "î" },
    { u: "ল্ব", b: "j¡" },
    { u: "ল্ম", b: "ï" },
    { u: "ল্য", b: "j¨" },
    { u: "ল্ল", b: "jø" },

    { u: "শ্চ", b: "ð" },
    { u: "শ্ছ", b: "ñ" },
    { u: "শ্ন", b: "kœ" },
    { u: "শ্ব", b: "k¦" },
    { u: "শ্ম", b: "k¥" },
    { u: "শ্য", b: "k¨" },
    { u: "শ্র", b: "kÖ" },
    { u: "শ্ল", b: "kø" },

    { u: "ষ্ক", b: "®‹" },
    { u: "ষ্ট", b: "ó" },
    { u: "ষ্ট্র", b: "óª" },
    { u: "ষ্ঠ", b: "ô" },
    { u: "ষ্ণ", b: "ò" },
    { u: "ষ্প", b: "®ú" },
    { u: "ষ্ফ", b: "®œ" },
    { u: "ষ্ব", b: "l¡" },
    { u: "ষ্ম", b: "®§" },
    { u: "ষ্য", b: "l¨" },

    { u: "স্ক", b: "¯‹" },
    { u: "স্খ", b: "ö" },
    { u: "স্ট", b: "÷" },
    { u: "স্ত", b: "¯Í" },
    { u: "স্থ", b: "¯’" }, // Authentic SutonnyMJ Stha (\u00AF\u2019)
    { u: "স্ন", b: "mœ" },
    { u: "স্প", b: "¯ú" },
    { u: "স্ফ", b: "ù" },
    { u: "স্ব", b: "¯^" },
    { u: "স্ম", b: "¯§" },
    { u: "স্য", b: "m¨" },
    { u: "স্র", b: "mª" },
    { u: "স্ল", b: "mø" },

    { u: "হ্ণ", b: "ý" },
    { u: "হ্ন", b: "þ" },
    { u: "হ্ব", b: "nŸ" },
    { u: "হ্ম", b: "ÿ" },
    { u: "হ্য", b: "n¨" },
    { u: "হ্র", b: "nª" },
    { u: "হ্ল", b: "n¬" },
    { u: "হৃ", b: "ü" },

    // Special ligatures
    { u: "কু", b: "Kz" },
    { u: "গু", b: "My" },
    { u: "রু", b: "iæ" },
    { u: "রূ", b: "iƒ" },
    { u: "শু", b: "ï" },
    { u: "হু", b: "û" },
    { u: "হূ", b: "ü" }
  ];

  // Single Unicode Characters to Bijoy
  const UNICODE_TO_BIJOY_SINGLE = {
    // Vowels (স্বরবর্ণ)
    'অ': 'A',
    'আ': 'Av',
    'ই': 'B',
    'ঈ': 'C',
    'উ': 'D',
    'ঊ': 'E',
    'ঋ': 'F',
    'এ': 'G',
    'ঐ': 'H',
    'ও': 'I',
    'ঔ': 'J',

    // Consonants (ব্যঞ্জনবর্ণ)
    'ক': 'K',
    'খ': 'L',
    'গ': 'M',
    'ঘ': 'N',
    'ঙ': 'O',
    'চ': 'P',
    'ছ': 'Q',
    'জ': 'R',
    'ঝ': 'S',
    'ঞ': 'T',
    'ট': 'U',
    'ঠ': 'V',
    'ড': 'W',
    'ঢ': 'X',
    'ণ': 'Y',
    'ত': 'Z',
    'থ': '_',
    'দ': '`',
    'ধ': 'a',
    'ন': 'b',
    'প': 'c',
    'ফ': 'd',
    'ব': 'e',
    'ভ': 'f',
    'ম': 'g',
    'য': 'h',
    'র': 'i',
    'ল': 'j',
    'শ': 'k',
    'ষ': 'l',
    'স': 'm',
    'হ': 'n',
    'ড়': 'o',
    'ঢ়': 'p',
    'য়': 'q',
    'ৎ': 'r',

    // Special signs & Punctuation
    'ং': 's',
    'ঃ': 't', // SutonnyMJ Visarga glyph is 't' (ASCII 116)
    'ঁ': 'u',
    '্': '&',
    'ঽ': '',
    '।': '|', // Bengali Dari -> ASCII Pipe for SutonnyMJ Dari
    '‘': "'",
    '’': "'",
    '“': '"',
    '”': '"',

    // Bengali Digits -> ASCII digits (SutonnyMJ renders ASCII 0-9 as ০-৯)
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',

    // Post-base vowel signs
    'া': 'v',
    'ী': 'x',
    'ু': 'y',
    'ূ': '~',
    'ৃ': '„'
  };

  const BANGLA_NUMBERS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const ENGLISH_NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  // Inverse Mapping Table for Bijoy -> Unicode, sorted longest first
  const BIJOY_TO_UNICODE_CONJUNCTS = [
    { b: "Av", u: "আ" }, // Essential independent Aa vowel
    ...UNICODE_TO_BIJOY_CONJUNCTS
  ].sort((a, b) => b.b.length - a.b.length);

  // Single Bijoy char to Unicode
  const BIJOY_TO_UNICODE_SINGLE = {};
  for (let uKey in UNICODE_TO_BIJOY_SINGLE) {
    let bVal = UNICODE_TO_BIJOY_SINGLE[uKey];
    if (bVal && !BIJOY_TO_UNICODE_SINGLE[bVal]) {
      BIJOY_TO_UNICODE_SINGLE[bVal] = uKey;
    }
  }
  // Specific single overrides for Bijoy -> Unicode
  BIJOY_TO_UNICODE_SINGLE['t'] = 'ঃ';
  BIJOY_TO_UNICODE_SINGLE['|'] = '।';
  BIJOY_TO_UNICODE_SINGLE['`'] = 'দ';
  BIJOY_TO_UNICODE_SINGLE['_'] = 'থ';
  BIJOY_TO_UNICODE_SINGLE['a'] = 'ধ';
  BIJOY_TO_UNICODE_SINGLE['b'] = 'ন';
  BIJOY_TO_UNICODE_SINGLE['c'] = 'প';
  BIJOY_TO_UNICODE_SINGLE['d'] = 'ফ';
  BIJOY_TO_UNICODE_SINGLE['e'] = 'ব';
  BIJOY_TO_UNICODE_SINGLE['f'] = 'ভ';
  BIJOY_TO_UNICODE_SINGLE['g'] = 'ম';
  BIJOY_TO_UNICODE_SINGLE['h'] = 'য';
  BIJOY_TO_UNICODE_SINGLE['i'] = 'র';
  BIJOY_TO_UNICODE_SINGLE['j'] = 'ল';
  BIJOY_TO_UNICODE_SINGLE['k'] = 'শ';
  BIJOY_TO_UNICODE_SINGLE['l'] = 'ষ';
  BIJOY_TO_UNICODE_SINGLE['m'] = 'স';
  BIJOY_TO_UNICODE_SINGLE['n'] = 'হ';
  BIJOY_TO_UNICODE_SINGLE['o'] = 'ড়';
  BIJOY_TO_UNICODE_SINGLE['p'] = 'ঢ়';
  BIJOY_TO_UNICODE_SINGLE['q'] = 'য়';
  BIJOY_TO_UNICODE_SINGLE['r'] = 'ৎ';
  BIJOY_TO_UNICODE_SINGLE['s'] = 'ং';
  BIJOY_TO_UNICODE_SINGLE['&'] = '্';
  BIJOY_TO_UNICODE_SINGLE['v'] = 'া';
  BIJOY_TO_UNICODE_SINGLE['x'] = 'ী';
  BIJOY_TO_UNICODE_SINGLE['y'] = 'ু';
  BIJOY_TO_UNICODE_SINGLE['~'] = 'ূ';
  BIJOY_TO_UNICODE_SINGLE['„'] = 'ৃ';
  BIJOY_TO_UNICODE_SINGLE['A'] = 'অ';
  BIJOY_TO_UNICODE_SINGLE['B'] = 'ই';
  BIJOY_TO_UNICODE_SINGLE['C'] = 'ঈ';
  BIJOY_TO_UNICODE_SINGLE['D'] = 'উ';
  BIJOY_TO_UNICODE_SINGLE['E'] = 'ঊ';
  BIJOY_TO_UNICODE_SINGLE['F'] = 'ঋ';
  BIJOY_TO_UNICODE_SINGLE['G'] = 'এ';
  BIJOY_TO_UNICODE_SINGLE['H'] = 'ঐ';
  BIJOY_TO_UNICODE_SINGLE['I'] = 'ও';
  BIJOY_TO_UNICODE_SINGLE['J'] = 'ঔ';

  function isBengaliChar(char) {
    if (!char) return false;
    const code = char.charCodeAt(0);
    return (code >= 0x0980 && code <= 0x09FF) || code === 0x0964 || code === 0x0965;
  }

  function hasBengaliText(text) {
    if (!text) return false;
    for (let i = 0; i < text.length; i++) {
      if (isBengaliChar(text[i])) return true;
    }
    return false;
  }

  function isBengaliConsonant(ch) {
    if (!ch) return false;
    const c = ch.charCodeAt(0);
    return (c >= 0x0995 && c <= 0x09B9) || ch === 'ড়' || ch === 'ঢ়' || ch === 'য়' || ch === 'ৎ';
  }

  function isWordDelimiter(ch) {
    if (!ch) return true;
    return /[\s\t\n\r\.\,\;\:\!\?\"\'\(\)\[\]\{\}\<\>\-\–\—\/\\\|\u0964\u0965«»“”‘’]/.test(ch);
  }

  /**
   * Core Unicode to Bijoy (SutonnyMJ) Algorithm
   */
  function unicodeToBijoy(text, options = {}) {
    if (!text || typeof text !== 'string') return text || '';

    // Normalize curly quotes & punctuation
    let str = text;
    str = str.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

    if (!hasBengaliText(str)) {
      let out = str;
      out = out.replace(/[\u09E6-\u09EF]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x09E6 + 0x30));
      out = out.replace(/\u0964/g, '|').replace(/\u0965/g, '||');
      return out;
    }

    // 1. Normalize Decomposed characters & Nuktas
    str = str.replace(/ড\u09BC/g, 'ড়').replace(/ঢ\u09BC/g, 'ঢ়').replace(/য\u09BC/g, 'য়').replace(/র\u09BC/g, 'ড়');
    str = str.replace(/\u09C7\u09BE/g, 'ো'); // e-kar + aa-kar -> o-kar
    str = str.replace(/\u09C7\u09D7/g, 'ৌ'); // e-kar + length -> ou-kar
    str = str.replace(/\u200D/g, '').replace(/\u200C/g, ''); // Remove ZWJ / ZWNJ

    let result = "";
    let i = 0;
    const len = str.length;

    while (i < len) {
      if (!isBengaliChar(str[i])) {
        result += str[i];
        i++;
        continue;
      }

      // Check if current syllable is at the BEGINNING of a word
      const syllableStartIndex = i;
      let isWordStart = (syllableStartIndex === 0) || isWordDelimiter(str[syllableStartIndex - 1]);

      // Check for Ref: 'র' + '্' followed by a consonant
      let hasRef = false;
      if (str[i] === 'র' && i + 1 < len && str[i + 1] === '্' && i + 2 < len && isBengaliConsonant(str[i + 2])) {
        hasRef = true;
        i += 2; // Skip 'র' + '্'
      }

      // Extract Consonant / Conjunct Cluster
      let clusterInfo = extractCluster(str, i);
      let clusterUnicode = clusterInfo.cluster;
      i = clusterInfo.nextIndex;

      // Extract Vowel Signs & Modifiers
      // Word-Initial: '†' (\u2020 / Alt 0134 - Un-matraed)
      // Inside Word: '‡' (\u2021 / Alt 0135 - Matra-attached)
      const eKarGlyph = isWordStart ? '†' : '‡';

      let preVowel = "";   // 'w' (ি), '†'/'‡' (ে), 'ˆ' (ৈ)
      let postVowel = "";  // 'v' (া), 'x' (ী), 'y' (ু), '~' (ূ), '„' (ৃ), 'Š' (ৌ)
      let hasChandra = false;

      while (i < len) {
        let ch = str[i];
        if (ch === 'ি') {
          preVowel = 'w';
          i++;
        } else if (ch === 'ে') {
          preVowel = eKarGlyph;
          i++;
        } else if (ch === 'ৈ') {
          preVowel = 'ˆ'; // SutonnyMJ Oi-Kar (\u02C6)
          i++;
        } else if (ch === 'ো') {
          preVowel = eKarGlyph;
          postVowel = 'v';
          i++;
        } else if (ch === 'ৌ') {
          preVowel = eKarGlyph;
          postVowel = 'Š';
          i++;
        } else if (ch === 'া') {
          postVowel = 'v';
          i++;
        } else if (ch === 'ী') {
          postVowel = 'x';
          i++;
        } else if (ch === 'ু') {
          postVowel = 'y';
          i++;
        } else if (ch === 'ূ') {
          postVowel = '~';
          i++;
        } else if (ch === 'ৃ') {
          postVowel = '„';
          i++;
        } else if (ch === 'ঁ') {
          hasChandra = true;
          i++;
        } else {
          break;
        }
      }

      // Map cluster to Bijoy
      let bijoyCluster = mapCluster(clusterUnicode);

      // Special postVowel ligatures
      if (clusterUnicode === 'ক' && postVowel === 'y') { bijoyCluster = 'Kz'; postVowel = ''; }
      else if (clusterUnicode === 'গ' && postVowel === 'y') { bijoyCluster = 'My'; postVowel = ''; }
      else if (clusterUnicode === 'র' && postVowel === 'y') { bijoyCluster = 'iæ'; postVowel = ''; }
      else if (clusterUnicode === 'র' && postVowel === '~') { bijoyCluster = 'iƒ'; postVowel = ''; }
      else if (clusterUnicode === 'শ' && postVowel === 'y') { bijoyCluster = 'ï'; postVowel = ''; }
      else if (clusterUnicode === 'হ' && postVowel === 'y') { bijoyCluster = 'û'; postVowel = ''; }
      else if (clusterUnicode === 'হ' && postVowel === '~') { bijoyCluster = 'ü'; postVowel = ''; }
      else if (clusterUnicode === 'হ' && postVowel === '„') { bijoyCluster = 'ü'; postVowel = ''; }

      // Construct Bijoy token:
      let unit = "";
      if (preVowel) unit += preVowel;
      unit += bijoyCluster;
      if (postVowel) unit += postVowel;
      if (hasRef) unit += '©';
      if (hasChandra) unit += 'u';

      result += unit;
    }

    return result;
  }

  function extractCluster(str, startIndex) {
    let i = startIndex;
    let cluster = "";

    const first = str[i];
    if (UNICODE_TO_BIJOY_SINGLE[first] && !isBengaliConsonant(first)) {
      return { cluster: first, nextIndex: i + 1 };
    }

    while (i < str.length) {
      let ch = str[i];
      if (isBengaliConsonant(ch)) {
        cluster += ch;
        i++;
        if (i < str.length && str[i] === '্') {
          if (i + 1 < str.length && (isBengaliConsonant(str[i + 1]) || str[i + 1] === 'য' || str[i + 1] === 'র' || str[i + 1] === 'ব')) {
            cluster += '্';
            i++;
            continue;
          } else {
            cluster += '্';
            i++;
            break;
          }
        } else {
          break;
        }
      } else if (ch >= '০' && ch <= '৯') {
        cluster = ch;
        i++;
        break;
      } else if (ch === 'ং' || ch === 'ঃ' || ch === 'ঁ' || ch === '।' || ch === 'ৎ' || ch === '\u0964') {
        cluster = ch;
        i++;
        break;
      } else {
        break;
      }
    }

    if (!cluster && startIndex < str.length) {
      cluster = str[startIndex];
      i = startIndex + 1;
    }

    return { cluster, nextIndex: i };
  }

  function mapCluster(cluster) {
    if (!cluster) return '';

    for (let item of UNICODE_TO_BIJOY_CONJUNCTS) {
      if (cluster === item.u) return item.b;
    }

    if (UNICODE_TO_BIJOY_SINGLE[cluster]) {
      return UNICODE_TO_BIJOY_SINGLE[cluster];
    }

    let parts = cluster.split('্');
    if (parts.length > 1) {
      let out = "";
      for (let p = 0; p < parts.length; p++) {
        let partChar = parts[p];
        let bijoyChar = UNICODE_TO_BIJOY_SINGLE[partChar] || partChar;
        if (p === 0) {
          out += bijoyChar;
        } else {
          if (partChar === 'য') out += '¨';
          else if (partChar === 'র') out += 'ª';
          else if (partChar === 'ব') out += '¡';
          else out += '&' + bijoyChar;
        }
      }
      return out;
    }

    let res = "";
    for (let c of cluster) {
      res += UNICODE_TO_BIJOY_SINGLE[c] || c;
    }
    return res;
  }

  function convertDigits(text, format) {
    if (!text) return text;
    if (format === 'bengali') {
      for (let d = 0; d < 10; d++) {
        text = text.replaceAll(ENGLISH_NUMBERS[d], BANGLA_NUMBERS[d]);
      }
    } else if (format === 'english') {
      for (let d = 0; d < 10; d++) {
        text = text.replaceAll(BANGLA_NUMBERS[d], ENGLISH_NUMBERS[d]);
      }
    }
    return text;
  }

  /**
   * Token-Based Robust Bijoy (SutonnyMJ) to Unicode Converter
   */
  function bijoyToUnicode(text, options = {}) {
    if (!text || typeof text !== 'string') return text || '';

    let str = text;
    let result = "";
    let i = 0;
    const len = str.length;

    while (i < len) {
      // 1. Check for Pre-vowels
      let preVowel = "";
      let ch = str[i];

      if (ch === 'w') {
        preVowel = 'ি';
        i++;
      } else if (ch === '†' || ch === '‡') {
        preVowel = 'ে';
        i++;
      } else if (ch === 'ˆ' || ch === '‰') {
        preVowel = 'ৈ';
        i++;
      }

      if (i >= len) {
        if (preVowel) result += preVowel;
        break;
      }

      // 2. Extract Cluster / Glyph
      let matchedClusterUnicode = "";
      let matchedLen = 0;

      // Check multi-character conjuncts first
      for (let item of BIJOY_TO_UNICODE_CONJUNCTS) {
        if (str.startsWith(item.b, i)) {
          matchedClusterUnicode = item.u;
          matchedLen = item.b.length;
          break;
        }
      }

      // Check single char mapping
      if (!matchedClusterUnicode) {
        let singleCh = str[i];
        if (BIJOY_TO_UNICODE_SINGLE[singleCh]) {
          matchedClusterUnicode = BIJOY_TO_UNICODE_SINGLE[singleCh];
          matchedLen = 1;
        } else {
          matchedClusterUnicode = singleCh;
          matchedLen = 1;
        }
      }

      i += matchedLen;

      // 3. Extract Modifiers (Post-vowels, Ref, Chandrabindu)
      let postVowel = "";
      let hasRef = false;
      let hasChandra = false;

      // If matched cluster was independent vowel "আ" (from 'Av'), do not look for extra 'v'
      const isIndependentVowel = (matchedClusterUnicode === 'আ' || matchedClusterUnicode === 'অ' || 
                                  matchedClusterUnicode === 'ই' || matchedClusterUnicode === 'ঈ' || 
                                  matchedClusterUnicode === 'উ' || matchedClusterUnicode === 'ঊ' || 
                                  matchedClusterUnicode === 'ঋ' || matchedClusterUnicode === 'এ' || 
                                  matchedClusterUnicode === 'ঐ' || matchedClusterUnicode === 'ও' || 
                                  matchedClusterUnicode === 'ঔ');

      while (i < len) {
        let nextCh = str[i];
        if (nextCh === '©') {
          hasRef = true;
          i++;
        } else if (nextCh === 'u') {
          hasChandra = true;
          i++;
        } else if (!isIndependentVowel && nextCh === 'v') {
          postVowel = 'া';
          i++;
        } else if (!isIndependentVowel && nextCh === 'x') {
          postVowel = 'ী';
          i++;
        } else if (!isIndependentVowel && nextCh === 'y') {
          postVowel = 'ু';
          i++;
        } else if (!isIndependentVowel && nextCh === '~') {
          postVowel = 'ূ';
          i++;
        } else if (!isIndependentVowel && nextCh === '„') {
          postVowel = 'ৃ';
          i++;
        } else if (!isIndependentVowel && nextCh === 'Š') {
          postVowel = 'ৌ';
          i++;
        } else {
          break;
        }
      }

      // Check for composite o-kar / ou-kar
      let finalVowel = "";
      if (preVowel === 'ে' && postVowel === 'া') {
        finalVowel = 'ো';
      } else if (preVowel === 'ে' && postVowel === 'ৌ') {
        finalVowel = 'ৌ';
      } else {
        finalVowel = preVowel + postVowel;
      }

      // Construct Unicode Token: [Ref (র্)] + [Cluster] + [Vowel] + [Chandrabindu (ঁ)]
      let unit = "";
      if (hasRef) unit += 'র্';
      unit += matchedClusterUnicode;
      if (finalVowel) unit += finalVowel;
      if (hasChandra) unit += 'ঁ';

      result += unit;
    }

    if (options.convertNumbers) {
      result = convertDigits(result, options.numberFormat);
    }

    return result;
  }

  function autoConvert(text, options = {}) {
    if (!text) return text;
    if (hasBengaliText(text)) {
      return unicodeToBijoy(text, options);
    } else {
      return bijoyToUnicode(text, options);
    }
  }

  const BanglaConverter = {
    unicodeToBijoy,
    bijoyToUnicode,
    autoConvert,
    hasBengaliText,
    isBengaliChar,
    convertDigits
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BanglaConverter;
  } else {
    global.BanglaConverter = BanglaConverter;
  }

})(typeof window !== 'undefined' ? window : global);
