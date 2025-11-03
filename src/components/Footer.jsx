import React from 'react'

export default function Footer() {
  return (
    <footer className="app-footer mt-auto">
      <div className="container py-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-4 d-flex align-items-center gap-2">
            <span className="brand-dot" />
            <span className="fw-bold">Team Manager</span>
          </div>
          <div className="col-12 col-md-4 text-muted small text-center">
            © {new Date().getFullYear()} Team Manager. All rights reserved.
          </div>
          <div className="col-12 col-md-4 d-flex justify-content-md-end justify-content-start gap-3 small">
            <a href="https://openstreetmap.org" className="footer-link" target="_blank" rel="noreferrer">Map data</a>
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
