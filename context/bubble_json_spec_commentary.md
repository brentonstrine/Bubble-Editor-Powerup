# Bubble JSON Configuration & Grammar Commentary

This document is a companion to the type schema. It documents how Bubble's internal JSON structures work, why they're built the way they are, and the gotchas we've discovered through reverse-engineering.

---

## TextExpressions

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
- Conditional text fields, email bodies, text elements,etc.

### The Strict Interleaving Rule

Bubble enforces a rigid alternating pattern:

| Index | Type | Example |
|-------|------|---------|
| 0 | String literal | `"Hello "` |
| 1 | Expression node | `{ type: "CurrentUser", ... }` |
| 2 | String literal | `", you have "` |
| 3 | Expression node | `{ type: "Search", ... }` |
| 4 | String literal | `" items"` |

Due to the way Bubble builds expressions and the fact that they always start with an empty string, Arbitrary Texts will always follow this pattern (though it's possible a glitch or API edit may cause an exception):
**Even indices (0, 2, 4...)** are always string literals.
**Odd indices (1, 3, 5...)** are always expression chain objects.

However, Text Elements can have no TextExpression, a TextExpression containing only a single expression, a TextExpression containing only a single string, or a combination of strings and expressions, which means that Text Element TextExpressions may start with either an expression object or a string literal, but will always alternate between the two.

## TextExpression: The Unified Theory of Sequential Components

### The Universal Architecture
A `TextExpression` is a sequentially indexed list of components. While adjacent indices could categorically be Objects, the rules of text and expression node insertion/deletion within the Bubble Editor UI always prevent adjacent items from being of the same type.

- **String Literals**: Represent static text.
- **Expression Objects**: Represent dynamic AST nodes (e.g., `{ "type": "CurrentUser", ... }`).
- **Empty Expression Node**: `{ "type": "Empty" }` represents an empty expression.

### Context-Specific Initialization
- **Text Elements**: Can start "cold" with a single Expression Node `{"0": {Expr}}`. Clicking to the left/right of this sole expression *prepends* or *appends* a text node, allowing expressions to be inserted following the "Split" logic. If a Text Element has no content, the `TextExpression` property may be omitted entirely from the JSON.
- **Arbitrary Text**: Always initialized with an empty Text Node `{"0": ""}`. (Which, due to splitting logic, means an Arbitrary Text will _always_ start and end with a text node.)

### The Rule of Mutations (UI Behavior)
The "Strict Interleaving" pattern seen in most Bubble JSON is not a schema constraint, but a result of two fundamental operations:

#### 1. The Split (Insertion)
Inserting an expression into a field is strictly an operation on a Text Node. The targeted string is severed at the cursor position, creating a left string and a right string with the new expression in the middle.
- **Mutation**: `[Text]` ➔ `[Text, Expression, Text]`
- **Effect**: This ensures that every newly inserted Expression is automatically "sandwiched" by text nodes, preventing adjacent expressions.

**Note**: A Text Element which has no content and no TextExpression property is an edge case. Because the TextExpression does not exist, there is no "Split" or "Insert" operation possible. This isn't an operation to insert an Expression node into an existing TextExpression, but rather an operation to create a new TextExpression containing a single Expression node.  

#### 2. The Merge (Deletion)
When an Expression Node is deleted, the Bubble Editor performs limited automatic garbage collection. It takes the text node to the immediate left and the text node to the immediate right and collapses them into a single string. However, it does not "trim delete" empty text nodes. The garbage collection's purpose is to ensure that text nodes are never adjacent: it does not try to prevent emtpy dangling text nodes at the beginning or end of the TextExpression.
- **Mutation**: `[Text_A, Expression, Text_B]` ➔ `[Merged_Text_AB]`
- **Effect**: This prevents adjacent text nodes from ever accumulating.

### Summary of Index Patterns
Because of these rules, you will almost always see the following index-to-type mapping in mature expressions:
- **Even Indices (0, 2, 4...)**: String Literals.
- **Odd Indices (1, 3, 5...)**: Expression Objects.

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
