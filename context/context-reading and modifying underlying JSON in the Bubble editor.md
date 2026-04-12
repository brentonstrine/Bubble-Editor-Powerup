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

When reading conditionals from the `states` (or `%s`) block via `child_names()`, be aware that Bubble **does not re-index** items if a user deletes a condition in the visual editor. 

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
*   `%e`: **Entries**. The child entries inside a Text Expression. (Uncompressed: `entries`)
*   `%9i`: **Icon Name**. The specific icon string. (Uncompressed: `icon`)
*   `%nm`: **Custom Name**. The user-defined string name of the node. 
*   `%dn`: **Default Name**. The system-generated backup name. 
*   `%x`: **Type**. The class designation of the node.

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