async function initializeConfig() {
  // Do we have our configuration html file?

  // const {exists} = window.__TAURI__.fs
  // info("Checking if config HTML file exists...")
  // const configFilePath = await exists("html/config-panel.html")
  // if(!configFilePath) {
  //   error("Config panel HTML file not found. Cannot initialize config.")
  //   return
  // } else {
  //   info("Config panel HTML file found.")
  // }

  // Initialize Config-related functionality
  const configButton = window.mdvConfig.configButton

  if(!configButton) {
    error("Config button not found.")
    return
  }

  const configPanel = window.mdvConfig.configPanel
  if(!configPanel) {
    error("Config panel not found.")
    return
  }

  info("Initializing Config functionality")

  info("Adding 'click' event listener to config button")
  configButton.addEventListener("click", async () => {
    info("Config button clicked")
    await showConfig()
  })

  configPanel.addEventListener("click", (event) => {
    info(`Config panel clicked ${event.target}`)
    hideConfig()
  })

  // info("Looking for close button in config panel")
  // const closeButton = document.getElementById("close-config")
  // if(closeButton) {
  //   info("Close button found")
  //   closeButton.addEventListener("click", () => {
  //     info("Close button clicked")
  //     hideConfig()
  //   })
  // } else {
  //   info("Close button not found, using Config close functionality")
  // }

  // // Close dialog on outside click
  // const dialog = window.mdvDialog.dialog
  // if (dialog) {
  //   dialog.addEventListener("click", (event) => {
  //     info("Dialog clicked", event.target)
  //     if (event.target === dialog) {
  //       info("Dialog background clicked, hiding config")
  //       hideConfig()
  //     }
  //   })
  // }
}

async function showConfig() {
  try {
    const {invoke} = window.__TAURI__.core
    const isDev = await invoke("is_dev")
    const response = await fetch("html/config-panel.html")
    const html = await response?.text()

    if(!html)
      return error("Failed to load config panel content.")

    const content = isDev
      ? (() => {
        const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)

        return match
          ? match[1]
          : null
      })()
      : html

    if(!content)
      return error("No content found in config panel HTML.")

    mdvConfig.configPanel.classList.add("open")
    mdvConfig.configPanel.innerHTML = content;
    mdvConfig.configPanel.addEventListener("transitionend", function handler() {
      mdvConfig.configPanel.removeEventListener("transitionend", handler)
    }, {once: true})
  } catch(e) {
    return error(`Failure loading configuration: ${e}`)
  }
}

function hideConfig() {
  mdvConfig.configPanel.classList.remove("open")

  // Clear content after transition completes
  mdvConfig.configPanel.addEventListener("transitionend", function handler() {
    mdvConfig.configPanel.innerHTML = ""
    mdvConfig.configPanel.removeEventListener("transitionend", handler)
  })
}

window.mdvConfig = {
  initializeConfig,
  showConfig,
  hideConfig,
  configPanel: document.getElementById("config-panel"),
  configButton: document.getElementById("config-button"),
}
