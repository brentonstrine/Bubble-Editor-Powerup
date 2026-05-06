# Bubble.io Data Model -- Comprehensive Reference

---

## 1. Data Types and Fields

### Overview

Bubble's database is built on PostgreSQL (hosted on AWS). You define **data types** (analogous to tables) and populate them with **fields** (analogous to columns). Every data type automatically gets four built-in fields:

- **Unique ID** -- a 32-character alphanumeric string, auto-generated, immutable
- **Created Date** -- timestamp of record creation
- **Modified Date** -- timestamp of last modification
- **Slug** -- a URL-friendly identifier (not auto-populated; must be set explicitly)

### Built-in Field Types

Bubble provides 10 field types:

| Field Type | Description | Key Notes |
|---|---|---|
| **Text** | Arbitrary string | Use for phone numbers and zip codes (preserves leading zeros). Indexed only on first 256 characters for search matching. |
| **Number** | Integer or decimal | Two sub-modes: integer (no decimals) and decimal. Do not store phone numbers as numbers. |
| **Date** | Single date/time | Format mm/dd/yyyy or European dd.mm.yyyy. Stored with timezone awareness. |
| **Date Range** | Start date + end date in one field | Useful for reservations, scheduling, availability windows. Supports overlap/containment searches. Limited arithmetic (can only do arithmetic on start date, not end date). |
| **Yes/No** | Boolean true/false | **Critical distinction:** "no" and "empty/no value" are different states. Sorting by this field will separate the three states (yes, no, empty). |
| **File** | Link to an uploaded file | Stored as a URL pointing to Bubble's file storage. |
| **Image** | Link to an uploaded image | Similar to File but specifically for images. |
| **Geographic Address** | Address with lat/long | Send as a string (e.g., "33 Nassau Avenue, Brooklyn, NY 11222"). Bubble uses Google Maps API to geocode it. Enables geographic radius searches. |
| **Number Range** | Start number + end number | Similar concept to Date Range but for numeric values. |
| **Custom Data Type** | Reference to another data type | This is how relationships are created. The field stores a pointer to a record of the referenced type. |

### Lists

Any field type can be toggled to store a **list** of values instead of a single value by checking "This field is a list (multiple entries)."

- **Hard limit:** 10,000 items per list field per record
- Attempting to add beyond 10,000 items produces an error
- The limit is per-field-per-record (e.g., each User's "Favorites" list independently caps at 10,000)

### Custom Data Types

Every custom data type you create becomes available as a field type on other data types. This is the primary mechanism for creating relationships between records.

**Example:** Create a "Company" data type, then add a field called "Employer" of type "Company" on the "User" data type. Each User record can now reference a Company record.

### Pitfall: Field Count

There is no hard limit on field count per data type, but adding many fields increases the download size of each record and slows performance. Keep data types lean -- split large types into logical segments connected by relationships.

---

## 2. Relationships

### How Relationships Work

Relationships in Bubble are simply fields whose type is another data type. There are no foreign keys, join tables, or SQL-style syntax to manage. You add a field, pick a data type as its type, and Bubble handles the reference.

A field can hold either a **single reference** or a **list of references** (by checking the "list" checkbox).

### One-to-One (1:1)

One record of Type A links to exactly one record of Type B.

**Implementation:** Add a field on one side (or both) referencing the other type. Leave it as a single (non-list) field.

**Example:** User has one Profile. Add a "Profile" field (type: Profile) on User, or a "User" field (type: User) on Profile, or both.

### One-to-Many (1:N)

One record of Type A relates to many records of Type B.

**Best practice -- put the reference on the "many" side:**

- Each Task gets a "Project" field (type: Project)
- To find all tasks for a project: "Do a search for Tasks where Project = [this project]"

**Optional reverse list:** You can also store a list of Tasks on the Project. Only do this if:
- The list will remain small (under ~100 items)
- You access it frequently and want faster retrieval

**Do NOT store the reverse list when:**
- The list could grow large (messages, log entries, transactions)
- You rarely need to enumerate the full list

### Many-to-Many (M:N)

Two approaches:

**Approach A -- List Fields (small datasets):**
- Add a "Tags" list field (type: Tag) on the Post data type
- Optionally add a "Posts" list field (type: Post) on the Tag data type
- Best for relationships where both sides stay under ~100 items

**Approach B -- Junction Table (scalable):**
- Create a new data type (e.g., "PostTag") with two single fields: "Post" (type: Post) and "Tag" (type: Tag)
- To find all tags for a post: "Do a search for PostTags where Post = [this post]", then extract the Tag field
- Best when either side could grow large, or when the relationship carries metadata (date added, added by, status, etc.)

### Decision Matrix

| Scenario | Approach |
|---|---|
| List stays under 30 items, accessed frequently | List field |
| List stays under 100 items, no relationship metadata needed | List field (with caution) |
| List could exceed 100 items | Junction table |
| Relationship needs its own data (date, status, role) | Junction table |
| Features like likes, follows, bookmarks | Junction table (always) |

### Common Pitfall: Bidirectional Lists

If you maintain list fields on both sides of a relationship, you must keep them in sync yourself. When you add Tag X to Post Y's tag list, you must also add Post Y to Tag X's post list. Forgetting one side leads to data inconsistency. A junction table avoids this problem entirely.

---

## 3. Privacy Rules

### Conceptual Model

Privacy rules control which users can view, search for, and modify records. Think of them as **allowlists** -- every rule you add *grants* access in a specific scenario. By default, without any privacy rules defined on a data type, all data is accessible to everyone (including unauthenticated users).

### Structure of a Privacy Rule

Each privacy rule on a data type has:

1. **A condition** -- when this condition is true, the permissions below apply (e.g., "Current User is this Thing's Creator", "Current User's Role is Admin")
2. **Permissions granted:**
   - **Find this in searches** -- whether "Do a search for" returns matching records
   - **View all fields** -- whether all fields are readable (can be toggled per-field)
   - **Allow auto-binding** -- whether auto-bound inputs can modify fields on this record
3. **An "Everyone else" rule** -- a catch-all for users who don't match any other rule's condition

### Field-Level Visibility

When you uncheck "View all fields," you can individually select which fields are visible. Fields that are not checked will return empty/null to the client -- they are never sent from the server.

**Important:** Data that reaches the client is no longer secure. Even if a field's value is not displayed in the UI, if it was sent to the browser, a user can find it in network traffic. Privacy rules prevent data from being sent at all.

### Search Restrictions ("Find this in searches")

- Unchecking this box prevents records from appearing in "Do a search for" results for users matching that rule
- Records can still be accessed by direct reference (e.g., navigating to a page with the record's unique ID in the URL, or accessing it through a list field on another record)
- This is a critical distinction: "Find this in searches" only applies to the "Do a search for" data source, not to all data retrieval methods

### Auto-Binding Rules

Auto-binding lets input elements write directly to database fields without a workflow. Privacy rules govern this:

- If "Allow auto-binding" is checked for a rule, users matching that rule's condition can modify fields via auto-bound inputs
- The condition must be true BOTH before and after the modification
- Auto-binding is actually more secure than workflows for data modification because privacy rules enforce it server-side
- "Make changes to a thing" workflow actions bypass auto-binding restrictions entirely -- they are not governed by the auto-binding permission

### Data API Privacy

Privacy rules have separate checkboxes for API access:
- Whether clients can retrieve records via the Data API
- Whether clients can retrieve files via the Data API
- Whether clients can modify records via the Data API
- These are disabled by default and do not affect regular app users or API Workflows

### Best Practices

1. **Start closed.** Set "Everyone else" to have no access. Then add specific rules granting access.
2. **Every data type should have privacy rules** before going to production.
3. **Protect workflows separately.** Privacy rules do not protect workflow actions. Use "Only when" conditions on actions/workflows to restrict execution.
4. **Do not rely on hiding UI elements for security.** A disabled input or hidden group is client-side only. Users can bypass it. Server-side privacy rules are the only real protection.
5. **Be aware of the Unique ID exposure:** If someone has a record's unique ID, they can attempt to reference it directly. Privacy rules on field visibility prevent them from reading fields, but the existence of the record is confirmed.

### Privacy Rules and Performance

Privacy rules are applied server-side before search results are returned. This means:

- They act as implicit search constraints, reducing the number of records the server processes
- Well-designed privacy rules can actually improve performance by reducing result sets
- Overly complex conditions (many nested lookups) on privacy rules can degrade performance
- Field-level restrictions reduce payload size, improving transfer speed

---

## 4. Option Sets

### What They Are

Option sets are **static, predefined lists** of values defined in the Bubble editor. They are similar to enums in programming. Examples: days of the week, user roles, order statuses, countries, categories.

### How They Differ from Data Types

| Aspect | Option Sets | Data Types |
|---|---|---|
| **Nature** | Static, editor-defined | Dynamic, runtime-created |
| **Editing** | Only in the Bubble editor | Created/modified by users and workflows at runtime |
| **Storage** | Part of app source code (JavaScript) | In the PostgreSQL database |
| **Loading** | Downloaded once with the page, cached client-side | Requires server-side database queries |
| **Performance** | Very fast (no DB lookup, client-side filtering) | Slower (server round-trip) |
| **Privacy** | None. All option sets are public plain text in the browser. | Protected by privacy rules |
| **Deployment** | Changes require a new deployment to take effect | Changes are live immediately |
| **Size** | Should remain small (dozens to low hundreds) | Can scale to millions of records |

### Attributes on Option Sets

Each option in a set has:
- **Display** -- a built-in text attribute (the option's label)
- **Custom attributes** -- you can add attributes of any type (text, number, yes/no, image, another option set, etc.)

**Example:** A "US State" option set might have attributes: Display ("California"), Abbreviation ("CA"), Tax Rate (7.25), Region (option set: "US Region").

Option sets can reference other option sets in their attributes, enabling hierarchical static data (e.g., Cities linking to States).

### When to Use Option Sets

- Dropdown/radio button choices that rarely change
- User roles, permission levels
- Status values (Draft, Published, Archived)
- Categories, tags (if the list is small and fixed)
- Navigation menus and app configuration

### When NOT to Use Option Sets

- User-generated content
- Data that needs privacy/security controls
- Sensitive information (option sets are publicly visible in browser source)
- Large datasets (hundreds or thousands of entries)
- Data that changes frequently without redeployment

### Common Pitfall

Because option sets are baked into the app's JavaScript bundle, adding too many options (or options with large attributes like lengthy text or many images) increases the initial page load size for every user.

---

## 5. Data API

### Overview

Bubble exposes two APIs:

1. **Data API** -- CRUD operations on database records (GET, POST, PATCH, DELETE)
2. **Workflow API** -- triggers server-side API workflows (POST or GET)

The Data API must be explicitly enabled in Settings > API.

### Authentication

- Requires an API token (found in Settings > API)
- Token is sent as a `Bearer` token in the Authorization header
- Different tokens for development and live environments

### GET -- Retrieving Records

**Endpoint:** `GET /api/1.1/obj/{typename}`

**Parameters (query string):**

| Parameter | Description |
|---|---|
| `constraints` | JSON array of constraint objects |
| `sort_field` | Field name to sort by |
| `descending` | true/false for sort direction |
| `additional_sort_fields` | Array of {sort_field, descending} for multi-field sorting |
| `limit` | Number of records per page (default varies) |
| `cursor` | Pagination offset (0-indexed) |

**Hard limit:** Maximum 50,000 records retrievable per GET request (10,000,000 on Enterprise). If cursor exceeds 50,000, no results return.

**Get by ID:** `GET /api/1.1/obj/{typename}/{unique_id}` returns a single record.

### Constraint Operators

| constraint_type | Applies To | Description |
|---|---|---|
| `equals` | All fields | Exact match |
| `not equal` | All fields | Not exact match |
| `greater than` | Numbers, dates | Greater than value |
| `less than` | Numbers, dates | Less than value |
| `is_empty` | All fields | Field has no value |
| `is_not_empty` | All fields | Field has a value |
| `text contains` | Text fields | Substring match (respects word stems, not arbitrary substrings) |
| `not text contains` | Text fields | Does not contain substring |
| `in` | All fields | Value is in provided list |
| `not in` | All fields | Value is not in provided list |
| `contains` | List fields | List contains the specified entry |
| `not contains` | List fields | List does not contain the entry |
| `empty` | List fields | List has no items |
| `not empty` | List fields | List has items |
| `geographic_search` | Geographic address | Within radius of a central point |

**Constraint format example:**
```json
[
  {"key": "status", "constraint_type": "equals", "value": "active"},
  {"key": "age", "constraint_type": "greater than", "value": "18"}
]
```

### POST -- Creating Records

**Single record:** `POST /api/1.1/obj/{typename}` with JSON body of field key-value pairs.

**Bulk creation:** `POST /api/1.1/obj/{typename}/bulk` with one JSON object per line (NDJSON format). Maximum 1,000 records per bulk request.

### PATCH -- Modifying Records

**Endpoint:** `PATCH /api/1.1/obj/{typename}/{unique_id}` with JSON body of fields to update.

Requires "Modify via API" to be enabled in the data type's privacy settings.

### DELETE -- Removing Records

**Endpoint:** `DELETE /api/1.1/obj/{typename}/{unique_id}`

### Data API and Privacy Rules

The Data API has its own privacy rule checkboxes, separate from regular app privacy:
- "Allow access via the Data API" for read operations
- "Allow modification via the Data API" for write operations
- Both are disabled by default on all privacy rules

### Workflow API

Triggers backend API workflows. Default method is POST.

- Parameters can be in the body (POST) or querystring (GET)
- Authentication levels: None, User & Admin, or Admin only
- Used for webhooks, scheduled operations, and exposing custom endpoints

### Common Pitfalls

- `text contains` does not do arbitrary substring matching; it matches word stems. "cat" will not match "concatenate"
- Geographic search requires a specific value format with address and range
- The 50,000 cursor limit means you cannot paginate through very large datasets via the Data API alone
- Date values must be sent in ISO format
- Querying built-in fields (like `email` on User) sometimes requires special key names

---

## 6. Performance Considerations

### When Searches Get Slow

**1. Large result sets:** A search returning 100 records loads faster than one returning 1,000,000. Always constrain searches.

**2. Client-side filtering (Advanced Filters):** The `:filtered` operator downloads ALL matching records to the browser, then filters locally. This is drastically slower than server-side constraints for large datasets.

**3. Nested searches (N+1 problem):** A repeating group where each cell performs its own "Do a search for" triggers a separate database query per row. With 50 rows, that is 50 queries instead of 1.

**4. Chained searches:** Using one search result as the constraint of another search runs them in series. The second search waits for the first to complete.

**5. Large list fields:** Accessing a list field with thousands of entries downloads all of them. Filtering a large list is client-side.

**6. Too many fields on a data type:** Every field adds to the download payload for each record, even if not displayed.

### How Privacy Rules Affect Performance

**Positive:** Privacy rules act as server-side pre-filters. If a rule prevents 90% of records from being visible to the current user, searches automatically scan fewer records.

**Negative:** Complex conditions on privacy rules (involving lookups to other data types, nested expressions) add processing overhead to every search.

**Best practice:** Keep privacy rule conditions simple. Reference fields directly on the current record or the current user, rather than doing nested lookups.

### Database Structure Best Practices

1. **Flatten where possible.** Avoid deep nesting that requires multiple sequential lookups.
2. **Split large data types.** If a type has 50+ fields but most views only need 5-10, split it into a core type and extension types.
3. **Use Option Sets for static data.** They load with the page and require zero database queries.
4. **Prefer server-side constraints over `:filtered`.** If a constraint can go in the search box, put it there -- not in an advanced filter.
5. **Paginate.** Show 10-20 items at a time. Use infinite scroll or pagination buttons.
6. **Cache with custom states.** Perform a search once on page load, store the result in a custom state, and reference that state throughout the page instead of repeating the search.
7. **Pre-compute aggregations.** If you frequently display counts or sums, calculate them in a workflow and store the result, rather than computing on every page load.
8. **Limit fields via privacy rules.** Turn off visibility for fields that the current page does not need. This shrinks the payload.

### List Field vs. Search Performance

| Scenario | Faster Approach |
|---|---|
| Under ~30 items, frequently accessed | List field |
| 30-100 items | Either (test both) |
| Over 100 items | "Do a search for" |
| Over 1,000 items | "Do a search for" (significantly faster) |
| Needs server-side filtering/sorting | "Do a search for" |

---

## 7. Unique IDs and Slug Fields

### Unique ID

- 32-character alphanumeric string
- Auto-generated on record creation
- Immutable -- cannot be changed
- Used internally to reference records
- Appears in URLs when navigating to a page with a content type (e.g., `/product/1596308125537x153766304138575070`)
- In "Do a search for," Unique ID only supports the `=` operator (no "not equal" or other comparisons)

### Slug Field

- Built-in field on every data type (like Unique ID), but NOT auto-populated
- Must be set explicitly via workflow action "Set a thing's slug" or when creating/modifying a record
- Replaces the Unique ID in URLs for human-readable, SEO-friendly paths

**Format rules:**
- Lowercase letters, numbers, and hyphens only
- Maximum 250 characters
- No uppercase, no special characters, no spaces

**Uniqueness:**
- Must be unique within the same data type
- Two different data types can have records with the same slug
- If you try to create a duplicate slug within a type, Bubble appends `-1`, `-2`, etc.
- Use the `Can Have The Slug Value` operator to validate before setting

### Best Practices for Slugs

1. **Always set a slug** for records that appear in URLs
2. **Use descriptive keywords** for SEO (e.g., `iphone-15-pro` not `product-12345`)
3. **Keep slugs short and stable** -- changing slugs breaks existing links and hurts SEO
4. **Validate before saving** -- check uniqueness and format with a workflow condition
5. **Privacy rule interaction:** If the slug field is hidden by a privacy rule, users see the Unique ID in the URL instead. Make sure slug visibility is enabled for the appropriate rules.

---

## 8. "Do a Search For" -- How It Works

### Basics

"Do a search for" is the primary data source for fetching records. You specify:
1. The **data type** to search
2. One or more **constraints** (field conditions)
3. Optional **sorting** (field + ascending/descending)

Results are returned as a list of records matching ALL constraints (AND logic).

### Constraints

- Each constraint specifies a field, an operator, and a value
- Multiple constraints are combined with AND (all must be true)
- There is no native OR logic in constraints -- to achieve OR, you must do multiple searches and merge results, or use advanced filtering

**Available operators (in-editor):**
- `=`, `<>` (not equal), `>`, `<`, `>=`, `<=`
- `contains` (for list fields)
- `doesn't contain` (for list fields)
- `is empty`, `is not empty`
- `is in` (value is in a provided list)
- `isn't in` (value is not in a provided list)

### "Ignore empty constraints" Checkbox

- **Checked (default):** If a constraint's value is empty/null, that constraint is skipped, and the search returns all records matching the remaining constraints
- **Unchecked:** If a constraint's value is empty/null, the search returns records where that field is also empty/null
- This is critical for dynamic search forms where some fields may be left blank

### Sorting

- Set at search time: pick a field and direction (ascending/descending)
- Default sort is by creation date (ascending)
- For post-search sorting, use the `:sorted` operator (but this is client-side if applied after the search)

### Filtering (`:filtered` and `:each item`)

- The `:filtered` operator applies an additional filter AFTER the initial search
- **Advanced filters are client-side** -- all records from the initial search are downloaded, then filtered in the browser
- Use `:filtered` only when you cannot express the condition as a search constraint
- Simple (non-dynamic) filter conditions may be merged into the server query by Bubble's optimizer

### Pagination

- Repeating groups have a "Number of items to display" setting
- **Full list:** loads all items (bad for large datasets)
- **Fixed number of cells:** loads a set number, supports pagination buttons
- **Infinite scroll / "load more":** loads items as the user scrolls
- A known issue exists where pagination with "Do a search for" can produce duplicate entries when records are created/modified between page loads (due to offset-based pagination)

### Text Search Limitation

Text matching in search constraints is indexed only on the **first 256 characters** of a text field. To match text beyond 256 characters, use `:filtered` with an advanced constraint (at the cost of client-side processing).

### Real-Time Sync

Element data sources using "Do a search for" are synchronized with the database in real time. Changes made by other users appear immediately without page refresh.

---

## 9. "Make Changes to a List of Things" vs. "Make Changes to a Thing"

### "Make Changes to a Thing"

- Modifies a **single** record
- You specify which record and what field values to set
- Straightforward and reliable for single-record updates

### "Make Changes to a List of Things"

- Applies the **same set of changes** to every record in a list
- The list is defined by a search result or an existing list field
- All records receive identical modifications (you cannot set different values per record)
- **Not a loop** -- it does not process records one by one. You cannot reference "this item" to set dynamic per-item values.

**Limitations:**
- Best for a few hundred records maximum
- Can time out on lower-tier plans after ~10 records
- For lists of 100+ items, or for dynamic per-item changes, use a **recursive API workflow** instead
- Consumes workload immediately when the action runs, even if subsequent steps don't use the result

### When You Need Per-Item Logic

Since "Make changes to a list of things" applies the same changes to all items, you cannot do things like "set each item's index to its position in the list." For per-item operations, use:

1. **Backend API workflow** scheduled on a list (processes each item individually)
2. **Recursive workflow** that pops items off a list one at a time

### Key Differences Summary

| Aspect | Make Changes to a Thing | Make Changes to a List |
|---|---|---|
| **Scope** | Single record | Multiple records |
| **Changes** | Any field values | Same changes to all records |
| **Per-item logic** | Yes (it is one item) | No |
| **Scale** | Any single record | Best under ~200 records |
| **Timeout risk** | Very low | Increases with list size |

---

## 10. "Copy a List of Things" Behavior

### What It Does

"Copy a list of things" duplicates a set of records. You specify:
1. The data type
2. The source list (search result or existing list field)

Bubble creates new records of the same type, copying over all field values.

### Shallow Copy Only

This action performs a **shallow copy**:

- All scalar fields (text, number, date, yes/no) are duplicated
- Fields referencing other records (custom data type fields) copy the **reference** -- NOT the referenced record itself
- List fields copy the list of references -- the referenced records are NOT duplicated

**Example:** If you copy a list of "Orders" and each Order has a "Customer" field pointing to a Customer record, the copied Orders will still point to the **original** Customer records. No new Customer records are created.

### No Deep Copy

There is no built-in deep copy. To copy a record and all its related records recursively, you must build multi-step workflows:

1. Copy the parent records
2. For each copied parent, copy its child records
3. Update the copied children to reference the copied parent (not the original)

This can get complex for deeply nested structures (e.g., Quote -> Quote Locations -> Quote Products).

### Performance

- Copying even small lists (7-15 items) can take ~30 seconds
- "Copy a list of things" should only be used for short lists
- For large-scale copying, use backend API workflows

### Modifying Copies

A common pattern is to copy a list and then immediately modify the copies:

1. Step 1: "Copy a list of things" (result = the new records)
2. Step 2: "Make changes to a list of things" targeting "Result of step 1" -- set the new parent reference or any modified fields

### Common Pitfall

Because copy is shallow, developers building "template" features (e.g., copying a project template with all its tasks and subtasks) often discover that the tasks in the copied project still reference the original project's subtasks. Each level of nesting requires its own copy-and-relink step.

---

## Sources

### Official Bubble Documentation
- [Data types and fields](https://manual.bubble.io/help-guides/data/the-database/data-types-and-fields)
- [Database structure](https://manual.bubble.io/help-guides/getting-started/building-your-first-app/database-structure)
- [Data (things) actions](https://manual.bubble.io/core-resources/actions/data-things)
- [Privacy rules](https://manual.bubble.io/core-resources/data/privacy)
- [Protecting data with privacy rules](https://manual.bubble.io/help-guides/data/the-database/protecting-data-with-privacy-rules)
- [Option sets](https://manual.bubble.io/help-guides/data/static-data/option-sets)
- [Data API requests](https://manual.bubble.io/core-resources/api/the-bubble-api/the-data-api/data-api-requests)
- [The Data API](https://manual.bubble.io/core-resources/api/the-bubble-api/the-data-api)
- [Workflow API](https://manual.bubble.io/core-resources/api/the-bubble-api/the-workflow-api)
- [Search](https://manual.bubble.io/core-resources/data/search)
- [Operators and comparisons](https://manual.bubble.io/core-resources/data/operations-and-comparisons)
- [Performance and scaling](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling)
- [Hard limits](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling/hard-limits)
- [Optimization checklist](https://manual.bubble.io/help-guides/workload/optimizing-workload/optimization-checklist)
- [Searches optimization](https://manual.bubble.io/help-guides/workload/optimizing-workload/optimization-checklist/searches)
- [Page slugs](https://manual.bubble.io/help-guides/logic/navigation/page-slugs)
- [SEO page](https://manual.bubble.io/help-guides/maintaining-an-application/seo/seo-page)
- [Finding data](https://manual.bubble.io/help-guides/data/the-database/finding-data)
- [Bulk operations](https://manual.bubble.io/help-guides/maintaining-an-application/database-maintenance/bulk-operations)
- [Input forms](https://manual.bubble.io/core-resources/elements/input-forms)

### Community and Third-Party Guides
- [Airdev: Structure the database](https://docs.airdev.co/bubble-development-guide/steps/plan/database-structure)
- [Airdev: Optimize for speed](https://docs.airdev.co/bubble-development-guide/steps/develop/optimize-speed)
- [Amlie Solutions: Understanding data type fields](https://www.amliesolutions.com/bubble/basic-features/understanding-bubbles-data-type-fields/)
- [Amlie Solutions: Privacy rules](https://www.amliesolutions.com/bubble/basic-features/bubble-privacy-rules/)
- [Amlie Solutions: Option sets guide](https://www.amliesolutions.com/bubble/basic-features/option-sets/)
- [Amlie Solutions: Using the slug field](https://www.amliesolutions.com/bubble/basic-features/using-slug-field-in-bubble/)
- [NoCodeAssistant: Option sets](https://www.nocodeassistant.com/how-to-use-option-sets-to-speed-up-your-app-development/)
- [NoCodeAssistant: List vs searches](https://nocodeassistant.com/list-or-searches-which-is-faster-in-bubble/)
- [NoCodeAssistant: Auto-binding](https://nocodeassistant.com/auto-binding-and-its-use/)
- [NoCodeAssistant: SEO-friendly URLs](https://nocodeassistant.com/unique-and-seo-friendly-url-in-bubble/)
- [Sidetool: Effective database structuring](https://www.sidetool.co/post/effective-database-structuring-in-bubble-io-beginner-s-guide/)
- [Bubble Forum: Join table vs list field for M:N](https://forum.bubble.io/t/join-table-or-list-field-for-many-to-many-relationship/73718)
- [Bubble Forum: Copy a list of things and relationships](https://forum.bubble.io/t/how-do-i-copy-a-list-of-things-as-well-as-their-relationships/104915)
- [Bubble Forum: Lists vs Relations](https://forum.bubble.io/t/lists-vs-relations/276126)
