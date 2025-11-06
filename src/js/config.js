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

  configButton.addEventListener("click", async () => {
    await showConfig()
  })

  configPanel.addEventListener("click", (event) => {
    // hideConfig()
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
    restoreSettings();
    setupHooks();
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

// Theme handling
function setTheme(theme) {
  const html = document.documentElement
  const hljsTheme = document.getElementById("hljs-theme")

  html.classList.remove("light", "dark")

  if(theme === "light" || theme === "dark") {
    html.classList.add(theme)
    localStorage.setItem("mdv-theme", theme)
    hljsTheme.href = `css/github${theme === "dark" ? "-dark" : ""}.css`
  } else {
    localStorage.removeItem("mdv-theme")

    // Detect system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    html.classList.add(prefersDark ? "dark" : "light")
    hljsTheme.href = prefersDark ? "css/github-dark.css" : "css/github.css"
  }
}

function initializeThemeHandling() {
  setTheme(localStorage.getItem("mdv-theme") || "auto")
  hideThemeMenu()
  disableMenu()
}

function restoreSettings() {
  restoreThemeSettings();
}

const toggleStyles = {
  active: ["bg-pink-500/50", "text-white", "ring-pink-600/50", "hover:bg-pink-500/70", "focus:z-10"],
  inactive: ["bg-zinc-800", "text-zinc-200", "ring-zinc-900", "hover:bg-zinc-600", "focus:z-10"]
}

function toggleButton(button, active) {
  if(active) {
    button.classList.remove(...toggleStyles.inactive)
    button.classList.add(...toggleStyles.active)
  } else {
    button.classList.remove(...toggleStyles.active)
    button.classList.add(...toggleStyles.inactive)
  }
}

function resetToggles(buttons) {
  buttons.forEach(button => toggleButton(button, false))
}

const themes = ["auto", "light", "dark"]
function restoreThemeSettings() {
  const theme = localStorage.getItem("mdv-theme") || "auto"

  const buttons = themes.map(theme => document.getElementById(`btn-${theme}`))
  if(!buttons || buttons.length === 0)
    return error("No theme buttons found for restoration.")

  // Reset all buttons to inactive state
  buttons.forEach(button => toggleButton(button, false))

  const activeButton = buttons.find(button => button.id === `btn-${theme}`) || buttons[0]
  toggleButton(activeButton, true)
}

function setupHooks() {
  const buttons = themes.map(theme => document.getElementById(`btn-${theme}`))

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      resetToggles(buttons)

      const themeName = button.id.replace("btn-", "")
      setTheme(themeName)
      toggleButton(button, true)
    })
  })
}

window.mdvConfig = {
  initializeConfig,
  showConfig,
  hideConfig,
  configPanel: document.getElementById("config-panel"),
  configButton: document.getElementById("config-button"),
}
