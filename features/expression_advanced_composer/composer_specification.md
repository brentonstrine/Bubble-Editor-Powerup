# Feature Specification: Advanced Expression Composer

This document outlines the high-level architectural choices for building a custom, type-aware expression composer for the Bubble editor.

---

## 🚀 High-Level Architectural Choices

### 1. The Interaction Model (The "UI Paradigm")
How does the user physically build the expression?

*   **Choice A: The "Pill-Based" List (Bubble-Like)**
    - **Pros:** Familiar to existing builders. Prevents syntax errors by mapping one click to one node.
    - **Cons:** Hard to edit in the middle of a chain. Selecting text is difficult.
*   **Choice B: A Hybrid "SearchBox" (VS Code Intellisense Style)**
    - **Pros:** Extremely fast for advanced users (typing is faster than clicking). Still provides a dropdown for the next valid operator based on the `SchemaRegistry`.
    - **Cons:** Requires a robust parser to validate real-time typing.
*   **Choice C: Visual Graph / Node-Based (Advanced)**
    - **Pros:** Great for complex nested logic (conditionals).
    - **Cons:** Overkill for standard linear expressions like `Current User's Name :uppercase`.

---

### 2. The Internal Representation (The "Data Model")
How do we store the expression while it is being built?

*   **Choice A: The Linked-List / AST (Abstract Syntax Tree)**
    - **Implementation:** Each "pill" is an object: `{ type: 'text', operator: 'append', next: ... }`.
    - **Pros:** Perfectly matches the `SchemaRegistry` lookup logic. Easy to "compile" back into Bubble's internal format.
*   **Choice B: Serialization-First (String)**
    - **Implementation:** Work with the raw string representation.
    - **Pros:** Simple to store.
    - **Cons:** Impossible to enforce type-safety rules without a full transpiler.

---

### 3. The Integration Method (The "Injection Strategy")
How do we replace Bubble's native composer?

*   **Choice A: The "Overlay" (Non-Destructive)**
    - **How:** Detect when a Bubble expression editor is opened, and float our UI directly on top of it. 
    - **Pros:** Safest approach. If our composer fails, the user can just close it and see the native one. 
*   **Choice B: The "Interceptor" (Destructive/Seamless)**
    - **How:** Hook into Bubble's `create_expression_editor` function and replace it with our own constructor.
    - **Pros:** Feels like a native feature.
    - **Cons:** High risk of breaking during Bubble updates.

---

### 4. Schema Feeding (The "Knowledge Source")
How do we keep the `SchemaRegistry` up to date?

*   **Choice A: Static Mapping (Current Phase)**
    - Use the hardcoded rules from `bubble_type_schema.md`.
*   **Choice B: Live Scraping (Runtime Phase)**
    - Read the `appquery_default` object in the browser's global scope to dynamically determine the current app's Data Types, Option Sets, and Element States.

---

## 🛠 Strategic Recommendation

For the **V1**, I recommend a **Hybrid Approach**:
1.  **UI:** A "Pill-Based" UI that supports **Keyboard Shortcuts/Searching**. (Imagine clicking a pill, then typing "upp" and hitting Enter to add `:uppercase`).
2.  **Data:** A strict **AST** model to ensure type-safety.
3.  **Integration:** An **Overlay UI** injected via the "UI World" of our extension.
4.  **Schema:** Use the **Static Schema** as a base, and "Hydrate" it with a **Live Scraper** targeting the `app_info` globals.

---

### 💡 Open Questions
1.  Should we allow "Free Text" typing for the entire expression?
2.  Do we need to handle the "Blue-Pill" data sources (e.g., Search for...) differently than simple properties?
3.  How do we handle **Parenthesis/Grouping**? (Bubble's native composer is historically poor at this). 
