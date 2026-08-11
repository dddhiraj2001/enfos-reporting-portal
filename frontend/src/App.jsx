import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ReportDetailPage from './pages/ReportDetailPage.jsx'
import ReportsLandingPage from './pages/ReportsLandingPage.jsx'
import './App.css'

/** Defines the client-side routes inside the shared application shell. */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<ReportsLandingPage />} />
          <Route path="reports/:reportId" element={<ReportDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
