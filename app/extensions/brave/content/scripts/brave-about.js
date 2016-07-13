/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

(function () {
  const ipcRenderer = chrome.ipc
  window.addEventListener('dispatch-action', (e) => {
    ipcRenderer.send('dispatch-action', e.detail)
  })
  window.addEventListener('change-setting', (e) => {
    ipcRenderer.send('change-setting', e.detail.key, e.detail.value)
  })
  window.addEventListener('change-site-setting', (e) => {
    ipcRenderer.send('change-site-setting', e.detail.hostPattern, e.detail.key, e.detail.value)
  })
  window.addEventListener('cert-error-accepted', (e) => {
    ipcRenderer.send('cert-error-accepted', e.detail.url)
  })
  window.addEventListener('new-frame', (e) => {
    ipcRenderer.sendToHost('new-frame', e.detail.frameOpts, e.detail.openInForeground)
  })
  window.addEventListener('context-menu-opened', (e) => {
    ipcRenderer.sendToHost('context-menu-opened', e.detail.nodeProps, e.detail.contextMenuType)
  })
  window.addEventListener('move-site', (e) => {
    ipcRenderer.send('move-site', e.detail.sourceDetail, e.detail.destinationDetail, e.detail.prepend, e.detail.destinationIsParent)
  })
  window.addEventListener('open-download-path', (e) => {
    ipcRenderer.send('open-download-path', e.detail.download)
  })
  window.addEventListener('decrypt-password', (e) => {
    ipcRenderer.send('decrypt-password', e.detail.encryptedPassword, e.detail.authTag, e.detail.iv, e.detail.id)
  })
  window.addEventListener('set-clipboard', (e) => {
    ipcRenderer.send('set-clipboard', e.detail)
  })
  window.addEventListener('show-notification', (e) => {
    ipcRenderer.send('show-notification', e.detail)
  })
  window.addEventListener('set-resource-enabled', (e) => {
    ipcRenderer.send('set-resource-enabled', e.detail.resourceName, e.detail.enabled)
  })
  window.addEventListener('delete-password', (e) => {
    ipcRenderer.send('delete-password', e.detail)
  })
  window.addEventListener('delete-password-site', (e) => {
    ipcRenderer.send('delete-password-site', e.detail)
  })
  window.addEventListener('clear-passwords', (e) => {
    ipcRenderer.send('clear-passwords')
  })
  window.addEventListener('request-language', (e) => {
    ipcRenderer.send('request-language')
  })
  window.addEventListener('check-flash-installed', (e) => {
    ipcRenderer.send('check-flash-installed')
  })
}).apply(this)
