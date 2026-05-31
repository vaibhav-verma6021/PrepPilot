import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext(null)

const MAX_NOTIFICATIONS = 50
const STORAGE_KEY = 'pp-notifications'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [] } catch { return [] }
}

function save(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(load)

  const addNotification = useCallback((message) => {
    const item = { id: Date.now().toString(), message, read: false, createdAt: Date.now() }
    setNotifications(prev => {
      const next = [item, ...prev].slice(0, MAX_NOTIFICATIONS)
      save(next)
      return next
    })
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }))
      save(next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllRead, clearAll, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
