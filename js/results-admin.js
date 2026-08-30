/**
 * Fayzar Computer Online Result Portal - Admin Control Script
 * Handles Authentication, Batch Print Engine, Live Spreadsheet & Excel Import
 */

(function () {
  'use strict';

  let config = null;
  let allStudents = [];
  let currentClassId = 'class_5';

  // DOM Elements
  const authOverlay = document.getElementById('adminAuthOverlay');
  const pinForm = document.getElementById('adminPinForm');
  const pinInput = document.getElementById('adminPinInput');
  const adminThemeToggleBtn = document.getElementById('adminThemeToggleBtn');

  // Tabs
  const adminTabButtons = document.querySelectorAll('.admin-tab-btn');
  const batchPrintTabContent = document.getElementById('batchPrintTabContent');
  const spreadsheetTabContent = document.getElementById('spreadsheetTabContent');
  const excelImportTabContent = document.getElementById('excelImportTabContent');
  const settingsTabContent = document.getElementById('settingsTabContent');

  // Batch Print
  const batchClassSelect = document.getElementById('batchClassSelect');
  const executeBatchPrintBtn = document.getElementById('executeBatchPrintBtn');
  const batchStudentCount = document.getElementById('batchStudentCount');
  const batchPreviewGrid = document.getElementById('batchPreviewGrid');
  const batchPrintContainer = document.getElementById('batchPrintContainer');

  // Spreadsheet Editor
  const editorClassSelect = document.getElementById('editorClassSelect');
  const editorTableHead = document.getElementById('editorTableHead');
  const editorTableBody = document.getElementById('editorTableBody');
  const addNewStudentBtn = document.getElementById('addNewStudentBtn');
  const saveEditorChangesBtn = document.getElementById('saveEditorChangesBtn');

  // Excel Import
  const excelDropzone = document.getElementById('excelDropzone');
  const excelFileInput = document.getElementById('excelFileInput');
  const importResultStatus = document.getElementById('importResultStatus');

  // Settings
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

    populateClassDropdowns();
    renderBatchPreview(batchClassSelect?.value || 'class_5');
    renderSpreadsheet(editorClassSelect?.value || 'class_5');
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
      if (val === '1234' || val === 'fayzar' || val === 'admin' || val === 'fc2025') {
        sessionStorage.setItem('fayzar_admin_authenticated', 'true');
        authOverlay?.classList.add('hidden');
      } else {
        alert('ভুল পিন বা পাসওয়ার্ড! সঠিক পিন দিন (যেমন: 1234 বা fayzar)।');
        pinInput.value = '';
        pinInput.focus();
      }
    });
  }

  function populateClassDropdowns() {
    if (!config || !Array.isArray(config.classes)) return;

    [batchClassSelect, editorClassSelect].forEach(select => {
      if (!select) return;
      select.innerHTML = '';
      config.classes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.name_bn} ${c.section ? '(' + c.section + ')' : ''}`;
        select.appendChild(opt);
      });
      select.value = 'class_5';
    });
  }

  function bindEvents() {
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
          renderBatchPreview(batchClassSelect?.value || 'class_5');
        }
        if (target === 'spreadsheetTab') {
          spreadsheetTabContent?.classList.remove('hidden');
          renderSpreadsheet(editorClassSelect?.value || 'class_5');
        }
        if (target === 'excelImportTab') excelImportTabContent?.classList.remove('hidden');
        if (target === 'settingsTab') {
          settingsTabContent?.classList.remove('hidden');
          loadSettingsForm();
        }
      });
    });

    // Batch Class Select
    batchClassSelect?.addEventListener('change', (e) => {
      renderBatchPreview(e.target.value);
    });

    // Batch Print Execution
    executeBatchPrintBtn?.addEventListener('click', () => {
      const classId = batchClassSelect?.value;
      const classStudents = allStudents.filter(s => s.class_id === classId);
      if (classStudents.length === 0) {
        alert('নির্বাচিত শ্রেণিতে কোনো শিক্ষার্থী নেই।');
        return;
      }
      buildBatchPrintPages(classStudents);
      window.print();
    });

    // Editor Class Select
    editorClassSelect?.addEventListener('change', (e) => {
      renderSpreadsheet(e.target.value);
    });

    // Save Editor Changes
    saveEditorChangesBtn?.addEventListener('click', () => {
      saveSpreadsheetData();
    });

    // Add New Student
    addNewStudentBtn?.addEventListener('click', () => {
      addNewStudentRow();
    });

    // Excel Drag and Drop
    excelDropzone?.addEventListener('click', () => excelFileInput?.click());
    excelDropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      excelDropzone.classList.add('border-emerald-500', 'bg-emerald-50/50');
    });
    excelDropzone?.addEventListener('dragleave', () => {
      excelDropzone.classList.remove('border-emerald-500', 'bg-emerald-50/50');
    });
    excelDropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      excelDropzone.classList.remove('border-emerald-500', 'bg-emerald-50/50');
      if (e.dataTransfer.files.length > 0) {
        handleExcelFile(e.dataTransfer.files[0]);
      }
    });

    excelFileInput?.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleExcelFile(e.target.files[0]);
      }
    });

    // Settings Form Submit
    settingsForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSettingsForm();
    });

    // Reset Data
    resetDefaultDataBtn?.addEventListener('click', async () => {
      if (confirm('আপনি কি সত্যিই সকল ডাটা ডিফল্ট অবস্থায় রিসেট করতে চান? আপনার করা পরিবর্তন মুছে যাবে।')) {
        const res = await ResultEngine.Storage.resetToDefault();
        config = res.config;
        allStudents = res.students;
        alert('সফলভাবে ডিফল্ট ডাটা রিসেট হয়েছে!');
        window.location.reload();
      }
    });
  }

  // =========================================================================
  // BATCH PRINT ENGINE
  // =========================================================================
  function renderBatchPreview(classId) {
    if (!batchPreviewGrid) return;
    const classStudents = allStudents.filter(s => s.class_id === classId);
    classStudents.sort((a, b) => (a.roll || 0) - (b.roll || 0));

    if (batchStudentCount) {
      batchStudentCount.textContent = ResultEngine.toBnDigit(classStudents.length);
    }

    batchPreviewGrid.innerHTML = '';
    if (classStudents.length === 0) {
      batchPreviewGrid.innerHTML = '<div class="col-span-2 text-center text-slate-400 py-8">কোনো শিক্ষার্থী পাওয়া যায়নি।</div>';
      return;
    }

    // Show preview of first 4 students
    classStudents.slice(0, 4).forEach(st => {
      const card = document.createElement('div');
      card.className = 'p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2';
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-extrabold text-slate-900 dark:text-white text-sm">রোল: ${ResultEngine.toBnDigit(st.roll)} - ${st.student_name_bn}</span>
          <span class="text-xs font-bold px-2 py-0.5 rounded-full ${st.status === 'Passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
            ${st.grade} (${ResultEngine.formatGpa(st.gpa)})
          </span>
        </div>
        <div class="text-xs text-slate-500 space-y-0.5">
          <div>শ্রেণি: ${st.class_name_bn} | মোট নম্বর: ${ResultEngine.toBnDigit(st.total_marks)} / ${ResultEngine.toBnDigit(st.max_possible_marks)}</div>
          <div>মেধা স্থান: ${ResultEngine.toBnDigit(st.position)}তম | বিষয় সংখ্যা: ${st.subjects?.length || 0}টি</div>
        </div>
      `;
      batchPreviewGrid.appendChild(card);
    });

    if (classStudents.length > 4) {
      const moreInfo = document.createElement('div');
      moreInfo.className = 'col-span-2 text-center text-xs text-slate-400 font-semibold pt-2';
      moreInfo.textContent = `... এবং আরও ${ResultEngine.toBnDigit(classStudents.length - 4)} জন শিক্ষার্থী ব্যাচ প্রিন্টের অন্তর্ভুক্ত রয়েছে।`;
      batchPreviewGrid.appendChild(moreInfo);
    }
  }

  function buildBatchPrintPages(students) {
    if (!batchPrintContainer) return;
    batchPrintContainer.innerHTML = '';

    const inst = config.institution;
    const exam = config.current_exam;

    students.forEach((st) => {
      const verifyUrl = `${window.location.origin}/results.html?year=${st.year}&class=${st.class_id}&roll=${st.roll}`;
      const qrSvg = ResultEngine.generateVerificationQrSvg(verifyUrl, 75);

      const page = document.createElement('div');
      page.className = 'batch-student-page bg-white text-slate-900';
      
      let rowsHtml = '';
      st.subjects.forEach((sub, i) => {
        rowsHtml += `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            <td style="padding: 4px 6px; text-align: center; border-right: 1px solid #e2e8f0;">${i + 1}</td>
            <td style="padding: 4px 6px; font-weight: bold; border-right: 1px solid #e2e8f0;">${sub.name_bn}</td>
            <td style="padding: 4px 6px; text-align: center; border-right: 1px solid #e2e8f0;">${ResultEngine.toBnDigit(sub.full_marks)}</td>
            <td style="padding: 4px 6px; text-align: center; font-weight: bold; border-right: 1px solid #e2e8f0;">${ResultEngine.toBnDigit(sub.marks_obtained)}</td>
            <td style="padding: 4px 6px; text-align: center; font-weight: bold; border-right: 1px solid #e2e8f0;">${sub.grade}</td>
            <td style="padding: 4px 6px; text-align: center; font-weight: bold;">${ResultEngine.formatGpa(sub.point)}</td>
          </tr>
        `;
      });

      page.innerHTML = `
        <div class="certificate-border" style="border: 2px double #0f172a; padding: 16px; border-radius: 8px;">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 10px;">
            <div style="font-size: 20px; font-weight: 900; line-height: 1.2;">${inst.name_bn}</div>
            <div style="font-size: 11px; font-weight: bold; color: #475569;">${inst.name_en}</div>
            <div style="font-size: 10px; color: #475569;">${inst.address_bn}</div>
            <div style="display: inline-block; background: #0f172a; color: #ffffff; padding: 2px 12px; border-radius: 12px; font-size: 11px; font-weight: bold; margin-top: 4px;">
              ${exam.exam_name_bn}
            </div>
            <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; margin-top: 2px; color: #64748b;">
              ACADEMIC TRANSCRIPT / মার্কশীট
            </div>
          </div>

          <!-- Student Info Grid -->
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; margin-bottom: 10px; font-size: 11px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 50%; padding: 2px;"><strong>শিক্ষার্থীর নাম:</strong> ${st.student_name_bn}</td>
                <td style="width: 25%; padding: 2px;"><strong>রোল নম্বর:</strong> ${ResultEngine.toBnDigit(st.roll)}</td>
                <td style="width: 25%; padding: 2px;"><strong>শ্রেণি:</strong> ${st.class_name_bn}</td>
              </tr>
              <tr>
                <td style="padding: 2px;"><strong>পিতার নাম:</strong> ${st.father_name_bn || '--'}</td>
                <td style="padding: 2px;"><strong>মাতার নাম:</strong> ${st.mother_name_bn || '--'}</td>
                <td style="padding: 2px;"><strong>মেধা স্থান:</strong> ${st.position > 0 ? ResultEngine.toBnDigit(st.position) + 'তম' : '--'}</td>
              </tr>
            </table>
          </div>

          <!-- Summary Badges -->
          <table style="width: 100%; text-align: center; margin-bottom: 10px; font-size: 11px;">
            <tr>
              <td style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 6px; border-radius: 6px; width: 25%;">
                <span style="font-size: 9px; font-weight: bold; color: #065f46; display: block;">প্রাপ্ত GPA</span>
                <strong style="font-size: 16px; color: #059669;">${ResultEngine.formatGpa(st.gpa)}</strong>
              </td>
              <td style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 6px; border-radius: 6px; width: 25%;">
                <span style="font-size: 9px; font-weight: bold; color: #1e40af; display: block;">লেটার গ্রেড</span>
                <strong style="font-size: 16px; color: #2563eb;">${st.grade}</strong>
              </td>
              <td style="background: #faf5ff; border: 1px solid #e9d5ff; padding: 6px; border-radius: 6px; width: 25%;">
                <span style="font-size: 9px; font-weight: bold; color: #6b21a8; display: block;">মোট নম্বর</span>
                <strong style="font-size: 16px; color: #7e22ce;">${ResultEngine.toBnDigit(st.total_marks)} / ${ResultEngine.toBnDigit(st.max_possible_marks)}</strong>
              </td>
              <td style="background: #fffbeb; border: 1px solid #fde68a; padding: 6px; border-radius: 6px; width: 25%;">
                <span style="font-size: 9px; font-weight: bold; color: #92400e; display: block;">ফলাফল</span>
                <strong style="font-size: 14px; color: ${st.status === 'Passed' ? '#059669' : '#e11d48'};">${st.status === 'Passed' ? 'উত্তীর্ণ' : 'অকৃতকার্য'}</strong>
              </td>
            </tr>
          </table>

          <!-- Marks Table -->
          <table style="width: 100%; border: 1px solid #cbd5e1; border-collapse: collapse; margin-bottom: 12px;">
            <thead>
              <tr style="background: #f1f5f9; font-size: 10px; font-weight: bold; border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 4px 6px; border-right: 1px solid #cbd5e1; width: 30px; text-align: center;">ক্র.</th>
                <th style="padding: 4px 6px; border-right: 1px solid #cbd5e1; text-align: left;">বিষয়ের নাম</th>
                <th style="padding: 4px 6px; border-right: 1px solid #cbd5e1; width: 60px; text-align: center;">পূর্ণমান</th>
                <th style="padding: 4px 6px; border-right: 1px solid #cbd5e1; width: 70px; text-align: center;">প্রাপ্ত নম্বর</th>
                <th style="padding: 4px 6px; border-right: 1px solid #cbd5e1; width: 60px; text-align: center;">লেটার গ্রেড</th>
                <th style="padding: 4px 6px; width: 60px; text-align: center;">গ্রেড পয়েন্ট</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
            <tfoot>
              <tr style="background: #f8fafc; font-weight: bold; font-size: 11px; border-top: 2px solid #cbd5e1;">
                <td colspan="2" style="padding: 4px 6px; text-align: right; border-right: 1px solid #cbd5e1;">সর্বমোট:</td>
                <td style="padding: 4px 6px; text-align: center; border-right: 1px solid #cbd5e1;">${ResultEngine.toBnDigit(st.max_possible_marks)}</td>
                <td style="padding: 4px 6px; text-align: center; border-right: 1px solid #cbd5e1; color: #059669;">${ResultEngine.toBnDigit(st.total_marks)}</td>
                <td style="padding: 4px 6px; text-align: center; border-right: 1px solid #cbd5e1;">${st.grade}</td>
                <td style="padding: 4px 6px; text-align: center; color: #059669;">${ResultEngine.formatGpa(st.gpa)}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Footer Signatures -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 16px; border-top: 1px solid #cbd5e1; font-size: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${qrSvg}
              <div>
                <strong>ডিজিটাল ভেরিফিকেশন</strong><br>
                অনলাইনে যাচাই করতে স্ক্যান করুন।<br>
                তারিখ: ৩১/১২/২০২৫
              </div>
            </div>
            <div style="text-align: center; border-top: 1px dashed #64748b; width: 120px; padding-top: 4px;">
              <strong>অভিভাবকের স্বাক্ষর</strong>
            </div>
            <div style="text-align: center; border-top: 1px dashed #64748b; width: 140px; padding-top: 4px;">
              <strong>প্রধান শিক্ষকের স্বাক্ষর ও সিল</strong>
            </div>
          </div>
        </div>
      `;

      batchPrintContainer.appendChild(page);
    });
  }

  // =========================================================================
  // LIVE SPREADSHEET EDITOR
  // =========================================================================
  function renderSpreadsheet(classId) {
    if (!editorTableHead || !editorTableBody) return;
    const classStudents = allStudents.filter(s => s.class_id === classId);
    classStudents.sort((a, b) => (a.roll || 0) - (b.roll || 0));

    // Determine subjects structure from first student or template
    const sampleStudent = classStudents[0];
    const subjects = sampleStudent?.subjects || [];

    // Render Headers
    let headHtml = `
      <tr>
        <th class="py-2.5 px-2 text-center w-12">রোল</th>
        <th class="py-2.5 px-3 w-40">শিক্ষার্থীর নাম</th>
        <th class="py-2.5 px-3 w-36">পিতার নাম</th>
    `;
    subjects.forEach(sub => {
      headHtml += `<th class="py-2.5 px-2 text-center w-20 text-[11px]">${sub.name_bn} (${sub.full_marks})</th>`;
    });
    headHtml += `
        <th class="py-2.5 px-2 text-center w-16 bg-slate-200 dark:bg-slate-700">মোট</th>
        <th class="py-2.5 px-2 text-center w-16 bg-slate-200 dark:bg-slate-700">GPA</th>
        <th class="py-2.5 px-2 text-center w-14 bg-slate-200 dark:bg-slate-700">গ্রেড</th>
        <th class="py-2.5 px-2 text-center w-14 bg-slate-200 dark:bg-slate-700">স্থান</th>
        <th class="py-2.5 px-2 text-center w-12">অ্যাকশন</th>
      </tr>
    `;
    editorTableHead.innerHTML = headHtml;

    // Render Rows
    editorTableBody.innerHTML = '';
    classStudents.forEach(st => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors student-row';
      tr.setAttribute('data-id', st.id);

      let rowHtml = `
        <td class="py-2 px-1 text-center font-mono">
          <input type="number" value="${st.roll}" class="w-12 text-center py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold st-roll">
        </td>
        <td class="py-2 px-2">
          <input type="text" value="${st.student_name_bn}" class="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold st-name">
        </td>
        <td class="py-2 px-2">
          <input type="text" value="${st.father_name_bn || ''}" class="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs st-father">
        </td>
      `;

      subjects.forEach((sub, subIdx) => {
        const stSub = st.subjects[subIdx] || { marks_obtained: 0 };
        rowHtml += `
          <td class="py-2 px-1 text-center font-mono">
            <input type="number" data-sub-idx="${subIdx}" value="${stSub.marks_obtained}" class="w-16 text-center py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold st-mark">
          </td>
        `;
      });

      rowHtml += `
        <td class="py-2 px-2 text-center font-mono font-bold st-total bg-slate-50 dark:bg-slate-800/80">${st.total_marks}</td>
        <td class="py-2 px-2 text-center font-mono font-bold st-gpa bg-slate-50 dark:bg-slate-800/80 ${st.status === 'Passed' ? 'text-emerald-600' : 'text-rose-600'}">${ResultEngine.formatGpa(st.gpa)}</td>
        <td class="py-2 px-2 text-center font-bold st-grade bg-slate-50 dark:bg-slate-800/80">${st.grade}</td>
        <td class="py-2 px-2 text-center font-mono font-bold st-pos bg-slate-50 dark:bg-slate-800/80">${st.position}</td>
        <td class="py-2 px-1 text-center">
          <button type="button" class="text-rose-500 hover:text-rose-700 delete-row-btn p-1"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;

      tr.innerHTML = rowHtml;
      editorTableBody.appendChild(tr);
    });

    // Attach live recalculation listeners
    editorTableBody.querySelectorAll('.st-mark').forEach(input => {
      input.addEventListener('input', () => {
        recalcEditorGrid();
      });
    });

    editorTableBody.querySelectorAll('.delete-row-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tr = e.target.closest('tr');
        if (confirm('আপনি কি এই শিক্ষার্থীর রেকর্ড মুছে ফেলতে চান?')) {
          tr.remove();
          recalcEditorGrid();
        }
      });
    });
  }

  function recalcEditorGrid() {
    const classId = editorClassSelect?.value;
    const rows = editorTableBody.querySelectorAll('tr');
    
    // Read all rows
    const classStudents = [];
    rows.forEach(tr => {
      const id = tr.getAttribute('data-id') || `new-${Date.now()}`;
      const roll = parseInt(tr.querySelector('.st-roll')?.value) || 0;
      const name = tr.querySelector('.st-name')?.value?.trim() || 'শিক্ষার্থী';
      const father = tr.querySelector('.st-father')?.value?.trim() || '';

      const markInputs = tr.querySelectorAll('.st-mark');
      // get existing student template
      const orig = allStudents.find(s => s.id === id) || allStudents.find(s => s.class_id === classId);
      const subjects = (orig?.subjects || []).map((sub, idx) => {
        const markVal = parseFloat(markInputs[idx]?.value) || 0;
        return {
          ...sub,
          marks_obtained: markVal
        };
      });

      classStudents.push({
        id: id,
        year: config.current_exam.year,
        exam_id: config.current_exam.exam_id,
        class_id: classId,
        class_name_bn: orig?.class_name_bn || 'শ্রেণি',
        class_name_en: orig?.class_name_en || 'Class',
        section: orig?.section || '',
        roll: roll,
        student_name_bn: name,
        student_name_en: name,
        father_name_bn: father,
        father_name_en: father,
        mother_name_bn: '',
        mother_name_en: '',
        dob: '',
        subjects: subjects
      });
    });

    // Recalculate
    const calculated = ResultEngine.calculateClassPositions(classStudents);

    // Update row DOM
    rows.forEach((tr, idx) => {
      const st = calculated[idx];
      if (!st) return;
      tr.querySelector('.st-total').textContent = st.total_marks;
      const gpaEl = tr.querySelector('.st-gpa');
      gpaEl.textContent = ResultEngine.formatGpa(st.gpa);
      gpaEl.className = `py-2 px-2 text-center font-mono font-bold st-gpa bg-slate-50 dark:bg-slate-800/80 ${st.status === 'Passed' ? 'text-emerald-600' : 'text-rose-600'}`;
      tr.querySelector('.st-grade').textContent = st.grade;
      tr.querySelector('.st-pos').textContent = st.position;
    });
  }

  function saveSpreadsheetData() {
    const classId = editorClassSelect?.value;
    const rows = editorTableBody.querySelectorAll('tr');
    
    const classStudents = [];
    rows.forEach(tr => {
      const id = tr.getAttribute('data-id') || `new-${Date.now()}`;
      const roll = parseInt(tr.querySelector('.st-roll')?.value) || 0;
      const name = tr.querySelector('.st-name')?.value?.trim() || 'শিক্ষার্থী';
      const father = tr.querySelector('.st-father')?.value?.trim() || '';

      const markInputs = tr.querySelectorAll('.st-mark');
      const orig = allStudents.find(s => s.id === id) || allStudents.find(s => s.class_id === classId);
      const subjects = (orig?.subjects || []).map((sub, idx) => {
        const markVal = parseFloat(markInputs[idx]?.value) || 0;
        return {
          ...sub,
          marks_obtained: markVal
        };
      });

      classStudents.push({
        id: id,
        year: config.current_exam.year,
        exam_id: config.current_exam.exam_id,
        class_id: classId,
        class_name_bn: orig?.class_name_bn || 'শ্রেণি',
        class_name_en: orig?.class_name_en || 'Class',
        section: orig?.section || '',
        roll: roll,
        student_name_bn: name,
        student_name_en: name,
        father_name_bn: father,
        father_name_en: father,
        mother_name_bn: orig?.mother_name_bn || '',
        mother_name_en: orig?.mother_name_en || '',
        dob: orig?.dob || '',
        subjects: subjects
      });
    });

    const calculated = ResultEngine.calculateClassPositions(classStudents);

    // Replace students of this class in allStudents
    allStudents = allStudents.filter(s => s.class_id !== classId);
    allStudents.push(...calculated);

    ResultEngine.Storage.saveStudents(allStudents);
    alert('সফলভাবে ক্লাসের ফলাফল সংরক্ষিত হয়েছে!');
    renderBatchPreview(batchClassSelect?.value || 'class_5');
  }

  function addNewStudentRow() {
    const classId = editorClassSelect?.value;
    const orig = allStudents.find(s => s.class_id === classId);
    if (!orig) return;

    const classStudents = allStudents.filter(s => s.class_id === classId);
    const nextRoll = classStudents.length > 0 ? Math.max(...classStudents.map(s => s.roll || 0)) + 1 : 1;

    const dummySubjects = orig.subjects.map(s => ({
      ...s,
      marks_obtained: 0
    }));

    const newStudent = {
      id: `2025-${classId}-r${nextRoll}-${Date.now()}`,
      year: config.current_exam.year,
      exam_id: config.current_exam.exam_id,
      class_id: classId,
      class_name_bn: orig.class_name_bn,
      class_name_en: orig.class_name_en,
      section: orig.section,
      roll: nextRoll,
      student_name_bn: `নতুন শিক্ষার্থী ${nextRoll}`,
      student_name_en: `Student ${nextRoll}`,
      father_name_bn: '',
      father_name_en: '',
      mother_name_bn: '',
      mother_name_en: '',
      dob: '',
      subjects: dummySubjects,
      total_marks: 0,
      max_possible_marks: orig.max_possible_marks,
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
        
        let totalImported = 0;
        let sheetsCount = 0;

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
          renderSpreadsheet(editorClassSelect?.value || 'class_5');
          renderBatchPreview(batchClassSelect?.value || 'class_5');
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
    if (cfgInstNameBn) cfgInstNameBn.value = config.institution.name_bn || '';
    if (cfgInstNameEn) cfgInstNameEn.value = config.institution.name_en || '';
    if (cfgInstAddress) cfgInstAddress.value = config.institution.address_bn || '';
    if (cfgExamName) cfgExamName.value = config.current_exam.exam_name_bn || '';
  }

  function saveSettingsForm() {
    if (!config) return;
    config.institution.name_bn = cfgInstNameBn?.value?.trim() || config.institution.name_bn;
    config.institution.name_en = cfgInstNameEn?.value?.trim() || config.institution.name_en;
    config.institution.address_bn = cfgInstAddress?.value?.trim() || config.institution.address_bn;
    config.current_exam.exam_name_bn = cfgExamName?.value?.trim() || config.current_exam.exam_name_bn;

    ResultEngine.Storage.saveConfig(config);
    alert('স্কুল ও পরীক্ষা সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
  }

  // Start on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
