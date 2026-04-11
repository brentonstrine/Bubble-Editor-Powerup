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
            <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Live JSON Engine Output (Diagnostics)</div>
            <pre id="cl-composer-raw-json" style="margin: 0; padding: 12px; background: #0a0a0a; color: #4caf50; border: 1px solid #222; border-radius: 8px; font-family: monospace; font-size: 11px; max-height: 200px; overflow: auto;"></pre>
          </div>
        </div>
        <div class="cl-composer-footer" style="padding: 12px 16px; background: rgba(0, 0, 0, 0.4); border-top: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: flex-end; gap: 12px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
          <button class="cl-btn cl-btn-cancel" id="cl-btn-cancel" style="padding: 6px 12px; border-radius: 4px; border: none; font-family: inherit; font-size: 13px; cursor: pointer; background: rgba(255, 255, 255, 0.1); color: #fff;">Cancel</button>
          <button class="cl-btn cl-btn-save" id="cl-btn-save" style="padding: 6px 12px; border-radius: 4px; border: none; font-family: inherit; font-size: 13px; cursor: pointer; background: #2196F3; color: #fff;">Save changes</button>
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

      const popup = overlay.querySelector('.cl-advanced-composer-popup');
      if (popup) {
        popup.addEventListener('mousedown', (e) => e.stopPropagation());
        popup.addEventListener('click', (e) => e.stopPropagation());
      }

      document.getElementById('cl-composer-close').onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        closePopup();
      };

      const btnCancel = document.getElementById('cl-btn-cancel');
      if (btnCancel) {
        btnCancel.onclick = (e) => { e.preventDefault(); e.stopPropagation(); closePopup(); };
      }

      const btnSave = document.getElementById('cl-btn-save');
      if (btnSave) {
        btnSave.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSave();
        };
      }

      // Removed overlay click-to-close to prevent accidental destruction
    }
    return overlay;
  }

  let _cl_originalExpressionJson = null;

  function openPopup(expressionJson) {
    _cl_originalExpressionJson = JSON.parse(JSON.stringify(expressionJson)); // deep clone

    const overlay = createPopup();
    overlay.style.setProperty('display', 'flex', 'important');

    // Ensure the overlay is visible and centered
    overlay.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Small delay to trigger transitions
    setTimeout(() => {
      overlay.classList.add('visible');
    }, 10);

    console.log("💙❤️ Popup opened with expression (Cloned):", _cl_originalExpressionJson);
    // DEBUG: Log the absolute raw structure before any unpacking/rendering
    console.log("💙❤️ RAW JSON (DEBUG):", JSON.stringify(expressionJson, null, 2));
    renderExpression(_cl_originalExpressionJson);
  }

  function handleSave() {
    console.log("💙❤️ Save triggered: Committing compiled expression to Bubble...");
    const mainContainer = document.getElementById('cl-composer-main-container');
    const finalExpression = getPackedExpression(mainContainer);

    window.postMessage({
      type: 'CL_ADVANCED_COMPOSER_SAVE',
      payload: finalExpression
    }, '*');

    closePopup();
  }

  function closePopup() {
    console.log("💙❤️ Closing Advanced Composer Popup...");
    const overlay = document.getElementById('cl-composer-overlay');
    if (overlay) {
      hideDropdown(); // Also hide any open dropdowns
      overlay.classList.remove('visible');
      setTimeout(() => {
        overlay.style.setProperty('display', 'none', 'important');
      }, 300);
    }
  }

  function unpackExpression(jsonNode) {
    if (!jsonNode) return [];

    // General Handle: TextExpression wrapper
    // Safety net for sub-expression contexts. The top-level renderExpression()
    // dispatches TextExpressions to renderTextExpressionContainer() directly.
    if (jsonNode.type === 'TextExpression' && jsonNode.entries) {
      // Fallback for non-property contexts: return the first expression in the entries.
      const exprKeys = Object.keys(jsonNode.entries).filter(k => {
        const val = jsonNode.entries[k];
        return val && typeof val === 'object' && val.type;
      }).sort((a, b) => Number(a) - Number(b));

      if (exprKeys.length > 0) {
        return unpackExpression(jsonNode.entries[exprKeys[0]]);
      }
      const rawValues = Object.values(jsonNode.entries).filter(v => typeof v === 'string' && v.trim());
      if (rawValues.length > 0) {
        return [{ type: 'String', value: rawValues[0] }];
      }
      return [];
    }

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

  // --- TextExpression Engine ---
  // Based on the Unified Theory: entries are a sequential list of typed components.
  // Type is determined by VALUE inspection, not index parity.

  // Converts a TextExpression JSON node into an ordered array of typed parts.
  // { kind: 'literal', value: '...' } → editable text zone
  // { kind: 'expression', node: {...} } → expression pill zone
  function unpackTextExpression(texNode) {
    // Case 1: null/undefined → single blank literal (Arbitrary Text empty state)
    if (!texNode) return [{ kind: 'literal', value: '' }];

    // Case 2: Not a TextExpression (bare expression node passed directly)
    if (texNode.type !== 'TextExpression' || !texNode.entries) {
      return [{ kind: 'expression', node: texNode }];
    }

    // Case 3: Parse entries in numeric index order, dispatching by value type
    const keys = Object.keys(texNode.entries).sort((a, b) => Number(a) - Number(b));
    const parts = keys.map(k => {
      const val = texNode.entries[k];
      if (typeof val === 'string') {
        return { kind: 'literal', value: val };
      } else if (val && typeof val === 'object' && val.type) {
        return { kind: 'expression', node: val };
      }
      return null;
    }).filter(Boolean);

    // Guarantee at least one part so the container is never empty
    if (parts.length === 0) return [{ kind: 'literal', value: '' }];
    return parts;
  }

  // Renders a text-type property container as a sequential list of
  // LiteralZones (editable text) and ExprZones (expression pill chains).
  function renderTextExpressionContainer(pContainer, texNode) {
    pContainer.innerHTML = '';
    pContainer.dataset.textExpression = 'true';

    const parts = unpackTextExpression(texNode);

    parts.forEach((part, i) => {
      if (part.kind === 'literal') {
        pContainer.appendChild(createTextZoneElement(part.value));
      } else {
        // Virtual slot before expression if no literal precedes it
        const prev = parts[i - 1];
        if (!prev || prev.kind !== 'literal') {
          pContainer.appendChild(createVirtualSlotElement(pContainer));
        }

        const exprZone = document.createElement('span');
        exprZone.className = 'cl-tex-expr-zone';
        const subTokens = unpackExpression(part.node);
        subTokens.forEach(t => exprZone.appendChild(createTokenElement(t)));
        syncAndValidate(exprZone);
        pContainer.appendChild(exprZone);

        // Virtual slot after expression if no literal follows it
        const next = parts[i + 1];
        if (!next || next.kind !== 'literal') {
          pContainer.appendChild(createVirtualSlotElement(pContainer));
        }
      }
    });

    // Ensure virtual slots are synced for initial state (e.g. text-only or expression-only)
    syncVirtualSlots(pContainer);
    finalizeContainer(pContainer);
  }

  // A virtual slot rendered before/after an ExprZone when the JSON contains no
  // adjacent LiteralZone (e.g. Text Element with a lone expression).
  // Clicking it materialises a real LiteralZone and focuses it (Hybrid Slot).
  function createVirtualSlotElement(pContainer) {
    const vs = document.createElement('span');
    vs.className = 'cl-tex-virtual-slot';
    vs.textContent = '+';
    vs.addEventListener('mousedown', e => e.stopPropagation());
    vs.addEventListener('click', e => {
      e.stopPropagation();
      // Materialise a real LiteralZone in place of the virtual slot
      const literal = createTextZoneElement('');
      literal.dataset.ephemeral = 'true'; // flag; removed on Escape without content
      vs.replaceWith(literal);

      // Use setTimeout to ensure the DOM shift is complete before focusing
      // and triggering the dropdown to avoid race conditions.
      setTimeout(() => literal.focus(), 0);
    });
    return vs;
  }

  // Editable inline text zone for TextExpression literal entries.
  // Empty zones act as Hybrid Slots (open expression dropdown + accept text).
  // Non-empty zones support ⌘/ (Mac) / Ctrl+/ (Windows) to insert an expression.
  function createTextZoneElement(value) {
    const zone = document.createElement('span');
    zone.className = 'cl-tex-literal';
    zone.contentEditable = 'true';
    zone.textContent = value;
    zone.setAttribute('placeholder', '+');

    // Track the typed text while the Hybrid dropdown is open
    let hybridDropdownOpen = false;
    let capturedTypedText = '';
    let cmdSlashCursorIndex = -1;

    zone.addEventListener('mousedown', e => e.stopPropagation());
    zone.addEventListener('click', e => e.stopPropagation());

    zone.addEventListener('focus', () => {
      showTexHint();
      // Hybrid Slot: open dropdown immediately if zone is empty
      if (!zone.textContent.trim()) {
        hybridDropdownOpen = true;
        capturedTypedText = '';
        showDropdownForTexLiteral(zone, true);
      }
    });

    zone.addEventListener('blur', () => {
      hideTexHint();
      hybridDropdownOpen = false;
      // If this was ephemeral (created by virtual slot) and still empty, remove it
      if (zone.dataset.ephemeral && !zone.textContent.trim()) {
        const pContainer = zone.closest('[data-text-expression]');
        zone.remove();
        if (pContainer) syncVirtualSlots(pContainer);
      }
      setTimeout(triggerRepack, 0);
    });

    zone.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Enter') { 
        e.preventDefault(); 
        if (hybridDropdownOpen) {
          hideDropdown();
          hybridDropdownOpen = false;
          if (zone.textContent.trim()) {
            delete zone.dataset.ephemeral;
            const pContainer = zone.closest('[data-text-expression]');
            if (pContainer) syncVirtualSlots(pContainer);
            setTimeout(triggerRepack, 0);
          }
          // Move cursor to the end of the text node after committing
          const sel = window.getSelection();
          if (sel) {
            sel.selectAllChildren(zone);
            sel.collapseToEnd();
          }
        }
        return; 
      }

      // ⌘/ (Mac) or Ctrl+/ (Windows) → insert expression into non-empty literal
      const isCmdSlash = (e.key === '/' && (e.metaKey || e.ctrlKey));
      if (isCmdSlash) {
        e.preventDefault();
        // Capture cursor position so Split knows where to cut
        const sel = window.getSelection();
        cmdSlashCursorIndex = (sel && sel.rangeCount > 0)
          ? sel.getRangeAt(0).startOffset
          : zone.textContent.length;
        showDropdownForTexLiteral(zone, false);
        return;
      }

      // Escape: dismiss dropdown and optionally remove ephemeral zone
      if (e.key === 'Escape') {
        hideDropdown();
        hybridDropdownOpen = false;
        if (zone.dataset.ephemeral && !zone.textContent.trim()) {
          const pContainer = zone.closest('[data-text-expression]');
          zone.remove();
          if (pContainer) syncVirtualSlots(pContainer);
        }
        return;
      }

      // While hybrid dropdown is open, feed typed characters into it
      if (hybridDropdownOpen) {
        // Let the keystroke update textContent first, then refresh the dropdown
        setTimeout(() => {
          capturedTypedText = zone.textContent;
          refreshHybridDropdown(zone, capturedTypedText);
        }, 0);
      }
    });

    // Called when the user selects an expression from the dropdown (any mode)
    zone.dataset.onTexExprSelected = 'true'; // marker read by showDropdownForTexLiteral

    return zone;
  }

  // Opens the expression dropdown anchored to a LiteralZone.
  // allowText: if true (Hybrid Slot), prepend a "Use text" option.
  function showDropdownForTexLiteral(zone, allowText) {
    if (dropdownHideTimeout) {
      clearTimeout(dropdownHideTimeout);
      dropdownHideTimeout = null;
    }
    hideDropdown();
    activeDropdown = document.createElement('div');
    activeDropdown.className = 'cl-dropdown';

    const rect = zone.getBoundingClientRect();
    activeDropdown.style.left = rect.left + 'px';
    activeDropdown.style.top = (rect.bottom + 4) + 'px';

    const anchorId = 'cl-tex-anchor-' + Math.random().toString(36).substr(2, 9);
    activeDropdown.dataset.anchorId = anchorId;
    activeDropdown.dataset.texLiteralMode = 'true';
    zone.id = anchorId;

    if (allowText) {
      addDropdownItems(activeDropdown, 'Insert expression or type text', []);
      // "Use text" option is dynamically injected as the user types (see refreshHybridDropdown)
    }

    // Always include Data Sources since we're at the start of an expression chain
    addDropdownItems(activeDropdown, 'Data Sources', DATA_SOURCES.map(d => ({
      label: d.label,
      val: d,
      onSelect: () => performTexSplit(zone, d)
    })));

    const overlay = document.getElementById('cl-composer-overlay');
    if (overlay) overlay.appendChild(activeDropdown);
  }

  // Refreshes the hybrid dropdown's "Use text" option as the user types
  function refreshHybridDropdown(zone, text) {
    if (!activeDropdown || !activeDropdown.dataset.texLiteralMode) return;
    // Remove previous "use text" option if present
    const existing = activeDropdown.querySelector('.cl-tex-use-text-option');
    if (existing) existing.remove();
    if (text.trim()) {
      const useText = document.createElement('div');
      useText.className = 'cl-option cl-tex-use-text-option';
      useText.textContent = `Use text: "${text}"`;
      useText.addEventListener('mousedown', e => e.preventDefault());
      useText.addEventListener('click', e => {
        e.stopPropagation();
        hideDropdown();
        // The text is already in zone.textContent — just close and repack
        delete zone.dataset.ephemeral;
        const pContainer = zone.closest('[data-text-expression]');
        if (pContainer) syncVirtualSlots(pContainer);
        setTimeout(triggerRepack, 0);
      });
      activeDropdown.insertBefore(useText, activeDropdown.firstChild);
    }
  }

  // Performs the Split operation: replaces LiteralZone with [left, ExprZone, right]
  function performTexSplit(zone, exprDef) {
    const pContainer = zone.closest('[data-text-expression]');
    if (!pContainer) return;

    // Prevent the 'blur' event (triggered by replaceWith) from auto-removing the zone mid-replacement
    delete zone.dataset.ephemeral;

    const cursorIndex = (zone.id && zone.dataset.ephemeral != null)
      ? 0
      : (window.__texCmdSlashCursor != null ? window.__texCmdSlashCursor : zone.textContent.length);
    window.__texCmdSlashCursor = null;

    const fullText = zone.textContent;
    const leftText = fullText.substring(0, cursorIndex);
    const rightText = fullText.substring(cursorIndex);

    const leftLiteral = createTextZoneElement(leftText);
    const exprZone = document.createElement('span');
    exprZone.className = 'cl-tex-expr-zone';
    const newToken = createTokenElement({ ...exprDef, type: exprDef.type });
    exprZone.appendChild(newToken);
    syncAndValidate(exprZone);
    const rightLiteral = createTextZoneElement(rightText);

    zone.replaceWith(leftLiteral, exprZone, rightLiteral);
    syncVirtualSlots(pContainer);
    triggerRepack();
    rightLiteral.focus();
  }

  // Merge operation: when an ExprZone is deleted, collapse surrounding LiteralZones
  function mergeAroundExprZone(exprZone) {
    const pContainer = exprZone.parentElement;
    if (!pContainer || !pContainer.dataset.textExpression) return;

    const prev = exprZone.previousElementSibling;
    const next = exprZone.nextElementSibling;
    const leftText = (prev && prev.classList.contains('cl-tex-literal')) ? prev.textContent : '';
    const rightText = (next && next.classList.contains('cl-tex-literal')) ? next.textContent : '';
    const mergedText = leftText + rightText;

    const merged = createTextZoneElement(mergedText);
    exprZone.replaceWith(merged);
    if (prev && prev.classList.contains('cl-tex-literal')) prev.remove();
    if (next && next.classList.contains('cl-tex-literal')) next.remove();

    // Re-add virtual slots if needed (e.g. if merged is the only child)
    syncVirtualSlots(pContainer);
    triggerRepack();
  }

  // Ensures virtual slots (+) are available as insertion points around LiteralZones/ExprZones
  function syncVirtualSlots(pContainer) {
    // 1. Remove all existing virtual slots first to recalculate
    pContainer.querySelectorAll('.cl-tex-virtual-slot').forEach(vs => vs.remove());

    // 2. Merge adjacent literal zones to prevent redundant stacking in DOM/JSON
    let currentLit = null;
    Array.from(pContainer.children).forEach(c => {
      if (c.classList.contains('cl-tex-literal')) {
        if (currentLit) {
          currentLit.textContent += c.textContent;
          c.remove();
        } else {
          currentLit = c;
        }
      } else if (c.classList.contains('cl-tex-expr-zone')) {
        currentLit = null;
      }
    });

    // 3. Select clean remainder
    const children = Array.from(pContainer.children).filter(c =>
      c.classList.contains('cl-tex-literal') || c.classList.contains('cl-tex-expr-zone')
    );

    children.forEach((child, i) => {
      // Rule: ExprZones always need a slot/literal on both sides
      if (child.classList.contains('cl-tex-expr-zone')) {
        const prev = children[i - 1];
        const next = children[i + 1];
        if (!prev || !prev.classList.contains('cl-tex-literal')) {
          child.before(createVirtualSlotElement(pContainer));
        }
        if (!next || !next.classList.contains('cl-tex-literal')) {
          child.after(createVirtualSlotElement(pContainer));
        }
      }
      // Rule: Populated LiteralZones need an insertion point (virtual slot) after them 
      // (unless an ExprZone already exists there)
      else if (child.classList.contains('cl-tex-literal') && child.textContent.trim()) {
        const next = children[i + 1];
        if (!next || !next.classList.contains('cl-tex-expr-zone')) {
          child.after(createVirtualSlotElement(pContainer));
        }
        // Also ensure one before if it's the start
        const prev = children[i - 1];
        if (!prev || !prev.classList.contains('cl-tex-expr-zone')) {
          child.before(createVirtualSlotElement(pContainer));
        }
      }
    });

    // Final fallback: if container is empty (rare), hide/show as needed
    if (pContainer.children.length === 0) {
      pContainer.appendChild(createTextZoneElement(''));
    }
  }

  // Scrapes a TextExpression container (sequential text + expression zones) into Bubble's JSON format.
  // Only inserts "" between two adjacent ExprZones (the sole repair rule).
  function packTextExpression(pContainer) {
    const children = Array.from(pContainer.children).filter(c =>
      c.classList.contains('cl-tex-literal') || c.classList.contains('cl-tex-expr-zone')
    );

    if (children.length === 0) {
      return { type: 'TextExpression', entries: { '0': '' } };
    }

    const entries = {};
    let idx = 0;
    let lastWasExpression = false;

    children.forEach(child => {
      if (child.classList.contains('cl-tex-literal')) {
        entries[String(idx++)] = child.textContent || '';
        lastWasExpression = false;
      } else if (child.classList.contains('cl-tex-expr-zone')) {
        // Adjacency repair: insert empty string if two expressions are side-by-side
        if (lastWasExpression) {
          entries[String(idx++)] = '';
        }
        const packed = packExpression(child);
        if (packed) {
          entries[String(idx++)] = packed;
          lastWasExpression = true;
        }
      }
    });

    // Plain text only → compact form { "0": "text" }
    const keys = Object.keys(entries);
    if (keys.length === 1 && typeof entries['0'] === 'string') {
      return { type: 'TextExpression', entries: { '0': entries['0'] } };
    }

    return { type: 'TextExpression', entries };
  }

  // Shows/hides the ⌘/ hint bar at the bottom of the composer popup
  function showTexHint() {
    let hint = document.getElementById('cl-tex-hint');
    if (!hint) {
      hint = document.createElement('div');
      hint.id = 'cl-tex-hint';
      hint.className = 'cl-tex-hint';
      hint.textContent = 'Press ⌘/ (Mac) or Ctrl+/ (Windows) to insert an expression';
      const popup = document.querySelector('.cl-advanced-composer-popup');
      if (popup) popup.appendChild(hint);
    }
    hint.classList.add('visible');
  }

  function hideTexHint() {
    const hint = document.getElementById('cl-tex-hint');
    if (hint) hint.classList.remove('visible');
  }

  // --- Engine Packer (Phase 6) ---
  // Helper that dispatches to the correct packer based on the container's personality.
  // This ensures TextExpression wrappers are preserved at all levels.
  function getPackedExpression(composerEl) {
    if (!composerEl) return null;
    if (composerEl.dataset.textExpression === 'true') {
      return packTextExpression(composerEl);
    }
    return packExpression(composerEl);
  }

  function packExpression(composerEl) {
    if (!composerEl) return null;

    const tokens = Array.from(composerEl.children).filter(el => el.classList.contains('cl-token'));

    // Recursive node chain builder
    function buildNode(index) {
      if (index >= tokens.length) return null;

      const tokenEl = tokens[index];

      // CRITICAL: Always parse a FRESH copy from the dataset to avoid mutation issues
      // between different parts of the recursive packing chain.
      let rawData = JSON.parse(tokenEl.dataset.bubbleJson || "{}");

      // Look for inner interactive args layer
      const argContainer = Array.from(tokenEl.children).find(c => c.classList.contains('cl-arg-container'));
      if (argContainer) {
        const innerPacked = getPackedExpression(argContainer);
        if (innerPacked) rawData.args = innerPacked;
        else delete rawData.args;
      } else {
        // Handle propertiesSchema blocks
        const propGroups = Array.from(tokenEl.querySelectorAll(':scope > .cl-prop-group'));
        if (propGroups.length > 0) {
          rawData.properties ||= {};

          // Resolve the operator definition to check for property types (TextExpression wrapping)
          let opDef = null;
          for (const key in BUBBLE_SCHEMA) {
            const found = BUBBLE_SCHEMA[key].find(o => o.op === rawData.name);
            if (found) { opDef = found; break; }
          }
          // Also search in Data Sources schema
          if (!opDef) {
            opDef = DATA_SOURCES.find(ds => ds.type === rawData.type);
          }

          propGroups.forEach(group => {
            const pkey = group.dataset.propKey;
            const pContainer = group.querySelector('.cl-arg-container');
            if (pkey && pContainer) {
              const schemaItem = opDef && opDef.propertiesSchema && opDef.propertiesSchema.find(s => s.key === pkey);

              if (schemaItem && schemaItem.type === 'text' && pContainer.dataset.textExpression === 'true') {
                // Use the TextExpression sequential scraper
                rawData.properties[pkey] = packTextExpression(pContainer);
              } else {
                let pPacked = getPackedExpression(pContainer);
                if (pPacked && schemaItem && schemaItem.type === 'text') {
                  // Fallback: plain string node → wrap
                  if (pPacked.type === 'String' && !pPacked.next) {
                    pPacked = { type: 'TextExpression', entries: { '0': pPacked.value !== undefined ? String(pPacked.value) : '' } };
                  } else {
                    pPacked = { type: 'TextExpression', entries: { '0': '', '1': pPacked, '2': '' } };
                  }
                }
                if (pPacked) rawData.properties[pkey] = pPacked;
              }
            }
          });
        }

        // Resolve primitive content edits if user typed inline
        if (rawData.type === 'Number' || rawData.type === 'String' || rawData.type === 'sys.bool') {
          const rawText = Array.from(tokenEl.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent).join('').trim();

          // CRITICAL: If rawData has an empty value but the DOM has text, use the DOM text
          if (rawText && !rawData.value) {
            if (rawData.type === 'Number') rawData.value = Number(rawText);
            else if (rawData.type === 'sys.bool') rawData.value = (rawText === 'true' || rawText === 'yes' || rawText === '1');
            else rawData.value = rawText;
          } else {
            if (rawData.type === 'Number') rawData.value = Number(rawText);
            else if (rawData.type === 'sys.bool') rawData.value = (rawText === 'true' || rawText === 'yes' || rawText === '1');
            else rawData.value = rawText;
          }
        }
      }

      const nextNode = buildNode(index + 1);
      if (nextNode) rawData.next = nextNode;
      else delete rawData.next;

      return rawData;
    }

    const result = buildNode(0);
    if (!result) {
      // FALLBACK: If no tokens, check the slots for raw text input
      const slots = Array.from(composerEl.querySelectorAll(':scope > .cl-slot'));
      const rawText = slots.map(s => s.textContent).join('').replace(/\+/g, '').trim();
      if (rawText) {
        return { type: "String", value: rawText };
      }
    }
    return result;
  }

  function triggerRepack() {
    const mainContainer = document.getElementById('cl-composer-main-container');
    if (!mainContainer) return;
    const currentExpression = getPackedExpression(mainContainer);

    const rawBox = document.getElementById('cl-composer-raw-json');
    if (rawBox) {
      rawBox.textContent = JSON.stringify(currentExpression, null, 2);
    }
  }

  // --- Schema Definition ---
  const BUBBLE_SCHEMA = {
    "text": [
      { op: "equals", arg: "text", ret: "sys.bool", label: "is" },
      { op: "not_equals", arg: "text", ret: "sys.bool", label: "is not" },
      { op: "contains", arg: "text", ret: "sys.bool", label: "contains" },
      { op: "not_contains", arg: "text", ret: "sys.bool", label: "doesn't contain" },
      { op: "is_empty", arg: "null", ret: "sys.bool", label: "is empty" },
      { op: "is_not_empty", arg: "null", ret: "sys.bool", label: "is not empty" },
      { op: "to_capitalized_words", arg: "null", ret: "text", label: ":capitalized words" },
      { op: "to_uppercase", arg: "null", ret: "text", label: ":uppercase" },
      { op: "to_lowercase", arg: "null", ret: "text", label: ":lowercase" },
      { op: "format_text", arg: "null", ret: "text", label: ":formatted as..." },
      { op: "used_as", arg: "file", ret: "file", label: ":used as..." },
      { op: "trimmed", arg: "null", ret: "text", label: ":trimmed" },
      { op: "length", arg: "null", ret: "number", label: ":number of characters" },
      { op: "extract", arg: "text", ret: "text", label: ":extract..." },
      { op: "converted_to_number", arg: "null", ret: "number", label: ":converted to number" },
      { op: "split_by", arg: "text", ret: "List<text>", label: ":split by..." },
      {
        op: "find_replace",
        propertiesSchema: [
          { key: "find", label: "find", type: "text" },
          { key: "replace", label: "replace", type: "text" }
        ],
        ret: "text",
        label: ":find & replace"
      },
      { op: "extract_regex", arg: "text", ret: "List<text>", label: ":extract with Regex" },
      { op: "append", arg: "text", ret: "text", label: "append" },
      { op: "defaulting_to", arg: "text", ret: "text", label: "defaulting to" },
      { op: "truncated", arg: "number", ret: "text", label: "truncated to" },
      { op: "truncated_from_end", arg: "number", ret: "text", label: "truncated from end to" },
      { op: "formatted_as_json_safe", arg: "null", ret: "text", label: ":formatted as JSON-safe" },
      { op: "is_in", arg: "List<text>", ret: "sys.bool", label: "is in" },
      { op: "is_not_in", arg: "List<text>", ret: "sys.bool", label: "is not in" }
    ],
    "number": [
      { op: "equals", arg: "number", ret: "sys.bool", label: "is" },
      { op: "not_equals", arg: "number", ret: "sys.bool", label: "is not" },
      { op: "greater_than", arg: "number", ret: "sys.bool", label: ">" },
      { op: "less_than", arg: "number", ret: "sys.bool", label: "<" },
      { op: "greater_or_equal_than", arg: "number", ret: "sys.bool", label: "≥" },
      { op: "less_or_equal_than", arg: "number", ret: "sys.bool", label: "≤" },
      { op: "plus", arg: "number", ret: "number", label: "+" },
      { op: "minus", arg: "number", ret: "number", label: "-" },
      { op: "times", arg: "number", ret: "number", label: "*" },
      { op: "divide", arg: "number", ret: "number", label: "/" },
      { op: "power", arg: "number", ret: "number", label: "^" },
      { op: "round", arg: "number", ret: "number", label: ":rounded to" },
      { op: "floor", arg: "null", ret: "number", label: ":floor" },
      { op: "ceil", arg: "null", ret: "number", label: ":ceiling" },
      { op: "is_empty", arg: "null", ret: "sys.bool", label: "is empty" },
      { op: "is_not_empty", arg: "null", ret: "sys.bool", label: "is not empty" },
      { op: "format_number", arg: "null", ret: "text", label: ":formatted as..." }
    ],
    "sys.bool": [
      { op: "and_", arg: "sys.bool", ret: "sys.bool", label: "and" },
      { op: "or_", arg: "sys.bool", ret: "sys.bool", label: "or" },
      { op: "is_true", arg: "null", ret: "sys.bool", label: "is yes" },
      { op: "is_false", arg: "null", ret: "sys.bool", label: "is no" },
      {
        op: "format_boolean",
        propertiesSchema: [
          { key: "formatting_for_true", label: "yes", type: "text" },
          { key: "formatting_for_false", label: "no", type: "text" }
        ],
        ret: "text",
        label: ":formatted as text"
      }
    ],
    "List": [
      { op: "count", arg: "null", ret: "number", label: ":count" },
      { op: "first_element", arg: "null", ret: "any", label: ":first item" },
      { op: "last_element", arg: "null", ret: "any", label: ":last item" },
      { op: "random_element", arg: "null", ret: "any", label: ":random item" },
      { op: "specific_item", arg: "number", ret: "any", label: ":item #" },
      { op: "contains", arg: "any", ret: "sys.bool", label: "contains" },
      { op: "not_contains", arg: "any", ret: "sys.bool", label: "doesn't contain" },
      { op: "limit_to", arg: "number", ret: "List<any>", label: ":items until #" },
      { op: "list_from", arg: "number", ret: "List<any>", label: ":items from #" },
      { op: "plus_element", arg: "any", ret: "List<any>", label: ":plus item" },
      { op: "minus_element", arg: "any", ret: "List<any>", label: ":minus item" },
      { op: "merged_with", arg: "List<any>", ret: "List<any>", label: ":merged with" },
      { op: "intersect_with", arg: "List<any>", ret: "List<any>", label: ":intersect with" },
      { op: "unique", arg: "null", ret: "List<any>", label: ":unique elements" },
      { op: "filtered", arg: "null", ret: "List<any>", label: ":filtered" },
      { op: "sorted", arg: "null", ret: "List<any>", label: ":sorted" },
      { op: "format_as_text", arg: "null", ret: "text", label: ":format as text" }
    ],
    "user": [
      { op: "email", arg: "null", ret: "text", label: "'s email" },
      { op: "slug", arg: "null", ret: "text", label: "'s slug" },
      { op: "Created Date", arg: "null", ret: "date", label: "'s Creation Date" },
      { op: "Modified Date", arg: "null", ret: "date", label: "'s Modified Date" },
      { op: "unique id", arg: "null", ret: "text", label: "'s unique id" },
      { op: "link", arg: "null", ret: "text", label: "'s link" },
      { op: "email confirmed", arg: "null", ret: "sys.bool", label: "'s email confirmed" },
      { op: "is_logged_in", arg: "null", ret: "sys.bool", label: "is logged in" },
      { op: "is_logged_out", arg: "null", ret: "sys.bool", label: "is logged out" },
      { op: "uses_password", arg: "null", ret: "sys.bool", label: "uses password" },
      { op: "equals", arg: "user", ret: "sys.bool", label: "is" },
      { op: "not_equals", arg: "user", ret: "sys.bool", label: "is not" }
    ],
    "date": [
      { op: "equals", arg: "date", ret: "sys.bool", label: "is" },
      { op: "not_equals", arg: "date", ret: "sys.bool", label: "is not" },
      { op: "greater_than", arg: "date", ret: "sys.bool", label: ">" },
      { op: "less_than", arg: "date", ret: "sys.bool", label: "<" },
      { op: "is_empty", arg: "null", ret: "sys.bool", label: "is empty" },
      { op: "is_not_empty", arg: "null", ret: "sys.bool", label: "is not empty" },
      { op: "change_days", arg: "number", ret: "date", label: "+(days):" },
      { op: "change_months", arg: "number", ret: "date", label: "+(months):" },
      { op: "format_date", arg: "null", ret: "text", label: ":formatted as..." },
      { op: "extract_from_date", arg: "null", ret: "number", label: ":extract" }
    ]
  };

  const DATA_SOURCES = [
    { type: "Search", ret: "List<any>", label: "Do a search for..." },
    { type: "CurrentUser", ret: "user", label: "Current User" },
    { type: "Input", ret: "text", label: "Input value" },
    {
      type: "ArbitraryText",
      ret: "text",
      label: "Arbitrary text",
      propertiesSchema: [
        { key: "arbitrary_text", label: "", type: "text" }
      ]
    }
  ];

  function getComputedType(tokenEl) {
    if (!tokenEl) return null;
    const rawData = JSON.parse(tokenEl.dataset.bubbleJson || "{}");

    if (rawData.type === 'Message') {
      const prevToken = tokenEl.previousElementSibling?.previousElementSibling;
      const leftType = getComputedType(prevToken);
      const schemaKey = (leftType && leftType.startsWith('List<')) ? 'List' : leftType;

      // 1. INTRINSIC RESOLUTION: Find the operator definition regardless of left-hand validity
      // This allows the chain to "recover" its type (e.g. :trimmed is always text)
      let opDef = null;
      if (schemaKey && BUBBLE_SCHEMA[schemaKey]) {
        opDef = BUBBLE_SCHEMA[schemaKey].find(o => o.op === rawData.name);
      }

      // GLOBAL FALLBACK: If not found in specific schema, search all schemas to find intrinsic type
      if (!opDef) {
        for (const key in BUBBLE_SCHEMA) {
          const found = BUBBLE_SCHEMA[key].find(o => o.op === rawData.name);
          if (found) { opDef = found; break; }
        }
      }

      if (opDef) {
        // Resolve generics (e.g. List<text> -> first_element returns 'text')
        if (opDef.ret === 'any' && leftType && leftType.startsWith('List<') && leftType.endsWith('>')) {
          return leftType.substring(5, leftType.length - 1);
        }
        if (opDef.ret === 'List<any>' && leftType && leftType.startsWith('List<') && leftType.endsWith('>')) {
          return leftType;
        }
        return opDef.ret;
      }
      return 'error';
    }

    // Fallbacks
    if (rawData.type === 'Search') return 'List<any>';
    if (rawData.type === 'Expression' && rawData.value_type) return rawData.value_type;
    if (rawData.properties?.type_to_find) return 'List<' + rawData.properties.type_to_find + '>';
    if (rawData.properties?.type) return rawData.properties.type;

    // Bubble internal defaults
    if (rawData.type === 'CurrentUser') return 'user';
    if (rawData.type === 'String' || rawData.type === 'ArbitraryText') return 'text';
    if (rawData.type === 'Number') return 'number';

    return "text"; // Default
  }

  // --- Slot & Token Interactive Engine (Ported from demo.html) ---
  let shiftAnchorElement = null;
  let activeDropdown = null;
  let dropdownHideTimeout = null;

  function normalizeArgToJson(argValue) {
    if (typeof argValue === 'object' && argValue !== null) {
      return argValue;
    } else if (typeof argValue === 'number') {
      return { type: "Number", value: argValue };
    } else if (typeof argValue === 'string') {
      return { type: "String", value: argValue };
    } else if (typeof argValue === 'boolean') {
      return { type: "sys.bool", value: argValue };
    }
    return { type: "String", value: String(argValue) };
  }

  function showDropdown(anchor) {
    if (!anchor || document.querySelectorAll('.cl-advanced-composer-popup .selected').length > 1) return;

    if (dropdownHideTimeout) {
      clearTimeout(dropdownHideTimeout);
      dropdownHideTimeout = null;
    }

    hideDropdown(); // Remove the old one immediately

    activeDropdown = document.createElement('div');
    activeDropdown.className = 'cl-dropdown';

    const rect = anchor.getBoundingClientRect();
    activeDropdown.style.left = rect.left + 'px';
    activeDropdown.style.top = (rect.bottom + 4) + 'px';
    activeDropdown.dataset.anchorId = anchor.id || 'cl-anchor-' + Math.random().toString(36).substr(2, 9);
    if (!anchor.id) anchor.id = activeDropdown.dataset.anchorId;
    anchor.dataset.dropdownId = activeDropdown.dataset.anchorId;

    const isSlot = anchor.classList.contains('cl-slot');
    // For a slot, the token to its left is previousElementSibling. 
    // For a token, the token to its left is previousElementSibling (which is a slot) -> previousElementSibling
    const referenceToken = isSlot ? anchor.previousElementSibling : anchor.previousElementSibling?.previousElementSibling;

    if (!referenceToken || !referenceToken.classList.contains('cl-token')) {
      // First slot or first token -> Show Data Sources
      const title = isSlot ? "Data Sources" : "Replace Data Source";
      addDropdownItems(activeDropdown, title, DATA_SOURCES.map(d => ({ label: d.label, val: d })));
    } else {
      // Subsequent slot/token -> Show Operators for left-hand token
      const leftType = getComputedType(referenceToken);
      const schemaKey = (leftType && leftType.startsWith('List<')) ? 'List' : leftType;

      const title = isSlot ? `Actions for ${leftType}` : `Replace Action`;

      if (schemaKey && BUBBLE_SCHEMA[schemaKey]) {
        addDropdownItems(activeDropdown, title, BUBBLE_SCHEMA[schemaKey].map(o => ({ label: o.label, val: o })));
      } else {
        addDropdownItems(activeDropdown, `No actions found for ${leftType || 'Unknown'}`, []);
      }
    }

    const overlay = document.getElementById('cl-composer-overlay');
    if (overlay) overlay.appendChild(activeDropdown);
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
      option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("💙❤️ Selected Dropdown Item:", item.val);

        if (!activeDropdown) return;
        const anchorId = activeDropdown.dataset.anchorId;
        const anchor = document.getElementById(anchorId);
        console.log("💙❤️ Anchor lookup:", anchorId, "→", anchor, "parentNode:", anchor?.parentNode);
        hideDropdown();

        if (anchor && item.val) {
          let payload = item.val;

          if (payload.op) {
            payload = { type: "Message", name: payload.op };
            if (item.val.arg && item.val.arg !== 'null') {
              if (item.val.arg === 'number') payload.args = { type: 'Number', value: 0 };
              else if (item.val.arg === 'text') payload.args = { type: 'String', value: '' };
              else if (item.val.arg === 'sys.bool') payload.args = { type: 'sys.bool', value: false };
              else payload.args = { type: 'dynamic_stub', btype: item.val.arg };
            }
          } else if (payload.type === 'Search') {
            payload = { type: 'Search', properties: { type_to_find: "user" } };
          } else if (payload.type === 'CurrentUser') {
            payload = { type: 'CurrentUser' };
          } else {
            payload = JSON.parse(JSON.stringify(payload));
          }

          // If the item has its own onSelect handler (e.g. from showDropdownForTexLiteral
          // which wires performTexSplit for cl-tex-literal hybrid slots), use it directly.
          if (item.onSelect) {
            item.onSelect();
            return;
          }

          const tokenEl = createTokenElement(payload);
          const parent = document.getElementById('cl-composer-main-container');

          if (anchor.classList.contains('cl-slot')) {
            const currentParent = anchor.parentNode || parent;
            console.log("💙❤️ Inserting at slot, currentParent:", currentParent);
            if (currentParent) {
              currentParent.insertBefore(tokenEl, anchor.nextSibling);
              syncAndValidate(currentParent);
            }
          } else if (anchor.classList.contains('cl-token')) {
            const currentParent = anchor.parentNode || parent;
            if (currentParent) {
              currentParent.insertBefore(tokenEl, anchor);
              anchor.remove();
              syncAndValidate(currentParent);
            } else {
              // Failsafe
              const realAnchor = document.getElementById(anchorId);
              if (realAnchor && realAnchor.parentNode) {
                realAnchor.parentNode.insertBefore(tokenEl, realAnchor);
                realAnchor.remove();
                syncAndValidate(realAnchor.parentNode);
              } else {
                parent.appendChild(tokenEl);
                syncAndValidate(parent);
              }
            }
          }
        }
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
    document.querySelectorAll('.cl-advanced-composer-popup .selected').forEach(el => el.classList.remove('selected'));
  }

  function updateSelection(startEl, endEl) {
    if (!startEl || !endEl || startEl.parentElement !== endEl.parentElement) return;
    clearSelection();
    const composer = startEl.parentElement;
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
  }

  function clearDropTargets() {
    document.querySelectorAll('.cl-advanced-composer-popup .drop-target').forEach(el => el.classList.remove('drop-target'));
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
    const popup = document.querySelector('.cl-advanced-composer-popup');
    const selectedItems = Array.from(popup.querySelectorAll('.selected'));
    if (selectedItems.length === 0) return;

    console.log("💙❤️ Dropped token(s) into new slot");

    let ref = slot;
    selectedItems.forEach(item => {
      if (item !== slot) {
        ref.after(item);
        ref = item;
        // Animation highlight
        item.classList.add('just-dropped');
        setTimeout(() => item.classList.remove('just-dropped'), 1000);
      }
    });

    clearDropTargets();

    // Sync all possible composers that were affected
    document.querySelectorAll('#cl-composer-main-container, .cl-arg-container').forEach(c => syncAndValidate(c));
    // Removed clearSelection() so dropped items stay blue/selected
  }

  function syncAndValidate(composerEl) {
    let composer = composerEl || document.getElementById('cl-composer-main-container');

    // Safety: If it's a DOM string or null, resolve to document body or exit
    if (typeof composer === 'string') composer = document.getElementById(composer);
    if (!composer || !(composer instanceof Element)) return;

    // 1. Remove all existing slots within this specific container
    const kids = Array.from(composer.children);
    kids.forEach(s => {
      if (s && s.classList.contains('cl-slot') && s.parentNode === composer) {
        try { s.remove(); } catch (e) { }
      }
    });

    // 2. Insert slots around tokens (unless this is a TextExpression container managed by LiteralZones)
    const isTextExpr = (composer.dataset.textExpression === 'true');
    const tokens = Array.from(composer.children).filter(c => c.classList.contains('cl-token'));

    // Special Case: If it's a TextExpression with exactly one empty literal node, 
    // it's already a slot. Adding a cl-slot is redundant.
    const isSingleEmptyLiteral = isTextExpr &&
      composer.children.length === 1 &&
      composer.firstElementChild.classList.contains('cl-tex-literal') &&
      !composer.firstElementChild.textContent.trim();

    if (tokens.length === 0) {
      // For standard containers, if no tokens exist, we need a single slot.
      // For TextExpression containers, the LiteralZone handles this UNLESS it's the single-empty case.
      if (!isTextExpr && !isSingleEmptyLiteral) {
        composer.appendChild(createSlotElement());
      }
    } else {
      // Slot at the very beginning (unless TextExpression engine handled it via literal/virtual-slot)
      if (!isTextExpr) {
        composer.insertBefore(createSlotElement(), tokens[0]);
      }

      // Slot after every token
      tokens.forEach((t, i) => {
        // In TextExpressions, the "after" slot is usually the next sibling LiteralZone.
        // We only add a cl-slot here if we're in a standard container.
        if (!isTextExpr) {
          const afterSlot = createSlotElement();
          composer.insertBefore(afterSlot, t.nextSibling);
        }

        // --- Validation Check ---
        t.classList.remove('invalid-syntax');
        const rawData = JSON.parse(t.dataset.bubbleJson || "{}");
        if (rawData.type === 'Message') {
          // For validation highlighting, we need to find the appropriate 'before' slot/literal
          const beforeUI = t.previousElementSibling;
          if (beforeUI) beforeUI.classList.remove('invalid-syntax');

          const prevToken = tokens[i - 1]; // Left token in the sequence
          const leftType = getComputedType(prevToken);
          const schemaKey = (leftType && leftType.startsWith('List<')) ? 'List' : leftType;

          if (!schemaKey || !BUBBLE_SCHEMA[schemaKey] || !BUBBLE_SCHEMA[schemaKey].find(o => o.op === rawData.name)) {
            if (beforeUI) beforeUI.classList.add('invalid-syntax');
          }
        }
      });
    }

    setTimeout(triggerRepack, 0);
  }

  function createSlotElement() {
    const slot = document.createElement('div');
    slot.className = 'cl-slot';
    slot.contentEditable = 'true';
    slot.textContent = '+';

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
      slot.textContent = ''; // Clear the '+' so it doesn't interfere
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
      slot.textContent = '+'; // Restore the '+'

      setTimeout(() => {
        if (!activeDropdown || activeDropdown.contains(document.activeElement)) return;
        hideDropdown();
      }, 150);

      // Removed syncAndValidate(slot.parentElement) from here to prevent race conditions during insertion
    });

    slot.addEventListener('dragover', e => {
      e.preventDefault();
      e.stopPropagation();
      clearDropTargets();
      slot.classList.add('drop-target');
    });

    slot.addEventListener('dragleave', (e) => {
      e.stopPropagation();
      slot.classList.remove('drop-target');
    });
    slot.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation();
      handleDropOnSlot(slot);
    });

    return slot;
  }

  // ── Display Mode Helpers ─────────────────────────────────────────────────
  // Four modes: 'collapsed' | 'preview' | 'inline' | 'popout'
  // Only tokens with a propertiesSchema receive a mode button.

  // Counts the total number of expression blocks in a chain, excluding the start node if specified.
  function _countChainLength(tokenObj, includeStart = false) {
    let count = includeStart ? 0 : -1;
    let cur = tokenObj;
    while (cur) {
      count++;
      cur = cur.next;
    }
    return Math.max(0, count);
  }

  // Deeply counts all expression nodes within a TextExpression or a standard expression chain.
  function _countAllExpressions(node) {
    if (!node || typeof node !== 'object') return 0;

    // If it's a wrapper TextExpression, sum its entries
    if (node.type === 'TextExpression' && node.entries) {
      let sum = 0;
      for (const k in node.entries) {
        sum += _countAllExpressions(node.entries[k]);
      }
      return sum;
    }

    // Otherwise, it's a single expression block (potentially with a .next chain)
    let total = 0;
    let cur = node;
    while (cur) {
      if (cur.type && cur.type !== 'Message' && cur.type !== 'TextExpression') {
        total++; // Count fundamental blocks like "Arbitrary Text"
      } else if (cur.type === 'Message') {
        total++; // Count modifiers like ":uppercase"
      }

      // Recursively count expressions hidden in properties (like Arbitrary Text's content)
      if (cur.properties) {
        for (const key in cur.properties) {
          total += _countAllExpressions(cur.properties[key]);
        }
      }
      cur = cur.next;
    }
    return total;
  }

  function _texExprCount(texNode) {
    if (!texNode || !texNode.entries) return 0;
    let count = 0;
    for (const key in texNode.entries) {
      const val = texNode.entries[key];
      if (val && typeof val === 'object') {
        count += _countAllExpressions(val);
      }
    }
    return count;
  }

  function _texCharCount(texNode) {
    if (!texNode || !texNode.entries) return 0;
    return Object.values(texNode.entries).filter(v => typeof v === 'string').reduce((s, v) => s + v.length, 0);
  }

  // Returns true if a token element is rendered inside an existing Mode 3 (inline) view.
  // Used to prevent recursive inline-in-inline nesting which breaks layout.
  function _isNestedInline(tokenEl) {
    if (!tokenEl) return false;
    // Walk up from the token's parent (not the token itself) to see if we're
    // already inside a .cl-prop-view-inline container.
    return !!tokenEl.parentElement?.closest('.cl-prop-view-inline');
  }

  // Per-operator default mode computed from the token's current JSON content.
  // tokenEl is the DOM element — needed to detect nested-inline context.
  function defaultTokenMode(opDef, tokenObj, tokenEl) {
    if (!opDef || !opDef.propertiesSchema) return 'inline';

    // Nested inline prevention: if this token is already rendered inside a
    // Mode 3 (inline) view, never default to Mode 3 — use Mode 1 instead.
    const nested = _isNestedInline(tokenEl);

    if (tokenObj.type === 'ArbitraryText') {
      const texNode = tokenObj.properties?.arbitrary_text;
      const exprs = _texExprCount(texNode);
      const chars = _texCharCount(texNode);
      if (exprs === 0 && chars === 0) return nested ? 'collapsed' : 'inline';
      if (exprs <= 1 && chars <= 20) return 'collapsed';
      return 'preview';
    }
    return nested ? 'collapsed' : 'inline';
  }

  // Short label string for Mode 1 (Collapsed).
  function renderCollapsedSummary(opDef, tokenObj) {
    if (!opDef) return renderTokenText(tokenObj);

    // Calculate the total number of "extra" expressions (modifiers + nested property expressions)
    // We count the full chain complexity and subtract 1 (the current root token).
    const totalComplexity = _countAllExpressions(tokenObj);
    const extraCount = Math.max(0, totalComplexity - 1);
    const suffix = extraCount > 0 ? ` +${extraCount} expr` : '';

    if (tokenObj.type === 'ArbitraryText') {
      const texNode = tokenObj.properties?.arbitrary_text;
      if (!texNode) return 'Arbitrary Text' + suffix;
      const textParts = texNode.entries
        ? Object.values(texNode.entries).filter(v => typeof v === 'string' && v.trim()).join('').slice(0, 30)
        : '';
      return textParts ? `"${textParts}"${suffix}` : `Arbitrary Text${suffix}`;
    }

    if (tokenObj.name === 'format_boolean') {
      const yes = tokenObj.properties?.formatting_for_true?.entries?.['0'] || 'yes';
      const no = tokenObj.properties?.formatting_for_false?.entries?.['0'] || 'no';
      return `{${yes} / ${no}}${suffix}`;
    }

    if (tokenObj.name === 'extract') {
      const unit = tokenObj.properties?.unit?.entries?.['0'] || '+';
      return `{${unit}}${suffix}`;
    }

    return renderTokenText(tokenObj) + suffix;
  }

  // Human-readable string for Mode 2 (Condensed Preview) — walks a TextExpression tree.
  function renderMode2Content(tokenObj) {
    if (!tokenObj || typeof tokenObj !== 'object') return `<span class="cl-preview-lit">${tokenObj || ''}</span>`;

    // If it's a TextExpression wrapper, we flatten it
    if (tokenObj.type === 'TextExpression' && tokenObj.entries) {
      const keys = Object.keys(tokenObj.entries).sort((a, b) => Number(a) - Number(b));
      return keys.map(k => renderMode2Content(tokenObj.entries[k])).join('');
    }

    // Otherwise, walk the chain
    let html = '';
    let cur = tokenObj;
    while (cur) {
      if (cur.type === 'Message') {
        html += `<span class="cl-preview-mod">:${cur.name}</span>`;
      } else {
        // Find opDef for label
        let opDef = null;
        for (const key in BUBBLE_SCHEMA) {
          const found = BUBBLE_SCHEMA[key].find(o => o.op === cur.name);
          if (found) { opDef = found; break; }
        }
        if (!opDef) opDef = DATA_SOURCES.find(ds => ds.type === cur.type);

        const label = opDef?.label || cur.name || cur.type;
        html += `<span class="cl-preview-op">${label}</span>`;

        // Add property previews in parentheses
        if (opDef && opDef.propertiesSchema) {
          const props = opDef.propertiesSchema.map(p => {
            const val = cur.properties?.[p.key];
            if (!val) return null;
            return renderMode2Content(val);
          }).filter(v => v !== null);

          if (props.length > 0) {
            html += `<span class="cl-preview-wrap">( ${props.join(', ')} )</span>`;
          }
        }
      }
      cur = cur.next;
    }
    return html;
  }

  // In-session popout stack: [{tokenEl, panelEl, opDef, color}]
  let _popoutStack = [];

  // Depth-indexed accent colors for nested editors.
  // Blue (#2196F3) and yellow (#ffeb3b) are reserved for selection and drop-target.
  const POPOUT_COLORS = [
    '#e91e63', // depth 0 — pink
    '#4caf50', // depth 2 — green
    '#ff9800', // depth 3 — orange
    '#00bcd4', // depth 4 — cyan
    '#9c27b0', // depth 1 — purple
    '#ffffff'  // depth 5 — white
  ];

  function _popoutColor(depth) {
    return POPOUT_COLORS[depth % POPOUT_COLORS.length];
  }

  function setTokenMode(tokenEl, mode) {
    console.log(`💙❤️ [setTokenMode] Setting token to mode: ${mode}`);
    tokenEl.dataset.propMode = mode;
    const cv = tokenEl.querySelector(':scope > .cl-prop-view-collapsed');
    const pv = tokenEl.querySelector(':scope > .cl-prop-view-preview');
    const iv = tokenEl.querySelector(':scope > .cl-prop-view-inline');

    if (tokenEl._viewTimeout) clearTimeout(tokenEl._viewTimeout);

    const applyViews = () => {
      if (cv) cv.style.display = (mode === 'collapsed') ? '' : 'none';
      if (pv) pv.style.display = (mode === 'preview') ? '' : 'none';
      if (iv) iv.style.display = (mode === 'inline') ? '' : 'none';
    };

    if (mode === 'popout') {
      // Delay collapsing the view until the new panel opening animation finishes,
      // so the jump happens when the element is pushed down out of frame.
      tokenEl._viewTimeout = setTimeout(applyViews, 550);
    } else {
      applyViews();
    }

    // Update active class on dropdown items if menu exists
    const menuItems = tokenEl.querySelectorAll(':scope > .cl-mode-wrap > .cl-mode-menu > .cl-mode-item');
    if (menuItems.length) {
      menuItems.forEach(item => {
        if (item.dataset.modeId === mode) item.classList.add('active');
        else item.classList.remove('active');
      });
    }

    // Apply depth-indexed highlight color to editing tokens; none when collapsed/preview/inline
    if (mode === 'popout') {
      // Will be colored by openPopoutEditor after stack push; pre-apply white for now
      tokenEl.style.setProperty('border-color', '#fff', 'important');
      tokenEl.style.setProperty('box-shadow', '0 0 15px rgba(255,255,255,0.3)', 'important');
      tokenEl.style.setProperty('background', 'rgba(255,255,255,0.05)', 'important');
    } else {
      tokenEl.style.removeProperty('border-color');
      tokenEl.style.removeProperty('box-shadow');
      tokenEl.style.removeProperty('background');
    }

    if (mode === 'popout') openPopoutEditor(tokenEl);
    else if (_popoutStack.some(s => s.tokenEl === tokenEl)) {
      closePopoutEditor(tokenEl);
    }
  }

  // Mode 4: open a full-width editor panel stacked above the current panel.
  // Content is rendered FRESH from JSON using the full interactive pipeline so all
  // event listeners (slots, dropdowns, drag) are correctly attached.
  function openPopoutEditor(tokenEl) {
    const popupBody = document.querySelector('.cl-popup-body');
    if (!popupBody) return;
    if (_popoutStack.find(s => s.tokenEl === tokenEl)) return;

    const depth = _popoutStack.length; // 0 = first popout opened, 1 = second, …
    const color = _popoutColor(depth);

    const rawData = JSON.parse(tokenEl.dataset.bubbleJson || '{}');
    let opDef = null;
    for (const key in BUBBLE_SCHEMA) {
      const found = BUBBLE_SCHEMA[key].find(o => o.op === rawData.name);
      if (found) { opDef = found; break; }
    }
    if (!opDef) opDef = DATA_SOURCES.find(ds => ds.type === rawData.type);

    const panel = document.createElement('div');
    panel.className = 'cl-popout-panel';
    // Color-coded border matching the editing token
    panel.style.setProperty('border-color', color, 'important');
    // Header left-border accent
    panel.style.setProperty('--popout-accent', color);

    // ── Header ──────────────────────────────────────────────────────────
    const header = document.createElement('div');
    header.className = 'cl-popout-header';
    const label = opDef?.label || renderTokenText(rawData);
    const breadcrumb = document.createElement('span');
    breadcrumb.className = 'cl-popout-breadcrumb';
    breadcrumb.innerHTML = `✏️ Editing: <strong>${label}</strong>`;
    header.appendChild(breadcrumb);
    const closeBtn = document.createElement('button');
    closeBtn.className = 'cl-popout-close-btn';
    closeBtn.textContent = '✓ Done';
    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      setTokenMode(tokenEl, 'reverting');
    });
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // ── Property editors — rendered fresh from JSON ──────────────────────
    // Store containers on the panel so closePopoutEditor can pack them.
    panel._propContainers = [];

    if (opDef?.propertiesSchema) {
      opDef.propertiesSchema.forEach(p => {
        const propWrap = document.createElement('div');
        propWrap.className = 'cl-popout-prop-wrap';
        const propLabel = document.createElement('div');
        propLabel.className = 'cl-popout-prop-label';
        propLabel.textContent = p.label;
        propWrap.appendChild(propLabel);

        // Create a fresh, fully-interactive editor container.
        const editorContainer = document.createElement('span');
        editorContainer.className = 'cl-arg-container cl-popout-editor-container';
        editorContainer.dataset.propKey = p.key;
        editorContainer.dataset.propType = p.type;

        if (p.type === 'text') {
          editorContainer.classList.add('cl-tex-property-container');
          // Render from JSON via the TextExpression pipeline — full interactive
          renderTextExpressionContainer(editorContainer, rawData.properties?.[p.key] || null);
        } else {
          // Non-text: render as standard expression chain
          const propData = rawData.properties?.[p.key];
          if (propData) {
            const pts = unpackExpression(propData);
            pts.forEach(pt => editorContainer.appendChild(createTokenElement(pt)));
          }
          syncAndValidate(editorContainer);
        }

        propWrap.appendChild(editorContainer);
        panel.appendChild(propWrap);
        panel._propContainers.push({ key: p.key, type: p.type, el: editorContainer });
      });
    }

    // Stack above the existing composer/panels (deepest level = topmost)
    const firstContainer = popupBody.querySelector('.cl-composer-container, .cl-popout-panel');

    // ── 2-Step Entrance Animation ──────────────────────────────────────────
    // Step 1: Create an invisible wrapper that starts at 0 height.
    const wrapper = document.createElement('div');
    wrapper.style.overflow = 'hidden';
    wrapper.style.height = '0px';
    wrapper.style.transition = 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    wrapper.appendChild(panel);

    // Prepare the panel to slide up and fade in
    panel.style.visibility = 'hidden'; // hide so it doesn't flash
    panel.style.transform = 'translateY(30px)';
    panel.style.opacity = '0';
    panel.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease-out';

    if (firstContainer) popupBody.insertBefore(wrapper, firstContainer);
    else popupBody.appendChild(wrapper);

    // Measure the necessary height (including margin-bottom of 12px set in CSS)
    const targetHeight = panel.offsetHeight + 12;

    requestAnimationFrame(() => {
      // Phase 1: slide everything down by expanding the wrapper's height
      wrapper.style.height = targetHeight + 'px';

      // Phase 2: slide the panel up into the newly created space
      // We start this slightly before Phase 1 finishes (e.g. 300ms) to feel connected.
      setTimeout(() => {
        panel.style.visibility = 'visible';
        panel.style.transform = 'translateY(0)';
        panel.style.opacity = '1';

        // Cleanup inline styles after animation is fully complete
        setTimeout(() => {
          wrapper.replaceWith(panel); // Un-wrap
          panel.style.transition = '';
          panel.style.transform = '';
          panel.style.opacity = '';
        }, 600);
      }, 350);
    });

    _popoutStack.push({ tokenEl, panelEl: panel, opDef, color });

    // Now apply the correct depth color to the token (stack is updated, depth is known)
    tokenEl.style.setProperty('border-color', color, 'important');
    tokenEl.style.setProperty('box-shadow', `0 0 15px ${color}55`, 'important');
    tokenEl.style.setProperty('background', `${color}11`, 'important');
  }

  // Closes a popout editor, packs the popout content back to JSON,
  // then re-renders the hidden inline view from the updated JSON.
  function closePopoutEditor(tokenEl) {
    const idx = _popoutStack.findIndex(s => s.tokenEl === tokenEl);
    if (idx === -1) return;
    const removed = _popoutStack.splice(idx);

    // To ensure a smooth staggered animation without data race conditions,
    // we first perform all the data packing/saving synchronously for the entire branch,
    // then schedule the staggered visual exits.
    const staggerSpeed = 400; // ms per box animation as requested

    // Phase 1: Pack data immediately (innermost first)
    removed.slice().reverse().forEach(({ tokenEl: currentTokenEl, panelEl, opDef }) => {
      if (panelEl._propContainers && panelEl._propContainers.length > 0) {
        let rawData = JSON.parse(currentTokenEl.dataset.bubbleJson || '{}');
        rawData.properties = rawData.properties || {};
        panelEl._propContainers.forEach(({ key, type, el }) => {
          if (type === 'text') rawData.properties[key] = packTextExpression(el);
          else {
            const packed = packExpression(el);
            if (packed) rawData.properties[key] = packed;
          }
        });
        currentTokenEl.dataset.bubbleJson = JSON.stringify(rawData);

        // Refresh hidden inline/collapsed/preview views
        const inlineView = currentTokenEl.querySelector(':scope > .cl-prop-view-inline');
        if (inlineView && opDef?.propertiesSchema) {
          inlineView.innerHTML = '';
          opDef.propertiesSchema.forEach(p => {
            const group = document.createElement('span');
            group.className = 'cl-prop-group';
            group.dataset.propKey = p.key;
            const pContainer = document.createElement('span');
            pContainer.className = 'cl-arg-container';
            if (p.type === 'text') pContainer.classList.add('cl-tex-property-container');
            const propData = rawData.properties[p.key];
            if (propData) {
              if (p.type === 'text') renderTextExpressionContainer(pContainer, propData);
              else { const pts = unpackExpression(propData); pts.forEach(pt => pContainer.appendChild(createTokenElement(pt))); }
            } else if (p.type === 'text') renderTextExpressionContainer(pContainer, null);
            group.appendChild(pContainer);
            inlineView.appendChild(group);
            syncAndValidate(pContainer);
          });
        }
        const collapsedView = currentTokenEl.querySelector(':scope > .cl-prop-view-collapsed');
        const previewView = currentTokenEl.querySelector(':scope > .cl-prop-view-preview');
        if (collapsedView && opDef) collapsedView.textContent = renderCollapsedSummary(opDef, rawData);
        if (previewView && opDef) previewView.innerHTML = renderMode2Content(rawData);
      }
    });

    // Phase 2: Staggered Visual Exit (topmost first)
    // The "removed" array contains [clickedElement, ...childrenAboveIt]
    // We want to animate childrenAboveIt first, so we reverse it.
    removed.reverse().forEach(({ tokenEl: currentTokenEl, panelEl, opDef }, index) => {
      setTimeout(() => {
        // Animation trigger
        panelEl.style.transition = `all ${staggerSpeed}ms cubic-bezier(0.4, 0, 1, 1)`;
        panelEl.style.transform = 'translateY(100px)';
        panelEl.style.opacity = '0';

        // Wait for animation to finish before removal and mode revert
        setTimeout(() => {
          const bubbleJson = JSON.parse(currentTokenEl.dataset.bubbleJson || '{}');
          const finalMode = defaultTokenMode(opDef, bubbleJson, currentTokenEl);
          setTokenMode(currentTokenEl, finalMode);
          panelEl.remove();
          triggerRepack();
        }, staggerSpeed);

      }, index * staggerSpeed);
    });
  }

  function createTokenElement(tokenObj) {
    const span = document.createElement('span');
    span.className = 'cl-token';
    span.tabIndex = 0;

    // Store raw JSON for later
    span.dataset.bubbleJson = JSON.stringify(tokenObj);
    span.draggable = true;

    // Set initial text content ONLY for terminal primitive values
    if (tokenObj.type === 'Number' || tokenObj.type === 'String' || tokenObj.type === 'sys.bool') {
      span.textContent = renderTokenText(tokenObj);
    }

    if (tokenObj.args !== undefined) {
      // Operator has arguments! We build a nested structure
      const labelNode = document.createElement('span');
      labelNode.textContent = renderTokenText(tokenObj);
      labelNode.className = 'cl-token-label';
      span.appendChild(labelNode);

      const argContainer = document.createElement('span');
      argContainer.className = 'cl-arg-container';

      // Stop events inside the argument container from bubbling up to the parent token
      argContainer.addEventListener('mousedown', (e) => e.stopPropagation());
      argContainer.addEventListener('click', (e) => e.stopPropagation());

      const unpackedArgs = unpackExpression(tokenObj.args);
      unpackedArgs.forEach(arg => argContainer.appendChild(createTokenElement(arg)));
      span.appendChild(argContainer);
    } else {
      // For non-primitives, we need a label span (e.g. ":format_boolean")
      if (tokenObj.type !== 'Number' && tokenObj.type !== 'String' && tokenObj.type !== 'sys.bool') {
        const labelSpan = document.createElement('span');
        labelSpan.textContent = renderTokenText(tokenObj);
        span.appendChild(labelSpan);
      }

      // Handle propertiesSchema UI
      let opDef = null;
      // Search in general operators schema
      for (const key in BUBBLE_SCHEMA) {
        const found = BUBBLE_SCHEMA[key].find(o => o.op === tokenObj.name);
        if (found) { opDef = found; break; }
      }
      // NEW: Also search in Data Sources schema (e.g. Arbitrary Text)
      if (!opDef) {
        opDef = DATA_SOURCES.find(ds => ds.type === tokenObj.type);
      }

      if (opDef && opDef.propertiesSchema) {
        // ── Mode Dropdown Menu ───────────────────────────────────────────────
        const modeWrap = document.createElement('span');
        modeWrap.className = 'cl-mode-wrap';

        const modeBtn = document.createElement('button');
        modeBtn.className = 'cl-mode-btn';
        modeBtn.textContent = '⋮';
        modeBtn.title = 'Change Edit Mode';
        modeBtn.addEventListener('mousedown', e => { e.stopPropagation(); });

        const modeMenu = document.createElement('div');
        modeMenu.className = 'cl-mode-menu';
        // Prevent clicking inside the menu from bubbling up and selecting the token itself
        modeMenu.addEventListener('mousedown', e => e.stopPropagation());

        modeBtn.addEventListener('click', e => {
          console.log("💙❤️ Three dot menu clicked");
          e.stopPropagation();
          // Close any other open menus
          document.querySelectorAll('.cl-mode-menu.visible').forEach(m => {
            if (m !== modeMenu) {
              m.classList.remove('visible');
              const otherWrap = m.closest('.cl-mode-wrap');
              if (otherWrap) otherWrap.style.zIndex = '';
            }
          });

          // Toggle this menu
          const isVisible = modeMenu.classList.contains('visible');
          if (isVisible) {
            modeMenu.classList.remove('visible');
            modeWrap.style.zIndex = '';
            return;
          }

          modeWrap.style.zIndex = '10000';

          // Rebuild menu contents dynamically based on nesting context
          modeMenu.innerHTML = '';
          const nested = _isNestedInline(span);
          const modes = nested
            ? [{ id: 'collapsed', name: 'Collapsed' }, { id: 'preview', name: 'Read Only' }, { id: 'popout', name: 'Edit in new box above' }]
            : [{ id: 'collapsed', name: 'Collapsed' }, { id: 'preview', name: 'Read Only' }, { id: 'inline', name: 'Inline Edit' }, { id: 'popout', name: 'Edit in new box above' }];

          const currentMode = span.dataset.propMode || 'inline';

          modes.forEach(m => {
            const item = document.createElement('div');
            item.className = 'cl-mode-item';
            item.dataset.modeId = m.id;
            if (currentMode === m.id) item.classList.add('active');
            item.textContent = m.name;
            item.addEventListener('mousedown', ev => {
              console.log("💙❤️ [MENU ITEM] mousedown fired for:", m.name);
              ev.stopPropagation();
              ev.preventDefault();
              setTokenMode(span, m.id);
              modeMenu.classList.remove('visible');
              modeWrap.style.zIndex = '';
            });
            // Keep click as backup log
            item.addEventListener('click', ev => {
              console.log("💙❤️ [MENU ITEM] click fired (should be after mousedown) for:", m.name);
              ev.stopPropagation();
            });
            modeMenu.appendChild(item);
          });

          modeMenu.classList.add('visible');
        });

        modeWrap.appendChild(modeBtn);
        modeWrap.appendChild(modeMenu);
        span.appendChild(modeWrap);

        // ── View: Collapsed (Mode 1) ─────────────────────────────────────────
        const collapsedView = document.createElement('span');
        collapsedView.className = 'cl-prop-view-collapsed';
        collapsedView.style.display = 'none';
        collapsedView.textContent = renderCollapsedSummary(opDef, tokenObj);
        span.appendChild(collapsedView);

        // ── View: Preview (Mode 2) ───────────────────────────────────────────
        const previewView = document.createElement('span');
        previewView.className = 'cl-prop-view-preview';
        previewView.style.display = 'none';
        previewView.innerHTML = renderMode2Content(tokenObj);
        span.appendChild(previewView);

        // ── View: Inline (Mode 3) ────────────────────────────────────────────
        const inlineView = document.createElement('span');
        inlineView.className = 'cl-prop-view-inline';
        opDef.propertiesSchema.forEach(p => {
          const group = document.createElement('span');
          group.className = 'cl-prop-group';
          group.dataset.propKey = p.key;
          group.addEventListener('mousedown', e => e.stopPropagation());
          group.addEventListener('click', e => e.stopPropagation());

          const pLabel = document.createElement('span');
          pLabel.className = 'cl-prop-label';
          pLabel.textContent = p.label + ':';
          group.appendChild(pLabel);

          const pContainer = document.createElement('span');
          pContainer.className = 'cl-arg-container';
          if (p.type === 'text') pContainer.classList.add('cl-tex-property-container');

          if (tokenObj.properties && tokenObj.properties[p.key]) {
            const propData = tokenObj.properties[p.key];
            if (p.type === 'text') renderTextExpressionContainer(pContainer, propData);
            else { const pts = unpackExpression(propData); pts.forEach(pt => pContainer.appendChild(createTokenElement(pt))); }
          } else if (p.type === 'text') {
            renderTextExpressionContainer(pContainer, null);
          }

          if (p.type === 'text') group.classList.add('cl-tex-prop-group');
          group.appendChild(pContainer);
          inlineView.appendChild(group);
          syncAndValidate(pContainer);
        });
        span.appendChild(inlineView);

        // ── Apply default mode ───────────────────────────────────────────────
        setTokenMode(span, defaultTokenMode(opDef, tokenObj, span));
      }
    }

    span.addEventListener('dragstart', e => {
      // If drag started inside a nested property group, let that sub-element handle it
      if (e.target && e.target.nodeType === 1 && e.target.closest('.cl-prop-group')) return;

      e.stopPropagation();
      console.log("💙❤️ Token Dragstart");

      const selected = Array.from(document.querySelectorAll('.cl-advanced-composer-popup .selected'));
      // If we're dragging something not in the current selection, clear and select it
      if (!selected.includes(span)) {
        clearSelection();
        span.classList.add('selected');
        selected.push(span);
      }

      // OFFSET GHOST IMAGE: Move it down 15px and right 60px away from the cursor
      if (e.dataTransfer && typeof e.dataTransfer.setDragImage === 'function') {
        // setDragImage(element, xOffset, yOffset) 
        // xOffset/yOffset are coordinates relative to the element where the pointer should be.
        // To move element DOWN/RIGHT of cursor, we tell browser the cursor is at -15, -60 relative to element.
        // Actually, most browsers clip the image if you use negative offsets, so we use a small positive offset for the cursor's "pin".
        e.dataTransfer.setDragImage(span, -20, -20);
      }

      setTimeout(() => {
        const activeGroup = Array.from(document.querySelectorAll('.cl-advanced-composer-popup .selected'));
        activeGroup.forEach(el => el.classList.add('dragging'));
      }, 0);
    });

    span.addEventListener('dragend', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.cl-advanced-composer-popup .dragging').forEach(el => el.classList.remove('dragging'));
      clearDropTargets();
    });

    span.addEventListener('dragover', e => {
      e.preventDefault();
      e.stopPropagation();
      clearDropTargets();
      const slot = getNearestSlot(span, e.clientX);
      if (slot && slot.classList.contains('cl-slot')) slot.classList.add('drop-target');
    });

    span.addEventListener('blur', () => {
      span.contentEditable = "false";

      dropdownHideTimeout = setTimeout(() => {
        if (!activeDropdown || activeDropdown.contains(document.activeElement)) return;
        hideDropdown();
      }, 150);

      // Removed syncAndValidate(span.parentElement) to prevent DOM corruption during dropdown click replacements

      // Update data-json for primitives when user finishes typing
      const rawData = JSON.parse(span.dataset.bubbleJson || "{}");
      if (rawData.type === 'Number' || rawData.type === 'String' || rawData.type === 'sys.bool') {
        const newText = span.textContent.trim();
        if (rawData.type === 'Number') rawData.value = Number(newText);
        else if (rawData.type === 'sys.bool') rawData.value = (newText === 'true' || newText === 'yes');
        else rawData.value = newText;

        span.dataset.bubbleJson = JSON.stringify(rawData);
        triggerRepack();
      }
    });

    span.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation();
      const slot = getNearestSlot(span, e.clientX);
      if (slot) handleDropOnSlot(slot);
    });

    let startX, startY;
    const DRAG_THRESHOLD = 5;
    span.addEventListener('mousedown', (e) => {
      // If clicking inside a nested property group, don't trigger parent selection/drag
      if (e.target && e.target.nodeType === 1 && e.target.closest('.cl-prop-group')) return;

      e.stopPropagation();

      // INSTANT SELECTION: Don't wait for movement threshold to turn blue
      if (!e.shiftKey && !span.classList.contains('selected')) {
        console.log("💙❤️ Token focus/active state programmatically given");
        clearSelection();
        span.classList.add('selected');
        shiftAnchorElement = span;
      }

      startX = e.clientX; startY = e.clientY;
      const onMouseUp = (ue) => {
        // If it was just a click (not a drag), ensure final focus/shift-selection state
        if (Math.sqrt(Math.pow(ue.clientX - startX, 2) + Math.pow(ue.clientY - startY, 2)) < DRAG_THRESHOLD) {
          if (e.shiftKey && shiftAnchorElement) {
            updateSelection(shiftAnchorElement, span);
            span.focus();
          } else {
            // Already handled mousedown above, but ensure focus
            span.focus();
          }
        }
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mouseup', onMouseUp);
    });

    span.addEventListener('focus', (e) => {
      e.stopPropagation();
      const rawData = JSON.parse(span.dataset.bubbleJson);

      // Only allow inline text editing on terminal primitive values
      if (rawData.type === 'Number' || rawData.type === 'String' || rawData.type === 'sys.bool') {
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
        e.stopPropagation();
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
        e.stopPropagation();
        hideDropdown();
        if (span.previousElementSibling) {
          const p = span.previousElementSibling;
          if (e.shiftKey && shiftAnchorElement) updateSelection(shiftAnchorElement, p);
          else { clearSelection(); shiftAnchorElement = p; }
          p.focus();
        }
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.stopPropagation();
        const selected = Array.from(document.querySelectorAll('.cl-advanced-composer-popup .selected'));
        const parent = span.parentElement;
        if (selected.length > 0) {
          selected.forEach(el => el.remove());
        } else {
          span.remove();
        }
        syncAndValidate(parent);
        console.log("💙❤️ Token(s) deleted");
      }
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); span.blur(); }
    });

    return span;
  }

  function renderTokenText(token) {
    let text = token.type;

    if (token.type === 'Number' || token.type === 'String' || token.type === 'sys.bool') {
      return String(token.value !== undefined ? token.value : token.type);
    }

    if (token.type === 'Message') {
      text = ":" + (token.name || "unknown");
    } else if (token.type === 'ArbitraryText') {
      text = "Arbitrary Text";
    } else if (token.type === 'Search') {
      text = "Search for " + (token.properties?.type_to_find || "...");
    }

    return text;
  }

  function renderExpression(json) {
    const container = document.getElementById('cl-composer-main-container');
    const rawBox = document.getElementById('cl-composer-raw-json');
    if (!container) return;

    // Reset container personality
    delete container.dataset.textExpression;

    // Diagnostic raw output
    if (rawBox) {
      rawBox.textContent = JSON.stringify(json, null, 2);
    }

    // Step 4: Dispatch to the correct rendering engine based on the sequential component type.
    if (json && json.type === 'TextExpression') {
      renderTextExpressionContainer(container, json);
    } else {
      renderStandardExpressionContainer(container, json);
    }
  }

  // Regular linked-list expression renderer (Data Source -> Messages)
  function renderStandardExpressionContainer(container, json) {
    const tokens = unpackExpression(json);
    console.log("💙❤️ Unpacked Flat Array:", tokens);

    container.innerHTML = '';

    tokens.forEach((token) => {
      const tokenEl = createTokenElement(token);
      container.appendChild(tokenEl);
    });

    finalizeContainer(container);
  }

  // Shared finalization logic for all root containers
  function finalizeContainer(container) {
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

    // For standard expression containers, wrap tokens in slots.
    // TextExpression containers manage their own slots via syncVirtualSlots().
    if (container.dataset.textExpression !== 'true') {
      syncAndValidate(container);
    }
    // Output initial state to diagnostic window
    triggerRepack();
  }

  // Listen for the Data Ready event from api_bridge
  window.addEventListener('message', (event) => {
    if (event.data.type === 'CL_ADVANCED_COMPOSER_DATA_READY') {
      openPopup(event.data.expressionJson);
    }
  });

  // Global listener to close mode menus when clicking elsewhere
  window.addEventListener('click', () => {
    document.querySelectorAll('.cl-mode-menu.visible').forEach(m => m.classList.remove('visible'));
  });

})();//👈👈 don't delete this, and don't put anything outside of this!!
