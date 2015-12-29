/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'
const AppConstants = require('../constants/appConstants')
const Immutable = require('immutable')
const URL = require('url')
const SiteUtil = require('../state/siteUtil')
const electron = require('electron')
const ipcMain = electron.ipcMain
const messages = require('../constants/messages')
const BrowserWindow = electron.BrowserWindow
const LocalShortcuts = require('../../app/localShortcuts')
const AppActions = require('../actions/appActions')
const siteHacks = require('../data/siteHacks')
const firstDefinedValue = require('../lib/functional').firstDefinedValue
const Serializer = require('../dispatcher/serializer')

let appState = Immutable.fromJS({
  windows: [],
  sites: [],
  visits: [],
  updateAvailable: false
})

// TODO cleanup all this createWindow crap
function isModal (browserOpts) {
  // this needs some better checks
  return browserOpts.scrollbars === false
}

function navbarHeight () {
  // TODO there has to be a better way to get this or at least add a test
  return 75
}

const createWindow = (browserOpts, defaults, parentWindowKey) => {
  browserOpts = browserOpts || {}
  // clean up properties
  delete browserOpts.webPreferences

  browserOpts.width = firstDefinedValue(browserOpts.width, browserOpts.innerWidth, defaults.width)
  // height and innerHeight are the frame webview size
  browserOpts.height = firstDefinedValue(browserOpts.height, browserOpts.innerHeight)
  if (isNaN(browserOpts.height)) {
    // no inner height so check outer height or use default
    browserOpts.height = firstDefinedValue(browserOpts.outerHeight, defaults.height)
  } else {
    // BrowserWindow height is window height so add navbar height
    browserOpts.height = browserOpts.height + navbarHeight()
  }

  browserOpts.x = firstDefinedValue(browserOpts.x, browserOpts.left, browserOpts.screenX)
  browserOpts.y = firstDefinedValue(browserOpts.y, browserOpts.top, browserOpts.screenY)
  delete browserOpts.left
  delete browserOpts.top

  let screen = electron.screen
  let primaryDisplay = screen.getPrimaryDisplay()
  let parentWindow = parentWindowKey ? BrowserWindow.fromId(parentWindowKey) : BrowserWindow.getFocusedWindow()
  let bounds = parentWindow ? parentWindow.getBounds() : primaryDisplay.bounds

  // position on screen should be relative to focused window
  // or the primary display if there is no focused window
  let display = screen.getDisplayNearestPoint(bounds)

  // if no parentWindow, x, y or center is defined then go ahead
  // and center it if it's smaller than the display width
  // typeof and isNaN are used because 0 is falsy
  if (!(parentWindow ||
      browserOpts.center === false ||
      browserOpts.x > 0 ||
      browserOpts.y > 0) &&
      browserOpts.width < display.bounds.width) {
    browserOpts.center = true
  } else {
    browserOpts.center = false
    // don't offset if focused window is at least as big as the screen it's on
    if (bounds.width >= display.bounds.width && bounds.height >= display.bounds.height) {
      browserOpts.x = firstDefinedValue(browserOpts.x, display.bounds.x)
      browserOpts.y = firstDefinedValue(browserOpts.y, display.bounds.y)
    } else {
      browserOpts.x = firstDefinedValue(browserOpts.x, bounds.x + defaults.windowOffset)
      browserOpts.y = firstDefinedValue(browserOpts.y, bounds.y + defaults.windowOffset)
    }

    // make sure the browser won't be outside the viewable area of any display
    // negative numbers aren't allowed so we don't need to worry about that
    let displays = screen.getAllDisplays()
    let maxX = Math.max(...displays.map((display) => { return display.bounds.x + display.bounds.width }))
    let maxY = Math.max(...displays.map((display) => { return display.bounds.y + display.bounds.height }))

    browserOpts.x = Math.min(browserOpts.x, maxX - defaults.windowOffset)
    browserOpts.y = Math.min(browserOpts.y, maxY - defaults.windowOffset)
  }

  var minWidth = isModal(browserOpts) ? defaults.minModalWidth : defaults.minWidth
  var minHeight = isModal(browserOpts) ? defaults.minModalHeight : defaults.minHeight

  // min width and height don't seem to work when the window is first created
  browserOpts.width = browserOpts.width < minWidth ? minWidth : browserOpts.width
  browserOpts.height = browserOpts.height < minHeight ? minHeight : browserOpts.height

  let mainWindow = new BrowserWindow(Object.assign({
    // smaller min size for "modal" windows
    minWidth,
    minHeight,
    // Neither a frame nor a titlebar
    // frame: false,
    // A frame but no title bar and windows buttons in titlebar 10.10 OSX and up only?
    'title-bar-style': 'hidden-inset',
    webPreferences: defaults.webPreferences
  }, browserOpts))

  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(function (details, cb) {
    let domain = URL.parse(details.url).hostname.split('.').slice(-2).join('.')
    let hack = siteHacks[domain]
    if (hack) {
      cb({ requestHeaders: hack.call(this, details) })
    } else {
      cb({})
    }
  })

  mainWindow.on('resize', function (evt) {
    // the default window size is whatever the last window resize was
    AppActions.setDefaultWindowSize(evt.sender.getSize())
  })

  mainWindow.on('close', function () {
    LocalShortcuts.unregister(mainWindow)
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  LocalShortcuts.register(mainWindow)
  return mainWindow
}

class AppStore {
  getState () {
    return appState
  }

  emitChange () {
    const stateJS = this.getState().toJS()
    BrowserWindow.getAllWindows().forEach(wnd =>
      wnd.webContents.send(messages.APP_STATE_CHANGE, stateJS))
  }
}

function windowDefaults () {
  setDefaultWindowSize()

  return {
    width: appState.get('defaultWindowWidth'),
    height: appState.get('defaultWindowHeight'),
    minWidth: 500,
    minHeight: 300,
    minModalHeight: 100,
    minModalWidth: 100,
    windowOffset: 20,
    webPreferences: {
      sharedWorker: true
    }
  }
}

/**
 * set the default width and height if they
 * haven't been initialized yet
 */
function setDefaultWindowSize () {
  let screen = electron.screen
  let primaryDisplay = screen.getPrimaryDisplay()
  if (!appState.get('defaultWindowWidth') && !appState.get('defaultWindowHeight')) {
    appState = appState.set('defaultWindowWidth', Math.floor(primaryDisplay.bounds.width / 2))
    appState = appState.set('defaultWindowHeight', Math.floor(primaryDisplay.bounds.height / 2))
  }
}

const appStore = new AppStore()

const handleAppAction = (action) => {
  switch (action.actionType) {
    case AppConstants.APP_NEW_WINDOW:
      let mainWindow = createWindow(action.browserOpts, windowDefaults(), action.frameOpts && action.frameOpts.parentWindowKey)

      let currentWindows = appState.get('windows')
      appState = appState.set('windows', currentWindows.push(mainWindow.id))

      // initialize frames state
      let frames = []
      if (action.frameOpts) {
        if (action.frameOpts.forEach) {
          frames = action.frameOpts
        } else {
          frames.push(action.frameOpts)
        }
      }

      // pass the appState and frames into the query string for initialization
      // This seems kind of hacky, maybe there is a better way to make
      // sure that the Window has the app state before it renders?
      let queryString =
        'appState=' + encodeURIComponent(JSON.stringify(appState.toJS())) +
        '&frames=' + encodeURIComponent(JSON.stringify(frames))

      if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('file://' + __dirname + '/../../app/index-dev.html?' + queryString)
      } else {
        mainWindow.loadURL('file://' + __dirname + '/../../app/index.html?' + queryString)
      }
      appStore.emitChange()
      break
    case AppConstants.APP_CLOSE_WINDOW:
      let appWindow = BrowserWindow.fromId(action.appWindowId)
      appWindow.close()

      let windows = appState.get('windows')
      appState = appState.set('windows', windows.delete(action.appWindowId))
      appStore.emitChange()
      break
    case AppConstants.APP_ADD_SITE:
      appState = appState.set('sites', SiteUtil.addSite(appState.get('sites'), action.frameProps, action.tag))
      appStore.emitChange()
      break
    case AppConstants.APP_REMOVE_SITE:
      appState = appState.set('sites', SiteUtil.removeSite(appState.get('sites'), action.frameProps, action.tag))
      appStore.emitChange()
      break
    case AppConstants.APP_SET_DEFAULT_WINDOW_SIZE:
      appState = appState.set('defaultWindowWidth', action.size[0])
      appState = appState.set('defaultWindowHeight', action.size[1])
      appStore.emitChange()
      break
    default:
  }
}

// Register callback to handle all updates
ipcMain.on(messages.APP_ACTION, (event, action) => {
  handleAppAction(Serializer.deserialize(action))
})

process.on(messages.APP_ACTION, handleAppAction)

process.on(messages.UPDATE_AVAILABLE, () => {
  console.log('appStore update-available')
  appState = appState.merge({
    updateAvailable: true
  })
  appStore.emitChange()
})

module.exports = appStore
