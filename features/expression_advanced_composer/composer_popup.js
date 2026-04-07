(function() {
  const POPUP_HTML = `
    <div class="cl-advanced-composer-overlay" id="cl-composer-overlay">
      <div class="cl-advanced-composer-popup">
        <div class="cl-popup-header">
          <div class="cl-popup-title">
            <span style="color: #2196F3;">💙❤️</span> Advanced Expression Composer
          </div>
          <div class="cl-close-btn" id="cl-composer-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
        </div>
        <div class="cl-popup-body">
          <div class="cl-composer-container" id="cl-composer-main-container">
            <!-- Tokens and Slots will be rendered here -->
          </div>
        </div>
      </div>
    </div>
  `;

  function createPopup() {
    let overlay = document.getElementById('cl-composer-overlay');
    if (!overlay) {
      const container = document.createElement('div');
      container.innerHTML = POPUP_HTML;
      document.body.appendChild(container.firstElementChild);
      overlay = document.getElementById('cl-composer-overlay');

      document.getElementById('cl-composer-close').onclick = closePopup;
      overlay.onclick = (e) => {
        if (e.target === overlay) closePopup();
      };
    }
    return overlay;
  }

  function openPopup(expressionJson) {
    const overlay = createPopup();
    overlay.style.display = 'flex';
    // Small delay to trigger transitions
    setTimeout(() => {
      overlay.classList.add('visible');
    }, 10);
    
    console.log("💙❤️ Popup opened with expression:", expressionJson);
    renderExpression(expressionJson);
  }

  function closePopup() {
    const overlay = document.getElementById('cl-composer-overlay');
    if (overlay) {
      overlay.classList.remove('visible');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 300);
    }
  }

  function renderExpression(json) {
    const container = document.getElementById('cl-composer-main-container');
    if (!container) return;
    
    container.innerHTML = '<div style="color: #666; font-style: italic;">Parsing expression...</div>';
    
    // Placeholder for Step 4 Rendering logic
    setTimeout(() => {
       container.innerHTML = `
        <div class="cl-slot"></div>
        <div class="cl-token">Loading...</div>
        <div class="cl-slot"></div>
       `;
    }, 500);
  }

  // Listen for the Identification event from api_bridge
  window.addEventListener('message', (event) => {
    if (event.data.type === 'CL_ADVANCED_COMPOSER_DATA_READY') {
      openPopup(event.data.expressionJson);
    }
  });

})();
