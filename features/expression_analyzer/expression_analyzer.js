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
    function injectAnalysisIcon(expressionElement) {
        // TODO: Create and style the icon element
        const icon = document.createElement('span');
        icon.innerText = '🔍'; // Placeholder icon
        icon.style.cursor = 'pointer';
        icon.style.marginLeft = '4px';
        icon.title = 'Analyze Expression';

        icon.addEventListener('click', function(event) {
            event.stopPropagation();
            console.log("Analysis icon clicked for expression:", expressionElement.innerText);

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
                    console.error("Failed to get expression data.", response ? response.error : "No response");
                }
            });
        });

        // TODO: Append the icon to the correct location within/after the expression element
        expressionElement.appendChild(icon);
    }

    function initializeObserver() {
        // TODO: Implement a MutationObserver to watch for expression elements being added to the DOM.
        // On detection, call injectAnalysisIcon(newElement).
        console.log("Initializing MutationObserver for Expression Analyzer...");
    }

    // Initialize the feature
    initializeObserver();

})();//👈👈 don't delete this, and don't put anything outside of this!!
