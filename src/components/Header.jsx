import React, { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import api, { getToken, getCurrentUser, logout } from '../api/client'

export default function Header() {
  const navigate = useNavigate()
  const token = getToken()
  const [user, setUser] = useState(getCurrentUser())
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

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
              <NavLink to="/projects" className={navLinkClass}>Projects</NavLink>
            </li>
          </ul>
          <div className="d-flex">
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
                  <li><button className="dropdown-item" type="button" onClick={() => { setOpen(false); handleProfile() }}>Cập nhật hồ sơ</button></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" type="button" onClick={handleLogout}>Đăng xuất</button></li>
                </ul>
              </div>
            ) : (
              <Link className="btn btn-outline-light btn-sm" to="/login">Đăng nhập</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
