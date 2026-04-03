# Bubble.io Frontend/UI System -- Comprehensive Reference

---

## 1. Page Structure

### Page Types and Architecture

Bubble supports two primary architectural patterns:

**Multi-Page Application (MPA):** Each section of your app lives on a separate page with its own URL. When a user navigates from a dashboard to settings, they load a completely different page. This is the recommended approach for most apps because each page loads independently, the editor stays performant, and URLs are clean.

**Single-Page Application (SPA):** Multiple groups of content live on one page, and you show/hide them to simulate navigation. SPAs use URL parameters (preferred) or custom states to control which group is visible. The SPA pattern avoids page reloads, making transitions feel instant, but has a major trade-off: as the app grows, the editor becomes slow because hundreds of groups accumulate on one page, and all content must load even if the user never sees it.

**Hybrid Approach (Community Best Practice):** Place the app's most-used features on a single SPA page for snappy daily use, and move lesser-used features (settings, admin panels) to separate pages.

**The Index Page:** Created automatically with every app. It is the page that loads when a user visits the root domain. You cannot name another page "index," but you can swap which page serves as the index via "Make this page the new index."

### Sending Data to Pages

There are two mechanisms for sending data between pages:

**Option 1 -- Page Data Source (Type of Content):**
Set a "Type of content" on the page itself (e.g., "User" or "Product"). This tells Bubble the page is designed to display a single record of that data type. When navigating, use the "Go to page" action and specify the data to send. Bubble handles all the backend data passing and constructs a clean URL using the record's slug or unique ID. Inside the page, reference data with `Current Page's [field]`.

**Option 2 -- URL Parameters:**
URL parameters follow a key-value-pair structure appended after a `?` in the URL (e.g., `?tab=settings&id=123`). Multiple parameters are separated by `&`. You read them with the "Get data from page URL" operator, specifying the key name and expected data type. URL parameters can reference database Things (by unique ID) and Option Sets (by display value).

Key considerations:
- URL parameters are fully visible and editable by users -- never put sensitive data in them.
- Each parameter holds a single value (lists are not natively supported).
- The "Send current page parameters" checkbox preserves existing parameters when navigating.
- URL parameters survive browser back-button navigation, unlike custom states.

### Page Slugs

Slugs give database records human-readable URLs (e.g., `/product/blue-widget` instead of `/product/1678234567890x123`). Slugs can contain only lowercase letters, numbers, and hyphens, and must be under 250 characters. Two Things of the same data type cannot share the same slug; Bubble appends `-1`, `-2`, etc. if there are conflicts.

---

## 2. Responsive Design System

### The Responsive Engine

Bubble's responsive engine is built on CSS Flexbox. The core principle is a parent-child hierarchy: the page is the top-level parent, containers sit inside it, and containers can nest inside other containers to any depth. Row and column layouts control positioning along one axis while allowing individual child positioning along the opposite axis.

### Container Layout Types

**Fixed Layout:**
Elements are positioned by manual drag-and-drop, like absolute positioning. Elements can overlap and layer on top of each other (unique to Fixed layout). Useful for small atomic components like notification badges or avatar stacks that will be nested inside a responsive structure. Not inherently responsive -- use sparingly.

**Row Layout:**
Arranges child elements horizontally, side by side. Children wrap to the next line if the container width shrinks below the combined minimum widths. Alignment options: left-aligned, centered, right-aligned, space-around, space-between. Child elements grow equally to fill available space (respecting min/max width). Example: a row with two children in a 100px container, each with min-width 20px and no max-width, results in two 50px children. Add a third, and each becomes 33.33px.

**Column Layout:**
Arranges child elements vertically, stacked top to bottom. Alignment options: top-aligned, centered, bottom-aligned, space-around, space-between. Ideal for page sections, forms, blog content, and most general page layouts.

**Align to Parent:**
Divides the parent into a 3x3 grid (nine cells): upper-left, upper-center, upper-right, middle-left, center, middle-right, lower-left, lower-center, lower-right. Each child element is pinned to one of these cells. Warning: elements in different cells can overlap as the screen resizes.

### Responsive Properties

**Fixed vs. Flexible Dimensions:**
Each element can have its width and height set to "fixed" (stays the same pixel value regardless of screen size) or "flexible" (scales within a min/max range). Flexible elements require specifying both a minimum and maximum width/height.

**Min/Max Width and Height:**
The most critical responsive tools. Min-width prevents elements from becoming too narrow on small screens. Max-width prevents elements from stretching too wide on large screens. Values can be set in pixels or as percentages relative to the parent container. A container will grow to its max-width or the width of its parent, whichever is smaller.

**Gap Spacing:**
Row containers accept both column-gap and row-gap values. Column containers accept row-gap values. Gap values reduce the available space for child elements to grow.

**Collapse When Hidden:**
When checked, a hidden element is removed from the layout flow, freeing its space for siblings. When unchecked, the element is invisible but still occupies space. This is essential for responsive designs that show/hide content at different breakpoints.

### Breakpoints

Every app includes a Default breakpoint (equal to the Default builder width for that page) plus four preset breakpoints. You can add custom breakpoints. Breakpoints serve two purposes:

1. **Responsive Viewer:** Test page behavior at each breakpoint width.
2. **Conditionals:** Use the "Current page width" operator to compare against breakpoints and change element properties (size, visibility, padding, layout direction, etc.).

A common responsive pattern: change a container from Row layout to Column layout at a mobile breakpoint, so horizontally arranged cards stack vertically on small screens. Combine this with "Collapse when hidden" and the "This element is visible" conditional to create fully adaptive layouts.

---

## 3. Elements

### Core Visual Elements

**Text:** Displays static or dynamic text. Supports rich text formatting. Can reference dynamic data via expressions.

**Button:** Triggers workflows on click. Has built-in states (hover, pressed) for visual feedback.

**Image:** Displays static or dynamic images. Supports dynamic image sources from the database.

**Icon:** Displays vector icons from Bubble's built-in icon library. Lightweight alternative to images for UI indicators.

**Alert:** A notification-style element that appears temporarily to communicate messages to users.

### Container Elements

#### Group
The fundamental building block. Groups serve two roles:

1. **Visual container:** Gathers child elements; they all move together.
2. **Data carrier:** A group can have a "Type of content" and a "Data source." Any child element can reference `Parent group's [field]` to access that data. This data-carrying capability is central to Bubble's architecture -- it eliminates the need to pass data explicitly to every child element.

Groups can store any data type: text, number, database Things, expressions, or Option Sets. Groups can be nested to any depth, creating a hierarchy of data contexts.

#### Repeating Group
Displays a list of records by repeating its cell layout once per entry. If the data source returns five users, every element inside the repeating group is replicated five times. Inside each cell, reference the current record with `Current cell's [data type]`.

**Layout types:**
- Vertical scrolling (cells stacked top to bottom)
- Horizontal scrolling (cells arranged side by side, set container layout to Row)
- Ext. vertical scrolling (extended scrolling within a fixed-height container)
- Grid / masonry layout (dynamic cell sizing; uncheck "Set fixed number of rows" and "Stretch rows to fill vertical space")

**Data source:** Can be a "Do a search for" expression, a list from a custom state, a field on the page or parent group, or an API response.

**Pagination:**
- Built-in: Set "Results per page" (fixed number of cells), then use "Show next of Repeating Group" / "Show previous of Repeating Group" actions on Next/Previous buttons.
- Server-side pagination (performance best practice): By default, Bubble loads the entire dataset client-side even when paginating visually. For true server-side pagination, use constrained searches with item ranges and a hidden count query (`Do a search for:count`) to determine total pages without loading all records.

**Infinite scroll:** Set the repeating group to "Ext. Vertical Scrolling" and use workflows that detect when the user approaches the bottom of the current data set, then append the next batch. Some developers use "Do Every X Seconds" to poll scroll position.

**Repeating group states:**
- `loading` -- true while the list is loading (use for skeleton screens or spinners)
- `page number` -- current pagination page
- `is on first page` / `is on last page` -- for disabling prev/next buttons

#### Popup
Floats above all other page content in the z-axis. Does not affect the layout of other elements. Can optionally overlay a darkened or blurred backdrop to focus user attention.

**Data passing pattern:**
1. Set the popup's "Type of content" (e.g., Product). Leave the Data source empty.
2. In the triggering workflow, use "Element Actions > Display Data" to pass the specific record to the popup.
3. Then use "Show" to make the popup visible.
4. Inside the popup, child elements reference data via `Parent group's [field]`.

Popups are commonly used for: detail views launched from repeating group cells, edit forms, confirmation dialogs, and onboarding flows.

#### Floating Group
Stays in a fixed position on the screen regardless of scroll position. Configured via two axes:

**Vertical float:** Top, Bottom, Both, or None.
- Top: stays pinned to the top (sticky header pattern).
- Bottom: stays pinned to the bottom (chat button pattern).
- Both: maintains constant distance from both edges (sidebar pattern) -- may show scrollbar if content overflows.
- None: scrolls normally with the page.

**Horizontal float:** Left or Right edge, maintaining a constant margin.

**Z-index:** Controls whether the floating group appears above or below other page content. The "Beneath the page" setting literally renders it behind the page background.

Common use cases: navigation headers, sidebars, floating action buttons, cookie banners, scroll-to-top buttons.

**Centering workaround:** Floating groups cannot be natively centered horizontally. Workarounds include adding `margin-left: auto` via custom CSS, or placing a centered group inside a full-width transparent floating group.

#### Group Focus
A container that is hidden by default and automatically hides when the user clicks outside of it. Its position is anchored to a reference element. When triggered, it appears at a configurable offset from the reference element.

Use cases: dropdown menus, context menus, tooltips, autocomplete suggestions.

**Limitation:** Group Focus cannot be placed inside another group or a repeating group cell -- it always lives at the page level.

**Workaround for repeating groups:** Wrap the Group Focus inside a Reusable Element. Place the reusable element inside the repeating group cell. Set the Group Focus reference element to a group inside the reusable. This isolates the Group Focus behavior and bypasses the page-level restriction.

---

## 4. Reusable Elements

### What They Are

Reusable elements are self-contained components (containing elements, workflows, and custom states) that can be placed on any page. Each instance of a reusable element operates in isolation -- changes in one instance do not affect others, even on the same page.

Reusable elements do not need to contain visible elements. They can serve as pure workflow containers, triggered from the parent page.

### Passing Data IN (Parent to Reusable)

**Method 1 -- Type of Content + Data Source:**
Set the reusable element's "Type of content" to a data type (e.g., User). On the parent page, set the instance's Data source. Inside the reusable, reference data with `This Reusable Element's [field]`. Best for passing a single database record.

**Method 2 -- Reusable Element Properties:**
Define named properties on the reusable element, each with its own data type. Unlike custom states, properties accept dynamic expressions directly -- no workflow action needed to populate them. On the parent page, each property appears as a field on the element's property editor. Useful for passing multiple different data types.

**Method 3 -- Custom States:**
Create custom states on the reusable element's root. The parent page can use "Set state of an element" to assign values. This works bidirectionally.

**Method 4 -- URL Parameters:**
Since URL parameters are global to the page, both the parent page and any reusable element can read them. Not a direct data-passing mechanism, but useful for shared state.

### Passing Data OUT (Reusable to Parent)

**Method 1 -- Trigger Custom Event in Parent:**
Inside the reusable element, a workflow step uses "Trigger a custom event in the parent element." On the page, a corresponding custom event is defined to handle the action (e.g., update a state, show a popup, navigate).

**Method 2 -- Custom States:**
The parent page can read custom states on the reusable element instance. The reusable element sets its own state; the parent reads it via conditionals or workflow expressions.

**Method 3 -- Return Data from Custom Events:**
Custom events support a "Return data" action. When the parent triggers a custom event on the reusable (see below), the reusable can return a value. That returned value is then accessible in subsequent workflow steps as "Result of custom event."

### Triggering Custom Events (Parent to Child)

Use the "Trigger a custom event from a reusable element" action. This only works in the parent-to-child direction. Custom events can accept parameters (any data type), which are available inside the custom event's workflow steps.

**Execution order:** When the parent triggers a custom event, the parent workflow pauses until the custom event completes. This makes it safe to depend on the custom event's side effects or return values in subsequent parent workflow steps.

### Best Practices for Component Architecture

- Use reusable elements for any UI pattern that appears on more than one page (navigation bars, user cards, form sections, modals).
- Keep reusable elements focused on a single responsibility.
- Prefer Reusable Element Properties over custom states for data input, as properties are declarative and do not require workflow actions.
- Use custom events with return values for parent-child communication that requires a response.
- Avoid deeply nested reusable elements (reusable inside reusable inside reusable) as it complicates data flow and debugging.

---

## 5. States

### Custom States

Custom states are temporary, client-side variables attached to any element (including the page itself). They exist only during the current session and reset on page refresh or browser close. They are never saved to the database.

**Key characteristics:**
- Very fast -- no server round-trip.
- Any data type: text, number, yes/no, date, database Thing, list, Option Set.
- Created via the element inspector ("i" icon above the conditionals tab).
- Set via the "Set state of an element" workflow action.

**Common use cases:**
- Tab navigation: a custom state named "active_tab" (type: text) controls which group is visible.
- Wizard/multi-step forms: a state named "current_step" (type: number) tracks progress.
- Toggle states: a yes/no state for sidebar open/closed, modal visible/hidden.
- Temporary data storage: hold form input before submission, store selected items in a multi-select flow.

**Limitations:**
- Reset on page refresh (unlike URL parameters).
- No browser back-button support (unlike URL parameters).
- Values are client-side and can be manipulated -- do not use for security logic.
- Excessive custom states in complex apps can become hard to trace and debug.

### Built-in Element States

Every element has implicit states accessible in conditionals and expressions:

- **is hovered** / **is not hovered** -- mouse is over the element (desktop only).
- **is pressed** / **is not pressed** -- mouse click or touch is active on the element.
- **is focused** / **is not focused** -- the input element has keyboard focus.
- **is visible** / **is not visible** -- whether the element is currently displayed.
- **is valid** / **is not valid** -- for input elements, whether the content meets validation requirements.

Repeating group-specific states:
- **is loading** -- true while fetching data.
- **page number** -- current pagination page.
- **is on first page** / **is on last page** -- boundary checks for pagination controls.

### Conditional Formatting (The "Conditional" Tab)

Every element has a Conditional tab where you define rules in an "if-then" pattern: "When [condition is true], then [change these properties]."

**What conditions can reference:**
- Custom states (`MyGroup's active_tab is "settings"`)
- Current page width (for responsive behavior)
- Current user's data
- Parent group's data
- Element states (is hovered, is pressed, etc.)
- Any dynamic expression

**What properties can be changed:**
- Visibility (This element is visible: yes/no)
- Background color, font color, border color
- Font size, font weight, font family
- Width, height, padding, margin
- Data source (swap the data feeding a group or repeating group)
- Placeholder text, initial content
- Any property the element supports

**Priority rule:** Conditions are evaluated in the order listed. If two active conditions modify the same property, the condition listed last wins. You can reorder conditions by dragging.

**Common patterns:**
- Active tab highlighting: `When page's active_tab is "dashboard"` -> change button background to primary color.
- Responsive adjustments: `When Current page width < 768` -> change font size to 14px, hide sidebar.
- Hover effects: `When This Button is hovered` -> change background color.
- Validation feedback: `When Input email is not valid` -> change border color to red.
- Loading states: `When RepeatingGroup is loading` -> show spinner, hide content.

---

## 6. Styling System

### Named Styles

A style is a saved collection of visual properties (colors, fonts, borders, padding, shadows, etc.) tied to a specific element type (e.g., "Button" or "Text"). Applying a style to an element sets all its visual properties at once.

**Key benefits:**
- Modify a single style to update every element using it across the entire app.
- Styles are stored centrally, improving app performance compared to per-element styling.
- Enforces visual consistency.

**Style overriding:** You can override individual properties on a specific element without detaching it from the style. The override applies only to that element. This is useful for one-off adjustments while maintaining the base style connection.

### Style Variables

Style variables come in two types:

**Color Variables:**
A palette of named colors available throughout the app. Each color variable stores a hex code and an alpha (transparency) value. Changing a color variable updates every style and element that references it. Limit: up to 32 color variables (including 8 defaults). Name them with a `$` prefix for clarity (e.g., `$primary`, `$error-red`, `$background-light`).

**Font Variables:**
A collection of named fonts available throughout the app. Changing a font variable updates everywhere it is used. Limit: up to 8 font variables (including the default app font).

### Design System Workflow

The recommended workflow for design consistency:

1. Define color variables first ($primary, $secondary, $accent, $background, $surface, $text, $error, $success, etc.).
2. Define font variables ($heading-font, $body-font, etc.).
3. Create named styles for each element type that reference these variables (e.g., "Primary Button" style uses $primary for background, $surface for text, $heading-font for font).
4. Apply styles to elements on pages.
5. Use style overrides sparingly for intentional one-off variations.

This parallels the "design tokens" concept in traditional UX/frontend development.

### Cross-Platform Support

The Styles tab supports styles for both web and mobile apps in the same project, with platform-specific filtering and compatibility indicators.

---

## 7. Plugin Elements

### How They Work

Plugin elements extend Bubble's core element library with custom functionality built in JavaScript. They appear in the element palette alongside native elements and can be dragged onto pages just like any other element.

### Plugin Element Lifecycle

Plugin elements follow three lifecycle functions:

1. **initialize:** Called once when the element first becomes visible on the page. Sets up the DOM structure, attaches event listeners, initializes third-party libraries.

2. **update:** Called every time one of the element's exposed properties changes. Can fire many times. The developer's code should track what changed to avoid unnecessary DOM manipulation.

3. **run (for actions):** Executes when a Bubble workflow triggers a plugin-defined action.

### Plugin Element Capabilities

**Exposed Properties (Editor Fields):** The plugin developer defines properties that appear in the Bubble Property Editor. These accept static values or dynamic expressions, just like native element properties. Types include text, number, yes/no, color, data source, etc.

**States:** Plugin elements can define custom states that are readable by the Bubble app (e.g., a color-picker plugin might expose a "selected_color" state). These states can be referenced in conditionals and expressions.

**Events:** Plugin elements can trigger custom events (e.g., "value changed," "item selected") that appear in the Workflow tab. Bubble app builders can then attach workflow actions to these events.

**Actions:** Plugin elements can expose actions that can be called from Bubble workflows (e.g., "reset," "scroll to item," "play video").

### Common Plugin Element Patterns

- **Rich text editors** (e.g., Tiptap, Quill-based editors) -- provide formatted text editing beyond Bubble's native input.
- **Chart and data visualization** elements (e.g., Chart.js, ApexCharts wrappers).
- **Map elements** with advanced features beyond Bubble's built-in map.
- **Calendar/scheduler** components.
- **Drag-and-drop** interfaces.
- **File uploaders** with advanced features (cropping, multi-file, progress bars).
- **Video/audio players** with custom controls.
- **Signature capture** elements.
- **Advanced table/data grid** elements with sorting, filtering, and inline editing.

### Best Practices

- All marketplace plugins are vetted by Bubble before publication, but quality varies. Check ratings, reviews, and update history.
- Plugin elements that load heavy external JavaScript libraries can impact page load performance. Use them judiciously.
- Test plugin elements in both the editor preview and live/run mode, as behavior can differ.
- Be cautious of plugin elements that define states depending on their own dynamic properties, as this can create circular dependency errors.

---

## Sources

### Official Bubble Documentation
- [Container Layout Types](https://manual.bubble.io/core-resources/elements/container-layout-types)
- [Building Responsive Pages](https://manual.bubble.io/help-guides/design/responsive-design/building-responsive-pages)
- [Responsive Properties](https://manual.bubble.io/core-resources/elements/responsive-properties)
- [Containers](https://manual.bubble.io/core-resources/elements/containers)
- [Repeating Groups](https://manual.bubble.io/help-guides/design/elements/web-app/containers/repeating-groups)
- [Floating Groups](https://manual.bubble.io/help-guides/design/elements/web-app/containers/floating-groups)
- [Group Focus](https://manual.bubble.io/help-guides/design/elements/web-app/containers/group-focus)
- [URL Parameters](https://manual.bubble.io/help-guides/data/temporary-data/url-parameters)
- [Page Slugs](https://manual.bubble.io/help-guides/logic/navigation/page-slugs)
- [Single-Page Applications](https://manual.bubble.io/help-guides/logic/navigation/single-page-applications-spa)
- [Multi-Page Applications](https://manual.bubble.io/help-guides/logic/navigation/multi-page-applications)
- [The Page](https://manual.bubble.io/help-guides/design/elements/the-page)
- [Reusable Elements](https://manual.bubble.io/help-guides/design/elements/reusable-elements)
- [Custom Events](https://manual.bubble.io/help-guides/logic/workflows/events/frontend-events/custom-events)
- [Custom States](https://manual.bubble.io/help-guides/data/temporary-data/custom-states)
- [Conditional Formatting](https://manual.bubble.io/core-resources/elements/conditional-formatting)
- [States](https://manual.bubble.io/core-resources/elements/states)
- [Styles](https://manual.bubble.io/help-guides/design/styling/styles)
- [Color Variables](https://manual.bubble.io/help-guides/design/styling/color-variables)
- [Styling](https://manual.bubble.io/help-guides/design/styling)
- [Styles Tab](https://manual.bubble.io/core-resources/bubbles-interface/styles-tab)
- [Visual Elements](https://manual.bubble.io/core-resources/elements/visual-elements)
- [Building Plugin Elements](https://manual.bubble.io/account-and-marketplace/building-plugins/building-elements)
- [Navigation Actions](https://manual.bubble.io/core-resources/actions/navigation)

### Community and Third-Party Guides
- [NoCode Assistant: Groups in Bubble.io](https://nocodeassistant.com/groups-in-bubble/)
- [NoCode Assistant: Group Focus in Repeating Group](https://nocodeassistant.com/how-to-use-a-group-focus-inside-a-repeating-group/)
- [BuildingWithBubble: URL Parameters Guide](https://buildingwithbubble.com/post/url-page-parameters-bubble/)
- [BuildingWithBubble: Horizontal Scrolling Repeating Groups](https://buildingwithbubble.com/post/how-to-create-horizontal-scrolling-repeating-groups/)
- [DEV.to: Reusable Elements Data Passing](https://dev.to/ebereplenty/how-to-use-reusable-elements-in-bubbleio-pass-data-in-out-4292)
- [Nocodable: Custom States Explained](https://www.nocodable-components.com/post/bubble-io-custom-states)
- [Framify: Conditional Formatting](https://framify.io/blog/conditional-formatting-in-bubble-enhancing-ui-ux)
- [Planet No Code: Type of Content](https://www.planetnocode.com/tutorial/type-of-content-when-to-use-page-data-source-in-bubble-io)
- [Nymbl: Styles in Bubble.io](https://www.nymbl.app/blog/how-to-use-styles-in-bubble-io)
- [Chakor: Plugin Development Guide](https://www.thechakor.com/develop-bubble-io-plugins-ultimate-guide)
- [Medium: Responsive Engine Under the Hood](https://medium.com/@mneary/understanding-responsiveness-in-bubble-421fb7ed402c)
