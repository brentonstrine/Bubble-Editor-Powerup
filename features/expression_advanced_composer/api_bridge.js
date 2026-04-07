console.log("💙❤️ Initialized api_bridge.js in main world!");

window.EXPRESSION_POWERUP = {
  readExpression: function(nodeId, propertyName) {
    // Placeholder
  },
  writeExpression: function(nodeId, propertyName, newJson) {
    // Placeholder
  }
};

window.addEventListener('message', function(event) {
  if (event.source !== window || !event.data || event.data.type !== 'CL_ADVANCED_COMPOSER_IDENTIFY') {
    return;
  }

  console.log("💙❤️ API Bridge received identification request!", event.data);
  const targetClasses = event.data.targetClasses || [];
  const propName = event.data.propName;

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

    // 3. Get the raw JSON for the element
    const elementNode = window.appquery().app().json.by_path(elementPath);
    const elementJson = elementNode.raw();
    console.log("💙❤️ Full Element JSON:", elementJson);

    // 4. Drill down into the specific property
    if (propName && elementJson.properties) {
      const expressionJson = elementJson.properties[propName];
      if (expressionJson) {
        console.log(`💙❤️ Specific Expression JSON for property '${propName}':`, expressionJson);
      } else {
        console.warn(`💙❤️ Property '${propName}' not found in element's properties!`);
      }
    }

  } catch(e) {
    console.error("💙❤️ API Bridge Error:", e);
  }

});