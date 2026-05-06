Here is the comprehensive research on Bubble.io workflows. I was unable to write this to a skill file (write permission denied), so I am delivering the full synthesis directly.

---

# Bubble.io Workflows: Complete Reference

## Overview

Bubble workflows consist of an **event** (trigger) and one or more **actions** (what happens). Events determine *when* something runs; actions determine *what* runs. Workflows exist in two execution contexts: **frontend** (runs in the user's browser, tied to a page) and **backend** (runs on Bubble's server, independent of any page).

---

## 1. Frontend Workflows

Frontend workflows react to user interactions, page-level occurrences, and data changes. They only run while the page is open.

### 1.1 Event Triggers

**Element Events**
- **Button click / Element click** -- triggered when a user clicks an element. Right-click an element and choose "Start/edit workflow" to create one.
- **Input changed** -- fires when an input's value changes. Text-based inputs register the change when the element *loses focus*. Click-based inputs (dropdowns, date pickers) register immediately on selection.
- **Element-specific events** -- file uploader "value changed," repeating group "row clicked," map "marker clicked," etc.

**General (Page-Level) Events**
- **Page is loaded** -- fires when the page finishes loading. Use for initialization logic.
- **User is logged in / User is logged out** -- fires based on authentication state at page load.
- **Do when condition is true** -- fires when a dynamic expression evaluates to "yes." Has an option "Every time" which re-fires whenever the condition *becomes* true again (not just the first time). Useful for reactive workflows that respond to state changes.
- **Do every X seconds** -- fires at a set interval (in seconds) as long as the page is open. Useful for polling, countdowns, or periodic UI updates. Accepts fractional seconds. Stops when the user navigates away.
- **An unhandled error occurs** -- catches errors that no other error event handles.
- **An element hits an error** -- catches errors on a specific element's workflow. The error event is tied to the element that *triggered* the workflow (e.g., a button), not the input field that had bad data.

**Custom Events (Frontend)**
- Created in the workflow editor under Custom > "Create a new custom event."
- Can only be triggered by the "Trigger a custom event" or "Schedule a custom event" action from another workflow.
- Accept **parameters** of any data type, which become available inside the custom event's actions.
- Can **return data** back to the calling workflow.
- Cannot trigger themselves (no self-recursion on the frontend).

### 1.2 Action Types

**Navigation:** Go to page (with optional URL parameters), Go to view (modal support), Open external website.

**Element Actions:** Show element, Hide element, Toggle element, Animate element, Scroll to element, Set state of an element, Display data in group/popup, Reset relevant inputs, Set focus on element.

**Data (Server-Side Actions Called from Frontend):** Create a new thing, Make changes to a thing, Make changes to a list of things (single server operation -- efficient), Delete a thing, Delete a list of things, Copy a list of things, Sign the user up, Log the user in/out, Send email.

**Scheduling:** Schedule API Workflow, Schedule API Workflow on a list, Cancel a scheduled API workflow, Set/cancel a recurring event.

**Custom:** Trigger a custom event, Trigger a custom event from a reusable element, Schedule a custom event.

### 1.3 "Only When" Conditions

Conditions can be applied at **two levels**:

1. **Event level** -- an "Only when" on the event itself prevents the entire workflow from running if the condition is false.
2. **Action level** -- an "Only when" on a specific action step skips that single action if the condition is false. Bubble continues to the next action.

Conditions are dynamic expressions that evaluate to yes/no. They can combine multiple checks with "and" / "or" operators.

**Best practice:** When a single trigger (e.g., a button) can lead to different outcomes, prefer creating multiple separate workflows with event-level conditions rather than one workflow with many action-level conditions. This is clearer and less error-prone.

### 1.4 Custom Events: Data Passing and Return Values

**Passing data in:** Define parameters on the custom event (name + data type). When using "Trigger a custom event," provide values for each parameter. Inside the custom event, reference parameters directly in expressions.

**Returning data out:** Configure the custom event to return data (set the return type). Use "Return data from custom event" as an action inside the custom event. In the calling workflow, reference the result as "Result of [step that triggered the custom event]."

**Trigger vs. Schedule:**

| Behavior | Trigger a custom event | Schedule a custom event |
|---|---|---|
| Execution timing | Immediate, inline | After delay (seconds) |
| Parent workflow | Pauses until complete | Continues in parallel |
| Can return data | Yes | No (runs independently) |
| Page dependency | Page must be open | Page must stay open until delay expires |
| With 0-second delay | N/A | Runs in parallel with parent |

### 1.5 Workflow Execution Order (Critical)

Bubble does NOT strictly execute actions sequentially. The execution model is:

- **Client-side actions** (show/hide, set state, animate) execute in order on the browser but do NOT wait for server actions to complete.
- **Server-side actions** (create thing, make changes, API calls) are dispatched to the server. The next action may fire before the previous server action completes.
- **Schedule API Workflow** is dispatched as soon as the workflow triggers, regardless of its position in the action sequence.

**To guarantee order:**
1. Use **"Result of Step X"** to reference data created in a previous step -- this forces Bubble to wait for that step.
2. Wrap dependent actions in a **custom event** triggered with "Trigger a custom event" (which pauses the parent).
3. Never rely on a **Do a Search** immediately after a **Create a new thing** to find the just-created record. Use "Result of Step X" instead.

---

## 2. Backend Workflows

Backend workflows run entirely on Bubble's server. They persist regardless of whether any user has a page open. Enable them at **Settings > API > "Enable Workflow API and Backend Workflows."** Requires a paid plan.

### 2.1 API Workflows (Callable Endpoints)

**Defining Parameters:**
- Each parameter has a key (name), data type, and optional flags: "Is a list/array," "Optional," "Querystring."
- For POST requests, data goes in the body unless "Querystring" is checked.
- GET requests always read from querystring.
- Bubble validates types on incoming requests; wrong types or missing non-optional params return a 400 error.

**Exposing / Hiding from Swagger:**
- Check "Expose as public API workflow" to make it callable externally. Bubble generates a URL at `https://yourapp.bubbleapps.io/api/1.1/wf/[workflow-name]`.
- Uncheck it for internal-only workflows (callable only via Schedule API Workflow).
- Exposed workflows appear in Swagger documentation.

**Authentication Levels:**
- **None required** -- public endpoint (webhooks, signup).
- **User and admin** -- requires a user token or admin key.
- **Admin only** -- requires the admin API key.

**HTTP Methods:** Default POST. Configurable to GET for webhook compatibility.

### 2.2 Database Trigger Events

Fire server-side whenever a specified data type is modified, regardless of what caused the change.

**Before vs. After Change Data:**
- **Thing Before Change** -- the record's state before modification.
- **Thing Now** -- the record's state after modification.
- Created detection: "Thing Before Change is empty" = true.
- Deleted detection: "Thing Now is empty" = true.

**Critical Limitations:**
1. **No cascading triggers:** If a database trigger's workflow modifies data, that modification does NOT fire other database triggers. Workaround: schedule a separate API workflow from inside the trigger -- that scheduled workflow's changes WILL fire triggers.
2. **Single fire per workflow:** If a single workflow modifies the same record multiple times, the trigger fires only once.
3. **Condition cost:** A trigger without an "Only when" runs on EVERY change to that data type, consuming workload each time.

### 2.3 Recurring Events

Fire on Bubble's server at a set interval. Require a "thing" to operate on.

**Frequency options:** Daily, Weekly, Monthly, Quarterly, Yearly, None (cancels). Started via the "Set/cancel a recurring event" action. The interval starts from the time of that first trigger.

Recurring events run with the triggering user's context by default. Check "Ignore privacy rules" to run as admin.

### 2.4 Backend Custom Events

Server-side equivalent of frontend custom events. Created in the Backend Workflow editor, accept parameters, run sequentially when triggered (calling workflow waits).

### 2.5 Schedule API Workflow

- **Timing:** Set to "Current date/time" for near-immediate execution, or a future date/time for delayed.
- **Snapshot behavior:** Bubble saves a snapshot of the workflow's structure at scheduling time. Later changes to the workflow do NOT affect already-scheduled instances.
- **Parameters:** All values captured at scheduling time.
- **Visibility:** Scheduled workflows appear in Logs > Scheduler for monitoring and manual cancellation.

### 2.6 Schedule API Workflow on a List

Schedules one independent API workflow per item in a provided list.

- **Not a loop:** Each workflow is independent. They do not wait for each other.
- **Parallel execution:** Even with an interval, workflows may overlap if processing takes longer than the interval.
- **Limit:** Up to 100,000 items.
- **WU cost:** One scheduling operation for the entire list (efficient versus recursive which costs one per iteration).

### 2.7 Returning Data from API Workflows

The "Return data from API" action sends a response to the caller.

**Response options:** JSON (key/value pairs, lists limited to 50 entries), custom content-type, plain text, or page redirect with query strings.

**Important caveat:** "Return data from API" only works when the workflow is called via HTTP request (external call or API Connector self-call). It does NOT return data when triggered via "Schedule API Workflow" from the frontend. To get data back from a scheduled workflow, write results to the database and have the frontend poll or use a data-change trigger.

By default, a failed "Only when" condition returns 400. You can configure it to return 200 instead for webhooks expecting success codes.

---

## 3. Common Patterns

### 3.1 Recursive Workflows for Batch Processing

The standard sequential list-processing pattern:

1. Create an API workflow with parameter `list` (type: list of your data type).
2. Process `list:first item` with your actions.
3. As the last action, **Schedule API Workflow** pointing to itself, passing `list:minus item list:first item` (removes the processed item).
4. Add "Only when" on the Schedule action: `list:minus item list:first item:count > 0`.

Each iteration processes one item, removes it, and schedules the next. When empty, the condition stops recursion.

**Alternative (counter-based):** Parameters: `list` (full list, never modified) and `iteration` (number). Process `list:item# iteration`. Schedule self with `iteration + 1`. Condition: `iteration + 1 < list:count`.

### 3.2 Avoiding Infinite Loops

**Built-in protection (July 2024+):** Default maximum depth of 10 iterations for new apps. Configure in Settings > General > Infinite recursion protection. Set higher than your longest expected chain (for ~500 items, use 1,000+). For indirect recursion (A schedules B, B schedules A), depth = 2x list length. Terminated workflows appear in server logs and trigger admin emails.

**Manual safeguards:**
1. Always have a termination condition on the Schedule action.
2. Always shrink the input (remove items or increment counter).
3. Add a safety counter / max_iterations parameter.
4. Use delays (1-2 seconds) during development so you can cancel from the Scheduler.

### 3.3 Error Handling and "Terminate This Workflow"

"Terminate this workflow" stops execution mid-workflow. Typically placed early with an "Only when" condition as a guard clause.

**Known issues:** Community reports of performance degradation with conditional Terminate actions. Consider restructuring with "Only when" on individual steps instead if performance is affected.

**Recommended patterns:**
- Validation-first: Terminate early on invalid states. Set custom states with error messages before terminating.
- Backend error logging: Create an ErrorLog data type and write records on failure.
- "An element hits an error" event to show friendly messages instead of browser alerts.

### 3.4 Frontend vs. Backend: When to Use Which

**Frontend:** UI actions (show/hide, set state, navigate) -- zero WU cost. Simple single-record CRUD where the user needs immediate feedback.

**Backend:** Bulk/list processing, operations that must survive page closure, scheduled/recurring tasks, webhook handling, sensitive operations, time-consuming work that should not block the UI.

### 3.5 Bulk Operations Best Practices

| Method | Use Case | WU Efficiency | Order Guarantee |
|---|---|---|---|
| Make changes to a list of things | Uniform changes to many records | Best (1 operation) | N/A |
| Schedule API WF on a list | Per-item complex processing | Good (1 schedule + N runs) | No |
| Recursive workflow | Sequential dependent processing | Worst (N schedules + N runs) | Yes |

Target performance benchmarks: page loads under 2-3 seconds, user-facing workflows under 1 second, database operations under 500ms.

---

## 4. Workflow Debugging

### 4.1 The Debugger (Frontend)

Append `?debug_mode=true` to your preview URL. Three modes: Normal (uninterrupted), Slow (1-second pauses), Step-by-step (manual advancement with "Run next").

**Breakpoints:** Set in the workflow editor on any event or action. Hitting a breakpoint switches to step-by-step mode. Only active with `debug_mode=true`.

**Inspect mode:** Click "Inspect" in the debugger, then click any page element to view its properties, conditions, data sources, and custom states. Click sub-expressions to drill into evaluation. Workflows do not trigger during inspect mode.

**Error detection:** The debugger icon turns red on errors. Click to see details.

### 4.2 Server Logs (Backend)

Located in Logs > Server logs. Captures all server-side operations.

**Filtering:** By user (email/ID), date range, keyword, log type (All, Non-passed events, Errors).

**"Zoom on this workflow":** Isolates all steps of a single workflow execution. Essential for tracing recursive chains.

**Version awareness:** Logs are separated by Development vs. Live. Verify you are looking at the correct version.

Clicking a log entry navigates directly to the relevant workflow step in the editor.

### 4.3 Common Causes of Workflow Failures

1. **Privacy rules blocking data.** Backend workflows run in the triggering user's context. Check "Ignore privacy rules" on the workflow if needed.
2. **Race conditions.** Search after Create may not find the new record. Use "Result of Step X."
3. **Wrong parameter types.** Causes 400 errors on API workflows.
4. **Recursive depth limit hit.** Workflow silently terminates at the configured limit. Check server logs.
5. **Stale scheduled workflows.** Workflow snapshots are frozen at scheduling time; later edits are not reflected.
6. **Database trigger cascading.** Changes from inside a trigger do not fire other triggers (by design).
7. **"Do when condition is true" misfiring.** If "Every time" is unchecked, it fires only once per page load. Server-data dependencies may cause evaluation delays.
8. **Custom event scope.** Frontend custom events are page-scoped. Cannot be triggered cross-page.

### 4.4 Debugging Recursive Workflows

1. Start with a small list (3-5 items) and inspect server logs.
2. Use "Zoom on this workflow" to trace each iteration.
3. Add a counter parameter and log it to a database field for visibility.
4. Test with a 1-item list first to verify the termination condition stops at 1 iteration.
5. Check infinite recursion protection settings if workflows stop at 10 iterations unexpectedly.
6. Use the Scheduler (Logs > Scheduler) to see and cancel upcoming workflows.
7. Add 2+ second delays during debugging for time to observe and intervene.

---

## Quick Reference: Action Execution Behavior

| Action Type | Runs On | Blocks Next Step? | WU Cost |
|---|---|---|---|
| Show/Hide/Animate | Client | No (instant) | None |
| Set State | Client | No (instant) | None |
| Navigate | Client | N/A (leaves page) | None |
| Display Data | Client | No (instant) | None |
| Create/Modify/Delete Thing | Server | No (dispatched async) | Yes |
| Make Changes to List | Server | No (dispatched async) | Yes (1 op) |
| Trigger Custom Event | Both | **YES** (waits for completion) | Depends |
| Schedule Custom Event | Client | No (independent after delay) | Depends |
| Schedule API Workflow | Server | No (dispatched immediately) | Yes |
| Schedule API WF on List | Server | No (dispatched immediately) | Yes (1 + N) |
| Return Data from API | Server | Yes (terminates workflow) | Minimal |

---

Sources:
- [Frontend events - Bubble Docs](https://manual.bubble.io/help-guides/logic/workflows/events/frontend-events)
- [Backend events - Bubble Docs](https://manual.bubble.io/help-guides/logic/workflows/events/backend-events)
- [Actions - Bubble Docs](https://manual.bubble.io/help-guides/logic/workflows/actions)
- [Custom events - Bubble Docs](https://manual.bubble.io/help-guides/logic/workflows/events/frontend-events/custom-events)
- [API Workflows - Bubble Docs](https://manual.bubble.io/help-guides/integrations/api/the-bubble-api/the-workflow-api/api-workflows)
- [Creating API Workflows - Bubble Docs](https://manual.bubble.io/help-guides/integrations/api/the-bubble-api/the-workflow-api/api-workflows/creating-api-workflows)
- [Scheduling API Workflows - Bubble Docs](https://manual.bubble.io/help-guides/integrations/api/the-bubble-api/the-workflow-api/api-workflows/scheduling-api-workflows)
- [Recursive API Workflows - Bubble Docs](https://manual.bubble.io/help-guides/integrations/api/the-bubble-api/the-workflow-api/api-workflows/recursive-api-workflows)
- [Database Trigger Events - Bubble Docs](https://manual.bubble.io/help-guides/logic/workflows/events/backend-events/database-trigger-events)
- [Recurring Events - Bubble Docs](https://manual.bubble.io/core-resources/events/recurring-event)
- [The Debugger - Bubble Docs](https://manual.bubble.io/help-guides/maintaining-an-application/testing-and-debugging/using-the-debugger)
- [Server Logs - Bubble Docs](https://manual.bubble.io/help-guides/maintaining-an-application/testing-and-debugging/using-server-logs)
- [Infinite Recursion Protection - Bubble Docs](https://manual.bubble.io/help-guides/workload/tracking-workload/monitoring-workload/infinite-recursion-protection)
- [Bulk Operation Methods Compared - Bubble Docs](https://manual.bubble.io/help-guides/maintaining-an-application/database-maintenance/bulk-operations/bulk-operation-methods-compared)
- [Custom States - Bubble Docs](https://manual.bubble.io/help-guides/data/temporary-data/custom-states)
- [Conditions - Bubble Docs](https://manual.bubble.io/help-guides/logic/conditions)
- [The Frontend and Backend - Bubble Docs](https://manual.bubble.io/help-guides/logic/the-frontend-and-backend)
- [Backend Workflows Optimization - Bubble Docs](https://manual.bubble.io/help-guides/workload/optimizing-workload/optimization-checklist/backend-workflows)
- [Airdev: Schedule API Workflow on List vs Recursive](https://build.airdev.co/wiki/how-to-choose-schedule-api-workflow-on-a-list-vs-recursive-bubble-application)
- [Airdev: Recursive Workflows Best Practices](https://docs.airdev.co/functionality-reference/resources/recursive-workflows)