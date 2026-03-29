//! Codex ACP - An Agent Client Protocol implementation for Codex.
#![deny(clippy::print_stdout, clippy::print_stderr)]

use agent_client_protocol::{
    AgentSideConnection, Client, CreateTerminalRequest, CreateTerminalResponse,
    KillTerminalCommandRequest, KillTerminalCommandResponse, ReleaseTerminalRequest,
    ReleaseTerminalResponse, TerminalOutputRequest, TerminalOutputResponse,
    WaitForTerminalExitRequest, WaitForTerminalExitResponse,
};
use codex_common::CliConfigOverrides;
use codex_core::config::{Config, ConfigOverrides};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Arc, Mutex, OnceLock};
use std::{io::Result as IoResult, rc::Rc};
use tokio::sync::{mpsc, oneshot};
use tokio::task::LocalSet;
use tokio_util::compat::{TokioAsyncReadCompatExt, TokioAsyncWriteCompatExt};
use tracing_subscriber::EnvFilter;

mod acp_agent;
pub mod backend;
mod claude_code_agent;
mod cli_common;
mod codex_agent;
mod gemini_agent;
mod link_paths;
mod local_spawner;
mod multi_backend;
mod prompt_args;
mod session_store;
mod thread;

pub static ACP_CLIENT: OnceLock<Arc<AgentSideConnection>> = OnceLock::new();
static ACP_CLIENT_INFO: OnceLock<Arc<Mutex<Option<String>>>> = OnceLock::new();
static SESSION_ALIASES: OnceLock<Arc<Mutex<HashMap<String, agent_client_protocol::SessionId>>>> =
    OnceLock::new();
static ACP_TERMINAL_RPC: OnceLock<mpsc::UnboundedSender<AcpTerminalRpc>> = OnceLock::new();

type AcpTerminalRpcResult<T> = Result<T, String>;

enum AcpTerminalRpc {
    CreateTerminal {
        request: CreateTerminalRequest,
        respond_to: oneshot::Sender<AcpTerminalRpcResult<CreateTerminalResponse>>,
    },
    TerminalOutput {
        request: TerminalOutputRequest,
        respond_to: oneshot::Sender<AcpTerminalRpcResult<TerminalOutputResponse>>,
    },
    ReleaseTerminal {
        request: ReleaseTerminalRequest,
        respond_to: oneshot::Sender<AcpTerminalRpcResult<ReleaseTerminalResponse>>,
    },
    WaitForTerminalExit {
        request: WaitForTerminalExitRequest,
        respond_to: oneshot::Sender<AcpTerminalRpcResult<WaitForTerminalExitResponse>>,
    },
    KillTerminalCommand {
        request: KillTerminalCommandRequest,
        respond_to: oneshot::Sender<AcpTerminalRpcResult<KillTerminalCommandResponse>>,
    },
}

fn acp_client_info() -> &'static Arc<Mutex<Option<String>>> {
    ACP_CLIENT_INFO.get_or_init(|| Arc::new(Mutex::new(None)))
}

fn session_aliases() -> &'static Arc<Mutex<HashMap<String, agent_client_protocol::SessionId>>> {
    SESSION_ALIASES.get_or_init(|| Arc::new(Mutex::new(HashMap::new())))
}

pub fn record_client_info(client_info: Option<String>) {
    *acp_client_info().lock().unwrap() = client_info;
}

pub fn current_client_info() -> Option<String> {
    acp_client_info().lock().unwrap().clone()
}

pub fn register_session_alias(
    child: &agent_client_protocol::SessionId,
    parent: &agent_client_protocol::SessionId,
) {
    session_aliases()
        .lock()
        .unwrap()
        .insert(child.0.to_string(), parent.clone());
}

pub fn resolve_session_alias(
    session_id: &agent_client_protocol::SessionId,
) -> agent_client_protocol::SessionId {
    session_aliases()
        .lock()
        .unwrap()
        .get(session_id.0.as_ref())
        .cloned()
        .unwrap_or_else(|| session_id.clone())
}

async fn run_acp_terminal_rpc_loop(
    client: Arc<AgentSideConnection>,
    mut rx: mpsc::UnboundedReceiver<AcpTerminalRpc>,
) {
    while let Some(message) = rx.recv().await {
        match message {
            AcpTerminalRpc::CreateTerminal {
                request,
                respond_to,
            } => {
                drop(
                    respond_to.send(
                        client
                            .create_terminal(request)
                            .await
                            .map_err(|err| err.to_string()),
                    ),
                );
            }
            AcpTerminalRpc::TerminalOutput {
                request,
                respond_to,
            } => {
                drop(
                    respond_to.send(
                        client
                            .terminal_output(request)
                            .await
                            .map_err(|err| err.to_string()),
                    ),
                );
            }
            AcpTerminalRpc::ReleaseTerminal {
                request,
                respond_to,
            } => {
                drop(
                    respond_to.send(
                        client
                            .release_terminal(request)
                            .await
                            .map_err(|err| err.to_string()),
                    ),
                );
            }
            AcpTerminalRpc::WaitForTerminalExit {
                request,
                respond_to,
            } => {
                drop(
                    respond_to.send(
                        client
                            .wait_for_terminal_exit(request)
                            .await
                            .map_err(|err| err.to_string()),
                    ),
                );
            }
            AcpTerminalRpc::KillTerminalCommand {
                request,
                respond_to,
            } => {
                drop(
                    respond_to.send(
                        client
                            .kill_terminal_command(request)
                            .await
                            .map_err(|err| err.to_string()),
                    ),
                );
            }
        }
    }
}

async fn dispatch_acp_terminal_rpc<T>(
    message: impl FnOnce(oneshot::Sender<AcpTerminalRpcResult<T>>) -> AcpTerminalRpc,
) -> AcpTerminalRpcResult<T>
where
    T: Send + 'static,
{
    let sender = ACP_TERMINAL_RPC
        .get()
        .cloned()
        .ok_or_else(|| "ACP terminal bridge is unavailable".to_string())?;
    let (respond_to, response_rx) = oneshot::channel();
    sender
        .send(message(respond_to))
        .map_err(|_| "ACP terminal bridge closed".to_string())?;
    response_rx
        .await
        .map_err(|_| "ACP terminal bridge response dropped".to_string())?
}

pub(crate) async fn acp_create_terminal(
    request: CreateTerminalRequest,
) -> AcpTerminalRpcResult<CreateTerminalResponse> {
    dispatch_acp_terminal_rpc(|respond_to| AcpTerminalRpc::CreateTerminal {
        request,
        respond_to,
    })
    .await
}

pub(crate) async fn acp_terminal_output(
    request: TerminalOutputRequest,
) -> AcpTerminalRpcResult<TerminalOutputResponse> {
    dispatch_acp_terminal_rpc(|respond_to| AcpTerminalRpc::TerminalOutput {
        request,
        respond_to,
    })
    .await
}

pub(crate) async fn acp_release_terminal(
    request: ReleaseTerminalRequest,
) -> AcpTerminalRpcResult<ReleaseTerminalResponse> {
    dispatch_acp_terminal_rpc(|respond_to| AcpTerminalRpc::ReleaseTerminal {
        request,
        respond_to,
    })
    .await
}

pub(crate) async fn acp_wait_for_terminal_exit(
    request: WaitForTerminalExitRequest,
) -> AcpTerminalRpcResult<WaitForTerminalExitResponse> {
    dispatch_acp_terminal_rpc(|respond_to| AcpTerminalRpc::WaitForTerminalExit {
        request,
        respond_to,
    })
    .await
}

pub(crate) async fn acp_kill_terminal_command(
    request: KillTerminalCommandRequest,
) -> AcpTerminalRpcResult<KillTerminalCommandResponse> {
    dispatch_acp_terminal_rpc(|respond_to| AcpTerminalRpc::KillTerminalCommand {
        request,
        respond_to,
    })
    .await
}

/// Run the Codex ACP agent.
///
/// This sets up an ACP agent that communicates over stdio, bridging
/// the ACP protocol with the existing codex-rs infrastructure.
///
/// # Errors
///
/// If unable to parse the config or start the program.
pub async fn run_main(
    codex_linux_sandbox_exe: Option<PathBuf>,
    cli_config_overrides: CliConfigOverrides,
    backend_kind: backend::BackendKind,
) -> IoResult<()> {
    // Install a simple subscriber so `tracing` output is visible.
    // Users can control the log level with `RUST_LOG`.
    tracing_subscriber::fmt()
        .with_writer(std::io::stderr)
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    // Parse CLI overrides and load configuration
    let cli_kv_overrides = cli_config_overrides.parse_overrides().map_err(|e| {
        std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            format!("error parsing -c overrides: {e}"),
        )
    })?;

    let config_overrides = ConfigOverrides {
        codex_linux_sandbox_exe,
        ..ConfigOverrides::default()
    };

    let config =
        Config::load_with_cli_overrides_and_harness_overrides(cli_kv_overrides, config_overrides)
            .await
            .map_err(|e| {
                std::io::Error::new(
                    std::io::ErrorKind::InvalidData,
                    format!("error loading config: {e}"),
                )
            })?;

    let client_capabilities: Arc<Mutex<agent_client_protocol::ClientCapabilities>> = Arc::default();

    let driver: Rc<dyn backend::BackendDriver> = match backend_kind {
        backend::BackendKind::Codex => Rc::new(codex_agent::CodexDriver::new(
            config,
            client_capabilities.clone(),
        )),
        backend::BackendKind::ClaudeCode => Rc::new(claude_code_agent::ClaudeCodeDriver::new()),
        backend::BackendKind::Gemini => Rc::new(gemini_agent::GeminiCliDriver::new()),
        backend::BackendKind::Multi => Rc::new(multi_backend::MultiBackendDriver::new(
            Rc::new(codex_agent::CodexDriver::new(
                config.clone(),
                client_capabilities.clone(),
            )),
            Rc::new(claude_code_agent::ClaudeCodeDriver::new()),
            Rc::new(gemini_agent::GeminiCliDriver::new()),
        )),
    };

    // Create our Agent implementation with notification channel.
    // This keeps the ACP surface stable while allowing backend selection internally.
    let agent = Rc::new(acp_agent::AcpAgent::new(driver, client_capabilities));

    let stdin = tokio::io::stdin().compat();
    let stdout = tokio::io::stdout().compat_write();

    // Run the I/O task to handle the actual communication
    LocalSet::new()
        .run_until(async move {
            // Create the ACP connection
            let (client, io_task) = AgentSideConnection::new(agent.clone(), stdout, stdin, |fut| {
                tokio::task::spawn_local(fut);
            });

            let client = Arc::new(client);
            if ACP_CLIENT.set(client.clone()).is_err() {
                return Err(std::io::Error::other("ACP client already set"));
            }
            let (terminal_rpc_tx, terminal_rpc_rx) = mpsc::unbounded_channel();
            if ACP_TERMINAL_RPC.set(terminal_rpc_tx).is_err() {
                return Err(std::io::Error::other("ACP terminal bridge already set"));
            }
            tokio::task::spawn_local(run_acp_terminal_rpc_loop(client, terminal_rpc_rx));

            io_task
                .await
                .map_err(|e| std::io::Error::other(format!("ACP I/O error: {e}")))
        })
        .await?;

    Ok(())
}

// Re-export the MCP server types for compatibility
pub use codex_mcp_server::{
    CodexToolCallParam, CodexToolCallReplyParam, ExecApprovalElicitRequestParams,
    ExecApprovalResponse, PatchApprovalElicitRequestParams, PatchApprovalResponse,
};
