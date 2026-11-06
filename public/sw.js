// The papers' service worker, the same for both; which paper it is comes with its address
// (/sw.js?edition=times). It only shows the push notifications the API sends and opens the page
// a notification is about when it is tapped. Nothing is cached: the site always loads fresh.

const EDITION = new URL(self.location.href).searchParams.get('edition') === 'tidsskrift' ? 'tidsskrift' : 'times'
const NAME = EDITION === 'tidsskrift' ? 'Tebonsma Tidsskrift' : 'The Tebonsma Times'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

self.addEventListener('push', event => {
  let message = null
  try {
    message = event.data.json()
  } catch {
    // An iPhone stops delivering to a site whose pushes show nothing, so there is always something
  }
  event.waitUntil(
    self.registration.showNotification(message?.title ?? NAME, {
      body: message?.body ?? 'Du har et nytt varsel',
      tag: message?.tag,
      icon: `/${EDITION}/icon-192.png`,
      badge: `/${EDITION}/badge-96.png`,
      lang: 'nb',
      data: { url: message?.url ?? '/' },
    }),
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = new URL(event.notification.data?.url ?? '/', self.location.origin)
  if (url.origin !== self.location.origin) return
  event.waitUntil(
    (async () => {
      // An open window of the site goes to the page; otherwise one is opened
      const [open] = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      if (open) {
        await open.focus()
        if (await open.navigate(url.href).catch(() => null)) return
      }
      await self.clients.openWindow(url.href)
    })(),
  )
})
