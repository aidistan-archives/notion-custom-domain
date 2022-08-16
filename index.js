import express from 'express'
import proxy from 'express-http-proxy'
import path from 'path'

// Load configurations from environment variables
const START_PAGE_URL = process.env.START_PAGE_URL || 'https://notion.site/'
const GA_TRACKING_ID = process.env.GA_TRACKING_ID || ''

const { origin: pageDomain, pathname: pagePath } = new URL(START_PAGE_URL)
const pageId = path.basename(pagePath).match(/[^-]*$/)

express()
  .use(proxy(pageDomain, {
    proxyReqPathResolver: (req) => {
      // Redirect '/' to `/${pageId}`
      return req.url.replace(/\/(\?|$)/, `/${pageId}$1`)
    },

    userResDecorator: (_proxyRes, proxyResData, userReq) => {
      const proxyResText = proxyResData.toString()

      // Inject into main js
      // -------------------
      if (/^\/app-.*\.js$/.test(userReq.url)) {
        return proxyResText

          // Prepend utility functions
          .replace(/^/, `var $ncd = {
            href: function () {
              return location.href
                .replace(location.origin, '${pageDomain}')
                .replace(/\\/(?=\\?|$)/, '/${pageId}')
            },
            pushState: function (a, b, url) {
              history.pushState(a, b, url
                .replace('${pageDomain}', location.origin)
                .replace(/(^|[^/]*)\\/[^/]*${pageId}(?=\\?|$)/, '$1/')
              )
              ${GA_TRACKING_ID ? 'pageview()' : ''}
            },
            replaceState: function (a,b,url) {
              history.replaceState(a, b, url
                .replace('${pageDomain}', location.origin)
                .replace(/(^|[^/]*)\\/[^/]*${pageId}(?=\\?|$)/, '$1/'))
              ${GA_TRACKING_ID ? 'pageview()' : ''}
            }
          };`)

          // Replace all references to window.location.href to confuse
          // (exclude 'window.locaton.href=' but not 'window.locaton.href==')
          .replace(/window.location.href(?=[^=]|={2,})/g, '$ncd.href()')

          // Replace all history operations to save the right locations
          .replace(/window.history.(pushState|replaceState)/g, '$ncd.$1')

      // Inject into each html
      // ---------------------
      } else if (/<\/body>/.test(proxyResText) && GA_TRACKING_ID) {
        return proxyResText.replace('</body>', `
          <!-- Global site tag (gtag.js) - Google Analytics -->
          <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}"></script>
          <script>
            window.dataLayer = window.dataLayer || []
            function gtag () { dataLayer.push(arguments) }
            gtag('js', new Date())
            gtag('config', '${GA_TRACKING_ID}')

            window.pagePath = location.pathname + location.search + location.hash
            function pageview(){
              var pagePath = location.pathname + location.search + location.hash
              if (pagePath !== window.pagePath) {
                gtag('config', '${GA_TRACKING_ID}', {'page_path': pagePath})
                window.pagePath = pagePath
              }
            }
            window.addEventListener('popstate', pageview);
          </script>
        </body>`)
      }

      // Otherwise, remain untouched
      return proxyResData
    }
  }))
  .listen(3000, () => console.log('Server running at http://localhost:3000'))
