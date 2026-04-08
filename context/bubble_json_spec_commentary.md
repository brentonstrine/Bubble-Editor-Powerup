# Bubble JSON Configuration & Grammar Commentary

This document describes how Bubble's internal Abstract Syntax Tree (AST) represents dynamic text fields, specifically the `TextExpression` object.

## The `TextExpression` Wrapper

In Bubble's underlying JSON representation of expressions, any property that allows a mix of static text and dynamic expressions (such as `formatting_for_true` in boolean formatters or `arbitrary_text` in dynamic text blocks) is wrapped in a `TextExpression` object.

### Structure

A `TextExpression` consists of an `entries` object, which maps string-indices to the content of the field.

```json
{
  "type": "TextExpression",
  "entries": {
    "0": "Static prefix text ",
    "1": { 
      "type": "GetElement",
      "properties": { "element_id": "..." },
      "next": { ... }
    },
    "2": " static suffix text"
  }
}
```

## Why Bubble Uses This Pattern

**Interleaved Content Support**: The primary reason for this structure is to allow for **interleaved content** (mixing plain text strings and dynamic code tokens in the same line).

By using an index-based `entries` map, Bubble can perfectly reconstruct the order of:
1. Static Text (at index 0)
2. Dynamic Expression (at index 1)
3. More Static Text (at index 2)
4. A Second Dynamic Expression (at index 3)
5. And so on...

### The "Empty Wrapper" Pattern
Even if an expression has no static text, Bubble often maintains the `0, 1, 2` structure:
*   **"0": ""** (Empty prefix)
*   **"1": { expression }**
*   **"2": ""** (Empty suffix)

This ensures the user can always click **before** or **after** an existing dynamic token to insert more text or another token without needing to rewrite the internal logic of the first token.

## Implementation Details in Advanced Composer

In our `expression_advanced_composer.js`, we handle this using:

1.  **Unpacker**: Scans the `entries` map and looks for the first index that contains an object with a `type`. It prioritizes the "expression" part of the interleaved content for the composer UI.
2.  **Packer**: When saving a `text`-type property (as defined in the `propertiesSchema`), the packer automatically re-wraps the built expression into the `0, 1, 2` entry structure. This maintains 100% compatibility with Bubble's editor expectation that a `TextExpression` is present.

## ⚠️ Critical Gotcha: Literal Strings vs. AST Nodes

One of the most important discoveries regarding `TextExpression` is how it handles static content.

**Bubble does not have a "String" or "Literal" node type in its terminal AST.**
In our internal composer logic, we often use a `{ type: "String", value: "Banana" }` wrapper to represent text in the UI pills, but when "Packing" the JSON for Bubble, this must be discarded.

### Correct Serialization
- **WRONG**: `entries: { "0": { "type": "String", "value": "no" } }`
- **RIGHT**: `entries: { "0": "no" }`

If any entry in a `TextExpression` is just static text, it **must** be a raw string literal. If it contains a dynamic expression, that entry must be the first node of that expression chain.

### Impact on Packing Logic
The `packExpression` function now specifically checks if a property's packed result is a single, un-chained `String` node. If so, it extracts the `value` and maps it directly to entry `"0"` as a literal. If the result is a deeper expression chain, it defaults to the `0: "", 1: <object>, 2: ""` structure to satisfy Bubble's interleaved content requirements.

---
*Created during Phase 6 of the Advanced Expression Composer development.*
