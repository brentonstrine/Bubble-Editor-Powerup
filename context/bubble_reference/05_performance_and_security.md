# Bubble.io Best Practices: Performance, Security, Debugging, and Deployment

A comprehensive reference guide synthesized from Bubble's official documentation, Airdev's optimization guides, and experienced community practitioners.

---

## Table of Contents

1. [Performance](#1-performance)
   - [How Searches Work Under the Hood](#11-how-searches-work-under-the-hood)
   - [What Makes Searches Slow](#12-what-makes-searches-slow)
   - [Data Structure for Performance](#13-data-structure-for-performance)
   - [When to Denormalize](#14-when-to-denormalize)
   - [Repeating Group Performance](#15-repeating-group-performance)
   - [Page Load Optimization](#16-page-load-optimization)
   - [Backend Workflow Performance](#17-backend-workflow-performance)
   - [Workload Units (WU)](#18-workload-units-wu)
   - [The :count Optimization](#19-the-count-optimization)
   - [Privacy Rules and Performance](#110-privacy-rules-and-performance)
2. [Security](#2-security)
   - [Privacy Rules as Primary Security](#21-privacy-rules-as-primary-security)
   - [Common Privacy Rule Mistakes](#22-common-privacy-rule-mistakes)
   - [Securing API Workflows](#23-securing-api-workflows)
   - [App-Level vs Page-Level Security](#24-app-level-vs-page-level-security)
   - [Role-Based Access Control](#25-role-based-access-control)
   - [Preventing Unauthorized Data Modification](#26-preventing-unauthorized-data-modification)
   - [Auto-Binding Security Risks](#27-auto-binding-security-risks)
   - [Secure File Handling](#28-secure-file-handling)
3. [Debugging](#3-debugging)
   - [Server Logs](#31-server-logs)
   - [Debugging Slow Pages](#32-debugging-slow-pages)
   - [Identifying Infinite Loops](#33-identifying-infinite-loops)
   - [Common Error Patterns](#34-common-error-patterns)
4. [Deployment](#4-deployment)
   - [Development vs Live](#41-development-vs-live)
   - [Safe Deployment Practices](#42-safe-deployment-practices)
   - [Database Migration](#43-database-migration)

---

## 1. Performance

### 1.1 How Searches Work Under the Hood

Bubble's database runs on PostgreSQL (abstracted behind Bubble's visual interface). When you use `Do a search for`, the behavior differs based on how you write the expression:

**Server-side searches (constraints):** When you add constraints directly inside `Do a search for`, these are translated into SQL WHERE clauses and executed on the server. The server returns only the matching records. This is fast because filtering happens before data leaves the database.

**Client-side filtering (`:filtered`, `:advanced`):** When you chain `:filtered` or use Advanced filters after a search, Bubble first retrieves the larger result set from the server, downloads it to the user's browser, and then applies the filter in JavaScript on the client. This is dramatically slower because:

- The full (pre-filter) dataset must be transmitted over the network
- The browser must iterate through every record to apply the filter
- WU consumption increases because the server had to fetch and serialize a larger dataset

**The rule:** Always push filtering into search constraints (server-side). Only use `:filtered` when the filtering logic genuinely cannot be expressed as a constraint.

**How Bubble handles identical searches:** If multiple elements on a page perform the exact same `Do a search for` with identical constraints, Bubble recognizes this and performs the search only once, reusing the result. This is an automatic optimization you get for free.

**Privacy rules execute before your constraints:** Every search is first filtered by applicable privacy rules on the server side. If a user lacks search access to certain records, those records are excluded before your constraints are even evaluated.

### 1.2 What Makes Searches Slow

**Too many constraints on unindexed fields:** While constraints are server-side (good), having many constraints on fields that are not commonly queried can slow things down. Bubble does not expose manual index management, but structuring data types to have direct fields (rather than requiring joins) helps.

**Nested searches:** A nested search is when a search constraint itself contains another `Do a search for`. For example: `Do a search for Messages (constraint: Thread is in Do a search for Threads (constraint: Project = X))`. Bubble must first execute the inner search (find all Threads for project X), then use that result set as a constraint for the outer search. If the inner search returns 200 threads, the outer search becomes an `IN` query with 200 values. This compounds workload. Flatten your data model to avoid this pattern -- for instance, store a direct `Project` field on Message.

**Advanced filters on large datasets:** Using `:filtered (Advanced: ...)` on a search that returns 1,000 results can trigger up to 1,001 database operations (the original search plus one evaluation per record), because the advanced filter may need to look up related data for each item.

**`:filtered` with dynamic constraints:** When the filter condition references another data type's field (e.g., `This Product's Creator's Company's Name contains "X"`), Bubble must traverse multiple relationships for every item in the list, multiplying queries.

**Searches inside repeating group cells:** If a repeating group shows 50 rows and each cell contains its own `Do a search for`, that is 50 separate database queries executed on page load. This is the classic N+1 query problem.

**List operations on large lists:** Operations like `:intersect with`, `:minus list`, `:merged with` on large lists (hundreds of items) are client-side operations that can be slow. Lists stored as fields on a data type should generally stay under 100 items for good performance.

**Unstructured text searches:** Searching through large text fields (blog post bodies, descriptions) consumes more WU than searching structured fields (numbers, dates, booleans, option sets).

### 1.3 Data Structure for Performance

**Think of database design as 70% of the optimization work.** When people say "Bubble is slow," there is roughly a 90% probability the real cause is polling information the wrong way or storing it in the wrong format.

**Core principles:**

1. **Use direct fields instead of requiring joins.** If you frequently need to display a Message's Project name, store the Project (or even just the project name as a text field) directly on the Message, rather than going Message -> Thread -> Project -> Name.

2. **Use Option Sets for static/semi-static data.** Option Sets load once when the app loads and are cached client-side. They do not trigger database queries. Use them for statuses, categories, roles, types, countries, and any enumerated values. This is one of the most underused performance tools in Bubble.

3. **Choose efficient field types.** Boolean (yes/no) fields are the lightest. Number fields are more efficient for calculations than text. Dates are more efficient for date comparisons than text representations of dates.

4. **Keep list fields small.** A list of Things stored on a record should ideally contain fewer than 20-30 items for optimal performance. If a list might grow beyond that, use a separate data type with a reference back (a "join table" pattern).

5. **Avoid deep nesting in your data model.** Every level of relationship traversal (Thing -> Related Thing -> Its Related Thing) requires additional server work. Keep your model as flat as practical.

6. **Separate frequently-accessed fields from rarely-accessed ones.** If your User data type has 50 fields but most pages only need 5, consider splitting into User (core fields) and UserProfile (extended fields). Bubble loads all fields of a data type when it fetches a record.

### 1.4 When to Denormalize

Denormalization means intentionally storing redundant data to avoid expensive lookups at read time.

**Denormalize when:**
- Data is read frequently but the source data changes infrequently (e.g., storing an author's display name on each blog Post)
- You need to display aggregated values in lists (e.g., storing `order_count` on a Customer instead of doing `Search for Orders:count` in every repeating group cell)
- Search constraints require data from a related type (e.g., storing `Project Name` directly on Task so you can constrain `Search for Tasks where Project Name = X` without a nested search)
- You are showing computed values in repeating groups (e.g., storing `total_price` on an Order rather than summing line items each time)

**Keep normalized when:**
- The source data changes frequently (e.g., a user's "last seen" timestamp -- storing this on every related record would require constant updates)
- Data integrity is more important than read speed
- The redundant data would be very large (e.g., duplicating entire text blocks)

**Maintaining denormalized data:** When the source of truth changes, you must update all copies. Do this via backend workflows triggered by database changes. For example, if a User changes their display name, a database trigger workflow updates the `author_name` field on all their Posts.

### 1.5 Repeating Group Performance

**Pagination types and their behavior:**

- **Full List:** Loads the entire dataset. Avoid for any list that could grow beyond ~50 items. The browser must render all items and hold them in memory.
- **Fixed number of cells:** Shows a set number of rows. Good for pagination. Bubble fetches only enough data to fill the visible cells plus a small buffer.
- **Ext. vertical scroll (infinite scroll):** Fetches data in chunks as the user scrolls. Good for feeds and long lists. Bubble lazy-loads data for cells as they come into view.

**Server-side pagination pattern:**
Instead of relying on Bubble's built-in pagination alone, you can implement true server-side pagination:

1. Create a hidden group to store `current_page_number` (custom state, type number)
2. Use `items_per_page` as a constant (e.g., 20)
3. Set the repeating group's data source to: `Do a search for [Type]:items until (current_page * items_per_page):items from ((current_page - 1) * items_per_page + 1)`
4. Use `:count` on a separate, constrained search to get total count for page navigation (see section 1.9)

**Key rule:** The `:items until #` operator should come BEFORE `:items from #` in the expression chain. This is Bubble's recommended ordering for performance.

**Avoid searches inside cells:** Never place a `Do a search for` expression inside a repeating group cell. Instead:
- Pre-load the related data into the initial search
- Denormalize key fields onto the parent data type
- Use a single search with broader constraints, cached in a custom state, and reference it from cells

### 1.6 Page Load Optimization

**What happens on page load:**

1. Bubble loads the page HTML/CSS framework
2. All visible elements' data sources begin evaluating
3. Any `Page is loaded` workflow events fire
4. Searches, repeating groups, aggregations, and dynamic expressions all execute
5. Privacy rules are evaluated server-side for every data fetch

Everything that happens on page load happens on EVERY page visit or refresh, so this is where optimization has the highest leverage.

**Optimization strategies:**

1. **Reduce element count.** The number of visual elements on a page is the single biggest factor in page load speed. Every element adds to the DOM and initial rendering cost. Consolidate where possible. Remove unused elements.

2. **Defer non-critical data.** Use hidden groups and popups for content that does not need to display immediately. Bubble does not evaluate data sources for invisible elements (if configured properly with conditions). Place secondary content in groups that only become visible on user action.

3. **Load above-the-fold first.** Prioritize loading content visible without scrolling. Defer everything below the fold.

4. **Be careful with "Page is loaded" events.** This event fires every time the page loads AND every time `Go to page` is used on the same page to update parameters. Add conditions to prevent redundant execution.

5. **Defer image loading.** Images are typically the slowest-loading asset. Use the pattern of loading images after `Page is loaded (entire)` is true, allowing text content to render first and reducing bounce rate.

6. **Consolidate identical searches.** If multiple elements on the same page need the same data, do the search once (e.g., in a hidden group's data source or a custom state set on page load) and reference it from other elements.

7. **Minimize conditionals on elements.** Bubble evaluates all conditional expressions on visible elements, even if the conditions evaluate to false. Complex conditions with searches in them will execute those searches.

8. **Use server-side redirects.** If a page needs to redirect users (e.g., unauthenticated users to a login page), do this server-side rather than loading the full page and then redirecting.

### 1.7 Backend Workflow Performance

**Three approaches for processing lists, in order of preference:**

| Approach | Best For | WU Efficiency | Speed |
|---|---|---|---|
| `Make changes to a list of things` | Small lists (under ~50 items) | Most efficient | Fastest |
| `Schedule API workflow on a list` | Medium lists (50-500 items) | Efficient (one scheduling operation) | Fast (parallel) |
| Recursive workflows | Very large lists (500+) or complex conditional logic | Least efficient (re-schedules each iteration) | Slowest (sequential) |

**Recursive workflow best practices:**

- **Always set a termination condition.** Without one, the workflow runs forever (until recursion protection kicks in).
- **Use Bubble's infinite recursion protection.** Set a depth limit appropriate to your use case. Default is 10 for new apps. Set it to 2x your expected maximum chain length.
- **Add a delay between iterations.** Schedule the next iteration 1-2 seconds in the future to avoid overwhelming the server.
- **Batch items.** Instead of processing one item per iteration, process 50-100 items per iteration to reduce scheduling overhead.
- **Pass the list as a parameter.** Avoid re-searching for the list on each iteration. Pass the remaining items as a parameter to the next run.
- **Consolidate actions.** One `Make changes to a Thing` updating 12 fields is faster than 12 separate single-field updates.

**Database trigger workflows:**

- Add conditions to prevent triggers from firing excessively (e.g., only trigger when a specific field actually changed)
- Avoid complex queries with advanced filters or nested searches inside triggers
- Combine multiple trigger scenarios into single events when the logic allows

### 1.8 Workload Units (WU)

**What consumes WU:**

| Operation | WU Impact | Notes |
|---|---|---|
| `Do a search for` | Medium-High | Depends on result count and field count |
| `Do a search for:count` | Low | Server-side aggregation, no records transferred |
| `Make changes to a Thing` | Low per thing | Single operation |
| `Make changes to a list` | Medium | More efficient than individual changes |
| `Schedule API workflow` | Low (scheduling) + cost of workflow | Each scheduled workflow incurs its own WU |
| `Schedule API workflow on a list` | Medium (one scheduling op) | More efficient than recursive scheduling |
| Advanced filter / `:filtered` | High | Downloads larger dataset, filters client-side |
| Nested search | Very High | Multiplies queries |
| Page load | Varies | Depends on number of searches and data loaded |
| Auto-binding | Low per change, high in aggregate | Every keystroke or change = database write |
| API calls (outgoing) | Medium | Depends on data volume |
| File uploads | Low-Medium | Depends on file size |
| Client-side operations | Zero | Custom states, show/hide, client-side math |

**Three lenses for WU optimization (from Bubble's official framework):**

1. **Complexity:** Can you simplify the operation? Fewer constraints, simpler expressions, less nesting.
2. **Volume:** How much data is the server returning? Constrain searches tightly. Return fewer fields where possible.
3. **Repetition:** How often does this operation run? A search that runs on every page load for every user adds up fast. Cache results when possible.

**Top WU reduction strategies:**

- Replace auto-binding with explicit save buttons (one write instead of many)
- Use custom states for temporary data instead of database records
- Cache frequently-accessed search results in custom states
- Avoid searches inside repeating group cells
- Use Option Sets instead of database lookups for static data
- Use `:count` instead of loading full lists when you only need the count
- Move heavy computation to backend workflows (runs once, stores result) rather than computing in repeating groups (runs per user, per page load)
- Use conditions to prevent searches from running on invisible elements

### 1.9 The :count Optimization

`Do a search for [Type]:count` is a server-side aggregation operation. It does NOT load any records to the client. The server executes a SQL COUNT query and returns a single number.

In contrast, `Do a search for [Type]` followed by `:count` on the client loads the entire result set and then counts it in the browser.

**Where to use `:count`:**

- Displaying total counts (e.g., "47 results found")
- Pagination controls (calculating total pages)
- Conditional logic (e.g., "Only when Search:count > 0")
- Dashboard statistics

**Implementation tip for pagination:**
Create a repeating group with Fixed rows set to 0 and columns set to 0, give it the same search as your main repeating group, and reference its `:count`. Because the row count is 0, no actual data records are fetched -- only the count is retrieved from the server. This minimizes WU for the count operation.

### 1.10 Privacy Rules and Performance

Privacy rules are evaluated server-side on every data fetch. They function as an additional WHERE clause applied before your search constraints.

**Performance characteristics:**

- Privacy rules that use direct field comparisons (e.g., `This Thing's Creator is Current User`) are efficient -- they translate to simple SQL conditions
- Privacy rules that use multi-level expressions (e.g., `This Thing's Creator's Company's Admin is Current User`) require joins and are slower
- Privacy rules do NOT add overhead compared to equivalent search constraints -- they are effectively the same mechanism
- The "Everyone else" default rule runs for all users not matching other rules. A deny-all default is a security best practice and has no performance penalty

**"Ignore privacy rules" in backend workflows:**

- This checkbox removes the privacy rule evaluation for that specific workflow
- The performance benefit is marginal for simple privacy rules but can be meaningful for complex multi-level privacy rules
- Use it when a backend operation legitimately needs full data access (e.g., generating a report across all users)
- The operation runs entirely server-side -- users cannot observe it or access its intermediate data

**Critical note:** Privacy rules do not refresh automatically on a page if the user's access level changes during their session. A page refresh is required.

---

## 2. Security

### 2.1 Privacy Rules as Primary Security

**Bubble considers ALL data public unless restricted.** Privacy rules are the ONLY mechanism that prevents data from being sent to the user's browser.

Key facts:
- Privacy rules are enforced server-side. Restricted data never leaves the server.
- Bubble uses AES-256 encryption for data at rest.
- All data transmitted uses SSL/HTTPS.
- If data reaches the user's device, it is accessible regardless of whether your UI displays it. Users can inspect network traffic and find any data Bubble sent to the browser.
- Hiding a UI element does NOT secure the underlying data. The data is still sent to the browser -- it is just not rendered.

**The "Everyone else" rule:**

Every data type has an automatic "Everyone else" rule that applies to users who match no other privacy rule. This should be your deny-all default. Explicitly grant access through specific rules, not the default.

### 2.2 Common Privacy Rule Mistakes

1. **No privacy rules at all.** New data types in Bubble have no privacy rules by default. All data is accessible to all users including anonymous visitors. You must actively add rules to every data type that contains non-public data.

2. **Relying on UI hiding instead of privacy rules.** Conditional visibility (hiding an element when the user is not an admin) does NOT prevent data access. The data is still in the browser's network requests.

3. **Overly broad rules.** A rule like "When Current User is logged in, they can find this in searches" gives every logged-in user access to every record. Be specific: "When This Thing's Owner is Current User."

4. **Forgetting to restrict field-level access.** Even if a user can find a Thing in searches, you can restrict which fields they can see. Sensitive fields (email, phone, payment info) should have field-level restrictions.

5. **Not testing as different user types.** Developers typically test as admin users who have full access. Use Bubble's "Run as" feature to test the app as a regular user, a new user, and an anonymous user.

6. **Multi-level expression limitations.** Privacy rules that use expressions traversing multiple data types (e.g., `This Order's Customer's Account's Admin is Current User`) may not work for search access. Bubble cannot always optimize these into the search query. Restructure your data so that the field needed for the privacy check exists directly on the protected data type.

7. **Assuming privacy rules update in real-time.** If a user's access level changes while they are on a page (e.g., their role is updated), the privacy rule outcome does not refresh until the page is reloaded.

8. **Displaying detailed error messages.** Error messages like "User account not found" reveal system information. Use generic messages like "Invalid credentials."

### 2.3 Securing API Workflows

**Authentication requirement:** By default, API workflows in Bubble can be called by anyone. You must explicitly check "This workflow requires authentication" for any workflow that accesses or modifies sensitive data. Without this, anyone who discovers your workflow endpoint can trigger it.

**Three authentication levels for API workflows:**

1. **No authentication** (not recommended): Anyone can call the workflow. Only appropriate for truly public endpoints like webhooks from trusted services.
2. **Token-based authentication**: Requires a valid API token. Good for server-to-server communication.
3. **User-based authentication**: Requires a logged-in user session. Privacy rules apply based on that user's access level.

**Parameter validation:** Always validate incoming parameters in your API workflows. Do not assume the caller provides valid data. Use conditional checks at the beginning of the workflow to verify:
- Required parameters are present and non-empty
- Values are within expected ranges
- The authenticated user has permission to perform the requested action

**Privacy rules in API workflows:** When an API workflow runs with user authentication, that user's privacy rules apply. This means searches within the workflow may return fewer results than expected if the user lacks access. If the workflow needs full data access for a legitimate purpose, check "Ignore privacy rules when running the workflow" -- but only when the workflow's actions do not expose that data back to the calling user.

### 2.4 App-Level vs Page-Level Security

**App-level security:**
- Privacy rules on all data types
- API workflow authentication requirements
- Disabling the Data API if not needed
- Requiring HTTPS (enabled by default)
- Strong password policies and MFA

**Page-level security:**
- Page access rules (redirect unauthenticated users)
- Conditional visibility of elements based on user role
- Workflow "Only when" conditions that check user permissions

**Important:** Page-level security (redirects, hiding elements) is a UX convenience, not a security mechanism. A determined user can bypass page redirects by manipulating the URL. True security comes from privacy rules (data level) and workflow conditions (action level). Always implement both layers.

### 2.5 Role-Based Access Control

Bubble does not have a built-in RBAC system. You implement it yourself:

**Setup pattern:**

1. Add a `role` field to the User data type. Use an Option Set (e.g., "Admin", "Editor", "Viewer", "Member") rather than a text field for type safety and easier comparison.

2. Create privacy rules that reference the role:
   - "When Current User's role is Admin" -> full access
   - "When Current User's role is Editor" -> can find and edit own records
   - "When Current User's role is Viewer" -> can find but not edit

3. Add "Only when" conditions on sensitive workflows:
   - `Only when Current User's role is Admin` for admin actions
   - `Only when Current User's role is Editor or Current User is This Thing's Creator` for edit actions

4. For complex permissions (per-resource access), create a Permissions data type with fields for User, Resource, and Access Level. Check this in privacy rules and workflow conditions.

**Principle of least privilege:** Default to no access. Grant specific permissions only as needed for each role.

### 2.6 Preventing Unauthorized Data Modification

Three layers of defense:

1. **Privacy rules with write restrictions.** On each data type, specify which users can modify which fields. For example: "When Current User is This Thing's Owner: Allow modify field 'title', Allow modify field 'description'" but not 'status' or 'owner'.

2. **Workflow "Only when" conditions.** Every workflow that modifies data should have an "Only when" condition verifying the user's permission. Example: `Only when Current User is This Thing's Owner or Current User's role is Admin`.

3. **Backend workflow isolation.** For sensitive operations (changing user roles, deleting data, processing payments), use backend workflows. These run server-side and are not directly callable from the client unless exposed as API workflows with authentication.

### 2.7 Auto-Binding Security Risks

Auto-binding connects an input element directly to a database field. When the user changes the input value, the database updates immediately without any workflow.

**Security risks:**

1. **Bypasses workflow logic.** Auto-binding skips any validation, conditional checks, or side effects you would normally include in a save workflow. The data goes directly from input to database.

2. **Field-level exposure.** If auto-binding is enabled on a field, the user can modify that field directly. This includes fields you might not want them to change (e.g., price, role, status).

3. **No audit trail.** Because auto-binding bypasses workflows, there is no easy way to log who changed what or trigger side effects on change.

4. **WU accumulation.** Every change (every keystroke in a text input, every toggle of a checkbox) triggers a separate database write operation.

**Best practice:** Avoid auto-binding for any field containing sensitive data. Use explicit save buttons with workflows that include validation and permission checks. If you must use auto-binding for UX reasons (e.g., real-time profile editing), restrict it to non-sensitive fields and ensure privacy rules prevent unauthorized field modifications.

The documentation notes: "Allow auto-binding stops the user from making changes through auto-bound elements -- but it does NOT stop them from making those same changes in a workflow." This means auto-binding permissions are NOT a substitute for privacy rules.

### 2.8 Secure File Handling

**Default behavior:** Files uploaded to Bubble are stored on AWS S3 and are accessible via a direct URL. By default, anyone with the URL can access the file. This URL can be discovered by inspecting network traffic.

**Securing files:**

1. **Use privacy rules on the data type that references the file.** If the file URL field is restricted by privacy rules, the URL is not sent to unauthorized users' browsers.

2. **Enable "Make this file private" on file upload elements.** This generates signed URLs that expire, preventing permanent direct access.

3. **Validate file types on upload.** Restrict accepted file types to prevent users from uploading executable files or scripts.

4. **Do not store sensitive files as publicly accessible.** If a file contains sensitive data (ID documents, contracts), ensure the data type field containing the file URL has strict privacy rules.

5. **Be cautious with file URLs in API responses.** If your API returns file URLs, ensure the requesting user has permission to access those files.

---

## 3. Debugging

### 3.1 Server Logs

Server logs are accessed via the Logs tab in the Bubble editor. Development and Live environments maintain separate log records.

**What server logs contain:**
- Every server-side action (send email, change data, create thing, delete thing, API calls)
- The user who triggered the action (email and user ID, or "Anonymous user")
- Timestamps for each action
- Error messages and details
- Workflow execution chains (each action in a workflow generates a log entry)

**Filtering server logs:**
- By date range (start/end)
- By user email
- By text search ("Contains" field -- searches workflow labels)
- By category: workflow starts, action conditions, autobinding operations, email failures, HTTP requests/responses, plugin errors, scheduled task completions
- "Non-passed events" filter: shows workflows where the condition evaluated to false (useful for understanding why something did NOT happen)
- "Errors" filter: shows server-side errors (credit card failures, email failures, API errors)

**Key features:**
- "Zoom on this workflow" isolates a single workflow execution, showing all its steps in sequence
- Clicking a log entry opens the corresponding workflow in the editor
- For high-traffic apps, narrow your search with specific timeframes to avoid timeouts

**Tip:** Server logs are your primary tool for debugging issues reported by users after the fact. The real-time Debugger is better for active development.

### 3.2 Debugging Slow Pages

**Step-by-step diagnostic process:**

1. **Check element count.** Pages with hundreds of elements will be inherently slow. Consolidate, remove unused elements, or break into separate pages.

2. **Look for searches in repeating group cells.** Open each repeating group and check if any cell contains a `Do a search for`. Each instance multiplies queries by the number of visible rows.

3. **Check for advanced filters.** Search for uses of `:filtered` and `:advanced` in your expressions. Each one indicates a potential client-side filtering bottleneck.

4. **Examine "Page is loaded" workflows.** Check how many actions fire on page load and what data they query. Look for redundant searches or actions that could be deferred.

5. **Inspect conditional expressions.** Complex conditions on visible elements execute their searches even when the condition evaluates to false.

6. **Check for expensive element types.** Maps, calendars, and rich text editors are heavier than simple text and image elements.

7. **Use the browser's Network tab.** Look at Bubble's API calls (`/api/1.1/obj/...` and `/maggregate/...`). Large response payloads indicate over-fetching. Many small requests indicate N+1 problems.

8. **Check the WU analytics dashboard.** Drill down into specific pages and operations to identify which searches consume the most WU.

### 3.3 Identifying Infinite Loops

**Symptoms of infinite recursion:**
- Unexpectedly high WU consumption (often noticed in billing)
- Workflow error emails from Bubble (if recursion protection is enabled)
- Server logs showing the same workflow running hundreds or thousands of times
- Timeouts or capacity warnings in the Logs tab

**Using infinite recursion protection:**

- Located in Settings > API tab
- New apps (after July 2024): enabled by default with a limit of 10
- Older apps: must enable manually
- When a workflow exceeds the depth limit, it is terminated and:
  - Logged under "Workflow errors" in server logs
  - An email notification is sent to app admins (once daily)

**Setting appropriate depth limits:**

| Scenario | Recommended Limit |
|---|---|
| No recursive workflows | 10 (default) |
| Single self-scheduling workflow | 2x expected max list length |
| Two workflows scheduling each other | 5x expected max list length |
| Uncertain | Set higher rather than lower -- the protection still catches true infinite loops |

**How to debug a runaway recursive workflow:**

1. Check server logs for repeated executions of the same workflow with timestamps very close together
2. Look at the workflow's termination condition -- is it possible for the condition to never become true?
3. Check if the data being modified in each iteration actually changes the termination condition
4. Verify that the list being processed actually shrinks with each iteration (if using list-based recursion)

**Prevention:** Always design recursive workflows with:
- An explicit termination condition that will definitely become true
- A counter or shrinking list that guarantees eventual termination
- Appropriate delay between iterations (1-2 seconds minimum)
- Recursion protection enabled with a reasonable limit

### 3.4 Common Error Patterns

**"This search has been modified by privacy rules":** Your search returned fewer results than expected because the current user lacks access to some records. Check your privacy rules and consider whether the workflow should use "Ignore privacy rules."

**Workflow actions not executing:** Check the "Only when" condition. Use server logs with the "Non-passed events" filter to see which condition evaluated to false.

**Backend workflow "not running":** Common causes:
- The workflow is not exposed as an API workflow
- Authentication is required but the calling context does not provide it
- The workflow was scheduled but has not executed yet (check the Scheduler)
- Recursive workflow was terminated by recursion protection

**Data not appearing in repeating group:** Privacy rules are blocking the search. Auto-binding changes are not being saved. The search constraints are too restrictive.

**Slow workflow execution:** Too many actions in a single workflow. Each action contacts the server separately. Consolidate where possible (one action updating many fields vs. many actions updating one field each).

**"Capacity has been reached":** Your plan's server capacity is exhausted. Check the Logs tab for capacity usage. Identify and optimize the most resource-intensive operations.

---

## 4. Deployment

### 4.1 Development vs Live

Bubble maintains two completely separate environments:

**Development:**
- Where you build and test
- Has its own database (separate from Live)
- Changes here do not affect live users
- Accessible via `yourapp.bubbleapps.io/version-test`

**Live:**
- What your users see and interact with
- Has its own database (the real user data)
- Only changes when you deploy
- Accessible via `yourapp.bubbleapps.io` (or custom domain)

**Critical understanding:** The two databases are completely independent. Creating test data in Development does NOT affect Live data. Deploying does NOT copy database records -- only the app definition (pages, workflows, data type definitions, styles, plugins) is pushed.

### 4.2 Safe Deployment Practices

**Pre-deployment checklist:**

1. **Create a save point.** Before deploying, create a named save point in version control. This gives you a clean rollback target.

2. **Test in Development thoroughly.** Test as different user types (admin, regular user, anonymous). Test edge cases. Use realistic test data.

3. **Review database schema changes.** If you added new data types or fields, these will be created in Live on deploy. If you deleted fields, consider whether live data in those fields should be preserved first.

4. **Check for breaking changes.** If you renamed a data type or field, workflows referencing the old name may break. Bubble usually handles this, but verify.

5. **Plan for data migration.** If your schema changes require data to be moved, transformed, or backfilled in the Live database, prepare backend workflows to handle this AFTER deployment.

6. **Deploy during low-traffic periods.** While Bubble deployments are generally fast, deploying during peak usage minimizes risk.

7. **Monitor after deployment.** Watch server logs and WU analytics immediately after deploying. Look for unexpected errors or spikes in resource usage.

**Rollback:** Bubble allows you to revert to any previous point in time. However, reverting does NOT undo database changes. If your deployment included a workflow that modified live data, reverting the code does not reverse those data changes.

### 4.3 Database Migration

**Schema vs. data:**
- Schema (data types, fields, option sets) deploys with the app
- Data (actual records) stays in its respective database (Dev or Live)

**Common migration scenarios:**

1. **Adding a new field:** The field is created in Live on deploy with null/empty values. If existing records need a default value, create a backend workflow to backfill after deployment.

2. **Removing a field:** The field definition is removed from Live. Data in that field is effectively orphaned (not immediately deleted but inaccessible). Export the data before deploying if you need to preserve it.

3. **Changing field type:** This is risky. Bubble may not cleanly convert existing data. Test thoroughly in Development first. Consider creating a new field with the desired type and migrating data via a backend workflow rather than changing the existing field's type.

4. **Renaming a data type:** Bubble handles internal references, but external API integrations referencing the old name will break. Update all external consumers before or immediately after deploying.

**Version control with branches:**

- Preserve the Main branch solely for deployment
- Create feature branches for each new piece of work
- Merge feature branches back to Main when tested and ready
- When multiple branches exist, deploying from one can make others out of sync
- Syncing resolves this by incorporating Live changes into the active branch

**Backup strategy:**
- Export critical data before major deployments
- Use Bubble's built-in data export or third-party backup services
- Store backups externally (Bubble's data export provides CSV files)
- Consider automated backup schedules for production apps

---

## Summary of Key Principles

**Performance:**
- Server-side constraints are always faster than client-side filtering
- Database design accounts for ~70% of performance outcomes
- Option Sets are one of the most powerful and underused optimization tools
- `Do a search for:count` is a server-side aggregation, not a full data load
- Denormalize data that is read often but written rarely
- Never put searches inside repeating group cells

**Security:**
- All data is public unless protected by privacy rules
- UI hiding is NOT security
- Test as multiple user types, including anonymous
- Auto-binding bypasses workflow validation
- API workflows require explicit authentication configuration
- File URLs are publicly accessible unless protected

**Debugging:**
- Server logs are for investigating past issues; the Debugger is for current issues
- "Non-passed events" filter shows why something did NOT happen
- Enable infinite recursion protection and set appropriate limits
- Use the browser Network tab to identify over-fetching and N+1 patterns

**Deployment:**
- Development and Live databases are completely separate
- Schema deploys; data does not
- Always create a save point before deploying
- Reverting code does not reverse data changes
- Plan data migrations as separate post-deployment operations

---

## Sources

### Official Bubble Documentation
- [Client-side and server-side processing](https://manual.bubble.io/help-guides/workload/understanding-workload/client-side-and-server-side-processing)
- [Optimization checklist](https://manual.bubble.io/help-guides/workload/optimizing-workload/optimization-checklist)
- [Protecting data with privacy rules](https://manual.bubble.io/help-guides/data/the-database/protecting-data-with-privacy-rules)
- [Backend workflows optimization](https://manual.bubble.io/help-guides/workload/optimizing-workload/optimization-checklist/backend-workflows)
- [Searches optimization](https://manual.bubble.io/help-guides/workload/optimizing-workload/optimization-checklist/searches)
- [Page load optimization](https://manual.bubble.io/help-guides/workload/optimizing-workload/optimization-checklist/page-load)
- [Recursive API workflows](https://manual.bubble.io/help-guides/integrations/api/the-bubble-api/the-workflow-api/api-workflows/recursive-api-workflows)
- [Infinite recursion protection](https://manual.bubble.io/help-guides/workload/tracking-workload/monitoring-workload/infinite-recursion-protection)
- [Using server logs](https://manual.bubble.io/help-guides/maintaining-an-application/testing-and-debugging/using-server-logs)
- [Workflow API security](https://manual.bubble.io/help-guides/security/api-security/workflow-api-security)
- [Workflow API privacy rules](https://manual.bubble.io/help-guides/integrations/api/the-bubble-api/the-workflow-api/workflow-api-privacy-rules)
- [Version control](https://manual.bubble.io/help-guides/maintaining-an-application/version-control)
- [Repeating groups](https://manual.bubble.io/help-guides/design/elements/containers/repeating-groups)
- [Workload overview](https://manual.bubble.io/help-guides/workload)
- [Security overview](https://manual.bubble.io/help-guides/security)
- [Performance and scaling](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling)

### Community and Third-Party Guides
- [Airdev WU Optimization Guide](https://forum.bubble.io/t/free-workload-unit-wu-optimization-guide-by-airdev/265462)
- [Airdev: Optimize for speed](https://docs.airdev.co/bubble-development-guide/steps/develop/optimize-speed)
- [Airdev: Version control best practices](https://docs.airdev.co/functionality-reference/resources/bubble.io-version-control-best-practices)
- [NoCodeAssistant: 3 tips for faster searches](https://nocodeassistant.com/3-tips-to-make-bubble-app-search-faster/)
- [NoCodeAssistant: Lists vs Searches performance](https://nocodeassistant.com/list-or-searches-which-is-faster-in-bubble/)
- [NoCodeAssistant: Recursive workflows for beginners](https://nocodeassistant.com/recursive-workflows-in-bubble/)
- [Sidetool: Building secure Bubble apps](https://www.sidetool.co/post/building-secure-bubble-io-apps-essential-security-tips/)
- [Sidetool: Security best practices 2025](https://www.sidetool.co/post/bubble-io-security-best-practices-2025/)
- [Sidetool: Database structuring guide](https://www.sidetool.co/post/effective-database-structuring-in-bubble-io-beginner-s-guide/)
- [Minimum Code: WU optimization](https://www.minimum-code.com/blog/how-to-optimize-wu-in-bubble)
- [Goodspeed Studio: Optimize workload units](https://goodspeed.studio/blog/how-to-optimize-workload-units-on-bubble)
- [Zeroqode: Database structure best practices](https://zeroqode.com/blog/how-to-structure-your-bubble-app-database/)
- [Lowcode Agency: Bubble scalability 2026](https://www.lowcode.agency/blog/bubble-scalability)
- [Lowcode Agency: Bubble security risks and best practices](https://www.lowcode.agency/blog/bubble-security)
- [InceptMVP: Database efficiency guide](https://www.inceptmvp.com/bubble-io/mastering-bubble-io-database-efficiency-guide)
- [Framify: Data management best practices](https://framify.io/blog/data-management-in-bubble-best-practices-tips)
- [Anish Gandhi: Repeating group pagination](https://anishgandhi.com/how-to-paginate-repeating-groups-in-bubbleio-without-loading-all-data-at-once)
- [Planet NoCode: Development vs Live versions](https://www.planetnocode.com/tutorial/settings/understanding-development-vs-live-versions-in-bubble/)
- [NoCode MBA: Test vs Live versions](https://www.nocode.mba/articles/bubble-test-vs-live)
- [VibeAppScanner: Bubble security guide](https://vibeappscanner.com/bubble-security)
