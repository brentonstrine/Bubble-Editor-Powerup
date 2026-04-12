window.loadedCodelessLoveScripts ||= {};
(function () {
    console.log("❤️" + "Expression Analyzer");
    let thisScriptKey = "expression_analyzer";

    /* ------------------------------------------------ */
    /* ⬇️ ⬇️ ⬇️ ⬇️ ⬇️ Don't mess with this  ⬇️ ⬇️ ⬇️ ⬇️ ⬇️ */
    /* ------------------------------------------------ */
    if (window.loadedCodelessLoveScripts[thisScriptKey] == "loaded") {
        console.warn("❤️" + thisScriptKey + " tried to load, but it's value is already " + window.loadedCodelessLoveScripts[thisScriptKey]);
        return;
    }
    window.loadedCodelessLoveScripts[thisScriptKey] = "loaded";
    console.log("❤️" + window.loadedCodelessLoveScripts[thisScriptKey]);
    /* ------------------------------------------------ */
    /* ⬆️ ⬆️ ⬆️ ⬆️ ⬆️ Don't mess with this  ⬆️ ⬆️ ⬆️ ⬆️ ⬆️ */
    /* ------------------------------------------------ */

    console.log("❤️ [Expression Analyzer] Phase 1 ✅ Script injected.");

    // ─── Phase 2: Observe when the expression dropdown opens ───────────────────
    //
    // Bubble opens a dropdown (div.dropdown-items-positioner[role=listbox]) inside
    // a .composer whenever the user clicks the last "Add" spot or any PreviousStep
    // spot.  We use a MutationObserver on the document body so we catch it as soon
    // as the node is inserted into the DOM.

    // Bubble toggles the `opened` class on .dropdown-container rather than
    // inserting/removing the positioner from the DOM, so we watch for attribute
    // (class) changes instead of childList mutations.
    // Track recently-fired containers to prevent duplicate fires
    // (Bubble can batch multiple class mutations in one tick)
    const recentlyFired = new WeakSet();
    
    // NEW: Schema Storage key
    const SCHEMA_KEY = 'CL_AppSchema';
    
    /** 
     * NEW: Schema Scanner
     * Uses the appquery bridge to crawl user-defined definitions.
     */
    window.CL_ScanSchema = function() {
        console.log("❤️ [Expression Analyzer] 🔍 Starting App Schema Scan...");
        if (typeof window.appquery === 'undefined') {
            console.error("❌ appquery not found. Are you in the Bubble Editor?");
            return;
        }

        const schema = { customTypes: {}, optionSets: {} };
        
        try {
            // 1. Scan Custom Data Types
            const types = appquery.custom_types ? appquery.custom_types() : [];
            types.forEach(typeNode => {
                const node = typeNode.json;
                const typeId = node.__name;
                
                // Greedy lookup for human name
                const typeName = node.child('%nm').raw() || node.child('%dn').raw() || node.child('name').raw() || typeId;
                
                schema.customTypes[typeId] = {
                    name: typeName,
                    fields: {}
                };

                const fieldsBranch = node.child('fields');
                if (fieldsBranch.exists()) {
                    fieldsBranch.child_names().forEach(fId => {
                        const fNode = fieldsBranch.child(fId);
                        
                        // Greedy lookup for field name
                        let fName = fNode.child('%nm').raw() || fNode.child('%dn').raw() || fNode.child('name').raw() || fId;
                        
                        // Fallback type extraction from key (e.g. description_text -> text)
                        let fType = fNode.child('type').raw();
                        if (!fType && fId.includes('_')) {
                            const parts = fId.split('_');
                            fType = parts[parts.length - 1]; // Guess: the last part is the type
                        }

                        schema.customTypes[typeId].fields[fId] = {
                            name: fName,
                            type: fType || 'unknown',
                            isList: fNode.child('is_list').raw() === true || fId.includes('_list_')
                        };
                    });
                }
            });

            // 2. Scan Option Sets
            const optionSets = appquery.option_sets ? appquery.option_sets() : [];
            optionSets.forEach(osNode => {
                const node = osNode.json;
                const osId = node.__name;
                const osName = node.child('%nm').raw() || node.child('%dn').raw() || node.child('name').raw() || osId;
                
                const optionsBranch = node.child('options');
                schema.optionSets[osId] = {
                    name: osName,
                    options: optionsBranch.exists() ? optionsBranch.child_names().map(oId => {
                        const oNode = optionsBranch.child(oId);
                        return { 
                            id: oId, 
                            name: oNode.child('%nm').raw() || oNode.child('%dn').raw() || oNode.child('value').raw() || oId 
                        };
                    }) : []
                };
            });

            localStorage.setItem(SCHEMA_KEY, JSON.stringify(schema));
            console.log("❤️ [Expression Analyzer] ✅ Schema Scan Complete! Saved to localStorage.CL_AppSchema", schema);
            return schema;
        } catch (e) {
            console.error("❌ Schema Scan Failed:", e);
        }
    };

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('dropdown-container') && target.classList.contains('opened')) {
                    handleOpenedDropdown(target);
                }
            } else if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        if (node.classList.contains('dropdown-container') && node.classList.contains('opened')) {
                            handleOpenedDropdown(node);
                        } else if (node.querySelector) {
                            const nested = node.querySelectorAll('.dropdown-container.opened');
                            nested.forEach(handleOpenedDropdown);
                        }
                    }
                }
            }
        }
    });

    function handleOpenedDropdown(target) {
        // Deduplicate: skip if we already processed this container in this tick
        if (recentlyFired.has(target)) return;
        recentlyFired.add(target);
        setTimeout(() => recentlyFired.delete(target), 100);

        // Must be inside an expression .composer
        if (!target.closest('.composer')) return;

        // Find the listbox inside this container
        const dropdown = target.querySelector('[role="listbox"]');
        if (!dropdown) return;

        const allItems = dropdown.querySelectorAll('.dropdown-item-container');
        const validItems = dropdown.querySelectorAll('.dropdown-item-container:not(.disabled)');

        console.log(
            `❤️ [Expression Analyzer] Phase 2 ✅ Expression Dropdown Opened: ` +
            `${validItems.length} valid items (${allItems.length} total)`,
            dropdown
        );
                                                        
        // ─── Phase 2.4: Type Categorization (Heuristics) ─────────────────
        // Guess the return type of the LHO based on the options visible in this menu.
        const CATEGORY_MAP = {
            'Number':  ['>', '<', '≥', '≤', '+', '-', '*', '/', '^', 'rounded to', 'floor', 'ceiling'],
            'Text':    [':uppercase', ':lowercase', ':capitalized words', ':split by...', 'append', 'truncated to'],
            'List':    [':count', ':first item', ':last item', ':filter', ':sorted', ':unique elements', 'merged with', 'intersect with'],
            'Boolean': ['and', 'or', 'is yes', 'is no']
        };

        function categorizeOptions(scraped) {
            const labels = scraped.map(s => s.label);
            const counts = { 'Number': 0, 'Text': 0, 'List': 0, 'Boolean': 0 };
            
            for (const [cat, triggers] of Object.entries(CATEGORY_MAP)) {
                for (const trigger of triggers) {
                    if (labels.includes(trigger)) counts[cat]++;
                }
            }
            
            const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
            return sorted[0][1] > 0 ? sorted[0][0] : 'Unknown';
        }

        // ─── Phase 2.5: Scrape all visible labels immediately ─────────────
        // Capture the full set of valid labels right now at dropdown-open time,
        // giving us graph data even when the user dismisses without clicking.
        // Filter: skip placeholder text that Bubble shows when search has no matches.
        const PHANTOM_LABELS = new Set(['No results found']);
        const scraped = Array.from(validItems)
            .map(el => ({
                label: el.querySelector('.dropdown-item')?.firstChild?.textContent?.trim()
                       ?? el.textContent.trim(),
                disabled: el.classList.contains('disabled'),
            }))
            .filter(({ label }) => !PHANTOM_LABELS.has(label));

        // ─── Phase 3: Identify the Left-Hand Operand (LHO) ────────────────
        const lho = getLHO(target);
        const returnCategory = categorizeOptions(scraped);
        lho.returnCategory = returnCategory;

        console.log(`❤️ [Expression Analyzer] Phase 3 ✅ — LHO:`, lho, `(Guessed Type: ${returnCategory})`);

        // Phase 2.5 persist (runs after Phase 3 so lho is available)
        recordAvailableOptions(lho, scraped);

        // ─── Phase 5: Highlight dropdown items based on exploration status ───
        highlightDropdownItems(target, lho);

        // ─── Phase 4: Store context for delegated mousedown listener ──────
        const watchedSpot = target.closest('.spot');
        const searchInput = target.querySelector('input');
        let currentSearch = '';

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value.trim();
                // Update context dynamically so mousedown sees the latest typed value
                if (activeContext) activeContext.search = currentSearch;
            });
        }

        if (watchedSpot) {
            // Anchor to div.editor.basic — stable grandparent that survives DOM rewrites.
            const editorRoot = target.closest('.editor.basic') ?? watchedSpot.parentElement;
            console.log('❤️ [Expression Analyzer] Phase 4.1 ✅ watchedSpot', watchedSpot);
            activeContext = { spot: watchedSpot, composerRoot: editorRoot, lho, search: currentSearch };
        } else {
            console.log('❤️ [Expression Analyzer] Phase 4.1 ❌ no watchedSpot found');
        }
    }


    /**
     * Given the opened .dropdown-container, walk backwards through the composer DOM
     * to find the immediately preceding meaningful spot (the Left-Hand Operand).
     *
     * With pe_labs=true the structure has an extra nesting level:
     *   .editor.basic > .composer > .nested > .nested > .nested > [spots]
     *                                               └─ .spot (outer Add) ← opened
     * The outer Add's siblings at its parent level may be .nested containers
     * rather than .spot elements, so we walk backwards through ALL direct children
     * and dig into .nested siblings when needed.
     */
    function getLHO(openedContainer) {
        const currentSpot = openedContainer.closest('.spot');
        if (!currentSpot) return { error: 'No parent .spot found' };

        const openedDepth = currentSpot.dataset.depth; // e.g. "0", "1", or undefined
        const composerRoot = currentSpot.parentElement;
        const allChildren = Array.from(composerRoot.children);
        const currentIndex = allChildren.indexOf(currentSpot);

        for (let i = currentIndex - 1; i >= 0; i--) {
            const child = allChildren[i];

            // ── Case 1: a direct .spot sibling at the same level ─────────────
            if (child.classList.contains('spot')) {
                if (child.classList.contains('parens')) continue;
                const caption = child.querySelector('.dropdown-caption');
                if (caption && caption.classList.contains('add-button')) continue;

                return makeSpotResult(child);
            }

            // ── Case 2: a .nested container (pe_labs outer-Add case) ─────────
            // Dig in and find the last real spot at the same depth as the opened spot.
            if (child.classList.contains('nested')) {
                const innerSpots = Array.from(child.querySelectorAll('.spot'));

                // Walk from last to first, matching depth when available
                for (let j = innerSpots.length - 1; j >= 0; j--) {
                    const s = innerSpots[j];
                    if (s.classList.contains('parens')) continue;
                    const caption = s.querySelector('.dropdown-caption');
                    if (caption && caption.classList.contains('add-button')) continue;
                    if (!s.dataset.operatorName && !s.dataset.datasourceName) continue;

                    // Prefer matching depth; only skip if a depth IS specified and DOESN'T match
                    if (openedDepth !== undefined && s.dataset.depth !== undefined
                        && s.dataset.depth !== openedDepth) continue;

                    return makeSpotResult(s);
                }
            }
        }

        return { error: 'No LHO spot found before opened dropdown' };
    }

    /** Build a consistent result object from a spot element. */
    function makeSpotResult(spot) {
        const caption = spot.querySelector('.dropdown-caption');
        return {
            operatorKey: spot.dataset.operatorName || null,
            datasourceKey: spot.dataset.datasourceName || null,
            captionText: caption ? caption.textContent.trim() : '(no caption)',
            depth: spot.dataset.depth ?? null,
        };
    }


// Store the active dropdown observer so we can cleanly disconnect it
    let activeDropdownObserver = null;

    // ─── Phase 5: Dropdown Highlighting ───────────────────────────────────────────────
    function highlightDropdownItems(wrapper, lho) {
        const key = lhoKey(lho);
        if (!key) {
            console.log('❤️ [Expression Analyzer] Phase 5 ℹ️ Skipped: no LHO key');
            return;
        }
        const graph = loadGraph();
        const entry = graph[key];
        if (!entry) {
            console.log(`❤️ [Expression Analyzer] Phase 5 ℹ️ Skipped: no graph entry for ${key}`);
            return;
        }

        // Apply highlights once immediately
        applyHighlights(wrapper, entry, graph);

        // If Bubble destroys the inner listbox entirely and remakes it, watching the listbox
        // causes our observer to watch an orphaned, disconnected node.
        // Instead, we observe the persistent wrapper (.dropdown-container).
        if (activeDropdownObserver) {
            activeDropdownObserver.disconnect();
        }

        activeDropdownObserver = new MutationObserver(() => {
            // Need to reload graph so highlights update with new clicks without full reopen
            applyHighlights(wrapper, entry, loadGraph());
        });

        activeDropdownObserver.observe(wrapper, {
            childList: true,
            subtree: true
        });

    }

    function getOptionLevel(option, graph, visited = new Set()) {
        const isClicked = option.clicked || option.operatorKey || option.datasourceKey;
        if (!isClicked) return 0;
        
        if (!option.operatorKey && !option.datasourceKey) return 4;
        
        const targetKey = lhoKey({ operatorKey: option.operatorKey, datasourceKey: option.datasourceKey });
        if (!targetKey) return 4;
        
        if (!graph[targetKey] || !graph[targetKey].options) return 1;
        
        if (visited.has(targetKey)) return 4;
        visited.add(targetKey);
        
        const childrenKeys = Object.keys(graph[targetKey].options);
        if (childrenKeys.length === 0) {
            visited.delete(targetKey);
            return 4;
        }
        
        let minChildLevel = 4;
        for (const childLabel of childrenKeys) {
            const childOption = graph[targetKey].options[childLabel];
            const childLevel = getOptionLevel(childOption, graph, visited);
            if (childLevel < minChildLevel) {
                minChildLevel = childLevel;
            }
            if (minChildLevel === 0) break;
        }
        
        visited.delete(targetKey);
        return Math.min(4, minChildLevel + 1);
    }

    function applyHighlights(wrapper, entry, graph) {
        const containers = wrapper.querySelectorAll('.dropdown-item-container');
        
        let levelCounts = {0:0, 1:0, 2:0, 3:0, 4:0};

        containers.forEach(container => {
            if (container.dataset.clEaLevel !== undefined) {
                return;
            }

            const labelEl = container.querySelector('.dropdown-item');
            const label = labelEl?.firstChild?.textContent?.trim() ?? container.textContent.trim();

            const optionData = entry.options[label];
            let level = 0;
            if (optionData) {
                level = getOptionLevel(optionData, graph);
            }
            container.dataset.clEaLevel = level;
            levelCounts[level]++;
        });
        
        const nonZero = levelCounts[1] + levelCounts[2] + levelCounts[3] + levelCounts[4];
        if (nonZero > 0 || levelCounts[0] > 0) {
            console.log(`❤️ [Expression Analyzer] Phase 5 ✅ Highlighted: L0:${levelCounts[0]} L1:${levelCounts[1]} L2:${levelCounts[2]} L3:${levelCounts[3]} L4:${levelCounts[4]}`);
        }
    }

    // ─── LocalStorage engine ─────────────────────────────────────────────────────
    const STORE_KEY = 'CL_ExpressionGraph';

    function lhoKey(lho) {
        if (!lho || lho.error) return null;
        let base = null;
        if (lho.operatorKey)   base = `op:${lho.operatorKey}`;
        else if (lho.datasourceKey) base = `ds:${lho.datasourceKey}`;
        
        if (!base) return null;

        // Pattern Normalization: Strip specific type IDs for generalization
        // (e.g. current_order_custom_12345x67890 -> current_order_custom_*)
        if (base.includes('_custom_')) {
            lho.isCustomField = true;
            lho.normalizedPattern = base.replace(/_custom_.*$/, '_custom_*');
            lho.isList = base.includes('_list_custom_');
        }

        return base;
    }
    function loadGraph() {
        try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
        catch { return {}; }
    }
    function saveGraph(g) { localStorage.setItem(STORE_KEY, JSON.stringify(g)); }

    /** Phase 2.5 — persist scraped labels immediately at dropdown-open time. */
    function recordAvailableOptions(lho, scraped) {
        const key = lhoKey(lho);
        if (!key) return;
        const graph = loadGraph();
        if (!graph[key]) graph[key] = { lho, options: {} };
        
        // Update return category if we have a better guess now
        if (lho.returnCategory && lho.returnCategory !== 'Unknown') {
            graph[key].lho.returnCategory = lho.returnCategory;
        }

        for (const { label, disabled } of scraped) {
            if (!graph[key].options[label]) {
                graph[key].options[label] = { label, operatorKey: null, datasourceKey: null, disabled };
            }
        }
        saveGraph(graph);
        console.log(`❤️ [Expression Analyzer] Phase 2.5 ✅ [${key}] — ${scraped.length} options recorded`);
    }
                                                        
    /** Phase 4.5 — enrich a label with its internal operator/datasource key after a click. */
    function recordSelectedKey(lho, uiLabel, operatorKey, datasourceKey, isLeaf = false, searchAlias = '') {
        const key = lhoKey(lho);
        if (!key) return;
        const graph = loadGraph();
        if (!graph[key]) graph[key] = { lho, options: {} };
        const existing = graph[key].options[uiLabel] || {};
        
        // Only update searchAlias if we actually had one and it's longer than what we have
        const currentAliases = existing.searchAliases || [];
        if (searchAlias && !currentAliases.includes(searchAlias)) {
            currentAliases.push(searchAlias);
        }

        graph[key].options[uiLabel] = {
            label: uiLabel,
            operatorKey:   operatorKey   || existing.operatorKey   || null,
            datasourceKey: datasourceKey || existing.datasourceKey || null,
            disabled: existing.disabled || false,
            clicked: true,
            isLeaf: isLeaf,
            searchAliases: currentAliases
        };
        saveGraph(graph);
        console.log(`❤️ [Expression Analyzer] Phase 4.5 ✅ [${key}] "${uiLabel}" → op:${operatorKey} ds:${datasourceKey} isLeaf:${isLeaf} (alias: ${searchAlias})`);
    }

    // ─── Phase 4: Single delegated mousedown listener ────────────────────────────
    let activeContext = null;

    document.addEventListener('mousedown', (e) => {
        if (!activeContext) return;
        const item = e.target.closest('.dropdown-item-container');
        if (!item) return;

        // Note: we do NOT check item.closest('.composer') here.
        // The .dropdown-items-positioner is absolutely positioned and may sit
        // OUTSIDE the .composer in the DOM tree. We trust activeContext as the guard.

        // Capture label immediately (before Bubble's DOM rewrite)
        const labelEl = item.querySelector('.dropdown-item');
        const uiLabel = labelEl?.firstChild?.textContent?.trim() ?? item.textContent.trim();

        console.log('❤️ [Expression Analyzer] Phase 4.4 ✅ mousedown on item:', uiLabel);

        // Destructure activeContext and immediately clear to avoid re-entry.
        const { composerRoot, lho, search } = activeContext;
        activeContext = null;

        // ── Phase 4.5: Snapshot-diff approach ────────────────────────────────────
        // Problem with MutationObserver: Bubble rewrites the entire .editor.basic DOM
        // after every selection, causing pre-existing spots (e.g. 'PageData') to fire
        // attribute mutations BEFORE the newly-selected spot gets its attribute.
        //
        // Solution: snapshot all (operatorName|datasourceName) occurrence counts
        // BEFORE the click takes effect, then after 300ms diff the counts. Any key
        // whose count INCREASED is the one that was just selected.
        function countSpotKeys(root) {
            const counts = new Map();
            root.querySelectorAll('.spot').forEach(spot => {
                const op = spot.dataset.operatorName  || '';
                const ds = spot.dataset.datasourceName || '';
                if (op || ds) {
                    const k = `${op}|${ds}`;
                    counts.set(k, (counts.get(k) || 0) + 1);
                }
            });
            return counts;
        }

        const before = countSpotKeys(composerRoot);

        setTimeout(() => {
            const after = countSpotKeys(composerRoot);
            for (const [key, afterCount] of after) {
                const beforeCount = before.get(key) || 0;
                if (afterCount > beforeCount) {
                    const [opKey, dsKey] = key.split('|');
                    recordSelectedKey(lho, uiLabel, opKey || null, dsKey || null, false, search);
                    return;
                }
            }
            console.log('❤️ [Expression Analyzer] Phase 4.5 ℹ️ No new spot key found 300ms after click (likely a literal value). Before:', before, 'After:', after);
            recordSelectedKey(lho, uiLabel, null, null, true, search);
        }, 300);

    }, true /* capture phase */);

    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });
    console.log("❤️ [Expression Analyzer] Phase 2: Dropdown observer active.");

})();//👈👈 don't delete this, and don't put anything outside of this!!
