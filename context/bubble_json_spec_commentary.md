# Bubble JSON Configuration & Grammar Commentary

This document is a companion to the type schema. It documents how Bubble's internal JSON structures work, why they're built the way they are, and the gotchas we've discovered through reverse-engineering.

---

## TextExpression: The "Template Literal" Pattern

### What It Is

A `TextExpression` is Bubble's way of representing a field that can contain a mix of plain text and dynamic expressions. Think of it like JavaScript template literals:

```js
`Hello ${CurrentUser.email}, you have ${SearchForThings.count} items`
```

In Bubble's JSON, this becomes:

```json
{
  "type": "TextExpression",
  "entries": {
    "0": "Hello ",
    "1": { "type": "CurrentUser", "next": { "type": "Message", "name": "email" } },
    "2": ", you have ",
    "3": { "type": "Search", "next": { "type": "Message", "name": "count" } },
    "4": " items"
  }
}
```

### Where It Appears

Any property that accepts rich text content is wrapped in a `TextExpression`:
- `arbitrary_text` on the `ArbitraryText` data source
- `formatting_for_true` / `formatting_for_false` on `:format_boolean`
- Conditional text fields, email bodies, etc.

### The Strict Interleaving Rule

Bubble enforces a rigid alternating pattern:

| Index | Type | Example |
|-------|------|---------|
| 0 | String literal | `"Hello "` |
| 1 | Expression node | `{ type: "CurrentUser", ... }` |
| 2 | String literal | `", you have "` |
| 3 | Expression node | `{ type: "Search", ... }` |
| 4 | String literal | `" items"` |

**Even indices (0, 2, 4...)** are always string literals.
**Odd indices (1, 3, 5...)** are always expression chain objects.

### Why Bubble Builds It This Way

The strict interleaving pattern exists for several practical reasons:

1. **Guaranteed Insertion Points**: Every expression is always bordered by string entries on both sides. This means the editor always has a valid "click target" where the user can place their cursor to type more text or insert another expression. Without the empty strings, the editor would need complex logic to figure out where new content can be inserted.

2. **Simplified Rendering**: The evaluation engine can simply iterate through entries in order: render string, evaluate expression, render string, evaluate expression... There's no need for type-checking at each index because the position alone tells you what it is.

3. **Simplified Serialization**: When the user types text between two expressions, the editor just updates the string at the even index between them. When the user inserts a new expression, the editor splits the current string entry into two halves and inserts the expression at a new odd index between them. The index parity acts as a built-in type discriminator.

4. **Adjacent Expression Handling**: When two expressions are placed next to each other with no text between them, Bubble inserts an empty string `""` at the intervening even index. This maintains the alternating pattern and ensures the user can always click between the two pills to type text there later.

### Examples of the Pattern

**Plain text only:**
```json
{ "entries": { "0": "just some text" } }
```

**Expression only (no surrounding text):**
```json
{ "entries": { "0": "", "1": { "type": "CurrentUser", ... }, "2": "" } }
```

**Two adjacent expressions (no text between them):**
```json
{
  "entries": {
    "0": "",
    "1": { "type": "GetElement", ... },
    "2": "",
    "3": { "type": "CurrentUser", ... },
    "4": ""
  }
}
```

**Mixed text and expressions:**
```json
{
  "entries": {
    "0": "Ban",
    "1": { "type": "CurrentUser", "next": { "name": "email" } },
    "2": "ana!,one,two",
    "3": { "type": "GetElement", ... },
    "4": "three,four"
  }
}
```

---

## ⚠️ Critical Gotcha: No "String" Node Type in Bubble

Bubble does **not** have a `{ type: "String", value: "..." }` node in its expression grammar. That's an internal concept we use in our composer UI to represent editable text pills.

When packing JSON for Bubble:
- **WRONG**: `entries: { "0": { "type": "String", "value": "no" } }`
- **RIGHT**: `entries: { "0": "no" }`

Static text in a `TextExpression` must always be a raw string literal at an even index.

---

## Expression Chains: The `.next` Pattern

Expressions in Bubble are linked lists. Each node has a `next` property pointing to the next operation in the chain:

```json
{
  "type": "ArbitraryText",
  "properties": { ... },
  "next": {
    "type": "Message",
    "name": "to_uppercase",
    "next": {
      "type": "Message",
      "name": "length",
      "next": null
    }
  }
}
```

This reads as: `ArbitraryText → :to_uppercase → :length`

Key rules:
- The first node is always a **Data Source** (e.g., `ArbitraryText`, `CurrentUser`, `GetElement`).
- Subsequent `.next` nodes are always **Messages** (operators like `:to_uppercase`, `:length`).
- The chain terminates when `next` is `null` or absent.
- `properties` on a node hold its configuration (e.g., `arbitrary_text` content, `format_boolean` yes/no values).

---

*This document is actively maintained as we discover more about Bubble's internal JSON structure.*
