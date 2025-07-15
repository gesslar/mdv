// Setup and configuration for markdown rendering
const {open} = window.__TAURI__.dialog
const {documentDir} = window.__TAURI__.path
const {exists, readTextFile} = window.__TAURI__.fs

function initializeMarked() {
  if(typeof marked === "undefined") {
    console.error("marked.js not loaded. Cannot render markdown.")
    return false
  }

  // Configure marked to auto-highlight
  marked.setOptions({
    highlight(code, language) {
      if(language && hljs.getLanguage(language))
        return hljs.highlight(code, { language }).value

      return hljs.highlightAuto(code).value
    },
  })

  // Custom link renderer with external link icons
  marked.use({renderer: {
    link: ({text, href, title}) =>
      `<span>`+
        `<a `+
          `href="${href}" `+
          `target="_blank" `+
          `rel="noopener noreferrer" `+
          `title="${title ?? ""}"`+
        `>`+
          `${text}`+
        `</a>` +
        `<i class="external-link-icon" aria-hidden="true"></i>`+
      `</span>`,
  }})

  return true
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
window.mdvSetup = {
  initializeMarked,
  displayContent
}
