window.loadedCodelessLoveScripts ||= {};
(function () {
  console.log("💙❤️ Advanced Expression Composer");
  let thisScriptKey = "advanced_expression_composer";

  /* ------------------------------------------------ */
  /* ⬇️ ⬇️ ⬇️ ⬇️ ⬇️ Don't mess with this  ⬇️ ⬇️ ⬇️ ⬇️ ⬇️ */
  /* ------------------------------------------------ */
  if (window.loadedCodelessLoveScripts[thisScriptKey] == "loaded") {
    console.warn("💙❤️" + thisScriptKey + " tried to load, but it's value is already " + window.loadedCodelessLoveScripts[thisScriptKey]);
    return;
  }
  window.loadedCodelessLoveScripts[thisScriptKey] = "loaded";
  console.log("💙❤️" + window.loadedCodelessLoveScripts[thisScriptKey]);

  // Inject API bridge into the main world so we can access appquery
  chrome.runtime.sendMessage({
    action: "injectScriptIntoMainWorld",
    jsFile: "features/expression_advanced_composer/api_bridge.js"
  });
  /* ------------------------------------------------ */
  /* ⬆️ ⬆️ ⬆️ ⬆️ ⬆️ Don't mess with this  ⬆️ ⬆️ ⬆️ ⬆️ ⬆️ */
  /* ------------------------------------------------ */

  const ADVANCED_COMPOSER_SVG = `<span class="py18712 py1871m"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="py1871q"><path d="M24.7075 24.7075C24.6146 24.8005 24.5043 24.8742 24.3829 24.9246C24.2615 24.9749 24.1314 25.0008 24 25.0008C23.8686 25.0008 23.7385 24.9749 23.6171 24.9246C23.4957 24.8742 23.3854 24.8005 23.2925 24.7075L9 10.4137V21C9 21.2652 8.89464 21.5196 8.70711 21.7071C8.51957 21.8946 8.26522 22 8 22C7.73478 22 7.48043 21.8946 7.29289 21.7071C7.10536 21.5196 7 21.2652 7 21V8C7 7.73478 7.10536 7.48043 7.29289 7.29289C7.48043 7.10536 7.73478 7 8 7H21C21.2652 7 21.5196 7.10536 21.7071 7.29289C21.8946 7.48043 22 7.73478 22 8C22 8.26522 21.8946 8.51957 21.7071 8.70711C21.5196 8.89464 21.2652 9 21 9H10.4137L24.7075 23.2925C24.8005 23.3854 24.8742 23.4957 24.9246 23.6171C24.9749 23.7385 25.0008 23.8686 25.0008 24C25.0008 24.1314 24.9749 24.2615 24.9246 24.3829C24.8742 24.5043 24.8005 24.6146 24.7075 24.7075Z" fill="currentColor"></path></svg></span>`;

  function injectTrigger(target) {
    const row = target.closest('.property-editor-row');
    if (!row) return;

    // Check if we've already injected in this row
    if (row.hasAttribute('data-cl-attached')) return;

    console.log("💙❤️ Attempting to inject Advanced Composer button into row:", row);

    // Force the row to column so our button sits below the input
    row.style.setProperty('flex-direction', 'column', 'important');
    row.style.setProperty('align-items', 'flex-start', 'important');

    const isItemWrapper = target.closest('.item-wrapper') !== null;
    const marginTop = isItemWrapper ? '5px' : '5px';//always 5px for now. will change this in the future when we've fixed the issue with the Expand button above being in frontof it, preventing clicks.

    const wrapper = document.createElement('div');
    wrapper.className = '❤️advanced-composer';
    wrapper.setAttribute('data-cl-injected', 'true');
    wrapper.style.cssText = `width: 100%; display: flex; justify-content: flex-start; margin-top: ${marginTop};`;

    const btn = document.createElement('div');
    btn.className = 'expand-collapse-button';
    btn.innerHTML = `Advanced Composer ${ADVANCED_COMPOSER_SVG}`;

    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("💙❤️ Advanced Composer Triggered!");

      // Step 2: Extracting ID
      // Bubble escapes node IDs into the classlist. We need to find the node ID.
      // Usually, it's the class that starts with an 'a' or another pattern
      // Often target has the class 'control-owner' or similar containing the ID in some way.
      // Easiest is to send the target HTML or classes to the main world.

      let classListArray = Array.from(target.classList);
      console.log("💙❤️ Target classes:", classListArray);

      const propWrapper = target.closest('[data-prop-name]');
      const propName = propWrapper ? propWrapper.getAttribute('data-prop-name') : null;
      console.log("💙❤️ Target property Name:", propName);

      // Send message via window to trigger api_bridge extraction.
      window.postMessage({
        type: 'CL_ADVANCED_COMPOSER_IDENTIFY',
        targetClasses: classListArray,
        propName: propName
      }, '*');
    };

    wrapper.appendChild(btn);
    row.appendChild(wrapper);
    row.setAttribute('data-cl-attached', 'true');

    console.log("💙❤️ Injection complete!");

    // Double check after a short delay if it's still there
    setTimeout(() => {
      if (!wrapper.parentElement) {
        console.warn("💙❤️ Injection disappeared! Bubble might have stripped it.");
        row.removeAttribute('data-cl-attached');
      }
    }, 500);
  }

  function getTargets() {
    return [
      ...document.querySelectorAll('.text-composer'),
      ...document.querySelectorAll('.expression-composer > .expression-composer'),
      ...document.querySelectorAll('.item-wrapper .expression-composer')
    ];
  }

  function initObserver() {
    console.log("💙❤️ Initializing Advanced Composer Observer...");

    // 1. Immediate scan
    const initialTargets = getTargets();
    if (initialTargets.length > 0) {
      console.log(`💙❤️ Found ${initialTargets.length} targets on initial load.`);
      initialTargets.forEach(injectTrigger);
    }

    // 2. Setup observer to catch future appearances
    const wrapper = document.querySelector('.property-editor-wrapper');
    if (!wrapper) {
      console.log("💙❤️ .property-editor-wrapper not found yet. Watching body...");
      const bodyObserver = new MutationObserver(() => {
        const potentialWrapper = document.querySelector('.property-editor-wrapper');
        if (potentialWrapper) {
          console.log("💙❤️ .property-editor-wrapper discovered!");
          startMainObserver(potentialWrapper);
          bodyObserver.disconnect();
        }
      });
      bodyObserver.observe(document.body, { childList: true, subtree: true });
    } else {
      console.log("💙❤️ .property-editor-wrapper found immediately.");
      startMainObserver(wrapper);
    }
  }

  let debounceTimer;
  function startMainObserver(container) {
    console.log("💙❤️ Starting main observer on:", container);
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const targets = getTargets();
        if (targets.length > 0) {
          targets.forEach(injectTrigger);
        }
      }, 100);
    });

    observer.observe(container, { childList: true, subtree: true });

    // Initial run
    const initialTargets = getTargets();
    if (initialTargets.length > 0) {
      initialTargets.forEach(injectTrigger);
    }
  }

  initObserver();

  /* ── Popup / Island UI Logic (Integrated from composer_popup.js) ────────── */

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
          
          <div style="margin-top: 16px;">
            <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Raw Expression JSON (Diagnostics)</div>
            <pre id="cl-composer-raw-json" style="margin: 0; padding: 12px; background: #0a0a0a; color: #4caf50; border: 1px solid #222; border-radius: 8px; font-family: monospace; font-size: 11px; max-height: 200px; overflow: auto;"></pre>
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

  function unpackExpression(jsonNode) {
    if (!jsonNode) return [];

    let flatArray = [];
    let current = jsonNode;

    while (current) {
      // Create a shallow copy without the 'next' pointer
      let token = { ...current };
      delete token.next;
      flatArray.push(token);
      
      // Traverse to the next node
      current = current.next;
    }

    return flatArray;
  }

  function renderTokenText(token) {
    let text = token.type;
    
    if (token.type === 'Message') {
      text = ":" + (token.name || "unknown");
    } else if (token.type === 'Search') {
      text = "Search for " + (token.properties?.type_to_find || "...");
    }
    
    // Add args if present (very basic parsing for MVP)
    if (token.args !== undefined) {
      if (typeof token.args === 'object' && token.args !== null) {
        text += " [" + (token.args.type || "Object") + "]";
      } else {
        text += " [" + token.args + "]";
      }
    }
    
    return text;
  }

  function renderExpression(json) {
    const container = document.getElementById('cl-composer-main-container');
    const rawBox = document.getElementById('cl-composer-raw-json');
    if (!container) return;
    
    // Diagnostic raw output
    if (rawBox) {
      rawBox.textContent = JSON.stringify(json, null, 2);
    }
    
    // Step 4: Unpack the JSON into a flat array
    const tokens = unpackExpression(json);
    console.log("💙❤️ Unpacked Flat Array:", tokens);

    // Render the Slot-Token-Slot sequence
    let html = '';
    
    // Always start with a slot
    html += '<div class="cl-slot"></div>';
    
    tokens.forEach((token, index) => {
      const displayName = renderTokenText(token);
      
      html += `<div class="cl-token">${displayName}</div>`;
      html += `<div class="cl-slot"></div>`;
    });

    container.innerHTML = html;
  }

  // Listen for the Data Ready event from api_bridge
  window.addEventListener('message', (event) => {
    if (event.data.type === 'CL_ADVANCED_COMPOSER_DATA_READY') {
      openPopup(event.data.expressionJson);
    }
  });

})();//👈👈 don't delete this, and don't put anything outside of this!!
