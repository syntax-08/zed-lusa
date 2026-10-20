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
        // `lusalang` is on PATH after `install-lusa.cmd`. Wrapping through
        // cmd.exe so the .cmd launcher works with ordinary child processes.
        let command = match zed::current_platform().0 {
            Os::Windows => Command::new("cmd.exe").args(["/C", "lusalang.cmd", "lsp"]),
            _ => Command::new("lusalang").arg("lsp"),
        };
        Ok(command)
    }
}

zed::register_extension!(LusaExtension);
