# Implementation Plan: Expression Analysis

## 1. Overview

This document outlines the technical implementation plan for the **Expression Analysis** feature, as defined in `features/expression_analyzer/expression_analyzer_spec_context.md`. The plan leverages the capabilities of the internal Bubble Editor JSON API, documented in `context/context-reading and modifying underlying JSON in the Bubble editor.md`, to achieve the desired functionality.

The implementation will be broken into four distinct phases to de-risk the project, focusing first on core, standalone functionality before tackling the more complex and fragile integration with the Bubble editor's live environment.

## 2. Key Technologies & APIs

*   **UI:** HTML, CSS, & Vanilla JavaScript
*   **Bubble Editor Interaction:** `window.appquery()` API
*   **Core Logic:** Plain JavaScript for the parsing engine.
*   **Browser APIs:** DOM manipulation and `contextmenu` event listeners.

## 3. Phased Implementation Plan

### Phase 1: UI Scaffolding (The Popup Modal)

The first step is to create a set of functions within `expression_analyzer.js` that programmatically create, inject, and manage the modal UI within the host page's DOM.

*   **Execution Context:** **Isolated World** (Content Script)
*   **Task:** Create a `modalUI` object within `expression_analyzer.js`.
*   **Object Responsibilities:**
    *   **DOM Injection:** A function, e.g., `injectModal()`, will create all necessary DOM elements (the overlay, modal container, header, textarea, etc.) using `document.createElement`. It will append these to the `document.body` of the Bubble editor.
    *   **CSS Injection:** The `injectModal` function will also create a `<style>` tag, populate it with the modal's CSS as a string, and append it to the document's `<head>`. This ensures the UI is properly styled without external file dependencies on the page.
    *   **Behavior:** The object will handle its own internal state (e.g., visibility) and attach event listeners (e.g., a click handler for the close button).
    *   **UI Elements:**
        *   A main container `div` styled as a modal overlay (fixed position, high z-index).
        *   A header with the title "Expression Analysis" and a close button.
        *   A `<textarea>` element for users to paste expressions into.
        *   A designated `<pre>` or `<div>` area where the formatted output will be rendered.
*   **Acceptance Criteria:** A function call from the content script can successfully inject the modal's full DOM and CSS into the page, making it visible and interactive.

### Phase 2: Core Logic (The Parsing Engine)

This is the heart of the feature. The goal is to create a pure, testable function that can transform an expression string into a structured, hierarchical format. This phase has no dependency on the Bubble API.

*   **Execution Context:** **Isolated World** (Content Script)
*   **Task:** Create a utility function `parseExpression(expression)` inside `expression_analyzer.js`.
*   **Implementation Details:**
    *   The function will take a single string argument (the Bubble expression).
    *   It must tokenize the string based on Bubble's key delimiters: `:`, `'s`, `(`, and `)`. A regular expression that splits the string while retaining the delimiters will be the most effective approach.
    *   It will iterate through the tokens, managing a `depth` counter to track the current level of nesting.
        *   `:` and `'s` tokens will generally increase the depth for the following token.
        *   `(` will increase the depth.
        *   `)` will decrease the depth.
    *   The function will return an array of objects (e.g., `{text: "...", depth: 0}`), where each object represents a line in the output.
*   **Key Challenge:** The logic must correctly handle complex nested structures, such as a `:filtered` constraint that contains its own parenthesized expression. Thorough unit testing with various expression examples will be critical.
*   **Acceptance Criteria:** The `parseExpression` function correctly transforms a suite of test expressions (from simple to complex) into the specified structured array format.

### Phase 3: Rendering the Parsed Expression

This phase enhances the UI object from Phase 1, enabling it to render parsed data and handle user input.

*   **Execution Context:** **Isolated World** (Content Script)
*   **Task:** Integrate the `parseExpression` function with the `modalUI` object.
*   **Implementation Details:**
    *   The `modalUI` object will attach an `input` event listener to the `<textarea>` it creates.
    *   The event handler will:
        1.  Get the current text from the textarea.
        2.  Pass this string to the `parseExpression` function.
        3.  Call a rendering function within the object, e.g., `renderOutput(parsedData)`.
    *   The `renderOutput` function will clear the results area and loop through the parsed data, creating and appending new indented `<div>` elements for each line.
*   **Acceptance Criteria:** When the modal is visible, pasting a valid Bubble expression into the textarea causes the structured, indented visualization to appear correctly and update in real-time.

### Phase 4: Editor Integration (Context Menu & Data Retrieval)

This final phase orchestrates the entire feature, following the extension's established architecture for communication between the isolated content script and the main world.

*   **Task:** Implement the orchestration logic inside `expression_analyzer.js`.
*   **Implementation Details:**
    1.  **Context Menu (Isolated World):** The script will add a global `contextmenu` event listener. It will inspect the event target to determine if the user right-clicked on a valid property editor input.
    2.  **Data Request (Isolated World -> Background):** When "Analyze Expression" is clicked, the content script will send a message to `background.js`. This message will contain the necessary identifiers to locate the data (e.g., the selected element's ID and the property key from a `data-*` attribute).
    3.  **Data Retrieval (Main World):**
        *   The `background.js` script will have a listener for this message.
        *   Upon receipt, it will use `chrome.scripting.executeScript` to run a small, targeted function in the **main world** of the active tab.
        *   This main-world function will use the provided identifiers to access `window.appquery()` and retrieve the raw expression string. It will then return this string.
    4.  **Data Response (Background -> Isolated World):** The background script receives the expression string from the main world and sends it back to the content script in a response message.
    5.  **UI Activation (Isolated World):** The content script, upon receiving the expression string, will call the `modalUI` object's functions to inject and show the modal, pre-populating it with the retrieved data.
*   **Acceptance Criteria:** Right-clicking on a dynamic expression in the Bubble editor shows the "Analyze Expression" option. Clicking it opens the modal with the correct expression already parsed and displayed.