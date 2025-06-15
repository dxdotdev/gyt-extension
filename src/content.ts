import browser from 'webextension-polyfill'

browser.runtime.onMessage.addListener(() => {
  return Promise.resolve({
    title: document.querySelector('yt-formatted-string.ytd-watch-metadata:nth-child(1)')?.innerHTML,
  })
})
