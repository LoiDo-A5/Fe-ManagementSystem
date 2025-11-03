import React from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { getToken, logout } from '../api/client'

export default function Header() {
  const navigate = useNavigate()
  const token = getToken()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
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
              <button className="btn btn-outline-light btn-sm app-logout" onClick={handleLogout}>Đăng xuất</button>
            ) : (
              <Link className="btn btn-outline-light btn-sm" to="/login">Đăng nhập</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
