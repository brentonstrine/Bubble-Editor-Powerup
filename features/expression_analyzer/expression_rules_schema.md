# Bubble Expression Rules Schema

This document maps the structural rules required to emulate Bubble's expression composer. It defines the explicit **Types**, **Arguments**, and **Return Types** for each operator.

## Schema Definition
To build a composer, every operator requires a schema. We map these using the following conceptual structure:

```typescript
interface OperatorRule {
  operator: string;
  contextType: string;        // The type on the LHS (e.g., "Text", "Number", "Any")
  contextIsList: boolean;     // Whether the LHS is a list
  arguments: Array<{
    type: string;             // The required type for the RHS parameter
    isList: boolean;          // Whether the argument expects a list
    required: boolean;        // Whether the argument is optional
  }>;
  returnType: string;         // What type this expression evaluates to out
  returnIsList: boolean;      // Whether it outputs a single item or a list
  unknowns?: string[];        // Info we are missing and need to verify
}
```

---

## 1. Shared Operators
These operators can apply to any generic type `T`.

| Operator | Context Type | List? | Arguments | Return Type | Return List? | Unknowns/Missing |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| `is` | `T` | `false` | `[ { type: T, isList: false } ]` | `Boolean` | `false` | Bubble mentions type coercion/matching. What happens if LHS is Text and RHS is Number? |
| `is not` | `T` | `false` | `[ { type: T, isList: false } ]` | `Boolean` | `false` | |
| `<>` | `T` | `false` | `[ { type: T, isList: false } ]` | `Boolean` | `false` | Only used in search constraints. Need to structure when it is allowed in the UI. |
| `is empty` | `T` | `false` | *None* | `Boolean` | `false` | |
| `is not empty` | `T` | `false` | *None* | `Boolean` | `false` | |
| `:formatted as JSON-safe` | `Text/Date/Boolean` | `Both`| *None* | `Text` | `false` | If applied to a List, does it return a single Text block stringified, or a List of JSON-safe Texts? (Doc implies a single string, needs verification). |

---

## 2. Text Type
Actions where the LHS is `Text`.

| Operator | Context Type | List? | Arguments | Return Type | Return List? | Unknowns/Missing |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| `is in` | `Text` | `false` | `[ { type: "Text", isList: true } ]` | `Boolean` | `false` | |
| `is not in` | `Text` | `false` | `[ { type: "Text", isList: true } ]` | `Boolean` | `false` | |
| `contains` | `Text` | `false` | `[ { type: "Text", isList: false } ]` | `Boolean` | `false` | |
| `doesn't contain` | `Text` | `false` | `[ { type: "Text", isList: false } ]` | `Boolean` | `false` | |
| `contains keyword(s)` | `Text` | `false` | `[ { type: "Text", isList: false } ]` | `Boolean` | `false` | |
| `:capitalized words` | `Text` | `false` | *None* | `Text` | `false` | |
| `:uppercase` | `Text` | `false` | *None* | `Text` | `false` | |
| `:lowercase` | `Text` | `false` | *None* | `Text` | `false` | |
| `:append` | `Text` | `false` | `[ { type: "Text", isList: false } ]` | `Text` | `false` | |
| `:formatted as ...` | `Text` | `false` | `[ { type: "Enum Formats", isList: false } ]` | `Text` | `false` | What are the exact string enums for formats? |
| `:trimmed` | `Text` | `false` | *None* | `Text` | `false` | |
| `:number of characters` | `Text` | `false` | *None* | `Number` | `false` | |
| `:truncated to` | `Text` | `false` | `[ { type: "Number", isList: false } ]` | `Text` | `false` | |
| `:extract...` | `Text` | `false` | `[ { type: "Enum Extract", isList: false } ]` | `Text` | `false` | The doc doesn't list all extract targets. We need to find what you can extract (e.g. domain name, URL, etc). |
| `:converted to number` | `Text` | `false` | *None* | `Number` | `false` | |
| `:split by...` | `Text` | `false` | `[ { type: "Text", isList: false } ]` | `Text` | `true` | Requires standard separator. Can separator be a dynamic text expression? |
| `:find/replace...` | `Text` | `false` | `[ { type: "Text", isList: false }, { type: "Text", isList: false } ]` | `Text` | `false` | Can this use regex dynamically? UI usually opens a sub-window for args. |
| `:extract with Regex` | `Text` | `false` | `[ { type: "Text", isList: false } ]` | `Text` | `true` | The argument is a regex string. Does the argument support dynamic composition? |
| `:defaulting to` | `Text` | `false` | `[ { type: "Text", isList: false } ]` | `Text` | `false` | |

---

## 3. Number Type

| Operator | Context Type | List? | Arguments | Return Type | Return List? | Unknowns/Missing |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| `> / >= / < / <=` | `Number` | `false` | `[ { type: "Number", isList: false } ]` | `Boolean` | `false` | |
| `+ / - / * / /` | `Number` | `false` | `[ { type: "Number", isList: false } ]` | `Number` | `false` | |
| `:formatted as ...` | `Number` | `false` | `[ { type: "Enum", isList: false } ]` | `Text` | `false` | Exact enum configurations for formatting numbers are not present. |
| `:rounded to`| `Number` | `false` | `[ { type: "Number", isList: false } ]` | `Number` | `false` | |
| `:floor / :ceiling`| `Number` | `false` | *None* | `Number` | `false` | |
| `^`| `Number` | `false` | `[ { type: "Number", isList: false } ]` | `Number` | `false` | |
| `<- range ->`| `Number` | `false` | `[ { type: "Number", isList: false } ]` | `Number Range`| `false` | Missing: we need to document "Number Range" type capabilities formally. |
| `<- modulo ->`| `Number` | `false` | `[ { type: "Number", isList: false } ]` | `Number` | `false` | |

---

## 4. Date Type

| Operator | Context Type | List? | Arguments | Return Type | Return List? | Unknowns/Missing |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| `:formatted as ...` | `Date` | `false` | `[ { type: "Enum", isList: false } ]` | `Text` | `false` | Exact configurations missing. |
| `+(seconds/minutes/etc)` | `Date` | `false` | `[ { type: "Number", isList: false } ]` | `Date` | `false` | The specific unit modifier functions (`+(seconds):`, `+(days):`) effectively require Number RHS. |
| `change <unit> to` | `Date` | `false` | `[ { type: "Number", isList: false } ]` | `Date` | `false` | |
| `> / <` | `Date` | `false` | `[ { type: "Date", isList: false } ]` | `Boolean` | `false` | |
| `-` | `Date` | `false` | `[ { type: "Date", isList: false } ]` | `Date Interval`| `false` | Creates Date interval wrapper. |
| `Extract from date` | `Date` | `false` | `[ { type: "Enum Component", isList: false } ]` | `Number` | `false` | Missing: Can we specify an argument timezone? |
| `Rounded down` | `Date` | `false` | `[ { type: "Enum Component", isList: false } ]` | `Date` | `false` | |

---

## 5. List of Things
These rules are the most critical because they control mapping mappings (`Map/Reduce` operations). `T` represents the Type of the items in the List (e.g. `List[Text]`, `List[Date]`).

| Operator | Context Type | List? | Arguments | Return Type | Return List? | Unknowns/Missing |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| `:count` | `T` | `true` | *None* | `Number` | `false` | |
| `contains` | `T` | `true` | `[ { type: T, isList: false } ]` | `Boolean` | `false` | RHS type must perfectly match the List's underlying items `T`. |
| `:first item / :last item / :random item` | `T` | `true` | *None* | `T` | `false` | These collapse the chain from a List to a Single Item. |
| `:item #` | `T` | `true` | `[ { type: "Number", isList: false } ]` | `T` | `false` | Collapses list. |
| `:items until # / :items from #` | `T` | `true` | `[ { type: "Number", isList: false } ]` | `T` | `true` | Returns a list of `T`. |
| `contains list` | `T` | `true` | `[ { type: T, isList: true } ]` | `Boolean` | `false` | |
| `join with` | `T` | `true` | `[ { type: "Text", isList: false } ]` | `Text` | `false` | Converts list to a single concatenated `Text`. |
| `:sum / :product / :average` | `Number` | `true` | *None* | `Number` | `false` | Math aggregations only available if `T` = `Number`. |
| `:filtered` | `T` | `true` | *Takes constraint blocks* | `T` | `true` | The RHS isn't an expression, it's a constraint builder. How is the filter block represented in the schema? |
| `merged with / intersect with` | `T` | `true` | `[ { type: T, isList: true } ]` | `T` | `true` | Both operands must be `List[T]`. |
| `:unique elements` | `T` | `true` | *None* | `T` | `true` | |
| `:plus item / :minus item` | `T` | `true` | `[ { type: T, isList: false } ]` | `T` | `true` | |
| `:minus list` | `T` | `true` | `[ { type: T, isList: true } ]` | `T` | `true` | |
| `:each item's [Field]` | `Any Custom` | `true`| `[ { type: "Field", isList: false } ]` | `typeof Field` | `true` | The document specifically lacks exactly how field extraction logic is mapped (the implied `:each item...` loop). If I have a List of Users, and do `:each item's Email`, it returns a List of Texts. |

## 6. What information is still missing from our core set?

1. **Enum definitions:**
   We don't know the exhaustive options for dropdowns like `:formatted as ...` enum variations natively built into Bubble, `:extracted from text`, and `Date components`.
2. **Sub-Expression Rules:**
   Things like `:filtered` and `:sorted` take custom objects (constraint builders, sort builders). A standalone expression composer needs to define those structures.
3. **Property/Field Extraction (`'s X`)**:
    We need strict rules on extracting `Things`' fields. e.g., How the UI evaluates that `User` has `Email (Text)`. This requires an application's database schema as input to the composer. Bubble automatically populates `'s` properties by inspecting data types.
4. **App Data Sources (State)**
    This document focuses on *Operators*. The expression root (the LHS context starter) is missing (e.g. `Current User`, `Search for...`, `Input's value`).

---
*(End of Initial Mapping)*
