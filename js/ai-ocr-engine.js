/**
 * ============================================================================
 * Fayzar Computer v2 - AI Bengali OCR & Math (LaTeX) to Bijoy .doc Engine
 * (SPEED-OPTIMIZED, WITH FULL DOCX/DOC EXPORT RESTORED)
 * ============================================================================
 * Speed changes vs the previous "optimized" build:
 * 1. Multi-file OCR requests run in a CONCURRENCY-LIMITED pool (default 3
 *    at a time), not fully sequential and not fully unlimited-parallel
 *    (which was hitting Gemini rate limits and causing silent 429 failures).
 * 2. Every Gemini/GAS fetch has an AbortController timeout (18s) so a
 *    hanging request can't block the whole batch.
 * 3. Model fallback list trimmed to the 2 fastest/most reliable models
 *    instead of 5, and thinkingConfig removed (it was causing a wasted
 *    400-then-retry round trip on some models).
 * 4. Image resize/compression now targets 1536px longest side (down from
 *    2048) which is still plenty for OCR accuracy but meaningfully faster
 *    to encode and upload, especially over slower connections.
 * 5. Full native .doc (RTF/SutonnyMJ) and .docx (OOXML, Bijoy + Unicode,
 *    with real table + equation support) generation is restored — the
 *    previous rewrite had accidentally replaced this with a placeholder
 *    that produced a broken/corrupt file.
 * ============================================================================
 */

(function (global) {
  'use strict';

  const STORAGE_KEYS = {
    FREE_COUNT: 'fayzar_ai_ocr_free_count',
    BYOK_KEY: 'fayzar_ai_ocr_gemini_key',
    GAS_URL: 'fayzar_ai_ocr_gas_url',
    DEMO_MODE: 'fayzar_ai_ocr_demo_mode',
    SELECTED_MODEL: 'fayzar_ai_ocr_selected_model'
  };

  const MAX_FREE_USES = 5;
  const REQUEST_TIMEOUT_MS = 18000;   // per-attempt fetch timeout
  const MAX_CONCURRENT_FILES = 3;     // avoid hammering rate limits

  const GEMINI_PROMPT = `You are an elite Bengali Professional Document Composer, Question Paper Typist, and LaTeX-to-Word formatting specialist.
Your goal is to extract and compose a COMPLETE, UNTRUNCATED, BEAUTIFULLY STRUCTURED Bengali document / exam question paper from this entire file.

CRITICAL COMPOSITION & COMPLETION RULES:
1. FULL COMPLETE EXTRACTION (NO HALF CUTS):
   - You MUST extract and format ALL PAGES from page 1 to the very last page completely.
   - DO NOT stop halfway, DO NOT truncate, and DO NOT summarize or skip questions.
   - Process all questions, figures, values, sections, and paragraphs continuously to the very end of the file.

2. CLEAN PROFESSIONAL OUTPUT (NO CHATTER / NO CODE BLOCKS):
   - Output ONLY the clean transcribed document text directly.
   - DO NOT add introductory greetings, explanations, chat preamble, or markdown code fences (\`\`\`).
   - Reconstruct disjointed lines into smooth, coherent sentences and complete paragraphs.

3. MULTIPLE CHOICE QUESTIONS (বহুনির্বাচনী / নৈর্ব্যক্তিক প্রশ্ন):
   - Format MCQ options neatly using horizontal spacing/tabs matching textbook question paper layout:
     ১. একটি আদর্শ ট্রান্সফরমারে নিচের কোনটি সত্য?
        (ক) Vp/Vs = Np/Ns = Is/Ip    (খ) Vp/Vs = Ns/Np    (গ) Vp*Ip = Vs/Is    (ঘ) Np*Ns = Vp*Vs
     ২. সমীকরণটির মূল কয়টি?
        (ক) ১টি    (খ) ২টি    (গ) ৩টি    (ঘ) ৪টি
   - Keep options aligned side-by-side on the same line with appropriate tab spacing whenever possible.

4. DIAGRAMS & GEOMETRIC FIGURES (চিত্র / জ্যামিতিক চিত্র / ডায়াগ্রাম):
   - Whenever there is a diagram, geometric shape (e.g. triangle \\Delta ABD, circle, polygon), circuit, graph, chart, or physics illustration, NEVER skip it or leave it blank.
   - You MUST extract all labels, vertices, side lengths, angles, and given values in text, and clearly format it as:
     [চিত্র আছে: চিত্রে \\Delta ABD একটি ত্রিভুজ, যার বাহু ও কোণের মানসমূহ: AB = ..., BD = ..., AD = ...]
   - If questions refer to the diagram (যেমন: "উদ্দীপকের চিত্রানুযায়ী ৫ নং প্রশ্নের উত্তর দাও"), always retain the diagram reference and its values clearly so the question remains 100% solvable.

5. TABLES & GRIDS (টেবিল ও ছক):
   - NEVER skip any table or grid. Transcribe all tables into complete, standard Markdown tables.
   - Example:
     | উপাদান | প্রাইমারি কুন্ডলী | সেকেন্ডারি কুন্ডলী |
     | :--- | :--- | :--- |
     | ভোল্টেজ ($V$) | $210\\text{ V}$ | $700\\text{ V}$ |
     | পাকসংখ্যা ($N$) | $30$ | $N_s$ |

6. CREATIVE QUESTION PAPERS (সৃজনশীল প্রশ্নপত্র) & MARKS:
   - Format sub-questions with marks (মান) directly on the same line:
     ক. রূপান্তরক কাকে বলে? [১]
     খ. স্টেপ-আপ ও স্টেপ-ডাউন ট্রান্সফরমারের পার্থক্য ব্যাখ্যা কর। [২]
     গ. উদ্দীপকের তথ্যানুযায়ী আউটপুটে তড়িৎ বিভব নির্ণয় কর। [৩]
     ঘ. ক্ষমতা অপরিবর্তিত থাকলে সেকেন্ডারি প্রবাহ বিশ্লেষণ কর। [৪]
   - NEVER isolate marks on empty bottom lines.

7. MATHEMATICAL & SCIENTIFIC NOTATION (লেটেক্স ও বাংলা এককের সম্পূর্ণ পৃথকীকরণ):
   - Write mathematical formulas, equations, and numbers in LaTeX ($...$).
   - CRITICAL: NEVER put any Bengali word, text, unit, or quotes (যেমন: "বর্গসেমি", "সেমি", "মিটার", "টাকা", "টি", "জন") inside LaTeX blocks ($...$, $$...$$) or \\text{...}.
   - LaTeX blocks must ONLY contain pure mathematical numbers, variables, formulas, and symbols.
   - All Bengali text and units MUST ALWAYS be written outside $...$.
   - Incorrect: (ক) $4\\sqrt{55} \\text{"বর্গসেমি"}$ ❌
   - Correct: (ক) $4\\sqrt{55}$ "বর্গসেমি" (অথবা (ক) $4\\sqrt{55}$ বর্গসেমি) ✅

8. ACCURATE BENGALI TYPOGRAPHY & SELF-CORRECTION:
   - Use 100% correct Bengali spelling (যুক্তবর্ণ, ণ-ত্ব/ষ-ত্ব, দাড়ি, কমা, হাইফেন). Keep English terms, units, and symbols (kW, V, A, W, Input, Output) clean in English.
   - If the source document contains any obvious typo or discrepancy that you corrected, add a brief note at the very end under:
     [রেফারেন্স ও সংশোধনী]
     - সংক্ষেপ বিবরণ...`;

  const savedKey = localStorage.getItem(STORAGE_KEYS.BYOK_KEY) || localStorage.getItem('bengali_ocr_gemini_key') || '';
  const savedGas = localStorage.getItem(STORAGE_KEYS.GAS_URL) || localStorage.getItem('bengali_ocr_gas_url') || '';
  const hasValidConfig = Boolean(savedKey || savedGas);

  const state = {
    freeUsesCount: parseInt(localStorage.getItem(STORAGE_KEYS.FREE_COUNT) || '0', 10),
    byokApiKey: savedKey,
    gasUrl: savedGas,
    demoMode: hasValidConfig ? false : (localStorage.getItem(STORAGE_KEYS.DEMO_MODE) !== null ? localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === 'true' : true),
    selectedModel: localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) || 'auto',

    filesQueue: [],
    selectedFile: null,
    imageBase64: '',
    imageMimeType: '',
    isProcessing: false,
    unicodeText: '',
    bijoyText: '',
    activeViewTab: 'unicode'
  };

  let elements = {};
  let _dictLoaded = false;

  async function loadConverterDictionary() {
    if (_dictLoaded) return;
    _dictLoaded = true;
    let dict = [];
    try {
      const local = JSON.parse(localStorage.getItem('fayzar_converter_dict') || '[]');
      if (Array.isArray(local) && local.length) dict = local;
    } catch (e) { /* ignore */ }

    if (!dict.length) {
      try {
        const res = await fetch('data/converter_dict.json?t=' + Date.now());
        if (res.ok) {
          const j = await res.json();
          if (Array.isArray(j) && j.length) dict = j;
        }
      } catch (e) { /* ignore */ }
    }

    if (typeof window.BanglaConverter !== 'undefined' && typeof window.BanglaConverter.setCustomDictionary === 'function') {
      window.BanglaConverter.setCustomDictionary(dict);
    }
  }

  function init() {
    bindElements();
    if (!elements.panel) return;
    loadSettings();
    updateBadges();
    setupEvents();
    loadConverterDictionary();
  }

  function bindElements() {
    elements = {
      panel: document.getElementById('panel-ai-ocr'),
      dropZone: document.getElementById('ai-ocr-dropzone'),
      fileInput: document.getElementById('ai-ocr-file-input'),
      uploadPrompt: document.getElementById('ai-ocr-upload-prompt'),
      previewContainer: document.getElementById('ai-ocr-preview-container'),
      imagePreview: document.getElementById('ai-ocr-image-preview'),
      pdfPreviewIcon: document.getElementById('ai-ocr-pdf-preview'),
      removeImageBtn: document.getElementById('ai-ocr-remove-image-btn'),
      fileName: document.getElementById('ai-ocr-file-name'),
      fileSize: document.getElementById('ai-ocr-file-size'),
      fileCountBadge: document.getElementById('ai-ocr-file-count-badge'),
      multiThumbs: document.getElementById('ai-ocr-multi-thumbs'),

      convertBtn: document.getElementById('ai-ocr-convert-btn'),
      convertBtnText: document.getElementById('ai-ocr-convert-btn-text'),
      progressContainer: document.getElementById('ai-ocr-progress-container'),
      progressStepText: document.getElementById('ai-ocr-progress-step-text'),
      progressBar: document.getElementById('ai-ocr-progress-bar'),
      progressPercent: document.getElementById('ai-ocr-progress-percent'),

      successCard: document.getElementById('ai-ocr-success-card'),
      togglePreviewBtn: document.getElementById('ai-ocr-toggle-preview-btn'),
      togglePreviewText: document.getElementById('ai-ocr-toggle-preview-text'),
      collapsiblePreview: document.getElementById('ai-ocr-collapsible-preview'),

      creditBadge: document.getElementById('ai-ocr-credit-badge'),
      modeBadge: document.getElementById('ai-ocr-mode-badge'),

      outputUnicodeArea: document.getElementById('ai-ocr-output-unicode'),
      outputBijoyArea: document.getElementById('ai-ocr-output-bijoy'),

      copyBtn: document.getElementById('ai-ocr-copy-btn'),
      sendToConverterBtn: document.getElementById('ai-ocr-send-to-converter-btn'),
      downloadDocBtn: document.getElementById('ai-ocr-download-doc-btn'),
      downloadBijoyDocxBtn: document.getElementById('ai-ocr-download-bijoy-docx-btn'),
      downloadDocxBtn: document.getElementById('ai-ocr-download-docx-btn'),

      pageSizeSelect: document.getElementById('ai-ocr-page-size'),
      pageMarginSelect: document.getElementById('ai-ocr-page-margin'),
      fontSizeSelect: document.getElementById('ai-ocr-font-size'),
      lineSpacingSelect: document.getElementById('ai-ocr-line-spacing'),

      openSettingsBtn: document.getElementById('ai-ocr-open-settings-btn'),
      settingsModal: document.getElementById('ai-ocr-settings-modal'),
      closeSettingsBtn: document.getElementById('ai-ocr-close-settings-btn'),
      saveSettingsBtn: document.getElementById('ai-ocr-save-settings-btn'),
      demoToggle: document.getElementById('ai-ocr-demo-toggle'),
      geminiKeyInput: document.getElementById('ai-ocr-gemini-key-input'),
      modelSelect: document.getElementById('ai-ocr-model-select'),
      gasUrlInput: document.getElementById('ai-ocr-gas-url-input'),
      resetCreditsBtn: document.getElementById('ai-ocr-reset-credits-btn'),

      byokModal: document.getElementById('ai-ocr-byok-modal'),
      byokInput: document.getElementById('ai-ocr-byok-input'),
      saveByokBtn: document.getElementById('ai-ocr-save-byok-btn'),
      cancelByokBtn: document.getElementById('ai-ocr-cancel-byok-btn')
    };
  }

  function loadSettings() {
    if (elements.demoToggle) elements.demoToggle.checked = state.demoMode;
    if (elements.geminiKeyInput) elements.geminiKeyInput.value = state.byokApiKey;
    if (elements.gasUrlInput) elements.gasUrlInput.value = state.gasUrl;
    if (elements.modelSelect) elements.modelSelect.value = state.selectedModel || 'auto';
  }

  function updateBadges() {
    const remaining = Math.max(0, MAX_FREE_USES - state.freeUsesCount);
    if (elements.creditBadge) {
      elements.creditBadge.textContent = `ফ্রি ক্রেডিট: ${toBengaliNumber(remaining)}/${toBengaliNumber(MAX_FREE_USES)}`;
      if (remaining === 0) {
        elements.creditBadge.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300";
        elements.creditBadge.textContent = "ফ্রি শেষ (BYOK)";
      } else {
        elements.creditBadge.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300";
      }
    }
    if (elements.modeBadge) {
      if (state.demoMode) {
        elements.modeBadge.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 inline-flex items-center gap-1";
        elements.modeBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> অফলাইন ডেমো`;
      } else if (state.byokApiKey) {
        elements.modeBadge.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 inline-flex items-center gap-1";
        elements.modeBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> লাইভ API সচল`;
      } else {
        elements.modeBadge.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 inline-flex items-center gap-1";
        elements.modeBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> ফ্রি প্রক্সি`;
      }
    }
  }

  function setupEvents() {
    if (elements.dropZone) {
      ['dragenter', 'dragover'].forEach(name => {
        elements.dropZone.addEventListener(name, (e) => {
          e.preventDefault();
          elements.dropZone.classList.add('border-indigo-500', 'bg-indigo-50/50', 'dark:bg-indigo-950/20');
        });
      });
      ['dragleave', 'drop'].forEach(name => {
        elements.dropZone.addEventListener(name, (e) => {
          e.preventDefault();
          elements.dropZone.classList.remove('border-indigo-500', 'bg-indigo-50/50', 'dark:bg-indigo-950/20');
        });
      });
      elements.dropZone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
      });
    }

    if (elements.fileInput) {
      elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
      });
    }

    if (elements.removeImageBtn) {
      elements.removeImageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearImage();
      });
    }

    if (elements.convertBtn) elements.convertBtn.addEventListener('click', startOcrConversion);

    if (elements.togglePreviewBtn) {
      elements.togglePreviewBtn.addEventListener('click', () => {
        const isHidden = elements.collapsiblePreview?.classList.contains('hidden');
        if (isHidden) {
          elements.collapsiblePreview?.classList.remove('hidden');
          elements.collapsiblePreview?.classList.add('flex');
          if (elements.togglePreviewText) elements.togglePreviewText.textContent = 'প্রিভিউ লুকান';
        } else {
          elements.collapsiblePreview?.classList.add('hidden');
          elements.collapsiblePreview?.classList.remove('flex');
          if (elements.togglePreviewText) elements.togglePreviewText.textContent = 'টেক্সট প্রিভিউ দেখুন';
        }
      });
    }

    if (elements.copyBtn) elements.copyBtn.addEventListener('click', copyCurrentText);
    if (elements.sendToConverterBtn) elements.sendToConverterBtn.addEventListener('click', sendToMainConverter);

    if (elements.downloadDocBtn) elements.downloadDocBtn.addEventListener('click', () => downloadWordDocument('doc'));
    if (elements.downloadBijoyDocxBtn) elements.downloadBijoyDocxBtn.addEventListener('click', () => downloadWordDocument('bijoy_docx'));
    if (elements.downloadDocxBtn) elements.downloadDocxBtn.addEventListener('click', () => downloadWordDocument('unicode_docx'));

    if (elements.openSettingsBtn) elements.openSettingsBtn.addEventListener('click', () => toggleModal(elements.settingsModal, true));
    if (elements.closeSettingsBtn) elements.closeSettingsBtn.addEventListener('click', () => toggleModal(elements.settingsModal, false));
    if (elements.saveSettingsBtn) elements.saveSettingsBtn.addEventListener('click', saveSettings);
    if (elements.resetCreditsBtn) elements.resetCreditsBtn.addEventListener('click', resetCredits);
    if (elements.cancelByokBtn) elements.cancelByokBtn.addEventListener('click', () => toggleModal(elements.byokModal, false));
    if (elements.saveByokBtn) elements.saveByokBtn.addEventListener('click', saveByokKey);
  }

  function handleFiles(filesList) {
    if (!filesList || filesList.length === 0) return;
    const files = Array.from(filesList);

    clearImage();
    state.filesQueue = [];
    let totalBytes = 0;

    for (let file of files) {
      const isImage = file.type.match('image.*') || /\.(png|jpe?g|webp|bmp|jfif)$/i.test(file.name);
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

      if (!isImage && !isPdf) {
        showToast(`'${file.name}' ফরম্যাট সমর্থিত নয়! শুধুমাত্র PDF বা ছবি দিন।`, 'warning');
        continue;
      }
      if (file.size > 50 * 1024 * 1024) {
        showToast(`'${file.name}' সাইজ ৫০MB-র বেশি!`, 'warning');
        continue;
      }

      totalBytes += file.size;
      state.filesQueue.push({
        file: file,
        name: file.name,
        size: file.size,
        isPdf: isPdf,
        mimeType: isPdf ? 'application/pdf' : (file.type || 'image/jpeg'),
        base64: ''
      });
    }

    if (state.filesQueue.length === 0) return;

    if (state.filesQueue.length === 1) {
      const single = state.filesQueue[0];
      state.selectedFile = single.file;
      state.imageMimeType = single.mimeType;
      if (elements.fileName) elements.fileName.textContent = single.name;
      if (elements.fileSize) elements.fileSize.textContent = formatBytes(single.size);
      if (elements.fileCountBadge) elements.fileCountBadge.textContent = '১টি ফাইল প্রস্তুত';

      const reader = new FileReader();
      reader.onload = (e) => {
        state.imageBase64 = e.target.result;
        single.base64 = state.imageBase64;
        if (single.isPdf) {
          elements.imagePreview?.classList.add('hidden');
          elements.pdfPreviewIcon?.classList.remove('hidden');
        } else {
          if (elements.imagePreview) elements.imagePreview.src = state.imageBase64;
          elements.imagePreview?.classList.remove('hidden');
          elements.pdfPreviewIcon?.classList.add('hidden');
        }
        elements.uploadPrompt?.classList.add('hidden');
        elements.previewContainer?.classList.remove('hidden');
        elements.multiThumbs?.classList.add('hidden');
        if (elements.convertBtn) elements.convertBtn.disabled = false;
        elements.successCard?.classList.add('hidden');
      };
      reader.readAsDataURL(single.file);
      return;
    }

    state.selectedFile = state.filesQueue[0].file;
    if (elements.fileName) elements.fileName.textContent = `${state.filesQueue.length}টি ফাইল নির্বাচিত`;
    if (elements.fileSize) elements.fileSize.textContent = `মোট ${formatBytes(totalBytes)}`;
    if (elements.fileCountBadge) elements.fileCountBadge.textContent = `${state.filesQueue.length}টি ফাইল প্রস্তুত`;

    elements.imagePreview?.classList.add('hidden');
    elements.pdfPreviewIcon?.classList.add('hidden');
    elements.uploadPrompt?.classList.add('hidden');
    elements.previewContainer?.classList.remove('hidden');

    if (elements.multiThumbs) {
      elements.multiThumbs.innerHTML = '';
      elements.multiThumbs.classList.remove('hidden');

      state.filesQueue.forEach((item) => {
        const thumbDiv = document.createElement('div');
        thumbDiv.className = 'w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative flex-shrink-0';
        if (item.isPdf) {
          thumbDiv.innerHTML = `<i class="fa-solid fa-file-pdf text-rose-500 text-lg"></i><span class="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[7px] text-white text-center truncate px-0.5">${item.name}</span>`;
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            item.base64 = e.target.result;
            thumbDiv.innerHTML = `<img src="${item.base64}" class="w-full h-full object-cover"><span class="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[7px] text-white text-center truncate px-0.5">${item.name}</span>`;
          };
          reader.readAsDataURL(item.file);
        }
        elements.multiThumbs.appendChild(thumbDiv);
      });
    }

    if (elements.convertBtn) elements.convertBtn.disabled = false;
    elements.successCard?.classList.add('hidden');
    showToast(`মোট ${state.filesQueue.length}টি ফাইল প্রস্তুত করা হয়েছে!`, 'info');
  }

  function clearImage() {
    state.selectedFile = null;
    state.imageBase64 = '';
    state.imageMimeType = '';
    state.filesQueue = [];
    if (elements.fileInput) elements.fileInput.value = '';
    if (elements.imagePreview) elements.imagePreview.src = '';
    if (elements.previewContainer) elements.previewContainer.classList.add('hidden');
    if (elements.uploadPrompt) elements.uploadPrompt.classList.remove('hidden');
    if (elements.multiThumbs) {
      elements.multiThumbs.innerHTML = '';
      elements.multiThumbs.classList.add('hidden');
    }
    if (elements.convertBtn) elements.convertBtn.disabled = true;
    if (elements.successCard) {
      elements.successCard.classList.add('hidden');
      elements.successCard.classList.remove('flex');
    }
    if (elements.collapsiblePreview) {
      elements.collapsiblePreview.classList.add('hidden');
      elements.collapsiblePreview.classList.remove('flex');
      if (elements.togglePreviewText) elements.togglePreviewText.textContent = 'টেক্সট প্রিভিউ দেখুন';
    }
  }

  async function startOcrConversion() {
    if (!state.imageBase64 && state.filesQueue.length === 0) {
      showToast('অনুগ্রহ করে প্রথমে ফাইল আপলোড করুন', 'warning');
      return;
    }

    if (state.byokApiKey && state.byokApiKey.trim().length > 0) {
      await runDirectGeminiOcr(state.byokApiKey.trim());
      return;
    }

    if (state.gasUrl && state.gasUrl.trim().length > 0 && state.freeUsesCount < MAX_FREE_USES) {
      await runGasProxyOcr();
      return;
    }

    if (state.demoMode) {
      await runDemoSimulation();
      return;
    }

    toggleModal(elements.byokModal, true);
  }

  // ---------------------------------------------------------------------
  // Concurrency-limited parallel runner. Runs `limit` items at a time so we
  // get most of the speed benefit of parallelism without tripping API rate
  // limits (which just show up as silent 429 failures otherwise).
  // ---------------------------------------------------------------------
  async function runWithConcurrencyLimit(items, limit, worker, onProgress) {
    const results = new Array(items.length);
    let nextIndex = 0;
    let completed = 0;

    async function runNext() {
      const i = nextIndex++;
      if (i >= items.length) return;
      try {
        results[i] = await worker(items[i], i);
      } catch (err) {
        results[i] = null;
      }
      completed++;
      if (onProgress) onProgress(completed, items.length);
      await runNext();
    }

    const workers = Array(Math.min(limit, items.length)).fill(0).map(runNext);
    await Promise.all(workers);
    return results;
  }

  async function ensureBase64(item) {
    if (item.base64) return item.base64;
    const b64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(item.file);
    });
    item.base64 = b64;
    return b64;
  }

  async function runDirectGeminiOcr(apiKey) {
    if (state.filesQueue.length > 1) {
      const total = state.filesQueue.length;
      setLoading(true, `মোট ${total}টি ফাইল প্রসেস শুরু হচ্ছে (একসাথে ${MAX_CONCURRENT_FILES}টি)...`, 5);

      const results = await runWithConcurrencyLimit(
        state.filesQueue,
        MAX_CONCURRENT_FILES,
        async (item) => {
          const b64 = await ensureBase64(item);
          try {
            return await executeGeminiRequest(apiKey, b64, item.mimeType);
          } catch (err) {
            showToast(`'${item.name}' রূপান্তর ব্যর্থ: ${err.message}`, 'error');
            return null;
          }
        },
        (done, totalCount) => {
          const pct = Math.round((done / totalCount) * 90) + 5;
          setLoading(true, `[${done}/${totalCount}] ফাইল প্রসেস সম্পন্ন...`, pct);
        }
      );

      const validResults = results.filter(t => t && t.trim());
      setLoading(false);

      if (validResults.length > 0) {
        handleExtractionSuccess(validResults.join('\n\n'));
        showToast(`মোট ${validResults.length}/${total} ফাইল সফলভাবে রূপান্তর করা হয়েছে!`, 'success');
      } else {
        showToast('ফাইলগুলো থেকে কোনো টেক্সট পাওয়া যায়নি।', 'warning');
      }
      return;
    }

    setLoading(true, 'Gemini AI ইঞ্জিনের সাথে কানেক্ট করা হচ্ছে...', 30);
    try {
      const text = await executeGeminiRequest(apiKey, state.imageBase64, state.imageMimeType);
      setLoading(false);
      if (text && text.trim()) {
        handleExtractionSuccess(text);
        showToast('AI দিয়ে ডকুমেন্ট রূপান্তর সম্পন্ন হয়েছে!', 'success');
      } else {
        showToast('ছবিটি থেকে কোনো টেক্সট পাওয়া যায়নি।', 'warning');
      }
    } catch (err) {
      setLoading(false);
      showToast(`ত্রুটি: ${err.message}`, 'error');
    }
  }

  async function optimizeBase64Image(dataUrl, mimeType) {
    if (!dataUrl || typeof dataUrl !== 'string' || mimeType === 'application/pdf') return dataUrl;
    if (dataUrl.length < 350 * 1024) return dataUrl;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1536; // enough detail for OCR, notably faster to encode/upload than 2048
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
          else { w = Math.round((w * maxDim) / h); h = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium'; // 'high' costs more time for little OCR benefit
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  function fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
  }

  async function executeGeminiRequest(apiKey, base64Data, mimeType) {
    const optimizedBase64 = await optimizeBase64Image(base64Data, mimeType);
    const cleanBase64 = optimizedBase64.includes('base64,')
      ? optimizedBase64.split('base64,')[1]
      : optimizedBase64;
    const finalMime = mimeType === 'application/pdf' ? 'application/pdf' : 'image/jpeg';

    const payload = {
      contents: [
        {
          parts: [
            { text: GEMINI_PROMPT },
            { inlineData: { mimeType: finalMime, data: cleanBase64 } }
          ]
        }
      ],
      // thinkingConfig intentionally omitted — it caused a wasted 400-then-retry
      // round trip on models that don't support it, doubling latency.
      generationConfig: { temperature: 0.05, maxOutputTokens: 8192 },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ]
    };

    // Trimmed to the 2 fastest/most reliable models instead of looping through 5.
    let candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    if (state.selectedModel && state.selectedModel !== 'auto') {
      candidateModels = [state.selectedModel, ...candidateModels.filter(m => m !== state.selectedModel)];
    }

    let lastError = null;

    for (const model of candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      try {
        const res = await fetchWithTimeout(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }, REQUEST_TIMEOUT_MS);

        if (res.status === 404) continue; // model not available, try next

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const errMsg = data.error?.message || `HTTP ${res.status}`;
          if (res.status === 400 && errMsg.includes('API_KEY_INVALID')) {
            throw new Error('Gemini API Key সঠিক নয়। অনুগ্রহ করে Google AI Studio থেকে সঠিক Key দিন।');
          } else if (res.status === 429) {
            lastError = new Error('API রেট লিমিট শেষ, একটু পর আবার চেষ্টা করুন।');
            continue;
          } else if (res.status >= 500) {
            lastError = new Error('Gemini সার্ভার সাময়িকভাবে ব্যস্ত।');
            continue;
          } else {
            lastError = new Error(errMsg);
            continue;
          }
        }

        if (data.candidates && data.candidates.length > 0) {
          const candidate = data.candidates[0];
          if (candidate.finishReason === 'SAFETY') {
            throw new Error('Google Gemini Safety Filter ছবিটির টেক্সট ব্লক করেছে।');
          }
          if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            return cleanOcrResponse(candidate.content.parts.map(p => p.text || '').join('\n'));
          } else if (candidate.text) {
            return cleanOcrResponse(candidate.text);
          }
        }

        if (data.promptFeedback && data.promptFeedback.blockReason) {
          throw new Error(`Google Gemini Block Reason: ${data.promptFeedback.blockReason}`);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          lastError = new Error(`${model} রেসপন্স দিতে দেরি করছে, পরের মডেল ট্রাই করা হচ্ছে...`);
          continue;
        }
        if (err.message.includes('API Key') || err.message.includes('Safety Filter')) {
          throw err;
        }
        lastError = err;
      }
    }

    throw new Error(lastError?.message || 'Gemini API থেকে কোনো টেক্সট পাওয়া যায়নি।');
  }

  async function runGasProxyOcr() {
    if (state.filesQueue.length > 1) {
      const total = state.filesQueue.length;
      setLoading(true, `মোট ${total}টি ফাইল ফ্রি প্রক্সির মাধ্যমে পাঠানো হচ্ছে...`, 10);

      const results = await runWithConcurrencyLimit(
        state.filesQueue,
        MAX_CONCURRENT_FILES,
        async (item) => {
          const b64 = await ensureBase64(item);
          const cleanBase64 = b64.includes('base64,') ? b64.split('base64,')[1] : b64;
          try {
            const res = await fetchWithTimeout(state.gasUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({ imageBase64: cleanBase64, mimeType: item.mimeType })
            }, REQUEST_TIMEOUT_MS);
            const result = await res.json();
            if (!result.success) throw new Error(result.error || 'GAS Proxy Error');
            return result.extractedText;
          } catch (e) {
            const msg = e.name === 'AbortError' ? 'রিকোয়েস্ট টাইমআউট হয়েছে' : e.message;
            showToast(`'${item.name}' প্রক্সি ত্রুটি: ${msg}`, 'error');
            return null;
          }
        },
        (done, totalCount) => {
          const pct = Math.round((done / totalCount) * 90) + 10;
          setLoading(true, `[${done}/${totalCount}] ফাইল প্রসেস সম্পন্ন...`, pct);
        }
      );

      const validResults = results.filter(Boolean);

      state.freeUsesCount += 1;
      localStorage.setItem(STORAGE_KEYS.FREE_COUNT, state.freeUsesCount.toString());
      updateBadges();
      setLoading(false);

      if (validResults.length > 0) {
        handleExtractionSuccess(validResults.join('\n\n'));
        showToast(`মোট ${validResults.length}/${total} ফাইল সফলভাবে রূপান্তর সম্পন্ন হয়েছে!`, 'success');
      } else {
        showToast('ফাইলগুলো থেকে কোনো টেক্সট পাওয়া যায়নি।', 'warning');
      }
      return;
    }

    setLoading(true, 'Google Apps Script প্রক্সির মাধ্যমে পাঠানো হচ্ছে...', 35);
    try {
      const cleanBase64 = state.imageBase64.includes('base64,')
        ? state.imageBase64.split('base64,')[1]
        : state.imageBase64;

      const res = await fetchWithTimeout(state.gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ imageBase64: cleanBase64, mimeType: state.imageMimeType })
      }, REQUEST_TIMEOUT_MS);

      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'GAS Proxy Error');

      state.freeUsesCount += 1;
      localStorage.setItem(STORAGE_KEYS.FREE_COUNT, state.freeUsesCount.toString());
      updateBadges();

      handleExtractionSuccess(result.extractedText);
      showToast(`সফলভাবে এক্সট্রাক্ট করা হয়েছে! (${MAX_FREE_USES - state.freeUsesCount} টি ফ্রি ক্রেডিট বাকি)`, 'success');
    } catch (e) {
      const msg = e.name === 'AbortError' ? 'রিকোয়েস্ট টাইমআউট হয়েছে' : e.message;
      showToast(`প্রক্সি ত্রুটি: ${msg}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function runDemoSimulation() {
    setLoading(true, 'ইমেজ অপ্টিমাইজেশন ও নয়েজ ফিল্টারিং...', 30);
    await sleep(400);
    setLoading(true, 'বাংলা যুক্তবর্ণ ও গাণিতিক সমীকরণ রিকগনিশন...', 70);
    await sleep(400);

    const demoText = `**মেসার্স শাহ আলম ট্রেডার্স**
ফুলবাড়ী, দিনাজপুর। ফোন: 01717-101919

**বিষয়: পণ্য সরবরাহ বিবরণী ও মূল্য তালিকা**

| ক্রমিক | পণ্যের বিবরণ | পরিমাণ | একক দর (টাকা) | মোট মূল্য (টাকা) |
|---|---|---|---|---|
| ০১ | মিনিকেট চাল | ৫০ বস্তা | ৩,২০০/- | ১,৬০,০০০/- |
| ০২ | নাজিরশাইল চাল | ৩০ বস্তা | ৩,৫০০/- | ১,০৫,০০০/- |
| ০৩ | সয়াবিন তেল (৫ লিটার) | ২০ কার্টুন | ৪,২০০/- | ৮৪,০০০/- |
| ০৪ | মসুর ডাল (দেশি) | ১০ বস্তা | ৬,০০০/- | ৬০,০০০/- |

**সর্বমোট মূল্য: ৪,০৯,০০০/- (চার লক্ষ নয় হাজার টাকা মাত্র)**

১. গণিত সমীকরণ মডেল:
\\[ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\]`;

    handleExtractionSuccess(demoText);
    setLoading(false);
    showToast('অফলাইন ডেমো কনভার্সন সফল হয়েছে!', 'success');
  }

  function handleExtractionSuccess(unicodeText) {
    const cleaned = cleanOcrResponse(unicodeText);
    state.unicodeText = cleaned;
    if (elements.outputUnicodeArea) elements.outputUnicodeArea.value = cleaned;
    recalculateBijoyFromUnicode();

    if (elements.successCard) {
      elements.successCard.classList.remove('hidden');
      elements.successCard.classList.add('flex');
      setTimeout(() => {
        elements.successCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }

  function recalculateBijoyFromUnicode() {
    if (window.BanglaConverter && typeof window.BanglaConverter.unicodeToBijoy === 'function') {
      state.bijoyText = window.BanglaConverter.unicodeToBijoy(state.unicodeText);
      if (elements.outputBijoyArea) elements.outputBijoyArea.value = state.bijoyText;
    } else {
      state.bijoyText = state.unicodeText;
      if (elements.outputBijoyArea) elements.outputBijoyArea.value = state.unicodeText;
    }
  }

  async function copyCurrentText() {
    const text = state.unicodeText;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast('টেক্সট সফলভাবে ক্লিপবোর্ডে কপি করা হয়েছে!', 'success');
    } catch (e) {
      showToast('টেক্সট কপি সম্পন্ন হয়েছে!', 'success');
    }
  }

  async function sendToMainConverter() {
    if (!state.unicodeText || !state.unicodeText.trim()) {
      showToast('কোনো টেক্সট পাওয়া যায়নি!', 'warning');
      return;
    }

    showToast('ফয়জার কনভার্টারে ফাইল প্রস্তুত ও আপলোড করা হচ্ছে...', 'info');

    try {
      const docxBlob = await createDocxBlob(state.unicodeText, false);
      const rawName = state.selectedFile?.name || state.filesQueue?.[0]?.name || 'OCR_Document';
      const baseName = rawName.replace(/\.[^/.]+$/, '');
      const docxFile = new File([docxBlob], `${baseName}.docx`, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        lastModified: Date.now()
      });

      const textTabBtn = document.querySelector('.tool-switch-btn[data-tool-tab="text"]');
      if (textTabBtn) textTabBtn.click();

      const wizardSubTabFileBtn = document.getElementById('wizard-subtab-file-btn');
      if (wizardSubTabFileBtn) wizardSubTabFileBtn.click();

      if (typeof window.initiateFileScan === 'function') {
        await window.initiateFileScan(docxFile);
      } else {
        const wizardFileInput = document.getElementById('wizardFileInput');
        if (wizardFileInput) {
          const dt = new DataTransfer();
          dt.items.add(docxFile);
          wizardFileInput.files = dt.files;
          wizardFileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      const mainSource = document.getElementById('source-text');
      if (mainSource) {
        mainSource.value = state.unicodeText;
        mainSource.dispatchEvent(new Event('input', { bubbles: true }));
      }

      showToast('ফাইলটি সফলভাবে ফয়জার কনভার্টারে আপলোড ও স্ক্যান হয়েছে!', 'success');
    } catch (e) {
      console.error('Send to converter error:', e);
      showToast(`ফয়জার কনভার্টারে পাঠাতে সমস্যা: ${e.message}`, 'error');
    }
  }

  // =========================================================================
  // DOCUMENT EXPORT ENGINE (RESTORED IN FULL — RTF .doc + OOXML .docx)
  // =========================================================================

  const CP1252_MAP_TABLE = {
    0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85,
    0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A,
    0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92,
    0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
    0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C,
    0x017E: 0x9E, 0x0178: 0x9F
  };

  function encodeRtfText(str) {
    if (!str) return '';
    let out = '';
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code === 0x5C) out += '\\\\';
      else if (code === 0x7B) out += '\\{';
      else if (code === 0x7D) out += '\\}';
      else if (code >= 0x20 && code <= 0x7E) {
        out += str[i];
      } else if (CP1252_MAP_TABLE[code] !== undefined) {
        out += "\\'" + CP1252_MAP_TABLE[code].toString(16).padStart(2, '0');
      } else if (code >= 0x80 && code <= 0xFF) {
        out += "\\'" + code.toString(16).padStart(2, '0');
      } else {
        out += `\\u${code}?`;
      }
    }
    return out;
  }

  function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function sanitizeMathBengaliSeparation(rawText) {
    if (!rawText || typeof rawText !== 'string') return rawText || '';
    let s = rawText;

    s = s.replace(/\\text(?:rm|md|bf|it)?\{\s*([^{}]*?[\u0980-\u09FF][^{}]*?)\s*\}/g, '$1');

    s = s.replace(/\$\$([\s\S]*?)\$\$|\$([^\$]+?)\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g, (match, d1, s1, b1, p1) => {
      const isDouble = Boolean(d1 || b1);
      const inner = d1 || s1 || b1 || p1 || '';

      if (!/[\u0980-\u09FF]/.test(inner)) {
        return match;
      }

      const tokenRegex = /([^\u0980-\u09FF"'”’]+)|(["'”’]*[\u0980-\u09FF]+(?:[\s\-_/]+[\u0980-\u09FF]+)*["'”’]*)/g;
      let parts = [];
      let m;
      while ((m = tokenRegex.exec(inner)) !== null) {
        if (m[1]) {
          const mathChunk = m[1].trim();
          if (mathChunk) parts.push(isDouble ? `$$${mathChunk}$$` : `$${mathChunk}$`);
        } else if (m[2]) {
          const bnChunk = m[2].trim();
          if (bnChunk) parts.push(bnChunk);
        }
      }

      return parts.join(' ');
    });

    s = s.replace(/\$\$\s*\$\$/g, '').replace(/\$\s*\$/g, '');
    return s;
  }

  function cleanOcrResponse(rawText) {
    if (!rawText) return '';
    let text = sanitizeMathBengaliSeparation(rawText.trim());

    if (text.startsWith('```')) {
      text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
    }

    text = text.replace(/^[=\-\s]*Start of OCR[^\n]*[=\-\s]*\n?/gim, '');
    text = text.replace(/^[=\-\s]*End of OCR[^\n]*[=\-\s]*\n?/gim, '');
    text = text.replace(/^[=\-\s]*Page\s*\d+[^\n]*[=\-\s]*\n?/gim, '');

    const rawLines = text.split('\n');
    const lines = [];
    let i = 0;
    while (i < rawLines.length) {
      const l = rawLines[i].trim();
      if (/^[=\-]{2,}/.test(l) && /ocr/i.test(l)) { i++; continue; }
      lines.push(rawLines[i]);
      i++;
    }

    const cleanedLines = [];
    i = 0;
    while (i < lines.length) {
      if (i + 7 < lines.length &&
          /^[ক|a]\./i.test(lines[i].trim()) &&
          /^[খ|b]\./i.test(lines[i+1].trim()) &&
          /^[গ|c]\./i.test(lines[i+2].trim()) &&
          /^[ঘ|d]\./i.test(lines[i+3].trim()) &&
          /^[১1]$/.test(lines[i+4].trim()) &&
          /^[২2]$/.test(lines[i+5].trim()) &&
          /^[৩3]$/.test(lines[i+6].trim()) &&
          /^[৪4]$/.test(lines[i+7].trim())) {

        cleanedLines.push(`${lines[i].trim()}   ১`);
        cleanedLines.push(`${lines[i+1].trim()}   ২`);
        cleanedLines.push(`${lines[i+2].trim()}   ৩`);
        cleanedLines.push(`${lines[i+3].trim()}   ৪`);
        i += 8;
        continue;
      }
      cleanedLines.push(lines[i]);
      i++;
    }

    return cleanedLines.join('\n').trim();
  }

  function parseRichRuns(rawText) {
    if (!rawText) return [];

    let clean = rawText
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\pm/g, '±')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥')
      .replace(/\\neq/g, '≠')
      .replace(/\\approx/g, '≈')
      .replace(/\\theta/g, 'θ')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\lambda/g, 'λ')
      .replace(/\\pi/g, 'π')
      .replace(/\\Omega/g, 'Ω')
      .replace(/\\mu/g, 'µ')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\degree|\^\\circ/g, '°')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\quad|\\qquad/g, '   ')
      .replace(/\$/g, '');

    const rx = /([a-zA-Z0-9\u0980-\u09FF]+)([_^])(\{([^}]+)\}|([a-zA-Z0-9\u0980-\u09FF]))/g;
    const runs = [];
    let lastIdx = 0;
    let match;

    while ((match = rx.exec(clean)) !== null) {
      const pre = clean.substring(lastIdx, match.index);
      if (pre) runs.push({ text: pre });

      const base = match[1];
      const op = match[2];
      const scriptVal = match[4] || match[5];

      runs.push({ text: base });
      if (op === '_') runs.push({ text: scriptVal, isSubscript: true });
      else if (op === '^') runs.push({ text: scriptVal, isSuperscript: true });

      lastIdx = rx.lastIndex;
    }

    const post = clean.substring(lastIdx);
    if (post) runs.push({ text: post });

    return runs.length > 0 ? runs : [{ text: clean }];
  }

  function parseDocumentBlocks(text) {
    if (!text || !text.trim()) return [];

    if (text.includes('<table') || text.includes('<TABLE')) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const body = doc.body;
        const blocks = [];

        for (const node of Array.from(body.childNodes)) {
          if (node.nodeType === 1) {
            const tag = node.tagName.toLowerCase();
            if (tag === 'table') {
              const rows = [];
              const trs = node.querySelectorAll('tr');
              for (const tr of Array.from(trs)) {
                const cells = [];
                const tds = tr.querySelectorAll('th, td');
                for (const td of Array.from(tds)) cells.push(td.textContent.trim());
                if (cells.length > 0) rows.push(cells);
              }
              if (rows.length > 0) blocks.push({ type: 'table', rows });
            } else {
              const textContent = node.textContent.trim();
              if (textContent) {
                const isHeading = /^h[1-6]$/.test(tag);
                blocks.push({ type: 'paragraph', text: isHeading ? `**${textContent}**` : textContent });
              }
            }
          } else if (node.nodeType === 3 && node.textContent.trim()) {
            blocks.push({ type: 'paragraph', text: node.textContent.trim() });
          }
        }

        if (blocks.length > 0) return blocks;
      } catch (e) {
        console.warn('DOM parsing failed, falling back to text parsing:', e);
      }
    }

    const lines = text.split('\n');
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
        const tableLines = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        const parsedRows = [];
        for (const tLine of tableLines) {
          if (/^\|[\s\-:]+(\|[\s\-:]+)+\|$/.test(tLine)) continue;
          const cells = tLine.split('|').slice(1, -1).map(c => c.trim());
          if (cells.length > 0) parsedRows.push(cells);
        }

        if (parsedRows.length > 0) {
          blocks.push({ type: 'table', rows: parsedRows });
          continue;
        }
      }

      blocks.push({ type: 'paragraph', text: line });
      i++;
    }

    return blocks;
  }

  function renderRunsForRtf(text, isBijoy, fontSizeHalfPt) {
    if (!text || !text.trim()) return '';
    if (typeof EquationConverter !== 'undefined' && hasLatexMath(text)) {
      const segments = EquationConverter.splitTextAndMath(text);
      let rtf = '';
      for (const seg of segments) {
        if (seg.type === 'math') {
          if (EquationConverter.needsEqField && !EquationConverter.needsEqField(seg.value)) {
            const clean = EquationConverter.sanitizeSimpleMath ? EquationConverter.sanitizeSimpleMath(seg.value, isBijoy) : seg.value.replace(/\$/g, '');
            rtf += renderSimpleMathRtf(clean, isBijoy, fontSizeHalfPt, false);
          } else {
            const eqCode = EquationConverter.latexToEqField(seg.value, isBijoy);
            rtf += renderEquationForRtf(eqCode, isBijoy, fontSizeHalfPt, false);
          }
        } else if (seg.value) {
          rtf += renderRunsForRtfPlain(seg.value, isBijoy, fontSizeHalfPt, false);
        }
      }
      return rtf;
    }
    return renderRunsForRtfPlain(text, isBijoy, fontSizeHalfPt, false);
  }

  function encodeEqInst(str) {
    if (!str) return '';
    let out = '';
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      if (c === 0x7B) out += '\\{';
      else if (c === 0x7D) out += '\\}';
      else if (c >= 0x20 && c <= 0x7E) out += str[i];
      else out += '\\u' + c + '?';
    }
    return out;
  }

  function plainEqApprox(eqCode) {
    return String(eqCode || '')
      .replace(/\\F\(([^,]*),([^)]*)\)/g, '($1)/($2)')
      .replace(/\\R\((?:[^,]*,)?([^)]*)\)/g, '√($1)')
      .replace(/\\S\\up4\((.*?)\)/g, '$1 ')
      .replace(/\\S\\do4\((.*?)\)/g, '$1 ')
      .replace(/\\[a-zA-Z]+/g, '')
      .replace(/[{}]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function renderEquationForRtf(eqCode, isBijoy, fontSizeHalfPt, isBold) {
    const boldPrefix = isBold ? '\\b ' : '';
    const boldSuffix = isBold ? '\\b0 ' : '';
    const inst = encodeEqInst(eqCode);
    const plain = plainEqApprox(eqCode);
    const visible = isBijoy && typeof window.BanglaConverter !== 'undefined'
      ? window.BanglaConverter.unicodeToBijoy(plain)
      : plain;
    return `{\\field{\\*\\fldinst ${boldPrefix}{\\f0\\fs${fontSizeHalfPt} EQ ${inst}}${boldSuffix}}{\\fldrslt ${boldPrefix}{\\f0\\fs${fontSizeHalfPt} ${encodeRtfText(visible || ' ')}}${boldSuffix}}}`;
  }

  function renderSimpleMathRtf(clean, isBijoy, fontSizeHalfPt, isBold) {
    const boldPrefix = isBold ? '\\b ' : '';
    const boldSuffix = isBold ? '\\b0 ' : '';
    return `{\\f0\\fs${fontSizeHalfPt} ${boldPrefix}${encodeRtfText(isBijoy && typeof window.BanglaConverter !== 'undefined' ? window.BanglaConverter.unicodeToBijoy(clean) : clean)}${boldSuffix}}`;
  }

  function renderRunsForRtfPlain(text, isBijoy, fontSizeHalfPt, isBold) {
    if (!text || !text.trim()) return '';

    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    let rtf = '';

    for (const part of parts) {
      if (!part) continue;
      const bold = isBold || (part.startsWith('**') && part.endsWith('**'));
      const cleanText = (part.startsWith('**') && part.endsWith('**')) ? part.slice(2, -2) : part;

      const mathRuns = parseRichRuns(cleanText);

      for (const mRun of mathRuns) {
        const segments = window.BanglaConverter && typeof window.BanglaConverter.splitMixedBengaliAndEnglish === 'function'
          ? window.BanglaConverter.splitMixedBengaliAndEnglish(mRun.text)
          : [{ type: 'bengali', text: mRun.text }];

        for (const seg of segments) {
          const boldPrefix = bold ? '\\b ' : '';
          const boldSuffix = bold ? '\\b0 ' : '';
          const subPrefix = mRun.isSubscript ? '\\sub ' : (mRun.isSuperscript ? '\\super ' : '');
          const subSuffix = (mRun.isSubscript || mRun.isSuperscript) ? '\\nosupersub ' : '';

          if (seg.type === 'english' || !isBijoy) {
            const font = isBijoy ? '\\f1' : '\\f0';
            rtf += `{${font}\\fs${fontSizeHalfPt} ${boldPrefix}${subPrefix}${encodeRtfText(seg.text)}${subSuffix}${boldSuffix}}`;
          } else {
            const bijoyText = window.BanglaConverter ? window.BanglaConverter.unicodeToBijoy(seg.text) : seg.text;
            rtf += `{\\f0\\fs${fontSizeHalfPt} ${boldPrefix}${subPrefix}${encodeRtfText(bijoyText)}${subSuffix}${boldSuffix}}`;
          }
        }
      }
    }
    return rtf;
  }

  function hasLatexMath(text) {
    return /\$\$[\s\S]*?\$\$|\$[^\$]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)/.test(text);
  }

  function renderRunsForOoxml(text, isBijoy, fontSizeHalfPt) {
    if (!text || !text.trim()) return '';
    if (typeof EquationConverter !== 'undefined' && hasLatexMath(text)) {
      const segments = EquationConverter.splitTextAndMath(text);
      let runsXml = '';
      for (const seg of segments) {
        if (seg.type === 'math') {
          if (EquationConverter.needsEqField && !EquationConverter.needsEqField(seg.value)) {
            const clean = EquationConverter.sanitizeSimpleMath ? EquationConverter.sanitizeSimpleMath(seg.value, isBijoy) : seg.value.replace(/\$/g, '');
            const tokens = (typeof EquationConverter.tokenizeSimpleMath === 'function') ? EquationConverter.tokenizeSimpleMath(clean) : [];
            for (const tok of tokens) {
              if (tok && tok.text) runsXml += renderSimpleMathOoxml(tok, isBijoy, fontSizeHalfPt, false);
            }
          } else {
            const eqCode = EquationConverter.latexToEqField(seg.value, isBijoy);
            runsXml += renderEquationForOoxml(eqCode, isBijoy, fontSizeHalfPt, false);
          }
        } else if (seg.value) {
          runsXml += renderRunsForOoxmlPlain(seg.value, isBijoy, fontSizeHalfPt, false);
        }
      }
      return runsXml;
    }
    return renderRunsForOoxmlPlain(text, isBijoy, fontSizeHalfPt, false);
  }

  function renderEquationForOoxml(eqCode, isBijoy, fontSizeHalfPt, isBold) {
    const bengaliFont = isBijoy ? 'SutonnyMJ' : 'Kalpurush';
    const scriptSz = Math.round(fontSizeHalfPt * 0.67);
    const boldTag = isBold ? '<w:b/>' : '';

    const rpr = (fontName, sz) => `      <w:rPr>
        <w:rFonts w:ascii="${fontName}" w:hAnsi="${fontName}" w:cs="${fontName}"/>
        <w:sz w:val="${sz}"/>
        <w:szCs w:val="${sz}"/>
        ${boldTag}
      </w:rPr>`;

    let xml = '';
    xml += `      <w:r>
${rpr('Times New Roman', fontSizeHalfPt)}
        <w:fldChar w:fldCharType="begin"/>
      </w:r>\n`;

    const fullEq = ' EQ ' + eqCode + ' ';
    const tokens = (typeof EquationConverter !== 'undefined' && typeof EquationConverter.tokenizeEqCode === 'function')
      ? EquationConverter.tokenizeEqCode(fullEq)
      : [{ text: fullEq, italic: false, isScript: false, isQuotedText: false }];

    for (const t of tokens) {
      if (!t || !t.text) continue;
      const isBn = t.isQuotedText && typeof window.BanglaConverter !== 'undefined'
        && (window.BanglaConverter.hasBengaliText && window.BanglaConverter.hasBengaliText(t.text) || isBijoy);
      const fontName = isBn ? bengaliFont : 'Times New Roman';
      const sz = t.isScript ? scriptSz : fontSizeHalfPt;
      const italicTag = t.italic && !isBn ? '<w:i/><w:iCs/>' : '';
      xml += `      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="${fontName}" w:hAnsi="${fontName}" w:cs="${fontName}"/>
          <w:sz w:val="${sz}"/>
          <w:szCs w:val="${sz}"/>
          ${boldTag}
          ${italicTag}
        </w:rPr>
        <w:instrText xml:space="preserve">${escapeXml(t.text)}</w:instrText>
      </w:r>\n`;
    }

    xml += `      <w:r>
${rpr('Times New Roman', fontSizeHalfPt)}
        <w:fldChar w:fldCharType="end"/>
      </w:r>\n`;
    return xml;
  }

  function renderSimpleMathOoxml(tok, isBijoy, fontSizeHalfPt, isBold) {
    const boldTag = isBold ? '<w:b/>' : '';
    const isBn = tok.isBengali || (typeof window.BanglaConverter !== 'undefined'
      && window.BanglaConverter.hasBengaliText && window.BanglaConverter.hasBengaliText(tok.text));
    const fontName = isBn ? (isBijoy ? 'SutonnyMJ' : 'Kalpurush') : 'Times New Roman';
    const italicTag = tok.italic && !isBn ? '<w:i/><w:iCs/>' : '';
    return `      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="${fontName}" w:hAnsi="${fontName}" w:cs="${fontName}"/>
          <w:sz w:val="${fontSizeHalfPt}"/>
          <w:szCs w:val="${fontSizeHalfPt}"/>
          ${boldTag}
          ${italicTag}
        </w:rPr>
        <w:t xml:space="preserve">${escapeXml(tok.text)}</w:t>
      </w:r>\n`;
  }

  function renderRunsForOoxmlPlain(text, isBijoy, fontSizeHalfPt, isBold) {
    if (!text || !text.trim()) return '';

    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    let runsXml = '';

    for (const part of parts) {
      if (!part) continue;
      const bold = isBold || (part.startsWith('**') && part.endsWith('**'));
      const cleanText = (part.startsWith('**') && part.endsWith('**')) ? part.slice(2, -2) : part;

      const mathRuns = parseRichRuns(cleanText);

      for (const mRun of mathRuns) {
        const segments = window.BanglaConverter && typeof window.BanglaConverter.splitMixedBengaliAndEnglish === 'function'
          ? window.BanglaConverter.splitMixedBengaliAndEnglish(mRun.text)
          : [{ type: 'bengali', text: mRun.text }];

        for (const seg of segments) {
          const boldTag = bold ? '<w:b/>' : '';
          const vertAlignTag = mRun.isSubscript
            ? '<w:vertAlign w:val="subscript"/>'
            : (mRun.isSuperscript ? '<w:vertAlign w:val="superscript"/>' : '');

          if (seg.type === 'english') {
            runsXml += `      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
          <w:sz w:val="${fontSizeHalfPt}"/>
          <w:szCs w:val="${fontSizeHalfPt}"/>
          ${boldTag}
          ${vertAlignTag}
        </w:rPr>
        <w:t xml:space="preserve">${escapeXml(seg.text)}</w:t>
      </w:r>\n`;
          } else {
            const targetText = isBijoy && window.BanglaConverter ? window.BanglaConverter.unicodeToBijoy(seg.text) : seg.text;
            const fontName = isBijoy ? 'SutonnyMJ' : 'Kalpurush';
            runsXml += `      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="${fontName}" w:hAnsi="${fontName}" w:cs="${fontName}"/>
          <w:sz w:val="${fontSizeHalfPt}"/>
          <w:szCs w:val="${fontSizeHalfPt}"/>
          ${boldTag}
          ${vertAlignTag}
        </w:rPr>
        <w:t xml:space="preserve">${escapeXml(targetText)}</w:t>
      </w:r>\n`;
          }
        }
      }
    }
    return runsXml;
  }

  async function downloadWordDocument(format) {
    const text = state.unicodeText;
    if (!text || !text.trim()) {
      showToast('ডাউনলোড করার মতো কোনো টেক্সট নেই', 'warning');
      return;
    }

    const pageSizeVal = elements.pageSizeSelect ? elements.pageSizeSelect.value : 'a4';
    const marginVal = elements.pageMarginSelect ? elements.pageMarginSelect.value : 'normal';
    const fontSizeVal = elements.fontSizeSelect ? elements.fontSizeSelect.value : '14';
    const fontSizePt = parseInt(fontSizeVal, 10) || 14;
    const fontSizeHalfPt = fontSizePt * 2;

    const PAGE_SIZES = {
      'a4': { w: 11906, h: 16838, name: 'A4' },
      'legal': { w: 12240, h: 20160, name: 'Legal' },
      'letter': { w: 12240, h: 15840, name: 'Letter' }
    };

    const MARGINS = {
      'normal': { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      'narrow': { top: 720, right: 720, bottom: 720, left: 720 },
      'moderate': { top: 1080, right: 1080, bottom: 1080, left: 1080 },
      'wide': { top: 1800, right: 1800, bottom: 1800, left: 1800 }
    };

    const pageDim = PAGE_SIZES[pageSizeVal] || PAGE_SIZES['a4'];
    const pageMar = MARGINS[marginVal] || MARGINS['normal'];
    const printableWidth = pageDim.w - pageMar.left - pageMar.right;

    const blocks = parseDocumentBlocks(text);

    // FORMAT 1: Native Microsoft Word .DOC (RTF binary, SutonnyMJ Bijoy)
    if (format === 'doc') {
      showToast(`নেটিভ ওয়ার্ড .DOC (${pageDim.name}) তৈরি হচ্ছে...`, 'info');

      let rtfBody = '';
      for (const block of blocks) {
        if (block.type === 'paragraph') {
          const trimmed = block.text.trim();
          if (!trimmed) {
            rtfBody += `\\pard\\plain\\sb0\\sa0\\sl240\\slmult1 {\\f0\\fs${fontSizeHalfPt} \\par}\r\n`;
          } else {
            const runsRtf = renderRunsForRtf(block.text, true, fontSizeHalfPt);
            rtfBody += `\\pard\\plain\\sb0\\sa0\\sl240\\slmult1 ${runsRtf}\\par\r\n`;
          }
        } else if (block.type === 'table') {
          const rows = block.rows;
          if (rows.length === 0) continue;
          const maxCols = Math.max(...rows.map(r => r.length));
          const colWidth = Math.floor(printableWidth / maxCols);

          for (const row of rows) {
            let rowDef = `\\trowd\\trgaph108\\trleft-108 `;
            for (let c = 0; c < maxCols; c++) {
              const rightEdge = (c + 1) * colWidth;
              rowDef += `\\clbrdrt\\brdrs\\brdrw10\\clbrdrl\\brdrs\\brdrw10\\clbrdrb\\brdrs\\brdrw10\\clbrdrr\\brdrs\\brdrw10 \\cellx${rightEdge} `;
            }
            rtfBody += rowDef + '\r\n';

            for (let c = 0; c < maxCols; c++) {
              const cellText = row[c] || '';
              const cellRuns = renderRunsForRtf(cellText, true, fontSizeHalfPt);
              rtfBody += `\\pard\\plain\\intbl\\sb0\\sa0\\sl240\\slmult1 ${cellRuns || ' '}\\cell\r\n`;
            }
            rtfBody += `\\row\r\n`;
          }
          rtfBody += `\\pard\\plain\\sb0\\sa0\\sl240\\slmult1 \\par\r\n`;
        }
      }

      const rtfDocument = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang1033
{\\fonttbl
{\\f0\\fnil\\fcharset0 SutonnyMJ;}
{\\f1\\froman\\fcharset0 Times New Roman;}
}
{\\colortbl;\\red0\\green0\\blue0;}
\\viewkind4\\uc1
\\sectd\\pgwsxn${pageDim.w}\\pghsxn${pageDim.h}\\marglsxn${pageMar.left}\\margrsxn${pageMar.right}\\margtsxn${pageMar.top}\\margbsxn${pageMar.bottom}\\guttersxn0
${rtfBody}
}`;

      const blob = new Blob([rtfDocument], { type: 'application/msword' });
      triggerDownload(blob, `Fayzar_Bijoy_${pageDim.name}_${Date.now()}.doc`);
      showToast(`বিজয় .DOC (${pageDim.name} - ${fontSizePt}pt) সফলভাবে ডাউনলোড হয়েছে!`, 'success');
      return;
    }

    // FORMAT 2 & 3: Native Microsoft Word .DOCX (OOXML, Bijoy or Unicode)
    if (format === 'bijoy_docx' || format === 'unicode_docx') {
      const isBijoy = format === 'bijoy_docx';
      showToast(`নেটিভ ওয়ার্ড .DOCX (${isBijoy ? 'বিজয়' : 'ইউনিকোড'} - ${pageDim.name}) তৈরি হচ্ছে...`, 'info');

      try {
        const blob = await createDocxBlob(text, isBijoy, { pageSize: pageSizeVal, margin: marginVal, fontSize: fontSizeVal });
        const prefix = isBijoy ? 'Fayzar_Bijoy' : 'Fayzar_Unicode';
        triggerDownload(blob, `${prefix}_${pageDim.name}_${Date.now()}.docx`);
        showToast(`${isBijoy ? 'বিজয়' : 'ইউনিকোড'} .DOCX (${pageDim.name} - ${fontSizePt}pt) ডাউনলোড সম্পন্ন!`, 'success');
      } catch (err) {
        showToast(`DOCX তৈরি করতে সমস্যা: ${err.message}`, 'error');
      }
    }
  }

  async function createDocxBlob(text, isBijoy = false, customOptions = {}) {
    if (typeof JSZip === 'undefined') {
      throw new Error('JSZip লাইব্রেরি লোড হয়নি, অনুগ্রহ করে পেজটি রিফ্রেশ দিন');
    }

    const pageSizeVal = customOptions.pageSize || (elements.pageSizeSelect ? elements.pageSizeSelect.value : 'a4');
    const marginVal = customOptions.margin || (elements.pageMarginSelect ? elements.pageMarginSelect.value : 'normal');
    const fontSizeVal = customOptions.fontSize || (elements.fontSizeSelect ? elements.fontSizeSelect.value : '14');
    const fontSizePt = parseInt(fontSizeVal, 10) || 14;
    const fontSizeHalfPt = fontSizePt * 2;

    const PAGE_SIZES = {
      'a4': { w: 11906, h: 16838, name: 'A4' },
      'legal': { w: 12240, h: 20160, name: 'Legal' },
      'letter': { w: 12240, h: 15840, name: 'Letter' }
    };

    const MARGINS = {
      'normal': { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      'narrow': { top: 720, right: 720, bottom: 720, left: 720 },
      'moderate': { top: 1080, right: 1080, bottom: 1080, left: 1080 },
      'wide': { top: 1800, right: 1800, bottom: 1800, left: 1800 }
    };

    const pageDim = PAGE_SIZES[pageSizeVal] || PAGE_SIZES['a4'];
    const pageMar = MARGINS[marginVal] || MARGINS['normal'];
    const printableWidth = pageDim.w - pageMar.left - pageMar.right;

    const blocks = parseDocumentBlocks(text);

    let bodyContentXml = '';

    for (const block of blocks) {
      if (block.type === 'paragraph') {
        const trimmed = block.text.trim();
        if (!trimmed) {
          bodyContentXml += `    <w:p>
      <w:pPr>
        <w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="${isBijoy ? 'SutonnyMJ' : 'Kalpurush'}" w:hAnsi="${isBijoy ? 'SutonnyMJ' : 'Kalpurush'}" w:cs="${isBijoy ? 'SutonnyMJ' : 'Kalpurush'}"/>
          <w:sz w:val="${fontSizeHalfPt}"/>
          <w:szCs w:val="${fontSizeHalfPt}"/>
        </w:rPr>
        <w:t xml:space="preserve"> </w:t>
      </w:r>
    </w:p>\n`;
        } else {
          const runsXml = renderRunsForOoxml(block.text, isBijoy, fontSizeHalfPt);
          bodyContentXml += `    <w:p>
      <w:pPr>
        <w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>
      </w:pPr>
${runsXml}    </w:p>\n`;
        }
      } else if (block.type === 'table') {
        const rows = block.rows;
        if (rows.length === 0) continue;
        const maxCols = Math.max(...rows.map(r => r.length));
        const colWidth = Math.floor(printableWidth / maxCols);

        const gridColsXml = Array(maxCols).fill(0).map(() => `<w:gridCol w:w="${colWidth}"/>`).join('');
        const rowsXml = rows.map((row, rIdx) => {
          const isHeader = (rIdx === 0);
          const trPr = isHeader ? '<w:trPr><w:tblHeader/></w:trPr>' : '';
          const cellsXml = Array(maxCols).fill(0).map((_, c) => {
            const cellText = row[c] || '';
            const cellRuns = renderRunsForOoxml(cellText, isBijoy, fontSizeHalfPt);
            return `        <w:tc>
          <w:tcPr>
            <w:tcW w:w="${colWidth}" w:type="dxa"/>
            <w:tcBorders>
              <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
              <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
              <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
              <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
            </w:tcBorders>
            <w:vAlign w:val="top"/>
          </w:tcPr>
          <w:p>
            <w:pPr>
              <w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>
            </w:pPr>
${cellRuns || '            <w:r><w:t xml:space="preserve"> </w:t></w:r>'}
          </w:p>
        </w:tc>`;
          }).join('\n');

          return `      <w:tr>${trPr}\n${cellsXml}\n      </w:tr>`;
        }).join('\n');

        bodyContentXml += `    <w:tbl>
      <w:tblPr>
        <w:tblStyle w:val="TableGrid"/>
        <w:tblW w:w="0" w:type="auto"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
          <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
          <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
          <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        </w:tblBorders>
        <w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>
      </w:tblPr>
      <w:tblGrid>${gridColsXml}</w:tblGrid>
${rowsXml}
    </w:tbl>
    <w:p/>\n`;
      }
    }

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  mc:Ignorable="w14">
  <w:body>
${bodyContentXml}
    <w:sectPr>
      <w:pgSz w:w="${pageDim.w}" w:h="${pageDim.h}"/>
      <w:pgMar w:top="${pageMar.top}" w:right="${pageMar.right}" w:bottom="${pageMar.bottom}" w:left="${pageMar.left}" w:header="709" w:footer="709" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="${isBijoy ? 'SutonnyMJ' : 'Times New Roman'}" w:hAnsi="${isBijoy ? 'SutonnyMJ' : 'Times New Roman'}" w:cs="${isBijoy ? 'SutonnyMJ' : 'Kalpurush'}"/>
        <w:sz w:val="${fontSizeHalfPt}"/>
        <w:szCs w:val="${fontSizeHalfPt}"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:pPr>
      <w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>
    </w:pPr>
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

    const zip = new JSZip();
    zip.file("[Content_Types].xml", contentTypesXml);
    zip.folder("_rels").file(".rels", relsXml);
    zip.folder("word").file("document.xml", documentXml);
    zip.folder("word").file("styles.xml", stylesXml);
    zip.folder("word").folder("_rels").file("document.xml.rels", docRelsXml);

    return await zip.generateAsync({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function setLoading(loading, text = '', percent = 0) {
    state.isProcessing = loading;
    elements.convertBtn.disabled = loading;
    if (loading) {
      elements.progressContainer.classList.remove('hidden');
      elements.progressContainer.classList.add('flex');
      elements.progressStepText.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-indigo-500 mr-2"></i> ${text}`;
      elements.progressBar.style.width = `${percent}%`;
      if (elements.progressPercent) elements.progressPercent.textContent = `${Math.round(percent)}%`;
      elements.convertBtnText.textContent = 'প্রসেসিং হচ্ছে...';
      if (elements.successCard) elements.successCard.classList.add('hidden');
    } else {
      elements.progressContainer.classList.add('hidden');
      elements.progressContainer.classList.remove('flex');
      elements.convertBtnText.textContent = 'AI দিয়ে কনভার্ট ও ওয়ার্ড ফাইল তৈরি করুন';
    }
  }

  function toggleModal(modal, show) {
    if (!modal) return;
    if (show) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    } else {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  function saveByokKey() {
    const key = elements.byokInput.value.trim();
    if (!key) {
      showToast('অনুগ্রহ করে একটি সঠিক Gemini API Key প্রদান করুন', 'warning');
      return;
    }
    state.byokApiKey = key;
    state.demoMode = false;
    localStorage.setItem(STORAGE_KEYS.BYOK_KEY, key);
    localStorage.setItem('bengali_ocr_gemini_key', key);
    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, 'false');
    if (elements.geminiKeyInput) elements.geminiKeyInput.value = key;
    if (elements.demoToggle) elements.demoToggle.checked = false;

    updateBadges();
    toggleModal(elements.byokModal, false);
    showToast('API Key সংরক্ষিত হয়েছে! লাইভ কনভার্সন শুরু হচ্ছে...', 'success');
    startOcrConversion();
  }

  function saveSettings() {
    state.demoMode = elements.demoToggle.checked;
    state.gasUrl = elements.gasUrlInput.value.trim();
    state.byokApiKey = elements.geminiKeyInput.value.trim();
    state.selectedModel = elements.modelSelect.value || 'auto';

    if (state.byokApiKey || state.gasUrl) {
      state.demoMode = elements.demoToggle.checked;
    }

    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, state.demoMode.toString());
    localStorage.setItem(STORAGE_KEYS.GAS_URL, state.gasUrl);
    localStorage.setItem('bengali_ocr_gas_url', state.gasUrl);
    localStorage.setItem(STORAGE_KEYS.BYOK_KEY, state.byokApiKey);
    localStorage.setItem('bengali_ocr_gemini_key', state.byokApiKey);
    localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, state.selectedModel);

    updateBadges();
    toggleModal(elements.settingsModal, false);
    showToast('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!', 'success');
  }

  function resetCredits() {
    state.freeUsesCount = 0;
    localStorage.setItem(STORAGE_KEYS.FREE_COUNT, '0');
    updateBadges();
    showToast('ফ্রি ক্রেডিট রিসেট করা হয়েছে (৫ টি ব্যবহার প্রাপ্ত)', 'success');
  }

  function toBengaliNumber(num) {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (d) => bnDigits[parseInt(d)]);
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function showToast(message, type = 'info') {
    if (typeof window.showToastNotification === 'function') {
      window.showToastNotification(message, type);
      return;
    }
    const toast = document.createElement('div');
    const bgColors = {
      info: 'bg-slate-900 text-slate-100 border-slate-700',
      success: 'bg-emerald-950 text-emerald-100 border-emerald-700',
      warning: 'bg-amber-950 text-amber-100 border-amber-700',
      error: 'bg-rose-950 text-rose-100 border-rose-700'
    };
    toast.className = `fixed bottom-5 right-5 z-50 p-3.5 px-4 rounded-2xl border shadow-2xl flex items-center gap-2.5 text-xs transition-all duration-300 ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.FayzarAiOcrEngine = {
    init,
    startOcrConversion,
    downloadWordDocument
  };

})(typeof window !== 'undefined' ? window : this);
