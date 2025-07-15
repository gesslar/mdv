// UI handling - theme switching, menu interactions, etc.

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

function toggleThemeMenu() {
  const menu = document.getElementById("themeMenu")
  const arrow = document.getElementById("themeArrow")

  if(!(menu && arrow))
    return

  const isOpen = menu.classList.toggle("hidden")
  arrow.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)"
}

// 0 = up/closed/hidden, 180 = down/open/visible
function hideThemeMenu() {
  const menu = document.getElementById("themeMenu")
  const arrow = document.getElementById("themeArrow")

  if(!(menu && arrow))
    return

  arrow.style.transform = "rotate(0deg)"
  menu.classList.add("hidden")
}

function initializeThemeHandling() {
  const toggle = document.getElementById("themeToggle")
  const menu = document.getElementById("themeMenu")
  const arrow = document.getElementById("themeArrow")

  if(toggle && menu && arrow) {
    toggle.addEventListener("click", toggleThemeMenu)

    // Close menu when clicking outside
    document.addEventListener("click", e => {
      if(!toggle.contains(e.target) && !menu.contains(e.target))
        hideThemeMenu()
    })
  }

  // Set up theme switcher menu items
  document.querySelectorAll("[data-theme-switcher]").forEach(menuItem => {
    menuItem.addEventListener("click", e => {
      const theme = menuItem.dataset.themeSwitcher
      setTheme(theme)
      hideThemeMenu()
    })
  })

  // Initialize theme from localStorage or auto-detect
  setTheme(localStorage.getItem("mdv-theme") || "auto")
  hideThemeMenu()
  disableMenu()
}

function initializeOpenButton() {
  const openButton = document.getElementById("openButton")
  if(openButton) {
    openButton.addEventListener("click", () => window.mdvFileHandler.browseFile())
  }
}

function initializeUI() {
  initializeThemeHandling()
  initializeOpenButton()
}

function getMainWidgets(){
  const widgetIds = ["preview", "watermark"]
  const widgets = widgetIds
    .map(id => document.getElementById(id))
    .filter(Boolean)

  if(widgets.length !== widgetIds.length) {
    console.error("Missing required UI elements:",
      widgetIds.filter(id => !document.getElementById(id))
    )
    resetContent()
    return null
  }

  // Convert to an object and return
  return widgetIds.reduce((acc, id, index) => {
    acc[id] = widgets[index]
    return acc
  }, {})
}

function getVisibleMain() {
  const widgets = getMainWidgets()

  if(!widgets) {
    console.error("Failed to get main widgets, resetting content.")
    resetContent()
    return null
  }

  const shown = Object.values(widgets)
    .filter(w => {
      const display = getComputedStyle(w).display
      return display && display !== "none"
    })

  if(!shown) {
    console.error("No visible main content found, resetting to watermark.")
    resetContent()
    return null
  }

  switch(shown.length) {
    case 0:
      console.error("No main widgets visible, resetting to watermark.")
      resetContent()
      return null
    case 1:
      // Only one widget visible, return it
      return shown[0]
    default:
      console.error("Multiple main widgets visible, resetting to watermark.")
      resetContent()
      return null
  }
}

function hoverEffect(e) {
  const main = getVisibleMain()

  console.info("Hover effect on main:", main?.id)

  if(main)
    main.classList.add("hovering")
}

function removeHoverEffect(e) {
  const main = getVisibleMain()

  if(main)
    main.classList.remove("hovering")

}

function disableMenu() {
  if(window.location.hostname !== 'tauri.localhost')
    return

  document.addEventListener('contextmenu', e => {
    e.preventDefault();
    return false;
  }, { capture: true })

  document.addEventListener('selectstart', e => {
    e.preventDefault();
    return false;
  }, { capture: true })
}

function swapVisibility() {
  const widgets = getMainWidgets()

  for(const [_, widget] of Object.entries(widgets)) {
    if(!widget)
      continue

    if(widget.style.display === "none") {
      widget.style.display = "block"
    } else {
      widget.style.display = "none"
    }
  }
}

function resetContent() {
  const preview = document.getElementById("preview")
  const watermark = document.getElementById("watermark")

  preview.innerHTML = ""
  watermark.style.display = "block"
  preview.style.display = "none"
}

function displayContent(text) {
  const preview = document.getElementById("preview")
  const watermark = document.getElementById("watermark")

  if(!(typeof text === "string" && text.trim().length > 0)) {
    console.warn("No content to display.")
    return
  }

  preview.innerHTML = marked.parse(text)
  watermark.style.display = "none"
  preview.style.display = "block"

  hljs.highlightAll()
}

// Export functions for use in other modules
window.mdvUI = {
  disableMenu,
  displayContent,
  getVisibleMain,
  hideThemeMenu,
  hoverEffect,
  initializeUI,
  removeHoverEffect,
  resetContent,
  setTheme,
  swapVisibility,
  toggleThemeMenu,
}
