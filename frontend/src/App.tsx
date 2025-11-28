import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import ArticlePage from './pages/ArticlePage'
import LoginPage from './pages/LoginPage'
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
        <Route path="category/:slug" element={<CategoryPage />} />
        <Route path="article/:slug" element={<ArticlePage />} />
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
        <Route path="articles/:id" element={<ArticleEditor />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="categories/:id" element={<CategoryEditor />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
