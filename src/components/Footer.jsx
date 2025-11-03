import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-light border-top mt-auto">
      <div className="container py-3 d-flex justify-content-between align-items-center">
        <div className="text-muted small">
          © {new Date().getFullYear()} Team Manager. All rights reserved.
        </div>
        <div className="small">
          <a href="https://openstreetmap.org" target="_blank" rel="noreferrer" className="text-decoration-none">
            Map data © OpenStreetMap contributors
          </a>
        </div>
      </div>
    </footer>
  )
}
