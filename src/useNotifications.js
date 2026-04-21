import { useState, useEffect, useCallback } from 'react'
import { loadData } from './utils'

const SW_URL = '/sw.js'
const NOTIF_KEY = 'forge_notif_prefs'

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '{}') }
  catch { return {} }
}
function savePrefs(p) { localStorage.setItem(NOTIF_KEY, JSON.stringify(p)) }

export function useNotifications(exercises, logs) {
  const [permission, setPermission]   = useState('default')
  const [swReady, setSwReady]         = useState(false)
  const [prefs, setPrefs]             = useState(() => loadPrefs())
  const [lastChecked, setLastChecked] = useState(null)

  // Register service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register(SW_URL).then(reg => {
      setSwReady(true)
      // Handle data requests from SW
      navigator.serviceWorker.addEventListener('message', e => {
        if (e.data?.type === 'GET_FORGE_DATA') {
          const port = e.ports[0]
          if (port) port.postMessage(loadData())
        }
      })
    }).catch(() => {})

    // Read current permission state
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported'
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      const next = { ...prefs, enabled: true }
      setPrefs(next); savePrefs(next)
    }
    return result
  }, [prefs])

  // Toggle notifications on/off
  const toggleNotifications = useCallback(async (enabled) => {
    if (enabled && permission !== 'granted') {
      const res = await requestPermission()
      if (res !== 'granted') return
    }
    const next = { ...prefs, enabled }
    setPrefs(next); savePrefs(next)
  }, [permission, prefs, requestPermission])

  // Local stale check — fires a browser notification directly
  const checkAndNotify = useCallback(() => {
    if (permission !== 'granted' || !prefs.enabled) return
    if (!('Notification' in window)) return

    const stale = exercises.filter(ex => {
      const ls = logs[ex.id] || []
      if (!ls.length) return true
      const last = ls[ls.length - 1]
      const days = Math.floor((Date.now() - new Date(last.date).getTime()) / 86400000)
      return days >= 5
    })

    if (stale.length > 0) {
      const names = stale.slice(0, 3).map(e => e.name).join(', ')
      const body = stale.length > 3
        ? `${names} +${stale.length - 3} more need attention`
        : `${names} ${stale.length === 1 ? 'needs' : 'need'} attention`

      new Notification('Forge — Time to train', {
        body,
        icon: '/forge-icon.svg',
        tag: 'forge-stale',
      })
      setLastChecked(new Date().toLocaleTimeString())
    }
  }, [exercises, logs, permission, prefs.enabled])

  // Auto-check once per hour when tab is visible
  useEffect(() => {
    if (permission !== 'granted' || !prefs.enabled) return
    checkAndNotify()
    const interval = setInterval(checkAndNotify, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [permission, prefs.enabled, checkAndNotify])

  const staleCount = exercises.filter(ex => {
    const ls = logs[ex.id] || []
    if (!ls.length) return true
    const last = ls[ls.length - 1]
    return Math.floor((Date.now() - new Date(last.date).getTime()) / 86400000) >= 5
  }).length

  return {
    permission,
    supported: 'Notification' in window,
    enabled: prefs.enabled || false,
    staleCount,
    lastChecked,
    toggleNotifications,
    requestPermission,
    checkAndNotify,
  }
}
