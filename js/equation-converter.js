/**
 * EquationConverter.js
 * High-Fidelity LaTeX and OMML to Word EQ Field converter for Office 2003 / 2007+.
 * Features:
 * 1. Automatic Math Italics (<w:i/>) on all equation runs to match Equation Editor 100%.
 * 2. Proper degree conversion (^\circ, ^{\circ}, \circ, \degree -> \u00B0) and angles (\angle -> \u2220).
 * 3. Standard trigonometry / units (\tan, \sin, \cos, \text{cm}) and quoted text words.
 * 4. 100% clean Word editability without duplicate fallback text.
 * 5. 100% ASCII safe using explicit Unicode escapes for total cross-browser and cross-encoding stability.
 */

(function (global) {
  'use strict';

  class EquationConverter {

    /**
     * Translates a LaTeX equation into a Word EQ Field code string.
     */
    static latexToEqField(latex, isU2B) {
      if (typeof isU2B === 'undefined') isU2B = true;
      if (!latex) return "";
      let s = latex.trim();

      // 0. Strip math delimiters ($$, $, \[, \], \(, \))
      if (s.startsWith('$$') && s.endsWith('$$')) s = s.slice(2, -2).trim();
      else if (s.startsWith('$') && s.endsWith('$')) s = s.slice(1, -1).trim();
      else if (s.startsWith('\\[') && s.endsWith('\\]')) s = s.slice(2, -2).trim();
      else if (s.startsWith('\\(') && s.endsWith('\\)')) s = s.slice(2, -2).trim();

      // 0.1 Pre-convert degree symbols and angles BEFORE _convertMacros
      s = s.replace(/\\angle\b/g, '\u2220');
      s = s.replace(/\^\s*\\circ\b|\^\{\s*\\circ\s*\}|\\circ\b|\\degree\b|\^\{\s*\u00B0\s*\}|\^\u00B0/g, '\u00B0');

      // 0.2 Pre-sanitize LaTeX escape characters so Word never confuses them with EQ field switches
      s = s.replace(/\\%/g, '%');
      // LaTeX tie / non-breaking space (~) and \sim used between quantity and unit -> space
      s = s.replace(/\\sim\b/g, ' ');
      s = s.replace(/~/g, ' ');
      s = s.replace(/\\\$/g, '$');
      s = s.replace(/\\&/g, '&');
      s = s.replace(/\\_/g, '_');
      s = s.replace(/\\#/g, '#');
      s = s.replace(/\\\{/g, '{');
      s = s.replace(/\\\}/g, '}');

      // 1. Process \text{...} / \mathrm{...} blocks:
      s = s.replace(/\\(?:text|mathrm|textmd|textbf|textit)\{([^{}]+)\}/g, function(match, inner) {
        let trimmed = inner.trim();
        let converted = trimmed;
        if (isU2B && typeof BanglaConverter !== 'undefined' && BanglaConverter.hasBengaliText(trimmed)) {
          converted = BanglaConverter.unicodeToBijoy(trimmed, { convertNumbers: false });
        }
        return ' "' + converted + '" ';
      });

      // 2. Convert LaTeX macros (fractions, roots, superscripts, subscripts, brackets)
      s = this._convertMacros(s, isU2B);

      // 3. Convert math symbols, trig functions and greek letters
      s = this._convertSymbols(s);

      // 4. Clean up spaces
      s = s.replace(/\s+/g, ' ').trim();

      return s;
    }

    /**
     * Helper to find matching brace group { ... } or [ ... ]
     */
    static _extractGroup(str, startIndex) {
      if (startIndex >= str.length) return null;
      const openChar = str[startIndex];
      if (openChar !== '{' && openChar !== '[') return null;
      const closeChar = openChar === '{' ? '}' : ']';
      let depth = 0;

      for (let i = startIndex; i < str.length; i++) {
        if (str[i] === openChar) {
          depth++;
        } else if (str[i] === closeChar) {
          depth--;
          if (depth === 0) {
            return {
              content: str.substring(startIndex + 1, i),
              endIndex: i
            };
          }
        }
      }
      return null;
    }

    /**
     * Recursively convert LaTeX structural macros to Word EQ fields
     */
    static _convertMacros(str, isU2B) {
      let result = "";
      let i = 0;

      while (i < str.length) {
        // Check for \frac, \dfrac, \tfrac
        if (str.startsWith('\\frac', i) || str.startsWith('\\dfrac', i) || str.startsWith('\\tfrac', i)) {
          let macroLen = str.startsWith('\\frac', i) ? 5 : 6;
          let p = i + macroLen;
          while (p < str.length && /\s/.test(str[p])) p++;

          let numGroup = this._extractGroup(str, p);
          if (numGroup) {
            let p2 = numGroup.endIndex + 1;
            while (p2 < str.length && /\s/.test(str[p2])) p2++;
            let denGroup = this._extractGroup(str, p2);
            if (denGroup) {
              let numConverted = this._convertMacros(numGroup.content, isU2B);
              let denConverted = this._convertMacros(denGroup.content, isU2B);
              result += '\\F(' + numConverted + ',' + denConverted + ')';
              i = denGroup.endIndex + 1;
              continue;
            }
          }
        }

        // Check for \sqrt[deg]{val} or \sqrt{val}
        if (str.startsWith('\\sqrt', i)) {
          let p = i + 5;
          while (p < str.length && /\s/.test(str[p])) p++;

          let deg = "";
          if (str[p] === '[') {
            let degGroup = this._extractGroup(str, p);
            if (degGroup) {
              deg = this._convertMacros(degGroup.content, isU2B);
              p = degGroup.endIndex + 1;
              while (p < str.length && /\s/.test(str[p])) p++;
            }
          }

          let radGroup = this._extractGroup(str, p);
          if (radGroup) {
            let radConverted = this._convertMacros(radGroup.content, isU2B);
            result += '\\R(' + deg + ',' + radConverted + ')';
            i = radGroup.endIndex + 1;
            continue;
          }
        }

        // Check for \left( ... \right), \left\{ ... \right\}, \left[ ... \right]
        if (str.startsWith('\\left', i)) {
          let p = i + 5;
          while (p < str.length && /\s/.test(str[p])) p++;

          let bracket = str[p];
          if (bracket === '\\' && (str[p+1] === '{' || str[p+1] === '}')) {
            bracket = str[p+1];
            p++;
          }

          let rightIdx = str.indexOf('\\right', p + 1);
          if (rightIdx !== -1) {
            let innerContent = str.substring(p + 1, rightIdx);
            let innerConverted = this._convertMacros(innerContent, isU2B);
            let rightP = rightIdx + 6;
            while (rightP < str.length && /\s/.test(str[rightP])) rightP++;

            if (bracket === '(') result += '(' + innerConverted + ')';
            else if (bracket === '{') result += '{' + innerConverted + '}';
            else if (bracket === '[') result += '[' + innerConverted + ']';
            else if (bracket === '|') result += '|' + innerConverted + '|';
            else result += '(' + innerConverted + ')';

            i = (str[rightP] === '\\' ? rightP + 2 : rightP + 1);
            continue;
          }
        }

        // Escape set brackets
        if (str.startsWith('\\{', i)) {
          result += '{';
          i += 2;
          continue;
        }
        if (str.startsWith('\\}', i)) {
          result += '}';
          i += 2;
          continue;
        }

        // Superscript ^
        if (str[i] === '^') {
          let p = i + 1;
          while (p < str.length && /\s/.test(str[p])) p++;

          if (str[p] === '{') {
            let expGroup = this._extractGroup(str, p);
            if (expGroup) {
              let expConverted = this._convertMacros(expGroup.content, isU2B);
              result += '\\S\\up4(' + expConverted + ')';
              i = expGroup.endIndex + 1;
              continue;
            }
          } else if (p < str.length) {
            result += '\\S\\up4(' + str[p] + ')';
            i = p + 1;
            continue;
          }
        }

        // Subscript _
        if (str[i] === '_') {
          let p = i + 1;
          while (p < str.length && /\s/.test(str[p])) p++;

          if (str[p] === '{') {
            let subGroup = this._extractGroup(str, p);
            if (subGroup) {
              let subConverted = this._convertMacros(subGroup.content, isU2B);
              result += '\\S\\do4(' + subConverted + ')';
              i = subGroup.endIndex + 1;
              continue;
            }
          } else if (p < str.length) {
            result += '\\S\\do4(' + str[p] + ')';
            i = p + 1;
            continue;
          }
        }

        result += str[i];
        i++;
      }

      return result;
    }

    /**
     * Replaces LaTeX symbols with Word EQ Field compatible characters
     */
    static _convertSymbols(s) {
      const symbolMap = [
        [/\\in\b/g, '\u2208'],
        [/\\notin\b/g, '\u2209'],
        [/\\mathbb\{N\}|\\mathbf\{N\}|\b\\mathbb N\b/g, 'N'],
        [/\\mathbb\{R\}|\\mathbf\{R\}|\b\\mathbb R\b/g, 'R'],
        [/\\mathbb\{Z\}|\\mathbf\{Z\}|\b\\mathbb Z\b/g, 'Z'],
        [/\\mathbb\{Q\}|\\mathbf\{Q\}|\b\\mathbb Q\b/g, 'Q'],
        [/\\mathbb\{C\}|\\mathbf\{C\}|\b\\mathbb C\b/g, 'C'],
        [/\\times\b/g, '\u00D7'],
        [/\\div\b/g, '\u00F7'],
        [/\\pm\b/g, '\u00B1'],
        [/\\mp\b/g, '\u2213'],
        [/\\leq\b|\\le\b/g, '\u2264'],
        [/\\geq\b|\\ge\b/g, '\u2265'],
        [/\\neq\b|\\ne\b/g, '\u2260'],
        [/\\approx\b/g, '\u2248'],
        [/\\equiv\b/g, '\u2261'],
        [/\\propto\b/g, '\u221D'],
        [/\\infty\b/g, '\u221E'],
        [/\\subset\b/g, '\u2282'],
        [/\\subseteq\b/g, '\u2286'],
        [/\\supset\b/g, '\u2283'],
        [/\\supseteq\b/g, '\u2287'],
        [/\\cup\b/g, '\u222A'],
        [/\\cap\b/g, '\u2229'],
        [/\\forall\b/g, '\u2200'],
        [/\\exists\b/g, '\u2203'],
        [/\\rightarrow\b|\\to\b/g, '\u2192'],
        [/\\Rightarrow\b/g, '\u21D2'],
        [/\\leftarrow\b/g, '\u2190'],
        [/\\Leftarrow\b/g, '\u21D0'],
        [/\\leftrightarrow\b/g, '\u2194'],
        [/\\Leftrightarrow\b/g, '\u21D4'],
        [/\\cdot\b/g, '\u00B7'],
        [/\\cdots\b/g, '\u00B7\u00B7\u00B7'],
        [/\\ldots\b/g, '...'],
        [/\\alpha\b/g, '\u03B1'],
        [/\\beta\b/g, '\u03B2'],
        [/\\gamma\b/g, '\u03B3'],
        [/\\delta\b/g, '\u03B4'],
        [/\\theta\b/g, '\u03B8'],
        [/\\lambda\b/g, '\u03BB'],
        [/\\mu\b/g, '\u03BC'],
        [/\\pi\b/g, '\u03C0'],
        [/\\sigma\b/g, '\u03C3'],
        [/\\phi\b/g, '\u03C6'],
        [/\\omega\b/g, '\u03C9'],
        [/\\Delta\b/g, '\u0394'],
        [/\\Sigma\b/g, '\u03A3'],
        [/\\Omega\b/g, '\u03A9'],
        [/\\sin\b/g, 'sin'],
        [/\\cos\b/g, 'cos'],
        [/\\tan\b/g, 'tan'],
        [/\\cot\b/g, 'cot'],
        [/\\sec\b/g, 'sec'],
        [/\\csc\b/g, 'csc'],
        [/\\ln\b/g, 'ln'],
        [/\\log\b/g, 'log'],
        [/\\deg\b/g, '\u00B0'],
        [/\\triangle\b/g, '\u0394'],
        [/\\quad\b/g, '  '],
        [/\\qquad\b/g, '    '],
        [/\\,/g, ' '],
        [/\\;/g, ' '],
        [/\\!/g, ''],
        [/\\sim\b/g, ' '],
        [/~/g, ' '],
        [/\\%/g, '%'],
        [/\\ohm\b/g, '\u03A9'],
        [/\\bullet\b/g, '\u2022']
      ];

      for (let k = 0; k < symbolMap.length; k++) {
        s = s.replace(symbolMap[k][0], symbolMap[k][1]);
      }
      return s;
    }



    /**
     * Tokenizes an EQ field code into segments with individual italic formatting and script font sizing.
     * Math variables (letters) => italic: true
     * Numbers (1, 2, 3...), Operators (+, -, =, <, >), Functions (sin, cos, tan), Keywords (EQ, \F, \R, \S) => italic: false
     * Superscripts / Subscripts inside \S\up4(...) / \S\do4(...) => isScript: true (small 8pt font size)
     */
    static tokenizeEqCode(eqCode) {
      if (!eqCode) return [];
      const tokens = [];
      const tokenRegex = /(".*?"|'.*?')|(\\(?:S\\)?(?:up|do)\d*\()|(\bEQ\b|\\(?:F|R|S|B|A|I|D|X|up\d*|do\d*)\b)|(\))|(\b(?:sin|cos|tan|cot|sec|csc|ln|log|lim|det|min|max|exp|mod|gcd|deg)\b)|(\d+(?:\.\d+)?)|([a-zA-Z])|([^a-zA-Z0-9"'\\]+|\S)/g;

      let scriptDepth = 0;
      let match;

      while ((match = tokenRegex.exec(eqCode)) !== null) {
        const text = match[0];
        if (match[1]) {
          // Quoted string
          tokens.push({ text: text, italic: false, isScript: scriptDepth > 0 });
        } else if (match[2]) {
          // Script macro start e.g. \S\up4(
          tokens.push({ text: text, italic: false, isScript: false });
          scriptDepth++;
        } else if (match[3]) {
          // General macro keyword e.g. \F, \R, EQ
          tokens.push({ text: text, italic: false, isScript: scriptDepth > 0 });
        } else if (match[4]) {
          // Closing parenthesis
          if (scriptDepth > 0) {
            tokens.push({ text: text, italic: false, isScript: false });
            scriptDepth--;
          } else {
            tokens.push({ text: text, italic: false, isScript: false });
          }
        } else if (match[5]) {
          // Functions: sin, cos, tan...
          tokens.push({ text: text, italic: false, isScript: scriptDepth > 0 });
        } else if (match[6]) {
          // Numbers: 1, 2, 15, 225...
          tokens.push({ text: text, italic: false, isScript: scriptDepth > 0 });
        } else if (match[7]) {
          // English variable letters: x, y, p, f, A, B, C...
          tokens.push({ text: text, italic: true, isScript: scriptDepth > 0 });
        } else {
          // Operators, spaces, symbols
          tokens.push({ text: text, italic: false, isScript: scriptDepth > 0 });
        }
      }

      const merged = [];
      for (let k = 0; k < tokens.length; k++) {
        const t = tokens[k];
        if (merged.length > 0 && 
            merged[merged.length - 1].italic === t.italic && 
            merged[merged.length - 1].isScript === t.isScript) {
          merged[merged.length - 1].text += t.text;
        } else {
          merged.push({ text: t.text, italic: t.italic, isScript: t.isScript });
        }
      }
      return merged;
    }

    /**
     * Constructs OpenXML Word Run elements for a Word EQ Field.
     */
    static createOpenXmlEqRuns(xmlDoc, eqCode, originalRPr) {
      const runs = [];

      const baseSzVal = (function() {
        if (originalRPr) {
          const szNode = originalRPr.querySelector("sz, szCs");
          if (szNode) {
            const v = parseInt(szNode.getAttribute("w:val") || szNode.getAttribute("val"), 10);
            if (v) return v;
          }
        }
        return 24; // default 12pt (24 half-points)
      })();
      const scriptSzVal = Math.round(baseSzVal * 0.67); // 8pt (16 half-points)

      const makeMathRPr = (isItalic, isScript) => {
        let rPr = originalRPr ? originalRPr.cloneNode(true) : xmlDoc.createElement("w:rPr");
        let rFonts = rPr.querySelector("rFonts");
        if (!rFonts) {
          rFonts = xmlDoc.createElement("w:rFonts");
          rPr.appendChild(rFonts);
        }
        rFonts.setAttribute("w:ascii", "Times New Roman");
        rFonts.setAttribute("w:hAnsi", "Times New Roman");
        rFonts.setAttribute("w:cs", "Times New Roman");
        rFonts.setAttribute("w:eastAsia", "Times New Roman");
        rFonts.setAttribute("w:hint", "default");

        // Small 8pt font size for superscripts / subscripts, 12pt for base
        const targetSz = (isScript ? scriptSzVal : baseSzVal).toString();
        let szNode = rPr.querySelector("sz");
        if (!szNode) {
          szNode = xmlDoc.createElement("w:sz");
          rPr.appendChild(szNode);
        }
        szNode.setAttribute("w:val", targetSz);

        let szCsNode = rPr.querySelector("szCs");
        if (!szCsNode) {
          szCsNode = xmlDoc.createElement("w:szCs");
          rPr.appendChild(szCsNode);
        }
        szCsNode.setAttribute("w:val", targetSz);

        // Remove any preexisting italic tags
        const existingI = Array.from(rPr.querySelectorAll("i, iCs"));
        for (let j = 0; j < existingI.length; j++) {
          rPr.removeChild(existingI[j]);
        }

        // Apply Italics ONLY if isItalic is true (English variable letters)
        if (isItalic) {
          const iTag = xmlDoc.createElement("w:i");
          const iCsTag = xmlDoc.createElement("w:iCs");
          rPr.appendChild(iTag);
          rPr.appendChild(iCsTag);
        }

        let lang = rPr.querySelector("lang");
        if (!lang) {
          lang = xmlDoc.createElement("w:lang");
          rPr.appendChild(lang);
        }
        lang.setAttribute("w:val", "en-US");
        lang.setAttribute("w:bidi", "en-US");

        const csTags = Array.from(rPr.querySelectorAll("cs, rtl"));
        for (let j = 0; j < csTags.length; j++) {
          rPr.removeChild(csTags[j]);
        }

        return rPr;
      };

      // 1. Begin field
      const r1 = xmlDoc.createElement("w:r");
      r1.appendChild(makeMathRPr(false, false));
      const fld1 = xmlDoc.createElement("w:fldChar");
      fld1.setAttribute("w:fldCharType", "begin");
      r1.appendChild(fld1);
      runs.push(r1);

      // 2. InstrText runs with variable Italics and small superscripts
      const fullEq = ' EQ ' + eqCode + ' ';
      const tokens = this.tokenizeEqCode(fullEq);

      for (let k = 0; k < tokens.length; k++) {
        const t = tokens[k];
        if (!t.text) continue;
        const r = xmlDoc.createElement("w:r");
        r.appendChild(makeMathRPr(t.italic, t.isScript));
        const instr = xmlDoc.createElement("w:instrText");
        instr.setAttribute("xml:space", "preserve");
        instr.textContent = t.text;
        r.appendChild(instr);
        runs.push(r);
      }

      // 3. End field
      const r3 = xmlDoc.createElement("w:r");
      r3.appendChild(makeMathRPr(false, false));
      const fld3 = xmlDoc.createElement("w:fldChar");
      fld3.setAttribute("w:fldCharType", "end");
      r3.appendChild(fld3);
      runs.push(r3);

      return runs;
    }

    /**
     * Creates a standard text run
     */
    static createTextRun(xmlDoc, text, fontName, originalRPr) {
      const r = xmlDoc.createElement("w:r");
      let rPr = originalRPr ? originalRPr.cloneNode(true) : xmlDoc.createElement("w:rPr");
      
      if (fontName) {
        let rFonts = rPr.querySelector("rFonts");
        if (!rFonts) {
          rFonts = xmlDoc.createElement("w:rFonts");
          rPr.appendChild(rFonts);
        }
        rFonts.setAttribute("w:ascii", fontName);
        rFonts.setAttribute("w:hAnsi", fontName);
        rFonts.setAttribute("w:cs", fontName);
      }
      r.appendChild(rPr);

      const t = xmlDoc.createElement("w:t");
      t.setAttribute("xml:space", "preserve");
      t.textContent = text;
      r.appendChild(t);
      return r;
    }

    /**
     * Splits a mixed string of text and LaTeX math into segments.
     */
    static splitTextAndMath(text) {
      const segments = [];
      if (!text) return segments;

      const regex = /\$\$([\s\S]*?)\$\$|\$([^\$]+?)\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          segments.push({
            type: 'text',
            value: text.substring(lastIndex, match.index)
          });
        }

        const mathContent = match[1] || match[2] || match[3] || match[4] || "";
        segments.push({
          type: 'math',
          value: mathContent
        });

        lastIndex = regex.lastIndex;
      }

      if (lastIndex < text.length) {
        segments.push({
          type: 'text',
          value: text.substring(lastIndex)
        });
      }

      return segments;
    }

    /**
     * Determines whether a LaTeX math string genuinely requires a Word EQ Field code
     * (e.g. fractions, square roots, superscripts, subscripts, integrals, matrices),
     * or if it can be rendered as clean, error-free standard text runs.
     */
    static needsEqField(latex) {
      if (!latex) return false;
      let s = latex.trim();
      if (s.startsWith('$$') && s.endsWith('$$')) s = s.slice(2, -2).trim();
      else if (s.startsWith('$') && s.endsWith('$')) s = s.slice(1, -1).trim();
      else if (s.startsWith('\\[') && s.endsWith('\\]')) s = s.slice(2, -2).trim();
      else if (s.startsWith('\\(') && s.endsWith('\\)')) s = s.slice(2, -2).trim();

      // Complex mathematical structures requiring Word EQ switch commands:
      return /[_^]|\\frac|\\dfrac|\\tfrac|\\sqrt|\\int|\\sum|\\prod|\\lim|\\matrix|\\binom|\\overline|\\underline|\\vec|\\dot|\\ddot|\\partial/.test(s);
    }

    /**
     * Strips math delimiters and cleans LaTeX escapes for simple math/quantities/units.
     * E.g. "$90\%$" -> "90%", "$40\sim m$" -> "40~m", "$40$" -> "40"
     */
    static sanitizeSimpleMath(latex) {
      if (!latex) return "";
      let s = latex.trim();
      if (s.startsWith('$$') && s.endsWith('$$')) s = s.slice(2, -2).trim();
      else if (s.startsWith('$') && s.endsWith('$')) s = s.slice(1, -1).trim();
      else if (s.startsWith('\\[') && s.endsWith('\\]')) s = s.slice(2, -2).trim();
      else if (s.startsWith('\\(') && s.endsWith('\\)')) s = s.slice(2, -2).trim();

      s = s.replace(/\\%/g, '%');
      // LaTeX non-breaking space (~) and \sim used between quantity and unit -> space
      s = s.replace(/\\sim\b/g, ' ');
      s = s.replace(/~/g, ' ');
      s = s.replace(/\\\$/g, '$');
      s = s.replace(/\\&/g, '&');
      s = s.replace(/\\_/g, '_');
      s = s.replace(/\\#/g, '#');
      s = s.replace(/\\\{/g, '{');
      s = s.replace(/\\\}/g, '}');
      s = s.replace(/\\times\b/g, '\u00D7');
      s = s.replace(/\\pm\b/g, '\u00B1');
      s = s.replace(/\\mp\b/g, '\u2213');
      s = s.replace(/\\circ\b|\\degree\b/g, '\u00B0');
      s = s.replace(/\\quad\b/g, '  ');
      s = s.replace(/\\qquad\b/g, '    ');
      s = s.replace(/\\,|\\;|\\:/g, ' ');
      s = s.replace(/\\!/g, '');

      return s;
    }

    /**
     * Tokenizes simple math into text runs with appropriate italic styling for variables.
     */
    static tokenizeSimpleMath(str) {
      if (!str) return [];
      const regex = /(\d+(?:\.\d+)?%?)|([a-zA-Z]+)|([^a-zA-Z0-9]+)/g;
      const tokens = [];
      let m;
      const knownUnits = /^(kg|gm|mg|ms|cm|mm|km|nm|Hz|kHz|MHz|GHz|rad|deg|mol|cd|dB|eV|keV|MeV|GeV|kW|MW|GW|mA|uA|muA|pF|nF|uF|muF|sec|min|hr)$/i;

      while ((m = regex.exec(str)) !== null) {
        if (m[1]) {
          tokens.push({ text: m[1], italic: false });
        } else if (m[2]) {
          const isUnit = knownUnits.test(m[2]);
          tokens.push({ text: m[2], italic: !isUnit });
        } else if (m[3]) {
          tokens.push({ text: m[3], italic: false });
        }
      }
      return tokens;
    }

    /**
     * Creates clean, standard OpenXML runs for simple math numbers, units, and symbols.
     * Prevents Word EQ Field "Error!" on non-switch inputs like "$90\%$", "$40$", "$40~m$".
     */
    static createSimpleMathRuns(xmlDoc, latex, originalRPr) {
      const clean = this.sanitizeSimpleMath(latex);
      const runs = [];
      if (!clean) return runs;

      const tokens = this.tokenizeSimpleMath(clean);
      for (let tok of tokens) {
        if (!tok.text) continue;
        const r = xmlDoc.createElement("w:r");
        let rPr = originalRPr ? originalRPr.cloneNode(true) : xmlDoc.createElement("w:rPr");

        let rFonts = rPr.querySelector("rFonts");
        if (!rFonts) {
          rFonts = xmlDoc.createElement("w:rFonts");
          rPr.appendChild(rFonts);
        }
        rFonts.setAttribute("w:ascii", "Times New Roman");
        rFonts.setAttribute("w:hAnsi", "Times New Roman");
        rFonts.setAttribute("w:cs", "Times New Roman");

        // Remove any existing italic
        const existingI = Array.from(rPr.querySelectorAll("i, iCs"));
        for (let j = 0; j < existingI.length; j++) rPr.removeChild(existingI[j]);

        if (tok.italic) {
          rPr.appendChild(xmlDoc.createElement("w:i"));
          rPr.appendChild(xmlDoc.createElement("w:iCs"));
        }

        r.appendChild(rPr);
        const t = xmlDoc.createElement("w:t");
        t.setAttribute("xml:space", "preserve");
        t.textContent = tok.text;
        r.appendChild(t);
        runs.push(r);
      }

      return runs;
    }

    /**
     * Parses native Word OMML (<m:oMath>) to OpenXML EQ Field runs
     */
    static ommlToOpenXmlRuns(oMathNode, xmlDoc, originalRPr) {
      let eqCode = this._parseOmmlNode(oMathNode);
      if (!eqCode) return [];
      return this.createOpenXmlEqRuns(xmlDoc, eqCode, originalRPr);
    }

    static _parseOmmlNode(node) {
      if (!node) return "";
      let result = "";
      const childNodes = Array.from(node.childNodes);

      for (let i = 0; i < childNodes.length; i++) {
        const child = childNodes[i];
        if (child.nodeType !== 1) continue;
        const nodeName = child.localName || child.nodeName.split(':').pop();

        if (nodeName === "t") {
          result += child.textContent;
        } else if (nodeName === "r") {
          const tNodes = child.querySelectorAll("t, m\\:t, w\\:t");
          for (let k = 0; k < tNodes.length; k++) result += tNodes[k].textContent;
        } else if (nodeName === "f") {
          let numStr = "", denStr = "";
          const numNode = child.querySelector("num, m\\:num");
          const denNode = child.querySelector("den, m\\:den");
          if (numNode) numStr = this._parseOmmlNode(numNode);
          if (denNode) denStr = this._parseOmmlNode(denNode);
          result += '\\F(' + numStr + ',' + denStr + ')';
        } else if (nodeName === "rad") {
          let degStr = "", eStr = "";
          const degNode = child.querySelector("deg, m\\:deg");
          const eNode = child.querySelector("e, m\\:e");
          if (degNode) degStr = this._parseOmmlNode(degNode);
          if (eNode) eStr = this._parseOmmlNode(eNode);
          result += '\\R(' + degStr + ',' + eStr + ')';
        } else if (nodeName === "sSup") {
          let baseStr = "", supStr = "";
          const eNode = child.querySelector("e, m\\:e");
          const supNode = child.querySelector("sup, m\\:sup");
          if (eNode) baseStr = this._parseOmmlNode(eNode);
          if (supNode) supStr = this._parseOmmlNode(supNode);
          result += baseStr + '\\S\\up4(' + supStr + ')';
        } else if (nodeName === "sSub") {
          let baseStr = "", subStr = "";
          const eNode = child.querySelector("e, m\\:e");
          const subNode = child.querySelector("sub, m\\:sub");
          if (eNode) baseStr = this._parseOmmlNode(eNode);
          if (subNode) subStr = this._parseOmmlNode(subNode);
          result += baseStr + '\\S\\do4(' + subStr + ')';
        } else {
          result += this._parseOmmlNode(child);
        }
      }
      return result;
    }
  }

  if (typeof window !== 'undefined') {
    window.EquationConverter = EquationConverter;
  }
  if (typeof global !== 'undefined') {
    global.EquationConverter = EquationConverter;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EquationConverter;
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
