import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ArticlesPage from './pages/ArticlesPage'
import ArticlePage from './pages/ArticlePage'
import LoginPage from './pages/LoginPage'
import HomepageAdminPage from './pages/HomepageAdminPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="article/:slug" element={<ArticlePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <HomepageAdminPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
