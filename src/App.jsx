import React from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Projects from './pages/Projects.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Profile from './pages/Profile.jsx'
import { getToken } from './api/client.js'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ToastProvider from './components/ToastProvider.jsx'
import { I18nProvider } from './i18n.js'

function ProtectedRoute({ children }) {
  const token = getToken()
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

 export default function App() {
  const location = useLocation()
  const isAuthPage = location.pathname.startsWith('/login')
  return (
    <ToastProvider>
      <I18nProvider>
      <div className="app-shell">
        {!isAuthPage && <Header />}

        <div className="container py-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="*" element={<div>Not found</div>} />
          </Routes>
        </div>

        {!isAuthPage && <Footer />}
      </div>
      </I18nProvider>
    </ToastProvider>
  )
 }
