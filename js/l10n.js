const ipcRenderer = require('electron').ipcRenderer
const locale = require('../app/locale')

// rendererTranslationCache stores a hash containing the entire set of menu translations
// for the currently selected language
var rendererTranslationCache = {}

// As for a translation for the current language
exports.translation = (token) => {
  // If we are in the renderer process
  if (ipcRenderer) {
    // If the token does not exist in the renderer translations cache
    if (!rendererTranslationCache[token]) {
      // Ask for all translations from the main process and cache (this will happen once
      // per renderer process)
      rendererTranslationCache = ipcRenderer.sendSync('translations')
    }
    // Return the translation
    return rendererTranslationCache[token] || `[${token.toLowerCase()}]`
  } else {
    // Otherwise retrieve translation directly
    return locale.translation(token)
  }
}
