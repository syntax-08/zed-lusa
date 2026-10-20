//! Zed extension glue for Lusa.
//!
//! The tree-sitter grammar gives syntax highlighting; this part registers
//! the Lusa language server (`lusalang lsp`) so the editor gets live,
//! cargo-style diagnostics straight from the real parser (E0001/E0101...).

use zed_extension_api::{self as zed, Command, LanguageServerId, Os, Result, Worktree};

pub struct LusaExtension;

impl zed::Extension for LusaExtension {
    fn new() -> Self
    where
        Self: Sized,
    {
        Self
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &LanguageServerId,
        _worktree: &Worktree,
    ) -> Result<Command> {
        // Windows: do NOT depend on PATH (running processes can hold a stale
        // one) — let cmd.exe expand %LOCALAPPDATA% at spawn time and launch
        // the installed runtime directly. Quoted so user dirs with spaces
        // keep working.
        let command = match zed::current_platform().0 {
            Os::Windows => Command::new("cmd.exe").arg("/C").arg(
                "\"%LOCALAPPDATA%\\Lusa\\bin\\lusa.exe\" lsp",
            ),
            _ => Command::new("lusalang").arg("lsp"),
        };
        Ok(command)
    }
}

zed::register_extension!(LusaExtension);
