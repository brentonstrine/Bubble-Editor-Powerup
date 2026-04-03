# Bubble Operators and Comparisons

## Shared operators
These operators are shared among all types of data.
Note: Bubble does its best to match the 'type' when a custom value is used with the "is" or "is not" operators. For example, in the dynamic expression MyNumber Input's Value is "6", Bubble will treat the "6" as a number since the input is of type Number. If you were to change the input to type Text without changing the dynamic expression, it may register as a missing value in the Issue Checker. If this happens, re-enter the custom value.
### `... is ...`
This checks whether two entries are equal or not. If so, yes is returned.
### `... is not ...`
This checks whether two entries are equal or not. If not, yes is returned.
### `... <> ...`
This checks whether two entries are equal or not in a search constraint.
### `... is empty`
This checks whether the entry is empty, i.e., has no content.
### `... is not empty`
This checks whether the entry is not empty, i.e., has content.
### `:formatted as JSON-safe`
This operator sanitizes a text string, date, yes/no, or list of texts into a JSON-acceptable format by escaping characters (adding a \ so it is not recognized) that would otherwise break expected JSON formatting. This includes characters like line breaks, double quotations, or tabs. For more technical users familiar with Javascript, we are using the JSON.stringify() method in the backend.
When used on a text, the operator will wrap the text in quotations and escape any breaking characters in the middle of the text.
When used on a yes/no value, the operator will convert the value into true or false, as most 3rd party services only know how to handle true/false, not yes/no.
When used on a list of texts, the operator will add quotation marks around each text list entry (and escape any breaking characters).
When used on a date, the operator will convert the input date to the equivalent of “myDate:formatted_as ISO simplified, UTC”.  For example: Jun 17, 2021 12:34 pm → "2021-06-17T10:35:22.941Z"
Note: This method is only suitable for use in sanitizing a text string, a date, yes/no, or a list of texts. It is not designed to support the use case where a user builds a partial or entire json-style object in a multi-line input or :formatted_as_text editor canvas as this operator will escape the double quotes around key value pairs (”) that are otherwise required. Consider instead using Find & Replace ( \ → \\) to escape line breaks if you wish to pass the value of a pre-formatted multi-line input as the key value in an API call.
Example of a pre-formatted multi-line input

## Text type
### `is in`
Returns yes if the value is present in the argument list.
### `is not in`
Returns yes if the value is not present in the argument list.
### `... contains`
This operation tests if the first entry contains the argument. The substring of text should match the sequence of characters of the first entry exactly, including case. This search respects the order of the words in the entry.
For example, searching for 'cat', 'hat', 'cat in', 'cat in the', 'in the hat', 'at in', or 'cat in the hat' would all return the phrase 'the cat in the hat'.
However, searching for 'cat the hat', 'cat hat', or 'Cat' would not return 'the cat in the hat'. This search is useful for returning exact matches for partial words, like searching 'pepp' and returning 'peppers'.
### `... doesn't contain`
This operation tests if the first entry does not contain the argument. It behaves as the opposite of the 'contains' constraint described above.
### `... contains keyword(s)`
This operator tests whether some text contains certain words.
It takes the argument supplied, breaks it up into component words, removes any 'stop' words (short, common words like 'the' or 'a'), and looks for the resulting word(s).
For example, searching for ‘cat hat’, ‘cat in hat’, ‘cat in the hat’, ‘the hat cat’, or ‘hat cat’ would return ‘the cat in the hat’. This does not respect partial words that are not of the same stem, so 'pepp' would not return 'peppers'.
To emphasize, this operator will ignore any short, common words for the search. These short, common words are known as "stop words", and an example of such a list (though this is more illustrative, and not the definitive list involved in Bubble's text searches) can be found here.
### `... doesn't contain keyword(s)`
This operator behaves as the opposite of contains keyword(s) above.
### `... any field contains`
This operator checks all compatible fields on given type for text that contains certain words. The algorithmic behavior is the same as contains keyword(s).
It takes the argument supplied, breaks it up into component words, removes any 'stop' words (short, common words like 'the' or 'a'), and looks for the resulting word(s).
For example, searching for ‘cat hat’, ‘cat in hat’, ‘cat in the hat’, ‘the hat cat’, or ‘hat cat’ would return ‘the cat in the hat’. This does not respect partial words that are not of the same stem, so 'pepp' would not return 'peppers'.
### `:capitalized words`
Returns the text with the first letter of each word capitalized. For example, 'this is bob' becomes 'This Is Bob.'
### `:uppercase`
Returns the text with the all letters capitalized. For example, 'helLo' becomes 'HELLO.'
### `:lowercase`
Returns the text with all lowercase letters. For example, 'HelLo' becomes 'hello.'
### `:append`
Returns the concatenation of the text and the argument.
### `:formatted as ...`
Formats a text in a specific way. Choose from US Phone, URL Encoded, and MD5 Hash.
### `:used as ...`
Uses the URL based text as a file or image representation.
### `:trimmed`
Removes the spaces at the beginning and end of the text. For example, ' fd ' becomes 'fd.'
### `:number of characters`
Returns the number of characters of a text.
### `:truncated to`
Only keeps the first X characters of a text. For example, if you have "supercalifragilisticexpialidocious: truncated to 5," this will return "super."
### `:truncated from end to`
Only keeps the last X characters of a text. For example, if you have "supercalifragilisticexpialidocious: truncated from end to 5," this will return "cious."
### `:extract...`
Extracts text from a text. For example, extract the domain name of an email.
### `:converted to number`
Converts a text value containing numbers into a number value. It takes the user's browser locale setting into consideration for deciphering symbols denoting decimal and thousands separators
### `:split by...`
Returns a List of Texts version of the original string of text, using the argument as the separator between the items. Using a line_break separator will recognize each new line as a separate entry.
### `:find/replace...`
Dynamically defines text to use in find and replace. It returns a new text. The find and replace happens for the entire text.
### `:extract with Regex`
This is an advanced feature that extracts entries from a text using a Regular Expression (regex). For example, if the regex is @\S+and the text is '@one_name and @another_name,' this returns a list of texts: @one_name, @another_name.
Tip: This returns a full list of matches, so sometimes it may return the whole text if that's also a match.
Tip: Bubble uses JavaScript Regex, which handles certain expressions differently than other flavors (such as PHP). Similarly, we do not yet expose capture groups so your expressions might need a little more massaging. For example, consider the following scenario:
You'd like to extract all of the characters in the following urlhttps://domain.com/abc/text-that-i-want after the pattern 'abc/'. A commonly used expression might be abc\/(.*). Used in Bubble, this would extract 'abc/text-that-i-want'. Thus, we need to adjust the expression to (?<=abc/)(.*) to exclude the 'abc/' using a positive lookbehind. This would leave us with just 'text-that-i-want'.
We recommend using a Regex builder to test your expressions before using them in Bubble.
### `:defaulting to`
Returns a default value if the original text is empty.

## Number type
Tip: Numbers on computers are stored in scientific notation and in binary, which means that sometimes the result that you get from a calculation can be off from what you expect. To help ensure that you have a number as close as possible to the expected mathematical result, Bubble automatically rounds the final output of math calculations to 15 significant figures before it is displayed or translated to a non-number type.
Note that if you're performing operations with an end result of more than 15 significant figures, the additional digits may be cut off due to this rounding operation. You can retrieve the additional digits by using the :formatted as operator.
### `is in`
Returns yes if the value is present in the argument list.
### `is not in`
Returns yes if the value is not present in the argument list.
### `:formatted as ...`
Watch our Academy quick tip on how to use this operator
Formats a text in various ways.
Format change: Once a number is formatted, it is considered text and cannot be manipulated as a date. You can convert it back to a number by using :converted to numberoperator.
### `... > ...`
Returns yes if the first number is greater than the second number.
### `... ≥ ...`
Returns yes if the first number is greater than or equal to the second number.
### `... < ...`
Returns yes if the first number is less than the second number.
### `... ≤ ...`
Returns yes if the first number is less than or equal to the second number.
### `... + ...`
Sums the first and second number.
### `... - ...`
Subtracts the second number from the first number.
### `... * ...`
Multiplies the first number by the second number.
### `... / ...`
Divides the first number by the second number.
### `:rounded to`
Rounds the first number so that it has X digits after the decimal. For example, '0.234' becomes '0.23' with an argument of '2,' and '0.5' becomes '1' with an argument of '0.'
### `:floor`
Rounds the number down to the nearest integer. For example, floor '1.234' becomes '1,' and floor '-2.3' becomes '-3.'
### `:ceiling`
Rounds the number up to the nearest integer. For example, ceil '1.234' becomes '2,' and ceil '-2.3' becomes '-2.'
### `... ^ ...`
This defines an exponential equation. The first number is the base, and the second number is the exponent. For example, '2 ^ 3' becomes '8.'
### `<- range ->`
Generates a number range from two numbers and returns a range whose lower bound is the smaller of the two numbers and the higher bound is the larger one.
### `... <- max -> ...`
Returns the larger of the two numbers.
### `... <- min -> ...`
Returns the smaller of the two numbers.
### `... <- modulo -> ...`
Returns the remainder when the first number is divided by the second number. For example, '5 <- modulo -> 2' becomes '1.'
Tip: Use this to figure out if a number is odd or even.

## Number range type
When set to range, the slider input returns two numbers. The type is number range.
### `is in`
Returns yes if the value is present in the argument list.
### `is not in`
Returns yes if the value is not present in the argument list.
### `:min`
Returns the start of the range, the smallest value.
### `:max`
Returns the end of the range, the largest value.
### `:average`
Returns the center of the range by averaging the start and end.
### `contains range`
Takes a first range and a second range. Returns yes if the first range contains the second range. "Contains" means that the start of the second range is greater than or equal to the start of the first range, and the end of the second range is less than or equal to the end of the first range. So, if the two ranges are the same, then this will return yes.
### `contains point`
Takes a range and a single number. Returns yes if the number is contained by the range. It is contained if it is greater than or equal to the start of the range and less than or equal to the end of the range.
### `is contained by`
Takes a first range and a second range. Returns yes if the first range is contained by the second range. "Contains" means that the start of the first range is greater than or equal to the start of the second range, and the end of the first range is less than or equal to the end of the second range. So, if the two ranges are the same, then this will return yes.
overlaps with
Takes a first range and a second range. Returns yes if there are any numbers contained by both ranges. So, if the end of the first range is the start of the second range or vice versa, then this will return yes.
### `is greater`
Takes a first range and a second range. Returns yes if the start of the first range is strictly greater than the end of the second range.
### `is greater (point)`
Takes a range and a number. Returns yes if the start of the first range is strictly greater than the number.
### `is smaller`
Takes a first range and a second range. Returns yes if the end of the first range is strictly less than the start of the second range.
### `is smaller (point)`
Takes a range and a number. Returns yes if the end of the first range is strictly less than the number.

## Date type
This type represents a precise moment in time (measured to the nearest millisecond). When displaying dates, we turn them into an easily readable date and time in the user's current time zone; you can use the "formatted as ..." operator to customize how we display it. If a user in one timezone saves a date, and a second user in a different timezone views the saved date, the second user will see it displayed in their local time zone.
The user's timezone is the timezone as reported by the user's web browser. Most modern browsers report the timezone; in cases where they don't, we make a best-effort attempt to guess what the timezone is from the user's clock settings. When running a workflow, we use the timezone the user was in when they initiated the workflow. For scheduled and recurring workflows, we remember the timezone from when the user initially scheduled the workflow to run. (So if the user runs workflow A, which schedules workflow B to run two days later, then hops on a plan, and runs workflow C in a new timezone, workflows A and B will run in the same timezone; workflow C will run in a different timezone). In situations where a web browser is not involved, such as triggering a workflow to run via Bubble's API, we use UTC time in our calculations.
When doing math with dates, there are two kinds of math: calendar-aware math, where the size of the units of time vary based on things such as the number of days in a month and daylight savings time, and absolute math, where the units you add and subtract have a a fixed number of milliseconds. Most of Bubble's date functions do calendar math. For instance, if a user in the ET timezone in the United States enters the date 'March 11, 2018, 1 am', and uses the '+(days)' operator with a value of 1, they'll see 'March 12, 2018, 1 am' even though, because of daylight savings time, that is actually only 23 hours later, not 24 hours later. Calendar-aware math is always performed relative to the user's current timezone, so it's possible that two users, in two different time zones, could perform the same computation on the same date and get different results.
The main exceptions to this rule are the "+(seconds)" and "+(hours)" operators, which perform absolute math: calling them with an argument of 1 always adds exactly one second and 3,600 seconds respectively to the given moment in time. Note that the "change hours to" and "change seconds to" do perform calendar-aware calculations. Absolute math is not impacted by timezones: if two users in different time zones call "+(seconds)" with the same argument on the same date, they will get the exact same moment in time as the result (though that moment in time will be displayed to them in their local timezone if the result is displayed on the screen).
When performing calendar-aware math, fractional amounts are rounded to the nearest integer, so adding 0.9 days is the same as adding one day. The exception is adding years, which are rounded to the nearest number of months. When performing absolute math, fractions are rounded to the nearest millisecond, so adding 1.2005 seconds will add 1,201 milliseconds.
### `is not in`
Returns no if and only if the value is not present in the argument list.
### `:formatted as ...`
Formats the date.
Format change: Once a date is formatted, it is considered text and cannot be manipulated as a date.
### `<- range ->`
Generates a date range from two dates. This represents a span of time from the moment of the first date to the moment of the second date. Date ranges are a useful tool for representing availabilities or time slots.
### `... +(seconds):`
Creates a new date by adding the given number of seconds to the date, or subtracts that number of seconds if it is a negative number. This performs absolute, not calendar-aware math: we always add exactly one-thousand milliseconds per second.
### `... +(minutes):`
Creates a new date by adding the given number of minutes to the date, or subtracts that number of minutes if it is a negative number. This performs absolute, not calendar-aware math: we always add exactly 60,000 milliseconds per minute.
### `... +(hours):`
Creates a new date by adding the given number of hours to the date, or subtracts that number of hours if it is a negative number. This performs absolute, not calendar-aware math: we always add exactly 3,600,000 milliseconds per hour.
### `... +(days):`
Creates a new date by adding the given number of days to the date, or subtracts that number of days if it is a negative number. This performs calendar-aware math in the user's current timezone. For instance, if adding a day crosses the start of daylight savings time in the user's timezone, this function might add 23 hours instead of 24 hours.
### `... +(months):`
Creates a new date by adding the given number of month to the date, or subtracts that number of months if it is a negative number. This performs calendar-aware math in the user's current timezone. If the final month doesn't contain a corresponding day because it is shorter than the original month, we use the last day of the month, so adding one month to January 30th yields February 28th (or 29th on leap years).
### `... +(years):`
Creates a new date by adding the given number of years to the date, or subtracts that number of years if it is a negative number. This performs calendar-aware math in the user's current timezone.
### `... change seconds to ...`
Creates a new date by setting the seconds in the user's current timezone. For example, 'Wed Aug 12 2015 22:21:42' becomes 'Wed Aug 12 2015 22:21:00' with an argument of '0.' Changing to a value greater than 59 will bubble up to minutes. Whenever you call change seconds, we set the milliseconds to 0. This is so that if you set a date to the same seconds, minutes, hours, day, month, and year, it compares equal with another date set to the same values.
### `... change time to ...`
Modifies a datetime by taking the date portion from the original datetime and combining it with the time portion from another datetime. This allows you to merge a date and time value.
For example, if you have a date selected from a date picker and a time selected from a time picker, you can use this operator to modify the datetime returned by the date picker to match the time in the time picker.
### `... change minutes to ...`
Creates a new date by setting the minutes in the user's current timezone. For example, 'Wed Aug 12 2015 22:21:42' becomes 'Wed Aug 12 2015 22:55:42' with an argument of '55.' Changing to a value greater than 59 will bubble up to hours.
### `... change hours to ...`
Creates a new date by setting the hours in the user's current timezone. For example, 'Wed Aug 12 2015 22:21:42' becomes 'Wed Aug 12 2015 19:21:42' with an argument of '19.' Setting to a value greater than 23 will bubble up to days.
### `... change date (day) to ...`
Creates a new date by setting the days in the user's current timezone.. For example, 'Thu Dec 24 2015 13:35:38' becomes 'Sun Dec 6 2015 13:35:38' with an argument of '6.' Setting to a value greater than the number of days in the current month will change to the next month.
### `... change month to ...`
Creates a new date by setting the month in the user's current timezone. For example, 'Thu Dec 24 2015 13:35:38' becomes 'Tue Feb 24 2015 13:35:38' with an argument of '2.' The second number is the numeric value for the month, e.g., '1' for January, '2' for February, etc. Setting a value greater than 12 will change to the next year. If the new month has fewer days than the current date, this will change the date to the last day of the new month.
### `... change years to ...`
Creates a new date by setting the year in the user's current timezone. For example, 'Wed Aug 12 2015 22:21:42' becomes 'Mon Aug 12 2013 22:21:42' with an argument of '2013.'
### `... > ...`
Returns yes if the first date is after the second date.
### `... < ...`
Returns yes if the first date is before the second date.
### `... - ...`
Subtracts the two dates and returns the difference as a Time difference.
### `Extract from date`
Extracts a component from the date, relative to the passed in timezone. Returns the component as a number. Choose from the following options:
minute (0 - 59)
hour (0 - 23, on the 24-hour clock)
day (of week: Sun = 0, Mon = 1, ... Sat = 6)
date (of month: 1 - 31)
week (of year: 1 - 53. We use the ISO week date system for calculating which week it is, which may differ from local conventions)
month (1 (Jan) - 12 (Dec))
year (e.g. 2,018)
UNIX (in milliseconds: the total number of milliseconds since January 1, 1970 00:00:00 UTC. This is the same format returned by Javascript's Date.now() function, and it is how dates are tracked behind-the-scenes in Bubble. Note that many computer systems measure unix timestamps in seconds: to convert to seconds, divide this value by 1,000.
Rounded down
Round down a date to a given component, relative to the user's current time zone. Returns the rounded date. See 'Extract from date' for options.
Equals rounded down
Returns yes if, when rounding both dates to the given component, the results are identical. See 'Rounded down' for more details.
### `... <- max -> ...`
Returns the later of the two dates.
### `... <- min -> ...`
Returns the earlier of the two dates.

## Date range type
This type is composed of two dates. The range is the time in between. Use this to build scheduling, booking systems, etc.
### `is in`
Returns true if the value is present in the argument list.
### `is not in`
Returns true if the value is not present in the argument list.
### `:start`
Returns the start of the range, the smallest value.
### `:end`
Returns the end of the range, the largest value.
### `:center`
Returns the center of the range by averaging the start and end.
### `contains range`
Takes a first range and a second range. Returns yes if the first range contains the second range. "Contains" means that the start of the second range is greater than or equal to the start of the first range, and the end of the second range is less than or equal to the end of the first range. So, if the two ranges are the same, then this will return yes.
### `contains (point)`
Takes a range and a single date. Returns yes if the date is contained by the range. It is contained if it is greater than or equal to the start of the range and less than or equal to the end of the range.
### `is contained by`
Takes a first range and a second range. Returns yes if the first range is contained by the second range. "Contains" means that the start of the first range is greater than or equal to the start of the second range, and the end of the first range is less than or equal to the end of the second range. So, if the two ranges are the same, then this will return yes.
overlaps with
Takes a first range and a second range. Returns yes if there are any dates contained by both ranges. So, if the end of the first range is the start of the second range or vice versa, then this will return yes.
### `is after`
Takes a first range and a second range. Returns yes if the start of the first range is strictly greater than the end of the second range.
### `is after (point)`
Takes a range and a date. Returns yes if the start of the first range is strictly greater than the date.
### `is before`
Takes a first range and a second range. Returns yes if the end of the first range is strictly less than the start of the second range.
### `is before (point)`
Takes a range and a date. Returns yes if the end of the first range is strictly less than the date.

## Date interval type
This type represents a difference between two dates. It represents a precise number of milliseconds, rather than a calendar-friendly quantity such as "one day". Adding and subtracting Date intervals always performs absolute math, not calendar-aware math. See the Date type above for more information on the difference between calendar-aware math and absolute math.
### `is in`
Returns true if the value is present in the argument list.
### `is not in`
Returns true if the value is not present in the argument list.
### `:format as days`
Formats the difference as a number of days. We calculate this by dividing by 24 hours, then rounding to the nearest tenth (so 298944000 milliseconds becomes 3.5 days).
### `:format as hours`
Formats the difference as a number of hours. We calculate this by dividing by one hour (i.e. 3,600,000 milliseconds) and rounding to the nearest tenth.
### `:format as minutes`
Formats the difference as a number of minutes. We divide through by 60,000 milliseconds and round to the nearest whole number.
### `:format as seconds`
Formats the difference as a number of seconds. We divide through by 1,000 milliseconds and round to the nearest whole number.

## Boolean type
Watch out!
With a yes/no field, there is a difference between "no value" and "no"! If you have a mix of the two, keep in mind that this distinction might show up, for example, when you sort Things by this field.
### `is in`
Returns true if the value is present in the argument list.
### `is not in`
Returns true if the value is not present in the argument list.
### `is "yes"`
Returns yes if the boolean value is true.
### `is "no"`
Returns no if the boolean value is false.
### `... and ....`
Returns the logic AND of two yes/no values. Returns yes if both values are yes.
### `... or ....`
Returns the logic OR of two yes/no values. Returns yes if either of the two values is yes.
### `...:formatted as text`
Formats the result of the yes/no differently. Use this function to change the language of 'yes' and 'no.'
### `...:formatted as number`
Formats the result of the yes/no as a number to use in a calculation. A standard use case is '1' for yes and '0' for no, but you can use any numbers.

## File type
This represents a file, i.e., the link of a file uploaded to the server.
### `is in`
Returns true if the value is present in the argument list.
### `is not in`
Returns true if the value is not present in the argument list.
### `...'s file name`
Extracts the file name from a link. For example, '//s3.amazonaws.com/appforest_uf/id/filename.pdf' returns 'filename.pdf.'
### `...'s URL`
Returns the link of the file.
### `:saved to Bubble Storage`
When saving a file, the link that represents it on the web is saved. If it comes from an external API, it may be hosted elsewhere. To save it to Bubble's server, to use Imgix on for instance, use this option. This occurs only in workflows that save things.
Maximum file size
Existing files with same name
Renaming files
The maximum file size on the :saved to Bubble Storage operator is 50 MB.
### `:encoded in base64`
This fetches the contents of the file and encodes it using base64, which is a common standard used for passing file data. Use this for uploading files to certain APIs that require data in base64 form.
Note: At the moment, this operator only works in server-side workflows. Running it in the web browser returns nothing.
Note: Private files in base64 cannot be decoded through API workflows and the API Connector, as these functions rely on the file to be publicly downloadable.

## Image type
This represents an image, i.e., the link of an image uploaded to the server.
### `is not in`
Returns false if and only if the value is not present in the argument list.
### `...'s file name`
Extracts the file name from a link. For example, '//s3.amazonaws.com/appforest_uf/id/picture.png' returns 'picture.png.'
### `...'s URL`
Returns the link of the image.
### `:saved to Bubble storage`
When saving a file, the link that represents it on the web is saved. If it comes from an external API, it may be hosted elsewhere. To save it to Bubble's server, to use Imgix on for instance, use this option. This occurs only in workflows that save things.
### `:encoded in base64`
This fetches the contents of the file and encodes it using base64, which is a common standard used for passing file data. Use this for uploading files to certain APIs that require data in base64 form.
Note: At the moment, this operator only works in server-side workflows. Running it in the web browser returns nothing.
### `:processed with Imgix`
Processes the image with Imgix. For example, automatically crop the picture to keep the face, enhance it, reduce red eyes, apply sepia effects, etc. See the Imgix documentation for more details.
Note: Only images hosted on Bubble's server can use this feature.
Known Issue
In rare situations, processing an app with Imgix will actually result in a larger file than the original image. If this is happening to you and undesirable, you can add &ignore_imgix to the end of the image's URL to disable Imgix.

## Geographic Address
This represents an address.
### `is in`
Returns true if the value is present in the argument list.
### `is not in`
Returns true if the value is not present in the argument list.
### `...'s formatted address`
This returns a text version of the address, which can be printed in a standard way.
Caution: Once an address is formatted, it is considered text and cannot be manipulated as an address.
### `...'s link to Google Maps`
Returns a link that, when clicked, opens a Google Map window and centers the marker on the position of the current address.
### `...'s link to Apple Maps`
Returns a link that, when clicked, opens Apple Map and centers the marker on the position of the current address.
### `... distance from ...`
Returns the distance between the two addresses, either in the metric or US system.
### `:extract ...`
Extracts particular data from an address, like the country, state, street, etc.
### `...'s latitude`
This returns the latitude of the address as a number.
### `...'s longitude`
This returns the longitude of the address as a number.
### `...'s time zone ID`
This returns the time zone of an address as a string, following the standard encoding returned by Google. See this for more information.
### `...'s time zone name`
Returns the name of the time zone of an address, such as 'Eastern Daylight Time.' This is not what you should use for time zone formatting. Use the ID instead.
### `...'s daylight saving time offset`
The offset for daylight saving time in seconds. This will be zero if the time zone is not in daylight saving time at the current time.
### `...'s offset from UTC (minutes)`
This is the offset from UTC (in minutes) for the given location. This does not take into effect daylight savings.

## List of things
It is common to deal with lists of texts, numbers, things, users, etc. This manipulates these lists. Currently, lists are limited to 10,000 items. Trying to add additional items will result in an error message.
### `... :count`
Our Academy quick tip on how to use :count
Returns the number of items in the list.
### `... contains ...`
Returns yes if the list contains the argument.
### `... doesn't contains ...`
Returns yes if the list does not contain the argument.
### `...:first item`
Watch our Academy quick tip on how to retrieve the first item of a list
Returns the first item of the list.
### `...:last item`
Returns the last item of the list.
### `...:random item`
Returns any single item from the list. This is mostly for display purposes, because the return may not be mathematically random.
### `...:item #`
Returns the #th item of the list.
### `...:items until #`
Returns a sublist of the list, from the first item to the #th item.
### `...:items from #`
Returns a sublist of the list, from the #th item to the end.
You can combine the :items until # and :items from # operators to pick just a segment from a list, between two indices. For example, you can generate a new list from item number 5 to 10 in an existing list, using the expression below:
List of things:items until 10:items from 5.
Note that the order of operations is important. Why?
### `... contains list ...`
Returns yes if the first list contains all the entries from the second list.
### `... join with ...`
Returns a text version of the list, using the argument as the separator between the items. Using a 'line_break' separator will make each entry be on a new line.
### `... :sum`
Sums the elements in a list of numbers by adding them together. For instance, the sum of the list [2, 4, 7] is 13. Empty entries are ignored. The sum of an empty list is the "empty" value.
### `... :product`
Multiplies the elements in a list of numbers together. For instance, the product of the list [2, 4, 7] is 56. Empty entries are ignored. The product of an empty list is the "empty" value.
### `... :average`
Computes the arithmetic average of the elements in a list of numbers, by adding them together and then dividing by the number of entries. For instance, the average of the list [2, 4, 7] is 6.5. Empty entries are ignored, which means that the average of a list of numbers might not exactly equal the sum of the list divided by the count. The average of an empty list is the "empty" value.
### `... :median`
Computes the median element of the elements in a list of numbers. Empty entries are ignored, and don't count towards the determination of what the median element is. For lists with an even number of elements, the median is the arithmetic average of the middle two elements. For instance, the median of the list [2, 4, 7] is 4, and the median of the list [2, 4, 7, 8] is 5.5. The median of an empty list is the "empty" value.
### `... :min`
Returns the smallest of the elements in a list of numbers. A large negative number counts as being very small for the purpose of min, so the min of the list [-100, -5, 0, 1] is -100. Empty entries are ignored, and the min of an empty list is the "empty" value.
### `... :max`
Returns the largest of the elements in a list of numbers. The max of the list [-100, 2, 4, 7] is 7. Empty entries are ignored, and the max of an empty list is the "empty" value.
### `... :approximate count`
Returns an approximate count of the number of items in a list. This is a performance optimizing operator that trades accuracy for a speed increase. It will be faster to return results than the :count operator, but it will be, as the name suggests, an approximation of the count (we estimate it to be within 2% of the actual count for most use cases).
### `... :cached aggregation`
Allows you to reuse recently computed aggregation results across page views instead of recalculating a value every time it is requested from the server. The server will store the result of the specified aggregation for 30 seconds, during which it will return that already calculated result for all identical requests instead of computing a new value. Note that the lifetime of the cached value is not extended upon subsequent requests, so the value will always be recomputed when requested again after the initial 30 seconds. Allowed aggregation operators are “count”, “approximate count”, “max”, “min”, “median”, “average”, “sum”, and “product”, though some of these are only available on certain underlying list types.
### `...:filtered`
Filters a list of things with a criteria. It's similar to a search but happens after the search and can also be used on a field that is a list of things. The filtering constraints work similarly to a search constraint.
Tip: Use operators such as "and" to indicate that an item in the list should meet all specified criteria, or ":join with" to define a list where an item can meet one of a list of criteria.
### `...:format as text`
Formats a list of things to display its content. You can choose a delimiter for your list, and the content to show per list item. All items will share the format that you specify. For example, if you have a list of names, you can choose to display “This name” in bold with a space delimiter. This will show all the names in bold separated by a space: name1 name2 name3.
This is also useful for sending emails to your users. In the body of your email, you might format a list of Events to display start times for upcoming events. You can also add bb code to customize its appearance. For example, if you specify your content to show as “[li][b]This date[/b][/li]” and your delimiter as a line break, you can create a bolded list with bullets:
January 1, 2021 1:00 pm
January 2, 2021 2:00 pm
If you need to format text as a JSON to send to an external API, you may also use this operator. You can create
{
key: “value”
}
formatting for as many of the values as there are in your database. For example, you might pass a list as:
{
key: “This value’s field”
}
Then if your list contained two items, the result could look like:
{
key: “Value1's field”
},
{
key: “Value2's field”
}
### `...:sorted`
Sorts a list of things.
### `:ranked by...`
Ranks a list of things by average RMS similarity of all numerical fields to a target item of the same type. Use this to match people for a dating app for instance.
### `... merged with ...`
This operation merges two lists of things. It returns a new list with entries from both lists. If an entry is in both, it will only appear once in the returned list.
### `... intersect with ...`
This operation takes two lists of things and returns the entries that are in both lists.
### `... :unique elements`
Watch this video to learn more about the Unique Elements Operator
This operation removes all double items from the list.
### `...:plus item`
This operation adds an item to a list of things. It returns a new list with the original list plus the new item. If the new item is already in the list, it will not be added.
### `...:minus item`
This operation removes an item to a list of things. It returns a new list with the original list minus the item. If the new item is not in the list, it will not be removed.
### `...:minus list`
Returns the original list minus any elements that are present in the argument list.
### `...:make static`
This operation converts a list that relies on dynamic data, e.g., input's values in search constraints, and converts it into a list with the current items. Once converted to static, the list will not change if underlying values change. Note that this works only within the context of workflows; it will not change the behavior of repeating groups. Caution: This is an advanced feature.
..:group by
Groups the list into chunks of related entries, and computes summaries of each group. This is useful for visualizing your data in a chart or table: for instance, you could create a table showing the number and dollar values of orders by customer, or the number of new users to your application by month. Selecting ":group by" will open a panel with the option to add groupings and add aggregations. In the sentence, "Show the total X grouped by Y", X is an aggregation and Y is a grouping.
For each grouping you add, you'll see "Field 1 to group by", "Field 2 group by", and so on. This is the field of the list item used to pick which group to put in. Currently we support grouping on users and custom data types, text fields, numbers, and dates.
For many uses, adding a single grouping is sufficient. Adding multiple groupings allows grouping items by two fields. For example, suppose you have a list of orders, each with a customer and a date. You might want to see a chart showing orders grouped by customer and month, in which case you could add both fields as groupings. The order of the groupings determines the order of the list results: we first sort by the first grouping, and then by the second. For instance, if you group by customer, and then month, you might see an output list with {Customer 1, Jan}, {Customer 1, Feb}, {Customer 1, Mar}, {Customer 2, Jan}, {Customer 2, Feb}, {Customer 2, Mar}. Whereas if your first grouping was month, followed by customer, the results would be {Jan, Customer 1}, {Jan, Customer 2}, {Feb, Customer 1}, {Feb, Customer 2}, {Mar, Customer 1}, {Mar, Customer 2}.
When you select a number field to group on, you will see additional options. A "Type of grouping" dropdown will let you pick between "Exact" and "Bucket". If you pick exact, grouping by numbers will work the same as grouping by text or by a custom type: list entries with the exact same value for that field will be put in the same group. So all entries with the value 3.1 will be grouped together, and all entries with the value 9.2 will be in a different group. In contrast, if you pick "Bucket", you can group similar numbers into buckets. You'll be prompted to pick an "Interval" and "Starting value", which determines how the bucketing works. The first bucket is the starting value, and then they increase by the interval, so for example, if you pick a starting value of 10, and an interval of 5, your buckets will be 10, 15, 20, 25, 30, and so on. List entries are placed in the largest bucket that they are equal to or greater than: so, 15 goes in bucket 15, as does 19.999, but 20 goes in bucket 20. Entries below the starting value, such as 9 in this example, are left out of the final results.
If a "Bucket" grouping on a number field is the last grouping in your list of groupings (or if it is the only grouping), you will also see the checkbox "Do not skip empty groups". If you check it, you will be prompted to enter an "Ending value". This option allows you to specify a continuous range of buckets to display, regardless of whether you actually have data for every bucket in that range. It is most useful in combination with a chart element, to construct a graph that doesn't skip things that you do not have values for. So for instance, if your start value is 20, and your interval is 10, and your end value is 50, the buckets you will get are 20, 30, 40, and 50, even if you don't have any data between 30 and 40. (If your end value doesn't exactly match a bucket, the final bucket will be the one that the end value would fall into: so if your end is 58 in this example, the final bucket would still be 50). Items after the final bucket will be left out (so 61 would not be included).
If you use the "Do not skip empty groups" option with multiple groupings, we compute the entire range of buckets for each preceding grouping. So for instance, if you first group by a text field that contains the names of fruits, and then group by a bucketed number from from 20 to 50 as in our above example, you might see groupings that look like the following: {apple, 20}, {apple, 30}, {apple, 40}, {apple, 50}, {banana, 20}, {banana, 30}, {banana, 40}, {banana, 50}, {pear, 20}, {pear, 30}, {pear, 40}, {pear, 50}. You will see all twelve of these groupings as long as you have at least one apple, at least one banana, and at least one pear with a number between 20 and 60.
Grouping on date fields is very similar to grouping on number fields. There is an "Exact" option that groups list entries with the exact same date together. Note that, because dates represent moments in time accurate to a millisecond, two entries might look like they have the same date, but actually be half a second apart from each other: in that case, they would end up in different groups.
In addition to the "Exact" option, there are also "Day" and "Month" options. These work similarly to the "Bucket" option for numbers, but they compute the beginning and the ends of buckets using calendar-aware math in the user's current time zone in order to group dates that share the same calendar day or calendar month. It's easiest to illustrate with an example. Suppose you are in New York, you group by "Day", with "Interval" set to 2, and set the "Starting date" to be 11:03 am, April 17, 2018 ET. The first bucket will be the beginning of the starting date in the current timezone: so in this case, midnight, April 17, 2018 ET. The second bucket will be two days later in the current timezone (because you picked an interval of 2): midnight, April 19, 2018 ET. Adding the interval uses the same logic as the +(days) operator. Like with the "Bucket" option on number fields, entries are placed in the bucket that they are greater than or equal to, so 11:59 pm April 18 would go in the midnight April 17 bucket, but midnight April 19 would go in the midnight April 19 bucket.
The "Month" option works the same as the day option, but the starting value is rounded down to the beginning of the month, so a starting value of 11:03 am, April 17, 2018 ET would become midnight, April 1, 2018 ET if the user is in the ET timezone. Subsequent buckets are calculated by adding the interval value using the same logic as the +(months) operator.
If the final grouping is a "Day" or "Month" grouping, there will be a "Do not skip empty groups" option. This works exactly the same way as it does for number "Bucket" groupings, described above, and is useful if you want to display data as a time series: a chart showing a line graph of user signups by month would look strange if it skipped months where no one signed up instead of showing 0. As with "Bucket" groupings, the ending date indicates the final bucket. So, if you are grouping by month, interval 1, and your ending date is a moment in June 17, 2018, your final bucket will be midnight, June 1, 2018. This bucket will include any data point that falls in June, including ones after the 17th! If you want to make sure that data for June 19 does not show up in your groupings, you need to filter those items out of the list prior to calling ":group by" on it.
Whereas groupings determine how the entries in the original list are grouped together, aggregations determine what we calculate for each grouping. The simplest aggregation is "Count", which just counts the number of items that were placed into each group. The other aggregations all perform mathematical operations on a number field: if you select one of them, you will be prompted to choose a field to calculate on. These aggregations all work the same as their equivalently-named operator on a list of numbers: Sum, Product, Average, Median, Min, and Max.
The output of doing a ":group by" operation on a list is a new list. You can feed this list to a repeating group or chart, or do further list transformations on it. The list contains one item for each group generated, and each item has one field for each grouping and one field for each aggregation.
The field name for each grouping will have the same name of the field that was grouped on, and will contain the bucket value for that group. So for instance, if you do a "Bucket" grouping on a number field called "my magic number", grouped by interval 10 starting from 0, the output list will will have a field called "my magic number". The grouping that represents all entries that fell in bucket 20 -- in other words, had a magic number greater than or equal to 20, but less than 30 -- will have that field set to 20.
Each aggregation you add to the grouping generates a field in the result list named after both the aggregation function and the number field it was calculated on. So for example, if you added an aggregation that computed the average of "my magic number", you would see a field called "average of my magic number" in the output list. The "Count" aggregation, since it does not operate on a specific field but rather just counts the number of entries in the grouping, simply adds a field named "count" to the output.
Note: The Group by operator prioritizes performance. As a result, Groupings do not include much information about each individual item contained within them. While work is in progress to address this limitation, in the mean time, a grouped dataset will not automatically update if any item within that dataset is created, updated, or destroyed.
### `...:each item...`
The :each item prefix is added to a List operator when the operator acts on an item in the List rather than the List itself. This prefix does not change any functionality, it is merely there to clarify the intended behavior of the selected operator.

## Custom Types
These types of data are the types defined when you created your data structure. Most of these operations also apply to the user type.
Creator
This returns the user who created the current thing. If the user was not logged in when the thing was created, it will be empty.
Created Date
This returns the date of the creation of the thing. Its type is date and can be manipulated as a date.
Modified Date
This returns the date of the last modification of the thing. Its type is date and can be manipulated as a date.
Slug [Beta]
This returns the slug value of the thing selected. This slug is unique for each thing of a certain type and its value is displayed in URLs when a page is associated to this thing.
### `...'s unique id`
This returns the unique id of the thing in the Bubble application database. Each entry has a unique id. Use this to generate links, etc.
Caution: This is an advanced feature that is not normally necessary.
### `...'s link`
This feature generates a link to a page of the app whose type of content is the type of the current thing. Clicking that link will open that page with that thing as the current page's thing.
### `...:converted to list`
This feature converts a single item into a list containing just that one item.
Custom fields
Create new fields for the custom types defined in the app. In the Workflow Tab, 'Create a new thing' action, then select 'Create a new field' in the dropdown menu. This is the same as adding a new field in the Data Tab.
Our Academy quick tip on adding data types as custom fields
Field name
Enter a name to describe the field.
Field type
A field must have a type. It can be a number, text, yes/no, address, etc. It can also be a custom type already created to store a composite object. For example, an apartment will have a field of type booking, which is also defined as a custom type.
This field is a list (multiple entries)
It is common to deal with lists of texts, numbers, things, users, etc. Checking this box defines a field as a list of things. Currently, lists are limited to 10,000 items. Trying to add additional items will result in an error message.
Default value
The default value is a way to define what the field should be if there is no information in the 'Create new thing' action for the current field.

## User Type
These are the specific fields and options to use for the type user.
Email
This applies to the type user only and returns the user's email. If the user used a social network to sign up, it will return the email provided to that social network, if available.
### `...is logged in`
Returns yes when the current user is logged in.
### `...has an account`
Returns yes when the user has an account. This option is shown when the data source is not the current user.
### `...isn't logged in`
Returns yes when the current user isn't logged in.
### `...doesn't have an account`
Returns yes when the user doesn’t have an account. This option is shown when the data source is not the current user.
### `...'s email confirmed`
Returns yes if the current user confirmed their email by clicking on the link in the confirmation email.
### `... uses password`
Returns yes if the current user used a password to create an account, and not an OAuth provider.
### `... uses 2FA`
Returns yes if the current user has activated two-factor authentication (2FA) on his account.
### `... has 2FA backup codes`
Returns yes if the current user has set up some backup codes on his account.
### `... is using cookies`
This operator is only visible for applications that have enabled the "Do not set cookies on new visitors by default" setting. Returns yes if the user has cookies set via the opt-in to cookies action or via signing up or logging in, and no if we are not setting cookies on the user.

## Option Sets
Option sets define a static list of choices for use in dropdowns, etc.. Options inside the sets have at least a text display, but they can have additional attributes defined in the Data tab.
### `...'s Display`
This gets the text value of the option for use in displaying in things like dropdowns and text fields.
### `...:defaulting to`
This feature sets an option to a default value, if the selected option is missing.
### `...:converted to list`
This feature converts a single option into a list.

## Option Attributes
Create new attributes for the option sets defined in the app. Attributes define additional values attached to your options in a set. You can add attributes in the Data tab.
Attribute name
Enter a name to describe the attribute.
Attribute type
An attribute must have a type. It can be a number, text, yes/no, address, etc. It can also be another Option set.
This attribute is a list (multiple entries)
It is common to deal with lists of texts, numbers, things, users, etc. Checking this box defines a attributes as a list of things. Lists are limited to 10,000 items. Trying to add additional items will result in an error message.

## Options
Create new options for the option sets defined in the app. An option set can have many different options in it, each with a display text (as well as any additional attributes you want). You can add options in the Data tab.
Option name
Enter a name to describe the option. This will be the new option's "Display" attribute.

## Native mobile operators

## Subscription operators
Operators are the recommended way to gate features, content, and UI based on subscription state. They abstract away raw purchase data and reflect the current, normalized subscription status.
Operators are the recommended way to gate features, content, and UI based on subscription state. They abstract away raw purchase data and reflect the current, normalized subscription status.
User is subscribed to…
Checks whether the user is currently subscribed to the selected option. This operator can be scoped to be at the group, tier, or billing variant level depending on your needs.
Arguments
Subscription Group – returns yes/no if the user has any active subscription in the group
Subscription Tier – returns yes/no if the user is subscribed to that specific tier
At least Subscription Tier – returns yes/no if the user is subscribed to that tier or higher, based on tier order in the subscription group
Billing Variant – returns yes/no if the user is subscribed to a specific billing variant
Common use cases
Gating access to premium features
Showing or hiding UI elements based on plan level
Checking eligibility for upgrades or downgrades
Best practices
Prefer group- or tier-level checks for access control
Use billing-variant checks for messaging or analytics, not core gating
Last updated 1 month ago
