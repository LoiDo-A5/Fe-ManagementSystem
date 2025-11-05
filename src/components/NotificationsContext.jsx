import React, { createContext, useContext, useMemo, useState, useCallback } from 'react'

const Ctx = createContext({
  notifications: [],
  unread: 0,
  add: () => {},
  markAllRead: () => {},
  clear: () => {},
})

export function NotificationsProvider({ children }) {
  const [items, setItems] = useState([])

  const add = useCallback((noti) => {
    setItems(prev => [{ id: Date.now() + Math.random(), read: false, ...noti }, ...prev].slice(0, 50))
  }, [])

  const markAllRead = useCallback(() => {
    setItems(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const unread = useMemo(() => items.reduce((acc, n) => acc + (n.read ? 0 : 1), 0), [items])

  const value = useMemo(() => ({ notifications: items, unread, add, markAllRead, clear }), [items, unread, add, markAllRead, clear])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useNotifications() {
  return useContext(Ctx)
}
