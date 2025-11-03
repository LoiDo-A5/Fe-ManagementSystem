import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'

export default function ProjectDetail() {
  const { id } = useParams()
  const projectId = Number(id)

  const [project, setProject] = useState(null)
  const [lists, setLists] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Create task form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [listId, setListId] = useState('')

  // Task detail modal (comments + attachments)
  const [activeTask, setActiveTask] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [attachments, setAttachments] = useState([])

  async function load() {
    try {
      setLoading(true)
      const [pRes, tRes, lRes] = await Promise.all([
        api.get(`/api/projects/${projectId}`),
        api.get(`/api/projects/${projectId}/tasks`),
        api.get(`/api/projects/${projectId}/lists`),
      ])
      setProject(pRes.data)
      setTasks(tRes.data)
      setLists(lRes.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được dữ liệu project')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [projectId])

  // --- Tasks CRUD ---
  async function createTask(e) {
    e.preventDefault()
    if (!title.trim()) return
    try {
      const payload = { title, description }
      if (listId) payload.list_id = Number(listId)
      const { data } = await api.post(`/api/projects/${projectId}/tasks`, payload)
      setTasks(prev => [data, ...prev])
      setTitle('')
      setDescription('')
      setListId('')
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

  // --- Comments ---
  async function openTaskDetail(task) {
    setActiveTask(task)
    try {
      const [cRes, aRes] = await Promise.all([
        api.get(`/api/tasks/${task.id}/comments`),
        api.get(`/api/tasks/${task.id}/attachments`),
      ])
      setComments(cRes.data)
      setAttachments(aRes.data)
    } catch (err) {
      setComments([])
      setAttachments([])
    }
    const modal = document.getElementById('taskModal')
    if (modal) {
      const bs = window.bootstrap?.Modal ? new window.bootstrap.Modal(modal) : null
      bs?.show()
    }
  }

  async function addComment(e) {
    e.preventDefault()
    if (!activeTask || !newComment.trim()) return
    try {
      const { data } = await api.post(`/api/tasks/${activeTask.id}/comments`, { content: newComment.trim() })
      setComments(prev => [...prev, data])
      setNewComment('')
    } catch (err) {
      alert('Không thêm được bình luận')
    }
  }

  async function deleteComment(id) {
    if (!confirm('Xoá bình luận này?')) return
    try {
      await api.delete(`/api/comments/${id}`)
      setComments(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      alert('Không xoá được bình luận')
    }
  }

  // --- Attachments ---
  async function uploadAttachment(e) {
    if (!activeTask) return
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    try {
      const { data } = await api.post(`/api/tasks/${activeTask.id}/attachments`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setAttachments(prev => [...prev, data])
      e.target.value = ''
    } catch (err) {
      alert('Không upload được tệp đính kèm')
    }
  }

  async function deleteAttachment(id) {
    if (!confirm('Xoá tệp này?')) return
    try {
      await api.delete(`/api/attachments/${id}`)
      setAttachments(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      alert('Không xoá được tệp đính kèm')
    }
  }

  const tasksByList = useMemo(() => {
    const groups = { none: [] }
    for (const l of lists) groups[l.id] = []
    for (const t of tasks) {
      const key = t.list_id ?? 'none'
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    }
    return groups
  }, [lists, tasks])

  return (
    <div className="row g-4">
      <div className="col-12">
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

        {/* Columns */}
        <div className="row g-3 align-items-start">
          {/* Create task panel */}
          <div className="col-12 col-xl-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Thêm Task</h5>
                <form onSubmit={createTask}>
                  <div className="mb-2">
                    <label className="form-label">Tiêu đề</label>
                    <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Cột (List)</label>
                    <select className="form-select" value={listId} onChange={(e) => setListId(e.target.value)}>
                      <option value="">(Không thuộc cột)</option>
                      {lists.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea className="form-control" rows="3" value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                  <button className="btn btn-primary w-100" type="submit">Tạo</button>
                </form>
              </div>
            </div>
          </div>

          {/* No list column */}
          <div className="col-12 col-xl-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Chưa thuộc cột</h6>
                  <span className="badge text-bg-light">{tasksByList['none']?.length || 0}</span>
                </div>
                <div className="vstack gap-2">
                  {(tasksByList['none'] || []).map(t => (
                    <div key={t.id} className="p-2 border rounded d-flex justify-content-between align-items-center">
                      <div className="me-2">
                        <div className="fw-semibold">{t.title}</div>
                        {t.description && <div className="text-muted small">{t.description}</div>}
                        <button className="btn btn-link btn-sm p-0" onClick={() => openTaskDetail(t)}>Bình luận/Tệp</button>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <select className="form-select form-select-sm" style={{ width: 140 }} value={t.list_id || ''}
                          onChange={(e) => updateTask(t.id, { list_id: e.target.value || null })}>
                          <option value="">(Không cột)</option>
                          {lists.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                        </select>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTask(t.id)}>Xoá</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Each list column */}
          {lists.map(list => (
            <div className="col-12 col-xl-3" key={list.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">{list.title}</h6>
                    <span className="badge text-bg-light">{(tasksByList[list.id] || []).length}</span>
                  </div>
                  <div className="vstack gap-2">
                    {(tasksByList[list.id] || []).map(t => (
                      <div key={t.id} className="p-2 border rounded d-flex justify-content-between align-items-center">
                        <div className="me-2">
                          <div className="fw-semibold">{t.title}</div>
                          {t.description && <div className="text-muted small">{t.description}</div>}
                          <button className="btn btn-link btn-sm p-0" onClick={() => openTaskDetail(t)}>Bình luận/Tệp</button>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <select className="form-select form-select-sm" style={{ width: 140 }} value={t.list_id || ''}
                            onChange={(e) => updateTask(t.id, { list_id: e.target.value || null })}>
                            <option value="">(Không cột)</option>
                            {lists.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                          </select>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTask(t.id)}>Xoá</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Modal: comments + attachments */}
      <div className="modal fade" id="taskModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{activeTask ? activeTask.title : 'Task'}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row g-4">
                <div className="col-12 col-md-7">
                  <h6>Bình luận</h6>
                  <div className="vstack gap-2 mb-3">
                    {comments.map(c => (
                      <div key={c.id} className="p-2 border rounded d-flex justify-content-between">
                        <div>
                          <div className="small text-muted">{c.user ? `${c.user.name} • ${new Date(c.created_at).toLocaleString()}` : new Date(c.created_at).toLocaleString()}</div>
                          <div>{c.content}</div>
                        </div>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteComment(c.id)}>Xoá</button>
                      </div>
                    ))}
                    {comments.length === 0 && <div className="text-muted">Chưa có bình luận.</div>}
                  </div>
                  <form onSubmit={addComment} className="d-flex gap-2">
                    <input className="form-control" placeholder="Viết bình luận..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                    <button className="btn btn-primary" type="submit">Gửi</button>
                  </form>
                </div>
                <div className="col-12 col-md-5">
                  <h6>Đính kèm</h6>
                  <div className="vstack gap-2 mb-2">
                    {attachments.map(a => (
                      <div key={a.id} className="d-flex justify-content-between align-items-center p-2 border rounded">
                        <a className="text-decoration-none" href={a.file_url} target="_blank" rel="noreferrer">{a.file_name}</a>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteAttachment(a.id)}>Xoá</button>
                      </div>
                    ))}
                    {attachments.length === 0 && <div className="text-muted">Chưa có tệp đính kèm.</div>}
                  </div>
                  <div>
                    <label className="btn btn-outline-primary">
                      Tải tệp lên <input type="file" hidden onChange={uploadAttachment} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
