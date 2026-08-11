import { Link, Outlet } from 'react-router-dom'

/** Provides shared branding, skip navigation, and the nested-page outlet. */
export default function AppLayout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand" to="/" aria-label="ENFOS reporting home">
            <span className="brand__name">ENFOS</span>
            <span className="brand__divider" aria-hidden="true" />
            <span className="brand__product">Reporting</span>
          </Link>
          <span className="environment-badge">Internal portal</span>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
