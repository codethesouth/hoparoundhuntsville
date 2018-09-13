*These guidelines are in beta*

All Code the South projects are encoureged to follow the MERN stack (MongoDB,
ExpressJS, ReactJS, NodeJS)

All indentations should use 4 spaces.

Imported packages and other unchanging values should be assigned to "const"
variables instead of variables of type "var".

Comments should be flush with the indentation level surrounding them and
single-line comment indicators should be followed by a single space.
(e.g. "// Example comment")

Any function that returns a boolean value should be titled as a question such as
"inRange()" so we know it returns a Yes or No value.

When combining strings and variables, use JavaScript templating instead of concatenation.
(e.g. `Value: ${varName}` not 'Value: ' + varName)
