// Forge Service Worker — handles push notifications for stale exercise alerts

self.addEventListener('install', e => { self.skipWaiting() })
self.addEventListener('activate', e => { e.waitUntil(clients.claim()) })

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {}
  e.waitUntil(
    self.registration.showNotification(data.title || 'Forge', {
      body: data.body || "Time to train.",
      icon: '/forge-icon.png',
      badge: '/forge-icon.png',
      tag: data.tag || 'forge-reminder',
      data: { url: data.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const c of list) {
        if (c.url === '/' && 'focus' in c) return c.focus()
      }
      if (clients.openWindow) return clients.openWindow('/')
    })
  )
})

// Daily alarm check via periodic background sync (where supported)
self.addEventListener('periodicsync', e => {
  if (e.tag === 'forge-stale-check') {
    e.waitUntil(checkStaleExercises())
  }
})

async function checkStaleExercises() {
  try {
    const db = await openForgeDB()
    const data = db.data
    if (!data || !data.exercises) return

    const stale = data.exercises.filter(ex => {
      const ls = data.logs?.[ex.id] || []
      if (!ls.length) return true
      const last = ls[ls.length - 1]
      const days = Math.floor((Date.now() - new Date(last.date).getTime()) / 86400000)
      return days >= 5
    })

    if (stale.length > 0) {
      const names = stale.slice(0, 3).map(e => e.name).join(', ')
      await self.registration.showNotification('Forge — Time to train', {
        body: `${stale.length} exercise${stale.length > 1 ? 's' : ''} need attention: ${names}`,
        tag: 'forge-stale',
        icon: '/forge-icon.png',
      })
    }
  } catch {}
}

function openForgeDB() {
  return new Promise(resolve => {
    try {
      // Read from localStorage via client messaging
      clients.matchAll({ type: 'window' }).then(cs => {
        if (cs.length > 0) {
          const mc = new MessageChannel()
          mc.port1.onmessage = e => resolve({ data: e.data })
          cs[0].postMessage({ type: 'GET_FORGE_DATA' }, [mc.port2])
        } else {
          resolve({ data: null })
        }
      })
    } catch { resolve({ data: null }) }
  })
}
