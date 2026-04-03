# Expression Analyzer - Development Plan

The development is broken down into structured phases. We will ensure each goal is fully verified before proceeding to the next.

- `[ ]` **Phase 1: Basic Initialization & Script Injection**
    - **Goal:** Ensure `expression_analyzer.js` is correctly injected and running within the Bubble Editor logic space with full access to the DOM.
    - **Verification:** Execute the extension in a test environment. Ensure `console.log` statements from within the script print immediately natively, indicating that initialization is fully functional.

- `[ ]` **Phase 2: Triggering the Expression Observer**
    - **Goal:** Identify specifically when the user clicks the "Add" button and the `.dropdown-items-positioner[role=listbox]` appears inside an expression composer.
    - **Verification:** When clicking "Add" on any dynamic expression, the console strictly prints "Expression Dropdown Opened: N items found" without duplicate fires or missing clicks.

- `[ ]` **Phase 3: Parsing the Left-Hand Operand (LHO) & Data Type**
    - **Goal:** Backtrack in the DOM to find the preceding `.spot` element, resolve its representation internally via `window.appquery()`, and extract both its `operator_name` and `data_type` directly from the Bubble cache.
    - **Verification:** Upon triggering the dropdown, the console outputs: `LHO Captured: { operator: 'set_year', type: 'date' }`. We ensure this is 100% accurate before moving to mapping the children.

- `[ ]` **Phase 4: Right-Hand Operand (RHO) Translation Dictionary**
    - **Goal:** Read the new visible items in the dropdown. Establish a dictionary translation by clicking on an item, allowing Bubble to generate the `.spot`, and then saving its new internal JSON `operator_name`.
    - **Verification:** Print snapshots detailing the stripped DOM and `appquery` JSON immediately after an arbitrary item click. We will be able to manually verify that "Change Year" strictly linked to "set_year". 

- `[ ]` **Phase 5: Schema Mapping & Storage Engine**
    - **Goal:** Implement the logic in `features/expression_analyzer/schema_store.js` that commits `{ LHO -> [RHOs] }` to browser `localStorage`.
    - **Verification:** Navigate away, refresh the Bubble editor, run a manual `CodelessLove.exportSchema()` command in the console, and verify the adjacency list outputs successfully with compound keys (e.g. `Date::set_year`).

- `[ ]` **Phase 6: Exhaustion Engine & Interactive Highlighting**
    - **Goal:** Calculate the depth levels of the nodes recursively. Inject `.analyzer-lvl-X` CSS classes into the elements when the dropdown is rendered.
    - **Verification:** Click through an expression sequence (e.g., `Current Date/Time -> Change Year -> +(days)`). The valid options should transition systematically from White -> Yellow -> Orange -> Green dynamically.
