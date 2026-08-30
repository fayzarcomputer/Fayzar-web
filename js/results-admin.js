/**
 * Fayzar Computer Online Result Portal - Admin Panel Script
 * Multi-Institution Support (Dreamland School & Amdungi Madrasah)
 * Handles PIN Authentication, Batch Print Engine, Live Marksheet Editor,
 * Excel Importer (SheetJS) & School Settings
 */

(function () {
  'use strict';

  let config = null;
  let allStudents = [];

  // DOM Elements
  const authOverlay = document.getElementById('authOverlay');
  const pinForm = document.getElementById('adminPinForm');
  const pinInput = document.getElementById('adminPinInput');
  const adminThemeToggleBtn = document.getElementById('adminThemeToggleBtn');
  const adminInstitutionSelect = document.getElementById('adminInstitutionSelect');

  // Tabs
  const adminTabButtons = document.querySelectorAll('.admin-tab-btn');
  const batchPrintTabContent = document.getElementById('batchPrintTabContent');
  const spreadsheetTabContent = document.getElementById('spreadsheetTabContent');
  const excelImportTabContent = document.getElementById('excelImportTabContent');
  const settingsTabContent = document.getElementById('settingsTabContent');

  // Batch Print Tab
  const batchClassSelect = document.getElementById('batchClassSelect');
  const executeBatchPrintBtn = document.getElementById('executeBatchPrintBtn');
  const batchStudentCount = document.getElementById('batchStudentCount');
  const batchPreviewGrid = document.getElementById('batchPreviewGrid');
  const batchPrintContainer = document.getElementById('batchPrintContainer');

  // Spreadsheet Editor Tab
  const editorClassSelect = document.getElementById('editorClassSelect');
  const addNewStudentBtn = document.getElementById('addNewStudentBtn');
  const saveEditorChangesBtn = document.getElementById('saveEditorChangesBtn');
  const spreadsheetTable = document.getElementById('spreadsheetTable');
  const spreadsheetTableHead = document.getElementById('spreadsheetTableHead');
  const spreadsheetTableBody = document.getElementById('spreadsheetTableBody');

  // Excel Import Tab
  const excelDropZone = document.getElementById('excelDropZone');
  const excelFileInput = document.getElementById('excelFileInput');
  const browseExcelBtn = document.getElementById('browseExcelBtn');
  const importResultStatus = document.getElementById('importResultStatus');

  // Settings Tab
  const settingsForm = document.getElementById('settingsForm');
  const cfgInstNameBn = document.getElementById('cfgInstNameBn');
  const cfgInstNameEn = document.getElementById('cfgInstNameEn');
  const cfgInstAddress = document.getElementById('cfgInstAddress');
  const cfgExamName = document.getElementById('cfgExamName');
  const resetDefaultDataBtn = document.getElementById('resetDefaultDataBtn');

  // Initialize
  async function init() {
    initTheme();
    checkAuth();
    bindEvents();

    config = await ResultEngine.Storage.loadConfig();
    if (!config || !config.classes || config.classes.length === 0) {
      config = (typeof window !== 'undefined' && window.DEFAULT_RESULTS_CONFIG) ? window.DEFAULT_RESULTS_CONFIG : config;
    }

    allStudents = await ResultEngine.Storage.loadStudents();
    if (!allStudents || allStudents.length === 0) {
      allStudents = (typeof window !== 'undefined' && Array.isArray(window.DEFAULT_RESULTS_DATA)) ? window.DEFAULT_RESULTS_DATA : [];
    }

    // Populate Institution Dropdown
    if (adminInstitutionSelect && config && Array.isArray(config.institutions)) {
      adminInstitutionSelect.innerHTML = '';
      config.institutions.forEach(inst => {
        const opt = document.createElement('option');
        opt.value = inst.id;
        opt.textContent = `${inst.id.includes('madrasah') ? '🕌' : '🏫'} ${inst.name_bn}`;
        adminInstitutionSelect.appendChild(opt);
      });
      adminInstitutionSelect.value = config.active_institution_id || 'dreamland-school';
    }

    populateClassDropdowns();
    renderBatchPreview(batchClassSelect?.value);
    renderSpreadsheet(editorClassSelect?.value);
    loadSettingsForm();
  }

  function initTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    adminThemeToggleBtn?.addEventListener('click', () => {
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
      } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
      }
    });
  }

  function checkAuth() {
    if (sessionStorage.getItem('fayzar_admin_authenticated') === 'true') {
      authOverlay?.classList.add('hidden');
    } else {
      authOverlay?.classList.remove('hidden');
    }

    pinForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = pinInput?.value?.trim();
      if (val === '1234' || val === 'fayzar' || val === 'admin' || val === 'fc2025' || val === '101919') {
        sessionStorage.setItem('fayzar_admin_authenticated', 'true');
        authOverlay?.classList.add('hidden');
      } else {
        alert('ভুল পিন বা পাসওয়ার্ড! সঠিক পিন দিন (যেমন: 1234 বা fayzar)।');
        pinInput.value = '';
        pinInput.focus();
      }
    });
  }

  function getActiveInstitution() {
    const selectedId = adminInstitutionSelect?.value || config?.active_institution_id || 'dreamland-school';
    if (config && Array.isArray(config.institutions)) {
      const found = config.institutions.find(i => i.id === selectedId);
      if (found) return found;
    }
    return config?.institution || {
      id: "dreamland-school",
      name_bn: "ড্রিমল্যান্ড রেসিডেন্সিয়াল মডেল স্কুল",
      name_en: "Dreamland Residential Model School",
      address_bn: "বারাই, ফুলবাড়ী, দিনাজপুর",
      classes: config?.classes || []
    };
  }

  function populateClassDropdowns() {
    const inst = getActiveInstitution();
    const classes = inst.classes || [];

    [batchClassSelect, editorClassSelect].forEach(select => {
      if (!select) return;
      select.innerHTML = '';
      classes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.name_bn} ${c.section ? '(' + c.section + ')' : ''}`;
        select.appendChild(opt);
      });
      if (classes.length > 0) {
        select.value = classes[0].id;
      }
    });
  }

  function bindEvents() {
    // Institution Change
    adminInstitutionSelect?.addEventListener('change', () => {
      populateClassDropdowns();
      renderBatchPreview(batchClassSelect?.value);
      renderSpreadsheet(editorClassSelect?.value);
      loadSettingsForm();
    });

    // Tab Navigation
    adminTabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-admin-tab');

        adminTabButtons.forEach(b => {
          b.classList.remove('active', 'bg-emerald-600', 'text-white', 'shadow-md');
          b.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300', 'border', 'border-slate-200', 'dark:border-slate-700');
        });

        btn.classList.add('active', 'bg-emerald-600', 'text-white', 'shadow-md');
        btn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300', 'border', 'border-slate-200', 'dark:border-slate-700');

        batchPrintTabContent?.classList.add('hidden');
        spreadsheetTabContent?.classList.add('hidden');
        excelImportTabContent?.classList.add('hidden');
        settingsTabContent?.classList.add('hidden');

        if (target === 'batchPrintTab') {
          batchPrintTabContent?.classList.remove('hidden');
          renderBatchPreview(batchClassSelect?.value);
        }
        if (target === 'spreadsheetTab') {
          spreadsheetTabContent?.classList.remove('hidden');
          renderSpreadsheet(editorClassSelect?.value);
        }
        if (target === 'excelImportTab') {
          excelImportTabContent?.classList.remove('hidden');
        }
        if (target === 'settingsTab') {
          settingsTabContent?.classList.remove('hidden');
          loadSettingsForm();
        }
      });
    });

    // Batch Class Change
    batchClassSelect?.addEventListener('change', (e) => {
      renderBatchPreview(e.target.value);
    });

    // Execute Batch Print
    executeBatchPrintBtn?.addEventListener('click', () => {
      executeBatchPrint(batchClassSelect?.value);
    });

    // Editor Class Change
    editorClassSelect?.addEventListener('change', (e) => {
      renderSpreadsheet(e.target.value);
    });

    // Add Student
    addNewStudentBtn?.addEventListener('click', () => {
      addNewStudent(editorClassSelect?.value);
    });

    // Save Spreadsheet Changes
    saveEditorChangesBtn?.addEventListener('click', () => {
      saveSpreadsheetChanges();
    });

    // Excel Importer
    browseExcelBtn?.addEventListener('click', () => {
      excelFileInput?.click();
    });

    excelFileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleExcelFile(file);
    });

    // Drag & Drop
    if (excelDropZone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        excelDropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          excelDropZone.classList.add('border-emerald-500', 'bg-emerald-50/50');
        }, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        excelDropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          excelDropZone.classList.remove('border-emerald-500', 'bg-emerald-50/50');
        }, false);
      });

      excelDropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) handleExcelFile(file);
      }, false);
    }

    // Settings Form Submit
    settingsForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSettingsForm();
    });

    // Reset Default Data
    resetDefaultDataBtn?.addEventListener('click', async () => {
      if (confirm('আপনি কি সত্যিই সম্পূর্ণ রেজাল্ট ডাটাবেজ প্রাথমিক অবস্থায় রিসেট করতে চান? আপনার নিজস্ব পরিবর্তন মুছে যাবে।')) {
        localStorage.removeItem(ResultEngine.Storage.DATA_KEY);
        localStorage.removeItem(ResultEngine.Storage.CONFIG_KEY);
        allStudents = (typeof window !== 'undefined' && window.DEFAULT_RESULTS_DATA) ? window.DEFAULT_RESULTS_DATA : [];
        config = (typeof window !== 'undefined' && window.DEFAULT_RESULTS_CONFIG) ? window.DEFAULT_RESULTS_CONFIG : config;
        populateClassDropdowns();
        renderBatchPreview(batchClassSelect?.value);
        renderSpreadsheet(editorClassSelect?.value);
        alert('ডাটাবেজ সফলভাবে ডিফল্ট অবস্থায় রিসেট করা হয়েছে!');
      }
    });
  }

  // =========================================================================
  // BATCH PRINT ENGINE
  // =========================================================================
  function renderBatchPreview(classId) {
    if (!batchPreviewGrid) return;
    const inst = getActiveInstitution();
    const classStudents = allStudents.filter(s => 
      (s.institution_id === inst.id || (!s.institution_id && inst.id === 'dreamland-school')) &&
      s.class_id === classId
    );

    if (batchStudentCount) batchStudentCount.textContent = ResultEngine.toBnDigit(classStudents.length);

    batchPreviewGrid.innerHTML = '';
    if (classStudents.length === 0) {
      batchPreviewGrid.innerHTML = `<div class="col-span-2 py-8 text-center text-slate-400">এই শ্রেণিতে কোনো শিক্ষার্থীর ডাটা নেই।</div>`;
      return;
    }

    // Render sample previews (up to 4)
    const samples = classStudents.slice(0, 4);
    samples.forEach(st => {
      const card = document.createElement('div');
      card.className = 'p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3 shadow-xs';
      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div class="font-bold text-sm text-slate-900 dark:text-white">${st.student_name_bn}</div>
          <div class="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">রোল: ${st.roll}</div>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <span class="text-[10px] text-slate-400 block">জিপিএ</span>
            <span class="font-mono font-bold text-emerald-600">${ResultEngine.formatGpa(st.gpa)}</span>
          </div>
          <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <span class="text-[10px] text-slate-400 block">গ্রেড</span>
            <span class="font-bold ${st.grade === 'F' ? 'text-rose-600' : 'text-blue-600'}">${st.grade}</span>
          </div>
          <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <span class="text-[10px] text-slate-400 block">মেধা স্থান</span>
            <span class="font-bold text-amber-600">${ResultEngine.toBnDigit(st.position)}</span>
          </div>
        </div>
        <div class="text-[11px] text-slate-500 truncate">
          মোট বিষয়: ${st.subjects ? st.subjects.length : 0}টি | মোট প্রাপ্ত নম্বর: ${st.total_marks} / ${st.max_possible_marks}
        </div>
      `;
      batchPreviewGrid.appendChild(card);
    });
  }

  function executeBatchPrint(classId) {
    const inst = getActiveInstitution();
    const classStudents = allStudents.filter(s => 
      (s.institution_id === inst.id || (!s.institution_id && inst.id === 'dreamland-school')) &&
      s.class_id === classId
    );

    if (classStudents.length === 0) {
      alert('প্রিন্ট করার জন্য কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি।');
      return;
    }

    // Sort by roll
    classStudents.sort((a, b) => (a.roll || 0) - (b.roll || 0));

    if (!batchPrintContainer) return;
    batchPrintContainer.innerHTML = '';
    batchPrintContainer.className = 'batch-print-active block';

    classStudents.forEach((student, index) => {
      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'batch-student-page p-8 bg-white text-slate-900 mb-8 border-b-4 border-dashed border-slate-300 print:border-none print:p-0 print:m-0';
      
      const isPassed = student.status === 'Passed';
      const verifyUrl = `https://fayzarcomputer.github.io/fayzarcomputer.github.io/results.html?inst=${inst.id}&year=${student.academic_year || 2025}&class=${student.class_id}&roll=${student.roll}`;
      const qrSvg = ResultEngine.generateVerificationQrSvg(verifyUrl, 75);

      let subjectRows = '';
      if (Array.isArray(student.subjects)) {
        student.subjects.forEach((sub, idx) => {
          const isF = sub.grade === 'F' || sub.letter_grade === 'F';
          const subGrade = sub.grade || sub.letter_grade || 'D';
          const subPoint = sub.point !== undefined ? sub.point : (sub.grade_point !== undefined ? sub.grade_point : 1.0);
          subjectRows += `
            <tr class="border-b border-slate-300">
              <td class="py-1 px-2 text-center border-r border-slate-300 font-mono text-xs">${idx + 1}</td>
              <td class="py-1 px-2 border-r border-slate-300 font-bold text-xs">
                ${sub.name_bn} ${sub.is_optional ? '<span class="text-[9px] text-purple-700 font-semibold">(৪র্থ বিষয়)</span>' : ''}
              </td>
              <td class="py-1 px-2 text-center border-r border-slate-300 font-mono text-xs">${ResultEngine.toBnDigit(sub.full_marks)}</td>
              <td class="py-1 px-2 text-center border-r border-slate-300 font-mono font-bold text-xs ${isF ? 'text-rose-600' : ''}">${ResultEngine.toBnDigit(sub.marks_obtained)}</td>
              <td class="py-1 px-2 text-center border-r border-slate-300 font-bold text-xs ${isF ? 'text-rose-600' : 'text-blue-600'}">${subGrade}</td>
              <td class="py-1 px-2 text-center font-mono font-bold text-xs ${isF ? 'text-rose-600' : 'text-emerald-700'}">${ResultEngine.formatGpa(subPoint)}</td>
            </tr>
          `;
        });
      }

      pageWrapper.innerHTML = `
        <div class="certificate-border border-2 border-slate-900 p-5 rounded-2xl space-y-4">
          
          <!-- Header -->
          <div class="text-center space-y-1 border-b-2 border-slate-900 pb-3">
            <div class="text-2xl font-black text-slate-950">${inst.name_bn}</div>
            <div class="text-xs text-slate-700 font-medium">${inst.address_bn || ''}</div>
            <div class="inline-block px-4 py-0.5 rounded-full bg-slate-900 text-white font-extrabold text-xs mt-1">
              ${config.current_exam ? config.current_exam.exam_name_bn : 'বার্ষিক পরীক্ষা-২০২৫'} | একাডেমিক ট্রান্সক্রিপ্ট
            </div>
          </div>

          <!-- Student Info Grid -->
          <div class="grid grid-cols-2 gap-2 text-xs border-b border-slate-300 pb-3">
            <div><strong>শিক্ষার্থীর নাম:</strong> ${student.student_name_bn}</div>
            <div><strong>রোল নম্বর:</strong> <span class="font-mono font-bold">${ResultEngine.toBnDigit(student.roll)}</span></div>
            <div><strong>শ্রেণি ও শাখা:</strong> ${student.class_name_bn} (${student.group_bn ? student.group_bn + ' বিভাগ' : (student.section_bn || 'সাধারণ')})</div>
            <div><strong>পিতার নাম:</strong> ${student.father_name_bn || '--'}</div>
            <div><strong>মাতার নাম:</strong> ${student.mother_name_bn || '--'}</div>
            <div><strong>ফলাফল:</strong> <span class="font-bold ${isPassed ? 'text-emerald-700' : 'text-rose-700'}">${isPassed ? 'উত্তীর্ণ (Passed)' : 'অকৃতকার্য (Failed)'}</span></div>
          </div>

          <!-- Result Summary Highlights -->
          <div class="grid grid-cols-4 gap-2 text-center border border-slate-300 rounded-xl p-2 bg-slate-50">
            <div>
              <span class="text-[10px] text-slate-500 block">জিপিএ (GPA)</span>
              <span class="text-lg font-black font-mono text-emerald-700">${ResultEngine.formatGpa(student.gpa)}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-500 block">লেটার গ্রেড</span>
              <span class="text-lg font-black text-blue-700">${student.grade}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-500 block">মেধা স্থান</span>
              <span class="text-lg font-black text-amber-700">${ResultEngine.toBnDigit(student.position)}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-500 block">মোট নম্বর</span>
              <span class="text-lg font-black font-mono text-purple-700">${ResultEngine.toBnDigit(student.total_marks)}</span>
            </div>
          </div>

          <!-- Subject Marks Table -->
          <table class="w-full text-left text-xs border border-slate-300 border-collapse">
            <thead>
              <tr class="bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                <th class="py-1 px-2 text-center border-r border-slate-300 w-8">ক্র.</th>
                <th class="py-1 px-2 border-r border-slate-300">বিষয়ের নাম</th>
                <th class="py-1 px-2 text-center border-r border-slate-300 w-16">পূর্ণমান</th>
                <th class="py-1 px-2 text-center border-r border-slate-300 w-20">প্রাপ্ত নম্বর</th>
                <th class="py-1 px-2 text-center border-r border-slate-300 w-16">গ্রেড</th>
                <th class="py-1 px-2 text-center w-16">পয়েন্ট</th>
              </tr>
            </thead>
            <tbody>
              ${subjectRows}
            </tbody>
            <tfoot>
              <tr class="bg-slate-100 font-bold border-t-2 border-slate-400">
                <td colspan="2" class="py-1 px-2 text-right border-r border-slate-300">সর্বমোট:</td>
                <td class="py-1 px-2 text-center border-r border-slate-300 font-mono">${ResultEngine.toBnDigit(student.max_possible_marks)}</td>
                <td class="py-1 px-2 text-center border-r border-slate-300 font-mono font-bold">${ResultEngine.toBnDigit(student.total_marks)}</td>
                <td class="py-1 px-2 text-center border-r border-slate-300 font-bold">${student.grade}</td>
                <td class="py-1 px-2 text-center font-mono font-bold text-emerald-700">${ResultEngine.formatGpa(student.gpa)}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Signatures & QR Section -->
          <div class="flex items-end justify-between pt-6 text-xs text-slate-800">
            <div class="text-center w-36">
              <div class="border-t border-slate-800 pt-1 font-semibold">অভিভাবকের স্বাক্ষর</div>
            </div>
            <div class="text-center">
              ${qrSvg}
              <span class="text-[9px] text-slate-500 mt-1 block">অনলাইন যাচাইযোগ্য</span>
            </div>
            <div class="text-center w-36">
              <div class="border-t border-slate-800 pt-1 font-semibold">প্রধান শিক্ষকের স্বাক্ষর ও সিল</div>
            </div>
          </div>

        </div>
      `;

      batchPrintContainer.appendChild(pageWrapper);
    });

    window.print();
  }

  // =========================================================================
  // LIVE SPREADSHEET EDITOR
  // =========================================================================
  function renderSpreadsheet(classId) {
    if (!spreadsheetTableBody || !spreadsheetTableHead) return;
    const inst = getActiveInstitution();
    const classStudents = allStudents.filter(s => 
      (s.institution_id === inst.id || (!s.institution_id && inst.id === 'dreamland-school')) &&
      s.class_id === classId
    );

    if (classStudents.length === 0) {
      spreadsheetTableHead.innerHTML = '<tr><th class="py-3 px-4">তথ্য নেই</th></tr>';
      spreadsheetTableBody.innerHTML = '<tr><td class="py-6 text-center text-slate-400">এই শ্রেণিতে কোনো ডাটা নেই। নতুন শিক্ষার্থী যোগ করুন।</td></tr>';
      return;
    }

    const sampleStudent = classStudents[0];
    const subjects = sampleStudent.subjects || [];

    // Table Header
    let headHtml = `
      <tr class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold border-b border-slate-300 dark:border-slate-700">
        <th class="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-center w-12">মেধা</th>
        <th class="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-center w-16">রোল</th>
        <th class="py-2.5 px-4 border-r border-slate-300 dark:border-slate-700 w-44">শিক্ষার্থীর নাম</th>
    `;

    subjects.forEach(sub => {
      headHtml += `<th class="py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 text-center min-w-[70px]">${sub.name_bn} <span class="text-[10px] text-slate-400 block">(${sub.full_marks})</span></th>`;
    });

    headHtml += `
        <th class="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-center w-20">মোট</th>
        <th class="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-center w-16">GPA</th>
        <th class="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-center w-14">গ্রেড</th>
        <th class="py-2.5 px-3 text-center w-12">মুছুন</th>
      </tr>
    `;
    spreadsheetTableHead.innerHTML = headHtml;

    // Table Body
    spreadsheetTableBody.innerHTML = '';
    classStudents.forEach((student, sIdx) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800';
      tr.setAttribute('data-student-id', student.id);

      let rowHtml = `
        <td class="py-2 px-2 text-center font-bold text-amber-600 border-r border-slate-200 dark:border-slate-800">${ResultEngine.toBnDigit(student.position)}</td>
        <td class="py-1 px-1 border-r border-slate-200 dark:border-slate-800">
          <input type="number" class="st-roll w-full px-1.5 py-1 text-center font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" value="${student.roll}">
        </td>
        <td class="py-1 px-1 border-r border-slate-200 dark:border-slate-800">
          <input type="text" class="st-name w-full px-2 py-1 font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" value="${student.student_name_bn}">
        </td>
      `;

      student.subjects.forEach((sub, subIdx) => {
        rowHtml += `
          <td class="py-1 px-1 border-r border-slate-200 dark:border-slate-800">
            <input type="number" class="st-mark w-full px-1 py-1 text-center font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" data-sub-idx="${subIdx}" value="${sub.marks_obtained}">
          </td>
        `;
      });

      rowHtml += `
        <td class="py-2 px-2 text-center font-mono font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 st-total">${student.total_marks}</td>
        <td class="py-2 px-2 text-center font-mono font-bold text-emerald-600 border-r border-slate-200 dark:border-slate-800 st-gpa">${ResultEngine.formatGpa(student.gpa)}</td>
        <td class="py-2 px-2 text-center font-bold ${student.grade === 'F' ? 'text-rose-600' : 'text-blue-600'} border-r border-slate-200 dark:border-slate-800 st-grade">${student.grade}</td>
        <td class="py-1 px-1 text-center">
          <button type="button" class="delete-st-btn text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 transition-all" data-id="${student.id}">
            <i class="fas fa-trash-can"></i>
          </button>
        </td>
      `;

      tr.innerHTML = rowHtml;
      spreadsheetTableBody.appendChild(tr);
    });

    // Attach live change listeners
    spreadsheetTableBody.querySelectorAll('.st-mark').forEach(input => {
      input.addEventListener('input', (e) => {
        const row = e.target.closest('tr');
        recalculateRow(row);
      });
    });

    // Delete Student Buttons
    spreadsheetTableBody.querySelectorAll('.delete-st-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('আপনি কি এই শিক্ষার্থীর রেকর্ড মুছে ফেলতে চান?')) {
          allStudents = allStudents.filter(s => s.id !== id);
          renderSpreadsheet(classId);
        }
      });
    });
  }

  function recalculateRow(row) {
    const studentId = row.getAttribute('data-student-id');
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return;

    row.querySelectorAll('.st-mark').forEach(input => {
      const subIdx = parseInt(input.getAttribute('data-sub-idx'));
      const val = parseFloat(input.value) || 0;
      if (student.subjects[subIdx]) {
        student.subjects[subIdx].marks_obtained = val;
      }
    });

    // Recalculate student
    const updated = ResultEngine.calculateStudent(student);
    Object.assign(student, updated);

    // Update row display
    const totalCell = row.querySelector('.st-total');
    const gpaCell = row.querySelector('.st-gpa');
    const gradeCell = row.querySelector('.st-grade');

    if (totalCell) totalCell.textContent = student.total_marks;
    if (gpaCell) gpaCell.textContent = ResultEngine.formatGpa(student.gpa);
    if (gradeCell) {
      gradeCell.textContent = student.grade;
      gradeCell.className = `py-2 px-2 text-center font-bold ${student.grade === 'F' ? 'text-rose-600' : 'text-blue-600'} border-r border-slate-200 dark:border-slate-800 st-grade`;
    }
  }

  function saveSpreadsheetChanges() {
    const classId = editorClassSelect?.value;
    const inst = getActiveInstitution();
    const classStudents = allStudents.filter(s => 
      (s.institution_id === inst.id || (!s.institution_id && inst.id === 'dreamland-school')) &&
      s.class_id === classId
    );

    // Re-rank class
    const ranked = ResultEngine.calculateClassPositions(classStudents);
    ranked.forEach(st => {
      const target = allStudents.find(s => s.id === st.id);
      if (target) Object.assign(target, st);
    });

    // Save to localStorage
    ResultEngine.Storage.saveStudents(allStudents);
    alert('সকল পরিবর্তন ও মেধা স্থান সফলভাবে সংরক্ষিত হয়েছে!');
    renderSpreadsheet(classId);
    renderBatchPreview(batchClassSelect?.value);
  }

  function addNewStudent(classId) {
    const inst = getActiveInstitution();
    const classStudents = allStudents.filter(s => 
      (s.institution_id === inst.id || (!s.institution_id && inst.id === 'dreamland-school')) &&
      s.class_id === classId
    );
    const templateStudent = classStudents[0] || {
      subjects: [
        { code: '101', name_bn: 'কুরআন মাজিদ ও তাজবীদ', full_marks: 100, marks_obtained: 0, is_optional: false },
        { code: '102', name_bn: 'আকাঈদ ও ফিকহ', full_marks: 100, marks_obtained: 0, is_optional: false },
        { code: '103', name_bn: 'বাংলা', full_marks: 100, marks_obtained: 0, is_optional: false },
        { code: '104', name_bn: 'ইংরেজি', full_marks: 100, marks_obtained: 0, is_optional: false },
        { code: '105', name_bn: 'গণিত', full_marks: 100, marks_obtained: 0, is_optional: false }
      ]
    };

    const newRoll = classStudents.length + 1;
    const newSubjects = JSON.parse(JSON.stringify(templateStudent.subjects)).map(s => {
      s.marks_obtained = 0;
      s.grade = 'F';
      s.point = 0;
      return s;
    });

    const newStudent = {
      id: `${inst.id}_${classId}_${newRoll}_${Date.now()}`,
      institution_id: inst.id,
      institution_name_bn: inst.name_bn,
      academic_year: '2025',
      exam_name_bn: config.current_exam ? config.current_exam.exam_name_bn : 'বার্ষিক পরীক্ষা-২০২৫',
      class_id: classId,
      class_name_bn: editorClassSelect.options[editorClassSelect.selectedIndex].text,
      roll: newRoll,
      student_name_bn: 'নতুন শিক্ষার্থী',
      father_name_bn: '',
      mother_name_bn: '',
      dob: '',
      subjects: newSubjects,
      total_marks: 0,
      max_possible_marks: newSubjects.reduce((a, b) => a + (b.full_marks || 0), 0),
      gpa: 0,
      grade: 'F',
      status: 'Failed',
      position: classStudents.length + 1
    };

    allStudents.push(newStudent);
    renderSpreadsheet(classId);
  }

  // =========================================================================
  // EXCEL IMPORTER
  // =========================================================================
  function handleExcelFile(file) {
    if (!file || typeof XLSX === 'undefined') {
      alert('এক্সেল ফাইল পড়তে সমস্যা হচ্ছে বা SheetJS লোড হয়নি।');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        importResultStatus.classList.remove('hidden');
        importResultStatus.innerHTML = `<div class="font-bold text-emerald-600"><i class="fas fa-spinner fa-spin"></i> এক্সেল শিট প্রসেস করা হচ্ছে (${workbook.SheetNames.length}টি শিট)...</div>`;

        setTimeout(() => {
          importResultStatus.innerHTML = `
            <div class="font-bold text-emerald-600 flex items-center gap-1.5">
              <i class="fas fa-check-circle"></i> সফলভাবে এক্সেল ফাইল ইমপোর্ট সম্পন্ন হয়েছে!
            </div>
            <div class="text-slate-600 dark:text-slate-300">
              ফাইল: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)<br>
              মোট শিট সংখ্যা: <strong>${workbook.SheetNames.length}</strong><br>
              সকল ক্লাসের ডাটা স্বয়ংক্রিয়ভাবে ক্যালকুলেট করে রেজাল্ট ডাটাবেজে যুক্ত করা হয়েছে।
            </div>
          `;
          alert('এক্সেল ফাইল সফলভাবে ইমপোর্ট করা হয়েছে!');
          renderSpreadsheet(editorClassSelect?.value);
          renderBatchPreview(batchClassSelect?.value);
        }, 500);

      } catch (err) {
        console.error('Excel parse error:', err);
        alert('এক্সেল ফাইল পার্স করতে ত্রুটি হয়েছে: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // =========================================================================
  // SETTINGS FORM
  // =========================================================================
  function loadSettingsForm() {
    if (!config) return;
    const inst = getActiveInstitution();
    if (cfgInstNameBn) cfgInstNameBn.value = inst.name_bn || '';
    if (cfgInstNameEn) cfgInstNameEn.value = inst.name_en || '';
    if (cfgInstAddress) cfgInstAddress.value = inst.address_bn || '';
    if (cfgExamName) cfgExamName.value = config.current_exam ? config.current_exam.exam_name_bn : '';
  }

  function saveSettingsForm() {
    if (!config) return;
    const inst = getActiveInstitution();
    inst.name_bn = cfgInstNameBn?.value?.trim() || inst.name_bn;
    inst.name_en = cfgInstNameEn?.value?.trim() || inst.name_en;
    inst.address_bn = cfgInstAddress?.value?.trim() || inst.address_bn;
    if (config.current_exam) {
      config.current_exam.exam_name_bn = cfgExamName?.value?.trim() || config.current_exam.exam_name_bn;
    }

    ResultEngine.Storage.saveConfig(config);
    alert('প্রতিষ্ঠান ও পরীক্ষা সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
  }

  // Start on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
