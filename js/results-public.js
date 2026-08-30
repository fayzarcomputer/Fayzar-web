/**
 * Fayzar Computer Online Result Portal - Public UI Script
 * Handles Search, Marksheet Rendering, QR Code, Tabs & Printing
 */

(function () {
  'use strict';

  let config = null;
  let allStudents = [];
  let currentStudent = null;

  // DOM Elements
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const searchForm = document.getElementById('resultSearchForm');
  const searchYear = document.getElementById('searchYear');
  const searchExam = document.getElementById('searchExam');
  const searchClass = document.getElementById('searchClass');
  const searchRoll = document.getElementById('searchRoll');
  const resetSearchBtn = document.getElementById('resetSearchBtn');

  // Tabs
  const tabButtons = document.querySelectorAll('.result-tab-btn');
  const marksheetTabContent = document.getElementById('marksheetTabContent');
  const tabulationTabContent = document.getElementById('tabulationTabContent');
  const analyticsTabContent = document.getElementById('analyticsTabContent');

  // Marksheet Elements
  const heroInstName = document.getElementById('heroInstName');
  const activeResultTitle = document.getElementById('activeResultTitle');
  const msInstNameBn = document.getElementById('msInstNameBn');
  const msInstNameEn = document.getElementById('msInstNameEn');
  const msInstAddress = document.getElementById('msInstAddress');
  const msExamName = document.getElementById('msExamName');
  const msStudentName = document.getElementById('msStudentName');
  const msRoll = document.getElementById('msRoll');
  const msClass = document.getElementById('msClass');
  const msSection = document.getElementById('msSection');
  const msFatherName = document.getElementById('msFatherName');
  const msMotherName = document.getElementById('msMotherName');
  const msDob = document.getElementById('msDob');
  const msStatusBadge = document.getElementById('msStatusBadge');
  const msGpa = document.getElementById('msGpa');
  const msGrade = document.getElementById('msGrade');
  const msRank = document.getElementById('msRank');
  const msTotalMarks = document.getElementById('msTotalMarks');
  const msSubjectsTableBody = document.getElementById('msSubjectsTableBody');
  const msTotalFullMarksFoot = document.getElementById('msTotalFullMarksFoot');
  const msTotalMarksFoot = document.getElementById('msTotalMarksFoot');
  const msGradeFoot = document.getElementById('msGradeFoot');
  const msGpaFoot = document.getElementById('msGpaFoot');
  const msQrCodeBox = document.getElementById('msQrCodeBox');
  const msPublishDate = document.getElementById('msPublishDate');

  // Actions
  const printSingleMarksheetBtn = document.getElementById('printSingleMarksheetBtn');
  const copyResultLinkBtn = document.getElementById('copyResultLinkBtn');
  const tabulationClassSelect = document.getElementById('tabulationClassSelect');
  const tabulationTableBody = document.getElementById('tabulationTableBody');
  const printTabulationBtn = document.getElementById('printTabulationBtn');

  // Initialize
  async function init() {
    initTheme();
    bindEvents();
    
    // Load config and student data
    config = await ResultEngine.Storage.loadConfig();
    if (!config || !config.classes || config.classes.length === 0) {
      config = (typeof window !== 'undefined' && window.DEFAULT_RESULTS_CONFIG) ? window.DEFAULT_RESULTS_CONFIG : config;
    }

    allStudents = await ResultEngine.Storage.loadStudents();
    if (!allStudents || allStudents.length === 0) {
      allStudents = (typeof window !== 'undefined' && Array.isArray(window.DEFAULT_RESULTS_DATA)) ? window.DEFAULT_RESULTS_DATA : [];
    }

    populateClassDropdowns();
    updateInstitutionHeaders();

    // Check URL parameters for direct result lookup
    const urlParams = new URLSearchParams(window.location.search);
    const qClass = urlParams.get('class');
    const qRoll = urlParams.get('roll');
    const qYear = urlParams.get('year') || '2025';

    if (qClass && qRoll) {
      if (searchYear) searchYear.value = qYear;
      if (searchClass) searchClass.value = qClass;
      if (searchRoll) searchRoll.value = qRoll;
      doSearch(qYear, qClass, qRoll);
    } else {
      // Show default top student (e.g. Class 5 Roll 10 / Rank 1)
      const defaultStudent = allStudents.find(s => s.class_id === 'class_5' && s.position === 1) || allStudents[0];
      if (defaultStudent) {
        renderMarksheet(defaultStudent);
        if (searchClass) searchClass.value = defaultStudent.class_id;
        if (searchRoll) searchRoll.value = String(defaultStudent.roll);
      }
    }

    renderTabulation(tabulationClassSelect?.value || 'class_5');
    renderAnalytics();
  }

  // Theme Management
  function initTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    themeToggleBtn?.addEventListener('click', () => {
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
      } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
      }
    });
  }

  function updateInstitutionHeaders() {
    if (!config || !config.institution) return;
    const inst = config.institution;
    if (heroInstName) heroInstName.textContent = inst.name_bn;
    if (msInstNameBn) msInstNameBn.textContent = inst.name_bn;
    if (msInstNameEn) msInstNameEn.textContent = inst.name_en;
    if (msInstAddress) msInstAddress.textContent = inst.address_bn;
    if (msExamName && config.current_exam) msExamName.textContent = config.current_exam.exam_name_bn;
  }

  function populateClassDropdowns() {
    if (!config || !Array.isArray(config.classes)) return;

    if (searchClass) {
      searchClass.innerHTML = '<option value="">-- শ্রেণি নির্বাচন করুন --</option>';
      config.classes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.name_bn} ${c.section ? '(' + c.section + ')' : ''}`;
        searchClass.appendChild(opt);
      });
    }

    if (tabulationClassSelect) {
      tabulationClassSelect.innerHTML = '';
      config.classes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.name_bn} ${c.section ? '(' + c.section + ')' : ''}`;
        tabulationClassSelect.appendChild(opt);
      });
      tabulationClassSelect.value = 'class_5';
    }
  }

  function bindEvents() {
    // Search Form Submit
    searchForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const year = searchYear?.value || '2025';
      const classId = searchClass?.value;
      const roll = searchRoll?.value?.trim();

      if (!classId) {
        alert('অনুগ্রহ করে শ্রেণি নির্বাচন করুন।');
        searchClass?.focus();
        return;
      }
      if (!roll) {
        alert('অনুগ্রহ করে রোল নম্বর ইনপুট দিন।');
        searchRoll?.focus();
        return;
      }

      doSearch(year, classId, roll);
    });

    // Reset Form
    resetSearchBtn?.addEventListener('click', () => {
      searchForm.reset();
      searchClass.value = '';
    });

    // Tab Switching
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        tabButtons.forEach(b => {
          b.classList.remove('active', 'bg-emerald-600', 'text-white', 'shadow-md');
          b.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300', 'border', 'border-slate-200', 'dark:border-slate-700');
        });

        btn.classList.add('active', 'bg-emerald-600', 'text-white', 'shadow-md');
        btn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300', 'border', 'border-slate-200', 'dark:border-slate-700');

        marksheetTabContent?.classList.add('hidden');
        tabulationTabContent?.classList.add('hidden');
        analyticsTabContent?.classList.add('hidden');

        if (targetTab === 'marksheetTab') marksheetTabContent?.classList.remove('hidden');
        if (targetTab === 'tabulationTab') {
          tabulationTabContent?.classList.remove('hidden');
          renderTabulation(tabulationClassSelect?.value || 'class_5');
        }
        if (targetTab === 'analyticsTab') {
          analyticsTabContent?.classList.remove('hidden');
          renderAnalytics();
        }
      });
    });

    // Tabulation Class Change
    tabulationClassSelect?.addEventListener('change', (e) => {
      renderTabulation(e.target.value);
    });

    // Print Buttons
    printSingleMarksheetBtn?.addEventListener('click', () => {
      window.print();
    });

    printTabulationBtn?.addEventListener('click', () => {
      window.print();
    });

    // Share Link Copy
    copyResultLinkBtn?.addEventListener('click', () => {
      if (!currentStudent) return;
      const url = `${window.location.origin}${window.location.pathname}?year=${currentStudent.year}&class=${currentStudent.class_id}&roll=${currentStudent.roll}`;
      navigator.clipboard.writeText(url).then(() => {
        const originalText = copyResultLinkBtn.innerHTML;
        copyResultLinkBtn.innerHTML = '<i class="fas fa-check text-emerald-500"></i> লিঙ্ক কপি হয়েছে!';
        setTimeout(() => {
          copyResultLinkBtn.innerHTML = originalText;
        }, 2500);
      }).catch(() => {
        prompt('রেজাল্ট লিঙ্কটি কপি করুন:', url);
      });
    });
  }

  function doSearch(year, classId, rollStr) {
    const rollNum = parseInt(ResultEngine.toEnDigit(rollStr));
    if (isNaN(rollNum)) {
      alert('সঠিক রোল নম্বর দিন।');
      return;
    }

    const student = allStudents.find(s => 
      s.class_id === classId && 
      (s.roll === rollNum || String(s.roll) === String(rollStr))
    );

    if (!student) {
      alert(`রোল ${rollStr} এর জন্য কোনো ফলাফল পাওয়া যায়নি। অনুগ্রহ করে শ্রেণি ও রোল নম্বর পুনরায় যাচাই করুন।`);
      return;
    }

    renderMarksheet(student);
    
    // Switch to marksheet tab if on another tab
    const marksheetBtn = document.querySelector('[data-tab="marksheetTab"]');
    if (marksheetBtn && !marksheetBtn.classList.contains('active')) {
      marksheetBtn.click();
    }

    // Scroll to marksheet
    const marksheetCard = document.getElementById('marksheetContainer');
    marksheetCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderMarksheet(student) {
    if (!student) return;
    currentStudent = student;

    if (activeResultTitle) {
      activeResultTitle.textContent = `${student.class_name_bn} | রোল: ${student.roll} (${student.student_name_bn})`;
    }

    if (msStudentName) msStudentName.textContent = student.student_name_bn || 'নাম উল্লেখ নেই';
    if (msRoll) msRoll.textContent = ResultEngine.toBnDigit(student.roll);
    if (msClass) msClass.textContent = student.class_name_bn;
    if (msSection) msSection.textContent = student.section || 'সাধারণ';
    if (msFatherName) msFatherName.textContent = student.father_name_bn || '--';
    if (msMotherName) msMotherName.textContent = student.mother_name_bn || '--';
    if (msDob) msDob.textContent = student.dob || '--';

    // Status Badge
    if (msStatusBadge) {
      if (student.status === 'Passed') {
        msStatusBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40';
        msStatusBadge.textContent = 'উত্তীর্ণ (Passed)';
      } else {
        msStatusBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300/40';
        msStatusBadge.textContent = 'অকৃতকার্য (Failed)';
      }
    }

    // Stat Cards
    if (msGpa) {
      msGpa.textContent = ResultEngine.formatGpa(student.gpa);
      msGpa.className = student.status === 'Passed' 
        ? 'text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono' 
        : 'text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono';
    }

    if (msGrade) {
      msGrade.textContent = student.grade;
      msGrade.className = student.grade === 'F' ? 'text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400' : 'text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400';
    }

    if (msRank) {
      msRank.textContent = student.position > 0 ? `${ResultEngine.toBnDigit(student.position)}${getPositionSuffix(student.position)}` : '--';
    }

    if (msTotalMarks) {
      msTotalMarks.textContent = `${ResultEngine.toBnDigit(student.total_marks)} / ${ResultEngine.toBnDigit(student.max_possible_marks)}`;
    }

    // Subjects Table
    if (msSubjectsTableBody && Array.isArray(student.subjects)) {
      msSubjectsTableBody.innerHTML = '';
      student.subjects.forEach((sub, idx) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors';
        const isF = sub.grade === 'F';
        
        tr.innerHTML = `
          <td class="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700/80 text-center font-mono text-slate-500">${idx + 1}</td>
          <td class="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700/80 font-medium">
            <span class="text-slate-900 dark:text-slate-100 font-bold">${sub.name_bn}</span>
            ${sub.is_optional ? '<span class="ml-1 text-[10px] px-1.5 py-0.5 rounded-sm bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">৪র্থ বিষয়</span>' : ''}
            <span class="block text-[11px] text-slate-400 font-sans">${sub.name_en}</span>
          </td>
          <td class="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700/80 text-center font-mono text-slate-600 dark:text-slate-300">${ResultEngine.toBnDigit(sub.full_marks)}</td>
          <td class="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700/80 text-center font-mono font-bold ${isF ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100'}">${ResultEngine.toBnDigit(sub.marks_obtained)}</td>
          <td class="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700/80 text-center font-bold ${isF ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}">${sub.grade}</td>
          <td class="py-2.5 px-3 text-center font-mono font-bold ${isF ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}">${ResultEngine.formatGpa(sub.point)}</td>
        `;
        msSubjectsTableBody.appendChild(tr);
      });
    }

    // Footers
    if (msTotalFullMarksFoot) msTotalFullMarksFoot.textContent = ResultEngine.toBnDigit(student.max_possible_marks);
    if (msTotalMarksFoot) msTotalMarksFoot.textContent = ResultEngine.toBnDigit(student.total_marks);
    if (msGradeFoot) msGradeFoot.textContent = student.grade;
    if (msGpaFoot) msGpaFoot.textContent = ResultEngine.formatGpa(student.gpa);

    // QR Code
    if (msQrCodeBox) {
      const verifyUrl = `${window.location.origin}${window.location.pathname}?year=${student.year}&class=${student.class_id}&roll=${student.roll}`;
      msQrCodeBox.innerHTML = ResultEngine.generateVerificationQrSvg(verifyUrl, 80);
    }
  }

  function getPositionSuffix(pos) {
    if (pos === 1) return 'ম';
    if (pos === 2) return 'য়';
    if (pos === 3) return 'য়';
    if (pos === 4) return 'র্থ';
    if (pos === 5) return 'ম';
    if (pos === 6) return 'ষ্ঠ';
    return 'তম';
  }

  function renderTabulation(classId) {
    if (!tabulationTableBody) return;
    const classStudents = allStudents.filter(s => s.class_id === classId);

    // Sort by position
    classStudents.sort((a, b) => (a.position || 999) - (b.position || 999));

    tabulationTableBody.innerHTML = '';
    if (classStudents.length === 0) {
      tabulationTableBody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-slate-400">এই শ্রেণিতে কোনো শিক্ষার্থীর ডাটা পাওয়া যায়নি।</td></tr>`;
      return;
    }

    classStudents.forEach(st => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors';
      const isPassed = st.status === 'Passed';

      tr.innerHTML = `
        <td class="py-3 px-3 text-center font-bold">
          <span class="inline-flex items-center justify-center w-7 h-7 rounded-full ${st.position === 1 ? 'bg-amber-100 text-amber-700 font-extrabold border border-amber-300' : (st.position <= 3 ? 'bg-slate-100 text-slate-700 font-bold' : 'text-slate-500')} text-xs">
            ${ResultEngine.toBnDigit(st.position)}
          </span>
        </td>
        <td class="py-3 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">${ResultEngine.toBnDigit(st.roll)}</td>
        <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">
          ${st.student_name_bn}
          ${st.father_name_bn ? `<span class="block text-[11px] font-normal text-slate-400">পিতা: ${st.father_name_bn}</span>` : ''}
        </td>
        <td class="py-3 px-3 text-center font-mono font-bold ${isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}">${ResultEngine.formatGpa(st.gpa)}</td>
        <td class="py-3 px-3 text-center font-bold ${st.grade === 'A+' ? 'text-emerald-600' : (st.grade === 'F' ? 'text-rose-600' : 'text-blue-600')}">${st.grade}</td>
        <td class="py-3 px-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">${ResultEngine.toBnDigit(st.total_marks)}</td>
        <td class="py-3 px-3 text-center">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${isPassed ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'}">
            ${isPassed ? 'উত্তীর্ণ' : 'অকৃতকার্য'}
          </span>
        </td>
        <td class="py-3 px-3 text-center no-print">
          <button type="button" class="view-student-btn px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer" data-id="${st.id}">
            <i class="fas fa-eye text-emerald-600 mr-1"></i> মার্কশীট
          </button>
        </td>
      `;
      tabulationTableBody.appendChild(tr);
    });

    // Attach click events for quick marksheet view
    document.querySelectorAll('.view-student-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const studentId = btn.getAttribute('data-id');
        const st = allStudents.find(s => s.id === studentId);
        if (st) {
          renderMarksheet(st);
          const marksheetBtn = document.querySelector('[data-tab="marksheetTab"]');
          if (marksheetBtn) marksheetBtn.click();
          const marksheetCard = document.getElementById('marksheetContainer');
          marksheetCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function renderAnalytics() {
    const stats = ResultEngine.getClassAnalytics(allStudents);
    
    const statTotal = document.getElementById('statTotalStudents');
    const statPassed = document.getElementById('statPassedStudents');
    const statGpa5 = document.getElementById('statGpa5Count');
    const statPassRate = document.getElementById('statPassRate');

    if (statTotal) statTotal.textContent = ResultEngine.toBnDigit(stats.total_students);
    if (statPassed) statPassed.textContent = ResultEngine.toBnDigit(stats.passed);
    if (statGpa5) statGpa5.textContent = ResultEngine.toBnDigit(stats.gpa5_count);
    if (statPassRate) statPassRate.textContent = `${ResultEngine.toBnDigit(stats.pass_rate)}%`;

    const gradeDistributionBars = document.getElementById('gradeDistributionBars');
    if (gradeDistributionBars) {
      gradeDistributionBars.innerHTML = '';
      const grades = ['A+', 'A', 'A-', 'B', 'C', 'D', 'F'];
      const colors = {
        'A+': 'bg-emerald-500 text-emerald-700 dark:text-emerald-300 border-emerald-300',
        'A': 'bg-teal-500 text-teal-700 dark:text-teal-300 border-teal-300',
        'A-': 'bg-blue-500 text-blue-700 dark:text-blue-300 border-blue-300',
        'B': 'bg-indigo-500 text-indigo-700 dark:text-indigo-300 border-indigo-300',
        'C': 'bg-amber-500 text-amber-700 dark:text-amber-300 border-amber-300',
        'D': 'bg-orange-500 text-orange-700 dark:text-orange-300 border-orange-300',
        'F': 'bg-rose-500 text-rose-700 dark:text-rose-300 border-rose-300'
      };

      grades.forEach(g => {
        const count = stats.grade_counts[g] || 0;
        const pct = stats.total_students > 0 ? ((count / stats.total_students) * 100).toFixed(1) : 0;
        
        const col = document.createElement('div');
        col.className = 'p-3 rounded-2xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-center space-y-2';
        col.innerHTML = `
          <div class="text-sm font-extrabold text-slate-800 dark:text-slate-100">${g}</div>
          <div class="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl relative overflow-hidden flex items-end justify-center p-1">
            <div class="w-full ${colors[g].split(' ')[0]} rounded-lg transition-all duration-500" style="height: ${Math.max(pct, 6)}%;"></div>
          </div>
          <div class="font-mono font-bold text-sm text-slate-900 dark:text-white">${ResultEngine.toBnDigit(count)} জন</div>
          <div class="text-[10px] text-slate-400 font-semibold">${ResultEngine.toBnDigit(pct)}%</div>
        `;
        gradeDistributionBars.appendChild(col);
      });
    }
  }

  // Start on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
