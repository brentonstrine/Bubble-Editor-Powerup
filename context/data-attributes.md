In the DOM of the Bubble editor, expressions now have data attributes 
to give us information about the different components. Here is a list of 
attributes and values we've recorded so far:

Attribute	Internal (Technical) Value	User-Facing (UI) Label
data-datasource-name	ArbitraryText	Arbitrary text
data-datasource-name	Breakpoint	Custom (576 px)
data-datasource-name	DateTime	Arbitrary date/time
data-datasource-name	Formulas	Calculate formula
data-datasource-name	GetElement	(Any Page Element, e.g. "VAR Active Item")
data-datasource-name	GetParamFromUrl	Get data from page URL
data-datasource-name	Message	(Complex Op: :filtered, :group by, :sorted)
data-datasource-name	PreviousStep	Result of step X
data-datasource-name	Search	Do a search for
data-operator-name	address_text	's ❌ address
data-operator-name	and_	and
data-operator-name	approximate_count	:approximate count
data-operator-name	auto_add_new_artists_boolean	:each item's auto_add_new_artists
data-operator-name	contains	contains
data-operator-name	contains_list	contains list
data-operator-name	convert_to_number	:converted to number
data-operator-name	count	:count
data-operator-name	equals	is
data-operator-name	first_element	:first item
data-operator-name	get_data	's value
data-operator-name	get_group_data	's Property (e.g. 's Junkbin_Box)
data-operator-name	get_list_data	's List Property
data-operator-name	intersect_with	intersect with
data-operator-name	is_empty	is / :each item is empty
data-operator-name	is_false	is no
data-operator-name	is_not_empty	is not empty
data-operator-name	is_true	is yes
data-operator-name	is_visible	is visible
data-operator-name	keywords_list_text	's Keywords (List of Text)
data-operator-name	last_element	:last item
data-operator-name	limit_to	:items until #
data-operator-name	list_from	:items from #
data-operator-name	make_static	:make static
data-operator-name	merged_with	merged with
data-operator-name	minus_element	:minus item
data-operator-name	minus_list	:minus list
data-operator-name	not_contains	doesn't contain
data-operator-name	not_equals	is not
data-operator-name	or_	or
data-operator-name	plus_element	:plus item
data-operator-name	random_element	:random item
data-operator-name	specific_item	:item #
data-operator-name	to_base64	:encoded in base64
data-operator-name	unique	:unique elements
data-operator-name	url	's URL

Note:

[data-datasource-name]: The "Root" of the expression. Usually should be a distinct color to show where the data is coming from.
[data-datasource-name="Message"]: These are the "Configuration Operators" (ones that open popovers). Giving them a unique underline or accent would signal to the user that they can click them to configure things.
[data-operator-name$="_list_"]: Many list properties have this in the internal name. You can use attribute suffix matching (*=) to color all list-returning properties differently.