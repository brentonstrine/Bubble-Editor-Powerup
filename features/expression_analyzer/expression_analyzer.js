window.loadedCodelessLoveScripts ||= {};
(function() {
    console.log("❤️"+"Expression Analyzer");
    const thisScriptKey = "expression_analyzer";

    /* ------------------------------------------------ */
    /* ⬇️ ⬇️ ⬇️ ⬇️ ⬇️ Don't mess with this  ⬇️ ⬇️ ⬇️ ⬇️ ⬇️ */
    /* ------------------------------------------------ */
    if (window.loadedCodelessLoveScripts[thisScriptKey] == "loaded") {
        console.warn("❤️" + thisScriptKey + " tried to load, but it's value is already " + window.loadedCodelessLoveScripts[thisScriptKey]);
        return;
    }
    window.loadedCodelessLoveScripts[thisScriptKey] = "loaded";
    /* ------------------------------------------------ */
    /* ⬆️ ⬆️ ⬆️ ⬆️ ⬆️ Don't mess with this  ⬆️ ⬆️ ⬆️ ⬆️ ⬆️ */
    /* ------------------------------------------------ */

    // All code for this feature will run in the ISOLATED world.
    // The only exception is the data retrieval function, which will be sent to the
    // background script to be executed in the MAIN world.
    console.log("❤️ Expression Analyzer Loaded");

    // --- Phase 1: UI Scaffolding (Placeholder) ---
    const modalUI = {
        injectModal: function() {
            console.log("Injecting modal UI...");
            // TODO: Create and inject DOM elements for the modal.
        },
        show: function(expression) {
            console.log("Showing modal for expression:", expression);
            // TODO: Make modal visible and pre-populate with the expression.
            // TODO: Trigger initial parsing and rendering.
        }
    };

    // --- Phase 2: Core Logic (Placeholder) ---
    function parseExpression(expression) {
        console.log("Parsing expression:", expression);
        // TODO: Implement parsing logic.
        return [{ text: expression, depth: 0 }]; // Placeholder return
    }

    // --- Phase 3: Rendering (Placeholder) ---
    function renderOutput(parsedData) {
        console.log("Rendering output:", parsedData);
        // TODO: Clear previous output and render new indented lines.
    }

    // --- Phase 4: Editor Integration ---
    function addContextMenu() {
        // This function adds the "Analyze Expression" option to the context menu.
        // For now, we will just listen for right-clicks on the whole document.
        // We can refine the selector later to target specific input fields.
        document.addEventListener('contextmenu', function(event) {
            // A more specific selector will be needed, e.g., 'input.dynamic-expression-input'
            const target = event.target;
            const isExpressionInput = target.matches('input, textarea'); // Example selector

            if (isExpressionInput) {
                console.log("Right-clicked on a potential expression input:", target);
                // In a real implementation, we would add a custom context menu item.
                // For simplicity in this stage, we'll use a confirm dialog to simulate the flow.
                if (confirm("Analyze Expression? (Simulation)")) {
                    // 1. Get identifiers from the DOM
                    const elementId = "some_element_id"; // TODO: Get this from the DOM
                    const propertyKey = "data_source"; // TODO: Get this from a data-* attribute

                    // 2. Send message to background script to retrieve data from the MAIN world
                    chrome.runtime.sendMessage({
                        action: "getExpressionData", // A new action for background.js
                        elementId: elementId,
                        propertyKey: propertyKey
                    }, function(response) {
                        if (response && response.expression) {
                            // 5. UI Activation
                            modalUI.show(response.expression);
                        } else {
                            console.error("Failed to get expression data.", response.error);
                        }
                    });
                }
            }
        }, true); // Use capture phase to ensure we get the event.
    }

    // Initialize the feature
    addContextMenu();

})();//👈👈 don't delete this, and don't put anything outside of this!!
