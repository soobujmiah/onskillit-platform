(() => {
  try {
    const stored = localStorage.getItem('onskillit-preview-theme');
    if (stored === 'dark' || stored === 'light') document.documentElement.dataset.theme = stored;
  } catch { /* storage may be unavailable */ }
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('onskillit-preview-theme', next); } catch { /* no persistence */ }
  });
})();
