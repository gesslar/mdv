const {getCurrentWindow} = window.__TAURI__.window

// Main entry point - coordinates all modules
document.addEventListener("DOMContentLoaded", () => {
  // Initialize all modules in order
  if(!window.mdvSetup.initializeMarked())
    return // Exit if marked.js failed to initialize

  // getCurrentWindow().setIcon("src/assets/icon.png")
  window.mdvUI.initializeUI()
  window.mdvFileHandler.initializeFileHandler()

  console.log("MDV initialized successfully! 🎉")
})
