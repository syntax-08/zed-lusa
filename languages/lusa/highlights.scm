; Syntax highlighting rules for the Lusa language.
; Node names mirror the tree-sitter-lusa grammar in this repo.

; ---------- comments / strings ----------

(comment) @comment

(string) @string
(escape_sequence) @escape

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (index_expression
    property: (identifier) @function.call))

(call_expression
  method: (identifier) @function.method)

; ---------- keywords ----------

[
  "and"
  "break"
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

; Lusa ownership keywords
[
  "clone"
  "borrow"
] @keyword

; ---------- literals ----------

(number) @number

(boolean) @constant.builtin
(nil) @constant.builtin

"..." @punctuation.special

; ---------- operators ----------

[
  "+" "-" "*" "/" "//" "%" "^"
  "==" "~=" "<" ">" "<=" ">="
  ".." "=" ":"
] @operator

; ---------- functions ----------

(function_declaration
  name: (function_name
    (identifier) @function))

(function_declaration
  name: (function_name
    method: (identifier) @function.method))

(function_declaration
  name: (function_name
    property: (identifier) @property))

(function_declaration
  name: (function_name
    property: (identifier) @property
    method: (identifier) @function.method))

(parameter_list
  (identifier) @parameter)

; ---------- members ----------

(index_expression
  property: (identifier) @property)

(table_field
  key: (identifier) @property)

(table_field
  key: (identifier)
  value: (table)) @property
