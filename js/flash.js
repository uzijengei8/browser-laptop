// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs')
const path = require('path')
const {app, ipcMain, webContents} = require('electron')
const appActions = require('./actions/appActions')
const {getOrigin} = require('./state/siteUtil')
const locale = require('../app/locale')
const messages = require('./constants/messages')
const settings = require('./constants/settings')

// set to true if the flash install check has succeeded
let flashInstalled = false

let pluginPath
const getPepperFlashPath = () => {
  if (pluginPath) {
    return pluginPath
  }
  if (['darwin', 'win32'].includes(process.platform)) {
    return app.getPath('pepperFlashSystemPlugin')
  }
  const basePath = '/usr/lib'
  const plugin = 'libpepflashplayer.so'
  pluginPath = path.resolve(basePath, 'pepperflashplugin-nonfree', plugin)
  try {
    fs.statSync(pluginPath)
  } catch (e) {
    pluginPath = path.resolve(basePath, 'PepperFlash', plugin)
    try {
      fs.statSync(pluginPath)
    } catch (e) {
      // Throws error if not found
      pluginPath = path.resolve('/usr/lib64/chromium', 'PepperFlash', plugin)
    }
  }
  return pluginPath
}

module.exports.getFlashResourceId = () => {
  return path.basename(getPepperFlashPath())
}

module.exports.showFlashMessageBox = (location, tabId) => {
  const origin = getOrigin(location)
  const message = locale.translation('allowFlashPlayer', {origin})

  setImmediate(() => {
    // This is bad, we shouldn't be calling actions from actions
    // so we need to refactor notifications into a state helper
    appActions.showMessageBox({
      buttons: [
        {text: locale.translation('deny')},
        {text: locale.translation('allow')}
      ],
      message,
      frameOrigin: origin,
      options: {
        persist: true
      }
    })

    ipcMain.once(messages.NOTIFICATION_RESPONSE, (e, msg, buttonIndex, persist) => {
      if (msg === message) {
        appActions.hideMessageBox(message)
        if (buttonIndex === 1) {
          if (persist) {
            appActions.changeSiteSetting(origin, 'flash', Date.now() + 7 * 24 * 1000 * 3600)
          } else {
            appActions.changeSiteSetting(origin, 'flash', 1)
          }

          if (tabId) {
            const tab = webContents.fromTabID(tabId)
            if (tab && !tab.isDestroyed()) {
              return tab.reload()
            }
          }
        } else {
          if (persist) {
            appActions.changeSiteSetting(origin, 'flash', false)
          }
        }
      }
    })
  })
}

module.exports.checkFlashInstalled = (cb) => {
  try {
    const pepperFlashSystemPluginPath = getPepperFlashPath()
    const pepperFlashManifestPath = path.resolve(pepperFlashSystemPluginPath, '..', 'manifest.json')
    fs.readFile(pepperFlashManifestPath, (err, data) => {
      try {
        if (err || !data) {
          flashInstalled = false
        } else {
          const manifest = JSON.parse(data)
          app.commandLine.appendSwitch('ppapi-flash-path', pepperFlashSystemPluginPath)
          app.commandLine.appendSwitch('ppapi-flash-version', manifest.version)
          flashInstalled = true
        }
      } finally {
        appActions.changeSetting(settings.FLASH_INSTALLED, flashInstalled)
        cb && cb(flashInstalled)
      }
    })
  } catch (e) {
    cb && cb(flashInstalled)
  }
}

module.exports.init = () => {
  setImmediate(module.exports.checkFlashInstalled)
}

module.exports.resourceName = 'flash'
