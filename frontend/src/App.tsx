import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ArticlesPage from './pages/ArticlesPage'
import ArticlePage from './pages/ArticlePage'
import LoginPage from './pages/LoginPage'
import ImpressumPage from './pages/ImpressumPage'
import ProtectedRoute from './components/ProtectedRoute'
import {
  AdminLayout,
  Dashboard,
  Settings,
  ArticleList,
  ArticleEditor,
  CategoryList,
  CategoryEditor,
} from './pages/admin'

function App() {
  return (
    <Routes>
      {/* Public routes with main layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="article/:slug" element={<ArticlePage />} />
        <Route path="impressum" element={<ImpressumPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>

      {/* Admin routes with admin layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="articles" element={<ArticleList />} />
        <Route path="articles/new" element={<ArticleEditor />} />
        <Route path="articles/:id" element={<ArticleEditor />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="categories/new" element={<CategoryEditor />} />
        <Route path="categories/:id" element={<CategoryEditor />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
