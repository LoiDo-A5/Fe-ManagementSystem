import React, { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import api, { getToken, getCurrentUser, logout } from '../api/client'
import { useI18n } from '../i18n'
import { useNotifications } from './NotificationsContext.jsx'

export default function Header() {
  const navigate = useNavigate()
  const token = getToken()
  const [user, setUser] = useState(getCurrentUser())
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const { lang, setLang, t } = useI18n()
  const { notifications, unread, markAllRead, clear } = useNotifications()
  const [openNoti, setOpenNoti] = useState(false)
  const notiRef = useRef(null)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function handleProfile() {
    navigate('/profile')
  }

  useEffect(() => {
    // Fetch live profile to reflect latest name updates
    async function fetchMe() {
      try {
        if (token) {
          const { data } = await api.get('/api/auth/me')
          setUser(prev => ({ ...prev, ...data }))
        }
      } catch {}
    }
    fetchMe()

    function onDocClick(e) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target)) setOpen(false)
      if (!notiRef.current) return
      if (!notiRef.current.contains(e.target)) setOpenNoti(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  function initialsFrom(name, email) {
    const src = (name || email || '').trim()
    if (!src) return '?'
    const parts = src.split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return src.slice(0, 2).toUpperCase()
  }

  const navLinkClass = ({ isActive }) => `nav-link app-nav-link ${isActive ? 'active' : ''}`

  return (
    <nav className="navbar navbar-expand-lg app-header navbar-dark sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="brand-dot" />
          <span className="fw-bold">Team Manager</span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink to="/projects" className={navLinkClass}>{t('nav.projects')}</NavLink>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-2">
            {/* Language switcher */}
            <div className="btn-group" role="group" aria-label="Language selector">
              <button type="button" className={`btn btn-sm ${lang === 'vi' ? 'btn-light' : 'btn-outline-light'}`} onClick={() => setLang('vi')}>VI</button>
              <button type="button" className={`btn btn-sm ${lang === 'en' ? 'btn-light' : 'btn-outline-light'}`} onClick={() => setLang('en')}>EN</button>
            </div>

            {/* Notifications bell */}
            <div className="position-relative" ref={notiRef}>
              <button
                className="btn btn-outline-light btn-sm position-relative"
                type="button"
                onClick={() => setOpenNoti(v => !v)}
                aria-label="Notifications"
              >
                <i className="bi bi-bell"></i>
                {unread > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {unread}
                  </span>
                )}
              </button>
              <div className={`dropdown-menu dropdown-menu-end p-2 ${openNoti ? 'show' : ''}`} style={{ minWidth: 320, right: 0, left: 'auto' }}>
                <div className="d-flex justify-content-between align-items-center px-2 py-1">
                  <strong>Thông báo</strong>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-secondary" onClick={markAllRead}>Đã đọc</button>
                    <button className="btn btn-outline-danger" onClick={clear}>Xóa</button>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <div className="vstack gap-2" style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div className="text-muted small px-2 py-1">Không có thông báo</div>
                  ) : notifications.slice(0, 10).map(n => (
                    <div key={n.id} className={`p-2 rounded ${n.read ? 'bg-light' : 'bg-white border'}`}>
                      <div className="small">{n.text}</div>
                      <div className="text-muted small">{new Date(n.ts || Date.now()).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {token ? (
              <div className="position-relative" ref={menuRef}>
                <button
                  className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
                  type="button"
                  onClick={() => setOpen(v => !v)}
                >
                  {(() => {
                    const ini = initialsFrom(user?.name, user?.email)
                    if (ini === '?') {
                      return <i className="bi bi-person-circle fs-5"></i>
                    }
                    return (
                      <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white text-dark fw-bold" style={{ width: 26, height: 26, fontSize: 12 }}>
                        {ini}
                      </span>
                    )
                  })()}
                  <span className="d-none d-md-inline">{user?.name || user?.email || 'Tài khoản'}</span>
                  <i className="bi bi-caret-down-fill"></i>
                </button>
                <ul className={`dropdown-menu dropdown-menu-end ${open ? 'show' : ''}`} style={{ right: 0, left: 'auto' }}>
                  <li><button className="dropdown-item" type="button" onClick={() => { setOpen(false); handleProfile() }}>{t('nav.updateProfile')}</button></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" type="button" onClick={handleLogout}>{t('nav.logout')}</button></li>
                </ul>
              </div>
            ) : (
              <Link className="btn btn-outline-light btn-sm" to="/login">{t('nav.login')}</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
