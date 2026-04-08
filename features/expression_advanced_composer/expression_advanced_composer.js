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
    // Small delay to trigger transitions
    setTimeout(() => {
      overlay.classList.add('visible');
    }, 10);
    
    console.log("💙❤️ Popup opened with expression:", expressionJson);
    renderExpression(expressionJson);
  }

  function handleSave() {
    console.log("💙❤️ Save triggered: Committing compiled expression to Bubble...");
    const mainContainer = document.getElementById('cl-composer-main-container');
    const finalExpression = packExpression(mainContainer);
    
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

    // General Handle: TextExpression wrapper (found in properties like format_boolean)
    // Extract the FIRST expression node found in the entries map.
    if (jsonNode.type === 'TextExpression' && jsonNode.entries) {
      const firstExprKey = Object.keys(jsonNode.entries).find(k => {
        const val = jsonNode.entries[k];
        return val && typeof val === 'object' && val.type;
      });
      if (firstExprKey) return unpackExpression(jsonNode.entries[firstExprKey]);
      // If it's just a raw number/string in entries, wrap it so it renders as a token
      const firstRawKey = Object.keys(jsonNode.entries)[0];
      if (firstRawKey !== undefined) {
         return [{ type: 'String', value: jsonNode.entries[firstRawKey] }];
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

  // --- Engine Packer (Phase 6) ---
  function packExpression(composerEl) {
    if (!composerEl) return null;
    
    const tokens = Array.from(composerEl.children).filter(el => el.classList.contains('cl-token'));
    if (tokens.length === 0) return null;
    
    // Recursive node chain builder
    function buildNode(index) {
      if (index >= tokens.length) return null;
      
      const tokenEl = tokens[index];
      const rawData = JSON.parse(tokenEl.dataset.bubbleJson || "{}");
      
      // Look for inner interactive args layer
      const argContainer = Array.from(tokenEl.children).find(c => c.classList.contains('cl-arg-container'));
      if (argContainer) {
         const innerPacked = packExpression(argContainer);
         if (innerPacked) rawData.args = innerPacked;
         else delete rawData.args;
      } else {
         // Handle propertiesSchema blocks
         const propGroups = Array.from(tokenEl.querySelectorAll('.cl-prop-group'));
         if (propGroups.length > 0) {
            rawData.properties ||= {};
            propGroups.forEach(group => {
               const pkey = group.dataset.propKey;
               const pContainer = group.querySelector('.cl-arg-container');
               if (pkey && pContainer) {
                  let pPacked = packExpression(pContainer);
                  
                  // General Handle: If this is a 'text' type property in the schema, 
                  // wrap it in a TextExpression object to match Bubble's expected AST.
                  const schemaItem = opDef && opDef.propertiesSchema.find(s => s.key === pkey);
                  if (pPacked && schemaItem && schemaItem.type === 'text') {
                     pPacked = {
                        type: "TextExpression",
                        entries: { "0": "", "1": pPacked, "2": "" }
                     };
                  }
                  
                  if (pPacked) rawData.properties[pkey] = pPacked;
               }
            });
         }

         // Resolve primitive content edits if user typed inline
         if (rawData.type === 'Number' || rawData.type === 'String' || rawData.type === 'sys.bool') {
            const rawText = Array.from(tokenEl.childNodes)
                     .filter(node => node.nodeType === Node.TEXT_NODE)
                     .map(node => node.textContent).join('').trim();
            
            if (rawData.type === 'Number') rawData.value = Number(rawText);
            else if (rawData.type === 'sys.bool') rawData.value = (rawText === 'true' || rawText === 'yes' || rawText === '1');
            else rawData.value = rawText;
         }
      }
      
      const nextNode = buildNode(index + 1);
      if (nextNode) rawData.next = nextNode;
      else delete rawData.next;
      
      return rawData;
    }
    
    return buildNode(0);
  }

  function triggerRepack() {
    const mainContainer = document.getElementById('cl-composer-main-container');
    if (!mainContainer) return;
    const currentExpression = packExpression(mainContainer);
    
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
      { op: "is_logged_in", arg: "null", ret: "sys.bool", label: "is logged in" },
      { op: "equals", arg: "user", ret: "sys.bool", label: "is" },
      { op: "not_equals", arg: "user", ret: "sys.bool", label: "is not" }
    ],
    "date": [
      { op: "equals", arg: "date", ret: "sys.bool", label: "is" },
      { op: "not_equals", arg: "date", ret: "sys.bool", label: "is not" },
      { op: "greater_than", arg: "date", ret: "sys.bool", label: ">" },
      { op: "less_than", arg: "date", ret: "sys.bool", label: "<" },
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
    { type: "Dynamic", ret: "text", label: "Arbitrary text" }
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
      option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("💙❤️ Selected Dropdown Item:", item.val);
        
        if (!activeDropdown) return;
        const anchorId = activeDropdown.dataset.anchorId;
        const anchor = document.getElementById(anchorId);
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

           const tokenEl = createTokenElement(payload);
            const parent = document.getElementById('cl-composer-main-container');
            
            if (anchor.classList.contains('cl-slot')) {
                 const currentParent = anchor.parentNode || parent;
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
          try { s.remove(); } catch(e) {}
       }
    });
    
    // 2. Insert slots around tokens
    const tokens = Array.from(composer.children).filter(c => c.classList.contains('cl-token'));
    
    if (tokens.length === 0) {
      composer.appendChild(createSlotElement());
    } else {
      // Slot at the very beginning
      composer.insertBefore(createSlotElement(), tokens[0]);
      
      // Slot after every token
      tokens.forEach((t, i) => {
        const afterSlot = createSlotElement();
        composer.insertBefore(afterSlot, t.nextSibling);
        
        // --- Validation Check ---
        t.classList.remove('invalid-syntax');
        const rawData = JSON.parse(t.dataset.bubbleJson || "{}");
        if (rawData.type === 'Message') {
           const beforeSlot = t.previousElementSibling;
           if (beforeSlot) beforeSlot.classList.remove('invalid-syntax');
           
           const prevToken = tokens[i - 1]; // Left token in the sequence
           const leftType = getComputedType(prevToken);
           const schemaKey = (leftType && leftType.startsWith('List<')) ? 'List' : leftType;
           
           if (!schemaKey || !BUBBLE_SCHEMA[schemaKey] || !BUBBLE_SCHEMA[schemaKey].find(o => o.op === rawData.name)) {
               if (beforeSlot) beforeSlot.classList.add('invalid-syntax');
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

  function createTokenElement(tokenObj) {
    const span = document.createElement('span');
    span.className = 'cl-token';
    span.tabIndex = 0;
    
    // Store raw JSON for later
    span.dataset.bubbleJson = JSON.stringify(tokenObj);
    span.draggable = true;
    
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
      const labelSpan = document.createElement('span');
      labelSpan.textContent = renderTokenText(tokenObj);
      span.appendChild(labelSpan);

      // Handle propertiesSchema UI
      let opDef = null;
      for (const key in BUBBLE_SCHEMA) {
         const found = BUBBLE_SCHEMA[key].find(o => o.op === tokenObj.name);
         if (found) { opDef = found; break; }
      }

      if (opDef && opDef.propertiesSchema) {
         opDef.propertiesSchema.forEach(p => {
            const group = document.createElement('span');
            group.className = 'cl-prop-group';
            group.dataset.propKey = p.key;
            
            // CRITICAL: Stop propagation so clicking inside YES/NO doesn't trigger the parent operator dropdown
            group.addEventListener('mousedown', (e) => e.stopPropagation());
            group.addEventListener('click', (e) => e.stopPropagation());

            const pLabel = document.createElement('span');
            pLabel.className = 'cl-prop-label';
            pLabel.textContent = p.label + ':';
            group.appendChild(pLabel);

            const pContainer = document.createElement('span');
            pContainer.className = 'cl-arg-container';
            
            // If the incoming JSON already has this property, unpack it
            if (tokenObj.properties && tokenObj.properties[p.key]) {
               const pTokens = unpackExpression(tokenObj.properties[p.key]);
               pTokens.forEach(pt => pContainer.appendChild(createTokenElement(pt)));
            }
            
            group.appendChild(pContainer);
            span.appendChild(group);
            
            // Render slots (+) inside the property container immediately
            syncAndValidate(pContainer);
         });
      }
    }
    
    span.addEventListener('dragstart', e => {
      // If drag started inside a nested property group, let that sub-element handle it
      if (e.target.closest('.cl-prop-group')) return;

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
      if (e.target.closest('.cl-prop-group')) return;

      e.stopPropagation();
      
      // INSTANT SELECTION: Don't wait for movement threshold to turn blue
      if (!e.shiftKey && !span.classList.contains('selected')) {
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
    } else if (token.type === 'Search') {
      text = "Search for " + (token.properties?.type_to_find || "...");
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
    syncAndValidate(container);
    // Output initial state to diagnostic window
    triggerRepack();
  }

  // Listen for the Data Ready event from api_bridge
  window.addEventListener('message', (event) => {
    if (event.data.type === 'CL_ADVANCED_COMPOSER_DATA_READY') {
      openPopup(event.data.expressionJson);
    }
  });

})();//👈👈 don't delete this, and don't put anything outside of this!!
