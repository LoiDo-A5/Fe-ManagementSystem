import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const I18nContext = createContext({ lang: 'vi', t: (k) => k, setLang: () => {} })

const translations = {
  vi: {
    'nav.projects': 'Dự án',
    'nav.login': 'Đăng nhập',
    'nav.logout': 'Đăng xuất',
    'nav.updateProfile': 'Cập nhật hồ sơ',
    'nav.account': 'Tài khoản',
    'projects.title': 'Dự án của tôi',
    'projects.subtitle': 'Quản lý các dự án và nhiệm vụ trong nhóm của bạn',
    'projects.searchPlaceholder': 'Tìm theo tên, mô tả, chủ sở hữu hoặc #id',
    'projects.createTitle': 'Tạo Project',
    'projects.createHint': 'Đặt tên rõ ràng để cả team dễ hiểu',
    'projects.namePlaceholder': 'Ví dụ: Website Marketing 2025',
    'projects.descriptionPlaceholder': 'Mục tiêu, phạm vi, deadline...',
    'projects.open': 'Mở dự án',
    'projects.createButton': 'Tạo dự án',
    'projects.owner': 'Chủ sở hữu:',
    'projects.emptyTitle': 'Không tìm thấy dự án phù hợp',
    'projects.emptySubtitle': 'Hãy thử từ khoá khác hoặc tạo dự án mới',
    'common.reload': 'Tải lại',
    'common.loading': 'Đang tải... ',
    'common.name': 'Tên',
    'common.description': 'Mô tả',
    'common.save': 'Lưu',
    'login.title': 'Đăng nhập',
    'login.register': 'Đăng ký',
    // Profile
    'profile.title': 'Cập nhật hồ sơ',
    'profile.reload': 'Tải lại',
    'profile.email': 'Email',
    'profile.displayName': 'Tên hiển thị',
    'profile.currentPassword': 'Mật khẩu hiện tại',
    'profile.newPassword': 'Mật khẩu mới',
    'profile.confirmPassword': 'Xác nhận mật khẩu mới',
    'profile.save': 'Lưu thay đổi',
    // Project Detail
    'project.reload': 'Tải lại',
    'project.settings': 'Cài đặt bảng',
    'project.titleColor': 'Màu tiêu đề',
    'project.backgroundUrl': 'Ảnh nền (URL)',
    'project.archived': 'Đã lưu trữ',
    'project.archive': 'Archive',
    'project.unarchive': 'Unarchive',
    'list.addColumn': 'Thêm cột (List)',
    'list.titlePlaceholder': 'Tên cột (ví dụ: To Do)',
    'list.addButton': 'Thêm cột',
    'task.add': 'Thêm Task',
    'task.title': 'Tiêu đề',
    'task.list': 'Cột (List)',
    'task.description': 'Mô tả',
    'task.create': 'Tạo',
    'section.noColumn': 'Chưa thuộc cột',
    'common.delete': 'Xoá',
    'task.commentFiles': 'Bình luận/Tệp',
    'members.title': 'Thành viên',
    'invite.email': 'Mời qua email',
    'invite.role': 'Vai trò',
    'invite.button': 'Mời',
    'invite.byId': 'Mời qua User ID',
    'invite.userIdPlaceholder': 'User ID',
    'invite.leave': 'Rời nhóm',
    'properties.title': 'Thuộc tính',
    'properties.priority': 'Độ ưu tiên',
    'properties.due': 'Hạn chót',
    'properties.reminder': 'Nhắc việc',
    'labels.title': 'Nhãn',
    'assignees.title': 'Người phụ trách',
    'attachments.title': 'Đính kèm',
    'attachments.upload': 'Tải tệp lên',
    'modal.close': 'Đóng',
    // Comments modal
    'comments.title': 'Bình luận',
    'comments.empty': 'Chưa có bình luận nào',
    'comments.writePlaceholder': 'Viết bình luận...',
    'comments.send': 'Gửi',
    'comments.save': 'Lưu',
    'comments.cancel': 'Hủy',
  },
  en: {
    'nav.projects': 'Projects',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.updateProfile': 'Update Profile',
    'nav.account': 'Account',
    'projects.title': 'My Projects',
    'projects.subtitle': 'Manage your team projects and tasks',
    'projects.searchPlaceholder': 'Search by name, description, owner or #id',
    'projects.createTitle': 'Create Project',
    'projects.createHint': 'Use a clear name for your team to understand',
    'projects.namePlaceholder': 'e.g. Marketing Website 2025',
    'projects.descriptionPlaceholder': 'Goals, scope, deadlines...',
    'projects.open': 'Open Project',
    'projects.createButton': 'Create Project',
    'projects.owner': 'Owner:',
    'projects.emptyTitle': 'No matching projects found',
    'projects.emptySubtitle': 'Try a different keyword or create a new project',
    'common.reload': 'Reload',
    'common.loading': 'Loading... ',
    'common.name': 'Name',
    'common.description': 'Description',
    'common.save': 'Save',
    'login.title': 'Login',
    'login.register': 'Register',
    // Profile
    'profile.title': 'Update Profile',
    'profile.reload': 'Reload',
    'profile.email': 'Email',
    'profile.displayName': 'Display name',
    'profile.currentPassword': 'Current password',
    'profile.newPassword': 'New password',
    'profile.confirmPassword': 'Confirm new password',
    'profile.save': 'Save changes',
    // Project Detail
    'project.reload': 'Reload',
    'project.settings': 'Board Settings',
    'project.titleColor': 'Title color',
    'project.backgroundUrl': 'Background (URL)',
    'project.archived': 'Archived',
    'project.archive': 'Archive',
    'project.unarchive': 'Unarchive',
    'list.addColumn': 'Add column (List)',
    'list.titlePlaceholder': 'Column name (e.g. To Do)',
    'list.addButton': 'Add column',
    'task.add': 'Add Task',
    'task.title': 'Title',
    'task.list': 'Column (List)',
    'task.description': 'Description',
    'task.create': 'Create',
    'section.noColumn': 'No column',
    'common.delete': 'Delete',
    'task.commentFiles': 'Comments/Files',
    'members.title': 'Members',
    'invite.email': 'Invite by email',
    'invite.role': 'Role',
    'invite.button': 'Invite',
    'invite.byId': 'Invite by User ID',
    'invite.userIdPlaceholder': 'User ID',
    'invite.leave': 'Leave project',
    'properties.title': 'Properties',
    'properties.priority': 'Priority',
    'properties.due': 'Due date',
    'properties.reminder': 'Reminder',
    'labels.title': 'Labels',
    'assignees.title': 'Assignees',
    'attachments.title': 'Attachments',
    'attachments.upload': 'Upload file',
    'modal.close': 'Close',
    // Comments modal
    'comments.title': 'Comments',
    'comments.empty': 'No comments yet',
    'comments.writePlaceholder': 'Write a comment...',
    'comments.send': 'Send',
    'comments.save': 'Save',
    'comments.cancel': 'Cancel',
  },
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'vi')

  useEffect(() => {
    localStorage.setItem('lang', lang)
    const html = document.documentElement
    html.setAttribute('lang', lang)
  }, [lang])

  const t = useMemo(() => {
    return (key) => {
      const dict = translations[lang] || translations.vi
      return dict[key] || translations.vi[key] || key
    }
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t])

  return React.createElement(I18nContext.Provider, { value }, children)
}

export function useI18n() {
  return useContext(I18nContext)
}
