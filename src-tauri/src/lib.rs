use notify::{Watcher, RecursiveMode, Event};
use std::sync::Mutex;
use tauri::{Emitter, State};

// Global state for file watchers
struct WatcherState {
    watcher: Mutex<Option<notify::RecommendedWatcher>>,
}

// CLI argument commands for replacing Neutralino NL_ARGS
#[tauri::command]
fn get_cli_args() -> Vec<String> {
    std::env::args().collect()
}

#[tauri::command]
fn get_runtime_path() -> String {
    std::env::current_exe()
        .ok()
        .and_then(|p| p.to_str().map(String::from))
        .unwrap_or_default()
}

#[tauri::command]
fn watch_file(
    path: String,
    window: tauri::Window,
    state: State<WatcherState>,
) -> Result<(), String> {
    use notify::EventKind;

    let mut watcher_guard = state.watcher.lock().unwrap();

    // Stop existing watcher if any
    *watcher_guard = None;

    // Create new watcher
    let window_clone = window.clone();
    let watcher = notify::recommended_watcher(move |res: Result<Event, notify::Error>| {
        match res {
            Ok(event) => {
                // Only emit on modify events
                if matches!(event.kind, EventKind::Modify(_)) {
                    let _ = window_clone.emit("file-changed", ());
                }
            }
            Err(_e) => {
                // Silently ignore watcher errors
            }
        }
    }).map_err(|e| format!("Failed to create watcher: {}", e))?;

    *watcher_guard = Some(watcher);

    // Start watching the file
    if let Some(w) = watcher_guard.as_mut() {
        w.watch(std::path::Path::new(&path), RecursiveMode::NonRecursive)
            .map_err(|e| format!("Failed to watch file: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
fn unwatch_file(state: State<WatcherState>) -> Result<(), String> {
    let mut watcher_guard = state.watcher.lock().unwrap();
    *watcher_guard = None;
    Ok(())
}

#[cfg(target_os = "linux")]
fn apply_linux_gpu_workaround() {
  if std::path::Path::new("/dev/dri").exists() {
    // && std::env::var("WAYLAND_DISPLAY").is_err() {
    // && std::env::var("XDG_SESSION_TYPE").unwrap_or_default() == "x11" {
    // Avoid dmabuf renderer crashes on X11 + NVIDIA.
    // SAFETY: set_var touches process-global env and must be done before
    // other threads spawn.
    unsafe {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  #[cfg(target_os = "linux")]
  apply_linux_gpu_workaround();

  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_log::Builder::default().build())
    .manage(WatcherState {
        watcher: Mutex::new(None),
    })
    .invoke_handler(tauri::generate_handler![
        get_cli_args,
        get_runtime_path,
        watch_file,
        unwatch_file
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
