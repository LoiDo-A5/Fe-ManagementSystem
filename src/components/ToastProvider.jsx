import React, { createContext, useContext, useState } from 'react'

const ToastCtx = createContext({ show: () => {} })

export function useToast() {
  return useContext(ToastCtx)
}

export default function ToastProvider({ children }) {
  const [toast, setToast] = useState({ open: false, message: '', variant: 'danger' })

  function show(message, variant = 'danger', durationMs = 3000) {
    setToast({ open: true, message, variant })
    window.clearTimeout(show._t)
    show._t = window.setTimeout(() => setToast(t => ({ ...t, open: false })), durationMs)
  }

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1060 }}>
        <div className={`toast text-white ${toast.open ? 'show' : ''} bg-${toast.variant}`} role="alert" aria-live="assertive" aria-atomic="true" style={{ minWidth: 240 }}>
          <div className="d-flex">
            <div className="toast-body">{toast.message}</div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast(t => ({ ...t, open: false }))}></button>
          </div>
        </div>
      </div>
    </ToastCtx.Provider>
  )
}
