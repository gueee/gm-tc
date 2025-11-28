import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/articles', label: 'Articles' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-steel-900/95 backdrop-blur-sm border-b border-steel-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-copper-400">GM-TC</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'text-copper-400'
                      : 'text-steel-300 hover:text-copper-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-steel-300 hover:text-copper-400"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-steel-700">
            <nav className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 text-sm font-medium ${
                    isActive(link.to)
                      ? 'text-copper-400'
                      : 'text-steel-300 hover:text-copper-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-steel-900 border-t border-steel-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-steel-500 text-sm">
              © {new Date().getFullYear()} GM-TC. Private technical blog.
            </div>

            {/* Footer Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link
                to="/impressum"
                className="text-steel-500 hover:text-copper-400 transition-colors"
              >
                Impressum
              </Link>
              {/* Hidden login link - only visible to those who know */}
              <Link
                to="/login"
                className="text-steel-700 hover:text-steel-500 transition-colors text-xs"
                title="Admin access"
              >
                •
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
