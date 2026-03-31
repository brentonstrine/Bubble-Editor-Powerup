# Feature Spec: Expression Analysis

## 1. Objective

To provide Bubble developers with a tool that can deconstruct and visualize complex dynamic expressions, making them easier to read, debug, and understand. This feature will reduce development time and errors by clarifying how data sources are constructed.

## 2. User Story

As a Bubble developer, I want to be able to quickly analyze any complex expression. I want to right-click a dynamic expression in the property editor to see it broken down in a tool that will show me a clear, hierarchical view. This will allow me to quickly understand its logic, verify its correctness, and troubleshoot any issues without having to read a long, single-line expression string.

## 3. Functional Requirements

*   **Activation:**
    *   The feature will be triggered via a new option in the right-click context menu labeled "Analyze Expression" when a user right-clicks on a property input field containing a dynamic Bubble expression.

*   **UI - Popup Modal:**
    *   Upon activation, a modal window will appear, overlaying the Bubble editor.
    *   The modal will have a clear title, such as "Expression Analysis".
    *   It will contain a text input area for pasting expressions. If triggered via the context menu, this area will be pre-populated with the selected expression.
    *   It will contain a pre-formatted block to display the structured expression.

*   **Expression Display Logic:**
    *   The core feature of the modal is to display the expression in a tree-like structure.
    *   Each component of the expression (e.g., `Do a search for...`, a field name, a modifier like `:first item`) will be rendered on its own line.
    *   Nested parts of the expression will be indented to visually represent their relationship to the parent component.

### Example Display

An expression like `Do a search for Invoices:filtered(Status = "unpaid"):first item's Amount Due` would be displayed as:

```
Do a search for Invoices
    :filtered
        (Status = "unpaid")
    :first item
        's Amount Due
```

## 4. Technical Implementation Outline

1.  **Context Menu Injection:** Add a script that injects the "Analyze Expression" option into the context menu for relevant input fields in the editor.
2.  **Data Retrieval:** On activation, the script must identify the underlying Bubble element and the specific property containing the expression string. It will use the `window.appquery()` API to read this data.
3.  **Parsing Engine:** Develop a core JavaScript function that takes the raw expression string as input. This function will be responsible for splitting the string by Bubble's various delimiters (`'s`, `:`, etc.) and interpreting the structure.
4.  **Structured Output:** The parser will convert the string into a structured data format, such as an array of objects, where each object contains the text for a line and its indentation level (e.g., `{ text: "Do a search for Invoices", depth: 0 }`).
5.  **Rendering:** A simple UI component will take the structured data from the parser and render it into the final, indented HTML view.
