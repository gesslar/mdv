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
    .invoke_handler(tauri::generate_handler![get_cli_args, get_runtime_path])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
