# Transitioning from LHO-Path to Type-Based Routing

The limitation you've hit is exactly the boundary between building a **DOM Path Explorer** (what we just finished) and building a **Typed Abstract Syntax Tree (AST)** (what we ultimately need). 

Because our current script uses the last operator as the unique identifier (`op:plus` vs `ds:Search`), it thinks they are entirely different "states." Since the Bubble DOM does NOT attach `data-type="List of Users"` to the `.spot` elements, the DOM observer has no way of natively knowing that both of those operators produced the exact same output type. 

To prevent you from having to click infinite combinations of expressions, we need to upgrade the graph from an Operator-to-Options router into an **Operator -> Output Type -> Options** router.

## Open Questions

Before we write code to solve this, we have two different paths we can take:

> [!IMPORTANT]
> **Option 1: The Magic Bullet (Reverse-Engineering Bubble's Internal JS)**
> Bubble has the entire Grammar, Type System, and Operator mapping loaded in your browser's memory right now. Instead of manually clicking dropdowns to reverse-engineer it through the UI, we could write a script that dumps Bubble's internal Javascript objects (e.g., examining `window.AppQuery`, `window.app`, or `window.meta_data`) and extracts the **entire master grammar dictionary** in one go. 
> *Pros:* We get 100% accurate types, operator return types, and arguments instantly without clicking. 
> *Cons:* It requires some digging into obfuscated/minified Bubble JS in the console to find where they store it.

> [!NOTE]
> **Option 2: Building the Mappings Manually via the Extension**
> We can intercept the JSON you've already started building and add a manual "Type Definition" layer to it. For example, we explicitly declare that `ds:Search` returns `List<T>`, and `op:plus_element` returns `List<T>`. When the dropdown code evaluates what color to show, it traces the expression, evaluates the type, and highlights the dropdown based on what the *Type* knows, rather than the specific operator.
> *Pros:* Keeps us in control and works regardless of Bubble's minification. 
> *Cons:* We still have to manually map the return types of every operator we encounter.

## Proposed Changes

If we pursue **Option 1**, my next step will be to inject a research script into the page that traverses the `window` object looking for Bubble's property definition objects (things containing keys like `plus_element`, `change_seconds`, etc.) to extract the schema.

If we pursue **Option 2**, we will need to:
1. Extract your current `CL_ExpressionGraph`.
2. Categorize the observed Operators into a `types.json` mapping.
3. Update `expression_analyzer.js` to traverse the expression backwards, look up the return type of the LHO, and merge the exhaustion state based on the calculated return type instead of the raw operator key.

Please let me know which approach you'd prefer to take! Option 1 is heavily recommended if we can pull it off, as it solves the problem permanently and perfectly!
