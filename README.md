# Lusa for Zed

Syntax highlighting for the [Lusa](https://github.com/syntax-08/lusa) language
(Lua-like dynamic language with Rust-style ownership: `move` / `clone` /
`borrow`).

## Features

- Full tree-sitter grammar for Lusa (built on the same grammar as the
  interpreter's parser: everything from `for … in pairs(t)` to strings with
  interpolation `"x \{a + b}"`, `--[[ block comments ]]`, and the Lusa-only
  keywords `clone` and `borrow`)
- Syntax highlighting tuned for a Lua-like language
- Bracket auto-close for `{}` `[]` `()` quotes
- Block comment support (`--[[ ]]`)

## Installing locally (dev extension)

1. Clone this repo somewhere.
2. In Zed: `Ctrl+Shift+P` → **extensions: install dev extension** → select
  this folder (`zed-lusa`).
3. Open any `.lusa` file.

## Structure

```
extension.toml           extension metadata (grammar vendored via `path`)
languages/lusa/config.toml   editor behavior (brackets, indentation)
languages/lusa/highlights.scm    color rules (tree-sitter queries)
tree-sitter-lusa/        the tree-sitter grammar itself (grammar.js)
```
