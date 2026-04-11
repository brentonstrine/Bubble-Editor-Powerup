console.log("💙❤️ Initialized api_bridge.js in main world!");

window.EXPRESSION_POWERUP = {
  readExpression: function(nodeId, propertyName) {
    // Placeholder
  },
  writeExpression: function(nodeId, propertyName, newJson) {
    // Placeholder
  }
};

let lastIdentifiedElementPath = null;
let lastIdentifiedPropName = null;

window.addEventListener('message', function(event) {
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
        
        // As a fallback for right now, let's just grab the FIRST condition on the element
        const conditionsNode = elementNode.child('states');
        if (conditionsNode.exists()) {
          const conditionIds = conditionsNode.child_names();
          if (conditionIds.length > 0) {
            console.log(`💙❤️ Fallback: Using condition ID: ${conditionIds[0]}`);
            activePropNode = conditionsNode.child(conditionIds[0]).child('condition');
            lastIdentifiedPropName = 'states.' + conditionIds[0] + '.condition'; // Store full path for saving
          }
        }
      } else {
        const propertiesNode = elementNode.child('properties');
        if (propertiesNode.exists()) {
          activePropNode = propertiesNode.child(propName);
        }
      }

      // Let's force a dump of the raw element JSON so we can physically see where conditions are hiding
      console.log("💙❤️ [DIAGNOSTIC] Full Element JSON (Load):", JSON.stringify(elementNode.raw(), null, 2));

      if (activePropNode && activePropNode.exists()) {
        const rawJson = activePropNode.raw();
        
        // Let the popup script know the data is ready
        window.postMessage({
          type: 'CL_ADVANCED_COMPOSER_DATA_READY',
          expressionJson: rawJson
        }, '*');
      } else {
        console.warn(`💙❤️ Target node for '${propName}' not found or doesn't exist!`);
      }
    }

  } catch(e) {
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