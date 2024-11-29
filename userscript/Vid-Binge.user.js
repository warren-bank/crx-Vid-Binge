// ==UserScript==
// @name         Vid-Binge
// @description  Watch videos in external player.
// @version      1.0.1
// @match        *://*.vidbinge.com/*
// @icon         https://www.vidbinge.com/favicon.ico
// @run-at       document-end
// @homepage     https://github.com/warren-bank/crx-Vid-Binge/tree/userscript/es5
// @supportURL   https://github.com/warren-bank/crx-Vid-Binge/issues
// @downloadURL  https://github.com/warren-bank/crx-Vid-Binge/raw/userscript/es5/userscript/Vid-Binge.user.js
// @updateURL    https://github.com/warren-bank/crx-Vid-Binge/raw/userscript/es5/userscript/Vid-Binge.user.js
// @namespace    warren-bank
// @author       Warren Bank
// @copyright    Warren Bank
// ==/UserScript==

// ----------------------------------------------------------------------------- constants

var user_options = {
  "debug_verbosity": 0,  // 0 = silent. 1 = console log. 2 = window alert. 3 = window alert + breakpoint in onclick handler.
  "dom": {
    "id": {
      "webcast_reloaded_link": "webcast_reloaded_link"
    }
  }
}

// ----------------------------------------------------------------------------- debug

var debug = function(msg) {
  if (!user_options.debug_verbosity) return

  switch(user_options.debug_verbosity) {
    case 1:
      console.log(msg)
      break
    case 2:
    case 3:
      window.alert(msg)
      break
  }
}

// ----------------------------------------------------------------------------- helper

var find_vid = function() {
  var vid_link, vid_url, referer_url
  var regex, match, headers

  try {
    vid_link = Array.prototype.slice.call(
      document.querySelectorAll('a[target="_blank"]')
    )
    .filter(function($a) {return ($a.href.indexOf('.m3u8') !== -1) || ($a.href.indexOf('.mpd') !== -1)})
    .pop()

    vid_url = vid_link.href

    regex = /^.*[\?&]url=(.*)$/
    match = regex.exec(vid_url)
    if (match)
      vid_url = decodeURIComponent(match[1])

    headers = vid_url.split('&headers=')
    if (headers.length === 2) {
      vid_url = headers[0]
      headers = JSON.parse(headers[1])
      referer_url = headers.referer
    }
  }
  catch(e) {}

  return {vid_link, vid_url, referer_url}
}

var get_webcast_reloaded_url = function(vid_url, referer_url) {
  var url = 'http://webcast-reloaded.frii.site/index.html#/watch/' + btoa(vid_url)

  if (referer_url)
    url += '/referer/' + btoa(referer_url)

  return url
}

// ----------------------------------------------------------------------------- global click event handler (during capture phase)

document.addEventListener('click', function(event) {
  try {
    if (user_options.debug_verbosity > 2) debugger;

    if (document.getElementById(user_options.dom.id.webcast_reloaded_link))
      throw 0

    var download_button = document.querySelector('button svg.feather-download').closest('button')

    if (!download_button)
      throw 0

    debug('download_button exists')
    debug('click event target is: ' + event.target.tagName)

    if ((event.target !== download_button) && (event.target.parentElement !== download_button) && (event.target.parentElement.parentElement !== download_button))
      throw 0

    debug('click event target is the download_button')

    // wait for download links to render..
    setTimeout(function() {
      try {
        var vid = find_vid()
        if (!vid || !vid.vid_link || !vid.vid_url)
          throw 0

        var url = get_webcast_reloaded_url(vid.vid_url, vid.referer_url)

        debug('Video URL is: ' + vid.vid_url)
        debug('Referer URL is: ' + vid.referer_url)
        debug('Webcast-Reloaded URL is: ' + url)

        var webcast_reloaded_link = document.createElement('a')
        webcast_reloaded_link.className = vid.vid_link.className
        webcast_reloaded_link.setAttribute('id', user_options.dom.id.webcast_reloaded_link)
        webcast_reloaded_link.setAttribute('href', url)
        webcast_reloaded_link.setAttribute('target', '_blank')
        webcast_reloaded_link.textContent = 'Open in Webcast-Reloaded'
        webcast_reloaded_link.style.marginBottom = '0.5rem'

        vid.vid_link.parentNode.appendChild(webcast_reloaded_link)
        webcast_reloaded_link.scrollIntoView(false)

        debug('Webcast-Reloaded link added to DOM')
      }
      catch(e){}
    }, 500)
  }
  catch(e){}
}, true)
