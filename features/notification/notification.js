window.loadedCodelessLoveScripts ||= {};
(function () {
  const thisScriptKey = "notification";
  if (window.loadedCodelessLoveScripts[thisScriptKey] === "loaded") {
    console.warn(`❤️${thisScriptKey} tried to load, but it's value is already ${window.loadedCodelessLoveScripts[thisScriptKey]}`);
    return;
  }
  window.loadedCodelessLoveScripts[thisScriptKey] = "loaded";

  const STORAGE_KEY = 'codelessLoveLastSeenVersion';
  const manifest = chrome.runtime.getManifest();
  const currentAppVersion = manifest.version;

  /**
   * Compares two version strings (e.g., "1.2.3" vs "1.2.4").
   * @param {string} v1 The first version string.
   * @param {string} v2 The second version string.
   * @returns {number} -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2.
   */
  function compareVersions(v1, v2) {
    if (!v2) return 1; // If no old version, new one is always greater

    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    const len = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < len; i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  }

  function showNotificationNotice() {
    if (document.getElementById('❤️notification_overlay')) return;

    const logoUrl = chrome.runtime.getURL('extension-icons/icon-21.png');
    const overlay = document.createElement('div');
    overlay.id = 'codelesslove_notification_overlay';
    overlay.innerHTML = `
    <div id="notification" class="❤️notification">
        <div class="❤️header">
            <img class="❤️logo" src="${logoUrl}" alt="Codeless Love Icon" />
            <h1 class="❤️title">Powerup got a Powerup!</h1>
            <button class="❤️close" title="Close">×</button>
        </div>
        <div class="❤️body">
            <p>You've just updated to version ${currentAppVersion}</p>
            <h2 class="section-header">New Features</h2>
            <ul class="features-list">
                <li>
                    <b>Rename Arbitrary Text</b>
                    <p class="feature-description">Adds an optional Display field to Arbitrary text expressions so you can rename the token label without changing its value. Thanks for working on this feature: George Collier.</p>
                </li>
                <li>
                    <b>Delete Unused Colors</b>
                    <p class="feature-description">List and delete color variables unused in the app. Thanks for working on this feature: Thomas Mey.</p>
                </li>
                <li>
                    <b>Resizable Expression Dropdown</b>
                    <p class="feature-description">Resize the expression dropdown in the editor. Thanks for working on this feature: Brenton Strine.</p>
                </li>
                <li>
                    <b>Sunsetting Feature: Make Backend Workflows Button Red</b>
                    <p class="feature-description">Since we've all had time to adjust, this no longer needs to be red. Thanks for working on this feature: Brenton Strine.</p>
                </li>
                <li>
                    <b>Sunsetting Feature: Drag to Rearrange Style Variables</b>
                    <p class="feature-description">Bubble has implemented this! Thanks for working on this feature: Rico Trevisan.</p>
                </li>
                <li>
                    <b>Sunsetting Feature: API Connector Sidebar Link</b>
                    <p class="feature-description">Hooray, Bubble implemented this natively, so we don't need it anymore! Thanks for working on this feature: Rafa Chavantes and Brenton Strine.</p>
                </li>
                <li>
                    <b>Sunsetting Feature: Make Backend Workflows Button Red</b>
                    <p class="feature-description">Since we've all had time to adjust, this no longer needs to be red. Thanks for working on this feature: Brenton Strine.</p>
                </li>
            </ul>
            <p class="❤️note">Thank you for using the Powerup extension! You can help by suggesting ideas, sharing with a friend, or even contributing new features!
            
            -Brenton</p>
        </div>
        <div class="❤️footer">
          <button class="❤️dismiss-button">Dismiss</button>
        </div>
    </div>`;
    document.body.appendChild(overlay);

    const close = () => {
      // On dismiss, save the current manifest version
      chrome.storage.sync.set({ [STORAGE_KEY]: currentAppVersion });
      overlay.remove();
    };

    const closeBtn = overlay.querySelector('.❤️close');
    if (closeBtn) {
      closeBtn.onclick = close;
    }

    const dismissBtn = overlay.querySelector('.❤️dismiss-button');
    if (dismissBtn) {
      dismissBtn.onclick = close;
    }
  }

  // Check if the user has already seen the notice for this version
  chrome.storage.sync.get(STORAGE_KEY, (result) => {
    const lastSeenVersion = result[STORAGE_KEY];
    if (compareVersions(currentAppVersion, lastSeenVersion) > 0) {
      showNotificationNotice();
    }
  });
})();
