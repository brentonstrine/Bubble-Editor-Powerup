# Inferred Type Schema Rules

Based strictly on the snippets extracted from Bubble's internal `edit.js` architecture, here are the exact compiler rules Bubble uses for its **Core Types**. 

*Key:*
* `LHO Type` = The type the operator is attached to.
* `operator` = The internal message ID
* `RHO Type` = The expected argument type (`null` means it expects none, or uses a popover configuring spot data).
* `Return Type` = The type the expression evaluates to after this operator.
* `[T]` = A dynamic inner type (e.g. `User`, `Text`, `Number`). `List<T>` means a list of those.

## 1. TEXT
These rules apply when the `LHO` evaluates to `text` or `uid` or `key_combination`.

| LHO Type | Operator (`op`) | RHO Type (`arg_btype`) | Return Type (`ret_btype`) |
|----------|-----------------|------------------------|---------------------------|
| Text | `equals` | `text` | `sys.bool` |
| Text | `not_equals` | `text` | `sys.bool` |
| Text | `contains` | `text` | `sys.bool` |
| Text | `not_contains` | `text` | `sys.bool` |
| Text | `is_empty` | `null` | `sys.bool` |
| Text | `is_not_empty` | `null` | `sys.bool` |
| Text | `to_capitalized_words`| `null`| `text` |
| Text | `to_uppercase` | `null` | `text` |
| Text | `to_lowercase` | `null` | `text` |
| Text | `format_text` | `null` | `text` |
| Text | `length`*(UID only)*| `null` | `number` |
| Text | `trimmed`*(UID only)*| `null`| `text` |
| Text | `truncated`*(UID only)*| `number`| `text` |
| Text | `truncated_right`*(UID only)*| `number`| `text` |

## 2. NUMBER
These rules apply when the `LHO` evaluates to `number`.

| LHO Type | Operator (`op`) | RHO Type (`arg_btype`) | Return Type (`ret_btype`) |
|----------|-----------------|------------------------|---------------------------|
| Number | `format_number` | `null` | `text` |
| Number | `equals` | `number` | `sys.bool` |
| Number | `not_equals` | `number` | `sys.bool` |
| Number | `greater_than` | `number` | `sys.bool` |
| Number | `greater_or_equal_than`| `number` | `sys.bool` |
| Number | `less_than` | `number` | `sys.bool` |
| Number | `less_or_equal_than`| `number` | `sys.bool` |
| Number | `plus` | `number` | `number` |
| Number | `minus` | `number` | `number` |
| Number | `times` | `number` | `number` |
| Number | `divide` | `number` | `number` |
| Number | `power` | `number` | `number` |
| Number | `round` | `number` | `number` |
| Number | `floor` | `null` | `number` |
| Number | `ceil` | `null` | `number` |
| Number | `to_range` | `number` | `number_range` |
| Number | `max` | `number` | `number` |
| Number | `min` | `number` | `number` |
| Number | `modulo` | `number` | `number` |
| Number | `is_empty` | `null` | `sys.bool` |
| Number | `is_not_empty` | `null` | `sys.bool` |

## 3. BOOLEAN (yes / no)
| LHO Type | Operator (`op`) | RHO Type (`arg_btype`) | Return Type (`ret_btype`) |
|----------|-----------------|------------------------|---------------------------|
| Boolean | `is_true` | `null` | `sys.bool` |
| Boolean | `is_false` | `null` | `sys.bool` |
| Boolean | `and_` | `sys.bool` | `sys.bool` |
| Boolean | `or_` | `sys.bool` | `sys.bool` |
| Boolean | `not_equals` | `sys.bool` | `sys.bool` |
| Boolean | `format_boolean`| `null` | `text` |
| Boolean | `format_boolean_number`| `null`| `number` |

## 4. DATES AND DATE INTERVALS
| LHO Type | Operator (`op`) | RHO Type (`arg_btype`) | Return Type (`ret_btype`) |
|----------|-----------------|------------------------|---------------------------|
| Date | `equals` | `date` | `sys.bool` |
| Date | `not_equals` | `date` | `sys.bool` |
| Date | `greater_than` | `date` | `sys.bool` |
| Date | `less_than` | `date` | `sys.bool` |
| Date | `minus` | `date` | `dateinterval` |
| Date | `to_range` | `date` | `date_range` |
| Date | `max` | `date` | `date` |
| Date | `min` | `date` | `date` |
| Date | `plus_seconds` | `number` | `date` |
| Date | `plus_minutes` | `number` | `date` |
| Date | `plus_hours` | `number` | `date` |
| Date | `plus_days` | `number` | `date` |
| Date | `plus_months` | `number` | `date` |
| Date | `plus_years` | `number` | `date` |
| Date | `change_seconds`| `number` | `date` |
| Date | `change_minutes`| `number` | `date` |
| Date | `change_hours` | `number` | `date` |
| Date | `change_time` | `date` | `date` |
| Date | `change_date` | `number` | `date` |
| Date | `change_month`  | `number` | `date` |
| Date | `change_years`  | `number` | `date` |
| Date | `equals_rounded_down`| `date`| `sys.bool` |
| Date | `format_date` | `null` | `text` |
| Date | `extract_from_date`| `null`| `number` |
| Date | `rounded_down`  | `null` | `date` |
| Date | `is_empty` | `null` | `sys.bool` |
| Date | `is_not_empty` | `null` | `sys.bool` |
| ~ Date Interval | `to_days` | `null` | `number` |
| ~ Date Interval | `to_hours` | `null` | `number` |
| ~ Date Interval | `to_minutes` | `null` | `number` |
| ~ Date Interval | `to_seconds` | `null` | `number` |

## 5. RANGES (Number Range / Date Range)
| LHO Type | Operator (`op`) | RHO Type (`arg_btype`) | Return Type (`ret_btype`) | Notes |
|----------|-----------------|------------------------|---------------------------|-------|
| `Range<T>`| `equals` | `Range<T>`| `sys.bool` | Displays as ` is `. |
| `Range<T>`| `not_equals` | `Range<T>`| `sys.bool` | Displays as ` is not `. |
| `Range<T>`| `min` | `null` | `[T]` | `:min` (Number) or `:start` (Date). |
| `Range<T>`| `max` | `null` | `[T]` | `:max` (Number) or `:end` (Date). |
| `Range<T>`| `average` | `null` | `[T]` | `:average` (Number) or `:center` (Date). |
| `Range<T>`| `is_empty` | `null` | `sys.bool` | Displays as ` is empty`. |
| `Range<T>`| `is_not_empty`| `null` | `sys.bool` | Displays as ` is not empty`. |
| `Range<T>`| `range_contains`| `Range<T>`| `sys.bool` | Displays as ` contains range `. |
| `Range<T>`| `range_contains_point`| `T` | `sys.bool` | Displays as ` contains [T] `. |
| `Range<T>`| `range_contained_by`| `Range<T>`| `sys.bool` | Displays as ` is contained by `. |
| `Range<T>`| `range_overlaps`| `Range<T>`| `sys.bool` | Displays as ` overlaps with `. |
| `Range<T>`| `range_greater_than`| `Range<T>`| `sys.bool` | Displays as ` is greater range `. |
| `Range<T>`| `range_greater_than_point`| `T` | `sys.bool` | Displays as ` is greater [T] `. |
| `Range<T>`| `range_less_than`| `Range<T>`| `sys.bool` | Displays as ` is smaller range `. |
| `Range<T>`| `range_less_than_point`| `T` | `sys.bool` | Displays as ` is smaller [T] `. |

## 6. GEOGRAPHIC ADDRESS
| LHO Type | Operator (`op`) | RHO Type (`arg_btype`) | Return Type (`ret_btype`) |
|----------|-----------------|------------------------|---------------------------|
| GeoAddress| `formatted_address`| `null`| `text` |
| GeoAddress| `google_map_link`| `null` | `text` |
| GeoAddress| `apple_map_link` | `null` | `text` |
| GeoAddress| `distance_from` *(requires Origin Address properties)*| `null`| `number` |

## 7. IMAGE & FILE
| LHO Type | Operator (`op`) | RHO Type (`arg_btype`) | Return Type (`ret_btype`) |
|----------|-----------------|------------------------|---------------------------|
| Image | `imgix_treatment`| `null` | `image` |
| Image | *(gets all properties from File, but File messages function was abstracted away unfortunately)* | | |

---

## 8. LIST RULES
These rules apply when the `LHO` evaluates to `List<T>`.

| LHO Type | Operator (`op`) | RHO Type (`arg_btype`) | Return Type (`ret_btype`) |
|----------|-----------------|------------------------|---------------------------|
| `List<T>` | `count` | `null` | `number` |
| `List<T>` | `approximate_count` | `null` | `number` |
| `List<T>` | `first_element` | `null` | `[T]` *(strips list)* |
| `List<T>` | `last_element` | `null` | `[T]` |
| `List<T>` | `random_element`| `null` | `[T]` |
| `List<T>` | `specific_item` | `number` | `[T]` |
| `List<T>` | `contains` | `[T]` | `sys.bool` |
| `List<T>` | `not_contains` | `[T]` | `sys.bool` |
| `List<T>` | `limit_to` | `number` | `List<T>` |
| `List<T>` | `list_from` | `number` | `List<T>` |
| `List<T>` | `contains_list` | `List<T>` | `sys.bool` |
| `List<T>` | `join` | `text` | `text` |
| `List<T>` | `plus_element` | `[T]` | `List<T>` |
| `List<T>` | `minus_element` | `[T]` | `List<T>` |
| `List<T>` | `minus_list` | `List<T>` | `List<T>` |
| `List<T>` | `merged_with` | `List<T>` | `List<T>` |
| `List<T>` | `intersect_with`| `List<T>` | `List<T>` |
| `List<T>` | `unique` | `null` | `List<T>` |
| `List<T>` | `filtered` | `null` | `List<T>` |
| `List<T>` | `sorted` | `null` | `List<T>` |
| `List<T>` | `ranked_by` | `null` | `List<T>` |
| `List<T>` | `format_as_text`| `null` | `text` |
| `List<T>` | `make_static` | `null` | `List<T>` |

### List Math Operators
Only available if the list's `[T]` is `number` or `date`.
| LHO Type | Operator (`op`) | RHO Type | Return Type (`ret_btype`) |
|----------|-----------------|----------|---------------------------|
| `List<Number>` | `sum` | `null` | `number` |
| `List<Number>` | `product` | `null` | `number` |
| `List<Number/Date>` | `average` | `null` | `number` or `date` |
| `List<Number/Date>` | `median` | `null` | `number` or `date` |
| `List<Number/Date>` | `min` | `null` | `number` or `date` |
| `List<Number/Date>` | `max` | `null` | `number` or `date` |

---

## 9. DYNAMIC TYPES (App Data & Option Sets)
Bubble handles Custom Data Types and Option Sets dynamically by generating operators directly from the developer's application schema.

For every field on a Data Type, or attribute on an Option Set, `edit.js` generates a valid operator lookup. 

| LHO Type | Operator (`op`) | RHO Type | Return Type (`ret_btype`) |
|----------|-----------------|----------|---------------------------|
| `custom.[TypeName]` | `equals` / `not_equals` | `custom.[TypeName]` | `sys.bool` |
| `custom.[TypeName]` | `[fieldName]` *(displays as `'s [fieldName]`)* | `null` | `[Field Type]` (e.g. `list.custom.cars`) |
| `custom.[TypeName]` | `Creator` | `null` | `user` |
| `custom.[TypeName]` | `Creation Date` | `null` | `date` |
| `custom.[TypeName]` | `Modified Date` | `null` | `date` |
| `custom.[TypeName]` | `Slug` | `null` | `text` |
| `custom.[TypeName]` | `unique id` | `null` | `text` |
| `custom.[TypeName]` | `link` | `text (Page)` | `text` |
| | | | |
| `option_set.[Name]` | `equals` / `not_equals` | `option_set.[Name]` | `sys.bool` |
| `option_set.[Name]` | `[attrName]` *(displays as `'s [attrName]`)* | `null` | `[Attribute Type]` |
## 11. SUPPLEMENTARY OPERATORS (Recently Discovered)
These operators were extracted from `edit.js` source code based on Bubble's documentation references.

### 11.1 Shared
| LHO Type | Message / Display | Target | Return Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `any` | `:formatted as JSON-safe` | `null` | `text` | Encodes values for JSON. |
| `any` | `:defaulting to` | `T` (Same type) | `T` | Provides fallback value if null. |
| `any` | `:converted to list` | `null` | `List<T>` | Turns singular item into list. |
| `any` | `is in` | `List<T>` | `sys.bool` | Maps to `is_contained_by_list`. |
| `any` | `isn't in` | `List<T>` | `sys.bool` | Maps to `is_not_contained_by_list`. |

### 11.2 Text Extensions
| LHO Type | Message / Display | Target | Return Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `text` | `:extract` | `[popover config]` | `text` | Configures domains, aliases, etc. |
| `text` | `:extract with Regex`| `text` | `List<text>` | Maps to `extract_regex`. |
| `text` | `:split by` | `text` | `List<text>` | Delimiter-based string split. |
| `text` | `:find & replace` | `[popover config]` | `text` | Maps to `find_replace`. |
| `text` | ` append ` | `text` | `text` | String concatenation. |
| `text` | `:number of characters` | `null` | `number` | String length. |
| `text` | `:trimmed` | `null` | `text` | Whitespace trim. |
| `text` | `:used as...` | `file` or `image` | `file / image` | Maps string URL to Bubble file. |

### 11.3 File Extensions
| LHO Type | Message / Display | Target | Return Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `file / image` | `'s file name` | `null` | `text` | Extracts file name. |
| `file / image` | `'s URL` | `null` | `text` | Resolves standard S3 URL. |
| `file / image` | `:saved to Bubble storage` | `null` | `file / image` | Uploads file to Bubble's S3. |
| `file / image` | `:encoded in base64` | `null` | `text` | Generates base64 string. |

### 11.4 Geographic Address Extensions
| LHO Type | Message / Display | Target | Return Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `geographic_address` | `'s latitude` | `null` | `number` | Extracts numerical latitude. |
| `geographic_address` | `'s longitude` | `null` | `number` | Extracts numerical longitude. |
| `geographic_address` | `'s time zone ID` | `null` | `text` | E.g., 'America/New_York'. |
| `geographic_address` | `'s time zone name` | `null` | `text` | E.g., 'Eastern Standard Time'. |
| `geographic_address` | `'s daylight saving time offset` | `null` | `number` | DST offset value. |
| `geographic_address` | `'s offset from UTC` | `null` | `number` | Raw offset from UTC in minutes. |
| `geographic_address` | `:extract` | `[popover]` | `text` | Address components (cities, states). |

### 11.5 List Operators
| LHO Type | Message / Display | Target | Return Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `List<T>` | `:cached aggregation` | `[popover]` | `number/date` | Specific DB aggregation. |
| `List<T>` | `:group by` | `[popover]` | `List<Group>`| Complex aggregation logic. |
| `List<T>` | `:format as text` | `[popover]` | `text` | Custom text formatting. |
| `List<T>` | `:make static` | `null` | `List<T>` | Freezes dynamic lists. |

### 11.6 User Specifics
| LHO Type | Message / Display | Target | Return Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `user` | `'s email confirmed` | `null` | `sys.bool` | Returns `true` if confirmed. |
| `user` | ` uses password` | `null` | `sys.bool` | Returns `true` if pasword is set. |
| `user` | ` uses 2FA` | `null` | `sys.bool` | Two-factor authentication status. |
| `user` | ` has 2FA backup codes` | `null` | `sys.bool` | 2FA Backup codes status. |
| `user` | ` is using cookies` | `null` | `sys.bool` | Cookie usage acceptance. |
| `user` | `'s active subscriptions` | `null` | `List<iap_subscription_purchase>` | Returns list of subscriptions. |
| `user` | `'s active subscription in ` | `iap_item.subscription_group` | `iap_subscription_purchase` | Single active sub in group. |
| `user` | ` is subscribed to ` | `[popover]` | `sys.bool` | Subscribed to group/variant. |

### 11.7 Custom Types
| LHO Type | Message / Display | Target | Return Type | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `custom` | `'s link` | `text (Page)`| `text` | Generates a dynamic link (Internal `id_link` msg). |


## 12. MISSING / UNVERIFIED OPERATORS 
The following still require mapping:
- `:contains keyword(s)` / `:doesn't contain keyword(s)` (Text)
- `:any field contains` (Text search)


## 10. ELEMENTS
Elements are treated as structured data sources. Every element instance serves as the root of a potential expression (e.g. `Group A's User`). Bubble registers "Universal" states into every single element, and then dynamically injects component-specific states depending on the element's type.

### 10.1 Global Element States
These properties are available on virtually all visual elements.

| LHO Element | Operator (`op`) | Return Type (`ret_btype`) | Description |
|-------------|-----------------|---------------------------|-------------|
| Any Element | `is_visible` | `sys.bool` | is visible |
| Any Element | `isnt_visible` | `sys.bool` | isn't visible |
| Any Element | `is_hovered` | `sys.bool` | is hovered |
| Any Element | `isnt_hovered` | `sys.bool` | isn't hovered |
| Any Element | `is_pressed` | `sys.bool` | is pressed |
| Any Element | `isnt_pressed` | `sys.bool` | isn't pressed |
| Any Element | `is_focused` | `sys.bool` | is focused |
| Any Element | `isnt_focused` | `sys.bool` | isn't focused |
| Any Element | `get_width` | `number` | 's width |
| Any Element | `get_height` | `number` | 's height |
| Any Element | `is_valid` | `sys.bool` | is valid |
| Any Element | `isnt_valid` | `sys.bool` | isn't valid |
| Any Element | `is_clickable` | `sys.bool` | is clickable |
| Any Element | `isnt_clickable` | `sys.bool` | isn't clickable |

### 10.2 Data Containers (Groups, Repeating Groups, Tables)
Elements that hold dynamic "Types of Content".

| LHO Element | Operator (`op`) | Return Type | Logic |
|-------------|-----------------|-------------|-------|
| **Group** | `get_group_data`| `[Type]` | Displays as `'s [Type]` (e.g., `'s User`). Returns single item. |
| **Repeating Group / List / Table** | `get_list_data` | `List<Type>` | Displays as `'s [Type]` (e.g., `'s List of Movies`). Returns full list. |
| **Repeating Group / List / Table** | `get_loading_status` | `sys.bool` | is loading |
| **Repeating Group / List / Table** | `page_number` | `number` | 's page number |
| **Repeating Group / List / Table** | `is_first_page` | `sys.bool` | is on the first page |
| **Repeating Group / List / Table** | `is_last_page` | `sys.bool` | is on the last page |

### 10.3 Form Inputs & Interactive Elements
Input elements provide their value based on their content format.

| LHO Element | Operator (`op`) | Return Type | Logic |
|-------------|-----------------|-------------|-------|
| **Generic Input** | `get_data` | `[Type]` | Displays as `'s value`. Type matches the input format. |
| **Input (Password)**| `get_pw_strength`| `number` | Displays as `'s password strength` |
| **SearchBox**| `get_typed_content`| `text` | Displays as `'s typed text`. |
| **SearchBox (Geo)** | `get_place_name` | `text` | Displays as `'s place name`. |
| **Checkbox**| `get_data` | `sys.bool` | Displays as `is checked`. |
| **File / Image Uploader** | `get_upload_percent` | `number` | Displays as `'s upload percentage`. |
| **File / Image Uploader** | `get_file_size` | `number` | Displays as `'s file size`. |
| **Selectable List / Multidropdown** | `selected_choices` | `[Type]` | 's selected choice (single select) |
| **Selectable List / Multidropdown** | `list_of_selected_choices` | `List<Type>` | 's list of selected choices |
| **Selectable List / Multidropdown** | `list_of_unselected_choices`| `List<Type>` | 's list of unselected choices |
| **Selectable List / Multidropdown** | `range_selection_min` | `number` | 's minimum number of selections |
| **Selectable List / Multidropdown** | `range_selection_max` | `number` | 's maximum number of selections |
| **Selectable List / Multidropdown** | `exact_selection` | `number` | 's number of allowed selections |
| **Selectable List / Multidropdown** | `is_disabled` | `sys.bool` | is disabled |
| **Selectable List Item** | `selected` / `isnt_selected` | `sys.bool` | is selected / isn't selected |

### 10.4 Maps
| LHO Element | Operator (`op`) | Return Type | Logic |
|-------------|-----------------|-------------|-------|
| **Map** | `get_currently_selected_marker` | `[Marker Type]` | 's current marker |
| **Map** | `get_map_center_address` | `geographic_address` | 's center address |
| **Map** | `get_zoom_level` | `number` | 's zoom level |

### 10.5 Tabs and Sheets
| LHO Element | Operator (`op`) | Return Type | Logic |
|-------------|-----------------|-------------|-------|
| **TabItem** | `get_tab_item_selected` | `sys.bool` | is selected |
| **Sheet** | `snap_current` | `number` | 's current snap point |
| **Sheet** | `snap_default` | `number` | 's default snap point |

### 10.6 Custom States
Custom States are user-defined. Bubble loops over the element's custom state definitions and generates an operator for each.

| LHO Type | Operator (`op`) | Return Type | Note |
|----------|-----------------|-------------|------|
| Any Element | `[stateName]` | `[stateType]` | Displays as `'s [State Name]`. |
