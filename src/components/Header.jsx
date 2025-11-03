import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getToken, logout } from '../api/client'

export default function Header() {
  const navigate = useNavigate()
  const token = getToken()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">Team Manager</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/projects">Projects</Link>
            </li>
          </ul>
          <div className="d-flex">
            {token ? (
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Đăng xuất</button>
            ) : (
              <Link className="btn btn-outline-light btn-sm" to="/login">Đăng nhập</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
