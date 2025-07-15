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
  window.mdvUI.dragLeaveTimeout && clearTimeout(window.mdvUI.dragLeaveTimeout)

  preventDefaults(e)

  window.mdvUI.addDragEffect(e)
}

function leave(e) {
  window.mdvUI.dragLeaveTimeout && clearTimeout(window.mdvUI.dragLeaveTimeout)

  preventDefaults(e)

  window.mdvUI.dragLeaveTimeout = setTimeout(() => removeDragEffect(e), 50)
}

async function handleFileDrop(e) {
  preventDefaults(e)

  const content = await loadFileFromDrop(e)
  content
    && window.mdvUI.displayContent(content)
    || error("Could not read dropped file.")
}

async function browseFile() {
  const {documentDir} = window.__TAURI__.path
  const {exists, readTextFile} = window.__TAURI__.fs

  const {open} = window.__TAURI__.dialog
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

  const content = await loadFileFromPath(filePath)
  if(content)
    window.mdvUI.displayContent(content)
  else
    error("Could not read selected file.")
}

function initializeDragAndDrop() {
  // Set up drag and drop event listeners
  ;["dragenter", "dragover"].forEach(eventName =>
    window.addEventListener(eventName, enter, false)
  )
  ;["dragleave", "drop"].forEach(eventName =>
    window.addEventListener(eventName, leave, false)
  )

  window.addEventListener("drop", handleFileDrop)
}

function initializeFileHandler() {
  initializeDragAndDrop()
}

async function loadFileFromDrop(e) {
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
    warn("Please drop a single markdown file.")
    return null
  }

  const file = collection[0]
  const content = await file?.text()

  if(!content) {
    error("Could not read dropped file.")
    return null
  }

  return content
}

async function loadFileFromPath(filePath) {
  info(`Loading file from path: ${filePath}`)

  if(!await exists(filePath)) {
    error("Selected file does not exist.")
    return null
  }

  // const parts = fileParts(filePath)
  // if(!validExtensions.includes(parts.ext) && !validMimeTypes.includes(parts.mimeType)) {
  //   error("Selected file is not a valid markdown file.")
  //   return null
  // }

  const content = await readTextFile(filePath)
  if(!content) {
    error("Could not read selected file.")
    return null
  }

  return content
}

// Export functions for use in other modules
window.mdvFileHandler = {
  browseFile,
  initializeFileHandler,
  validFileType,
  fileParts,
  loadFileFromDrop,
  loadFileFromPath
}
