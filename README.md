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
- **Live diagnostics from a real language server** (`lusalang lsp`): lex and
  parse errors (E0001/E0101...) appear underlined as you type and clear the
  moment the code is fixed

## Installing locally (dev extension)

Before installing, make sure the runtime is on PATH (`install-lusa.cmd` from
the [lusa runtime repo](https://github.com/syntax-08/lusa)) and the Wasm Rust
target exists for the extension build:

```cmd
rustup target add wasm32-wasip1
```

1. Clone this repo somewhere.
2. In Zed: `Ctrl+Shift+P` → **extensions: install dev extension** → select
  this folder (`zed-lusa`).
3. Open any `.lusa` file.

The language server starts automatically for `.lusa` files. To see its
output, open the logs: `Ctrl+Shift+P` → **editor: open log** (look for
`lusa-lsp` entries). To disable it temporarily, add `"language_servers":
["!lusa"]` to the Lusa language settings in Zed's `settings.json`.

## Structure

```
extension.toml           extension metadata (grammar vendored via `path`)
Cargo.toml + src/lib.rs  Wasm extension logic (starts `lusalang lsp`)
languages/lusa/config.toml   editor behavior (brackets, indentation)
languages/lusa/highlights.scm    color rules (tree-sitter queries)
tree-sitter-lusa/        the tree-sitter grammar itself (grammar.js)
```

