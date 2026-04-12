# Bubble Editor Internal JSON API: The Unofficial Documentation

This document outlines how to interact with the internal JSON state of a [Bubble.io](https://bubble.io) application from within the editor. Bubble is a no-code platform for building web applications.

## ⚠️ Important Disclaimer: Bubble's Policy
Before utilizing this API, you must understand Bubble’s official stance on editor extensions interacting with their internal state:
* **"Build At Your Own Risk":** This is an internal, unofficial API. Bubble can and will change it without warning. 
* **No Bug Support:** If a Bubble update breaks your extension, they will not consider it a bug or roll back their changes.
* **Warn Your Users:** You must warn your users that your extension may experience downtime. Users should not build mission-critical workflows dependent on your extension's continuous uptime.
* **No Undo/Redo Support:** Data modifications made via this API bypass the standard editor undo/redo stack.

Despite these warnings, this API is vastly superior, cleaner, and less fragile than scraping and mutating the editor's DOM.

---

## 1. Core Concepts & The Entry Point
The Bubble editor application state exists as a massive, deeply nested JSON document. You interact with this document via **Nodes**. A Node is an internal Bubble object that represents a specific location in the JSON tree and contains built-in methods for reading, writing, and navigating.

The root entry point for the API is:
```javascript
window.appquery().app().json
```

### Path Prefixes
When looking at a Node's path (`node.path()`), you will encounter common prefixes that indicate the starting scope:
*   **`%p3`**: Points to the standard Page components or the main application tree.
*   **`%ed`**: Editor-level data container, often used for reusables or specific editor-only overlays.

### The Golden Rule of Reading Data
**Never call `.raw()` on the root node.** Doing `window.appquery().app().json.raw()` forces the editor to decompress and load the *entire* application into the browser's memory at once. This will freeze the browser, spike server loads, and potentially get your extension blocked. Always navigate down to a specific branch or element before reading data.

## Avoid Raw Calls in Production
**Avoid using `.raw()` programmatically.** Calling `.raw()` is generally unecessary and is not performant. This is not just a warning for the full application root, but for specific elements as well. Because bubble elements can contain enormous trees of children and data sources, using `.raw()` in programmatic loops or automated scripts can create severe performance bottlenecks and massive memory leaks. 

Instead, you should rapidly navigate the tree using Bubble's internal navigation methods or access the lightweight `node.cache`. 

**The primary use case for `.raw()`** is for diagnostics and runtime investigation during development—-it's a tool to get a highly legible and structured JSON output to help you understand what data is available so you can safely query it using lighter methods.

---

## 2. Navigating the JSON Tree
Once you have a Node, you can traverse the tree using Bubble's internal navigation methods.

* **`node.child('KEY_NAME')`**: Returns a new Node representing the child at the given key.
* **`node.parent()`**: Returns the parent Node.
* **`node.child_names()`**: Returns an array of keys available at the current location that currently hold non-null data.
* **`node.path()`**: Returns the path showing where you currently are in the JSON tree.
* **`node.exists()`**: Returns a boolean indicating if the current Node actually exists (useful for avoiding errors).
* **`node.by_path('path.to.thing')`**: Jumps directly to a deeply nested Node using dot notation.

> **💡 CRITICAL: The `.child()` Compression Trap**
> When using `.child()` to navigate down the tree, you MUST use Bubble's internal compressed key names (e.g., `node.child('%p')`), *not* the decompressed names (e.g., `node.child('properties')`). Calling `.child()` with an uncompressed key will silently fail and return a non-existent node unless the element has already been manually decompressed via `.raw()`! 

### Utilizing Indexes for Fast Lookups
Bubble maintains root-level maps to help you instantly find specific elements or pages without crawling the tree.
You can access this index via `window.appquery().app().json.child('_index')`.

* **`id_to_path`**: Maps an element's unique ID (e.g., `bTGkv`) to its exact tree location.
* **`page_name_to_path`**: Maps a page's name to its exact tree location.

---

## 3. Reading Data Efficiently
When building tools like an element tree crawler, efficiency is critical. Every time you call `.raw()`, Bubble runs a decompression algorithm to generate a readable JavaScript object. Calling `.raw()` on thousands of elements will crash the editor. 

Instead, read directly from **`node.cache`**. This object holds the compressed, highly-efficient state of the element currently loaded in memory. 

### The Compression Decoder Ring
Bubble shrinks standard JSON keys into tiny symbols to save memory. Here is how to decode `node.cache`:

| Compressed Key | Readable Meaning | Example Location |
| :--- | :--- | :--- |
| **`%dn`** | Default Structural Name | `node.cache['%dn']` (e.g., "Group A") |
| **`%p`** | Properties (Coordinates, data sources) | `node.cache['%p']` |
| **`%nm`** | Custom User-Defined Name | `node.cache['%p']['%nm']` (e.g., "Main Container") |
| **`%x`** | Element Type | `node.cache['%x']` (e.g., "Group", "PageData") |
| **`%el`** | Elements (Direct children object map) | `Object.keys(node.cache['%el'])` provides children internal keys |
| **`%s1`** | Style | `node.cache['%s1']` |
| **`%s`** or **`states`** | Conditionals (States) | `node.child('states')` holds Conditional rules, NOT `node.child('conditions')`! |
| **`%h`, `%w`, `%l`, `%t`** | Height, Width, Left, Top | Inside `node.cache['%p']` |

> **Warning:** Treat `node.cache` as strictly **Read-Only**. Modifying the cache directly will break Bubble's internal reactivity and fail to save to the database.

## 6. Zombie Conditionals (State Arrays)

When reading conditionals from the `states` (or `%s`) block via `child_names()`, be aware that Bubble **does not re-index** items if a user deletes a condition in the visual editor. Furthermore, even in active sets, indices may be non-sequential (e.g., State 0 and State 2 with no State 1).

If a user creates three conditions (indexes `0`, `1`, `2`) and deletes the first two, Bubble's `child_names()` will still return an array of `['0', '1', '2']`.

*   Indexes `0` and `1` will be "zombies" (empty objects, lacking a `.condition` or `%c` key).
*   Index `2` will contain the valid expression.

When traversing the DOM to map visual rows to internal JSON states, you must sequentially filter the ID array to ignore these zombies:
```javascript
// Filter out zombies before mapping visual DOM Index to Bubble Index
let conditionIds = elementNode.child('%s').child_names();
conditionIds = conditionIds.filter(id => {
    const rawState = elementNode.child('%s').child(id).raw() || {};
    return rawState.hasOwnProperty('%c') || rawState.hasOwnProperty('condition');
});
```

## 7. Compressed JSON Key Dictionary (Cheat Sheet)

Bubble violently compresses its JSON tree for production/app apps. Here are the known keys:
*   `%s`: **States / Conditionals**. Contains the logic states attached to an element. (Uncompressed: `states`)
*   `%s1`: **Style ID**. The ID string of the visual style class applied to the element. (Uncompressed: `style`)
*   `%c`: **Condition expression**. The actual logical expression inside a conditional state. (Uncompressed: `condition`)
*   `%p`: **Properties**. The main wrapper around the element's distinct settings. (Uncompressed: `properties`)
*   `%el`: **Elements (Children)**. The container holding nested components. (Uncompressed: `elements`)
*   `%gt`: **Group Type**. The data type designation for a container. (Uncompressed: `group_type`)
*   `%3`: **Text Expression**. The root of a text content property. (Uncompressed: `text`)
*   `%e`: **Entries**. The child entries inside a Text Expression or generic expression chain. (Uncompressed: `entries`)
*   `%ps`: **Placeholder**. Used heavily in inputs for placeholder definitions. (Uncompressed: `placeholder`)
*   `%ds`: **Data Source**. The root object for binding an element's data context or search output. (Uncompressed: `data_source`)
*   `%n`: **Next**. The crucial link in chaining Bubble expression logic. (Uncompressed: `next`)
*   `%9i`: **Icon Name**. The specific icon string. (Uncompressed: `icon`)
*   `%nm`: **Custom Name**. The user-defined string name of the node. 
*   `%dn`: **Default Name**. The system-generated backup name. 
*   `%x`: **Type**. The class designation of the node, frequently determining data types or expression behavior (e.g., `TextExpression`, `CurrentUser`, `Search`).
*   `%iv`: **Is Visible**. Boolean flag controlling element visibility. Commonly found overriding standard visibility inside a conditionals `%p` array. (Uncompressed: `is_visible`)
*   `%z`: **Z-Index**. Structural stacking order coordinate. (Uncompressed: `zindex`)
*   `%cp`: **Current Parent**. Identifier for the structural parent node. (Uncompressed: `current_parent`)
*   `%ei`: **Element ID**. The system string pointer used within workflows or dynamic targets referencing specific elements. (Uncompressed: `element_id`)

### Internal Quirks and Structural Observations
*   **Search Constraints (`data_source.properties.constraints`)**: A Data Source of type `Search` stores its constraints as an indexed dictionary (e.g., `"0"`, `"1"`). Each constraint defines `key` (Field Name), `value` (The evaluated Bubble Expression), and `constraint_type` (e.g., "equals", "not contains").
*   **Repeating Group "CELL" Pattern**: In Bubble's internal structure for Repeating Groups, the direct child of the RG is often a structural "CELL" group. This group typically uses an `ElementParent` data source. Because of Bubble's scope rules, inner elements use `GetElement` targeting the "CELL" group to maintain access to "Current Cell's Thing" data logic even when nested deeply within other containers.
*   **Auto-Binding Inputs**: Inputs store Auto-Binding setup internally, identifying the target field via `bind_field` and whether a success notification is shown to a specific element by `alert_element`.
*   **Reusable Element Parameters**: When looking at a Reusable Element instantiated on a page, Bubble handles custom properties/parameters via keys that prefix with `param_` (e.g., `param_cnSRm`), linking the internal definition variable to the provided expression `OneOptionValue`. 
*   **Field Naming Grammar**: Method names (Messages) often follow a strict `{field_name}_{type_modifier}_{data_type}` suffix pattern (e.g., `tags_list_option_featureset_tag`).
*   **Context-Dependent/False-Positive Keys**: When mapping JSON keys visually, be careful of "primitive collisions". If `height: 0` and `min_width: 0`, naive value-matching might associate `%h` with `min_width` instead of `height`. Furthermore, depending on an element's configuration (Fixed vs Responsive width), numerical property usages may shift significance under the hood.

---

## 8. Expression Chain Architecture

Bubble expressions are **recursive linked lists**. Each node in the chain has a `type` (or `%x`), and optionally a `next` (or `%n`) pointer to the next operation. The chain reads left-to-right, exactly mirroring the visual expression builder in the Bubble editor.

### Chain Structure
```
[RootType] → .method1() → .method2(args) → .method3()
```
In JSON, this looks like:
```json
{
  "type": "CurrentUser",
  "next": {
    "type": "Message",
    "name": "current_seat_custom_seat",
    "next": {
      "type": "Message",
      "name": "team_custom_team"
    }
  }
}
```

### Known Root Types (Expression Starting Points)
| Root Type | Description | Key Properties |
| :--- | :--- | :--- |
| `CurrentUser` | The logged-in user | — |
| `ThisElement` | The element itself (e.g., "This Group's data") | — |
| `GetElement` | References another element by ID | `properties.element_id` |
| `Search` | "Do a Search for" query | `properties.constraints`, `properties.type_to_find`, `properties.sort_field`, `properties.descending` |
| `PageData` | Page-level data (e.g., "Current Page Width") | `properties.name` |
| `Breakpoint` | A responsive breakpoint reference | `properties.breakpoint_id` |
| `OneOptionValue` | A static Option Set value | `properties.option_set`, `properties.option_value` |
| `OptionValue` | An Option Set value that supports chaining | Used when getting a property (like `.id0`) from an option. |
| `PrimitiveLiteral` | A hardcoded literal value | `properties.value`, `properties.btype` (e.g., `sys.bool`) |
| `TextExpression` | Text content with dynamic insertions | `entries` (indexed dictionary of strings and/or expression objects) |
| `GetParamFromUrl` | URL parameter accessor | `properties.parameter_name` (a TextExpression) |
| `ElementParent` | Parent element's data source (shorthand) | — |

### Message Names (Method Chaining)
`Message` is the universal chaining type. Its `name` property defines the operation. Message names follow a naming convention that **encodes field names and their data types**:

*   **Field accessors**: `email`, `_id` (Unique ID), `team_custom_team` (field `team` of type `custom.team`), `current_seat_custom_seat`, `featuresets_list_custom_featureset` (list field)
*   **Data retrieval**: `get_group_data`, `get_list_data`
*   **Comparisons**: `equals`, `less_than`, `less_or_equal_than`, `is_empty`, `is_not_empty`, `contains`, `not_contains`, `not_logged_in`
*   **Boolean logic**: `and_` (requires a boolean input; often preceded by `.is_true`)
*   **Evaluators**: `is_true`, `is_hovered`
*   **List operations**: `merged_with`, `unique`, `sorted`, `filtered`, `count`
*   **ID accessors**: `id0` (specifically for unique IDs of records or options)

### Boolean Chaining Flow
When multiple conditions are joined, Bubble uses a pipeline flow. For example, "If [ParamX] is true AND [This Element] is hovered":
1.  Start with `[GetElement]` targeting the param.
2.  Call `.is_true` to resolve the param.
3.  Chain `.and_` which takes a full `[ThisElement]` -> `.is_hovered` expression as its `args`.

### Args Patterns
The `args` (or `%a`) property on a `Message` carries the argument to the operation. Its shape varies:

| Pattern | Example | Meaning |
| :--- | :--- | :--- |
| Literal number | `"args": 1` | Direct numeric value |
| Literal string | `"args": "true"` | Direct string value |
| Expression object | `"args": { "type": "GetElement", ... }` | A full nested expression (common in `and_` or `contains`) |

### `is_slidable`
This flag appears on most expression chain nodes. It is almost always `false`. List-manipulation methods that change order or filter content, such as **`.sorted()`** and **`.filtered()`**, are notable exceptions where `is_slidable: true`.

### Shared Architecture: Search vs. Filter
The `Search` root type and the `.filtered` message name share the exact same **`constraints`** architecture. Both store logic rules in `properties.constraints` as an indexed dictionary of objects containing `key`, `value`, and `constraint_type`. This demonstrates that Bubble's querying engine is reused for both database and in-memory list operations.

### Where Expressions Live on an Element
Expressions can appear in multiple locations within a single element's JSON:

*   `properties.data_source` — The element's data binding
*   `properties.text` (or `%3`) — Text content (as a `TextExpression`)
*   `properties.placeholder` (or `%ps`) — Input placeholder text
*   `states[N].condition` (or `%s[N].%c`) — Conditional logic
*   `states[N].properties.*` — Override values within conditionals (can themselves be expressions)
*   `properties.param_*` — Reusable element parameter bindings
*   `properties.unique_id` — Element ID attribute (as a `TextExpression`)

### Workflow Actions
Workflow action expressions are **NOT** stored on the element itself. They are stored separately in Bubble's JSON tree. Inspecting a Button element, for example, will show its text and conditionals but not its click actions.

---

## 9. Custom States

Custom States are stored in a `custom_states` dictionary on the element node. Each state consists of an internal ID (the key) and a configuration object:

```json
"is_checked_": {
  "display": "is_checked",   // The user-friendly State Name
  "value": "boolean",        // The data type
  "default_val": false,      // Initial value
  "make_static": true
}
```

---

## 4. Writing & Modifying Data
To modify an element, you must extract its data, mutate the standard JavaScript object, and push it back using `node.set()`. 

### The `node.set(object, metadata)` Method
When calling `.set()`, you overwrite the data at that specific Node. 
**You must always include a metadata object** with your extension's name. This ensures that if an error occurs and a user contacts Bubble support, the engineering logs will clearly show that your extension made the change, rather than Bubble's internal code.

```javascript
// 1. Get the Node
const elementNode = window.appquery().app().json.by_path('path.to.element');

// 2. Extract the raw JavaScript object
let myElementData = elementNode.raw();

// 3. Mutate the object
myElementData.properties.width = 500;

// 4. Define the required tracking metadata
const metadata = { intent: { name: 'Bubble Editor Powerup from Codeless Love' } };

// 5. Save it back to the tree
elementNode.set(myElementData, metadata);
```

### Creating Entirely New Elements
Injecting new elements requires a two-step process to ensure Bubble's search index is aware of the new data.
This involves a special `set_index` function that is not used for normal data manipulation.

1.  **Update the Index:** Call `set_index()` on the root node. This function takes the index name (`id_to_path`), the new element's ID, and the **compressed path** where the element will live. The compressed path is retrieved by calling `._path()` on the destination node.
    ```javascript
    rootNode.set_index('id_to_path', newElementData.id, targetNode._path());
    ```
2.  **Write the Data:** Call `set()` on the target node where the element will actually be created (e.g., a child of a parent element).
    ```javascript
    targetNode.set(newElementData, metadata);
    ```

*(Note: `rootNode` is a placeholder for `window.appquery().app().json`, and `targetNode` is the destination Node for the new element.)*

---

## 5. Node Anatomy & State Management
Every `EditorJSON_Cls2` Node contains internal properties that provide powerful meta-information about the app's state.

* **`__name`**: The unique ID of the element itself (e.g., `bTGLq`).
* **`__path`**: The compressed path string to this exact node.
* **`_parent`**: Directly returns the parent Node object.
* **`_children`**: A dictionary of child nodes currently instantiated in memory.
* **`_root`**: A direct pointer to the top-level application node.
* **`_date_updated`**: Epoch timestamp of the last modification.
* **`_has_value`**: Boolean check to ensure the node isn't empty.

### Powerup Capability: Intercepting Saves
The `_root` node contains a property called **`_outgoing_changes`**. This acts as Bubble's queue of changes waiting to be synced to their servers. By monitoring `_outgoing_changes`, an extension can watch exactly what properties a user is tweaking in real-time, *before* they are fully committed, allowing for advanced real-time warnings or linters.

---

## 6. Runtime DOM to Editor JSON Mapping
To bridge the gap between the live, rendered elements on the page and the underlying editor JSON, you must understand Bubble's DOM anatomy and CSS escaping algorithm.

### The Universal DOM Anatomy
Bubble renders elements using a strict, predictable class structure. `id` attributes are left entirely open for the user, so the engine relies solely on `class` lists. 

Example: `<button class="clickable-element bubble-element Button baTaZaDaP">`
1. **Interactive Flag (`clickable-element`)**: Applied only if the element has an attached workflow or is a native input.
2. **Global Target (`bubble-element`)**: Applied to all elements for global CSS resets.
3. **Type Definition (`Button`, `Group`)**: Defines the internal rendering module.
4. **Escaped JSON ID (`baTaZaDaP`)**: The encoded ID linking back to the JSON API.

### The CSS Escape Algorithm
Because HTML/CSS environments are sometimes case-insensitive (and CSS classes cannot start with numbers), Bubble escapes their JSON IDs before rendering them to the DOM.

* **Rule 1 (The Uppercase Escape):** Bubble injects a lowercase `a` immediately before every uppercase letter in an ID. (e.g., Editor ID `bTGLo` becomes Runtime Class `baTaGaLo`).
* **Rule 2 (The Number Escape):** If an ID starts with a number, Bubble prepends a single lowercase `a` to satisfy CSS specifications. (e.g., Editor ID `175771...` becomes Runtime Class `a175771...`).

### Reusable Components (Custom Elements)
If an element has the class `CustomElement`, it is a Reusable Component. These operate as mini-apps and have their own entirely separate definition branches within the JSON tree.

---

## 8. Lessons Learned & Edge Cases

### Reusable Element Extraction (Lazy Caching)
When performing recursive extractions (like building an element list), you may find that **Reusable Elements** (often labeled `CustomDefinition` internally) do not populate their `%el` dictionary in the root `node.cache`. 
* **The Symptom:** `node.cache['%el']` returns undefined, making it look like the Reusable has no children.
* **The Solution:** Use `node.child('%el').child_names()` instead. This forces the engine to look up the children without requiring a heavy `.raw()` call, effectively "warming up" the cache for that specific branch. Use `%el` as the primary key and fallback to `elements` for older uncompressed app versions.
---

## 9. Developer Cheat Sheet

**Get the ID of the currently selected element:**
```javascript
document.querySelector(".element.selected > .inner-element").id
```

**Get the Node of the currently selected element:**
```javascript
window.appquery().app().json.by_path(window.appquery().app().json.child('_index').child('id_to_path').raw()[document.querySelector(".element.selected > .inner-element").id])
```

**Get the raw JSON of the currently selected element:**
```javascript
window.appquery().app().json.by_path(window.appquery().app().json.child('_index').child('id_to_path').raw()[document.querySelector(".element.selected > .inner-element").id]).raw()
```

**Get the raw JSON of the currently selected element:**
```javascript
var elementID = document.querySelector(".element.selected > .inner-element").id;
window.appquery().app().json.by_path(window.appquery().app().json.child('_index').child('id_to_path').raw()[elementID]).raw()
```

**Write data directly to the currently selected element:**
```javascript
window.appquery().app().json.by_path(window.appquery().app().json.child('_index').child('id_to_path').raw()[document.querySelector(".element.selected > .inner-element").id]).set(newDataObject, metadata)
```

**Get a list of all Custom Types in the app:**
```javascript
window.appquery.custom_types().map(x => x.json.__name)
```

**Delete all styles in the app:**
```javascript
let styles = appquery.styles();
styles.forEach((s) => appquery.delete_style(s.name(), s));
```