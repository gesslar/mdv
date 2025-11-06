const {getCurrentWindow} = window.__TAURI__.window

// Main entry point - coordinates all modules
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize all modules in order
  if(!window.mdvSetup.initializeMarked())
    return // Exit if marked.js failed to initialize

  // getCurrentWindow().setIcon("src/assets/icon.png")
  window.mdvUI.initializeUI()
  window.mdvFileHandler.initializeFileHandler()
  await window.mdvConfig.initializeConfig()

  info("MDV initialized successfully! 🎉")

  // File association and CLI
  const {getMatches} = window.__TAURI__.cli

  const matches = await getMatches()

  const source = matches?.args?.source?.value?.toString()
  if(source) {
    const content = await window.mdvFileHandler.loadFileFromPath(source)

    if(content)
      window.mdvUI.displayContent(content)
    else
      error(`Could not read file from source: ${source}`)
  }
})
