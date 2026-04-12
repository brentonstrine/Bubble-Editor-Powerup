# Bubble Rosetta Stone: Human Labels to Internal JSON Keys

This document serves as the definitive mapping between the human-readable labels seen in the Bubble Editor's expression composer and the underlying internal JSON keys used in the `%p3` and `%ed` trees.

---

## 1. Core Component Mapping

| Human Label | Internal Key | Category | Notes |
|:---|:---|:---|:---|
| `'s unique id` | `_id` | Property | |
| `'s Slug` | `Slug` | Property | |
| `'s Creation Date` | `Created Date` | Property | |
| `'s Modified Date` | `Modified Date` | Property | |
| `:uppercase` | `to_uppercase` | Operator | |
| `:lowercase` | `to_lowercase` | Operator | |
| `:capitalized words` | `to_capitalized_words` | Operator | |
| `:first item` | `first_element` | List Operator | |
| `:item #` | `specific_item` | List Operator | |
| `:number of characters` | `length` | Operator | |
| `:converted to number` | `convert_to_number` | Operator | |
| `:converted to list` | `convert_to_list` | Operator | |
| `:count` | `count` | List Operator | Returns `Number` |
| `is logged in` | `logged_in` | Boolean | Returns `Boolean` |
| `is logged out` | `not_logged_in` | Boolean | Returns `Boolean` |
| `uses password` | `uses_pw` | Yes/No | Returns `Yes/No` |
| `'s email confirmed` | `email_confirmed` | Yes/No | Returns `Yes/No` |
| `is empty` | `is_empty` | Boolean | Returns `Boolean` |
| `is not empty` | `is_not_empty` | Boolean | Returns `Boolean` |
| `is` | `equals` | Comparison | Returns `Boolean` |
| `is not` | `not_equals` | Comparison | Returns `Boolean` |
| `'s devices` | `devices` | Property | |
| `can have the slug value` | `slug_can_be` | Comparison | |
| `cannot have the slug value` | `slug_cannot_be` | Comparison | |

---

## 2. Structural Insights

### Boolean vs. Yes/No Comparison
Bubble maintains a strict distinction between "Booleans" (usually internal states) and "Yes/No" (database types).

*   **Boolean Type** (`logged_in`, `is_empty`): 
    *   **Available Chaining:** `and`, `or`, `:formatted as text`, `:formatted as number`.
*   **Yes/No Type** (`uses_pw`, `email_confirmed`): 
    *   **Available Chaining:** `is yes`, `is no`, `is not`, `:formatted as text`, `:formatted as number`, `:formatted as JSON-safe`.

### Custom Field Naming Convention
Internal keys for user-defined fields follow a strict pattern to prevent collisions with built-in properties.

| Field Type | Pattern | Example |
|:---|:---|:---|
| **Single Ref** | `{field_name}_custom_{type_name}` | `current_order_custom_order` |
| **List Ref** | `{field_name}_list_custom_{type_name}` | `bookmarks_list_custom_artwork` |

*Note: The internal key often contains the specific Bubble-generated ID for the custom type.*

### Comparison Chains and Literals
When a comparison operator like `equals` (`is`) or `not_equals` (`is not`) is used, the "options" captured by the analyzer often include **Literal Values** (e.g., `"4"`, `"1"`, or specific element names). 

This confirms that in the underlying JSON, Literals are not necessarily distinct "types" in the root of the next node, but are often seamlessly integrated into the arguments of the operator. In the Expression Composer UI, these should be rendered as "terminal" nodes that allow direct text input.

### The `'s link` Anomaly
Unlike most property accessors which use an `operatorKey`, the `'s link` property often returns a `datasourceKey: "Message"`. This indicates that Bubble treats "Link" as a starting point for a complex expression chain (similar to a Search or PageData) rather than a simple field lookup.

---

## 3. Datasource Roots

| Human Label | internal Key | Category |
|:---|:---|:---|
| `Current User` | `CurrentUser` | Root |
| `Get an element` | `GetElement` | Root |
| `Arbitrary text` | `ArbitraryText` | Root |
| `Do a search for` | `Search` | Root |
| `Get data from URL` | `PageData` | Root |
