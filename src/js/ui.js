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

function hoverEffect(e) {
  // console.log("Hover effect triggered on", e.target)
  console.log("classes:", e.target.classList)
  if(!e.target.classList.contains("hovering"))
    e.target.classList.add("hovering")
}

function removeHoverEffect(e) {
  // console.log("Removing hover effect from", e.target)
  if(e.target.classList.contains("hovering"))
    e.target.classList.remove("hovering")
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

// Export functions for use in other modules
window.mdvUI = {
  setTheme,
  toggleThemeMenu,
  hideThemeMenu,
  initializeUI,
  hoverEffect,
  removeHoverEffect,
  disableMenu
}
