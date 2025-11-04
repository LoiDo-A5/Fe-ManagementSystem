import React, { useEffect, useState } from 'react'
import api from '../api/client'
import { useToast } from '../components/ToastProvider.jsx'

export default function Profile() {
  const { show } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCur, setShowCur] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConf, setShowConf] = useState(false)

  async function loadMe() {
    try {
      setLoading(true)
      const { data } = await api.get('/api/auth/me')
      setName(data.name || '')
      setEmail(data.email || '')
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được thông tin tài khoản')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMe() }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    if (newPassword && newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận không khớp')
      return
    }

    try {
      setSaving(true)
      const payload = { name }
      if (newPassword) {
        payload.current_password = currentPassword
        payload.new_password = newPassword
      }
      const { data } = await api.put('/api/auth/me', payload)
      setName(data.name || name)
      show('Đã cập nhật hồ sơ', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.response?.data?.error || 'Cập nhật hồ sơ thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-7">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Cập nhật hồ sơ</h4>
              <button className="btn btn-outline-secondary" onClick={loadMe} disabled={loading}>{loading ? 'Đang tải...' : 'Tải lại'}</button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={onSubmit} className="vstack gap-3">
              <div>
                <label className="form-label">Email</label>
                <input className="form-control" value={email} disabled readOnly />
              </div>

              <div>
                <label className="form-label">Tên hiển thị</label>
                <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên của bạn" />
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Mật khẩu hiện tại</label>
                  <div className="input-group">
                    <input
                      type={showCur ? 'text' : 'password'}
                      className="form-control"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Nhập để đổi mật khẩu"
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCur(v => !v)} aria-label="Hiện/Ẩn mật khẩu">
                      <i className={`bi ${showCur ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Mật khẩu mới</label>
                  <div className="input-group">
                    <input
                      type={showNew ? 'text' : 'password'}
                      className="form-control"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Mật khẩu mới"
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowNew(v => !v)} aria-label="Hiện/Ẩn mật khẩu">
                      <i className={`bi ${showNew ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Xác nhận mật khẩu mới</label>
                  <div className="input-group">
                    <input
                      type={showConf ? 'text' : 'password'}
                      className="form-control"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowConf(v => !v)} aria-label="Hiện/Ẩn mật khẩu">
                      <i className={`bi ${showConf ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
