import { useEffect } from 'react'
import { useToast } from './ToastProvider.jsx'
import { useNotifications } from './NotificationsContext.jsx'
import { getToken } from '../api/client.js'

export default function SocketClient() {
  const { show } = useToast()
  const { add } = useNotifications()

  useEffect(() => {
    let socket
    async function init() {
      try {
        // Lazy import socket.io-client to avoid bundling issues if not installed
        const mod = await import('socket.io-client')
        const io = mod.io || mod.default
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
        const token = getToken()
        if (!token) return
        socket = io(API_BASE_URL, { auth: { token }, transports: ['websocket'] })

        socket.on('connect', () => {
          // console.log('WS connected', socket.id)
        })

        socket.on('project_member_added', (payload) => {
          const text = `Bạn đã được thêm vào dự án #${payload?.project_id || ''}`
          show(text, 'success')
          add({ type: 'project_member_added', text, payload, ts: Date.now() })
        })

        socket.on('task_assigned', (payload) => {
          const title = payload?.title || 'Task'
          const text = `Bạn được gán vào: ${title}`
          show(text, 'success')
          add({ type: 'task_assigned', text, payload, ts: Date.now() })
        })

        socket.on('disconnect', () => {
          // console.log('WS disconnected')
        })
      } catch (e) {
        // socket.io-client not available or failed
        // console.warn('WS init failed', e)
      }
    }
    init()
    return () => {
      try { if (socket) socket.disconnect() } catch {}
    }
  }, [show])

  return null
}
