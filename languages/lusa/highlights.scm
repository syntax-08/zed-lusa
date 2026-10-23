; Syntax highlighting queries for Lusa v1.0.0.
; Node names match tree-sitter-lusa/src/node-types.json.
; Comments are in English so the file stays accessible to all contributors.

; ---------------------------------------------------------------------------
; Keywords: control flow, statements, operators, and declarations

[
  "and"
  "do"
  "else"
  "elseif"
  "end"
  "for"
  "function"
  "if"
  "in"
  "local"
  "not"
  "or"
  "repeat"
  "return"
  "then"
  "until"
  "while"
] @keyword

; `break` is represented by its own statement node in the generated grammar.
(break_statement) @keyword

; ---------------------------------------------------------------------------
; Lusa ownership and systems keywords

[
  "move"
  "borrow"
  "clone"
  "unsafe"
  "struct"
] @keyword.control

; ---------------------------------------------------------------------------
; Native types, including raw pointers and generic table types

(primitive_type) @type.builtin
(pointer_type) @type.builtin

; ---------------------------------------------------------------------------
; Literals and constants

(number) @number
(boolean) @boolean
(nil) @constant.builtin

; ---------------------------------------------------------------------------
; Comments, strings, and escapes

(comment) @comment

(string) @string
(escape_sequence) @escape

; Interpolation boundaries and embedded code.
(string_interpolation) @embedded

; Default identifier color. More specific patterns below override it.
(identifier) @variable

((identifier) @variable.builtin
  (#eq? @variable.builtin "self"))

; Re-apply custom type scopes after the generic identifier rule so named types
; and raw-pointer element names keep their type color.
(pointer_type
  element: (identifier) @type)

(generic_type
  name: (identifier) @type)

(named_type
  (identifier) @type)

; ---------------------------------------------------------------------------
; Functions, calls, parameters, and members

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (index_expression
    property: (identifier) @function.call))

(call_expression
  method: (identifier) @function.method)

(function_declaration
  name: (function_name
    class: (identifier) @type))

(function_declaration
  name: (function_name
    property: (identifier) @property))

(function_declaration
  name: (function_name
    method: (identifier) @function.method))

(struct_declaration
  name: (identifier) @type)

(struct_field
  name: (identifier) @property)

(parameter_list
  (identifier) @variable.parameter)

(index_expression
  property: (identifier) @property)

(table_field
  key: (identifier) @property)

; ---------------------------------------------------------------------------
; Punctuation and operators

[
  "+" "-" "*" "/" "//" "%" "^"
  "==" "~=" "<" ">" "<=" ">="
  ".." "="
] @operator

":" @punctuation.delimiter
"." @punctuation.delimiter

[
  "(" ")" "{" "}" "[" "]"
  "," ";"
] @punctuation.bracket

(vararg_expression) @punctuation.special
