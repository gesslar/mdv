// File handling - drag/drop, file validation, file opening

const validMimeTypes = ["text/markdown", "application/x-markdown"]
const validExtensions = ["md", "markdown"]

function fileParts(file) {
  if(!file)
    return {name: "", ext: ""}

  const parts = file.split('.')
  const ext = parts.pop().toLowerCase()
  const name = parts.join('.')
  return {name, ext}
}

function validFileType(file) {
  if(!file || !file.type || !file.name)
    return false

  const mimeType = file.type.toLowerCase()
  const ext = file.name.split('.').pop().toLowerCase()

  return validMimeTypes.includes(mimeType) || validExtensions.includes(ext)
}

function preventDefaults(e) {
  e.preventDefault && e.preventDefault()
  e.stopPropagation && e.stopPropagation()
}

function enter(e) {
  preventDefaults(e)
  window.mdvUI.hoverEffect(e)
}

function leave(e) {
  preventDefaults(e)
  window.mdvUI.removeHoverEffect(e)
}

async function handleFileDrop(e) {
  preventDefaults(e)

  const collection = e.dataTransfer.files
    ? (
        Array.from(e.dataTransfer.files)
      )
    : (
        Array.from(e.dataTransfer.items)
        .filter(item => item.kind === "file")
        .map(item => item.getAsFile())
      )
    .filter(item => validFileType(item))

  if(collection.length !== 1) {
    console.warn("Please drop a single markdown file.")
    return
  }

  const file = collection[0]
  const content = await file?.text()

  if(!content) {
    console.error("Could not read dropped file.")
    return
  }

  window.mdvUI.displayContent(content)
}

async function browseFile() {
  const {open} = window.__TAURI__.dialog
  const {documentDir} = window.__TAURI__.path
  const {exists, readTextFile} = window.__TAURI__.fs

  const filePath = await open({
    multiple: false,
    directory: false,
    defaultPath: await documentDir(),
    title: "Open Markdown File",
    filters: [{
      name: "Markdown Files",
      extensions: validExtensions,
    }]
  })

  if(!await exists(filePath)) {
    console.error("Selected file does not exist.")
    return
  }

  const parts = fileParts(filePath)
  if(!validExtensions.includes(parts.ext) && !validMimeTypes.includes(parts.mimeType)) {
    console.error("Selected file is not a valid markdown file.")
    return
  }

  const content = await readTextFile(filePath)
  if(!content) {
    console.error("Could not read selected file.")
    return
  }

  window.mdvUI.displayContent(content)
}

function initializeDragAndDrop() {
  const dropZone = document.getElementById("drop-zone")

  if(!dropZone) {
    console.error("Could not find #drop-zone element.")
    return
  }

  // Set up drag and drop event listeners
  ;["dragenter", "dragover"].forEach(en =>
    window.addEventListener(en, enter, false)
    // dropZone.addEventListener(en, enter, false)
  )
  ;["dragleave", "drop"].forEach(en =>
    window.addEventListener(en, leave, false)
    // dropZone.addEventListener(en, leave, false)
  )

  // dropZone.addEventListener("drop", handleFileDrop)
  window.addEventListener("drop", handleFileDrop)
}

function initializeFileHandler() {
  initializeDragAndDrop()
}

// Export functions for use in other modules
window.mdvFileHandler = {
  browseFile,
  initializeFileHandler,
  validFileType,
  fileParts
}
