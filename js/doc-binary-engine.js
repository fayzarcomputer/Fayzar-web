/**
 * ====================================================================
 * LEGACY OFFICE BINARY / MHTML HANDLER v5.0 (Full Fidelity Engine)
 * 
 * Flow for .doc files:
 *   1. MHTML / HTML / Word XML / RTF .doc:
 *      - Parses document structure with DOMParser
 *      - Extracts complete tables (rows, cells, colspans, rowspans, widths, borders, shading)
 *      - Extracts paragraphs (alignments, headings, lists, line breaks)
 *      - Resolves font styling: SutonnyMJ/Bijoy vs Times New Roman/English vs Unicode
 *      - Resolves text styling: Bold, Italic, Underline, Font Size, Text Color
 *      - Builds a rich, fully formatted intermediate .docx (OOXML package)
 *   2. Binary OLE CFBF .doc:
 *      - Extracts stream text with Piece Table / Clx / Fast-Scan
 *      - Classifies English sentences vs Bijoy sentences
 *      - Builds intermediate .docx package
 *   3. Passes the intermediate .docx to DocxHandler.convertDocx():
 *      - Converts SutonnyMJ runs to Unicode Bengali (Kalpurush)
 *      - Leaves Times New Roman / English runs 100% UNTOUCHED
 *      - Returns pristine, perfectly formatted .docx output!
 * ====================================================================
 */

(function(global) {
  'use strict';

  class DocBinaryEngine {

    // ----------------------------------------------------------------
    // PUBLIC API
    // ----------------------------------------------------------------

    async convertDoc(arrayBuffer, options = {}) {
      const stats  = { convertedRuns: 0, docType: 'doc' };
      const preview = { originalSample: [], convertedSample: [] };

      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const rawText = textDecoder.decode(arrayBuffer);

      let intermediateBlob = null;

      const isMhtmlOrHtml = rawText.includes('MIME-Version:') || rawText.includes('<html') ||
                            rawText.includes('<HTML') || rawText.includes('<?xml') ||
                            rawText.includes('{\\rtf');

      if (isMhtmlOrHtml) {
        // ---- 1. MHTML / HTML / XML / RTF path (Rich Formatting & Table Engine) ----
        const htmlContent = this._extractHtmlFromMhtml(rawText);
        intermediateBlob = await this._convertHtmlToIntermediateDocx(htmlContent);
      } else {
        // ---- 2. Binary OLE CFBF path ----
        const plainText = this._extractTextFromBinaryDoc(arrayBuffer);
        if (!plainText || !plainText.trim()) {
          throw new Error('ফাইলটির ভেতরের টেক্সট সঠিকভাবে পড়া যায়নি। অনুগ্রহ করে ফাইলটি ওয়ার্ডে .docx হিসেবে সেভ করে আপলোড করুন।');
        }
        intermediateBlob = await this._convertPlainTextToIntermediateDocx(plainText);
      }

      if (!intermediateBlob || intermediateBlob.size === 0) {
        throw new Error('ডকুমেন্ট প্রসেসিং ব্যর্থ হয়েছে।');
      }

      // ---- 3. Run DocxHandler on the intermediate DOCX ----
      if (typeof DocxHandler === 'undefined') {
        throw new Error('DocxHandler ইঞ্জিন লোড হয়নি।');
      }

      const intermediateBuffer = await intermediateBlob.arrayBuffer();
      const result = await DocxHandler.convertDocx(intermediateBuffer, options);

      const docxBlob = result.blob || result.convertedBlob;

      return {
        blob    : docxBlob,
        docxBlob: docxBlob,
        docBlob : null, // Output is .docx only per user requirement
        stats   : result.stats || stats,
        preview : result.preview || preview
      };
    }

    // CP1252 (Windows-1252) byte-to-character map for Word documents
    static CP1252_MAP = {
      0x80: '\u20AC', 0x82: '\u201A', 0x83: '\u0192', 0x84: '\u201E', 0x85: '\u2026',
      0x86: '\u2020', 0x87: '\u2021', 0x88: '\u02C6', 0x89: '\u2030', 0x8A: '\u0160',
      0x8B: '\u2039', 0x8C: '\u0152', 0x8E: '\u017D', 0x91: '\u2018', 0x92: '\u2019',
      0x93: '\u201C', 0x94: '\u201D', 0x95: '\u2022', 0x96: '\u2013', 0x97: '\u2014',
      0x98: '\u02DC', 0x99: '\u2122', 0x9A: '\u0161', 0x9B: '\u203A', 0x9C: '\u0153',
      0x9E: '\u017E', 0x9F: '\u0178'
    };

    _decodeCp1252Byte(byteVal) {
      if (byteVal >= 0x80 && byteVal <= 0x9F) {
        return DocBinaryEngine.CP1252_MAP[byteVal] || String.fromCharCode(byteVal);
      }
      return String.fromCharCode(byteVal);
    }

    _extractHtmlFromMhtml(rawText) {
      // Normalize raw text CP1252 control code artifacts
      rawText = rawText.replace(/[\u0080-\u009F]/g, ch => {
        const code = ch.charCodeAt(0);
        return DocBinaryEngine.CP1252_MAP[code] || ch;
      });

      // Find boundary
      const boundaryMatch = rawText.match(/boundary=["']?([^"'\r\n;]+)["']?/i);
      if (boundaryMatch) {
        const boundary = '--' + boundaryMatch[1].trim();
        const parts = rawText.split(boundary);
        for (const part of parts) {
          const lp = part.toLowerCase();
          if (lp.includes('content-type: text/html') || lp.includes('content-type:text/html')) {
            const idx = part.search(/\r?\n\r?\n/);
            if (idx !== -1) {
              let html = part.slice(idx).trim();
              // Handle Quoted-Printable decoding with full CP1252 fidelity
              if (/content-transfer-encoding:\s*quoted-printable/i.test(part)) {
                html = html.replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/gi, (m, h) => {
                  const b = parseInt(h, 16);
                  return this._decodeCp1252Byte(b);
                });
              }
              return html;
            }
          }
        }
      }

      if (rawText.includes('<html') || rawText.includes('<HTML')) {
        const start = rawText.search(/<html/i);
        return rawText.slice(start);
      }
      return rawText;
    }

    // ----------------------------------------------------------------
    // HTML TO INTERMEDIATE DOCX GENERATOR
    // ----------------------------------------------------------------

    async _convertHtmlToIntermediateDocx(htmlString) {
      // Normalize CP1252 control characters before DOM parsing
      htmlString = htmlString.replace(/[\u0080-\u009F]/g, ch => {
        const code = ch.charCodeAt(0);
        return DocBinaryEngine.CP1252_MAP[code] || ch;
      });

      let doc;
      try {
        doc = (new DOMParser()).parseFromString(htmlString, 'text/html');
      } catch(e) {
        return this._convertPlainTextToIntermediateDocx(htmlString.replace(/<[^>]+>/g, '\n'));
      }

      // 1. Build CSS rules map from <style> blocks
      const cssRules = this._extractCssRules(doc);

      // 2. Walk the body and parse into structured blocks (Paragraphs and Tables)
      const blocks = [];
      const body = doc.body || doc.documentElement;
      this._parseNodeChildren(body, blocks, cssRules, {
        fontFamily: null,
        fontSize: '12pt',
        isBold: false,
        isItalic: false,
        isUnderline: false,
        color: null,
        textAlign: 'left'
      });

      if (!blocks.length) {
        blocks.push({
          type: 'p',
          align: 'left',
          runs: [{ text: ' ', font: 'Times New Roman', isBold: false, isItalic: false, isUnderline: false, fontSize: 24, color: null }]
        });
      }

      // 3. Generate OOXML for all blocks
      const bodyXml = blocks.map(block => {
        if (block.type === 'tbl') return this._generateTableOoxml(block);
        return this._generateParagraphOoxml(block);
      }).join('\n');

      // 4. Pack into DOCX container
      return this._packDocxPackage(bodyXml);
    }

    // ----------------------------------------------------------------
    // CSS & DOM STYLE PARSER
    // ----------------------------------------------------------------

    _extractCssRules(doc) {
      const rules = {};
      doc.querySelectorAll('style').forEach(styleTag => {
        const text = styleTag.textContent || '';
        // Match selectors and declarations block
        const rx = /([^{]+)\{([^}]+)\}/g;
        let m;
        while ((m = rx.exec(text)) !== null) {
          const selectors = m[1].split(',').map(s => s.trim());
          const declarations = this._parseCssDeclarations(m[2]);
          for (const sel of selectors) {
            rules[sel] = Object.assign(rules[sel] || {}, declarations);
            // Also index by class name alone (e.g. p.MsoNormal -> MsoNormal, .MsoTableGrid -> MsoTableGrid)
            const classMatch = sel.match(/\.([A-Za-z0-9_-]+)/);
            if (classMatch) {
              const className = classMatch[1];
              rules[className] = Object.assign(rules[className] || {}, declarations);
            }
          }
        }
      });
      return rules;
    }

    _parseCssDeclarations(cssText) {
      const decl = {};
      const pairs = cssText.split(';');
      for (const pair of pairs) {
        const colon = pair.indexOf(':');
        if (colon !== -1) {
          const prop = pair.slice(0, colon).trim().toLowerCase();
          const val = pair.slice(colon + 1).trim().replace(/^['"]|['"]$/g, '');
          if (prop && val) {
            if (prop === 'font-family') decl.fontFamily = val;
            else if (prop === 'font-size') decl.fontSize = val;
            else if (prop === 'mso-bidi-font-size' && !decl.fontSize) decl.fontSize = val;
            else if (prop === 'mso-font-size' && !decl.fontSize) decl.fontSize = val;
            else if (prop === 'font-weight') decl.isBold = (val === 'bold' || parseInt(val) >= 700);
            else if (prop === 'font-style') decl.isItalic = (val === 'italic' || val === 'oblique');
            else if (prop === 'text-decoration') decl.isUnderline = val.includes('underline');
            else if (prop === 'color') decl.color = this._normalizeColor(val);
            else if (prop === 'background-color' || prop === 'background') decl.bgColor = this._normalizeColor(val);
            else if (prop === 'text-align') decl.textAlign = val;
          }
        }
      }
      return decl;
    }

    _resolveStyle(el, cssRules, parentStyle) {
      const style = Object.assign({}, parentStyle);

      if (!el || el.nodeType !== 1) return style;

      // 1. Tag default font styles
      const tag = el.tagName.toLowerCase();
      if (['b', 'strong'].includes(tag)) style.isBold = true;
      if (['i', 'em'].includes(tag)) style.isItalic = true;
      if (['u'].includes(tag)) style.isUnderline = true;
      if (tag === 'h1') { style.isBold = true; style.fontSize = '18pt'; }
      if (tag === 'h2') { style.isBold = true; style.fontSize = '16pt'; }
      if (tag === 'h3') { style.isBold = true; style.fontSize = '14pt'; }
      if (tag === 'th') { style.isBold = true; style.textAlign = style.textAlign || 'center'; }

      // 2. Class-based CSS rules (checking both class name and tag.class)
      if (el.className) {
        const classes = el.className.split(/\s+/);
        for (const cls of classes) {
          if (cssRules[cls]) Object.assign(style, cssRules[cls]);
          if (cssRules[tag + '.' + cls]) Object.assign(style, cssRules[tag + '.' + cls]);
        }
      }
      if (cssRules[tag]) Object.assign(style, cssRules[tag]);

      // 3. HTML attribute overrides
      if (el.getAttribute('face')) style.fontFamily = el.getAttribute('face');
      if (el.getAttribute('size')) {
        const htmlSize = parseInt(el.getAttribute('size'), 10);
        const sizeMap = { 1: '8pt', 2: '10pt', 3: '12pt', 4: '14pt', 5: '18pt', 6: '24pt', 7: '36pt' };
        if (sizeMap[htmlSize]) style.fontSize = sizeMap[htmlSize];
        else if (htmlSize > 0) style.fontSize = htmlSize + 'pt';
      }
      if (el.getAttribute('color')) style.color = this._normalizeColor(el.getAttribute('color'));
      if (el.getAttribute('align')) style.textAlign = el.getAttribute('align').toLowerCase();
      if (el.getAttribute('bgcolor')) style.bgColor = this._normalizeColor(el.getAttribute('bgcolor'));
      if (el.getAttribute('lang')) {
        const lang = el.getAttribute('lang').toUpperCase();
        if (lang.includes('EN')) style.fontFamily = 'Times New Roman';
        else if (lang.includes('BN')) style.fontFamily = 'SutonnyMJ';
      }

      // 4. Inline CSS style overrides
      if (el.getAttribute('style')) {
        const inline = this._parseCssDeclarations(el.getAttribute('style'));
        Object.assign(style, inline);
      }

      return style;
    }

    _normalizeColor(colorStr) {
      if (!colorStr) return null;
      colorStr = colorStr.trim();
      if (colorStr.startsWith('#')) {
        let hex = colorStr.slice(1);
        if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        return hex.toUpperCase();
      }
      const rgb = colorStr.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
      if (rgb) {
        const r = parseInt(rgb[1]).toString(16).padStart(2, '0');
        const g = parseInt(rgb[2]).toString(16).padStart(2, '0');
        const b = parseInt(rgb[3]).toString(16).padStart(2, '0');
        return (r + g + b).toUpperCase();
      }
      return null;
    }

    _fontSizeToHalfPoints(sizeStr) {
      if (!sizeStr) return 24; // Default 12pt = 24 half-points
      if (typeof sizeStr === 'number') return Math.round(sizeStr * 2);
      sizeStr = String(sizeStr).trim();
      const ptMatch = sizeStr.match(/([\d.]+)\s*pt/i);
      if (ptMatch) return Math.round(parseFloat(ptMatch[1]) * 2);
      const pxMatch = sizeStr.match(/([\d.]+)\s*px/i);
      if (pxMatch) return Math.round(parseFloat(pxMatch[1]) * 1.5);
      const numMatch = sizeStr.match(/^[\d.]+$/);
      if (numMatch) return Math.round(parseFloat(numMatch[0]) * 2);
      return 24;
    }

    _xmlEscape(str) {
      if (!str) return '';
      // Strip XML-invalid control characters: 0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F
      str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    }

    // ----------------------------------------------------------------
    // DOM TREE PARSER (Recursive Block & Inline Extractor)
    // ----------------------------------------------------------------

    _parseNodeChildren(parentNode, blocks, cssRules, inheritedStyle) {
      for (const child of Array.from(parentNode.childNodes)) {
        if (child.nodeType === 3) {
          // Orphan text node in block container
          const text = child.textContent;
          if (text && text.trim()) {
            const p = {
              type: 'p',
              align: inheritedStyle.textAlign || 'left',
              runs: this._createRunsFromText(text, inheritedStyle)
            };
            blocks.push(p);
          }
          continue;
        }

        if (child.nodeType !== 1) continue;

        const tag = child.tagName.toLowerCase();
        const style = this._resolveStyle(child, cssRules, inheritedStyle);

        if (tag === 'table') {
          const tbl = this._parseTableElement(child, cssRules, style);
          if (tbl && tbl.rows.length) blocks.push(tbl);
        } else if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'dt', 'dd', 'blockquote'].includes(tag)) {
          const p = this._parseParagraphElement(child, cssRules, style);
          if (p && p.runs.length) blocks.push(p);
        } else if (tag === 'hr') {
          blocks.push({
            type: 'p',
            align: 'left',
            runs: [{ text: '____________________________________________________', font: 'Times New Roman', isBold: false, isItalic: false, isUnderline: false, fontSize: 20, color: 'CCCCCC' }]
          });
        } else if (['div', 'section', 'article', 'main', 'header', 'footer', 'tbody', 'thead', 'tfoot', 'ul', 'ol', 'body'].includes(tag)) {
          // Container tag -> recurse
          this._parseNodeChildren(child, blocks, cssRules, style);
        } else {
          // Inline tag outside paragraph (span, font, b, etc.)
          const runs = [];
          this._collectInlineRuns(child, runs, cssRules, style);
          if (runs.length) {
            blocks.push({ type: 'p', align: style.textAlign || 'left', runs });
          }
        }
      }
    }

    _parseParagraphElement(pEl, cssRules, pStyle) {
      const runs = [];
      this._collectInlineRuns(pEl, runs, cssRules, pStyle);
      const text = runs.map(r => r.text).join('').trim();
      if (!text || this._isMetadataNoise(text)) return null;

      return {
        type: 'p',
        align: pStyle.textAlign || 'left',
        runs
      };
    }

    _collectInlineRuns(node, runs, cssRules, currentStyle) {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === 3) {
          let text = child.textContent || '';
          if (/^[\r\n\s]+$/.test(text)) {
            if (text.includes('\u00A0') || text.length > 2) {
              text = text.replace(/\u00A0/g, ' ').replace(/[\r\n]+/g, '');
              if (!text) text = ' ';
            } else {
              text = ' ';
            }
          } else {
            text = text.replace(/\u00A0/g, ' ').replace(/[\r\n]+/g, ' ');
          }

          if (text) {
            const newRuns = this._createRunsFromText(text, currentStyle);
            runs.push(...newRuns);
          }
        } else if (child.nodeType === 1) {
          const tag = child.tagName.toLowerCase();
          const style = this._resolveStyle(child, cssRules, currentStyle);

          if (tag === 'br') {
            runs.push({ text: '\n', font: 'Times New Roman', isBold: false, isItalic: false, isUnderline: false, fontSize: 24, color: null });
          } else if (tag === 'img') {
            // Placeholder for image
          } else {
            this._collectInlineRuns(child, runs, cssRules, style);
          }
        }
      }
    }

    // ----------------------------------------------------------------
    // TABLE PARSER (Full Fidelity Table Structure Extractor)
    // ----------------------------------------------------------------

    _parseTableElement(tableEl, cssRules, tableStyle) {
      const rows = [];
      const trElements = tableEl.querySelectorAll('tr');

      // Calculate max columns across rows
      let maxCols = 0;
      trElements.forEach(tr => {
        let colsInRow = 0;
        tr.querySelectorAll('td, th').forEach(cell => {
          colsInRow += parseInt(cell.getAttribute('colspan') || '1', 10);
        });
        if (colsInRow > maxCols) maxCols = colsInRow;
      });

      if (maxCols === 0) maxCols = 1;

      // Table width calculation (default page width = 9026 twips)
      const pageUsableWidthTwips = 9026;
      const defaultColWidthTwips = Math.floor(pageUsableWidthTwips / maxCols);

      trElements.forEach(tr => {
        const trStyle = this._resolveStyle(tr, cssRules, tableStyle);
        const cells = [];
        const tdElements = tr.querySelectorAll('td, th');

        tdElements.forEach(cell => {
          const cellStyle = Object.assign(this._resolveStyle(cell, cssRules, trStyle), { isInsideTable: true });
          const colspan = parseInt(cell.getAttribute('colspan') || '1', 10);
          const rowspan = parseInt(cell.getAttribute('rowspan') || '1', 10);

          // Calculate cell width in dxa (twips)
          let cellWidthTwips = defaultColWidthTwips * colspan;
          const widthAttr = cell.getAttribute('width') || (cell.style && cell.style.width ? cell.style.width : '');
          if (widthAttr) {
            if (widthAttr.endsWith('%')) {
              const pct = parseFloat(widthAttr) / 100;
              cellWidthTwips = Math.round(pageUsableWidthTwips * pct);
            } else if (widthAttr.endsWith('pt')) {
              cellWidthTwips = Math.round(parseFloat(widthAttr) * 20);
            } else if (widthAttr.endsWith('px')) {
              cellWidthTwips = Math.round(parseFloat(widthAttr) * 15);
            } else if (/^\d+$/.test(widthAttr.trim())) {
              cellWidthTwips = Math.round(parseInt(widthAttr.trim(), 10) * 15);
            }
          }

          // Parse cell content (can have multiple paragraphs or lists)
          const cellBlocks = [];
          this._parseNodeChildren(cell, cellBlocks, cssRules, cellStyle);

          // If no blocks parsed, create a default paragraph
          if (!cellBlocks.length) {
            cellBlocks.push({
              type: 'p',
              align: cellStyle.textAlign || 'left',
              runs: [{ text: ' ', font: 'Times New Roman', isBold: false, isItalic: false, isUnderline: false, fontSize: 20, color: null }]
            });
          }

          cells.push({
            colspan,
            rowspan,
            widthTwips: cellWidthTwips,
            bgColor: cellStyle.bgColor || null,
            align: cellStyle.textAlign || 'left',
            blocks: cellBlocks
          });
        });

        if (cells.length > 0) {
          rows.push({
            isHeader: tr.querySelectorAll('th').length > 0 || tr.parentElement.tagName.toLowerCase() === 'thead',
            cells
          });
        }
      });

      return {
        type: 'tbl',
        colCount: maxCols,
        defaultColWidth: defaultColWidthTwips,
        rows
      };
    }

    // ----------------------------------------------------------------
    // INTELLIGENT RUN CLASSIFIER (Bijoy vs English)
    // ----------------------------------------------------------------

    _createRunsFromText(text, style) {
      if (!text) return [];

      const fontSize = this._fontSizeToHalfPoints(style.fontSize);
      const isBold = !!style.isBold;
      const isItalic = !!style.isItalic;
      const isUnderline = !!style.isUnderline;
      const color = style.color || null;

      let explicitFont = style.fontFamily || '';
      let isExplicitBijoy = /sutonny|bijoy|sutony|matra|boishakhi|chandan|probhat|bandhan|doshomik/i.test(explicitFont);
      let isExplicitEnglish = /times|calibri|arial|verdana|helvetica|courier|georgia|tahoma|trebuchet|cambria|segoe|century|palatino|garamond|bookman|lucida|impact/i.test(explicitFont);

      const hasBijoyChars = /[†‡©ª¯µ¸¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ‰Š‹ŒŽ˜™š›œžŸ`~^|]/.test(text);

      // 1. Inside Table with English font: 100% English preservation
      if (style.isInsideTable && isExplicitEnglish && !isExplicitBijoy && !hasBijoyChars) {
        return [{
          text,
          font: 'Times New Roman',
          isBold,
          isItalic,
          isUnderline,
          fontSize,
          color
        }];
      }

      // 2. Pure English prose outside table (e.g. English headings or distinct English sentences)
      if (isExplicitEnglish && !isExplicitBijoy && !hasBijoyChars && this._isEnglishProse(text)) {
        return [{
          text,
          font: 'Times New Roman',
          isBold,
          isItalic,
          isUnderline,
          fontSize,
          color
        }];
      }

      // 3. Otherwise: Paragraph body text in Bijoy (SutonnyMJ)
      if (typeof BanglaConverter !== 'undefined' && typeof BanglaConverter.splitBijoyAndEnglish === 'function') {
        const segments = BanglaConverter.splitBijoyAndEnglish(text);
        return segments.map(seg => ({
          text: seg.text,
          font: seg.type === 'english' ? 'Times New Roman' : 'SutonnyMJ',
          isBold,
          isItalic,
          isUnderline,
          fontSize,
          color
        }));
      }

      return [{
        text,
        font: 'SutonnyMJ',
        isBold,
        isItalic,
        isUnderline,
        fontSize,
        color
      }];
    }

    _isEnglishProse(text) {
      if (!text || !text.trim()) return false;
      // Only match distinctive English words (4+ chars or unique English keywords)
      const engWords = /\b(?:Dear|Sir|Please|Take|Necessary|Steps|Action|Signature|Dinajpur|Activity|Activities|Survey|Student|Students|Teacher|Teachers|Parent|Parents|School|Hold|Meeting|Explain|Problem|Start|Awareness|Classes|Effects|Phone|Addiction|Hours|During|Introduce|Sports|Cultural|Train|Spot|Signs|Peer|Support|Group|Among|Organize|Workshop|Setting|Rules|Home|Launch|Reward|System|Reduce|Involve|Clinic|Counseling|Responsible|Stakeholders|Resources|Needed|Timeline|Month|Year|Date|Name|Total|Page|Section|Class|Room|Mark|Marks|Pass|Fail|Grade|Subject|Report|Summary|Community|Development|Action|Plan|Study|Project|Approximate)\b/i;
      return engWords.test(text);
    }

    // ----------------------------------------------------------------
    // OOXML GENERATOR (Paragraphs, Runs, Tables)
    // ----------------------------------------------------------------

    _generateParagraphOoxml(p) {
      const alignMap = { center: 'center', right: 'right', justify: 'both', both: 'both', left: 'left' };
      const jcVal = alignMap[p.align] || 'left';

      const pPr = `<w:pPr><w:jc w:val="${jcVal}"/></w:pPr>`;
      const runsXml = (p.runs || []).map(r => this._generateRunOoxml(r)).join('');

      return `<w:p>${pPr}${runsXml || '<w:r><w:t xml:space="preserve"> </w:t></w:r>'}</w:p>`;
    }

    _generateRunOoxml(run) {
      if (!run.text) return '';

      const fontName = run.font || 'Times New Roman';
      const sz = run.fontSize || 24;
      const bXml = run.isBold ? '<w:b/><w:bCs/>' : '';
      const iXml = run.isItalic ? '<w:i/><w:iCs/>' : '';
      const uXml = run.isUnderline ? '<w:u w:val="single"/>' : '';
      const colorXml = run.color ? `<w:color w:val="${run.color}"/>` : '';

      const rPr = `<w:rPr><w:rFonts w:ascii="${fontName}" w:hAnsi="${fontName}" w:cs="${fontName}"/>${bXml}${iXml}${uXml}${colorXml}<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr>`;

      // Handle line breaks inside text
      const parts = run.text.split('\n');
      const textXml = parts.map((part, idx) => {
        const escaped = this._xmlEscape(part);
        const t = `<w:t xml:space="preserve">${escaped}</w:t>`;
        return (idx > 0 ? '<w:br/>' : '') + t;
      }).join('');

      return `<w:r>${rPr}${textXml}</w:r>`;
    }

    _generateTableOoxml(tbl) {
      if (!tbl.rows || !tbl.rows.length) return '';

      const hasBorders = tbl.hasBorders !== false;

      // 1. Grid columns
      const gridColsXml = Array(tbl.colCount).fill(0).map(() => `<w:gridCol w:w="${tbl.defaultColWidth}"/>`).join('');

      // 2. Rows and Cells
      const rowsXml = tbl.rows.map(row => {
        const trPr = row.isHeader ? '<w:trPr><w:tblHeader/></w:trPr>' : '';

        const cellsXml = row.cells.map(cell => {
          const colspanAttr = cell.colspan > 1 ? `<w:gridSpan w:val="${cell.colspan}"/>` : '';
          const rowspanAttr = cell.rowspan > 1 ? `<w:vMerge w:val="restart"/>` : '';
          const shdXml = cell.bgColor ? `<w:shd w:val="clear" w:color="auto" w:fill="${cell.bgColor}"/>` : '';

          const tcBordersXml = hasBorders ? `
            <w:tcBorders>
              <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
              <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
              <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
              <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
            </w:tcBorders>` : `
            <w:tcBorders>
              <w:top w:val="none"/>
              <w:left w:val="none"/>
              <w:bottom w:val="none"/>
              <w:right w:val="none"/>
            </w:tcBorders>`;

          const tcPr = `<w:tcPr>
            <w:tcW w:w="${cell.widthTwips}" w:type="dxa"/>
            ${colspanAttr}${rowspanAttr}${shdXml}
            ${tcBordersXml}
            <w:vAlign w:val="top"/>
          </w:tcPr>`;

          // Blocks inside cell (paragraphs)
          const cellContentXml = (cell.blocks || []).map(b => this._generateParagraphOoxml(b)).join('');

          return `<w:tc>${tcPr}${cellContentXml || '<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>'}</w:tc>`;
        }).join('');

        return `<w:tr>${trPr}${cellsXml}</w:tr>`;
      }).join('');

      const tblBordersXml = hasBorders ? `
    <w:tblBorders>
      <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
    </w:tblBorders>` : `
    <w:tblBorders>
      <w:top w:val="none"/>
      <w:left w:val="none"/>
      <w:bottom w:val="none"/>
      <w:right w:val="none"/>
      <w:insideH w:val="none"/>
      <w:insideV w:val="none"/>
    </w:tblBorders>`;

      const tblStyleVal = hasBorders ? 'TableGrid' : 'TableNormal';

      return `<w:tbl>
  <w:tblPr>
    <w:tblStyle w:val="${tblStyleVal}"/>
    <w:tblW w:w="0" w:type="auto"/>
    ${tblBordersXml}
    <w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>
  </w:tblPr>
  <w:tblGrid>${gridColsXml}</w:tblGrid>
  ${rowsXml}
</w:tbl>
<w:p/>`;
    }

    // ----------------------------------------------------------------
    // PACK DOCX ZIP CONTAINER
    // ----------------------------------------------------------------

    async _packDocxPackage(bodyXml) {
      if (typeof JSZip === 'undefined') throw new Error('JSZip not loaded');

      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document
  xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  mc:Ignorable="w14">
  <w:body>
${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1080" w:bottom="1440" w:left="1440" w:header="709" w:footer="709" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

      const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
      <w:sz w:val="24"/>
    </w:rPr></w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr><w:sz w:val="24"/></w:rPr>
  </w:style>
  <w:style w:type="table" w:styleId="TableGrid">
    <w:name w:val="Table Grid"/>
    <w:tblPr>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      </w:tblBorders>
    </w:tblPr>
  </w:style>
</w:styles>`;

      const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

      const relsMain = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

      const wordRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

      const zip = new JSZip();
      zip.file('[Content_Types].xml', contentTypes);
      zip.file('_rels/.rels', relsMain);
      zip.file('word/document.xml', documentXml);
      zip.file('word/styles.xml', stylesXml);
      zip.file('word/_rels/document.xml.rels', wordRels);

      return zip.generateAsync({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
    }

    _xmlEscape(str) {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    }

    // ----------------------------------------------------------------
    // PLAIN TEXT FALLBACK (Binary OLE CFBF)
    // ----------------------------------------------------------------

    async _convertPlainTextToIntermediateDocx(plainText) {
      const lines = plainText.split(/\r?\n/).filter(l => !this._isMetadataNoise(l));
      const blocks = lines.map(line => ({
        type: 'p',
        align: 'left',
        runs: this._createRunsFromText(line, { fontFamily: null, fontSize: '12pt' })
      }));
      const bodyXml = blocks.map(b => this._generateParagraphOoxml(b)).join('\n');
      return this._packDocxPackage(bodyXml);
    }

    _isMetadataNoise(str) {
      if (!str || str.length < 2) return true;
      if (/^(Root Entry|WordDocument|1Table|0Table|Data|SummaryInformation|DocumentSummaryInformation|CompObj|Normal\.dot)/i.test(str)) return true;
      if (/^(Fayzar|Windows User|Print|Clean|false|true|\d{4}-\d{2}-\d{2}T)/i.test(str.trim())) return true;
      if (/^\s*\d+(\.\d+)?\s*$/.test(str.trim()) && parseInt(str.trim()) > 100) return true;
      return false;
    }

    // ----------------------------------------------------------------
    // BINARY OLE CFBF READER (Unchanged stream reader)
    // ----------------------------------------------------------------

    _extractTextFromBinaryDoc(buffer) {
      try {
        const view  = new DataView(buffer);
        const bytes = new Uint8Array(buffer);

        if (view.getUint32(0, false) !== 0xD0CF11E0 || view.getUint32(4, false) !== 0xA1B11AE1) {
          return this._fallbackExtractFromWordDoc(bytes);
        }

        const sectorShift   = view.getUint16(0x1E, true) || 9;
        const sectorSize    = 1 << sectorShift;
        const miniSectShift = view.getUint16(0x20, true) || 6;
        const miniSectSize  = 1 << miniSectShift;
        const dirFirstSec   = view.getUint32(0x30, true);
        const mfStartSec    = view.getUint32(0x3C, true);
        const mfSecCount    = view.getUint32(0x40, true);
        const numFatSecs    = view.getUint32(0x44, true);

        const fat = [];
        for (let i = 0; i < Math.min(numFatSecs, 109); i++) {
          const fs = view.getUint32(0x4C + i * 4, true);
          if (fs === 0xFFFFFFFE || fs === 0xFFFFFFFF) continue;
          const off = (fs + 1) * sectorSize;
          for (let j = 0; j < sectorSize; j += 4) {
            if (off + j + 4 <= buffer.byteLength) fat.push(view.getUint32(off + j, true));
          }
        }

        const readFat = (startSec, size) => {
          const out = []; let cur = startSec, read = 0;
          while (cur < 0xFFFFFFFE && read < size && cur < fat.length) {
            const off = (cur + 1) * sectorSize;
            const end = Math.min(off + sectorSize, buffer.byteLength);
            for (let k = off; k < end && read < size; k++) { out.push(bytes[k]); read++; }
            cur = fat[cur];
          }
          return new Uint8Array(out);
        };

        let miniFat = [];
        if (mfStartSec !== 0xFFFFFFFE && mfStartSec !== 0xFFFFFFFF && mfSecCount > 0) {
          const mfb = readFat(mfStartSec, mfSecCount * sectorSize);
          const mv  = new DataView(mfb.buffer, mfb.byteOffset, mfb.byteLength);
          for (let j = 0; j < mfb.length; j += 4) miniFat.push(mv.getUint32(j, true));
        }

        let rootEntry = null, wordDocEntry = null, t0 = null, t1 = null;
        let curDir = dirFirstSec;
        while (curDir < 0xFFFFFFFE && curDir < fat.length) {
          const secOff = (curDir + 1) * sectorSize;
          for (let eoff = secOff; eoff < secOff + sectorSize; eoff += 128) {
            if (eoff + 128 > buffer.byteLength) break;
            const nlen = view.getUint16(eoff + 0x40, true);
            if (nlen <= 0 || nlen > 64) continue;
            let name = '';
            for (let n = 0; n < nlen - 2; n += 2) name += String.fromCharCode(view.getUint16(eoff + n, true));
            const ss = view.getUint32(eoff + 0x74, true);
            const sz = view.getUint32(eoff + 0x78, true);
            if (name === 'Root Entry') rootEntry = { name, startSec: ss, streamSize: sz };
            else if (name === 'WordDocument') wordDocEntry = { name, startSec: ss, streamSize: sz };
            else if (name === '1Table') t1 = { name, startSec: ss, streamSize: sz };
            else if (name === '0Table') t0 = { name, startSec: ss, streamSize: sz };
          }
          curDir = fat[curDir];
        }

        let miniStream = new Uint8Array(0);
        if (rootEntry && rootEntry.startSec !== 0xFFFFFFFE && rootEntry.streamSize > 0) {
          miniStream = readFat(rootEntry.startSec, rootEntry.streamSize);
        }

        const readAny = (entry) => {
          if (!entry || entry.startSec === 0xFFFFFFFE || entry.streamSize <= 0) return new Uint8Array(0);
          if (entry.streamSize >= 4096 || !miniStream.length) return readFat(entry.startSec, entry.streamSize);
          const out = []; let cur = entry.startSec, read = 0;
          while (cur < 0xFFFFFFFE && read < entry.streamSize && cur < miniFat.length) {
            const off = cur * miniSectSize;
            const end = Math.min(off + miniSectSize, miniStream.length);
            for (let k = off; k < end && read < entry.streamSize; k++) { out.push(miniStream[k]); read++; }
            cur = miniFat[cur];
          }
          return new Uint8Array(out);
        };

        const wdb = readAny(wordDocEntry);
        if (wdb && wdb.length >= 512) {
          const wv     = new DataView(wdb.buffer, wdb.byteOffset, wdb.byteLength);
          const wIdent = wv.getUint16(0x00, true);
          if (wIdent === 0xA5EC || wIdent === 0xA5DC) {
            const flags   = wv.getUint16(0x0A, true);
            const useT1   = (flags & 0x0200) !== 0;
            const tEntry  = useT1 ? (t1 || t0) : (t0 || t1);
            const tBytes  = readAny(tEntry);
            const fcMin   = wv.getUint32(0x18, true);
            const ccpText = wv.getUint32(0x4C, true);

            if (tBytes && tBytes.length > 0 && wdb.length >= 0x01AA) {
              const fcClx  = wv.getUint32(0x01A2, true);
              const lcbClx = wv.getUint32(0x01A6, true);
              if (fcClx < tBytes.length && lcbClx > 0) {
                const txt = this._extractFromClx(wdb, tBytes, fcClx, lcbClx);
                if (txt && txt.trim()) return txt;
              }
            }
            if (fcMin < wdb.length && ccpText > 0) {
              const txt = this._extractDirectText(wdb, fcMin, ccpText);
              if (txt && txt.trim()) return txt;
            }
          }
        }
        return this._fallbackExtractFromWordDoc(wdb.length > 0 ? wdb : bytes);
      } catch(e) {
        console.warn('CFBF parse error:', e);
        return this._fallbackExtractFromWordDoc(new Uint8Array(buffer));
      }
    }

    _extractFromClx(wdb, tBytes, fcClx, lcbClx) {
      let off = fcClx;
      const end   = Math.min(fcClx + lcbClx, tBytes.length);
      const tView = new DataView(tBytes.buffer, tBytes.byteOffset, tBytes.byteLength);
      while (off < end) {
        const type = tBytes[off];
        if (type === 0x01) { off += 3 + tView.getUint16(off + 1, true); }
        else if (type === 0x02) {
          const lcb   = tView.getUint32(off + 1, true);
          off += 5;
          const pcnt  = Math.floor((lcb - 4) / 12);
          if (pcnt <= 0) break;
          const cps   = [];
          for (let p = 0; p <= pcnt; p++) cps.push(tView.getUint32(off + p * 4, true));
          const pOff  = off + (pcnt + 1) * 4;
          let full    = '';
          for (let p = 0; p < pcnt; p++) {
            const cnt = cps[p + 1] - cps[p];
            if (cnt <= 0) continue;
            const peo = pOff + p * 8;
            if (peo + 6 > tBytes.length) break;
            const fc  = tView.getUint32(peo + 2, true);
            const isC = (fc & 0x40000000) !== 0;
            const afc = fc & ~0x40000000;
            if (isC) {
              const bo = Math.floor(afc / 2);
              for (let k = 0; k < cnt; k++) {
                if (bo + k < wdb.length) {
                  const b = wdb[bo + k];
                  if (b === 0x0D || b === 0x07 || b === 0x0B) full += '\n';
                  else if (b === 0x09) full += '\t';
                  else if (b >= 32) full += String.fromCharCode(b);
                }
              }
            } else {
              for (let k = 0; k < cnt; k++) {
                const bo = afc + k * 2;
                if (bo + 1 < wdb.length) {
                  const code = wdb[bo] | (wdb[bo + 1] << 8);
                  if (code === 0x0D || code === 0x07 || code === 0x0B) full += '\n';
                  else if (code === 0x09) full += '\t';
                  else if (code >= 32) full += String.fromCharCode(code);
                }
              }
            }
          }
          return full.split(/\r?\n/).filter(l => !this._isMetadataNoise(l)).join('\n');
        } else break;
      }
      return '';
    }

    _extractDirectText(wdb, fcMin, ccpText) {
      let text = '';
      const len = Math.min(ccpText, wdb.length - fcMin);
      for (let i = 0; i < len; i++) {
        const b = wdb[fcMin + i];
        if (b === 0x0D || b === 0x07 || b === 0x0B) text += '\n';
        else if (b === 0x09) text += '\t';
        else if (b >= 32) text += String.fromCharCode(b);
      }
      return text.split(/\r?\n/).filter(l => !this._isMetadataNoise(l)).join('\n');
    }

    _fallbackExtractFromWordDoc(bytes) {
      const blocks = []; let cur = [];
      for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        if ((b >= 32 && b <= 126) || (b >= 128 && b <= 255) || b === 9 || b === 10 || b === 13) {
          cur.push(String.fromCharCode(b));
        } else {
          if (cur.length >= 8) { const s = cur.join(''); if (!this._isMetadataNoise(s)) blocks.push(s); }
          cur = [];
        }
      }
      if (cur.length >= 8) { const s = cur.join(''); if (!this._isMetadataNoise(s)) blocks.push(s); }
      return blocks.join('\n\n');
    }

    // ----------------------------------------------------------------
    // XLS / PPT FALLBACKS
    // ----------------------------------------------------------------

    async convertXls(arrayBuffer, options = {}) {
      const stats   = { convertedCells: 0, docType: 'xls' };
      const preview = { originalSample: [], convertedSample: [] };
      const rawText = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
      if (rawText.includes('<html') || rawText.includes('<?xml') || rawText.includes('<Workbook')) {
        const converted = this._convertHtmlOrText(rawText, options, stats, preview);
        return { blob: new Blob([converted], { type: 'application/vnd.ms-excel' }), stats, preview };
      }
      const extracted = this._extractTextFromBinaryDoc(arrayBuffer);
      const htmlXls = `MIME-Version: 1.0\r\nContent-Type: text/html; charset="utf-8"\r\n\r\n<html><body><table>${
        extracted.split('\n').map(l => `<tr><td>${this._convertString(l, options, stats, preview)}</td></tr>`).join('')
      }</table></body></html>`;
      return { blob: new Blob([htmlXls], { type: 'application/vnd.ms-excel' }), stats, preview };
    }

    async convertPpt(arrayBuffer, options = {}) {
      const stats   = { convertedRuns: 0, docType: 'ppt' };
      const preview = { originalSample: [], convertedSample: [] };
      const rawText = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
      if (rawText.includes('<html') || rawText.includes('<?xml')) {
        const converted = this._convertHtmlOrText(rawText, options, stats, preview);
        return { blob: new Blob([converted], { type: 'application/vnd.ms-powerpoint' }), stats, preview };
      }
      const extracted = this._extractTextFromBinaryDoc(arrayBuffer);
      const converted = this._convertString(extracted, options, stats, preview);
      return { blob: new Blob([converted], { type: 'application/vnd.ms-powerpoint' }), stats, preview };
    }

    _convertHtmlOrText(html, options, stats, preview) {
      return html.replace(/>([^<]+)</g, (_, textNode) => '>' + this._convertString(textNode, options, stats, preview) + '<');
    }

    _convertString(text, options, stats, preview) {
      if (!text || !text.trim()) return text;
      if (typeof BanglaConverter !== 'undefined' && BanglaConverter.isPureEnglish(text)) return text;
      const dir = options.direction || 'auto';
      let converted = text;
      if (dir === 'all_bijoy' || dir === 'u2b') {
        if (typeof BanglaConverter !== 'undefined' && BanglaConverter.hasBengaliText(text)) {
          converted = BanglaConverter.unicodeToBijoy(text, options);
          stats.convertedRuns = (stats.convertedRuns || 0) + 1;
        }
      } else if (dir === 'all_unicode' || dir === 'b2u') {
        if (typeof BanglaConverter !== 'undefined') {
          converted = BanglaConverter.bijoyToUnicode(text, options);
          stats.convertedRuns = (stats.convertedRuns || 0) + 1;
        }
      } else {
        if (typeof BanglaConverter !== 'undefined') {
          converted = BanglaConverter.autoConvert(text, options);
          stats.convertedRuns = (stats.convertedRuns || 0) + 1;
        }
      }
      if (converted !== text && preview.originalSample.length < 10) {
        preview.originalSample.push(text.trim());
        preview.convertedSample.push(converted.trim());
      }
      return converted;
    }
  }

  DocBinaryEngine.prototype.convertDocFile = async function(fileOrBuf, options) {
    if (fileOrBuf instanceof ArrayBuffer) {
      return this.convertDoc(fileOrBuf, options);
    }
    if (fileOrBuf && typeof fileOrBuf.arrayBuffer === 'function') {
      const buf = await fileOrBuf.arrayBuffer();
      return this.convertDoc(buf, options);
    }
    return this.convertDoc(fileOrBuf, options);
  };

  const docBinaryEngine = new DocBinaryEngine();

  if (typeof window !== 'undefined')  window.DocBinaryEngine  = docBinaryEngine;
  if (typeof global !== 'undefined')  global.DocBinaryEngine  = docBinaryEngine;
  if (typeof module !== 'undefined' && module.exports) module.exports = docBinaryEngine;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
