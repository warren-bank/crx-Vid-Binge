// ==UserScript==
// @name         Vid-Binge
// @description  Watch videos in external player.
// @version      1.0.0
// @match        *://*.vidbinge.com/media/*
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
        var needle = 'https://m3u8.wafflehacker.io/m3u8-proxy?url='
        var copy_hls_link = document.querySelector('a[href^="' + needle + '"]')

        if (!copy_hls_link)
          throw 0

        debug('proxied HLS URL is: ' + copy_hls_link.href)

        var hls_url = copy_hls_link.href
        hls_url = hls_url.substring(needle.length, hls_url.length)
        hls_url = decodeURIComponent(hls_url)
        hls_url = hls_url.split('&headers=')

        if (hls_url.length !== 2)
          throw 0

        var headers = JSON.parse(hls_url[1])
        if (!headers || !headers.referer)
          throw 0

        var referer_url = headers.referer
        hls_url = hls_url[0]

        var webcast_reloaded_url = 'http://webcast-reloaded.frii.site/index.html#/watch/' + btoa(hls_url) + '/referer/' + btoa(referer_url)

        debug('HLS URL is: ' + hls_url)
        debug('Referer URL is: ' + referer_url)
        debug('Webcast-Reloaded URL is: ' + webcast_reloaded_url)

        var webcast_reloaded_link = document.createElement('a')
        webcast_reloaded_link.className = copy_hls_link.className
        webcast_reloaded_link.setAttribute('id', user_options.dom.id.webcast_reloaded_link)
        webcast_reloaded_link.setAttribute('href', webcast_reloaded_url)
        webcast_reloaded_link.setAttribute('target', '_blank')
        webcast_reloaded_link.textContent = 'Open in Webcast-Reloaded'
        webcast_reloaded_link.style.marginBottom = '0.5rem'

        copy_hls_link.parentNode.appendChild(webcast_reloaded_link)
        webcast_reloaded_link.scrollIntoView(false)

        debug('Webcast-Reloaded link added to DOM')
      }
      catch(e){}
    }, 500)
  }
  catch(e){}
}, true)
