import React, { useEffect, useState } from 'react'
import api from '../api/client'
import { Link } from 'react-router-dom'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      const { data } = await api.get('/api/projects')
      setProjects(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được danh sách project')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createProject(e) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/api/projects', { name, description })
      setProjects(prev => [data, ...prev])
      setName('')
      setDescription('')
    } catch (err) {
      setError(err.response?.data?.error || 'Tạo project thất bại')
    }
  }

  const filtered = projects.filter(p => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.owner?.name?.toLowerCase().includes(q) ||
      String(p.id).includes(q)
    )
  })

  return (
    <div className="projects-page">
      <div className="hero bg-light rounded-4 p-4 p-md-5 mb-4 border">
        <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3">
          <div>
            <h2 className="mb-1">Dự án của tôi</h2>
            <div className="text-muted">Quản lý các dự án và nhiệm vụ trong nhóm của bạn</div>
          </div>
          <div className="d-flex gap-2 align-items-center w-100 w-md-auto">
            <input className="form-control form-control-lg" placeholder="Tìm theo tên, mô tả, chủ sở hữu hoặc #id" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button className="btn btn-outline-secondary btn-lg" onClick={load} disabled={loading}>{loading ? 'Đang tải...' : 'Tải lại'}</button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="card-title">Tạo Project</h5>
              <div className="text-muted small mb-3">Đặt tên rõ ràng để cả team dễ hiểu</div>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={createProject}>
                <div className="mb-3">
                  <label className="form-label">Tên</label>
                  <input className="form-control form-control-lg" value={name} onChange={e => setName(e.target.value)} required placeholder="Ví dụ: Website Marketing 2025" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-control" rows="4" value={description} onChange={e => setDescription(e.target.value)} placeholder="Mục tiêu, phạm vi, deadline..." />
                </div>
                <button className="btn btn-primary w-100" type="submit">Tạo dự án</button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-8">
          <div className="row row-cols-1 row-cols-md-2 g-3">
            {filtered.map(p => (
              <div className="col" key={p.id}>
                <div className="card project-card h-100 shadow-sm border-0">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-0">{p.name}</h5>
                      <span className="badge text-bg-light">#{p.id}</span>
                    </div>
                    {p.description && <p className="card-text text-muted flex-grow-1">{p.description}</p>}
                    {p.owner && <div className="small text-muted">Chủ sở hữu: <span className="fw-semibold">{p.owner.name}</span> ({p.owner.email})</div>}
                  </div>
                  <div className="card-footer bg-transparent border-0 pt-0 pb-3 px-3">
                    <Link to={`/projects/${p.id}`} className="btn btn-outline-primary w-100">Mở dự án</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && !loading && (
            <div className="text-center text-muted py-5">
              <div className="mb-2">Không tìm thấy dự án phù hợp</div>
              <div className="small">Hãy thử từ khoá khác hoặc tạo dự án mới</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
