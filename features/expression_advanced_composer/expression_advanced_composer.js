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

  // --- Schema Definition ---
  const BUBBLE_SCHEMA = {
    "text": [
      { op: "equals", arg: "text", ret: "sys.bool", label: "= (equals)" },
      { op: "not_equals", arg: "text", ret: "sys.bool", label: "is not" },
      { op: "is_empty", arg: "null", ret: "sys.bool", label: "is empty" },
      { op: "contains", arg: "text", ret: "sys.bool", label: "contains" },
      { op: "to_uppercase", arg: "null", ret: "text", label: ":uppercase" },
      { op: "to_lowercase", arg: "null", ret: "text", label: ":lowercase" },
      { op: "length", arg: "null", ret: "number", label: ":number of characters" },
      { op: "append", arg: "text", ret: "text", label: ":append" }
    ],
    "number": [
      { op: "equals", arg: "number", ret: "sys.bool", label: "= (equals)" },
      { op: "greater_than", arg: "number", ret: "sys.bool", label: ">" },
      { op: "less_than", arg: "number", ret: "sys.bool", label: "<" },
      { op: "plus", arg: "number", ret: "number", label: "+" },
      { op: "minus", arg: "number", ret: "number", label: "-" },
      { op: "times", arg: "number", ret: "number", label: "*" },
      { op: "divide", arg: "number", ret: "number", label: "/" },
      { op: "format_number", arg: "null", ret: "text", label: ":formatted as text" }
    ],
    "sys.bool": [
      { op: "and_", arg: "sys.bool", ret: "sys.bool", label: "and" },
      { op: "or_", arg: "sys.bool", ret: "sys.bool", label: "or" },
      { op: "is_true", arg: "null", ret: "sys.bool", label: "is yes" },
      { op: "is_false", arg: "null", ret: "sys.bool", label: "is no" }
    ]
  };

  const DATA_SOURCES = [
    { type: "Search", ret: "List<any>", label: "Do a search for..." },
    { type: "CurrentUser", ret: "user", label: "Current User" },
    { type: "Input", ret: "text", label: "Input value" },
    { type: "Dynamic", ret: "text", label: "Arbitrary text" }
  ];

  function getComputedType(tokenEl) {
    if (!tokenEl) return null;
    const rawData = JSON.parse(tokenEl.dataset.bubbleJson || "{}");
    
    if (rawData.type === 'Message') {
       const prevToken = tokenEl.previousElementSibling?.previousElementSibling;
       const leftType = getComputedType(prevToken);
       if (leftType && BUBBLE_SCHEMA[leftType]) {
           const opDef = BUBBLE_SCHEMA[leftType].find(o => o.op === rawData.name);
           if (opDef) return opDef.ret;
       }
    }
    
    // Fallbacks
    if (rawData.type === 'Search') return 'List<any>';
    if (rawData.type === 'Expression' && rawData.value_type) return rawData.value_type;
    if (rawData.properties?.type_to_find) return 'List<' + rawData.properties.type_to_find + '>';
    if (rawData.properties?.type) return rawData.properties.type;
    
    // Bubble internal defaults
    if (rawData.type === 'String') return 'text';
    if (rawData.type === 'Number') return 'number';
    
    return "text"; // Default
  }

  // --- Slot & Token Interactive Engine (Ported from demo.html) ---
  let shiftAnchorElement = null;
  let activeDropdown = null;

  function showDropdown(anchor) {
    if (!anchor || document.querySelectorAll('#cl-composer-main-container .selected').length > 1) return;
    hideDropdown();
    
    activeDropdown = document.createElement('div');
    activeDropdown.className = 'cl-dropdown';
    
    const rect = anchor.getBoundingClientRect();
    activeDropdown.style.left = rect.left + 'px';
    activeDropdown.style.top = (rect.bottom + 4) + 'px';
    
    const isSlot = anchor.classList.contains('cl-slot');
    const prevToken = anchor.previousElementSibling;
    
    if (isSlot) {
      if (!prevToken || !prevToken.classList.contains('cl-token')) {
        // First slot -> Show Data Sources
        addDropdownItems(activeDropdown, "Data Sources", DATA_SOURCES.map(d => ({ label: d.label, val: d })));
      } else {
        // Subsequent slot -> Show Operators for left-hand token
        const leftType = getComputedType(prevToken);
        if (BUBBLE_SCHEMA[leftType]) {
          addDropdownItems(activeDropdown, `Actions for ${leftType}`, BUBBLE_SCHEMA[leftType].map(o => ({ label: o.label, val: o })));
        } else {
          addDropdownItems(activeDropdown, `No actions found for ${leftType}`, []);
        }
      }
    } else {
       // Editing an existing Token
       addDropdownItems(activeDropdown, "Edit Token", [{ label: "Replace...", val: null }]);
    }

    const overlay = document.getElementById('cl-composer-overlay');
    if(overlay) overlay.appendChild(activeDropdown);
  }

  function addDropdownItems(dropdown, titleText, items) {
    const header = document.createElement('div');
    header.className = 'cl-header';
    header.textContent = titleText;
    dropdown.appendChild(header);

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'cl-option';
      empty.textContent = 'None available';
      empty.style.color = '#888';
      empty.addEventListener('mousedown', e => e.preventDefault());
      dropdown.appendChild(empty);
      return;
    }

    items.forEach(item => {
      const option = document.createElement('div');
      option.className = 'cl-option';
      option.textContent = item.label;
      option.addEventListener('mousedown', e => e.preventDefault());
      option.addEventListener('click', () => {
        console.log("💙❤️ Selected Dropdown Item:", item.val);
        hideDropdown();
        // Step 5 insertion logic will go here
      });
      dropdown.appendChild(option);
    });
  }

  function hideDropdown() {
    if (activeDropdown) {
      activeDropdown.remove();
      activeDropdown = null;
    }
  }

  function clearSelection() {
    document.querySelectorAll('#cl-composer-main-container .selected').forEach(el => el.classList.remove('selected'));
  }

  function updateSelection(startEl, endEl) {
    if (!startEl || !endEl) return;
    clearSelection();
    const composer = document.getElementById('cl-composer-main-container');
    if(!composer) return;
    const kids = Array.from(composer.children);
    let startIndex = kids.indexOf(startEl);
    let endIndex = kids.indexOf(endEl);
    if (startIndex === -1 || endIndex === -1) return;
    if (startIndex > endIndex) [startIndex, endIndex] = [endIndex, startIndex];
    while (startIndex <= endIndex && kids[startIndex].classList.contains('cl-slot')) startIndex++;
    while (endIndex >= startIndex && kids[endIndex].classList.contains('cl-slot')) endIndex--;
    if (startIndex <= endIndex) {
      for (let i = startIndex; i <= endIndex; i++) kids[i].classList.add('selected');
    }
    console.log(`💙❤️ Selection updated: indices ${startIndex} to ${endIndex}`);
  }

  function clearDropTargets() {
    document.querySelectorAll('#cl-composer-main-container .drop-target').forEach(el => el.classList.remove('drop-target'));
  }

  function getNearestSlot(token, mouseX) {
    const rect = token.getBoundingClientRect();
    const midpoint = rect.left + (rect.width / 2);
    if (mouseX < midpoint) {
      return token.previousElementSibling;
    } else {
      return token.nextElementSibling;
    }
  }

  function handleDropOnSlot(slot) {
    if (!slot) return;
    const composer = document.getElementById('cl-composer-main-container');
    const selectedItems = Array.from(composer.querySelectorAll('.selected'));
    if (selectedItems.length === 0) return;
    
    console.log("💙❤️ Dropped token(s) into new slot");

    let ref = slot;
    selectedItems.forEach(item => {
      if (item !== slot) {
        ref.after(item);
        ref = item;
      }
    });

    clearDropTargets();
    syncAndValidate();
    clearSelection();
  }

  function syncAndValidate() {
    console.log("💙❤️ Syncing and validating slots...");
    const composer = document.getElementById('cl-composer-main-container');
    if (!composer) return;
    const kids = Array.from(composer.children);
    
    // Remove consecutive slots
    for (let i = kids.length - 1; i > 0; i--) { 
      if (kids[i].classList.contains('cl-slot') && kids[i - 1].classList.contains('cl-slot')) {
        kids[i].remove(); 
      }
    }
    
    // Ensure at least one slot if empty
    if (composer.children.length === 0) composer.appendChild(createSlotElement());
    
    // Ensure slot between consecutive tokens and before first/after last
    const currentTokens = composer.querySelectorAll('.cl-token');
    currentTokens.forEach(t => {
      if (!t.previousElementSibling || !t.previousElementSibling.classList.contains('cl-slot')) {
        t.parentNode.insertBefore(createSlotElement(), t);
      }
      if (!t.nextElementSibling || !t.nextElementSibling.classList.contains('cl-slot')) {
        t.parentNode.insertBefore(createSlotElement(), t.nextSibling);
      }
    });
    
    // Schema Logic validation will be hooked up here later
  }

  function createSlotElement() {
    const slot = document.createElement('div');
    slot.className = 'cl-slot'; 
    slot.contentEditable = 'true';
    
    slot.addEventListener('mousedown', (e) => {
      console.log("💙❤️ Slot Mousedown");
      if (e.shiftKey && shiftAnchorElement) { 
        updateSelection(shiftAnchorElement, slot); 
        slot.focus(); 
      } else { 
        clearSelection(); 
        shiftAnchorElement = slot; 
        slot.focus(); 
      }
    });

    slot.addEventListener('focus', (e) => {
      console.log("💙❤️ Slot Focused");
      showDropdown(slot);
    });

    slot.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { 
        e.preventDefault(); 
        hideDropdown();
        const n = slot.nextElementSibling; 
        if (n) { 
          if (e.shiftKey && shiftAnchorElement) updateSelection(shiftAnchorElement, n); 
          else { clearSelection(); shiftAnchorElement = n; } 
          n.focus(); 
        } 
      }
      if (e.key === 'ArrowLeft') { 
        e.preventDefault(); 
        const p = slot.previousElementSibling; 
        if (p) { 
          if (e.shiftKey && shiftAnchorElement) updateSelection(shiftAnchorElement, p); 
          else { clearSelection(); shiftAnchorElement = p; } 
          p.focus(); 
        } 
      }
      if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
    });

    slot.addEventListener('blur', e => {
      slot.textContent = '';
      
      // Delay hiding to allow dropdown clicks to process if they weren't caught by preventDefault
      setTimeout(() => {
        if (document.activeElement !== slot) hideDropdown();
      }, 50);
      
      syncAndValidate();
    });

    slot.addEventListener('dragover', e => { 
      e.preventDefault(); 
      clearDropTargets(); 
      slot.classList.add('drop-target'); 
    });

    slot.addEventListener('dragleave', () => slot.classList.remove('drop-target'));
    slot.addEventListener('drop', e => { e.preventDefault(); handleDropOnSlot(slot); });

    return slot;
  }

  function createTokenElement(tokenObj) {
    const span = document.createElement('span');
    span.className = 'cl-token';
    span.textContent = renderTokenText(tokenObj);
    span.tabIndex = 0;
    
    // Store raw JSON for later
    span.dataset.bubbleJson = JSON.stringify(tokenObj);
    span.draggable = true;
    
    span.addEventListener('dragstart', e => {
      console.log("💙❤️ Token Dragstart:", span.textContent);
      const selected = Array.from(document.querySelectorAll('#cl-composer-main-container .selected'));
      if (selected.length === 0 || !selected.includes(span)) {
        clearSelection();
        span.classList.add('selected');
      }
      setTimeout(() => {
        const activeGroup = Array.from(document.querySelectorAll('#cl-composer-main-container .selected'));
        activeGroup.forEach(el => el.classList.add('dragging'));
      }, 0);
    });

    span.addEventListener('dragend', () => {
      document.querySelectorAll('#cl-composer-main-container .dragging').forEach(el => el.classList.remove('dragging'));
      clearDropTargets();
    });

    span.addEventListener('dragover', e => {
      e.preventDefault();
      clearDropTargets();
      const slot = getNearestSlot(span, e.clientX);
      if (slot && slot.classList.contains('cl-slot')) slot.classList.add('drop-target');
    });

    span.addEventListener('blur', () => {
      span.contentEditable = "false";
      setTimeout(() => {
        if (document.activeElement !== span) hideDropdown();
      }, 50);
      syncAndValidate();
    });

    span.addEventListener('drop', e => {
      e.preventDefault();
      const slot = getNearestSlot(span, e.clientX);
      if (slot) handleDropOnSlot(slot);
    });

    let startX, startY;
    const DRAG_THRESHOLD = 5;
    span.addEventListener('mousedown', (e) => {
      console.log("💙❤️ Token Mousedown:", span.textContent);
      startX = e.clientX; startY = e.clientY;
      const onMouseUp = (ue) => {
        if (Math.sqrt(Math.pow(ue.clientX - startX, 2) + Math.pow(ue.clientY - startY, 2)) < DRAG_THRESHOLD) {
          if (e.shiftKey && shiftAnchorElement) {
            updateSelection(shiftAnchorElement, span);
            span.focus();
          } else {
            clearSelection();
            shiftAnchorElement = span;
            span.focus();
          }
        }
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mouseup', onMouseUp);
    });

    span.addEventListener('focus', (e) => {
      console.log("💙❤️ Token Focused");
      
      // Criterion #11: When a token is activated, text should be selected for editing
      // if it's a textual/primitive value we will let them edit it. Otherwise dropdown.
      // Until we have strict schema definitions mapped, we try to allow text editing 
      // if the token type isn't a known operator.
      const rawData = JSON.parse(span.dataset.bubbleJson);
      
      if (rawData.type !== 'Message' && rawData.type !== 'Operator') {
        span.contentEditable = "true";
        setTimeout(() => {
          const range = document.createRange();
          range.selectNodeContents(span);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }, 0);
      } else {
        showDropdown(span);
      }
    });

    span.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { 
        e.preventDefault(); 
        hideDropdown();
        if (span.nextElementSibling) { 
          const n = span.nextElementSibling; 
          if (e.shiftKey && shiftAnchorElement) updateSelection(shiftAnchorElement, n); 
          else { clearSelection(); shiftAnchorElement = n; } 
          n.focus(); 
        } 
      }
      if (e.key === 'ArrowLeft') { 
        e.preventDefault(); 
        if (span.previousElementSibling) { 
          const p = span.previousElementSibling; 
          if (e.shiftKey && shiftAnchorElement) updateSelection(shiftAnchorElement, p); 
          else { clearSelection(); shiftAnchorElement = p; } 
          p.focus(); 
        } 
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const selected = Array.from(document.querySelectorAll('#cl-composer-main-container .selected'));
        if (selected.length > 0) {
            selected.forEach(el => el.remove());
        } else {
            span.remove();
        }
        syncAndValidate();
        console.log("💙❤️ Token(s) deleted");
      }
      if (e.key === 'Enter') { e.preventDefault(); span.blur(); }
    });
    
    return span;
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

    // Clear existing inner HTML
    container.innerHTML = '';
    
    // Render the interactive DOM elements
    tokens.forEach((token) => {
      const tokenEl = createTokenElement(token);
      container.appendChild(tokenEl);
    });

    // Ensure dragging across the root container behaves correctly
    if (!container.dataset.dragEventsAttached) {
      container.addEventListener('dragover', e => {
        e.preventDefault();
        clearDropTargets();
        const target = e.target;
        if (target.classList.contains('cl-slot')) {
          target.classList.add('drop-target');
        } else if (target.classList.contains('cl-token')) {
          const slot = getNearestSlot(target, e.clientX);
          if (slot) slot.classList.add('drop-target');
        }
      });

      container.addEventListener('drop', e => {
        e.preventDefault();
        const target = e.target;
        let finalSlot = null;
        if (target.classList.contains('cl-slot')) finalSlot = target;
        else if (target.classList.contains('cl-token')) finalSlot = getNearestSlot(target, e.clientX);

        if (finalSlot) handleDropOnSlot(finalSlot);
        else clearDropTargets();
      });
      container.dataset.dragEventsAttached = "true";
    }

    // Wrap everything in slots
    syncAndValidate();
  }

  // Listen for the Data Ready event from api_bridge
  window.addEventListener('message', (event) => {
    if (event.data.type === 'CL_ADVANCED_COMPOSER_DATA_READY') {
      openPopup(event.data.expressionJson);
    }
  });

})();//👈👈 don't delete this, and don't put anything outside of this!!
