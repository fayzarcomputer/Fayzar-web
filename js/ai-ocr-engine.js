/**
 * ============================================================================
 * Fayzar Computer v2 - AI Bengali OCR & Math (LaTeX) to Bijoy .doc Engine
 * ============================================================================
 * Features:
 * 1. Image OCR extraction using Google Gemini 1.5/2.0 Flash API (Unicode & LaTeX).
 * 2. Deep Integration with Fayzar Bangla Converter (window.BanglaConverter).
 * 3. 1-Click Export to Bijoy .doc (SutonnyMJ) and Unicode .docx Word files.
 * 4. 1-Click Send to Fayzar Main Converter.
 * 5. Auto Model Discovery, BYOK Key management & Offline Demo Simulation mode.
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
  const GEMINI_PROMPT = `You are an elite Bengali Professional Document Composer, Question Paper Typist, and LaTeX-to-Word formatting specialist.
Your goal is to extract and compose a COMPLETE, UNTRUNCATED, BEAUTIFULLY STRUCTURED Bengali document / exam question paper from this entire file.

CRITICAL COMPOSITION & COMPLETION RULES:
1. FULL COMPLETE EXTRACTION (NO HALF CUTS):
   - You MUST extract and format ALL PAGES from page 1 to the very last page completely.
   - DO NOT stop halfway, DO NOT truncate, and DO NOT summarize or skip questions.
   - Process all questions, figures, values, sections, and paragraphs continuously to the very end of the file.

2. CLEAN PROFESSIONAL OUTPUT (NO OCR METADATA):
   - NEVER output raw scan artifacts like "==Start of OCR==", "==End of OCR==", page markers, or conversational preamble.
   - Reconstruct disjointed lines into smooth, coherent sentences and complete paragraphs.

3. CREATIVE QUESTION PAPERS (সৃজনশীল প্রশ্নপত্র) & STIMULUS (উদ্দীপক):
   - If there is a diagram, transformer, circuit, chart, or data box (e.g. Input/Output, পাকসংখ্যা, ভোল্টেজ, কারেন্ট, রোধ), format the stimulus neatly in a structured Markdown table or clean stem block:
     | ইনপুট (Input) | আউটপুট (Output) |
     |---|---|
     | $V_p = 200\\text{ V}$ | $n_s = 6000$ |
     | $I_p = 60\\text{ A}$ | $n_p = 800$ |
   - Format sub-questions with their corresponding marks (মান) directly on the same line:
     ক. সলিনয়েড কাকে বলে?   ১
     খ. এক্স-রে এর পরিবর্তে আল্ট্রাসনোগ্রাম করা হয় কেন?   ২
     গ. উদ্দীপকের তথ্যানুযায়ী আউটপুটে তড়িৎ বিভব নির্ণয় করো।   ৩
     ঘ. তড়িৎ মোটরটি কার্যকর হবে কিনা—গাণিতিকভাবে ব্যাখ্যা করো।   ৪
   - NEVER put marks (১, ২, ৩, ৪) on isolated lines at the bottom!

4. MATHEMATICAL & SCIENTIFIC NOTATION:
   - Write clear mathematical formulas and physics variables (e.g., $n_s = 6000$, $n_p = 800$, $V_p = 200\\text{ V}$, $P = 12.5\\text{ kW}$, $2x^2 + 5x - 3 = 0$, $\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$).

5. TABLES & GRIDS:
   - Use standard Markdown tables for any tabular data, columns, mark sheets, or vouchers.

6. HEADINGS & TITLES:
   - Mark main titles and institute names in **bold** (e.g. **ফুলবাড়ী সরকারি পাইলট উচ্চ বিদ্যালয়**).

7. ACCURATE BENGALI TYPOGRAPHY:
   - Use 100% correct Bengali spelling (যুক্তবর্ণ, ণ-ত্ব/ষ-ত্ব, দাড়ি, কমা, হাইফেন). Keep English terms, units, and symbols (kW, V, A, W, Input, Output) clean in English.
8. Return ONLY the finalized document text. Do not add any chat preamble or markdown code blocks.`;

  const savedKey = localStorage.getItem(STORAGE_KEYS.BYOK_KEY) || localStorage.getItem('bengali_ocr_gemini_key') || '';
  const savedGas = localStorage.getItem(STORAGE_KEYS.GAS_URL) || localStorage.getItem('bengali_ocr_gas_url') || '';
  const hasValidConfig = Boolean(savedKey || savedGas);

  const state = {
    freeUsesCount: parseInt(localStorage.getItem(STORAGE_KEYS.FREE_COUNT) || '0', 10),
    byokApiKey: savedKey,
    gasUrl: savedGas,
    demoMode: hasValidConfig ? false : (localStorage.getItem(STORAGE_KEYS.DEMO_MODE) !== null ? localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === 'true' : true),
    selectedModel: localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) || 'auto',
    selectedFile: null,
    imageBase64: '',
    imageMimeType: '',
    isProcessing: false,
    unicodeText: '',
    bijoyText: '',
    activeViewTab: 'unicode' // 'unicode' | 'bijoy'
  };

  let elements = {};

  function init() {
    bindElements();
    if (!elements.panel) return;
    loadSettings();
    updateBadges();
    setupEvents();
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
      
      convertBtn: document.getElementById('ai-ocr-convert-btn'),
      convertBtnText: document.getElementById('ai-ocr-convert-btn-text'),
      progressContainer: document.getElementById('ai-ocr-progress-container'),
      progressStepText: document.getElementById('ai-ocr-progress-step-text'),
      progressBar: document.getElementById('ai-ocr-progress-bar'),
      progressPercent: document.getElementById('ai-ocr-progress-percent'),
      
      // Direct Download Success Card
      successCard: document.getElementById('ai-ocr-success-card'),
      togglePreviewBtn: document.getElementById('ai-ocr-toggle-preview-btn'),
      togglePreviewText: document.getElementById('ai-ocr-toggle-preview-text'),
      collapsiblePreview: document.getElementById('ai-ocr-collapsible-preview'),
      
      // Badges
      creditBadge: document.getElementById('ai-ocr-credit-badge'),
      modeBadge: document.getElementById('ai-ocr-mode-badge'),
      
      // Text Areas & Preview
      outputUnicodeArea: document.getElementById('ai-ocr-output-unicode'),
      outputBijoyArea: document.getElementById('ai-ocr-output-bijoy'),
      
      // Action Buttons
      copyBtn: document.getElementById('ai-ocr-copy-btn'),
      sendToConverterBtn: document.getElementById('ai-ocr-send-to-converter-btn'),
      downloadDocBtn: document.getElementById('ai-ocr-download-doc-btn'),
      downloadBijoyDocxBtn: document.getElementById('ai-ocr-download-bijoy-docx-btn'),
      downloadDocxBtn: document.getElementById('ai-ocr-download-docx-btn'),
      
      // Page Setup Elements
      pageSizeSelect: document.getElementById('ai-ocr-page-size'),
      pageMarginSelect: document.getElementById('ai-ocr-page-margin'),
      fontSizeSelect: document.getElementById('ai-ocr-font-size'),
      lineSpacingSelect: document.getElementById('ai-ocr-line-spacing'),
      
      // Modals
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
    // Drag and Drop
    ['dragenter', 'dragover'].forEach(name => {
      elements.dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        elements.dropZone.classList.add('border-indigo-500', 'bg-indigo-50/20');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      elements.dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        elements.dropZone.classList.remove('border-indigo-500', 'bg-indigo-50/20');
      });
    });

    elements.dropZone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });

    elements.fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    elements.removeImageBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearImage();
    });

    // Convert Trigger
    elements.convertBtn.addEventListener('click', startOcrConversion);

    // Collapsible Preview Toggle
    if (elements.togglePreviewBtn) {
      elements.togglePreviewBtn.addEventListener('click', () => {
        const isHidden = elements.collapsiblePreview.classList.contains('hidden');
        if (isHidden) {
          elements.collapsiblePreview.classList.remove('hidden');
          elements.collapsiblePreview.classList.add('flex');
          elements.togglePreviewText.textContent = 'প্রিভিউ লুকান';
        } else {
          elements.collapsiblePreview.classList.add('hidden');
          elements.collapsiblePreview.classList.remove('flex');
          elements.togglePreviewText.textContent = 'টেক্সট প্রিভিউ দেখুন';
        }
      });
    }

    // Actions
    if (elements.copyBtn) elements.copyBtn.addEventListener('click', copyCurrentText);
    if (elements.sendToConverterBtn) elements.sendToConverterBtn.addEventListener('click', sendToMainConverter);
    
    // Download Word Documents
    if (elements.downloadDocBtn) {
      elements.downloadDocBtn.addEventListener('click', () => downloadWordDocument('doc'));
    }
    if (elements.downloadBijoyDocxBtn) {
      elements.downloadBijoyDocxBtn.addEventListener('click', () => downloadWordDocument('bijoy_docx'));
    }
    if (elements.downloadDocxBtn) {
      elements.downloadDocxBtn.addEventListener('click', () => downloadWordDocument('unicode_docx'));
    }

    // Modals
    elements.openSettingsBtn.addEventListener('click', () => toggleModal(elements.settingsModal, true));
    elements.closeSettingsBtn.addEventListener('click', () => toggleModal(elements.settingsModal, false));
    elements.saveSettingsBtn.addEventListener('click', saveSettings);
    elements.resetCreditsBtn.addEventListener('click', resetCredits);
    elements.cancelByokBtn.addEventListener('click', () => toggleModal(elements.byokModal, false));
    elements.saveByokBtn.addEventListener('click', saveByokKey);
  }

  function handleFile(file) {
    const isImage = file.type.match('image.*');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (!isImage && !isPdf) {
      showToast('শুধুমাত্র PDF অথবা ইমেজ ফাইল (PNG, JPG, WEBP) নির্বাচন করুন!', 'error');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      showToast('ফাইলের সাইজ ৫০ মেগাবাইটের বেশি হতে পারবে না!', 'error');
      return;
    }

    state.selectedFile = file;
    state.imageMimeType = isPdf ? 'application/pdf' : (file.type || 'image/jpeg');
    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = formatBytes(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      state.imageBase64 = e.target.result;
      if (isPdf) {
        elements.imagePreview.classList.add('hidden');
        if (elements.pdfPreviewIcon) elements.pdfPreviewIcon.classList.remove('hidden');
      } else {
        elements.imagePreview.src = state.imageBase64;
        elements.imagePreview.classList.remove('hidden');
        if (elements.pdfPreviewIcon) elements.pdfPreviewIcon.classList.add('hidden');
      }
      elements.uploadPrompt.classList.add('hidden');
      elements.previewContainer.classList.remove('hidden');
      elements.convertBtn.disabled = false;
      if (elements.successCard) elements.successCard.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    state.selectedFile = null;
    state.imageBase64 = '';
    state.imageMimeType = '';
    elements.fileInput.value = '';
    elements.imagePreview.src = '';
    elements.previewContainer.classList.add('hidden');
    elements.uploadPrompt.classList.remove('hidden');
    elements.convertBtn.disabled = true;
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
    if (!state.imageBase64) {
      showToast('অনুগ্রহ করে প্রথমে একটি ছবি আপলোড করুন', 'warning');
      return;
    }

    // 1. If direct Gemini API Key is provided, always run live API directly
    if (state.byokApiKey && state.byokApiKey.trim().length > 0) {
      await runDirectGeminiOcr(state.byokApiKey.trim());
      return;
    }

    // 2. If GAS proxy URL is configured and has free credits
    if (state.gasUrl && state.gasUrl.trim().length > 0 && state.freeUsesCount < MAX_FREE_USES) {
      await runGasProxyOcr();
      return;
    }

    // 3. If in Demo Mode and no API Key
    if (state.demoMode) {
      await runDemoSimulation();
      return;
    }

    // 4. Prompt for API Key
    toggleModal(elements.byokModal, true);
  }

  async function runDirectGeminiOcr(apiKey) {
    setLoading(true, 'Gemini AI ইঞ্জিনের সাথে কানেক্ট করা হচ্ছে...', 30);

    const cleanBase64 = state.imageBase64.includes('base64,') 
      ? state.imageBase64.split('base64,')[1] 
      : state.imageBase64;

    const payload = {
      contents: [
        {
          parts: [
            { text: GEMINI_PROMPT },
            {
              inlineData: {
                mimeType: state.imageMimeType || 'image/jpeg',
                data: cleanBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 65536
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ]
    };

    let candidateModels = [
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.5-pro-latest',
      'gemini-2.0-flash-exp'
    ];

    if (state.selectedModel && state.selectedModel !== 'auto') {
      candidateModels = [state.selectedModel, ...candidateModels.filter(m => m !== state.selectedModel)];
    }

    let successText = null;
    let lastError = null;
    let workingModel = null;

    for (let i = 0; i < candidateModels.length; i++) {
      const model = candidateModels[i];
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      setLoading(true, `Gemini মডেল (${model}) দিয়ে বিশ্লেষণ করা হচ্ছে...`, 40 + i * 10);

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.status === 404) {
          console.warn(`Model ${model} returned 404, falling back to next...`);
          continue;
        }

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const errMsg = data.error?.message || `HTTP ${res.status}`;
          if (res.status === 400 && errMsg.includes('API_KEY_INVALID')) {
            throw new Error('Gemini API Key সঠিক নয়। অনুগ্রহ করে Google AI Studio থেকে সঠিক Key দিন।');
          } else if (res.status === 429) {
            throw new Error('API কোটা বা রেট লিমিট শেষ। কিছুক্ষণ পর চেষ্টা করুন।');
          } else {
            lastError = new Error(errMsg);
            continue;
          }
        }

        // Check for safety finish reason
        if (data.candidates && data.candidates.length > 0) {
          const candidate = data.candidates[0];
          if (candidate.finishReason === 'SAFETY') {
            throw new Error('Google Gemini Safety Filter ছবিটির টেক্সট ব্লক করেছে।');
          }
          if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            successText = candidate.content.parts.map(p => p.text || '').join('\n');
            workingModel = model;
            break;
          } else if (candidate.text) {
            successText = candidate.text;
            workingModel = model;
            break;
          }
        }

        if (data.promptFeedback && data.promptFeedback.blockReason) {
          throw new Error(`Google Gemini Block Reason: ${data.promptFeedback.blockReason}`);
        }

      } catch (err) {
        if (err.message.includes('API Key') || err.message.includes('কোটা') || err.message.includes('Safety Filter')) {
          throw err;
        }
        lastError = err;
      }
    }

    // If static candidates failed, try dynamic ListModels
    if (!successText) {
      try {
        setLoading(true, 'উপলব্ধ মডেল তালিকা সন্ধান করা হচ্ছে...', 85);
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (listRes.ok) {
          const listData = await listRes.json();
          const availableModels = (listData.models || [])
            .filter(m => (m.supportedGenerationMethods || []).includes('generateContent') && m.name)
            .map(m => m.name.replace('models/', ''));

          for (const dynModel of availableModels) {
            const dynEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${dynModel}:generateContent?key=${apiKey}`;
            const dynRes = await fetch(dynEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (dynRes.ok) {
              const dynData = await dynRes.json();
              if (dynData.candidates && dynData.candidates[0]?.content?.parts) {
                successText = dynData.candidates[0].content.parts.map(p => p.text || '').join('\n');
                workingModel = dynModel;
                break;
              }
            }
          }
        }
      } catch (dynErr) {
        console.warn('ListModels dynamic fallback error:', dynErr);
      }
    }

    setLoading(false);

    if (successText && successText.trim()) {
      handleExtractionSuccess(successText);
      showToast(`সফলভাবে রূপান্তর সম্পন্ন হয়েছে! [মডেল: ${workingModel}]`, 'success');
    } else {
      const msg = lastError ? lastError.message : 'Gemini থেকে কোনো টেক্সট পাওয়া যায়নি। ছবিটি পরিষ্কার করে আপলোড করুন।';
      showToast(`ত্রুটি: ${msg}`, 'error');
    }
  }

  async function runGasProxyOcr() {
    setLoading(true, 'Google Apps Script প্রক্সির মাধ্যমে পাঠানো হচ্ছে...', 35);
    try {
      const cleanBase64 = state.imageBase64.includes('base64,') 
        ? state.imageBase64.split('base64,')[1] 
        : state.imageBase64;

      const res = await fetch(state.gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          imageBase64: cleanBase64,
          mimeType: state.imageMimeType
        })
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'GAS Proxy Error');

      state.freeUsesCount += 1;
      localStorage.setItem(STORAGE_KEYS.FREE_COUNT, state.freeUsesCount.toString());
      updateBadges();

      handleExtractionSuccess(result.extractedText);
      showToast(`সফলভাবে এক্সট্রাক্ট করা হয়েছে! (${MAX_FREE_USES - state.freeUsesCount} টি ফ্রি ক্রেডিট বাকি)`, 'success');
    } catch (e) {
      showToast(`প্রক্সি ত্রুটি: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function runDemoSimulation() {
    setLoading(true, 'ইমেজ অপ্টিমাইজেশন ও নয়েজ ফিল্টারিং...', 30);
    await sleep(600);
    setLoading(true, 'বাংলা যুক্তবর্ণ ও গাণিতিক সমীকরণ রিকগনিশন...', 70);
    await sleep(700);

    const demoText = `**মেসার্স শাহ আলম ট্রেডার্স**
ফুলবাড়ী, দিনাজপুর। ফোন: 01717-101919

**বিষয়: পণ্য সরবরাহ বিবরণী ও মূল্য তালিকা**

| ক্রমিক | পণ্যের বিবরণ | পরিমাণ | একক দর (টাকা) | মোট মূল্য (টাকা) |
|---|---|---|---|---|
| ০১ | মিনিকেট চাল | ৫০ বস্তা | ৩,২০০/- | ১,৬০,০০০/- |
| ০২ | নাজিরশাইল চাল | ৩০ বস্তা | ৩,৫০০/- | ১,০৫,০০০/- |
| ০৩ | সয়াবিন তেল (৫ লিটার) | ২০ কার্টুন | ৪,২০০/- | ৮৪,০০০/- |
| ০৪ | মসুর ডাল (দেশি) | ১০ বস্তা | ৬,০০০/- | ৬০,০০০/- |

**সর্বমোট মূল্য: ৪,০৯,০০০/- (চার লক্ষ নয় হাজার টাকা মাত্র)**

১. গণিত সমীকরণ মডেল:
\\[ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\]`;

    handleExtractionSuccess(demoText);
    setLoading(false);
    showToast('অফলাইন ডেমো কনভার্সন সফল হয়েছে!', 'success');
  }

  function handleExtractionSuccess(unicodeText) {
    const cleaned = cleanOcrResponse(unicodeText);
    state.unicodeText = cleaned;
    if (elements.outputUnicodeArea) elements.outputUnicodeArea.value = cleaned;
    recalculateBijoyFromUnicode();

    // Show Success Download Card
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

  function clearAllOutput() {
    state.unicodeText = '';
    state.bijoyText = '';
    if (elements.outputUnicodeArea) elements.outputUnicodeArea.value = '';
    if (elements.outputBijoyArea) elements.outputBijoyArea.value = '';
    if (elements.successCard) {
      elements.successCard.classList.add('hidden');
      elements.successCard.classList.remove('flex');
    }
    showToast('আউটপুট ফিল্ড ক্লিয়ার করা হয়েছে', 'info');
  }

  async function copyCurrentText() {
    const text = state.unicodeText;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast('টেক্সট সফলভাবে ক্লিপবোর্ডে কপি করা হয়েছে!', 'success');
    } catch (e) {
      showToast('টেক্সট কপি সম্পন্ন হয়েছে!', 'success');
    }
  }

  async function copyCurrentText() {
    const text = state.activeViewTab === 'unicode' ? state.unicodeText : state.bijoyText;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${state.activeViewTab === 'unicode' ? 'ইউনিকোড' : 'বিজয়'} টেক্সট কপি করা হয়েছে!`, 'success');
    } catch (e) {
      showToast('টেক্সট কপি সম্পন্ন হয়েছে!', 'success');
    }
  }

  // 1-Click Send to Fayzar Main Converter Tab
  function sendToMainConverter() {
    if (!state.unicodeText) {
      showToast('কোনো টেক্সট পাওয়া যায়নি!', 'warning');
      return;
    }

    const mainSource = document.getElementById('source-text');
    const wizardSubTabBtn = document.getElementById('wizard-subtab-text-btn');

    if (mainSource) {
      mainSource.value = state.unicodeText;
      mainSource.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Switch to 'text' tab in tools.html
    const textTabBtn = document.querySelector('.tool-switch-btn[data-tool-tab="text"]');
    if (textTabBtn) {
      textTabBtn.click();
      if (wizardSubTabBtn) wizardSubTabBtn.click();
      showToast('টেক্সট সফলভাবে ফয়জার কনভার্টারে পাঠানো হয়েছে!', 'success');
    }
  }

  // CP1252 (Windows-1252) byte mapping table for RTF SutonnyMJ characters
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

  function cleanOcrResponse(rawText) {
    if (!rawText) return '';
    let text = rawText.trim();

    // Remove markdown code fences if present (e.g. ```markdown ... ``` or ```html ... ```)
    if (text.startsWith('```')) {
      text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
    }

    // Remove OCR scan artifacts & headers/footers
    text = text.replace(/^[=\-\s]*Start of OCR[^\n]*[=\-\s]*\n?/gim, '');
    text = text.replace(/^[=\-\s]*End of OCR[^\n]*[=\-\s]*\n?/gim, '');
    text = text.replace(/^[=\-\s]*Page\s*\d+[^\n]*[=\-\s]*\n?/gim, '');

    // Intelligently align question paper marks:
    // If lines are ক., খ., গ., ঘ. followed by isolated lines with ১, ২, ৩, ৪
    const rawLines = text.split('\n');
    const lines = [];
    let i = 0;
    while (i < rawLines.length) {
      const l = rawLines[i].trim();
      // Skip empty scan markers
      if (/^[=\-]{2,}/.test(l) && /ocr/i.test(l)) {
        i++;
        continue;
      }
      lines.push(rawLines[i]);
      i++;
    }

    const cleanedLines = [];
    i = 0;
    while (i < lines.length) {
      // Check if 4 questions are followed by 4 mark digits on isolated lines
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

    // 1. Replace standard LaTeX math commands with unicode equivalents
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

    // 2. Parse subscripts (e.g. n_s, n_{s}, V_p, I_p) and superscripts (e.g. x^2, x^{2})
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
      if (op === '_') {
        runs.push({ text: scriptVal, isSubscript: true });
      } else if (op === '^') {
        runs.push({ text: scriptVal, isSuperscript: true });
      }

      lastIdx = rx.lastIndex;
    }

    const post = clean.substring(lastIdx);
    if (post) runs.push({ text: post });

    return runs.length > 0 ? runs : [{ text: clean }];
  }

  function parseDocumentBlocks(text) {
    if (!text || !text.trim()) return [];

    // 1. If content contains HTML table or structured markup
    if (text.includes('<table') || text.includes('<TABLE')) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const body = doc.body;
        const blocks = [];

        for (const node of Array.from(body.childNodes)) {
          if (node.nodeType === 1) { // Element
            const tag = node.tagName.toLowerCase();
            if (tag === 'table') {
              const rows = [];
              const trs = node.querySelectorAll('tr');
              for (const tr of Array.from(trs)) {
                const cells = [];
                const tds = tr.querySelectorAll('th, td');
                for (const td of Array.from(tds)) {
                  cells.push(td.textContent.trim());
                }
                if (cells.length > 0) rows.push(cells);
              }
              if (rows.length > 0) {
                blocks.push({ type: 'table', rows });
              }
            } else {
              const textContent = node.textContent.trim();
              if (textContent) {
                const isHeading = /^h[1-6]$/.test(tag);
                blocks.push({
                  type: 'paragraph',
                  text: isHeading ? `**${textContent}**` : textContent
                });
              }
            }
          } else if (node.nodeType === 3 && node.textContent.trim()) {
            blocks.push({
              type: 'paragraph',
              text: node.textContent.trim()
            });
          }
        }

        if (blocks.length > 0) return blocks;
      } catch (e) {
        console.warn('DOM parsing failed, falling back to text parsing:', e);
      }
    }

    // 2. Markdown Table & Paragraph line parser
    const lines = text.split('\n');
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check if this line is part of a markdown table
      if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
        const tableLines = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        // Filter separator lines like |---|---|
        const parsedRows = [];
        for (const tLine of tableLines) {
          if (/^\|[\s\-:]+(\|[\s\-:]+)+\|$/.test(tLine)) {
            continue;
          }
          const cells = tLine.split('|').slice(1, -1).map(c => c.trim());
          if (cells.length > 0) {
            parsedRows.push(cells);
          }
        }

        if (parsedRows.length > 0) {
          blocks.push({
            type: 'table',
            rows: parsedRows
          });
          continue;
        }
      }

      // Normal paragraph
      blocks.push({
        type: 'paragraph',
        text: line
      });
      i++;
    }

    return blocks;
  }

  function renderRunsForRtf(text, isBijoy, fontSizeHalfPt) {
    if (!text || !text.trim()) return '';

    // Check for bold markdown
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    let rtf = '';

    for (const part of parts) {
      if (!part) continue;
      const isBold = part.startsWith('**') && part.endsWith('**');
      const cleanText = isBold ? part.slice(2, -2) : part;

      // Parse rich math runs (subscripts, superscripts, math symbols)
      const mathRuns = parseRichRuns(cleanText);

      for (const mRun of mathRuns) {
        const segments = window.BanglaConverter && typeof window.BanglaConverter.splitMixedBengaliAndEnglish === 'function'
          ? window.BanglaConverter.splitMixedBengaliAndEnglish(mRun.text)
          : [{ type: 'bengali', text: mRun.text }];

        for (const seg of segments) {
          const boldPrefix = isBold ? '\\b ' : '';
          const boldSuffix = isBold ? '\\b0 ' : '';
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

  function renderRunsForOoxml(text, isBijoy, fontSizeHalfPt) {
    if (!text || !text.trim()) return '';

    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    let runsXml = '';

    for (const part of parts) {
      if (!part) continue;
      const isBold = part.startsWith('**') && part.endsWith('**');
      const cleanText = isBold ? part.slice(2, -2) : part;

      const mathRuns = parseRichRuns(cleanText);

      for (const mRun of mathRuns) {
        const segments = window.BanglaConverter && typeof window.BanglaConverter.splitMixedBengaliAndEnglish === 'function'
          ? window.BanglaConverter.splitMixedBengaliAndEnglish(mRun.text)
          : [{ type: 'bengali', text: mRun.text }];

        for (const seg of segments) {
          const boldTag = isBold ? '<w:b/>' : '';
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

  // Download Word Document (Native .doc RTF / Native .docx OOXML) with Full Page Setup Engine & Table Support
  async function downloadWordDocument(format) {
    const text = state.unicodeText;
    if (!text || !text.trim()) {
      showToast('ডাউনলোড করার মতো কোনো টেক্সট নেই', 'warning');
      return;
    }

    // 1. Resolve User-Specified Page Setup Options
    const pageSizeVal = elements.pageSizeSelect ? elements.pageSizeSelect.value : 'a4';
    const marginVal = elements.pageMarginSelect ? elements.pageMarginSelect.value : 'normal';
    const fontSizeVal = elements.fontSizeSelect ? elements.fontSizeSelect.value : '14';
    const fontSizePt = parseInt(fontSizeVal, 10) || 14;
    const fontSizeHalfPt = fontSizePt * 2;

    // Twips measurements for RTF & OOXML (1 inch = 1440 twips / dxa)
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

    // =========================================================================
    // FORMAT 1: TRUE NATIVE MICROSOFT WORD .DOC (RTF Binary with Tables)
    // =========================================================================
    if (format === 'doc') {
      showToast(`নেটিভ ওয়ার্ড .DOC (${pageDim.name}) তৈরি হচ্ছে...`, 'info');

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
      showToast(`বিজয় .DOC (${pageDim.name} - ${fontSizePt}pt, ০pt Spacing) সফলভাবে ডাউনলোড হয়েছে!`, 'success');
      return;
    }

    // =========================================================================
    // FORMAT 2 & 3: TRUE NATIVE MICROSOFT WORD .DOCX (OOXML ZIP with Tables)
    // =========================================================================
    if (format === 'bijoy_docx' || format === 'unicode_docx') {
      const isBijoy = format === 'bijoy_docx';
      showToast(`নেটিভ ওয়ার্ড .DOCX (${isBijoy ? 'বিজয়' : 'ইউনিকোড'} - ${pageDim.name}) তৈরি হচ্ছে...`, 'info');

      if (typeof JSZip === 'undefined') {
        showToast('JSZip লাইব্রেরি লোড হয়নি, অনুগ্রুহ করে পেজটি রিফ্রেশ দিন', 'error');
        return;
      }

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

      const blob = await zip.generateAsync({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      });

      const prefix = isBijoy ? 'Fayzar_Bijoy' : 'Fayzar_Unicode';
      triggerDownload(blob, `${prefix}_${pageDim.name}_${Date.now()}.docx`);
      showToast(`${isBijoy ? 'বিজয়' : 'ইউনিকোড'} .DOCX (${pageDim.name} - ${fontSizePt}pt, ০pt Spacing) ডাউনলোড সম্পন্ন!`, 'success');
    }
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

  function escapeHtml(str) {
    return (str || '').replace(/&/g, "&amp;")
                       .replace(/</g, "&lt;")
                       .replace(/>/g, "&gt;")
                       .replace(/"/g, "&quot;")
                       .replace(/'/g, "&#039;");
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
      elements.convertBtnText.textContent = 'AI দিয়ে কনভার্ট ও ওয়ার্ড ফাইল তৈরি করুন';
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
    showToast('API Key সংরক্ষিত হয়েছে! লাইভ কনভার্সন শুরু হচ্ছে...', 'success');
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
    showToast('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!', 'success');
  }

  function resetCredits() {
    state.freeUsesCount = 0;
    localStorage.setItem(STORAGE_KEYS.FREE_COUNT, '0');
    updateBadges();
    showToast('ফ্রি ক্রেডিট রিসেট করা হয়েছে (৫ টি ব্যবহার প্রাপ্ত)', 'success');
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

  // Auto-init on DOM ready
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
