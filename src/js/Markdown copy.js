import Util from "./Util.js"
import Notify from "./Notify.js"
import hljs from "./vendor/highlight.esm.js"
import {Marked} from "./vendor/marked.esm.js"
import {markedHighlight} from "./vendor/marked-highlight-esm.js"

/**
 * Configures marked/hljs and tracks heading metadata during parsing.
 * Designed to be initialized once at startup; headings collected via
 * the token walker are later consumed by the TOC builder.
 */
export default class Markdown {
  #raw
  #parsed
  #marked

  /**
   * Creates a Markdown renderer with optional initial content.
   *
   * @param {string} [content] - Markdown source to render.
   */
  constructor(content) {
    this.#initializeMarked()
    this.#raw = content ?? ""
  }

  /**
   * Parses the current markdown source and emits a render event.
   *
   * @returns {Promise<void>} Resolves when rendering completes.
   */
  async render() {
    const parsed = await this.#marked.parse(this.#raw)
    this.#parsed = parsed

    Notify.emit("markdown-rendered", this)
  }

  /**
   * Last rendered HTML output.
   *
   * @returns {string} Rendered HTML from the last parse.
   */
  get text() {
    return this.#parsed
  }

  /** Collected heading metadata from the most recent render. */
  #headings = []
  /**
   * Exposes collected headings for TOC building.
   *
   * @returns {Array<{depth: number, raw: string, text: string, id: string}>} Headings captured during the last render.
   */
  get headings() {
    return this.#headings
  }

  #highlight(code,lang) {
    const language = hljs.getLanguage(lang) ? lang :  "plaintext"

    const sanitised = Util.sanitise(code)

    return hljs.highlight(sanitised, {language}).value

    // if(lang && hljs.getLanguage(lang))
    //   return hljs.highlight(code, {lang}).value

    // return hljs.highlightAuto(code).value
  }

  /**
   * Initializes marked with highlighting and custom renderers for links/headings.
   * Must be called before rendering markdown.
   *
   * @returns {Promise<boolean>} True when initialization completes; false when marked is unavailable.
   */
  async #initializeMarked() {
    this.#marked = new Marked(
      markedHighlight({
        userNewRenderer: true,
        emptyLangClass: "hljs",
        langPrefix: "hljs language-",
        highlight: this.#highlight
      })
    )

    // Custom link renderer with external link icons
    this.#marked.use({
      renderer: {
        link: arg => this.#renderLink(arg),
        heading: arg => this.#renderHeadingAnchor(arg)
      },
    })

    this.#marked.use({
      walkTokens: arg => this.#processHeading(arg)
    })
  }

  /**
   * Renders external links with a trailing icon and safety attributes.
   *
   * @param {{text: string, href: string, title?: string}} data - Link metadata supplied by marked.
   * @returns {string} Rendered HTML for the link with icon.
   * @private
   */
  #renderLink(data) {
    const {text,href,title} = data

    return `<span>`+
        `<a `+
          `href="${href}" `+
          `target="_blank" `+
          `rel="noopener noreferrer" `+
          `title="${title ?? ""}"`+
        `>`+
          `${text}`+
        `</a>` +
        `<i class="external-link-icon" aria-hidden="true"></i>`+
      `</span>`
  }

  /**
   * Produces heading HTML with deterministic ids derived from the text.
   *
   * @param {{text: string, depth: number}} data - Heading token data.
   * @returns {string} Rendered heading HTML with id attribute.
   * @private
   */
  #renderHeadingAnchor(data) {
    const {text, depth} = data
    const id = this.#generateAnchorId(text) // Convert "Quick start" -> "quick-start"

    return `<h${depth} id="${id}">${text}</h${depth}>`
  }

  /**
   * Collects heading data during parsing for later TOC construction.
   *
   * @param {{type: string, depth?: number, raw?: string, text?: string}} data - Token data emitted by marked.
   * @private
   */
  #processHeading(data) {
    if(data.type === "heading") {
      const {depth,raw,text} = data
      const id = this.#generateAnchorId(text)
      this.#headings.push({depth,raw,text,id})
    }
  }

  /**
   * Normalizes heading text into a URL-safe anchor id.
   *
   * @param {string} title - Raw heading text.
   * @returns {string} Slugified id suitable for use in the DOM.
   * @private
   */
  #generateAnchorId(title) {
    const newTitle = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

    return (/^[\d-]/.test(newTitle))
      ? `_${newTitle}`
      : newTitle
  }
}
