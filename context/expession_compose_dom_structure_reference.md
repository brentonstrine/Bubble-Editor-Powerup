# Expression Composer — DOM Structure Reference

This document describes the different DOM states of a Bubble expression composer, as observed during development of the Expression Analyzer feature.

---

## Stable DOM Anchor

The overall hierarchy around a composer is:

```
div.editor.basic                          ← ✅ STABLE — survives expression edits
  └── div.composer.expression-composer.pinned-property-editor.draft-state
        └── div.nested.draft-state
              └── div.nested.draft-state
                    ├── (spots, parens, collapser...)
```

**`div.editor.basic` is the correct root to anchor `MutationObserver` instances.**

- Bubble rewrites everything *below* `.editor.basic` when an expression is modified — spots, nested divs, and captions are all rebuilt from scratch.
- `.editor.basic` itself persists for the lifetime of the open expression composer, regardless of which element type or context (element property, condition, workflow action, etc.) it appears in.
- When the user navigates to a *different* expression, `.editor.basic` is replaced entirely — but that is fine because we re-establish the observer on each dropdown open.
- With `pe_labs=true`, **multiple `.editor.basic` elements are visible simultaneously**. `target.closest('.editor.basic')` still resolves to the correct one because it returns the *nearest* ancestor, which is always the specific composer that fired the event.

---

## `pe_labs=true` vs Default: Nesting Structure

The `&pe_labs=true` URL flag enables a new editor mode where multiple expression composers are visible at once. It also adds an **extra `.nested.draft-state` level** to the DOM structure.

| | Default | pe_labs |
|---|---|---|
| Nesting depth | 2 × `.nested` | 3 × `.nested` |
| Outer Add location | Inside level-2 `.nested` | Direct child of level-1 `.nested` |
| LHO of outer Add | Previous `.spot` sibling | Last spot inside previous `.nested` sibling |

**Default structure (active expression):**
```
.editor.basic
  .composer
    .nested.draft-state            ← level 1
      .nested.draft-state          ← level 2
        .spot[datasource] .spot[op] ... .spot[opened-Add]
```

**pe_labs structure (active expression):**
```
.editor.basic.being-edited
  .composer
    .nested.draft-state            ← level 1
      .nested.draft-state          ← level 2
        .nested.draft-state        ← level 3 (NEW)
          .spot[datasource][depth=0]
          .spot[op1][depth=0]
          .spot[depth=1]           (argument literal)
        .spot[op2][depth=0]        ← outer expression spots (level 2)
        .spot[depth=1]             (outer argument)
      .spot[depth=0]               ← outer Add (level 1!) — previous sibling is .nested!
```

**Key implication:** When the outer `Add` spot is opened, its `parentElement` is level-1 `.nested`. Walking `:scope > .spot` finds nothing before it. We must also examine `:scope > .nested` previous siblings and dig into them to find the LHO.

### `being-edited` class

The active composer gains the `being-edited` class on `.editor.basic` (e.g. `editor basic fitContent complete being-edited`). This can be used to scope queries to the currently-active composer if needed.

---

## State 1: At Rest (No interaction)

When the user has not clicked into the expression, it renders as inline `<span>` elements — **not** `.spot` divs. No dropdowns are present.

```
.composer > div[style="display:inline"] > .nested > .nested
  ├── .❤️collapser
  ├── .parens.spot.parens-left          (structural, no data-*)
  ├── <span data-datasource-name="GetElement">     ← root datasource (first item)
  ├── <span data-operator-name="get_group_data">   ← operator
  ├── <span data-operator-name="...">              ← operator
  ├── <span data-operator-name="not_contains">     ← operator
  ├── <span data-datasource-name="PreviousStep">   ← last resolved item
  └── .parens.spot.parens-right         (structural, no data-*)
```

**Key:** In this state, items are `<span>` elements, not `.spot` divs.  
There are **no `.dropdown-container` elements** in the DOM.

---

## State 2: User Clicked an Existing Spot

Once the user clicks anywhere in the expression, Bubble converts the `<span>` elements into full `.spot` divs with `.dropdown-container` children. All spots become interactive even when not actively focused.

```
.nested > .nested
  ├── .parens.spot.parens-left
  ├── .spot[data-datasource-name="GetElement"][data-depth="0"]        ← root datasource
  │     └── .dropdown-container (closed)
  ├── .spot[data-operator-name="get_group_data"][data-depth="0"]
  │     └── .dropdown-container (closed)
  ├── .spot[data-operator-name="..."][data-depth="0"]
  ├── .spot[data-operator-name="not_contains"][data-depth="0"]
  ├── .spot[data-datasource-name="PreviousStep"][data-depth="1"]      ← OPENED SPOT ★
  │     └── .dropdown-container.opened
  │           ├── .dropdown-caption-container[aria-expanded="true"]
  │           │     └── input.autocomplete-input (Search)
  │           └── .dropdown-items-positioner
  │                 └── div[role="listbox"] .dropdown-items-container
  │                       └── (items grouped by section...)
  ├── .spot[data-depth="1"] (no data-operator/datasource)             ← "Add" button (inner)
  │     └── .dropdown-container > .dropdown-caption.add-button "Add"
  └── .parens.spot.parens-right
.spot[data-depth="0"] (no data-operator/datasource)                   ← "Add" button (outer)
      └── .dropdown-container > .dropdown-caption.add-button "Add"
```

**Key insight:**
- The **opened spot** (`[data-datasource-name="PreviousStep"]`) ALREADY HAS its `data-datasource-name` attribute set BEFORE the user makes a selection.
- When the user picks from the dropdown, Bubble **replaces** this spot's content — the `data-datasource-name` attribute changes (or `data-operator-name` is added).
- The LHO in this scenario is the `.spot` immediately to the LEFT — `[data-operator-name="not_contains"]`.

---

## State 3: User Clicked the Inner "Add" Button (depth=1)

When the user clicks the empty "Add" spot at the END of the inner expression bracket, a **new blank spot** opens — it has `data-depth` but NO `data-operator-name` or `data-datasource-name`.

```
  ...
  ├── .spot[data-datasource-name="PreviousStep"][data-depth="1"]      ← now CLOSED, resolved
  ├── .spot[data-depth="1"]                                           ← OPENED SPOT ★
  │     └── .dropdown-container.opened
  │           └── (dropdown with operators for this type)
  └── .parens.spot.parens-right
```

**Key insight:**
- The opened spot is **blank** (no data-* other than depth).
- After selection, it will gain `data-operator-name` or `data-datasource-name`.
- The LHO is `[data-datasource-name="PreviousStep"]` — the spot to the left inside the same bracket.

---

## State 4: User Clicked the Outer "Add" Button (depth=0)

When the user clicks the outer "Add" at the far right (outside the inner bracket), a **different blank spot** opens — `data-depth="0"`. The dropdown shows a different set of options — typically `and`/`or` operators and top-level formatters.

```
.nested > .nested
  ├── (all inner spots, closed)
  └── .parens.spot.parens-right   ← inner bracket closes
.spot[data-depth="0"]             ← OPENED SPOT ★ (outer)
      └── .dropdown-container.opened
            └── (dropdown: "and", "or", ":formatted as text", etc.)
```

**Key insight:**
- The LHO for this spot is the ENTIRE inner expression — effectively the comparison result (e.g., the `.not_contains` evaluation).
- This spot operates at `depth=0`, meaning it connects to the LEFT of the outermost bracket.
- The LHO is the last non-Add, non-parens spot at depth=0, which in this case would be `[data-operator-name="not_contains"]`.

---

## Why Phase 4 Initially Failed

### Problem 1: `activeContext` was never set
In v2.34.19, the delegated `mousedown` listener relied on `activeContext` being set, but the code **never assigned it** — `activeContext` was always `null`. The listener returned early every time.

### Problem 2: The opened spot is inside `.dropdown-items-positioner`, which is OUTSIDE `.composer`
Looking at State 3 and 4, the `.dropdown-items-positioner` **is a sibling of** `.composer` in the page layout (it gets positioned absolutely, sometimes outside the composer's bounding box in the DOM flow). This means `item.closest('.composer')` may return `null` for clicks on items, causing the delegated listener to bail out prematurely.

> **Fix:** Check if the `.dropdown-items-positioner` that contains the item is associated with a `.composer`, not whether the item itself is a descendant of `.composer`.

### Problem 3: The `.spot` reference may become stale
When Bubble resolves a selection on the `[data-datasource-name="PreviousStep"]` spot (State 2), it may **replace the entire spot element** rather than mutating attributes in-place, meaning our stored `spot` reference becomes a detached DOM node.

> **Fix:** Instead of reading `spot.dataset` after 100ms, we should identify the resolved spot by its position/index in the composer after the selection.

---

## Summary: Spot Identity Rules

| Scenario | Opened Spot Attributes | LHO |
|---|---|---|
| Click existing `PreviousStep` spot | `data-datasource-name="PreviousStep"` + `data-depth` | Previous `.spot` with real operator/datasource |
| Click inner "Add" | `data-depth="1"` only (no data-operator/datasource) | Previous resolved `.spot` at depth=1 |
| Click outer "Add" | `data-depth="0"` only (no data-operator/datasource) | Last resolved `.spot` at depth=0 |

---

## Empirical Findings: The Expression Graph Schema

This section documents what we've learned from live observation of `CL_ExpressionGraph` being built in localStorage.

### LHO Key Format

The graph is keyed by the Left-Hand Operand:

| LHO type | Key format | Example |
|---|---|---|
| Operator (`:operator_name`) | `op:operatorName` | `op:round`, `op:change_years` |
| Datasource | `ds:datasourceName` | `ds:CurrentUser`, `ds:GetElement` |
| Root (no LHO) | `null` (not stored) | blank expression start |

The `operatorKey` and `datasourceKey` come from the `.spot` element's `data-operator-name` and `data-datasource-name` attributes respectively.

### RHO Selection Types

When a user selects an item from the dropdown, there are several distinct categories:

#### 1. Standard Operators
The dropdown item maps to a new `.spot[data-operator-name]` in the DOM.

- **Examples:** `change_seconds`, `change_minutes`, `plus_seconds`, `round`, `get_group_data`
- **Phase 4.5 result:** `operatorKey: "change_seconds", datasourceKey: null`
- **Detected via:** count-diff of `.spot[data-operator-name]` attributes after 300ms

#### 2. Standard Datasources
The dropdown item maps to a new `.spot[data-datasource-name]` in the DOM.

- **Examples:** `CurrentUser`, `GetElement` (a specific page element), `PageData` (page-level data)
- **Phase 4.5 result:** `operatorKey: null, datasourceKey: "CurrentUser"`
- **Note:** `GetElement` is a GENERIC key — multiple different page elements all share this datasource key. The specific element is visible in the LHO's `captionText` (e.g. `"Button Up"`, `"Group B"`) but the internal key is always `GetElement`.

#### 3. Property Access (field selectors)
Labels starting with `'s` represent accessing a field/property of the LHO type.

- **Examples:** `'s width`, `'s number`, `'s height`, `'s email`, `'s date`
- **Phase 4.5 result:** should give an `operatorKey` like `get_width`, `get_group_data`, `email`, etc.
- **Note:** The apostrophe is Bubble's notation — it means "property of" the previous item (like `'s email` = `.email`).

#### 4. Literal Values
Items that represent typed/selected literal values (numbers, text strings).

- **Examples:** `"2"`, `"3"`, `"hello"` — labels include the surrounding quotes in the UI
- **Phase 4.5 result:** ℹ️ no spot key found — Bubble renders literals as `<span class="dynamic literal">`, NOT as `.spot[data-operator-name]` elements
- **Consequence:** Literal selections cannot be enriched with internal keys via our diff approach. The Phase 2.5 label-only record is the best we can get.

#### 5. Slidable-Spot Operators (popover-based configuration)
Labels ending with `...` are NOT standard operators — they are **slidable-spot operators** that open a popover dialog for sub-property configuration rather than resolving directly from the dropdown.

**DOM signature (after selection):**
```html
<div class="spot property-editor-control optional slidable-spot slidable-owner"
     data-prop-name="next"
     data-datasource-name="Message"
     data-trigger-for="properties">
  :extract minute
</div>
```

Key attributes:
- `slidable-spot slidable-owner` — identifies this as a popover-configured operator
- `data-trigger-for="properties"` — marks that clicking opens a property popover
- `data-datasource-name="Message"` — Bubble's **internal type name** for this operator class (NOT a reference to a page element named "Message")
- Text content = the human-readable resolved value (e.g., `:extract minute`, `:extract...` when unset)

**Before and after configuration:**
- Unset: `:extract...` — `data-datasource-name="Message"` is present but the popover Component field is empty
- Set: `:extract minute` — same spot, same `data-datasource-name="Message"`, but the sub-property is saved

**Known slidable-spot operators and their internal keys:**

| UI label | Internal `datasourceKey` | Popover title |
|---|---|---|
| `:extract...` / `:extract minute` | `Message` | "Extract from date" |
| `:rounded down to...` | `Message` | (TBD — likely same key) |
| `:formatted as text` | `Message` | (slidable-spot, confirmed in `op:greater_than` graph) |
| `:formatted as...` | (TBD) | "Format date" |

**Phase 4.5 behavior:** Our count-diff correctly detects the `|Message` spot addition and records `ds:Message` as the internal key — this IS correct and accurate, NOT a false positive.

**`ds:Message` is a first-class LHO:** After a slidable-spot operator resolves, the resulting `ds:Message` output is itself a valid LHO. The next dropdown opens with LHO=`ds:Message` and exposes the FULL set of valid follow-on operators (date arithmetic, text formatting, comparisons, etc.). This means the expression graph must include `ds:Message` as a real key, not just an intermediate step.

Example observed:
```
Click ":rounded down to..." on ds:PageData
→ Phase 4.5: creates ds:Message spot (slidable-spot)
→ Next dropdown opens: LHO={ds:Message} with 28 options
→ Graph: ds:Message → [":uppercase", ":lowercase", "+ seconds:", ">", "<", ...]
```

**Popover DOM:** The configuration popover is appended to `<body>` as a `[data-popper-positioner]` div with `role="dialog"`. It does NOT re-trigger Phase 2 (our observer only watches `.dropdown-container.opened`, not popovers).

---

### Count-Diff Limitation: Same-Type Replacements

The Phase 4.5 snapshot-diff approach detects when a spot key **count increases**. It cannot detect **replacements** where the count stays the same.

**Example:** Replacing `:extract minute` with `:rounded down to...`
- Before: `{..., '|Message' => 1}`
- After: `{..., '|Message' => 1}` ← count unchanged
- Result: Phase 4.5 ℹ️ "No new spot key found" — the replacement is invisible to the diff

This is an inherent limitation of counting by key. The expression DID change, but because both operators use `ds:Message` internally, our diff sees no net change.

**When this occurs:** Clicking any slidable-spot operator when the expression already contains another slidable-spot spot of the same type (e.g., swapping `:extract...` for `:rounded down to...`).

**Impact on graph quality:** The LHO is still correctly mapped via Phase 2.5 (labels captured at open time). Only Phase 4.5 enrichment (proving `label → internal key`) is missed for the replacement case.

---

### Destination Type Propagation (Context-Aware Narrowing)

Bubble's expression composer is sophisticated: it knows the **required output type of the destination** (e.g., "this Group expects a Date") and performs **backward type propagation** — only showing options that could ultimately resolve to that type.

**Observed example:** Editing the data source of a Group with data type `Date`:
```
ds:PageData → op:greater_than → [only 6 options: and, or, :formatted as text, :formatted as number, is in, is not in]
```

This is NOT because `>` returns a boolean. It's because Bubble knows the chain must end in a `Date`, and only these 6 options could plausibly lead to a Date through further chaining (e.g., `:formatted as text` could later be parsed back to a date, conditional logic via `and/or` could route to a date value, etc.). All the date arithmetic, property access, and datasource options disappear because they wouldn't make sense in this type path.

**Implication for our graph:** The `lho → validOptions` mapping is **destination-type-dependent**. For `op:greater_than`, we might observe:
- 6 options in a Date-destination context
- Different options in a Number-destination context
- Still different options in a Text-destination context

Our current approach records the **union** of all options observed across all contexts. This is intentional — we are building an observational explorer, not a type validator.

**Decision: Do NOT attempt to replicate type propagation.** Doing so would require:
1. Knowing the destination type at every expression
2. Modeling all of Bubble's type transformation rules
3. Running backward type inference across arbitrary expression chains

This is infeasible from the DOM alone. The graph we build is a "what was valid when we were here" record — useful for exploration and highlighting, but not a strict type checker. Users should understand options may vary by context.

---

### Root Datasource Spot Has No LHO

The **first spot** in an expression (the root datasource, e.g., `ds:PageData`, `ds:CurrentUser`) has nothing to its left. `getLHO()` correctly returns `{error: 'No LHO spot found before opened dropdown'}` in this case.

This is **expected behavior** — `lhoKey()` returns `null` for error objects, so `recordAvailableOptions()` skips storing anything. The root spot click is not a meaningful edge in the expression graph because it represents the start of a chain, not a connection between two nodes.

**Observed pattern:** Every time the user clicks the root datasource spot (to change which datasource starts the expression), Phase 3 emits the error and no record is written. ✅ Correct.


#### 6. UI Placeholders / Phantom Labels
Bubble sometimes inserts placeholder text that isn't a real selectable option.

- **Examples:** `No results found` (shown when search has no matches), `(Clear selection)`
- **Handling:** `No results found` is now filtered out at Phase 2.5. `(Clear selection)` is stored but has no operator key (correct — it clears the slot).

### Known Data Quality Issues

| Issue | Status | Cause |
|---|---|---|
| Old entries showing `datasourceKey: "PageData"` for everything | Fixed in v2.34.26 | MutationObserver caught pre-existing `PageData` spot being re-rendered before new spot was set; replaced with count-diff snapshot approach |
| `ds:GetElement` shows specific element in `captionText` but generic key | By design | `GetElement` IS the internal Bubble key for all element references; specificity lives in caption only |
| `ds:Message` appearing for `:extract...` | **Confirmed correct** | `Message` is Bubble's internal type name for the slidable-spot extract operator. The spot uses `data-datasource-name="Message"` regardless of which component (minute/hour/etc.) is selected. Sub-properties are stored in the popover, not as additional spots. |
| Literal values produce no operator key | Expected behavior | Literals are `<span class="literal">`, not `.spot[data-*]` elements |
| `"No results found"` stored in graph | Fixed in v2.34.27 | Now filtered at Phase 2.5 label scraping |
