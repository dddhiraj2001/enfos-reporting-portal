import { Link } from 'react-router-dom'

/** Gives unknown client-side routes an accessible path back to the report catalog. */
export default function NotFoundPage() {
  return (
    <main className="content-width not-found-page" id="main-content">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The page you requested does not exist in the reporting portal.</p>
      <Link className="button button--primary" to="/">Return to reports</Link>
    </main>
  )
}
