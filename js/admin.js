// =========================================================================
// ডিজিটাল অ্যাডমিন কন্ট্রোল সেন্টার ইঞ্জিন (Next-Gen Admin Suite Engine)
// ফয়জার কম্পিউটার এন্ড ফটোস্ট্যাট v2.5
// =========================================================================

let currentAdminTab = 'dashboard';
let noticesList = [];
let servicesList = [];
let siteConfig = {};
let feedbacksList = [];
let dictionaryList = [];

let currentNoticeFilter = 'all';
let currentServiceFilter = 'all';
let currentFeedbackFilter = 'all';

// ১. সিকিউরিটি ও অথেনটিকেশন (PIN Security)
// =========================================================================
const DEFAULT_PIN = '101919';

function getStoredPin() {
  return localStorage.getItem('fayzar_admin_pin') || DEFAULT_PIN;
}

function checkAuth() {
  const isAuth = sessionStorage.getItem('fayzar_admin_session') === 'true';
  const loginScreen = document.getElementById('admin-login-screen');
  const dashboard = document.getElementById('admin-dashboard');

  if (isAuth) {
    loginScreen?.classList.add('hidden');
    dashboard?.classList.remove('hidden');
    initAdminSuite();
  } else {
    loginScreen?.classList.remove('hidden');
    dashboard?.classList.add('hidden');
  }
}

function togglePinVisibility() {
  const pinInput = document.getElementById('admin-pin-input');
  const icon = document.getElementById('pin-eye-icon');
  if (!pinInput || !icon) return;

  if (pinInput.type === 'password') {
    pinInput.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    pinInput.type = 'password';
    icon.className = 'fas fa-eye';
  }
}

document.getElementById('admin-login-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('admin-pin-input')?.value.trim();
  const errorMsg = document.getElementById('login-error-msg');
  const correctPin = getStoredPin();

  if (input === correctPin) {
    sessionStorage.setItem('fayzar_admin_session', 'true');
    checkAuth();
    showToast('সফলভাবে অ্যাডমিন প্যানেলে লগইন হয়েছে!', 'success');
  } else {
    if (errorMsg) {
      errorMsg.classList.remove('hidden');
      setTimeout(() => errorMsg.classList.add('hidden'), 3500);
    }
    showToast('ভুল পিন কোড! অনুগ্রহ করে পুনরায় চেষ্টা করুন।', 'error');
  }
});

function adminLogout() {
  if (confirm('আপনি কি নিশ্চিত যে অ্যাডমিন প্যানেল থেকে লগআউট করতে চান?')) {
    sessionStorage.removeItem('fayzar_admin_session');
    window.location.reload();
  }
}

function openChangePinModal() {
  document.getElementById('pin-modal')?.classList.remove('hidden');
}

function closeChangePinModal() {
  document.getElementById('pin-modal')?.classList.add('hidden');
}

function handleChangePinSubmit(e) {
  e.preventDefault();
  const curr = document.getElementById('current-pin')?.value.trim();
  const next = document.getElementById('new-pin')?.value.trim();
  const realPin = getStoredPin();

  if (curr !== realPin) {
    showToast('বর্তমান পিনটি সঠিক নয়!', 'error');
    return;
  }
  if (!next || next.length < 4) {
    showToast('নতুন পিন কমপক্ষে ৪ সংখ্যার হতে হবে!', 'warning');
    return;
  }

  localStorage.setItem('fayzar_admin_pin', next);
  closeChangePinModal();
  showToast('অ্যাডমিন পিন সফলভাবে পরিবর্তন করা হয়েছে!', 'success');
}

// ২. টোস্ট নোটিফিকেশন সিস্টেম
// =========================================================================
function showToast(message, type = 'info') {
  const box = document.getElementById('toast-box');
  if (!box) return;

  const toast = document.createElement('div');
  let bg = 'bg-slate-900 border-slate-700 text-white';
  let icon = '<i class="fas fa-info-circle text-blue-400"></i>';

  if (type === 'success') {
    bg = 'bg-emerald-950 border-emerald-500/50 text-emerald-100';
    icon = '<i class="fas fa-check-circle text-emerald-400"></i>';
  } else if (type === 'error') {
    bg = 'bg-rose-950 border-rose-500/50 text-rose-100';
    icon = '<i class="fas fa-exclamation-circle text-rose-400"></i>';
  } else if (type === 'warning') {
    bg = 'bg-amber-950 border-amber-500/50 text-amber-100';
    icon = '<i class="fas fa-triangle-exclamation text-amber-400"></i>';
  }

  toast.className = `${bg} border shadow-2xl rounded-2xl px-4 py-3 text-xs font-bold flex items-center gap-2.5 transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto max-w-sm`;
  toast.innerHTML = `${icon} <span>${message}</span>`;

  box.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ৩. ডেটা লোডিং ও ইনিশিয়ালাইজেশন
// =========================================================================
async function initAdminSuite() {
  try {
    // ১. নোটিশ লোড
    const nRes = await fetch('data/notices.json');
    if (nRes.ok) noticesList = await nRes.json();
  } catch (e) {
    noticesList = [];
  }

  try {
    // ২. সেবাসমূহ লোড
    const sRes = await fetch('data/services.json');
    if (sRes.ok) servicesList = await sRes.json();
  } catch (e) {
    servicesList = [];
  }

  try {
    // ৩. কনফিগারেশন লোড
    const cRes = await fetch('data/site_config.json');
    if (cRes.ok) siteConfig = await cRes.json();
  } catch (e) {
    siteConfig = {};
  }

  try {
    // ৪. ফিডব্যাক লোড
    const fRes = await fetch('/api/feedbacks');
    if (fRes.ok) {
      feedbacksList = await fRes.json();
    } else {
      const fbLocal = await fetch('data/feedbacks.json');
      if (fbLocal.ok) feedbacksList = await fbLocal.json();
    }
  } catch (e) {
    feedbacksList = [];
  }

  try {
    // ৫. কাস্টম ডিকশনারি লোড
    const dRes = await fetch('data/converter_dict.json');
    if (dRes.ok) dictionaryList = await dRes.json();
  } catch (e) {
    dictionaryList = [];
  }

  // কাউন্টার ও ব্যাজ আপডেট
  updateDashboardMetrics();
  populateSiteConfigForm();
  renderAdminNotices();
  renderAdminServices();
  renderAdminChecklist();
  renderAdminDictionary();
  renderAdminFeedbacks();
}

// ৪. ড্যাশবোর্ড ওভারভিউ ও মেট্রিক্স
// =========================================================================
function updateDashboardMetrics() {
  const notCount = noticesList.length;
  const srvCount = servicesList.length;
  const chkCount = servicesList.filter(s => s.category !== 'computer' && s.includeInChecklist !== false).length;
  const fbPending = feedbacksList.filter(f => f.status === 'pending').length;
  const fbTotal = feedbacksList.length;

  // Stat Cards
  document.getElementById('stat-notices-count').textContent = `${notCount} টি`;
  document.getElementById('stat-services-count').textContent = `${srvCount} টি`;
  document.getElementById('stat-checklist-count').textContent = `${chkCount} টি`;
  document.getElementById('stat-feedbacks-count').textContent = `${fbTotal} টি`;
  document.getElementById('stat-feedbacks-sub').textContent = `${fbPending} টি নতুন অপেক্ষারত`;

  // Tab Badges
  document.getElementById('tab-badge-notices').textContent = notCount;
  document.getElementById('tab-badge-services').textContent = srvCount;
  document.getElementById('tab-badge-checklist').textContent = chkCount;
  document.getElementById('tab-badge-dict').textContent = dictionaryList.length;
  document.getElementById('tab-badge-feedbacks').textContent = fbPending > 0 ? `${fbPending} নতুন` : fbTotal;
  document.getElementById('checklist-selected-count').textContent = chkCount;
}

// ৫. ট্যাব পরিবর্তন লজিক
// =========================================================================
function switchAdminTab(tabName) {
  currentAdminTab = tabName;
  const tabs = ['dashboard', 'site', 'notices', 'services', 'checklist', 'tools', 'feedbacks', 'backup'];

  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const panel = document.getElementById(`panel-${t}`);

    if (t === tabName) {
      btn?.classList.add('active-nav-tab');
      panel?.classList.remove('hidden');
    } else {
      btn?.classList.remove('active-nav-tab');
      panel?.classList.add('hidden');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ৬. সেকশন ও ওয়েবসাইট কনটেন্ট এডিটর
// =========================================================================
function populateSiteConfigForm() {
  if (!siteConfig.shop) return;
  const shop = siteConfig.shop;
  const hero = siteConfig.hero || {};
  const sec = siteConfig.sections || {};

  document.getElementById('cfg-shop-name').value = shop.name || '';
  document.getElementById('cfg-shop-tagline').value = shop.tagline || '';
  document.getElementById('cfg-shop-phone').value = shop.phone || '';
  document.getElementById('cfg-shop-whatsapp').value = shop.whatsapp || '';
  document.getElementById('cfg-shop-address').value = shop.address || '';
  document.getElementById('cfg-shop-mapurl').value = shop.mapUrl || '';
  document.getElementById('cfg-shop-proprietor').value = shop.proprietor || '';
  document.getElementById('cfg-shop-approval').value = shop.approvalNo || '';
  document.getElementById('cfg-shop-announcement').value = shop.announcement || '';
  document.getElementById('cfg-hours-weekdays').value = shop.hoursWeekdays || '';
  document.getElementById('cfg-hours-friday').value = shop.hoursFriday || '';

  document.getElementById('cfg-hero-badge').value = hero.badge || '';
  document.getElementById('cfg-hero-title').value = hero.title || '';
  document.getElementById('cfg-hero-subtitle').value = hero.subtitle || '';

  document.getElementById('cfg-sec-notices').checked = sec.heroNotices !== false;
  document.getElementById('cfg-sec-checklist').checked = sec.checklist !== false;
  document.getElementById('cfg-sec-services').checked = sec.services !== false;
  document.getElementById('cfg-sec-tools').checked = sec.toolsGateway !== false;
  document.getElementById('cfg-sec-quickform').checked = sec.quickRequest === true;
  document.getElementById('cfg-sec-feedback').checked = sec.feedback !== false;
}

async function saveSiteConfig() {
  siteConfig = {
    shop: {
      name: document.getElementById('cfg-shop-name')?.value.trim(),
      tagline: document.getElementById('cfg-shop-tagline')?.value.trim(),
      phone: document.getElementById('cfg-shop-phone')?.value.trim(),
      whatsapp: document.getElementById('cfg-shop-whatsapp')?.value.trim(),
      address: document.getElementById('cfg-shop-address')?.value.trim(),
      mapUrl: document.getElementById('cfg-shop-mapurl')?.value.trim(),
      proprietor: document.getElementById('cfg-shop-proprietor')?.value.trim(),
      approvalNo: document.getElementById('cfg-shop-approval')?.value.trim(),
      announcement: document.getElementById('cfg-shop-announcement')?.value.trim(),
      hoursWeekdays: document.getElementById('cfg-hours-weekdays')?.value.trim(),
      hoursFriday: document.getElementById('cfg-hours-friday')?.value.trim()
    },
    hero: {
      badge: document.getElementById('cfg-hero-badge')?.value.trim(),
      title: document.getElementById('cfg-hero-title')?.value.trim(),
      subtitle: document.getElementById('cfg-hero-subtitle')?.value.trim()
    },
    sections: {
      heroNotices: document.getElementById('cfg-sec-notices')?.checked,
      checklist: document.getElementById('cfg-sec-checklist')?.checked,
      services: document.getElementById('cfg-sec-services')?.checked,
      toolsGateway: document.getElementById('cfg-sec-tools')?.checked,
      quickRequest: document.getElementById('cfg-sec-quickform')?.checked,
      feedback: document.getElementById('cfg-sec-feedback')?.checked
    }
  };

  try {
    const res = await fetch('/api/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteConfig)
    });
    if (res.ok) {
      showToast('ওয়েবসাইটের কনফিগারেশন সফলভাবে সার্ভারে সংরক্ষিত হয়েছে!', 'success');
    } else {
      showToast('কনফিগারেশন লোকাল মেমরিতে সংরক্ষিত হয়েছে।', 'info');
    }
  } catch (err) {
    localStorage.setItem('fayzar_site_config', JSON.stringify(siteConfig));
    showToast('সার্ভার অফলাইন, লোকাল স্টোরেজে সংরক্ষিত হয়েছে।', 'warning');
  }
}

// ৭. নোটিশ ম্যানেজমেন্ট লজিক
// =========================================================================
function filterNotices(cat) {
  currentNoticeFilter = cat;
  ['all', 'jobs', 'college'].forEach(c => {
    const btn = document.getElementById(`n-filter-${c}`);
    if (c === cat) {
      btn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white';
    } else {
      btn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700';
    }
  });
  renderAdminNotices();
}

function renderAdminNotices() {
  const container = document.getElementById('admin-notices-container');
  if (!container) return;

  const query = document.getElementById('search-notices-input')?.value.toLowerCase().trim() || '';

  let list = noticesList.filter(n => {
    if (currentNoticeFilter !== 'all' && n.category !== currentNoticeFilter) return false;
    if (query) {
      const matchTitle = (n.title || '').toLowerCase().includes(query);
      const matchOrg = (n.org || '').toLowerCase().includes(query);
      const matchSumm = (n.summary || '').toLowerCase().includes(query);
      return matchTitle || matchOrg || matchSumm;
    }
    return true;
  });

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400">
        <i class="fas fa-folder-open text-3xl mb-2 block text-slate-600"></i>
        কোনো নোটিশ পাওয়া যায়নি।
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(n => {
    const isJob = n.category === 'jobs';
    const catBadge = isJob 
      ? '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">💼 চাকরির সার্কুলার</span>'
      : '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">🎓 স্কুল ও কলেজ</span>';

    const hotBadge = n.isHot ? '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">🔥 হট</span>' : '';

    return `
      <div class="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 hover:border-blue-500/40 transition group">
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 flex-wrap">${catBadge} ${hotBadge}</div>
            <span class="text-[11px] font-mono text-amber-400 font-bold"><i class="fas fa-clock text-[9px]"></i> ${n.deadline || 'চলমান'}</span>
          </div>

          <div class="text-[11px] font-bold text-slate-400">${n.org || 'প্রতিষ্ঠান'}</div>
          <h4 class="text-sm font-black text-white group-hover:text-blue-300 transition line-clamp-2">${n.title}</h4>
          <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">${n.summary || ''}</p>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <button onclick="toggleNoticeHot('${n.id}')" class="text-slate-400 hover:text-amber-400 transition" title="হট নোটিশ টগল করুন">
            <i class="fas fa-fire ${n.isHot ? 'text-rose-500' : ''}"></i>
          </button>
          
          <div class="flex items-center gap-2">
            <button onclick="openNoticeModal('${n.id}')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold transition">
              <i class="fas fa-pen-to-square"></i> এডিট
            </button>
            <button onclick="deleteNotice('${n.id}')" class="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 transition" title="মুছে ফেলুন">
              <i class="fas fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openNoticeModal(id = null) {
  const modal = document.getElementById('notice-modal');
  const title = document.getElementById('notice-modal-title');
  const form = document.getElementById('notice-form');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('n-edit-id').value = '';

  if (id) {
    const item = noticesList.find(n => n.id === id);
    if (item) {
      title.innerHTML = '<i class="fas fa-pen-to-square text-blue-400"></i> নোটিশ তথ্য সম্পাদনা';
      document.getElementById('n-edit-id').value = item.id;
      document.getElementById('n-category').value = item.category || 'jobs';
      document.getElementById('n-org').value = item.org || '';
      document.getElementById('n-title').value = item.title || '';
      document.getElementById('n-deadline').value = item.deadline || '';
      document.getElementById('n-link').value = item.link || '';
      document.getElementById('n-summary').value = item.summary || '';
      document.getElementById('n-is-hot').checked = item.isHot === true;
    }
  } else {
    title.innerHTML = '<i class="fas fa-plus-circle text-blue-400"></i> নতুন নোটিশ যুক্ত করুন';
  }

  modal.classList.remove('hidden');
}

function closeNoticeModal() {
  document.getElementById('notice-modal')?.classList.add('hidden');
}

function handleNoticeSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('n-edit-id')?.value;
  const category = document.getElementById('n-category')?.value;
  const org = document.getElementById('n-org')?.value.trim();
  const title = document.getElementById('n-title')?.value.trim();
  const deadline = document.getElementById('n-deadline')?.value.trim();
  const link = document.getElementById('n-link')?.value.trim();
  const summary = document.getElementById('n-summary')?.value.trim();
  const isHot = document.getElementById('n-is-hot')?.checked;

  if (id) {
    const idx = noticesList.findIndex(n => n.id === id);
    if (idx !== -1) {
      noticesList[idx] = { ...noticesList[idx], category, org, title, deadline, link, summary, isHot };
      showToast('নোটিশ সফলভাবে আপডেট হয়েছে!', 'success');
    }
  } else {
    const newNotice = {
      id: 'notice-' + Date.now(),
      category,
      org,
      title,
      deadline,
      link,
      summary,
      isHot,
      date: new Date().toISOString().split('T')[0]
    };
    noticesList.unshift(newNotice);
    showToast('নতুন নোটিশ যুক্ত করা হয়েছে!', 'success');
  }

  closeNoticeModal();
  renderAdminNotices();
  updateDashboardMetrics();
  saveNoticesToServer();
}

function toggleNoticeHot(id) {
  const item = noticesList.find(n => n.id === id);
  if (item) {
    item.isHot = !item.isHot;
    renderAdminNotices();
    saveNoticesToServer();
  }
}

function deleteNotice(id) {
  if (confirm('আপনি কি নিশ্চিতভাবে এই নোটিশটি মুছে ফেলতে চান?')) {
    noticesList = noticesList.filter(n => n.id !== id);
    renderAdminNotices();
    updateDashboardMetrics();
    saveNoticesToServer();
    showToast('নোটিশ মুছে ফেলা হয়েছে!', 'info');
  }
}

async function saveNoticesToServer() {
  try {
    const res = await fetch('/api/save-notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noticesList)
    });
    if (res.ok) {
      console.log('Notices synced to server');
    }
  } catch (err) {
    localStorage.setItem('fayzar_notices', JSON.stringify(noticesList));
  }
}

// ৮. সেবাসমূহ ও ফি তালিকা ম্যানেজমেন্ট
// =========================================================================
function filterServices(cat) {
  currentServiceFilter = cat;
  ['all', 'land', 'online', 'computer'].forEach(c => {
    const btn = document.getElementById(`s-filter-${c}`);
    if (c === cat) {
      btn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white';
    } else {
      btn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700';
    }
  });
  renderAdminServices();
}

function renderAdminServices() {
  const container = document.getElementById('admin-services-container');
  if (!container) return;

  const query = document.getElementById('search-services-input')?.value.toLowerCase().trim() || '';

  let list = servicesList.filter(s => {
    if (currentServiceFilter !== 'all' && s.category !== currentServiceFilter) return false;
    if (query) {
      const matchTitle = (s.title || '').toLowerCase().includes(query);
      const matchDocs = (s.documents || []).some(d => d.toLowerCase().includes(query));
      return matchTitle || matchDocs;
    }
    return true;
  });

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400">
        <i class="fas fa-box-open text-3xl mb-2 block text-slate-600"></i>
        কোনো সেবা পাওয়া যায়নি।
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(s => {
    let catText = 'ডিজিটাল সেবা';
    let catColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (s.category === 'land') {
      catText = '🏛️ ভূমিসেবা';
      catColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    } else if (s.category === 'online') {
      catText = '🌐 অনলাইন সেবা';
      catColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    } else if (s.category === 'computer') {
      catText = '💻 কম্পিউটার/স্টুডিও';
      catColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }

    return `
      <div class="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition group">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full ${catColor} border">${catText}</span>
            <span class="text-[11px] text-slate-400 font-bold"><i class="fas fa-stopwatch"></i> ${s.duration || 'তাৎক্ষণিক'}</span>
          </div>

          <h4 class="text-sm font-black text-white group-hover:text-emerald-300 transition line-clamp-2">${s.title}</h4>

          <div class="grid grid-cols-2 gap-2 text-xs pt-1">
            <div class="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
              <span class="text-[10px] text-slate-400 block font-bold">সরকারি ফি:</span>
              <strong class="text-white text-xs font-bold">${s.govtFee || '০ ৳'}</strong>
            </div>
            <div class="bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/30">
              <span class="text-[10px] text-emerald-400 block font-bold">দোকানের চার্জ:</span>
              <strong class="text-emerald-300 text-xs font-bold">${s.serviceFee || '৫০ ৳'}</strong>
            </div>
          </div>

          <div class="text-[11px] text-slate-400 pt-1">
            <i class="fas fa-file-lines text-amber-400 mr-1"></i> প্রয়োজনীয় কাগজপত্র: <strong class="text-slate-300">${(s.documents || []).length} টি</strong>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 text-xs">
          <button onclick="openServiceModal('${s.id}')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold transition">
            <i class="fas fa-pen-to-square"></i> এডিট
          </button>
          <button onclick="deleteService('${s.id}')" class="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 transition" title="মুছে ফেলুন">
            <i class="fas fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openServiceModal(id = null) {
  const modal = document.getElementById('service-modal');
  const title = document.getElementById('service-modal-title');
  const form = document.getElementById('service-form');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('s-edit-id').value = '';

  if (id) {
    const item = servicesList.find(s => s.id === id);
    if (item) {
      title.innerHTML = '<i class="fas fa-pen-to-square text-emerald-400"></i> সেবার তথ্য সম্পাদনা';
      document.getElementById('s-edit-id').value = item.id;
      document.getElementById('s-category').value = item.category || 'land';
      document.getElementById('s-title').value = item.title || '';
      document.getElementById('s-duration').value = item.duration || '';
      document.getElementById('s-govtfee').value = item.govtFee || '';
      document.getElementById('s-servicefee').value = item.serviceFee || '';
      document.getElementById('s-documents').value = (item.documents || []).join('\n');
      document.getElementById('s-guide').value = item.guide || '';
    }
  } else {
    title.innerHTML = '<i class="fas fa-plus-circle text-emerald-400"></i> নতুন সেবা যুক্ত করুন';
  }

  modal.classList.remove('hidden');
}

function closeServiceModal() {
  document.getElementById('service-modal')?.classList.add('hidden');
}

function handleServiceSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('s-edit-id')?.value;
  const category = document.getElementById('s-category')?.value;
  const title = document.getElementById('s-title')?.value.trim();
  const duration = document.getElementById('s-duration')?.value.trim();
  const govtFee = document.getElementById('s-govtfee')?.value.trim();
  const serviceFee = document.getElementById('s-servicefee')?.value.trim();
  const rawDocs = document.getElementById('s-documents')?.value.trim();
  const guide = document.getElementById('s-guide')?.value.trim();

  const documents = rawDocs ? rawDocs.split('\n').map(d => d.trim()).filter(Boolean) : [];

  if (id) {
    const idx = servicesList.findIndex(s => s.id === id);
    if (idx !== -1) {
      servicesList[idx] = { ...servicesList[idx], category, title, duration, govtFee, serviceFee, documents, guide };
      showToast('সেবার তথ্য সফলভাবে আপডেট হয়েছে!', 'success');
    }
  } else {
    const newService = {
      id: 'service-' + Date.now(),
      category,
      title,
      duration,
      govtFee,
      serviceFee,
      documents,
      guide,
      includeInChecklist: category !== 'computer'
    };
    servicesList.unshift(newService);
    showToast('নতুন সেবা সফলভাবে যুক্ত হয়েছে!', 'success');
  }

  closeServiceModal();
  renderAdminServices();
  renderAdminChecklist();
  updateDashboardMetrics();
  saveServicesToServer();
}

function deleteService(id) {
  if (confirm('আপনি কি নিশ্চিতভাবে এই সেবাটি মুছে ফেলতে চান?')) {
    servicesList = servicesList.filter(s => s.id !== id);
    renderAdminServices();
    renderAdminChecklist();
    updateDashboardMetrics();
    saveServicesToServer();
    showToast('সেবাটি মুছে ফেলা হয়েছে!', 'info');
  }
}

async function saveServicesToServer() {
  try {
    const res = await fetch('/api/save-services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(servicesList)
    });
    if (res.ok) {
      console.log('Services synced to server');
    }
  } catch (err) {
    localStorage.setItem('fayzar_services', JSON.stringify(servicesList));
  }
}

// ৯. চেকলিস্ট ক্যালকুলেটর সেটিংস
// =========================================================================
function renderAdminChecklist() {
  const container = document.getElementById('admin-checklist-items-list');
  if (!container) return;

  container.innerHTML = servicesList.map(s => {
    const isIncluded = s.includeInChecklist !== false && s.category !== 'computer';
    const isComp = s.category === 'computer';

    return `
      <div class="glass-card rounded-xl p-3.5 flex items-center justify-between gap-3 border ${isIncluded ? 'border-teal-500/40 bg-teal-950/20' : 'border-slate-800'}">
        <div class="flex items-center gap-3">
          <input type="checkbox" id="chk-${s.id}" ${isIncluded ? 'checked' : ''} onchange="toggleChecklistInclusion('${s.id}')" class="w-4 h-4 rounded text-teal-600 focus:ring-0 cursor-pointer">
          <div>
            <label for="chk-${s.id}" class="text-xs font-bold text-white cursor-pointer block">${s.title}</label>
            <span class="text-[10px] text-slate-400 font-semibold">
              ${isComp ? '<span class="text-amber-400 font-bold">কম্পিউটার/স্টুডিও</span> • ' : ''}
              কাগজপত্র: ${(s.documents || []).length} টি • ফি: ${s.govtFee || 'নিয়ম অনুযায়ী'}
            </span>
          </div>
        </div>

        <button onclick="openServiceModal('${s.id}')" class="text-slate-400 hover:text-teal-300 text-xs p-1" title="ডকুমেন্টস এডিট করুন">
          <i class="fas fa-edit"></i>
        </button>
      </div>
    `;
  }).join('');
}

function toggleChecklistInclusion(id) {
  const s = servicesList.find(item => item.id === id);
  if (s) {
    s.includeInChecklist = !s.includeInChecklist;
    renderAdminChecklist();
    updateDashboardMetrics();
    saveServicesToServer();
    showToast(`'${s.title}' চেকলিস্টের স্থিতি আপডেট করা হয়েছে।`, 'info');
  }
}

// ১০. টুলস ও কনভার্টার কাস্টম ডিকশনারি
// =========================================================================
function renderAdminDictionary() {
  const tbody = document.getElementById('admin-dictionary-tbody');
  if (!tbody) return;

  if (dictionaryList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="py-8 text-center text-slate-500">কোনো সংরক্ষিত শব্দ পাওয়া যায়নি।</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = dictionaryList.map(item => `
    <tr class="hover:bg-slate-900/40 transition">
      <td class="py-3 px-4 font-bold text-emerald-400">${item.unicode}</td>
      <td class="py-3 px-4 font-mono text-amber-300 font-semibold">${item.bijoy}</td>
      <td class="py-3 px-4 text-slate-400">${item.note || '-'}</td>
      <td class="py-3 px-4 text-right">
        <button onclick="deleteDictWord('${item.id}')" class="text-rose-400 hover:text-rose-300 text-xs p-1" title="মুছে ফেলুন">
          <i class="fas fa-trash-can"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function openDictModal() {
  document.getElementById('dict-modal')?.classList.remove('hidden');
}

function closeDictModal() {
  document.getElementById('dict-modal')?.classList.add('hidden');
}

function handleDictSubmit(e) {
  e.preventDefault();
  const unicode = document.getElementById('dict-unicode')?.value.trim();
  const bijoy = document.getElementById('dict-bijoy')?.value.trim();
  const note = document.getElementById('dict-note')?.value.trim();

  if (!unicode || !bijoy) {
    showToast('ইউনিকোড ও বিজয় উভয় ফিল্ডই আবশ্যক!', 'warning');
    return;
  }

  const newWord = {
    id: 'dict-' + Date.now(),
    unicode,
    bijoy,
    note
  };

  dictionaryList.unshift(newWord);
  closeDictModal();
  renderAdminDictionary();
  updateDashboardMetrics();
  saveDictionaryToServer();
  showToast('নতুন বানান ম্যাপিং যুক্ত হয়েছে!', 'success');
}

function deleteDictWord(id) {
  if (confirm('আপনি কি এই শব্দের ম্যাপিং মুছে ফেলতে চান?')) {
    dictionaryList = dictionaryList.filter(d => d.id !== id);
    renderAdminDictionary();
    updateDashboardMetrics();
    saveDictionaryToServer();
    showToast('শব্দটি মুছে ফেলা হয়েছে!', 'info');
  }
}

async function saveDictionaryToServer() {
  try {
    const res = await fetch('/api/save-dictionary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dictionaryList)
    });
    if (res.ok) {
      showToast('কাস্টম অভিধান সফলভাবে সার্ভারে সংরক্ষিত হয়েছে!', 'success');
    }
  } catch (err) {
    localStorage.setItem('fayzar_converter_dict', JSON.stringify(dictionaryList));
  }
}

// ১১. গ্রাহক মতামত ও রিভিউ যাচাই-বাছাই
// =========================================================================
function filterFeedbacks(status) {
  currentFeedbackFilter = status;
  ['all', 'pending', 'approved'].forEach(s => {
    const btn = document.getElementById(`fb-filter-${s}`);
    if (s === status) {
      btn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white';
    } else {
      btn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700';
    }
  });
  renderAdminFeedbacks();
}

function renderAdminFeedbacks() {
  const container = document.getElementById('admin-feedbacks-container');
  if (!container) return;

  const query = document.getElementById('search-feedbacks-input')?.value.toLowerCase().trim() || '';

  let list = feedbacksList.filter(f => {
    if (currentFeedbackFilter !== 'all' && f.status !== currentFeedbackFilter) return false;
    if (query) {
      const matchName = (f.name || '').toLowerCase().includes(query);
      const matchContact = (f.contact || '').toLowerCase().includes(query);
      const matchMsg = (f.message || '').toLowerCase().includes(query);
      return matchName || matchContact || matchMsg;
    }
    return true;
  });

  if (list.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-slate-400 glass-card rounded-2xl">
        <i class="fas fa-inbox text-3xl mb-2 block text-slate-600"></i>
        কোনো গ্রাহক মতামত পাওয়া যায়নি।
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(f => {
    const isAppr = f.status === 'approved';
    const statusBadge = isAppr
      ? '<span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">✅ অনুমোদিত</span>'
      : '<span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">⏳ নতুন অপেক্ষারত</span>';

    const stars = Array.from({ length: 5 }).map((_, i) => `
      <i class="fas fa-star text-xs ${i < (f.rating || 5) ? 'text-amber-400' : 'text-slate-700'}"></i>
    `).join('');

    const formattedDate = f.date ? new Date(f.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

    return `
      <div class="glass-card rounded-2xl p-4 sm:p-5 space-y-3 border hover:border-rose-500/40 transition">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm">
              <i class="fas fa-user"></i>
            </div>
            <div>
              <h5 class="text-sm font-black text-white flex items-center gap-2">
                <span>${f.name || 'বেনামী গ্রাহক'}</span>
                ${statusBadge}
              </h5>
              <div class="text-[11px] text-slate-400 flex items-center gap-2">
                <span><i class="fas fa-phone text-[10px] text-emerald-400 mr-1"></i>${f.contact || 'মোবাইল উল্লেখ নেই'}</span>
                <span>•</span>
                <span>${f.category || 'সাধারণ মতামত'}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3 self-end sm:self-auto">
            <div class="flex items-center gap-0.5">${stars}</div>
            <span class="text-[11px] text-slate-500">${formattedDate}</span>
          </div>
        </div>

        <p class="text-xs text-slate-200 leading-relaxed font-normal bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
          "${f.message}"
        </p>

        <div class="flex items-center justify-between pt-1">
          <span class="text-[10px] text-slate-500 font-mono">ID: ${f.id}</span>
          
          <div class="flex items-center gap-2">
            ${!isAppr ? `
              <button onclick="approveFeedback('${f.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition flex items-center gap-1">
                <i class="fas fa-check"></i> অনুমোদন করুন
              </button>
            ` : `
              <button onclick="unapproveFeedback('${f.id}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition flex items-center gap-1">
                <i class="fas fa-rotate-left"></i> পেন্ডিং করুন
              </button>
            `}
            <button onclick="deleteFeedback('${f.id}')" class="px-2.5 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900 text-rose-300 text-xs transition" title="মুছে ফেলুন">
              <i class="fas fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function approveFeedback(id) {
  const item = feedbacksList.find(f => f.id === id);
  if (item) {
    item.status = 'approved';
    renderAdminFeedbacks();
    updateDashboardMetrics();
    saveFeedbacksToServer();
    showToast('গ্রাহকের মতামত সফলভাবে অনুমোদিত হয়েছে!', 'success');
  }
}

function unapproveFeedback(id) {
  const item = feedbacksList.find(f => f.id === id);
  if (item) {
    item.status = 'pending';
    renderAdminFeedbacks();
    updateDashboardMetrics();
    saveFeedbacksToServer();
    showToast('মতামতটি অপেক্ষারত তালিকায় স্থানান্তর করা হয়েছে।', 'info');
  }
}

function deleteFeedback(id) {
  if (confirm('আপনি কি নিশ্চিতভাবে এই মতামতটি মুছে ফেলতে চান?')) {
    feedbacksList = feedbacksList.filter(f => f.id !== id);
    renderAdminFeedbacks();
    updateDashboardMetrics();
    saveFeedbacksToServer();
    showToast('মতামতটি মুছে ফেলা হয়েছে!', 'info');
  }
}

async function saveFeedbacksToServer() {
  try {
    const res = await fetch('/api/save-feedbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbacksList)
    });
    if (res.ok) {
      showToast('গ্রাহক মতামত সফলভাবে সার্ভারে সংরক্ষিত হয়েছে!', 'success');
    }
  } catch (err) {
    localStorage.setItem('fayzar_contact_feedbacks', JSON.stringify(feedbacksList));
  }
}

function exportFeedbacksCSV() {
  if (feedbacksList.length === 0) {
    showToast('এক্সপোর্ট করার জন্য কোনো মতামত নেই!', 'warning');
    return;
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
  csvContent += 'ID,নাম,মোবাইল/ইমেইল,ক্যাটাগরি,রেটিং,স্ট্যাটাস,তারিখ,মন্তব্য\r\n';

  feedbacksList.forEach(f => {
    const row = [
      `"${f.id}"`,
      `"${(f.name || '').replace(/"/g, '""')}"`,
      `"${(f.contact || '').replace(/"/g, '""')}"`,
      `"${(f.category || '').replace(/"/g, '""')}"`,
      `"${f.rating || 5}"`,
      `"${f.status || 'pending'}"`,
      `"${f.date || ''}"`,
      `"${(f.message || '').replace(/"/g, '""')}"`
    ];
    csvContent += row.join(',') + '\r\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `fayzar_customer_feedbacks_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast('গ্রাহক মতামতের CSV ফাইল ডাউনলোড হয়েছে!', 'success');
}

// ১২. গ্লোবাল সেভ ও ব্যাকআপ ডেটা
// =========================================================================
async function saveAllToServer() {
  showToast('সার্ভারে সকল ডেটা সিঙ্ক করা হচ্ছে...', 'info');

  await saveSiteConfig();
  await saveNoticesToServer();
  await saveServicesToServer();
  await saveDictionaryToServer();
  await saveFeedbacksToServer();

  showToast('আলহামদুলিল্লাহ! সমস্ত পরিবর্তন সার্ভারে সংরক্ষিত হয়েছে।', 'success');
}

function exportFullBackupJSON() {
  const fullBackup = {
    version: '2.5',
    exportedAt: new Date().toISOString(),
    siteConfig,
    notices: noticesList,
    services: servicesList,
    dictionary: dictionaryList,
    feedbacks: feedbacksList
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `fayzar_complete_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast('সম্পূর্ণ ওয়েবসাইটের ব্যাকআপ JSON ফাইল ডাউনলোড হয়েছে!', 'success');
}

function importBackupFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const backup = JSON.parse(e.target.result);
      if (!backup.notices && !backup.services && !backup.siteConfig) {
        showToast('অবৈধ ব্যাকআপ ফাইল!', 'error');
        return;
      }

      if (confirm('আপনি কি এই ব্যাকআপ ফাইলটি রিস্টোর করতে চান? বর্তমান ডেটা প্রতিস্থাপিত হবে।')) {
        const res = await fetch('/api/import-backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backup)
        });

        if (res.ok) {
          showToast('ব্যাকআপ সফলভাবে রিস্টোর হয়েছে! পেজ রিলোড হচ্ছে...', 'success');
          setTimeout(() => window.location.reload(), 1200);
        } else {
          showToast('সার্ভারে রিস্টোর ব্যর্থ হয়েছে!', 'error');
        }
      }
    } catch (err) {
      showToast('JSON ফাইল পার্স করতে ত্রুটি হয়েছে!', 'error');
    }
  };
  reader.readAsText(file);
}

async function syncToGitHubFromAdmin() {
  if (!confirm('আপনি কি এই মুহূর্তের সমস্ত ফাইল ও আপডেট ১-ক্লিকে গিটহাবে লাইভ করতে চান?')) return;
  showToast('গিটহাবে আপডেট পাঠানো হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...', 'info');

  try {
    const res = await fetch('/api/sync-github', { method: 'POST' });
    if (res.ok) {
      showToast('গিটহাব সিঙ্ক সফলভাবে শুরু হয়েছে! কিছুক্ষণের মধ্যে লাইভ সাইট আপডেট হয়ে যাবে।', 'success');
    } else {
      showToast('সার্ভার সিঙ্কে সমস্যা হয়েছে। ফোল্ডারের sync-to-github.bat চালান।', 'warning');
    }
  } catch (err) {
    showToast('অফলাইন মোড। fayzar-computer-v2 ফোল্ডারের sync-to-github.bat ফাইলে ডাবল-ক্লিক করুন।', 'info');
  }
}

// স্ক্রিপ্ট এক্সিকিউশন
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});
