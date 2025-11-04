import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import { useToast } from '../components/ToastProvider.jsx'

export default function ProjectDetail() {
  const { id } = useParams()
  const projectId = Number(id)
  const { show } = useToast()

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

  // Members management
  const [members, setMembers] = useState([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteUserId, setInviteUserId] = useState('')
  const [inviteRole, setInviteRole] = useState('member')

  // Project settings & labels
  const [settings, setSettings] = useState({ color: '', background_url: '', archived_at: null })
  const [labels, setLabels] = useState([])

  // Assignees for active task
  const [assignees, setAssignees] = useState([])

  // Create List (column)
  const [newListTitle, setNewListTitle] = useState('')
  const [autoSeeded, setAutoSeeded] = useState(false)


  async function load() {
    try {
      setLoading(true)
      const [pRes, tRes, lRes, sRes, labRes] = await Promise.all([
        api.get(`/api/projects/${projectId}`),
        api.get(`/api/projects/${projectId}/tasks`),
        api.get(`/api/projects/${projectId}/lists`),
        api.get(`/api/projects/${projectId}/settings`).catch(() => ({ data: settings })),
        api.get(`/api/projects/${projectId}/labels`).catch(() => ({ data: [] })),
      ])
      setProject(pRes.data)
      setTasks(tRes.data)
      setLists(lRes.data)
      setSettings(sRes.data)
      setLabels(labRes.data)

      // If this project has no lists yet (legacy projects), auto create 3 default columns once
      const seedKey = `seeded_project_${projectId}`
      const alreadySeeded = localStorage.getItem(seedKey) === '1'
      if ((lRes.data?.length || 0) === 0 && !autoSeeded && !alreadySeeded) {
        await seedDefaultLists()
        localStorage.setItem(seedKey, '1')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được dữ liệu project')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [projectId])

  function listCardClass(title) {
    const t = (title || '').toLowerCase()
    if (t.includes('progress')) return 'card-inprogress'
    if (t.includes('done') || t.includes('hoàn thành')) return 'card-done'
    if (t.includes('todo') || t.includes('to do')) return 'card-todo'
    return 'card-none'
  }

  function initialsFrom(name, email) {
    const src = (name || email || '').trim()
    if (!src) return '?'
    const parts = src.split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return src.slice(0, 2).toUpperCase()
  }

  // --- Lists (Columns) ---
  async function seedDefaultLists() {
    try {
      const titles = ['To Do', 'In Progress', 'Done']
      for (const title of titles) {
        await api.post(`/api/projects/${projectId}/lists`, { title })
      }
      const { data } = await api.get(`/api/projects/${projectId}/lists`)
      setLists(data)
      setAutoSeeded(true)
      show('Đã tạo 3 cột mặc định', 'success')
    } catch (err) {
      show(err.response?.data?.error || 'Không thể tạo cột mặc định')
    }
  }
  async function createList(e) {
    e.preventDefault()
    const title = newListTitle.trim()
    if (!title) return
    try {
      await api.post(`/api/projects/${projectId}/lists`, { title })
      setNewListTitle('')
      const { data } = await api.get(`/api/projects/${projectId}/lists`)
      setLists(data)
      show('Đã tạo cột', 'success')
    } catch (err) {
      show(err.response?.data?.error || 'Không tạo được cột')
    }
  }

  // --- Members ---
  async function loadMembers() {
    try {
      const { data } = await api.get(`/api/projects/${projectId}/members`)
      setMembers(data)
    } catch {
      setMembers([])
    }
  }
  useEffect(() => { loadMembers() }, [projectId])

  async function inviteByEmailFE(e) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    try {
      await api.post(`/api/projects/${projectId}/invite`, { email: inviteEmail.trim(), role: inviteRole })
      setInviteEmail('')
      setInviteRole('member')
      loadMembers()
      show('Đã mời thành viên qua email', 'success')
    } catch (err) {
      show(err.response?.data?.error || 'Không mời được thành viên')
    }
  }

  async function inviteByUserIdFE(e) {
    e.preventDefault()
    if (!inviteUserId.trim()) return
    try {
      await api.post(`/api/projects/${projectId}/members`, { user_id: Number(inviteUserId), role: inviteRole })
      setInviteUserId('')
      setInviteRole('member')
      loadMembers()
      show('Đã mời thành viên', 'success')
    } catch (err) {
      show(err.response?.data?.error || 'Không thêm được thành viên')
    }
  }

  async function changeRoleFE(userId, role) {
    try {
      await api.put(`/api/projects/${projectId}/members/${userId}`, { role })
      loadMembers()
    } catch (err) {
      show(err.response?.data?.error || 'Không đổi được quyền')
    }
  }

  async function removeMemberFE(userId) {
    if (!confirm('Xoá thành viên này khỏi dự án?')) return
    try {
      await api.delete(`/api/projects/${projectId}/members/${userId}`)
      loadMembers()
      show('Đã xoá thành viên', 'success')
    } catch (err) {
      show(err.response?.data?.error || 'Không xoá được thành viên')
    }
  }

  async function leaveProjectFE() {
    if (!confirm('Bạn có chắc muốn rời dự án?')) return
    try {
      await api.post(`/api/projects/${projectId}/leave`)
      window.location.href = '/projects'
    } catch (err) {
      show(err.response?.data?.error || 'Không rời được dự án')
    }
  }

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
      show('Đã tạo task', 'success')
    } catch (err) {
      show(err.response?.data?.error || 'Không tạo được task')
    }
  }

  async function updateTask(taskId, patch) {
    try {
      const { data } = await api.put(`/api/projects/tasks/${taskId}`, patch)
      setTasks(prev => prev.map(t => t.id === taskId ? data : t))
    } catch (err) {
      show(err.response?.data?.error || 'Không cập nhật được task')
    }
  }

  async function deleteTask(taskId) {
    if (!confirm('Xoá task này?')) return
    try {
      await api.delete(`/api/projects/tasks/${taskId}`)
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (err) {
      show(err.response?.data?.error || 'Không xoá được task')
    }
  }

  // --- Comments ---
  async function openTaskDetail(task) {
    setActiveTask(task)
    try {
      const [cRes, aRes, asgRes] = await Promise.all([
        api.get(`/api/tasks/${task.id}/comments`),
        api.get(`/api/tasks/${task.id}/attachments`),
        api.get(`/api/tasks/${task.id}/assignees`).catch(() => ({ data: [] })),
      ])
      setComments(cRes.data)
      setAttachments(aRes.data)
      setAssignees(asgRes.data)
    } catch (err) {
      setComments([])
      setAttachments([])
      setAssignees([])
      show('Không tải được chi tiết task')
    }
    const modal = document.getElementById('taskModal')
    if (modal) {
      const bs = window.bootstrap?.Modal ? new window.bootstrap.Modal(modal) : null
      bs?.show()
    }
  }

  // --- Project settings ---
  async function saveSettings(e) {
    e.preventDefault()
    try {
      const { data } = await api.put(`/api/projects/${projectId}/settings`, { color: settings.color || null, background_url: settings.background_url || null })
      setSettings(prev => ({ ...prev, ...data }))
    } catch (err) {
      show(err.response?.data?.error || 'Không lưu được cài đặt')
    }
  }

  async function archiveProjectFE() {
    try {
      const { data } = await api.post(`/api/projects/${projectId}/archive`)
      setSettings(prev => ({ ...prev, archived_at: data.archived_at }))
    } catch (err) { show('Không archive được') }
  }

  async function unarchiveProjectFE() {
    try {
      const { data } = await api.post(`/api/projects/${projectId}/unarchive`)
      setSettings(prev => ({ ...prev, archived_at: data.archived_at }))
    } catch (err) { show('Không unarchive được') }
  }

  // --- Labels assign/unassign ---
  async function assignLabel(taskId, labelId) {
    try { await api.post(`/api/tasks/${taskId}/labels/${labelId}`); openTaskDetail({ id: taskId, title: activeTask?.title }) }
    catch { show('Không gán được nhãn') }
  }
  async function unassignLabel(taskId, labelId) {
    try { await api.delete(`/api/tasks/${taskId}/labels/${labelId}`); openTaskDetail({ id: taskId, title: activeTask?.title }) }
    catch { show('Không bỏ được nhãn') }
  }

  // --- Assignees ---
  async function addAssigneeFE(taskId, userId) {
    try { await api.post(`/api/tasks/${taskId}/assignees`, { user_id: userId }); openTaskDetail({ id: taskId, title: activeTask?.title }) }
    catch { show('Không thêm người phụ trách') }
  }
  async function removeAssigneeFE(taskId, userId) {
    try { await api.delete(`/api/tasks/${taskId}/assignees/${userId}`); openTaskDetail({ id: taskId, title: activeTask?.title }) }
    catch { show('Không xoá người phụ trách') }
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
      show('Không xoá được bình luận')
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
      show('Không upload được tệp đính kèm')
    }
  }

  async function deleteAttachment(id) {
    if (!confirm('Xoá tệp này?')) return
    try {
      await api.delete(`/api/attachments/${id}`)
      setAttachments(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      show('Không xoá được tệp đính kèm')
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
          <div className="card mb-3" style={{ background: settings?.background_url ? `url(${settings.background_url}) center/cover no-repeat` : undefined }}>
            <div className="card-body">
              <h4 className="card-title" style={{ color: settings?.color || undefined }}>{project.name}</h4>
              {project.description && <p className="card-text">{project.description}</p>}
              {project.owner && <small className="text-muted">Chủ sở hữu: {project.owner.name} ({project.owner.email})</small>}
              {settings?.archived_at && <div className="badge text-bg-warning ms-2">Archived</div>}
            </div>
          </div>
        )}

        {/* Project Settings */}
        <div className="card mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="card-title mb-0">Cài đặt bảng</h5>
              {settings?.archived_at ? (
                <button className="btn btn-sm btn-success" onClick={unarchiveProjectFE}>Unarchive</button>
              ) : (
                <button className="btn btn-sm btn-outline-warning" onClick={archiveProjectFE}>Archive</button>
              )}
            </div>
            <form onSubmit={saveSettings} className="row g-2">
              <div className="col-md-3">
                <label className="form-label">Màu tiêu đề</label>
                <input className="form-control" placeholder="#4f46e5" value={settings.color || ''} onChange={e => setSettings(prev => ({ ...prev, color: e.target.value }))} />
              </div>
              <div className="col-md-7">
                <label className="form-label">Ảnh nền (URL)</label>
                <input className="form-control" placeholder="https://..." value={settings.background_url || ''} onChange={e => setSettings(prev => ({ ...prev, background_url: e.target.value }))} />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button className="btn btn-primary w-100" type="submit">Lưu</button>
              </div>
            </form>
          </div>
        </div>

        {/* Columns */}
        <div className="row g-3 align-items-start">
          {/* Create list panel */}
          <div className="col-12">
            <form onSubmit={createList} className="d-flex gap-2 align-items-end mb-2">
              <div style={{ maxWidth: 360, width: '100%' }}>
                <label className="form-label mb-1">Thêm cột (List)</label>
                <input className="form-control" placeholder="Tên cột (ví dụ: To Do)" value={newListTitle} onChange={e => setNewListTitle(e.target.value)} />
              </div>
              <button className="btn btn-outline-primary" type="submit">Thêm cột</button>
            </form>
          </div>
          {/* Create task panel */}
          <div className="col-12 col-xl-3">
            <div className="card h-100 shadow-sm card-create-task">
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
                    <div key={t.id} className="p-2 border rounded d-flex justify-content-between align-items-center task-item">
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
              <div className={`card h-100 shadow-sm ${listCardClass(list.title)}`}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">{list.title}</h6>
                    <span className="badge text-bg-light">{(tasksByList[list.id] || []).length}</span>
                  </div>
                  <div className="vstack gap-2">
                    {(tasksByList[list.id] || []).map(t => (
                      <div key={t.id} className="p-2 border rounded d-flex justify-content-between align-items-center task-item">
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

      {/* Members Panel */}
      <div className="col-12">
        <div className="card mt-3 members-card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="card-title mb-0">Thành viên</h5>
              <button className="btn btn-sm btn-outline-secondary" onClick={loadMembers}>Tải lại</button>
            </div>

            <div className="list-group mb-3">
              {members.map(m => {
                const roleClass = m.role === 'owner' ? 'role-owner' : m.role === 'admin' ? 'role-admin' : 'role-member'
                const rowClass = m.role === 'owner' ? 'member-row-owner' : m.role === 'admin' ? 'member-row-admin' : 'member-row-member'
                return (
                  <div key={m.user_id} className={`list-group-item d-flex justify-content-between align-items-center member-item ${rowClass}`}>
                    <div className="d-flex align-items-center gap-3">
                      <span className="member-avatar">{initialsFrom(m.user?.name, m.user?.email)}</span>
                      <div>
                        <div className="member-name">
                          {m.user?.name || m.user_id}
                          <span className={`ms-2 role-badge ${roleClass}`}>{m.role}</span>
                        </div>
                        <div className="member-email small">{m.user?.email}</div>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <select className="form-select form-select-sm" style={{ width: 160 }} value={m.role}
                        onChange={(e) => changeRoleFE(m.user_id, e.target.value)}>
                        <option value="owner">owner</option>
                        <option value="admin">admin</option>
                        <option value="member">member</option>
                      </select>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeMemberFE(m.user_id)}>Xoá</button>
                    </div>
                  </div>
                )
              })}
              {members.length === 0 && <div className="text-muted p-2">Chưa có thành viên.</div>}
            </div>

            {/* Invite by Email Form */}
            <form className="row g-2 align-items-end invite-section invite-email" onSubmit={inviteByEmailFE}>
              <div className="col-md-5">
                <label className="form-label">Mời qua email</label>
                <input 
                  className="form-control" 
                  placeholder="you@example.com" 
                  value={inviteEmail} 
                  onChange={(e) => setInviteEmail(e.target.value)} 
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Vai trò</label>
                <select 
                  className="form-select" 
                  value={inviteRole} 
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div className="col-md-2">
                <button className="btn btn-primary w-100" type="submit">Mời</button>
              </div>
              <div className="col-md-2">
                <button 
                  className="btn btn-outline-danger w-100" 
                  type="button" 
                  onClick={leaveProjectFE}
                >
                  Rời nhóm
                </button>
              </div>
            </form>

            {/* Invite by User ID Form */}
            <form className="row g-2 align-items-end mt-3 invite-section invite-id" onSubmit={inviteByUserIdFE}>
              <div className="col-md-5">
                <label className="form-label">Mời qua User ID</label>
                <input 
                  className="form-control" 
                  placeholder="User ID" 
                  value={inviteUserId} 
                  onChange={(e) => setInviteUserId(e.target.value)} 
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Vai trò</label>
                <select 
                  className="form-select" 
                  value={inviteRole} 
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div className="col-md-2">
                <button className="btn btn-outline-primary w-100" type="submit">Mời (ID)</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Global Toasts rendered by ToastProvider */}

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
                  <h6>Thuộc tính</h6>
                  <div className="mb-3">
                    <label className="form-label">Độ ưu tiên</label>
                    <select className="form-select" defaultValue={activeTask?.priority || 'medium'} onChange={(e) => updateTask(activeTask.id, { priority: e.target.value })}>
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Hạn chót</label>
                    <input type="datetime-local" className="form-control" onChange={(e) => updateTask(activeTask.id, { due_date: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nhắc việc</label>
                    <input type="datetime-local" className="form-control" onChange={(e) => updateTask(activeTask.id, { reminder_at: e.target.value })} />
                  </div>

                  <h6 className="mt-4">Nhãn</h6>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {labels.map(l => (
                      <div key={l.id} className="d-flex align-items-center gap-2">
                        <span className="badge" style={{ background: l.color }}>{l.name}</span>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => assignLabel(activeTask.id, l.id)}>Gán</button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => unassignLabel(activeTask.id, l.id)}>Bỏ</button>
                      </div>
                    ))}
                    {labels.length === 0 && <div className="text-muted">Chưa có nhãn.</div>}
                  </div>

                  <h6>Người phụ trách</h6>
                  <div className="vstack gap-2 mb-3">
                    {assignees.map(a => (
                      <div key={a.user_id} className="d-flex justify-content-between align-items-center p-2 border rounded">
                        <div>{a.user?.name || a.user_id} <span className="text-muted small">{a.user?.email}</span></div>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => removeAssigneeFE(activeTask.id, a.user_id)}>Gỡ</button>
                      </div>
                    ))}
                    {assignees.length === 0 && <div className="text-muted">Chưa có người phụ trách.</div>}
                  </div>
                  <div className="input-group mb-4">
                    <select className="form-select" defaultValue="" onChange={(e) => { const uid = Number(e.target.value); if (uid) addAssigneeFE(activeTask.id, uid) }}>
                      <option value="">Chọn thành viên để thêm</option>
                      {members.map(m => <option key={m.user_id} value={m.user_id}>{m.user?.name || m.user_id}</option>)}
                    </select>
                    <button className="btn btn-outline-primary" type="button" disabled>Thêm</button>
                  </div>

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
