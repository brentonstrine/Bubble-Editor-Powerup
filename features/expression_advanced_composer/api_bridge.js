console.log("💙❤️ Initialized api_bridge.js in main world!");

window.EXPRESSION_POWERUP = {
  readExpression: function (nodeId, propertyName) {
    // Placeholder
  },
  writeExpression: function (nodeId, propertyName, newJson) {
    // Placeholder
  }
};

let lastIdentifiedElementPath = null;
let lastIdentifiedPropName = null;

window.addEventListener('message', function (event) {
  if (event.source !== window || !event.data) return;

  if (event.data.type === 'CL_ADVANCED_COMPOSER_IDENTIFY') {
    console.log("💙❤️ API Bridge received identification request!", event.data);
    const propName = event.data.propName;
    lastIdentifiedPropName = propName;

    try {
      // 1. Find the currently selected element in the DOM (assuming it's a visual element for now)
      const visualElement = document.querySelector(".element.selected > .inner-element");

      if (!visualElement) {
        console.warn("💙❤️ No .element.selected found! We might be in a workflow or api workflow.");
        return;
      }

      const elementId = visualElement.id;
      console.log("💙❤️ Visual string ID from DOM:", elementId);

      // 2. Look up the element's path in Bubble's JSON index
      const indexNode = window.appquery().app().json.child('_index').child('id_to_path').raw();
      const elementPath = indexNode[elementId];

      if (!elementPath) {
        console.warn("💙❤️ Element ID not found in id_to_path index!");
        return;
      }

      // 3. Get the node for the element
      lastIdentifiedElementPath = elementPath;
      const elementNode = window.appquery().app().json.by_path(elementPath);
      console.log("💙❤️ Element Info:", { id: elementId, path: elementPath });

      // 4. Drill down into the specific property node
      if (propName && elementNode.exists()) {
        let activePropNode = null;

        if (propName === "condition") {
          console.log("💙❤️ We are targeting a conditional. Getting React Props to find the exact condition ID...");
          // Ask the main script for the raw React props of the element to trace the ID
          window.postMessage({ type: 'CL_ADVANCED_COMPOSER_FETCH_REACT_PROPS' }, '*');

          // Dynamic lookup for the conditions container (handles compressed %s or states)
          const conditionsNode = elementNode.child('%s').exists() ? elementNode.child('%s') : elementNode.child('states');

          if (conditionsNode.exists()) {
            let conditionIds = conditionsNode.child_names();
            if (conditionIds.length > 0) {
              // Bubble keys are often "0", "2", "3". Sort them numerically.
              conditionIds.sort((a,b) => parseInt(a) - parseInt(b));
              
              // FILTER OUT ZOMBIE STATES
              // Bubble retains deleted states in the JSON hash (e.g. index 0 and 1 might be empty or missing %c).
              // Since the visual UI only renders valid conditions, we must filter out zombies to align conditionDOMIndex.
              conditionIds = conditionIds.filter(id => {
                 const st = conditionsNode.child(id);
                 if (!st.exists()) return false;
                 
                 const rawState = st.raw() || {};
                 return rawState.hasOwnProperty('%c') || rawState.hasOwnProperty('condition');
              });

              const targetIndex = event.data.conditionDOMIndex || 0;
              const bestId = conditionIds[targetIndex] || conditionIds[0];
              console.log(`💙❤️ Mapping visual DOM block [${targetIndex}] to valid condition ID: ${bestId}`);
              
              if (bestId !== undefined) {
                const stateNode = conditionsNode.child(bestId);
                const rawState = stateNode.raw() || {};
                const hasCompressedC = rawState.hasOwnProperty('%c');
                
                activePropNode = hasCompressedC ? stateNode.child('%c') : stateNode.child('condition');

                const containerName = elementNode.child('%s').exists() ? '%s' : 'states';
                const propKey = hasCompressedC ? '%c' : 'condition';
                lastIdentifiedPropName = `${containerName}.${bestId}.${propKey}`;
                console.log(`💙❤️ Target Path resolved successfully: ${lastIdentifiedPropName}`);
              } else {
                console.warn(`💙❤️ Failed to map condition at index ${targetIndex}. No valid states found.`);
              }
            }
          }
        } else {
          const propertiesNode = elementNode.child('%p');
          if (propertiesNode.exists()) {
            activePropNode = propertiesNode.child(propName);
          } else {
            // Fallback just in case some elements are uncompressed
            activePropNode = elementNode.child('properties').child(propName);
          }
        }

        // Let's force a dump of the raw element JSON so we can physically see where conditions are hiding
        console.log("💙❤️ [DIAGNOSTIC] Full Element JSON (Load):", JSON.stringify(elementNode.raw(), null, 2));

        // -----------------------------------------------------
        // DYNAMIC ELEMENT EXTRACTION (DATA SOURCES)
        // -----------------------------------------------------
        let availableElements = [];
        try {
          console.log("💙❤️ [EXTRACTION] Starting Element Extraction...");

          // 1. Find the true root of this context (Page or Reusable)
          let rootNode = elementNode;
          let rootPath = lastIdentifiedElementPath;

          // Safety climb: Go up until we find a Page or CustomDefinition
          let pathParts = lastIdentifiedElementPath.split('.');
          for (let i = pathParts.length; i >= 1; i--) {
            let p = pathParts.slice(0, i).join('.');
            let n = window.appquery().app().json.by_path(p);
            if (n && n.exists()) {
              const type = n.cache['%x'] || n.cache['type'];
              if (type === 'Page' || type === 'CustomDefinition') {
                rootNode = n;
                rootPath = p;
                break;
              }
            }
          }

          console.log("💙❤️ [EXTRACTION] Resolved Context Root:", { path: rootPath, type: rootNode.cache['%x'] });

          if (rootNode && rootNode.exists()) {
            const discovered = new Set();

            function traverse(node, prefix = "", isLast = true, depth = 0) {
              if (!node || !node.exists()) return;
              const cache = node.cache;
              if (!cache) return;

              const childId = cache['id'];
              if (childId && !discovered.has(childId)) {
                discovered.add(childId);

                const type = cache['%x'] || cache['type'];
                let customName = cache['%nm']; // Custom user-defined name
                let defaultName = cache['%dn'] || cache['default_name']; // Bubble default name
                
                // Smart fallbacks based on inner properties
                let secondaryName = null;
                const props = cache['%p'] || cache['properties'] || {};
                
              if (type === 'Text') {
                  const t = props['%3'] || props['text'] || props['text_for_display'] || props['content'];
                  let rawText = "";
                  if (typeof t === 'string') rawText = t;
                  else {
                    const entries = t?.['%e'] || t?.entries || t;
                    if (entries && typeof entries === 'object') {
                      rawText = Object.values(entries).filter(v => typeof v === 'string').join(" ");
                    }
                  }
                  if (rawText.trim()) secondaryName = "Text " + (rawText.trim().length > 25 ? rawText.trim().substring(0, 25) + "..." : rawText.trim()).replace(/\s+/g, ' ');
              } else if (type === 'Icon' || type === 'MaterialIcon') {
                  const ico = props['%9i'] || props['icon'] || props['material_icon'] || props['icon_name'];
                  if (typeof ico === 'string') {
                      secondaryName = "Icon " + ico.replace(/^fa fa-/, '');
                  }
              } else if (type === 'Button') {
                  const label = props['%cap'] || props['caption'] || props['text'];
                  if (typeof label === 'string') secondaryName = "Button " + label;
              } else if (type?.includes('Input')) {
                  const placeholder = props['placeholder'] || props['initial_value'];
                  if (typeof placeholder === 'string') secondaryName = type + " (" + placeholder + ")";
              } else if (['Group', 'RepeatingGroup', 'Popup', 'FloatingGroup'].includes(type)) {
                  let subtype = props['%gt'] || props['group_type'] || props['type_of_thing'] || props['content_type'] || props['type'];
                  if (typeof subtype === 'string' && !subtype.includes('_default_')) {
                      if (subtype === 'boolean') subtype = 'yes/no';
                      if (subtype.startsWith('custom.')) {
                          subtype = subtype.replace('custom.', '');
                          subtype = subtype.charAt(0).toUpperCase() + subtype.slice(1);
                      }
                      secondaryName = type + " [" + subtype + "]";
                  }
              } else if (type === 'CustomDefinition') {
                    secondaryName = "Reusable: " + (cache['__name'] || "Element");
                }

                let displayName = customName || secondaryName || defaultName || type;
                // Final fallback if everything is empty or generic
                if (displayName === type && cache['_id']) displayName += " " + cache['_id'];

                // Strictly traverse element containers to maintain "Order of Appearance"
                let elNode = node.child('%el');
                if (!elNode || !elNode.exists()) elNode = node.child('elements');
                const hasChildren = elNode && elNode.exists() && elNode.child_names().length > 0;

                // Tree visual build: Depth 0 (Page/RU) gets no prefix
                let treeLine = "";
                if (depth > 0) {
                  let branch = isLast ? "└" : "├";
                  let connector = hasChildren ? "┬" : "─";
                  treeLine = prefix + branch + connector;
                }

                availableElements.push({
                  label: treeLine + " " + displayName,
                  treeGlyph: treeLine,
                  rawLabel: displayName,
                  val: {
                    type: 'GetElement',
                    elementType: type,   // e.g. 'Group', 'RepeatingGroup', 'Input', 'Checkbox'
                    contentType: (() => { // e.g. 'custom.user', 'text', null
                      const p = cache['%p'] || cache['properties'] || {};
                      return p['%gt'] || p['group_type'] || p['type_of_thing'] || p['content_type'] || null;
                    })(),
                    properties: { element_id: childId }
                  }
                });

                // Prepare the prefix for child levels
                let childPrefix = prefix;
                if (depth > 0) {
                  childPrefix += isLast ? " " : "│";
                }

                if (hasChildren) {
                  const childKeys = elNode.child_names();
                  childKeys.forEach((key, index) => {
                    const child = elNode.child(key);
                    const isLastChild = (index === childKeys.length - 1);
                    traverse(child, childPrefix, isLastChild, depth + 1);
                  });
                }
              }
            }

            // Start traversal (depth 0, last item of the universe)
            traverse(rootNode, "", true, 0);

            console.log(`💙❤️ [EXTRACTION] Completed! Total elements: ${availableElements.length}`);
          } else {
            console.warn("💙❤️ [EXTRACTION] Failed to locate Context Root Node.");
          }
        } catch (extractionErr) {
          console.error("💙❤️ [EXTRACTION ERROR]:", extractionErr);
        }
        // -----------------------------------------------------
        let rawJson = null;
        if (activePropNode && activePropNode.exists()) {
          rawJson = activePropNode.raw();
          console.log(`💙❤️ Successfully grabbed raw content for ${propName}!`, rawJson);
        } else {
          console.log(`💙❤️ Target node for '${propName}' is empty or doesn't exist. Creating a blank shell...`);
          // Synthesize a blank starting point based on the property name
          if (propName === 'text' || propName === 'expression') {
            rawJson = {
              type: "TextExpression",
              entries: { "0": "" }
            };
          } else if (propName === 'condition') {
            rawJson = {
              type: "CurrentPageItem" // Safe default for dynamic conditions
            };
          } else {
            // General default for other fields like data_source
            rawJson = null;
          }
        }

        // Let the popup script know the data is ready
        window.postMessage({
          type: 'CL_ADVANCED_COMPOSER_DATA_READY',
          expressionJson: rawJson,
          availableElements: availableElements
        }, '*');
      }

    } catch (e) {
      console.error("💙❤️ API Bridge Identification Error:", e);
    }
  } else if (event.data.type === 'CL_ADVANCED_COMPOSER_SAVE') {
    const payload = event.data.payload;
    console.log("💙❤️ API Bridge received SAVE request!", payload);

    if (!lastIdentifiedElementPath || !lastIdentifiedPropName) {
      console.error("💙❤️ Cannot save! No active element/property identified.");
      return;
    }

    try {
      const elementNode = window.appquery().app().json.by_path(lastIdentifiedElementPath);
      if (!elementNode.exists()) {
        console.error("💙❤️ Element node not found at path:", lastIdentifiedElementPath);
        return;
      }

      // Write directly to the specific property sub-node with the required metadata.
      // Metadata is what triggers Bubble's reactive change propagation — it must be present.
      // Writing the full element back risks tripping Bubble's update pipeline on complex elements.
      const metadata = { intent: { name: 'Bubble Editor Powerup from Codeless Love' } };

      let propNode;
      if (lastIdentifiedPropName.startsWith('states.')) {
        const parts = lastIdentifiedPropName.split('.');
        propNode = elementNode.child(parts[0]).child(parts[1]).child(parts[2]);
      } else {
        propNode = elementNode.child('properties').child(lastIdentifiedPropName);
      }

      // DIAGNOSTIC: Pre-save state
      console.log("💙❤️ [DIAGNOSTIC] Full Element JSON (Pre-Save):", JSON.stringify(elementNode.raw(), null, 2));

      console.log(`💙❤️ Writing to Bubble node: ${lastIdentifiedElementPath}/properties/${lastIdentifiedPropName}`);
      console.log("💙❤️ [DIAGNOSTIC] Payload being written:", JSON.stringify(payload, null, 2));
      propNode.set(payload, metadata);

      // DIAGNOSTIC: Post-save state (read back from node)
      console.log("💙❤️ [DIAGNOSTIC] Full Element JSON (Post-Save):", JSON.stringify(elementNode.raw(), null, 2));

      console.log("💙❤️ Write-back successful!");
    } catch (e) {
      console.error("💙❤️ API Bridge Save Error:", e);
    }
  }

});