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

## 3. Expression Root Types

These are the **starting points** for any expression chain. Each defines the initial context or data source.

| Root Type | Human Label | Key Properties | Notes |
|:---|:---|:---|:---|
| `CurrentUser` | Current User | — | The logged-in user |
| `ThisElement` | This [Element] | — | The element itself (e.g., "This Group's data") |
| `GetElement` | [Element Name] | `properties.element_id` | References another element by ID |
| `Search` | Do a search for | `properties.constraints`, `properties.type_to_find`, `properties.sort_field`, `properties.descending` | "Do a Search for" query |
| `PageData` | Current page... | `properties.name` | Page-level data (e.g., "Current Page Width") |
| `Breakpoint` | [Breakpoint Name] | `properties.breakpoint_id` | A responsive breakpoint reference |
| `OneOptionValue` | Get an option | `properties.option_set`, `properties.option_value` | A static Option Set value. Does NOT support chaining. |
| `OptionValue` | Get an option | `properties.option_set`, `properties.option_value` | An Option Set value that supports chaining (e.g., getting `.id0` from an option) |
| `PrimitiveLiteral` | (inline value) | `properties.value`, `properties.btype` (e.g., `sys.bool`) | A hardcoded literal value |
| `TextExpression` | (inline text) | `entries` (indexed dictionary of strings and/or expression objects) | Text content with dynamic insertions |
| `GetParamFromUrl` | Get data from page URL | `properties.parameter_name` (a TextExpression) | URL parameter accessor |
| `ElementParent` | Parent Group's... | — | Parent element's data source (shorthand). Used inside RG CELL groups to access "Current Cell's Thing". |
| `ArbitraryText` | Arbitrary text | — | A freeform text literal entry point |

---

## 4. Message Names (Method Chaining)

`Message` is the **universal chaining type**. Every operation that follows a root type (or another Message) is a `Message` node. Its `name` property defines the operation.

### Field Accessors
These are standard property lookups on a data record. Named after the internal field key:

| Example Name | What it accesses |
|:---|:---|
| `email` | User's email |
| `_id` | Unique ID of any record |
| `Slug` | Slug field |
| `Created Date` | Creation timestamp |
| `Modified Date` | Last-modified timestamp |
| `team_custom_team` | Field `team` of type `custom.team` (single ref) |
| `current_seat_custom_seat` | Field `current_seat` of type `custom.seat` (single ref) |
| `featuresets_list_custom_featureset` | Field `featuresets`, a list of type `custom.featureset` |

> **General Naming Rule:** `{fieldname}_custom_{typename}` for single refs; `{fieldname}_list_custom_{typename}` for list refs.

### Data Retrieval
| Name | Human Label |
|:---|:---|
| `get_group_data` | Gets a group element's data source |
| `get_list_data` | Gets a list element's data |

### Comparisons
These terminate a chain with a boolean result, or transition to an RHO argument slot.

| Name | Human Label |
|:---|:---|
| `equals` | is |
| `not_equals` | is not |
| `less_than` | < |
| `less_or_equal_than` | ≤ |
| `is_empty` | is empty |
| `is_not_empty` | is not empty |
| `contains` | contains |
| `not_contains` | doesn't contain |
| `logged_in` | is logged in |
| `not_logged_in` | is logged out |

### Boolean Logic
| Name | Human Label | Notes |
|:---|:---|:---|
| `and_` | and | Requires a boolean LHO (often preceded by `.is_true`). Takes a full expression as its `args`. |
| `or_` | or | Same pattern as `and_`. |

### Evaluators
| Name | Human Label |
|:---|:---|
| `is_true` | is true |
| `is_hovered` | is hovered |

### List Operations
| Name | Human Label |
|:---|:---|
| `merged_with` | merged with |
| `unique` | :unique elements |
| `sorted` | :sorted |
| `filtered` | :filtered |
| `count` | :count |
| `first_element` | :first item |
| `specific_item` | :item # |

### ID Accessors
| Name | Human Label | Notes |
|:---|:---|:---|
| `id0` | (unique id) | Specifically for unique IDs of records or options; used when chaining off `OptionValue` |
| `_id` | 's unique id | Standard unique ID property accessor on a record |
