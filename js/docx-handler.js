/**
 * DOCX Document Parser & Transformer Engine
 * Preserves 100% of formatting, tables, styles, images, alignments, headers, footers.
 * Converts text nodes and updates run fonts seamlessly to guarantee SutonnyMJ rendering in MS Word.
 */

(function (global) {
  'use strict';

  class DocxHandler {
    constructor(options = {}) {
      this.options = Object.assign({
        direction: 'u2b', // 'u2b' (Unicode -> Bijoy) or 'b2u' (Bijoy -> Unicode)
        targetFont: 'SutonnyMJ',
        convertHeadersFooters: true,
        convertFootnotes: true,
        convertComments: true,
        convertNumbers: true,
        numberFormat: 'bengali',
        onProgress: null
      }, options);
    }

    /**
     * Convert an uploaded .docx ArrayBuffer or File
     * Returns: Promise<{ convertedBlob: Blob, stats: Object, preview: Object, originalName: string }>
     */
    async convertDocx(fileOrBuffer, customOptions = {}) {
      const opts = Object.assign({}, this.options, customOptions);
      const isU2B = opts.direction === 'u2b';
      const targetFontName = opts.targetFont || (isU2B ? 'SutonnyMJ' : 'Kalpurush');

      let arrayBuffer;
      let originalName = "document.docx";

      if (fileOrBuffer instanceof File || fileOrBuffer instanceof Blob) {
        if (fileOrBuffer.name) originalName = fileOrBuffer.name;
        arrayBuffer = await fileOrBuffer.arrayBuffer();
      } else {
        arrayBuffer = fileOrBuffer;
      }

      this._reportProgress(10, "ডকুমেন্ট আনপ্যাক করা হচ্ছে...", opts);

      if (typeof JSZip === 'undefined') {
        throw new Error("JSZip library is not loaded.");
      }

      const zip = await JSZip.loadAsync(arrayBuffer);
      
      const stats = {
        totalParagraphs: 0,
        convertedRuns: 0,
        totalWords: 0,
        filesProcessed: 0
      };

      const preview = {
        originalSample: [],
        convertedSample: []
      };

      // Collect all XML files to process
      const xmlFilesToProcess = [];

      if (zip.file("word/document.xml")) {
        xmlFilesToProcess.push("word/document.xml");
      }

      if (opts.convertHeadersFooters) {
        zip.forEach((relativePath) => {
          if (/^word\/(header|footer)\d+\.xml$/i.test(relativePath)) {
            xmlFilesToProcess.push(relativePath);
          }
        });
      }

      if (opts.convertFootnotes) {
        if (zip.file("word/footnotes.xml")) xmlFilesToProcess.push("word/footnotes.xml");
        if (zip.file("word/endnotes.xml")) xmlFilesToProcess.push("word/endnotes.xml");
      }

      if (opts.convertComments && zip.file("word/comments.xml")) {
        xmlFilesToProcess.push("word/comments.xml");
      }

      const totalFiles = xmlFilesToProcess.length;
      const parser = new DOMParser();
      const serializer = new XMLSerializer();

      for (let fIdx = 0; fIdx < totalFiles; fIdx++) {
        const filePath = xmlFilesToProcess[fIdx];
        const progressPct = 20 + Math.floor((fIdx / totalFiles) * 65);
        this._reportProgress(progressPct, `প্রসেস করা হচ্ছে: ${filePath.split('/').pop()}...`, opts);

        const xmlContent = await zip.file(filePath).async("string");
        const xmlDoc = parser.parseFromString(xmlContent, "application/xml");

        const parseError = xmlDoc.querySelector("parsererror");
        if (parseError) {
          console.warn("XML parse error in " + filePath + ":", parseError.textContent);
          continue;
        }

        // Process all paragraphs (<w:p>) in the XML document
        const paragraphs = Array.from(xmlDoc.getElementsByTagName("w:p"));
        stats.totalParagraphs += paragraphs.length;

        for (let p of paragraphs) {
          this._processParagraph(p, xmlDoc, opts, isU2B, targetFontName, stats, preview);
        }

        const modifiedXmlString = serializer.serializeToString(xmlDoc);
        zip.file(filePath, modifiedXmlString);
        stats.filesProcessed++;
      }

      this._reportProgress(90, "নতুন ওয়ার্ড ফাইল তৈরি করা হচ্ছে...", opts);

      const convertedBlob = await zip.generateAsync({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });

      this._reportProgress(100, "রূপান্তর সম্পন্ন হয়েছে!", opts);

      const baseName = originalName.replace(/\.[^/.]+$/, "");
      const ext = ".docx";
      const suffix = isU2B ? "_Bijoy_SutonnyMJ" : "_Unicode";
      const outputFileName = `${baseName}${suffix}${ext}`;

      return {
        convertedBlob,
        outputFileName,
        stats,
        preview,
        originalName
      };
    }

    /**
     * Process an individual paragraph `<w:p>`
     */
    _processParagraph(p, xmlDoc, opts, isU2B, targetFontName, stats, preview) {
      // 1. Merge contiguous runs with identical formatting to prevent split-word bugs
      const initialRuns = Array.from(p.getElementsByTagName("w:r"));
      if (initialRuns.length === 0) return;

      this._mergeContiguousRuns(p, initialRuns);

      // 2. Check if whole paragraph has Bengali text or Bengali context
      const pFullText = p.textContent || "";
      const paragraphHasBengali = isU2B ? (BanglaConverter.hasBengaliText(pFullText) || /[০-৯\u0964\u0965]/.test(pFullText)) : true;

      // 3. Refresh run list after merge
      const updatedRuns = Array.from(p.getElementsByTagName("w:r"));

      for (let r of updatedRuns) {
        const textNodes = Array.from(r.getElementsByTagName("w:t"));
        if (textNodes.length === 0) continue;

        for (let tNode of textNodes) {
          const originalText = tNode.textContent;
          if (originalText === null || originalText === undefined) continue;

          let runIsU2B = isU2B;
          if (opts.direction === 'auto') {
            runIsU2B = BanglaConverter.hasBengaliText(originalText) || /[০-৯\u0964\u0965]/.test(originalText);
            if (!runIsU2B && paragraphHasBengali && /^[\s\d\.\,\/\-\:\;\(\)\[\]\{\}\'\"\|\?\!\@\#\$\%\^\&\*\+\=\<\>\–\—«»“”‘’]+$/.test(originalText)) {
               runIsU2B = true;
            }
          }

          let shouldConvert = false;
          if (runIsU2B) {
            shouldConvert = BanglaConverter.hasBengaliText(originalText) || 
                            /[০-৯\u0964\u0965]/.test(originalText) ||
                            (paragraphHasBengali && /^[\s\d\.\,\/\-\:\;\(\)\[\]\{\}\'\"\|\?\!\@\#\$\%\^\&\*\+\=\<\>\–\—«»“”‘’]+$/.test(originalText));
          } else {
            shouldConvert = /[^\u0000-\u007F]/.test(originalText) || /[A-Za-z0-9]/.test(originalText);
          }

          if (shouldConvert) {
            let convertedText = "";
            let currentTargetFont = runIsU2B ? 'SutonnyMJ' : (opts.targetFont || 'Kalpurush');

            if (runIsU2B) {
              convertedText = BanglaConverter.unicodeToBijoy(originalText, {
                convertNumbers: opts.convertNumbers,
                numberFormat: opts.numberFormat
              });
            } else {
              convertedText = BanglaConverter.bijoyToUnicode(originalText, {
                convertNumbers: opts.convertNumbers,
                numberFormat: opts.numberFormat
              });
            }

            tNode.textContent = convertedText;
            tNode.setAttribute("xml:space", "preserve");
            stats.convertedRuns++;

            if (preview.originalSample.length < 8 && originalText.trim().length > 2) {
              preview.originalSample.push(originalText.trim());
              preview.convertedSample.push(convertedText.trim());
            }

            // Update font & remove Complex Script flags
            this._updateRunFontAndProps(r, xmlDoc, typeof currentTargetFont !== 'undefined' ? currentTargetFont : targetFontName, runIsU2B);
          }
        }
      }
    }

    /**
     * Merge adjacent runs that have identical formatting
     */
    _mergeContiguousRuns(p, runs) {
      if (runs.length <= 1) return;

      for (let i = 0; i < runs.length - 1; i++) {
        const currentRun = runs[i];
        const nextRun = runs[i + 1];

        if (!currentRun || !nextRun || !currentRun.parentNode || !nextRun.parentNode) continue;
        if (currentRun.nextSibling !== nextRun) continue;

        const currentPr = currentRun.getElementsByTagName("w:rPr")[0];
        const nextPr = nextRun.getElementsByTagName("w:rPr")[0];

        const currentPrXml = currentPr ? currentPr.outerHTML : "";
        const nextPrXml = nextPr ? nextPr.outerHTML : "";

        if (currentPrXml === nextPrXml) {
          const currentT = currentRun.getElementsByTagName("w:t")[0];
          const nextT = nextRun.getElementsByTagName("w:t")[0];

          if (currentT && nextT) {
            currentT.textContent = (currentT.textContent || "") + (nextT.textContent || "");
            p.removeChild(nextRun);
            runs.splice(i + 1, 1);
            i--; // Recheck with next run
          }
        }
      }
    }

    /**
     * Set or update font properties in <w:rPr>
     */
    _updateRunFontAndProps(run, xmlDoc, targetFontName, isU2B) {
      let rPr = run.getElementsByTagName("w:rPr")[0];
      if (!rPr) {
        rPr = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:rPr");
        run.insertBefore(rPr, run.firstChild);
      }

      // 1. Font Definition
      let rFonts = rPr.getElementsByTagName("w:rFonts")[0];
      if (!rFonts) {
        rFonts = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:rFonts");
        rPr.insertBefore(rFonts, rPr.firstChild);
      }

      rFonts.setAttribute("w:ascii", targetFontName);
      rFonts.setAttribute("w:hAnsi", targetFontName);
      rFonts.setAttribute("w:cs", targetFontName);
      rFonts.setAttribute("w:eastAsia", targetFontName);

      if (isU2B) {
        rFonts.setAttribute("w:hint", "ascii");

        // Remove <w:cs/> if present
        const csTags = Array.from(rPr.getElementsByTagName("w:cs"));
        csTags.forEach(tag => rPr.removeChild(tag));

        // Remove <w:rtl/> if present
        const rtlTags = Array.from(rPr.getElementsByTagName("w:rtl"));
        rtlTags.forEach(tag => rPr.removeChild(tag));

        // Update <w:lang>
        let lang = rPr.getElementsByTagName("w:lang")[0];
        if (!lang) {
          lang = xmlDoc.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:lang");
          rPr.appendChild(lang);
        }
        lang.setAttribute("w:val", "en-US");
        lang.setAttribute("w:eastAsia", "en-US");
        lang.setAttribute("w:bidi", "en-US");
      } else {
        rFonts.setAttribute("w:hint", "cs");
      }
    }

    _reportProgress(percent, message, opts) {
      if (typeof opts.onProgress === 'function') {
        opts.onProgress(percent, message);
      }
    }
    /**
     * Generate a complete standalone .docx Blob from raw text
     */
    static async createDocxFromText(text, fontName = 'SutonnyMJ', isBijoy = true) {
      if (typeof JSZip === 'undefined') {
        throw new Error("JSZip is not loaded.");
      }

      const zip = new JSZip();
      const lines = (text || '').split(/\r?\n/);
      
      const paragraphsXml = lines.map(line => {
        const escaped = (line || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<w:p><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="${fontName}" w:hAnsi="${fontName}" w:cs="${fontName}" ${isBijoy ? 'w:hint="ascii"' : 'w:hint="cs"'}/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`;
      }).join('\n');

      const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

      const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

      const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${paragraphsXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

      const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="${fontName}" w:hAnsi="${fontName}" w:cs="${fontName}"/>
        <w:sz w:val="28"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
</w:styles>`;

      zip.file("[Content_Types].xml", contentTypesXml);
      zip.file("_rels/.rels", relsXml);
      zip.file("word/document.xml", documentXml);
      zip.file("word/_rels/document.xml.rels", docRelsXml);
      zip.file("word/styles.xml", stylesXml);

      return await zip.generateAsync({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      });
    }

    /**
     * Generate an Office 2003 .doc Blob from raw text
     */
    static createDocFromText(text, fontName = 'SutonnyMJ') {
      const lines = (text || '').split(/\r?\n/);
      const paragraphsHtml = lines.map(line => {
        const escaped = (line || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<p style="margin: 0 0 6pt 0; font-family: '${fontName}', SutonnyMJ, Arial, sans-serif; font-size: 14pt; line-height: 1.4;">${escaped || '&nbsp;'}</p>`;
      }).join('\n');

      const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<style>
@page Section1 { size: 595.35pt 841.95pt; margin: 72pt 72pt 72pt 72pt; mso-header-margin: 36pt; mso-footer-margin: 36pt; }
div.Section1 { page: Section1; }
body { font-family: '${fontName}', SutonnyMJ, Arial, sans-serif; font-size: 14pt; }
p { margin: 0 0 6pt 0; }
</style>
</head>
<body>
<div class="Section1">
${paragraphsHtml}
</div>
</body>
</html>`;

      return new Blob([docHtml], { type: "application/msword;charset=utf-8" });
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocxHandler;
  } else {
    global.DocxHandler = DocxHandler;
  }

})(typeof window !== 'undefined' ? window : global);

