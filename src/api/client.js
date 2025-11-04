import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function setToken(token) {
  if (token) localStorage.setItem('token', token)
  else localStorage.removeItem('token')
}

export function getToken() {
  return localStorage.getItem('token')
}

export function logout() {
  setToken(null)
}

// Decode current user from JWT stored in localStorage
export function getCurrentUser() {
  try {
    const token = getToken()
    if (!token) return null
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('utf8')
    const payload = JSON.parse(json)
    // common shapes: { id, email, name } or { sub, email, name } or { user: {...} }
    if (payload.user) return payload.user
    return {
      id: payload.id || payload.sub || null,
      email: payload.email || null,
      name: payload.name || payload.username || null,
    }
  } catch (e) {
    return null
  }
}

export default api
