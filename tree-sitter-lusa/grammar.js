/**
 * Tree-sitter grammar for **Lusa v1.0.0**.
 *
 * Lua-like syntax with Rust-style ownership (`move` / `clone` / `borrow`),
 * native type annotations, static structs, and `unsafe` blocks. Primitive
 * type names are grouped under `primitive_type` so highlight queries can
 * color the complete annotation without relying on anonymous tokens.
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

  extras: $ => [/\s/, $.comment, ";"],

  supertypes: $ => [$.statement, $._expr],

  conflicts: $ => [
    [$._prefix, $.call_statement],
    [$._expr, $._prefix],
    [$.table_field_list],
    [$.expr_list],
  ],

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
      $.struct_declaration,
      $.unsafe_statement,
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
        optional(seq(":", $.type)),
        repeat(seq(",", $.identifier, optional(seq(":", $.type)))),
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
      optional(seq(":", $.type)),
      repeat($._statement),
      "end",
    ),

    parameter_list: $ => choice(
      seq(
        $.identifier,
        optional(seq(":", $.type)),
        repeat(seq(",", choice(
          seq($.identifier, optional(seq(":", $.type))),
          "...",
        ))),
      ),
      "...",
    ),

    struct_declaration: $ => seq(
      "struct",
      field("name", $.identifier),
      "{",
      repeat($.struct_field),
      "}",
    ),

    struct_field: $ => seq(
      field("name", $.identifier),
      ":",
      field("type", $.type),
      optional(choice(",", ";")),
    ),

    unsafe_statement: $ => seq(
      "unsafe",
      "do",
      repeat($._statement),
      "end",
    ),

    // Native type annotations. Primitive names are grouped so editors can
    // color the whole annotation without relying on anonymous-token queries.
    type: $ => choice(
      $.pointer_type,
      $.generic_type,
      $.primitive_type,
      $.named_type,
    ),

    primitive_type: _ => choice(
      "i32",
      "u32",
      "i128",
      "f32",
      "bool",
      "string",
      "table",
      "void",
      "nil",
    ),

    generic_type: $ => seq(
      field("name", $.identifier),
      "<",
      $.type,
      repeat(seq(",", $.type)),
      ">",
    ),

    named_type: $ => $.identifier,

    pointer_type: $ => seq(
      "*",
      field("mutability", choice("mut", "const")),
      field("element", $.identifier),
    ),

    do_statement: $ => seq("do", repeat($._statement), "end"),

    while_statement: $ => seq(
      "while", field("condition", $._expr), "do", repeat($._statement), "end",
    ),

    repeat_statement: $ => seq(
      "repeat", repeat($._statement), "until", field("condition", $._expr),
    ),

    if_statement: $ => prec.right(seq(
      "if", field("condition", $._expr), "then",
      repeat($._statement),
      repeat($.elseif_clause),
      optional($.else_clause),
      "end",
    )),

    elseif_clause: $ => seq(
      "elseif", field("condition", $._expr), "then", repeat($._statement),
    ),

    else_clause: $ => seq("else", repeat($._statement)),

    numeric_for_statement: $ => seq(
      "for", field("variable", $.identifier), "=",
      field("start", $._expr), ",",
      field("stop", $._expr),
      optional(seq(",", field("step", $._expr))),
      "do", repeat($._statement), "end",
    ),

    generic_for_statement: $ => seq(
      "for",
      field("variable", $.identifier),
      repeat(seq(",", field("variable", $.identifier))),
      "in",
      $.expr_list,
      "do", repeat($._statement), "end",
    ),

    // ------------------------------------------------------------------ //
    // expressions

    expr_list: $ => seq($._expr, repeat(seq(prec(1, ","), $._expr))),

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
      field("operator", choice("clone", "borrow", "move")),
      field("argument", $._expr),
    )),

    power_expression: $ => prec.right(PREC.POWER, seq($._expr, "^", $._expr)),

    vararg_expression: _ => "...",

    parenthesized: $ => seq("(", $._expr, ")"),

    prefix_expression: $ => $._prefix,

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
      seq("(", optional(seq($.expr_list, optional(","))), ")"),
      $.table,
      $.string,
    ),

    function_expression: $ => seq("function", $.function_body),

    table: $ => seq(
      "{",
      optional(seq(
        $.table_field_list,
        optional(choice(",", ";")),
      )),
      "}",
    ),

    table_field_list: $ => seq(
      $.table_field,
      repeat(seq(choice(prec(1, ","), prec(1, ";")), $.table_field)),
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
        $.string_interpolation,
        token.immediate(prec(1, /[^"\\]+/)),
      )),
      '"',
    ),

    single_quoted: $ => seq(
      "'",
      repeat(choice(
        $.escape_sequence,
        $.string_interpolation,
        token.immediate(prec(1, /[^'\\]+/)),
      )),
      "'",
    ),

    escape_sequence: _ => token.immediate(choice(
      /\\u\{[0-9A-Fa-f]+\}/,
      seq("\\", choice("\\", "n", "t", "r", "0", "a")),
    )),

    string_interpolation: $ => seq("\\{", optional($._expr), "}"),

    comment: $ => choice(
      token(seq("--", /[^\r\n]*/)),
      token(/--\[\[[\s\S]*?\]\]/),
    ),
  },
});

function commaSep(rule) {
  return seq(rule, repeat(seq(",", rule)));
}
