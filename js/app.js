/**
 * ZEST TOURNAMENT - MAIN APPLICATION LOGIC
 */

const AppUI = (function () {
  function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
      
      navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => navLinks.classList.remove('active'));
      });
    }
  }

  function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function setupModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('.modal-close-btn')) {
          modal.classList.remove('active');
        }
      });
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
      }
    });
  }

  function openQRModal() {
    const modal = document.getElementById('qr-modal');
    const container = document.getElementById('qr-modal-content');
    if (modal && container && window.AppUploader) {
      window.AppUploader.renderQRCode('assets/downloads/zest-tournament-v1.4.2.apk', container);
      modal.classList.add('active');
    }
  }

  function openInstallGuideModal() {
    const modal = document.getElementById('install-guide-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  function openUploadAppModal() {
    const modal = document.getElementById('upload-app-modal');
    if (modal) {
      // Pre-fill existing metadata
      if (window.AppUploader) {
        window.AppUploader.getCurrentRelease().then(release => {
          document.getElementById('input-version').value = release.version || 'v1.4.2';
          document.getElementById('input-app-name').value = release.appName || 'Zest Tournament';
          document.getElementById('input-custom-url').value = release.downloadUrl || '';
          document.getElementById('input-changelog').value = (release.changelog || []).join('\n');
        });
      }
      modal.classList.add('active');
    }
  }

  async function openIOSModal() {
    if (window.AppUploader) {
      const release = await window.AppUploader.getCurrentRelease();
      window.AppUploader.triggerIOSAction(release);
    } else {
      const modal = document.getElementById('ios-modal');
      if (modal) modal.classList.add('active');
    }
  }

  async function openBrowserPlayModal() {
    if (window.AppUploader) {
      const release = await window.AppUploader.getCurrentRelease();
      window.AppUploader.triggerBrowserAction(release);
    } else {
      const tournamentsEl = document.getElementById('tournaments');
      if (tournamentsEl) {
        tournamentsEl.scrollIntoView({ behavior: 'smooth' });
      }
      showToast('🌐 Welcome to Instant Web Arena! Pick any match below to join.', 'info');
    }
  }

  return {
    init: function () {
      initHeader();
      setupModals();
    },
    showToast,
    openQRModal,
    openInstallGuideModal,
    openIOSModal,
    openBrowserPlayModal,
    openUploadAppModal
  };
})();

window.AppUI = AppUI;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  AppUI.init();
  if (window.AppUploader) {
    await AppUploader.init();
  }
  if (window.TournamentsManager) {
    TournamentsManager.init();
  }
  if (window.BracketsLeaderboard) {
    BracketsLeaderboard.init();
  }
});
