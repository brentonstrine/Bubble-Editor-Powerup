# Feature Specification: Advanced Expression Composer (V1)

This document defines the final architectural and interaction model for the Advanced Expression Composer, a high-performance replacement for the native Bubble expression editor.

## 🚀 1. The Interaction Model (Visual & Interactive Logic)

The composer uses a **Slot-and-Token** paradigm derived from the [demo.html](file:///Users/dev/Documents/GitHub/CodelessLove/Bubble-Powerup/features/expression_advanced_composer/demo.html) prototype.

### A. Visual States & Terminology
*   **Active State (Focus)**: A single element (Token or Slot) being interacted with. Indicated by a **White Glow / Border**.
    *   **Tokens**: Auto-select their text content upon activation for instant replacement.
    *   **Slots**: Expand to **20px** and show a dashed border + dropdown triggers when Active.
*   **Selected State (Range)**: A range of elements marked for bulk action (Shift-Click/Arrow). Indicated by a **Blue Outline**.
    *   Selection ranges always **snap to tokens** (never start/end with a slot).
*   **Stealth Slots (Default)**: Slots are **4px wide** and nearly invisible (no border/background) when not active/selected. This maintains a clean "text-like" flow.
*   **Empty State**: When the expression is empty, the root slot is **Full Size (20px)** and visible to provide a clear starting point.

### B. Keyboard & Drag Interaction
*   **Navigation**: Full `ArrowLeft/Right` navigation between tokens and slots.
*   **Dropdown**: `ArrowUp/Down` and `Enter` to navigate and select from the context-aware operator list.
*   **Proximity Dropping**: Dragging onto a Token automatically targets the nearest neighbor Slot (Left 50% vs Right 50%).
*   **Bulk Actions**: Dragging any part of a "Selected" range moves the entire group while preserving internal order.

## 🧬 2. The Data Model (Internal Representation)

We will not maintain an independent AST. Instead, we use a **Flat Array of Tokens** that mirrors the UI's linear flow, providing a bridge to Bubble's internal JSON.

### A. The "Flat-to-Bubble" Bridge
1.  **Read**: Use `window.appquery().app().json` to retrieve the current expression.
2.  **Unpack**: Flatten Bubble's recursive `"next": { ... }` structure into our linear Token Array.
3.  **Mutate**: Perform all UI operations (drag/drop/delete) on the flat array.
4.  **Pack**: Recursively wrap the array back into Bubble's nested JSON format.
5.  **Save**: Use `node.set(newData, metadata)` to commit the change directly to the application state.

## 🔑 4. Rule Enforcement & Validation (The "Brain")

The composer is strictly governed by the type-aware logic system established in [bubble_type_schema.md](file:///Users/dev/Documents/GitHub/CodelessLove/Bubble-Powerup/context/bubble_type_schema.md).

### A. Type-Safety Enforcement
*   **Source of Truth**: All operator availability and "left-right" connection checks are driven by our discovered schema.
*   **Grammar Injection**: The composer enforces that every "Next" node in the expression chain matches the "Output Type" of its predecessor.
*   **Dynamic Filtering**: When a user activates a slot, the dropdown options are filtered in real-time to only show operators that are compatible with the left-hand token's type (e.g., `:uppercase` only appears if the left-hand token is of type `Text`).

### B. Validation Engine
The `syncAndValidate()` logic from the prototype performs real-time checks against these rules:
*   Each token verifies its `Left` input matches the `Right` output of the preceding token.
*   Invalid connections (violations of the `bubble_type_schema.md` logic) trigger a **Red ([!])** indicator in the intervening slot and force it to expand for visibility.

## ✅ Verification Plan

### 1. Prototype Fidelity Test
*   Verify all 20 items in [demo acceptance criteria.md](file:///Users/dev/Documents/GitHub/CodelessLove/Bubble-Powerup/features/expression_advanced_composer/demo%20acceptance%20criteria.md) are functional in the production environment.

### 2. Schema Compliance Task
*   Cross-reference common expressions (e.g. `User's Name:uppercase`) against the rule-set in `bubble_type_schema.md` to ensure the validation engine correctly identifies valid and invalid chains.

### 3. Performance Stress Test
*   Drag a selection of 5+ tokens across a long expression.
*   Verify zero lag or "hanging" during the drag-over proximity calculation.
