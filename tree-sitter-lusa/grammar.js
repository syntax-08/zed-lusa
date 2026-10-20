/**
 * Tree-sitter grammar for the **Lusa** language.
 * Lua-like with Rust-style ownership (`clone` / `borrow`).
 */
const PREC = {
  OR: 1,
  AND: 2,
  COMPARE: 3,
  CONCAT: 4,
  BINARY: 5,
  MULT: 6,
  UNARY: 9,
  POWER: 10,
  CALL: 13,
  INDEX: 14,
};

module.exports = grammar({
  name: "lusa",

  word: $ => $.identifier,

  extras: $ => [/\s/, $.comment],

  supertypes: $ => [$.statement, $._expr],

  rules: {
    source_file: $ => repeat($._statement),

    _statement: $ => $.statement,

    statement: $ => choice(
      $.local_declaration,
      $.assignment_statement,
      $.call_statement,
      $.do_statement,
      $.while_statement,
      $.repeat_statement,
      $.if_statement,
      $.numeric_for_statement,
      $.generic_for_statement,
      $.function_declaration,
      $.return_statement,
      $.break_statement,
    ),

    // ------------------------------------------------------------------ //
    // statements

    break_statement: _ => "break",

    return_statement: $ => prec.right(seq(
      "return",
      optional($.expr_list),
      optional(/[;]/),
    )),

    assignment_statement: $ => seq($.variable_list, "=", $.expr_list),

    variable_list: $ => seq(
      $.variable,
      repeat(seq(",", $.variable)),
    ),

    variable: $ => $.assignment_variable,

    assignment_variable: $ => $.prefix_expression,

    call_statement: $ => $.call_expression,

    local_declaration: $ => choice(
      seq(
        "local",
        $.identifier,
        repeat(seq(",", $.identifier)),
        optional(seq("=", $.expr_list)),
      ),
      seq("local", "function", $.identifier, $.function_body),
    ),

    function_declaration: $ => prec.right(seq(
      "function",
      field("name", $.function_name),
      field("body", $.function_body),
    )),

    function_name: $ => prec.right(seq(
      field("class", $.identifier),
      repeat(seq(".", field("property", $.identifier))),
      optional(seq(":", field("method", $.identifier))),
    )),

    function_body: $ => seq(
      "(",
      optional($.parameter_list),
      ")",
      $._block,
      "end",
    ),

    parameter_list: $ => choice(
      seq(
        $.identifier,
        repeat(seq(",", choice($.identifier, "..."))),
      ),
      "...",
    ),

    do_statement: $ => seq("do", $._block, "end"),

    while_statement: $ => seq(
      "while", field("condition", $._expr), "do", $._block, "end",
    ),

    repeat_statement: $ => seq(
      "repeat", $._block, "until", field("condition", $._expr),
    ),

    if_statement: $ => prec.right(seq(
      "if", field("condition", $._expr), "then",
      $._block,
      repeat($.elseif_clause),
      optional($.else_clause),
      "end",
    )),

    elseif_clause: $ => seq(
      "elseif", field("condition", $._expr), "then", $._block,
    ),

    else_clause: $ => seq("else", $._block),

    numeric_for_statement: $ => seq(
      "for", field("variable", $.identifier), "=",
      field("start", $._expr), ",",
      field("stop", $._expr),
      optional(seq(",", field("step", $._expr))),
      "do", $._block, "end",
    ),

    generic_for_statement: $ => seq(
      "for",
      field("variable", $.identifier),
      repeat(seq(",", field("variable", $.identifier))),
      "in",
      $.expr_list,
      "do", $._block, "end",
    ),

    _block: $ => repeat($._statement),

    // ------------------------------------------------------------------ //
    // expressions

    expr_list: $ => seq($._expr, repeat(seq(",", $._expr))),

    _expr: $ => choice(
      $.or_expression,
      $.and_expression,
      $.comparison,
      $.concat_expression,
      $.binary_expression,
      $.unary_expression,
      $.clone_expression,
      $.power_expression,
      $.call_expression,
      $.index_expression,
      $.identifier,
      $.parenthesized,
      $.function_expression,
      $.table,
      $.string,
      $.number,
      $.boolean,
      $.nil,
      $.vararg_expression,
    ),

    or_expression: $ => prec.left(PREC.OR, seq($._expr, "or", $._expr)),

    and_expression: $ => prec.left(PREC.AND, seq($._expr, "and", $._expr)),

    comparison: $ => prec.left(PREC.COMPARE, seq(
      $._expr,
      choice("<", ">", "<=", ">=", "==", "~="),
      $._expr,
    )),

    concat_expression: $ => prec.right(PREC.CONCAT, seq($._expr, "..", $._expr)),

    binary_expression: $ => choice(
      prec.left(PREC.BINARY, seq($._expr, choice("+", "-"), $._expr)),
      prec.left(PREC.MULT, seq($._expr, choice("*", "/", "//", "%"), $._expr)),
    ),

    unary_expression: $ => prec.left(PREC.UNARY, seq(
      field("operator", choice("not", "-", "#")),
      field("argument", $._expr),
    )),

    clone_expression: $ => prec.right(PREC.UNARY, seq(
      field("operator", choice("clone", "borrow")),
      field("argument", $._expr),
    )),

    power_expression: $ => prec.right(PREC.POWER, seq($._expr, "^", $._expr)),

    vararg_expression: _ => "...",

    parenthesized: _ => seq("(", $._expr, ")"),

    prefix_expression: $ => $.identifier,

    call_expression: $ => choice(
      prec.left(PREC.CALL, seq(
        field("function", $._prefix),
        field("args", $.args),
      )),
      prec.left(PREC.CALL, seq(
        field("function", $._prefix),
        ":",
        field("method", $.identifier),
        field("args", $.args),
      )),
    ),

    index_expression: $ => prec.left(PREC.INDEX, choice(
      seq($._prefix, ".", field("property", $.identifier)),
      seq($._prefix, "[", field("index", $._expr), "]"),
    )),

    _prefix: $ => choice(
      $.identifier,
      $.parenthesized,
      $.index_expression,
      $.call_expression,
    ),

    args: $ => choice(
      seq("(", optional(commaSep($._expr)), optional(","), ")"),
      $.table,
      $.string,
    ),

    function_expression: $ => seq("function", $.function_body),

    table: $ => seq(
      "{",
      optional(seq(
        $.table_field,
        repeat(choice(",", ";")),
        optional($.table_field),
        repeat(choice(",", ";")),
      )),
      "}",
    ),

    table_field: $ => choice(
      prec(1, seq("[", field("key", $._expr), "]", "=", field("value", $._expr))),
      prec(1, seq(field("key", $.identifier), "=", field("value", $._expr))),
      $._expr,
    ),

    // ------------------------------------------------------------------ //
    // leaves

    boolean: _ => choice("true", "false"),

    nil: _ => "nil",

    number: _ => token(choice(
      /0[xX][0-9a-fA-F]+/,
      /\d+\.\d*(?:[eE][-+]?\d+)?/,
      /\.\d+(?:[eE][-+]?\d+)?/,
      /\d+[eE][-+]?\d+/,
      /\d+/,
    )),

    identifier: _ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    string: $ => choice($.double_quoted, $.single_quoted),

    double_quoted: $ => seq(
      '"',
      repeat(choice(
        $.escape_sequence,
        $.interpolation,
        token.immediate(prec(1, /[^"\\\{]+/)),
      )),
      '"',
    ),

    single_quoted: $ => seq(
      "'",
      repeat(choice(
        $.escape_sequence,
        $.interpolation,
        token.immediate(prec(1, /[^'\\\{]+/)),
      )),
      "'",
    ),

    escape_sequence: _ => token.immediate(choice(
      /\\u\{[0-9A-Fa-f]+\}/,
      seq("\\", choice("\\", "n", "t", "r", "0", "a")),
    )),

    interpolation: $ => seq("\\{", optional($._expr), "}"),

    comment: $ => choice(
      token(seq("--", /[^\r\n]*/)),
      token(/--\[\[[\s\S]*?\]\]/),
    ),
  },
});

function commaSep(rule) {
  return seq(rule, repeat(seq(",", rule)));
}
