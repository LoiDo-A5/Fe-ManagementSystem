import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api, { getCurrentUser } from '../api/client';
import { useToast } from './ToastProvider';

export default function TaskComments({ taskId, isVisible }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { show } = useToast();
  const { id: projectId } = useParams();

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/api/tasks/${taskId}/comments`);
      setComments(data);
    } catch (err) {
      show(err.response?.data?.error || 'Lỗi khi tải bình luận', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId && isVisible) {
      loadComments();
    }
  }, [taskId, isVisible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { data } = await api.post(`/api/tasks/${taskId}/comments`, {
        content: newComment.trim(),
      });
      setComments([...comments, data]);
      setNewComment('');
      show('Đã thêm bình luận', 'success');
    } catch (err) {
      show(err.response?.data?.error || 'Lỗi khi thêm bình luận', 'danger');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Xóa bình luận này?')) return;
    
    try {
      await api.delete(`/api/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
      show('Đã xóa bình luận', 'success');
    } catch (err) {
      show(err.response?.data?.error || 'Lỗi khi xóa bình luận', 'danger');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!isVisible) return null;

  return (
    <div className="mt-4">
      <h6 className="mb-3">Bình luận ({comments.length})</h6>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Viết bình luận..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!newComment.trim() || isLoading}
          >
            Gửi
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-muted text-center py-3">Chưa có bình luận nào</div>
        ) : (
          <div className="vstack gap-3">
            {comments.map((comment) => (
              <div key={comment.id} className="card">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex gap-2">
                      <div className="avatar-sm d-flex align-items-center justify-content-center rounded-circle bg-light text-dark fw-bold">
                        {getInitials(comment.user?.name || '')}
                      </div>
                      <div>
                        <div className="fw-semibold">{comment.user?.name || 'Người dùng'}</div>
                        <div className="text-muted small">{formatDate(comment.created_at)}</div>
                      </div>
                    </div>
                    {comment.user_id === getCurrentUser()?.id && (
                      <button 
                        className="btn btn-sm btn-link text-danger p-0"
                        onClick={() => handleDelete(comment.id)}
                        title="Xóa bình luận"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                  <div className="mt-2">{comment.content}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
