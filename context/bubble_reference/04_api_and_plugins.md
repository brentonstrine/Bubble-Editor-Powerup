# Bubble.io API Connector & Plugin System: Comprehensive Reference

---

## 1. API Connector Plugin

### 1.1 Overview

The API Connector is a Bubble-built plugin that lets you connect to any service exposing a JSON-based RESTful web API. It supports GET, POST, PUT, DELETE, and PATCH methods. All API Connector calls are routed through Bubble's server by default (with one exception noted below), meaning authentication credentials are kept server-side and encrypted.

### 1.2 Setting Up API Calls

**Step-by-step process:**

1. Install the API Connector plugin from the Plugins tab (it is a Bubble-built plugin).
2. Open the plugin settings and click "Add another API."
3. Give the API a name (this groups related calls together).
4. Set the authentication method at the API level (applies to all calls in that group).
5. Click "Add another call" to define individual endpoints.
6. For each call, specify:
   - **Name** (must be unique across all API calls)
   - **HTTP method**: GET, POST, PUT, DELETE, PATCH
   - **URL**: The full endpoint URL
   - **Use as**: Data or Action (see section 1.6)
   - **Headers**: Key-value pairs
   - **Body** (for POST/PUT/PATCH): JSON or form-data
7. Click "Initialize call" to test it. **Initialization actually executes the call** -- this is important to understand because it hits the real API endpoint.

**Supported HTTP Methods:**
- **GET**: Retrieve data. Typically used with "Use as: Data."
- **POST**: Create resources or send data. Typically used with "Use as: Action."
- **PUT**: Replace/update an entire resource.
- **DELETE**: Remove a resource.
- **PATCH**: Partially update a resource.

### 1.3 Authentication Methods

Authentication is configured at the API group level and automatically applied to all calls within that group.

#### None (Public APIs)
No authentication headers are sent. Suitable for public APIs that do not require credentials.

#### Private Key in Header
- A key-value pair is added as a shared header across all calls in the group.
- Commonly formatted as `Authorization: Bearer YOUR_KEY` or `X-API-Key: YOUR_KEY`.
- The key name and format depend on the external API's requirements.
- Bubble stores the key encrypted on its server; it is never exposed client-side.
- Supports separate development and live keys -- Bubble automatically uses the correct one based on which version of your app is running.

#### OAuth2 User-Agent Flow
Used when API calls are made on behalf of individual users (e.g., connecting to a user's Facebook, LinkedIn, or Google account).

**How it works:**
1. You register your Bubble app with the external service and receive a **Client ID** and **Client Secret**.
2. Configure these in the API Connector's OAuth2 settings along with:
   - **Authorization URL** (where users are redirected to log in)
   - **Token URL** (where Bubble exchanges the auth code for an access token)
   - **Scope** (what permissions to request)
3. When a user triggers the OAuth flow, they are redirected to the external service's login page, authorize your app, and are sent back with an authorization code.
4. Bubble exchanges this code for an access token and stores it per-user.
5. Subsequent API calls include the user's token automatically.

**Mapping OAuth2 grant types to Bubble:**
- **Authorization Code Grant** --> select "User-Agent Flow"
- **Client Credentials Grant** --> select "Custom Token"

#### Custom Token Flow
Similar to the password flow but lets you define the token acquisition call yourself. The response must include at minimum `access_token` and `expires_in` keys. Bubble will automatically renew the token when it expires.

#### Password Flow
Username and password are used to obtain a token from a specified endpoint. The token is renewed automatically by Bubble.

#### Shared Headers
You can define headers at the API group level that are automatically included in every call within that group. This is separate from the authentication method and is useful for things like `Content-Type: application/json` or custom API versioning headers.

### 1.4 Defining API Call Parameters

#### URL Parameters
- Use bracket notation `[parameter_name]` in the URL to create dynamic parameters.
- Example: `https://api.example.com/users/[user_id]/posts?limit=[count]`
- Each bracketed term becomes a configurable parameter.
- Parameters are **private by default** (server-side only). Uncheck "Private" to make them dynamic at runtime (settable from the editor), but only do this for non-sensitive values.

#### Header Parameters
- Added as key-value pairs per call or shared at the API group level.
- Check "Private" to keep them server-side and invisible to end users.
- Common headers: `Content-Type`, `Authorization`, `Accept`, custom headers.

#### Body Parameters (POST/PUT/PATCH)
- Select body type: **JSON (Raw)** or **Form-Data**.
- For JSON bodies, you must also add a header: `Content-Type: application/json`.
- Use `<parameter_name>` (angle brackets) in the raw JSON body for dynamic values.
- Example body:
  ```json
  {
    "name": "<name>",
    "email": "<email>",
    "role": "user"
  }
  ```
- Each angle-bracketed term becomes a parameter you can set dynamically.

#### Private vs. Client-Safe Parameters
- **Private** (default): Stored on Bubble's server only. Never sent to the user's browser. Use for API keys, secrets, tokens.
- **Client-safe** (unchecked "Private"): Sent to the browser. Can be set dynamically in the Bubble editor. Use only for non-sensitive values like search queries or user IDs.

**Critical security rule:** API keys, passwords, and secrets should ALWAYS be marked as Private. They are stored encrypted on Bubble's server.

### 1.5 Dynamic Values in API Calls

- **URL parameters**: Use `[param]` notation. Uncheck "Private" to make them dynamic at runtime.
- **Body parameters (Raw/JSON)**: Use `<param>` notation to create dynamic placeholders.
- **Headers**: Can be made dynamic by unchecking "Private," but this is rarely needed and introduces security concerns.
- **Limitation**: You cannot pass a raw Bubble "List of Things" directly as a parameter. Lists must be formatted as text (e.g., comma-separated or JSON array string) before being sent.

### 1.6 Parsing and Handling API Responses

**Initialization and response mapping:**
1. When you click "Initialize call," Bubble executes the call and displays the JSON response.
2. Bubble automatically maps JSON keys to fields you can reference in the editor.
3. You can rename, ignore, or change the data type of each field in the response.
4. Nested objects and arrays are supported -- Bubble creates sub-types for nested structures.
5. If you change the checkbox settings (like "Include errors"), you must re-initialize.

**Raw body text:**
An experimental feature that gives you access to the raw response body as text. Only accessible when the "Include errors" or "Include headers" checkbox is enabled. Not available when accessing nested fields.

### 1.7 "Use as" Options: Data vs. Action

#### Use as: Data
- The API call becomes a **data source** available via "Get data from an external API."
- Used to populate repeating groups, text elements, or any element that displays data.
- Can be set on the page or on individual elements.
- Only "Data" calls can use the client-side (browser) execution feature.
- Bubble re-fetches the data when the page loads or when parameters change.

#### Use as: Action
- The API call becomes a **workflow action** available under "Plugins" in the workflow editor.
- Used for operations that change state: creating records, sending data, triggering processes.
- The result of an Action call can be used in subsequent workflow steps via "Result of step X."
- Cannot be used directly as a data source for repeating groups.

**When to use which:**
- Displaying external data in your UI --> Data
- Submitting forms, creating records, triggering external processes --> Action
- Need the result in a workflow chain --> Action

### 1.8 Error Handling

#### The "Include errors in response" Checkbox
When checked on an API call:
- Bubble allows workflows to continue even if the API returns an error.
- The error object is exposed with four fields:
  - `error's status code` (number): The HTTP status code (e.g., 400, 401, 404, 500)
  - `error's status message` (text): The HTTP status text
  - `error's body` (text): The response body from the error, often contains detailed error info
  - `error's has returned error` (yes/no): Boolean flag indicating whether an error occurred
- **You must re-initialize the call** after checking/unchecking this option.

#### `_api_c2_returned_an_error`
This is the generic error message Bubble surfaces when an API Connector call fails and the "Include errors" checkbox is NOT enabled. The workflow stops entirely, and no error details are accessible.

#### Workflow-Level Error Handling
- Use "Only when" conditions on subsequent workflow steps to branch based on error status codes.
- Example: "Only when Result of Step 1's error's status code is 200" for the success path.
- Example: "Only when Result of Step 1's error's has returned error is yes" for the failure path.
- Store error responses in your database for debugging and audit trails.

#### Known Limitations
- Error handling in API Workflows (backend) is more limited than in front-end workflows.
- There have been reported bugs where the "Include errors" checkbox does not always work as expected.
- The "Unhandled error" event may not always trigger for API Connector errors.

---

## 2. Plugin Ecosystem

### 2.1 Plugin Architecture

Plugins extend Bubble apps beyond the core feature set. A plugin can add one or more of the following:

- **Visual Elements**: Custom UI components (e.g., rich text editors, charts, slideshows, maps). In edit mode, community-built elements display a placeholder image rather than rendering live.
- **Actions**: Workflow actions that execute logic or connect to external services. Can be client-side or server-side.
- **Data Sources**: API connections that return data for use in elements (via "Get data from API").
- **Events**: Custom events that can trigger workflows (e.g., "When element X detects a change").
- **Background Services**: Code injected into page headers for analytics, tracking, or other background functionality.
- **Authentication Methods**: OAuth-based login providers.

### 2.2 Client-Side vs. Server-Side Plugin Actions

**Client-side actions:**
- Run in the user's browser.
- Good for: Page interactions, analytics, token generation, DOM manipulation.
- Have access to the browser environment and page elements.
- Cannot directly access Bubble's database or server-side resources.

**Server-side actions:**
- Run on Bubble's server in a Node.js environment.
- Good for: External API calls with secrets, computations, algorithms, data processing.
- Can return data that subsequent workflow actions can use.
- Can use Node.js modules (specified via package.json in the plugin editor).
- Cannot access Option Sets.
- First execution may have a "cold start" delay while Bubble installs required modules.

### 2.3 Essential Plugins

#### API Connector (by Bubble)
The foundational plugin for all external API integrations. Covered extensively in Section 1.

#### Toolbox
A Swiss-army-knife plugin that provides:
- **Run JavaScript** action: Execute arbitrary JavaScript in workflows.
- **Server Script** action: Run server-side JavaScript with Node.js.
- **Expression** element: Evaluate dynamic expressions.
- String manipulation, date operations, list management, color conversions.
- Copy-to-clipboard, smooth scrolling, file downloads.
- Cookie management, local storage access, URL parameter parsing.
- Browser detection and session handling.
- Often replaces five or six specialized plugins.
- Free with attribution; paid license removes branding.

#### List Shifter
Performs advanced list operations that Bubble's native list handling cannot do efficiently:
- Multi-field sorting, advanced filtering, list comparison.
- Reverse, rotate, iterate over, and swap items in lists.
- Statistical functions: sums, averages, distributions.
- Intersection and difference operations between lists.
- Client-side processing that reduces server load.
- Pagination support.

#### Other Notable Plugins
- **Rich Text Editor (Tiptap)**: Advanced WYSIWYG text editing.
- **Algolia / Fuzzy Search**: Full-text search beyond Bubble's native search.
- **Stripe**: Payment processing, subscriptions, invoicing.
- **Progressive Web App (PWA)**: Makes Bubble apps installable on mobile devices.
- **Ionic Elements**: Mobile-optimized UI components.
- **Zeroqode AWS File Uploader**: Direct uploads to S3 buckets.

### 2.4 Plugin Elements vs. Native Elements

| Aspect | Native Elements | Plugin Elements |
|--------|----------------|-----------------|
| Rendering in editor | Live preview | Placeholder image |
| Performance | Optimized by Bubble | Varies by plugin |
| Updates | Automatic with Bubble | Dependent on plugin author |
| Customization | Limited to Bubble's options | Often more flexible |
| Data binding | Standard Bubble data | May have custom data patterns |
| Events/Actions | Core events | Custom events and actions |

### 2.5 Plugin Performance Considerations
- Load only required plugins on each page, not every plugin site-wide.
- Test page load times with and without specific plugins.
- Utility plugins (Toolbox) have minimal performance impact.
- Plugins with heavy client-side libraries can slow initial page load.
- 50 MB hard limit on responses from plugin API calls.

---

## 3. Webhook & External Integration Patterns

### 3.1 Receiving Webhooks (Backend API Workflows)

Bubble can receive incoming HTTP requests from external services via Backend API Workflows.

**Setup process:**

1. **Enable Backend Workflows**: Go to Settings --> API tab --> Enable "Backend Workflows."
2. **Create the endpoint**: In the Backend Workflows editor, click "Add a backend workflow" --> "New API workflow."
3. **Name it URL-friendly**: Use kebab-case (e.g., `stripe-webhook`, `sendgrid-event`). The name becomes the endpoint path.
4. **Check "Expose as public API workflow"**: This makes the endpoint accessible from external systems. Only check this for endpoints that need external access.
5. **Configure HTTP method**: POST by default. Some webhook providers require GET.
6. **Set authentication**: Options are "No authentication," "Anyone who authenticates," or "Admin API token only."
7. **Check "Return 200"**: Important when the webhook sender expects a 200 response (most do).

**Endpoint URL format:**
```
https://appname.bubbleapps.io/api/1.1/wf/workflow-name
```
Or with a custom domain:
```
https://yourdomain.com/api/1.1/wf/workflow-name
```

**Auto-detecting webhook parameters:**
- Bubble can "listen" for an incoming request and auto-detect parameters.
- Send a test request (with sample data) to: `https://appname.bubbleapps.io/version-test/api/1.1/wf/endpoint-name/initialize`
- Bubble parses the incoming JSON and creates parameters with inferred data types.
- After detection, you can rename parameters, change types, or ignore keys.

### 3.2 Exposing Bubble Data via the Data API

**Enabling the Data API:**
1. Go to Settings --> API.
2. Check "This app exposes a Data API."
3. Select which data types to expose (individually).
4. Apply Privacy Rules to control field-level access.

**Available operations:**
- Search/list records (with constraints)
- Read individual records by ID
- Create new records
- Modify existing records
- Delete records

**Auto-generated Swagger documentation:**
Bubble automatically generates an OpenAPI/Swagger spec at:
```
https://appname.bubbleapps.io/api/1.1/meta/swagger.json
```
You can use this with Swagger UI or import it into tools like Postman. You can optionally hide the Swagger documentation in settings.

### 3.3 Authenticating External API Calls to Bubble

**Two authentication approaches:**

#### As a User (Bearer Token)
1. Call the login endpoint with user credentials to get a bearer token.
2. Include the token in the `Authorization` header: `Bearer TOKEN_VALUE`.
3. Privacy Rules apply based on the authenticated user's permissions.
4. Tokens should be passed in headers, never in URL query strings.

#### As an Admin (API Token)
1. Generate an admin API token in Bubble's Settings --> API tab.
2. Include it in the `Authorization` header: `Bearer ADMIN_TOKEN`.
3. Grants full administrator access (equivalent to the app developer).
4. Use sparingly and only for server-to-server integrations.

**Security best practices:**
- Always use Privacy Rules on exposed data types.
- Prefer user-level authentication over admin tokens when possible.
- Never pass tokens in URLs.
- The Swagger file exposes endpoint structure but security is enforced via auth and Privacy Rules, not obscurity.

---

## 4. Performance with API Calls

### 4.1 Rate Limits

**Bubble's own rate limits:**
- Legacy plans: 1,000 requests/minute per application (shared between Live and Development).
- Each additional capacity unit above 2 adds 1,000 API calls/minute/unit.
- Exceeding the limit returns HTTP 429 (Too Many Requests).
- Enterprise/dedicated plans have higher or configurable limits.

**External API rate limits:**
- Separate from Bubble's workload limits.
- API Connector calls route through Bubble's shared servers, so rate limits from external APIs may be hit by multiple Bubble apps sharing the same IP range.
- Client-side calls (when available) bypass this shared IP issue.

### 4.2 Handling Slow External APIs

- **Backend workflows**: Offload slow API calls to asynchronous backend workflows. The user's workflow continues without waiting.
- **Scheduled workflows**: For non-time-sensitive operations, schedule API calls to run later.
- **Timeout limits**: Database searches time out after 10 seconds. API calls have their own timeout limits.
- **Streaming API**: Bubble supports streaming API connections. Client-side streaming lets the workflow continue as soon as data starts arriving. Server-side streaming blocks until the stream is complete.

### 4.3 Caching Strategies

**Database caching:**
- Store frequently accessed API responses in your Bubble database.
- Example: Cache weather data for 30 minutes instead of calling the API on every page load.
- Can reduce API calls by 80% or more.
- Use a timestamp field to track freshness and a scheduled workflow to refresh.

**Scheduled pre-fetching:**
- Use scheduled backend workflows to call external APIs periodically and store results.
- Users then read from your database (fast) instead of waiting for external API calls (slow).

**No native HTTP caching:**
- Bubble does not provide built-in HTTP response caching for API Connector calls.
- You must implement caching logic manually using database storage or custom states.

### 4.4 Server-Side vs. Client-Side API Calls

#### Server-side (default)
- All API calls route through Bubble's server by default.
- Required for any call that uses authentication, private parameters, or headers.
- Counts against Bubble's workload/capacity.
- Shares external API rate limits with other Bubble apps on the same server.

#### Client-side ("Run on the client" checkbox)
Available **only** when ALL of these conditions are met:
- Authentication is set to "None."
- No headers are defined (or all headers are client-safe).
- No private parameters exist.
- The call is set to "Use as: Data" (not Action).

**Benefits of client-side:**
- Does not count against Bubble's API call quotas.
- Avoids shared rate limiting from external APIs.
- Potentially faster (no server round-trip through Bubble).

**When to use which:**
- Authenticated calls --> always server-side
- Public data fetching (e.g., public search APIs) --> consider client-side
- Any call with secrets/tokens --> must be server-side
- Action calls --> always server-side

### 4.5 Hard Limits

| Limit | Value |
|-------|-------|
| Maximum API response size | 50 MB |
| Maximum total header size | 8,000 characters |
| Maximum total key size | 20,000 characters |
| Simultaneous database triggers | 20 (remainder queued) |
| Search timeout | 10 seconds |

---

## 5. Common Integration Patterns

### 5.1 Document Generation (Docmosis)

**Pattern**: Bubble form --> API Connector POST --> Docmosis Cloud --> PDF returned

**Setup:**
1. Create a Docmosis Cloud account and upload a Microsoft Word template.
2. In the API Connector, create a POST call to the Docmosis Cloud rendering endpoint.
3. Send form data as JSON body parameters that map to template merge fields.
4. Docmosis merges the data with the template and returns a PDF.

**Tips:**
- For date/time fields, use "Simplified Extended ISO" format and let the template handle final formatting.
- For multi-line text, use Bubble's "find and replace" function to convert line breaks to `\n` before sending (JSON newline character).
- Store generated PDFs in Bubble's file storage or upload to S3.

### 5.2 Email Services (SendGrid)

Bubble uses SendGrid as its built-in email provider, but you can also integrate directly:

**Built-in integration:**
- Configure in Settings --> Domain & Email.
- Supports template IDs for SendGrid templates.
- File attachments up to 19 MB total (must be stored on Bubble's file storage).
- Maximum 50 recipients per email (due to shared SendGrid rate limiting).

**Direct API integration via API Connector:**
- Install the SendGrid plugin or use the API Connector for full SendGrid API access.
- Set up the SendGrid API key in the API Connector with Private Key in Header authentication.
- Create calls for sending transactional emails, managing contacts, etc.
- Gives more control over templates, dynamic content, and tracking than the built-in integration.

**Webhook integration (inbound):**
- Configure SendGrid Event Webhooks to POST to a Bubble backend API workflow.
- Receive delivery notifications, open/click tracking, bounce events.

### 5.3 File Storage (AWS S3)

**Three approaches:**

#### Approach 1: Zeroqode AWS File Uploader Plugin
- Generates presigned URLs server-side.
- Uploads files directly from the browser to S3 (bypassing Bubble's server).
- Two-step workflow: Generate presigned URL, then Upload file.
- Note: Conflicts with Bubble's native Multi-File Uploader Dropzone plugin.

#### Approach 2: API Connector Direct Integration
- Set up POST calls to S3's REST API via the API Connector.
- Requires configuring: Content-Type, ACL, AWSAccessKeyId, policy, and signature.
- More complex but no third-party plugin dependency.

#### Approach 3: Presigned URL via Backend Workflow
- Create a backend workflow that generates a presigned URL using server-side JavaScript (Toolbox plugin).
- Return the URL to the client for direct browser-to-S3 upload.
- Most secure approach as AWS credentials never leave the server.

**AWS-side requirements:**
- Create an S3 bucket with appropriate permissions.
- Generate IAM access and secret keys.
- Configure CORS on the bucket to allow uploads from your Bubble domain.

### 5.4 Authentication Services (OAuth Flows)

**For "Login with X" flows (e.g., Google, Facebook, GitHub):**
1. Register your Bubble app with the OAuth provider.
2. In the API Connector, set authentication to "OAuth2 User-Agent Flow."
3. Configure Client ID, Client Secret, Authorization URL, Token URL, and Scope.
4. Add a "Signup/login with [Provider]" action in your workflow.
5. Bubble handles the redirect, token exchange, and user creation.
6. The user's access token is stored per-user for subsequent API calls.

**For service-to-service OAuth (Client Credentials):**
1. Use the "Custom Token" authentication method.
2. Define the token endpoint and required parameters.
3. Bubble automatically handles token refresh.

**Common challenges:**
- OAuth2 integrations in Bubble can be complex for non-standard providers.
- Some providers require specific redirect URI formats.
- Token management (refresh, expiration) is handled automatically by Bubble for standard flows.
- Third-party services like Pathfix can simplify complex OAuth setups.

---

## Quick Reference: API Connector Checklist

- [ ] Choose the correct HTTP method (GET/POST/PUT/DELETE/PATCH)
- [ ] Set authentication at the API group level
- [ ] Add shared headers for the API group (Content-Type, etc.)
- [ ] Use `[param]` in URLs for dynamic URL parameters
- [ ] Use `<param>` in JSON bodies for dynamic body parameters
- [ ] Mark sensitive parameters as Private
- [ ] Set "Use as" to Data (for displaying) or Action (for workflows)
- [ ] Initialize every call before using it in the editor
- [ ] Enable "Include errors in response" for production error handling
- [ ] Re-initialize after changing checkbox settings
- [ ] Use separate dev and live API keys
- [ ] Consider client-side execution for public, unauthenticated data calls

---

## Sources

- [Bubble Docs: The API Connector](https://manual.bubble.io/help-guides/integrations/api/the-api-connector)
- [Bubble Docs: Authentication](https://manual.bubble.io/help-guides/integrations/api/the-api-connector/authentication)
- [Bubble Docs: API Connector Security](https://manual.bubble.io/help-guides/security/api-security/api-connector-security)
- [Bubble Docs: Adding Calls](https://manual.bubble.io/core-resources/api/the-api-connector/adding-calls)
- [Bubble Docs: Building Plugins](https://manual.bubble.io/account-and-marketplace/building-plugins)
- [Bubble Docs: What Plugins Can Do](https://manual.bubble.io/help-guides/integrations/using-plugins/what-plugins-can-do)
- [Bubble Docs: Building Actions](https://manual.bubble.io/account-and-marketplace/building-plugins/building-actions)
- [Bubble Docs: The Workflow API](https://manual.bubble.io/core-resources/api/the-bubble-api/the-workflow-api)
- [Bubble Docs: The Data API](https://manual.bubble.io/core-resources/api/the-bubble-api/the-data-api)
- [Bubble Docs: Hard Limits](https://manual.bubble.io/help-guides/maintaining-an-application/performance-and-scaling/hard-limits)
- [Bubble Docs: Client-side and Server-side](https://manual.bubble.io/help-guides/security/client-side-and-server-side)
- [Bubble Docs: Streaming API](https://manual.bubble.io/help-guides/integrations/api/the-api-connector/streaming-api)
- [Airdev: Using Bubble's API Connector](https://www.airdev.co/post/using-bubbles-api-connector)
- [Docmosis: Generate PDF from Bubble](https://resources.docmosis.com/integrations/generate-a-document-from-bubble)
- [RapidDev: Bubble + SendGrid Integration](https://www.rapidevelopers.com/bubble-integrations/sendgrid)
- [RapidDev: Bubble + AWS S3 Integration](https://www.rapidevelopers.com/bubble-integrations/aws-s3)
- [Minimum Code: Top Bubble Plugins 2026](https://www.minimum-code.com/blog/best-bubble-plugins)
- [Zeroqode: AWS File Uploader Plugin Docs](https://docs.zeroqode.com/plugins/aws-file-uploader-plugin)
