/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const fs = require('fs')
const sessionStorageVersion = 1
const sessionStorageName = `session-store-${sessionStorageVersion}`

/**
 * Saves the specified immutable browser state to storage.
 *
 * @param {object} payload - Applicaiton state as per
 *   https://github.com/brave/browser/wiki/Application-State
 *   (not immutable data)
 * @return a promise which resolves when the state is saved
 */
module.exports.saveAppState = (payload) => {
  return new Promise((resolve, reject) => {
    // Don't persist private frames
    // TODO when we have per window state as well:
    // payload.frames = payload.frames.filter(frame => !frame.isPrivate)
    fs.writeFile(sessionStorageName, JSON.stringify(payload), (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * Cleans session data from unwanted values.
 */
module.exports.cleanSessionData = (sessionData) => {
  if (!sessionData) {
    sessionData = {}
  }
  // Hide the context menu when we restore.
  sessionData.contextMenuDetail = null

  sessionData.frames = sessionData.frames || []
  sessionData.frames.forEach((frame, i) => {
    // Reset the ids back to sequential numbers
    let newKey = i + 1
    if (frame.key === sessionData.activeFrameKey) {
      sessionData.activeFrameKey = newKey
    } else {
      // For now just set everything to unloaded unless it's the active frame
      frame.unloaded = true
    }
    frame.key = newKey
    // Full history is not saved yet
    frame.canGoBack = false
    frame.canGoForward = false

    // If a blob is present for the thumbnail, create the object URL
    if (frame.thumbnailBlob) {
      try {
        frame.thumbnailUrl = window.URL.createObjectURL(frame.thumbnailBlob)
      } catch (e) {
        delete frame.thumbnailUrl
      }
    }

    // Delete lists of blocked sites
    delete frame.replacedAds
    delete frame.blockedAds
    delete frame.blockedByTracking

    // Do not show the audio indicator until audio starts playing
    delete frame.audioMuted
    delete frame.audioPlaybackActive
    // Let's not assume wknow anything about loading
    delete frame.loading
    // Always re-determine the security data
    delete frame.security
    // Value is only used for local storage
    delete frame.isActive
    // Hide modal prompts.
    delete frame.modalPromptDetail
    // Remove HTTP basic authentication requests.
    delete frame.basicAuthDetail
    // Remove open search details
    delete frame.searchDetail
    // Remove find in page details
    delete frame.findDetail
    // Don't store child tab open ordering since keys
    // currently get re-generated when session store is
    // restored.  We will be able to keep this once we
    // don't regenerate new frame keys when opening storage.
    delete frame.parentFrameKey
  })
}

/**
 * Loads the browser state from storage.
 *
 * @return a promise which resolves with the immutable browser state or
 * rejects if the state cannot be loaded.
 */
module.exports.loadAppState = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(sessionStorageName, (err, data) => {
      if (err || !data) {
        reject(err)
        return
      }

      try {
        data = JSON.parse(data)
      } catch (e) {
        // TODO: Session state is corrupted, maybe we should backup this
        // corrupted value for people to report into support.
        console.log('could not parse data: ', data)
        reject(e)
        return
      }
      if (data.perWindowState) {
        data.perWindowState.forEach(module.exports.cleanSessionData)
      }
      resolve(data)
    })
  })
}

/**
 * Obtains the default application level state
 */
module.exports.defaultAppState = () => {
  return {
    windows: [],
    sites: [],
    visits: [],
    updateAvailable: false
  }
}
