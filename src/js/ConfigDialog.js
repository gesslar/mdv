import Base from "./Base.js"
import {error} from "./Logging.js"
import Notify from "./Notify.js"
import Util from "./Util.js"

/**
 * Manages the on-demand configuration panel and theme selection.
 * Responsible for creating/removing the dialog, saving user theme preferences,
 * and wiring theme toggle buttons. Theme application to the DOM is handled by UI.
 */
export default class ConfigDialog extends Base {
  #contentPath = "./html/config-panel.html"
  #themes = ["auto", "light", "dark"]

  /**
   * Resolves the active configuration dialog element.
   *
   * @returns {HTMLDialogElement?} Currently active configuration dialog.
   */
  get element() {
    return document.querySelector("#config-panel")
  }

  /**
   * Resolves the backdrop element behind the dialog when present.
   *
   * @returns {HTMLElement?} Backdrop element attached behind the dialog.
   */
  get backdrop() {
    return document.querySelector("#config-backdrop")
  }

  /**
   * Opens the configuration panel when absent; closes and removes it when
   * present.
   *
   * @returns {Promise<void>}
   */
  async toggleConfigurationPanel() {
    return this.element
      ? this.#remove()
      : this.#new()
  }

  /**
   * Builds and displays the configuration dialog and its backdrop.
   *
   * @returns {Promise<void>}
   * @private
   */
  async #new() {
    if(this.element)
      return

    const configContent = await Util.loadHTML(this.#contentPath)
    if(!configContent)
      return error("Unable to load configuration content.")

    // Create custom backdrop
    const backdrop = document.createElement("div")
    backdrop.id = "config-backdrop"
    document.body.appendChild(backdrop)

    const panel = document.createElement("dialog")
    panel.id = "config-panel"
    panel.role = "dialog"

    Util.setHTMLContent(panel, configContent)
    document.body.appendChild(panel)

    this.#restoreThemeSettings()
    this.#initialiseActions()

    this.element.showModal()
  }

  /**
   * Closes and removes the configuration dialog and backdrop.
   *
   * @private
   */
  #remove() {
    if(!this.element)
      return

    this.element.close()

    document.body.removeChild(this.element)

    if(this.backdrop)
      document.body.removeChild(this.backdrop)

    this.remove()
  }

  // Theme handling
  /**
   * Saves the theme preference and emits a theme-changed event for UI to apply.
   *
   * @param {"auto"|"light"|"dark"} themePreference - User's theme preference.
   * @private
   */
  #saveThemePreference(themePreference) {
    if(themePreference === "light" || themePreference === "dark") {
      localStorage.setItem("mdv-theme", themePreference)
    } else {
      // "auto" means no preference, use system default
      localStorage.removeItem("mdv-theme")
    }

    // Notify UI to apply the theme
    Notify.emit("theme-changed", {theme: themePreference})
  }

  /**
   * Returns the currently saved theme preference.
   *
   * @returns {"auto"|"light"|"dark"} The saved preference or "auto" if none.
   */
  getThemePreference() {
    return localStorage.getItem("mdv-theme") || "auto"
  }

  /**
   * Toggles the active class on a theme button. Has the side effect of
   * toggling the other buttons in the opposite direction if active===true
   *
   * @param {HTMLElement} button - Button to toggle.
   * @param {boolean} [active] - True when setting the active state.
   * @private
   */
  #toggleButton(button, active=true) {
    if(typeof active !== "boolean")
      throw new TypeError("Active must be true or false.")

    if(active === true) {
      this.#themeButtons.forEach(e =>
        e.id === button.id
          ? e.classList.add("active")
          : e.classList.remove("active")
      )
    } else {
      button.classList.remove("active")
    }
  }

  get #currentThemePreference() {
    return this.getThemePreference()
  }

  get #themeButtons() {
    return this.#themes
      .map(e => `#btn-${e}`)
      .map(e => document.querySelector(e))
      .filter(Boolean)
  }

  /**
   * Restores theme preference from localStorage into the toggle UI.
   *
   * @returns {void}
   */
  #restoreThemeSettings() {
    const themePreference = this.#currentThemePreference
    const button = document.querySelector(`#btn-${themePreference}`)

    this.#toggleButton(button, true)
  }

  /**
   * Handles theme button click events and saves the theme preference.
   *
   * @param {MouseEvent} event - Click originating from a theme button.
   * @private
   */
  #themeButtonClick(event) {
    const button = event.currentTarget
    const themePreference = button.id.replace("btn-", "")

    this.#saveThemePreference(themePreference)
    this.#toggleButton(button, true)
  }

  #initialiseActions() {
    const close = document.querySelector("#close-config")
    const panel = this.element

    this.registerOn("click", () => this.#closeButtonClick(), close, {once: true})
    this.registerOn("close", () => this.#closeButtonClick(), panel, {once: true})

    this.#themeButtons.forEach(button => this.initialiseElement(
      `#${button.id}`,
      () => Notify.on("click", evt => this.#themeButtonClick(evt), button)
    ))

  }

  /**
   * Handles the dialog close button and performs cleanup.
   *
   * @private
   */
  #closeButtonClick() {
    this.#remove()
  }
}
