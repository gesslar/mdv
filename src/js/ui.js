function initializeOpenButton() {
  const openButton = document.getElementById("openButton")
  if(openButton) {
    openButton.addEventListener("click", () => window.mdvFileHandler.browseFile())
  }
}

function initializeUI() {
  initializeOpenButton()
}

function getMainWidgets(){
  const widgetIds = ["preview", "watermark"]
  const widgets = widgetIds
    .map(id => document.getElementById(id))
    .filter(Boolean)

  if(widgets.length !== widgetIds.length) {
    error("Missing required UI elements:",
      String(widgetIds.filter(id => !document.getElementById(id)))
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
    error("Failed to get main widgets, resetting content.")
    resetContent()
    return null
  }

  const shown = Object.values(widgets)
    .filter(w => {
      const display = getComputedStyle(w).display
      return display && display !== "none"
    })

  if(!shown) {
    error("No visible main content found, resetting to watermark.")
    resetContent()
    return null
  }

  switch(shown.length) {
    case 0:
      error("No main widgets visible, resetting to watermark.")
      resetContent()
      return null
    case 1:
      // Only one widget visible, return it
      return shown[0]
    default:
      error("Multiple main widgets visible, resetting to watermark.")
      resetContent()
      return null
  }
}

function toggleDragEffect(element) {
  if(element.classList.contains("dragging"))
    element.classList.remove("dragging")
  else
    element.classList.add("dragging")
}

function addDragEffect(e) {
  const elements = ["mainView", "plusIcon"]
    .map(id => document.getElementById(id))
    .filter(element => !element.classList.contains("dragging"))

  elements.filter(element => toggleDragEffect(element))
}

function removeDragEffect(e) {
  const elements = ["mainView", "plusIcon"]
    .map(id => document.getElementById(id))
    .filter(element => element.classList.contains("dragging"))

  elements.filter(element => toggleDragEffect(element))
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
    warn("No content to display.")
    return
  }

  preview.innerHTML = marked.parse(text)
  watermark.style.display = "none"
  preview.style.display = "block"

  hljs.highlightAll()

  preview.scrollTo({
  top: 0,
  behavior: "smooth"
});
}

// Export functions for use in other modules
window.mdvUI = {
  disableMenu,
  displayContent,
  getVisibleMain,
  addDragEffect,
  initializeUI,
  removeDragEffect,
  resetContent,
  swapVisibility
}
