import React, { useState } from 'react'
import api, { setToken } from '../api/client'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (isRegister) {
        const { data } = await api.post('/api/auth/register', { name, email, password })
        setToken(data.token)
      } else {
        const { data } = await api.post('/api/auth/login', { email, password })
        setToken(data.token)
      }
      const from = location.state?.from?.pathname || '/projects'
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra')
    }
  }

  return (
    <div className="auth-layout d-flex align-items-center justify-content-center">
      <div className="auth-card shadow-lg rounded-4 overflow-hidden">
        <div className="row g-0">
          <div className="col-md-6 p-4 p-md-5 order-2 order-md-1 bg-white">
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2">
                <span className="logo-dot" />
                <h3 className="mb-0 fw-bold text-dark">Team Manager</h3>
              </div>
              <div className="text-muted mt-1 small">Quản lý nhóm, dự án và nhiệm vụ dễ dàng</div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} className="needs-validation" noValidate>
              {isRegister && (
                <div className="mb-3">
                  <label className="form-label">Họ tên</label>
                  <input className="form-control form-control-lg" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nguyễn Văn A" />
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control form-control-lg" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <div className="mb-2">
                <label className="form-label">Mật khẩu</label>
                <input type="password" className="form-control form-control-lg" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
              </div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="remember" />
                  <label className="form-check-label" htmlFor="remember">Ghi nhớ tôi</label>
                </div>
              </div>

              <button className="btn btn-primary btn-lg w-100" type="submit">{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
              <div className="text-center text-muted mt-3">
                {isRegister ? (
                  <span>Đã có tài khoản? <button type="button" className="btn btn-link p-0 align-baseline" onClick={() => setIsRegister(false)}>Đăng nhập</button></span>
                ) : (
                  <span>Chưa có tài khoản? <button type="button" className="btn btn-link p-0 align-baseline" onClick={() => setIsRegister(true)}>Đăng ký</button></span>
                )}
              </div>
            </form>
          </div>
          <div className="col-md-6 order-1 order-md-2 gradient-side d-none d-md-block">
            <div className="h-100 w-100 d-flex flex-column justify-content-end p-4 text-white">
              <div className="mb-2 fw-semibold">“Tổ chức công việc tốt là khởi đầu của thành công.”</div>
              <div className="small text-white-50">— Team Manager</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
