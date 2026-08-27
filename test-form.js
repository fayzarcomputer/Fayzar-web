// Direct in-page test button
document.getElementById('btn-inpage-demo')?.addEventListener('click', () => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['fayzar_profiles', 'fayzar_settings'], (data) => {
      const profiles = data.fayzar_profiles || [];
      const settings = data.fayzar_settings || {};
      const active = profiles.find(p => p.id === settings.activeProfileId) || profiles[0];
      
      if (active && window.FayzarAutoFill && window.FayzarAutoFill.autoFillForm) {
        window.FayzarAutoFill.autoFillForm(active);
      } else {
        alert('কোনো প্রার্থী প্রোফাইল সংরক্ষিত নেই!');
      }
    });
  }
});

// Form submit handler
document.getElementById('job-application-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('ডেমো আবেদন সফলভাবে জমা হয়েছে!');
});
