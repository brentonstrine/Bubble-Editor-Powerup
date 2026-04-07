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

  // Currently we need to identify what Bubble object is being edited, and what property.
  // We will need to piece this together based on the DOM state.
  // For now, let's output that we hit the bridge correctly.
  
  // Try to find selected element if it is a visual element
  const visualElement = document.querySelector(".element.selected > .inner-element");
  if (visualElement) {
    console.log("💙❤️ Visual element ID:", visualElement.id);
    try {
      const nodePathList = window.appquery().app().json.child('_index').child('id_to_path').raw();
      console.log("💙❤️ Element node path:", nodePathList[visualElement.id]);
    } catch(e) {
      console.warn("💙❤️ Could not read appquery", e);
    }
  }

});