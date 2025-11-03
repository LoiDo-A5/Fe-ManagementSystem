import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'

function ClickMarker({ position, onChange }) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng])
    }
  })
  return position ? (
    <Marker position={position}>
      <Popup>Vị trí ghi chú demo cho project</Popup>
    </Marker>
  ) : null
}

export default function ProjectDetail() {
  const { id } = useParams()
  const projectId = Number(id)

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Task form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Demo map state (local only)
  const [marker, setMarker] = useState([21.0278, 105.8342]) // Hà Nội mặc định

  const mapHeight = useMemo(() => ({ height: 320 }), [])

  async function load() {
    try {
      setLoading(true)
      const [pRes, tRes] = await Promise.all([
        api.get(`/api/projects/${projectId}`),
        api.get(`/api/projects/${projectId}/tasks`),
      ])
      setProject(pRes.data)
      setTasks(tRes.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được dữ liệu project')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [projectId])

  async function createTask(e) {
    e.preventDefault()
    if (!title.trim()) return
    try {
      const { data } = await api.post(`/api/projects/${projectId}/tasks`, { title, description })
      setTasks(prev => [data, ...prev])
      setTitle('')
      setDescription('')
    } catch (err) {
      alert(err.response?.data?.error || 'Không tạo được task')
    }
  }

  async function updateTask(taskId, patch) {
    try {
      const { data } = await api.put(`/api/projects/tasks/${taskId}`, patch)
      setTasks(prev => prev.map(t => t.id === taskId ? data : t))
    } catch (err) {
      alert(err.response?.data?.error || 'Không cập nhật được task')
    }
  }

  async function deleteTask(taskId) {
    if (!confirm('Xoá task này?')) return
    try {
      await api.delete(`/api/projects/tasks/${taskId}`)
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (err) {
      alert(err.response?.data?.error || 'Không xoá được task')
    }
  }

  return (
    <div className="row g-4">
      <div className="col-12 col-xl-8">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="mb-0">Project #{projectId}</h3>
          <button className="btn btn-outline-secondary" onClick={load} disabled={loading}>
            {loading ? 'Đang tải...' : 'Tải lại'}
          </button>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {project && (
          <div className="card mb-3">
            <div className="card-body">
              <h4 className="card-title">{project.name}</h4>
              {project.description && <p className="card-text">{project.description}</p>}
              {project.owner && <small className="text-muted">Chủ sở hữu: {project.owner.name} ({project.owner.email})</small>}
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="card-title mb-0">Tasks</h5>
            </div>
            <div className="list-group mt-3">
              {tasks.map(t => (
                <div key={t.id} className="list-group-item">
                  <div className="d-flex w-100 justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">{t.title}</div>
                      {t.description && <div className="text-muted small">{t.description}</div>}
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      <select className="form-select form-select-sm" style={{ width: 150 }}
                        value={t.status}
                        onChange={(e) => updateTask(t.id, { status: e.target.value })}>
                        <option value="todo">To do</option>
                        <option value="in_progress">In progress</option>
                        <option value="done">Done</option>
                      </select>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTask(t.id)}>Xoá</button>
                    </div>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && <div className="text-muted p-3">Chưa có task.</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-4">
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Tạo Task</h5>
            <form onSubmit={createTask}>
              <div className="mb-3">
                <label className="form-label">Tiêu đề</label>
                <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Mô tả</label>
                <textarea className="form-control" rows="3" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <button className="btn btn-primary" type="submit">Thêm Task</button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Bản đồ (demo)</h5>
            <div style={mapHeight}>
              <MapContainer center={marker} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickMarker position={marker} onChange={setMarker} />
              </MapContainer>
            </div>
            <div className="small text-muted mt-2">Bấm lên bản đồ để đặt marker (lưu tại client).</div>
          </div>
        </div>
      </div>
    </div>
  )
}
