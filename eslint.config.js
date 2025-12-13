import js from "@eslint/js"
import jsdoc from "eslint-plugin-jsdoc"
import uglify from "@gesslar/uglier"

export default [
  js.configs.recommended,
  jsdoc.configs['flat/recommended'],
  {
    name: "gesslar/uglier/ignores",
    ignores: ["src/js/vendor"],
  },
  ...uglify({
    with: [
      "lints-js",
      "lints-jsdoc",
      "tauri"
    ],
    overrides: {
      "lints-js": {
        files: ["src/**/*.js"],
      },
      "lints-jsdoc": {
        files: ["src/**/*.js"],
      },
      "tauri": {
        files: ["src/**/*.js"],
      },
    },
  }),
]
