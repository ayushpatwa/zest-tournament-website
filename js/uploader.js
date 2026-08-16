/**
 * ZEST TOURNAMENT - MULTI-PLATFORM APP RELEASE & SECURE UPLOADER
 * Handles Android (.APK), iOS (.IPA / TestFlight), and Web Portal links with Owner Security.
 */

const AppUploader = (function () {
  const DB_NAME = 'ZestTournamentDB';
  const DB_VERSION = 2;
  const STORE_NAME = 'app_releases';
  
  // Default Admin Access Key: ZEST#ADMIN2026
  const DEFAULT_ADMIN_KEY = 'ZEST#ADMIN2026';

  // Default Multi-Platform Release Config
  const defaultRelease = {
    appName: 'Zest Tournament - Free Fire Esports',
    // Android config
    androidVersion: 'v1.4.2',
    androidFileSize: '42.5 MB',
    androidFileName: 'zest-tournament-v1.4.2.apk',
    androidDownloadUrl: 'assets/downloads/zest-tournament-v1.4.2.apk',
    
    // iOS config
    iosVersion: 'v1.4.2',
    iosFileSize: '48.0 MB',
    iosFileName: 'zest-tournament-v1.4.2.ipa',
    iosDownloadUrl: '', // e.g. TestFlight link or App Store link or custom IPA
    iosMode: 'guide', // 'guide' (Safari PWA) or 'link' (TestFlight/AppStore/IPA)
    
    // Web Arena config
    browserPlayUrl: '#tournaments',
    
    // Universal Meta
    releaseDate: 'August 2026',
    downloadCount: 14850,
    minAndroid: 'Android 7.0+',
    minIOS: 'iOS 14.0+',
    changelog: [
      '⚡ Instant Booyah Prize Auto-Credit to UPI',
      '🔥 Free Fire MAX Bermuda & Purgatory Custom Room auto-detection',
      '🛡️ Advanced FairPlay Anti-Cheat with UID sync',
      '🎮 Clash Squad 4v4 & Lone Wolf 1v1 instant room notifications'
    ]
  };

  let db = null;

  // Simple string hash helper for verification
  async function hashKey(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str.trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Get current admin password hash
  async function getStoredAdminHash() {
    let hash = localStorage.getItem('zest_admin_hash');
    if (!hash) {
      hash = await hashKey(DEFAULT_ADMIN_KEY);
      localStorage.setItem('zest_admin_hash', hash);
    }
    return hash;
  }

  // Check if current session is authenticated as Admin
  function isAuthenticated() {
    return sessionStorage.getItem('zest_admin_session') === 'true';
  }

  // Authenticate Admin with entered key
  async function verifyAdminKey(inputKey) {
    const targetHash = await getStoredAdminHash();
    const enteredHash = await hashKey(inputKey);
    if (enteredHash === targetHash) {
      sessionStorage.setItem('zest_admin_session', 'true');
      return true;
    }
    return false;
  }

  // Change Admin Key (Only when already authenticated)
  async function changeAdminKey(newKey) {
    if (!isAuthenticated()) throw new Error('Unauthorized');
    const newHash = await hashKey(newKey);
    localStorage.setItem('zest_admin_hash', newHash);
    return true;
  }

  // Logout Admin
  function logoutAdmin() {
    sessionStorage.removeItem('zest_admin_session');
  }

  // Open IndexedDB with multi-binary store
  function initDB() {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => resolve(null);
      request.onsuccess = (e) => {
        db = e.target.result;
        resolve(db);
      };
      request.onupgradeneeded = (e) => {
        const database = e.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  // Load current release meta with blobs
  async function getCurrentRelease() {
    const local = localStorage.getItem('zest_release_meta');
    let release = local ? JSON.parse(local) : { ...defaultRelease };

    // Backward compatibility with previous version format
    if (release.version && !release.androidVersion) {
      release.androidVersion = release.version;
      release.androidFileSize = release.fileSize || '42.5 MB';
      release.androidDownloadUrl = release.downloadUrl || 'assets/downloads/zest-tournament-v1.4.2.apk';
      release.androidFileName = release.fileName || 'zest-tournament-v1.4.2.apk';
    }

    if (db) {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);

        // Fetch Android binary
        const reqAndroid = store.get('latest_apk');
        const androidRecord = await new Promise((res) => {
          reqAndroid.onsuccess = () => res(reqAndroid.result);
          reqAndroid.onerror = () => res(null);
        });
        if (androidRecord && androidRecord.blob) {
          release.androidBlobUrl = URL.createObjectURL(androidRecord.blob);
          release.androidFileSize = formatFileSize(androidRecord.blob.size);
          release.androidFileName = androidRecord.fileName;
        }

        // Fetch iOS binary
        const reqIOS = store.get('latest_ios');
        const iosRecord = await new Promise((res) => {
          reqIOS.onsuccess = () => res(reqIOS.result);
          reqIOS.onerror = () => res(null);
        });
        if (iosRecord && iosRecord.blob) {
          release.iosBlobUrl = URL.createObjectURL(iosRecord.blob);
          release.iosFileSize = formatFileSize(iosRecord.blob.size);
          release.iosFileName = iosRecord.fileName;
        }
      } catch (err) {
        console.error('Error fetching binaries from IndexedDB', err);
      }
    }

    return release;
  }

  // Save new multi-platform release (SECURE: Checks admin authentication)
  async function saveRelease(meta, files = {}) {
    if (!isAuthenticated()) {
      alert('Access Denied: Only the verified owner can upload or update app releases.');
      throw new Error('Unauthorized upload attempt.');
    }

    if (db) {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        // Save Android APK if provided
        if (files.androidBlob) {
          store.put({
            id: 'latest_apk',
            blob: files.androidBlob,
            fileName: meta.androidFileName || files.androidBlob.name,
            updatedAt: new Date().toISOString()
          });
        }

        // Save iOS File if provided
        if (files.iosBlob) {
          store.put({
            id: 'latest_ios',
            blob: files.iosBlob,
            fileName: meta.iosFileName || files.iosBlob.name,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Error storing binaries:', err);
      }
    }

    localStorage.setItem('zest_release_meta', JSON.stringify(meta));
    updateUIElements(meta);
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function updateUIElements(release) {
    document.querySelectorAll('.app-version-val').forEach(el => el.textContent = release.androidVersion || release.version || 'v1.4.2');
    document.querySelectorAll('.app-size-val').forEach(el => el.textContent = release.androidFileSize || release.fileSize || '42.5 MB');
    document.querySelectorAll('.app-downloads-val').forEach(el => {
      el.textContent = (release.downloadCount || 15000).toLocaleString() + '+';
    });

    // Android Download Triggers
    const downloadButtons = document.querySelectorAll('.dynamic-app-download');
    downloadButtons.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        triggerAndroidDownload(release);
      };
    });
  }

  // Trigger Android APK download
  function triggerAndroidDownload(release) {
    let targetUrl = release.androidBlobUrl || release.androidDownloadUrl || release.blobUrl || release.downloadUrl || 'assets/downloads/zest-tournament-v1.4.2.apk';
    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = release.androidFileName || release.fileName || 'zest-tournament-app.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    release.downloadCount = (release.downloadCount || 14850) + 1;
    localStorage.setItem('zest_release_meta', JSON.stringify(release));
    updateUIElements(release);

    if (window.AppUI && window.AppUI.showToast) {
      window.AppUI.showToast(`Downloading Android APK (${release.androidVersion || 'v1.4.2'})...`, 'success');
    }
  }

  // Trigger iOS Download / Link / Modal
  function triggerIOSAction(release) {
    if (release.iosBlobUrl) {
      const link = document.createElement('a');
      link.href = release.iosBlobUrl;
      link.download = release.iosFileName || 'zest-tournament-ios.ipa';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (window.AppUI && window.AppUI.showToast) {
        window.AppUI.showToast(`Downloading iOS Package (${release.iosVersion || 'v1.4.2'})...`, 'success');
      }
    } else if (release.iosDownloadUrl && release.iosDownloadUrl.trim().length > 0 && !release.iosDownloadUrl.startsWith('#')) {
      window.open(release.iosDownloadUrl, '_blank');
    } else {
      // Open iOS PWA / Web App guide modal
      if (window.AppUI && window.AppUI.openIOSModal) {
        window.AppUI.openIOSModal();
      }
    }
  }

  // Trigger Browser Play / Web Portal Action
  function triggerBrowserAction(release) {
    const target = release.browserPlayUrl || '#tournaments';
    if (target.startsWith('http://') || target.startsWith('https://')) {
      window.open(target, '_blank');
    } else {
      const el = document.querySelector(target) || document.getElementById('tournaments');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      if (window.AppUI && window.AppUI.showToast) {
        window.AppUI.showToast('🌐 Instant Web Arena Active! Pick any Free Fire match below to play.', 'info');
      }
    }
  }

  function renderQRCode(targetUrl, containerEl) {
    if (!containerEl) return;
    const cleanUrl = encodeURIComponent(window.location.origin + '/' + targetUrl);
    containerEl.innerHTML = `
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${cleanUrl}&bgcolor=ffffff&color=111111&margin=2" 
           alt="Download QR Code" 
           class="qr-code-svg" 
           loading="lazy" />
      <p style="margin-top: 10px; font-size: 0.82rem; color: #555; font-weight: 600; text-align: center;">Scan with your Android camera to download directly</p>
    `;
  }

  return {
    init: async function () {
      await initDB();
      const release = await getCurrentRelease();
      updateUIElements(release);
      return release;
    },
    getCurrentRelease,
    saveRelease,
    triggerAndroidDownload,
    triggerIOSAction,
    triggerBrowserAction,
    renderQRCode,
    formatFileSize,
    isAuthenticated,
    verifyAdminKey,
    changeAdminKey,
    logoutAdmin,
    DEFAULT_ADMIN_KEY
  };
})();

window.AppUploader = AppUploader;
