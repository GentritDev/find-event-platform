import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { Ticket, LayoutDashboard, LogOut, Menu, X, Scan, Sun, Moon } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-dark-800/90 backdrop-blur-md border-b border-dark-500">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">🎟</span>
            <span className="bg-gradient-to-r from-accent-purple-light to-blue-400 bg-clip-text text-transparent">
              FindEvent
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink
              to="/events"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-dark-600 text-accent-purple-light' : 'text-slate-400 hover:text-slate-200 hover:bg-dark-700'
                }`
              }
            >
              Events
            </NavLink>

            {user && (
              <NavLink
                to="/tickets/my"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive ? 'bg-dark-600 text-accent-purple-light' : 'text-slate-400 hover:text-slate-200 hover:bg-dark-700'
                  }`
                }
              >
                <Ticket className="w-4 h-4" />
                My Tickets
              </NavLink>
            )}

            {user && (user.role === 'organizer' || user.role === 'admin') && (
              <>
                <NavLink
                  to="/dashboard/organizer"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive ? 'bg-dark-600 text-accent-purple-light' : 'text-slate-400 hover:text-slate-200 hover:bg-dark-700'
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Organizer
                </NavLink>
                <NavLink
                  to="/scan"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive ? 'bg-dark-600 text-accent-purple-light' : 'text-slate-400 hover:text-slate-200 hover:bg-dark-700'
                    }`
                  }
                >
                  <Scan className="w-4 h-4" />
                  Scan
                </NavLink>
              </>
            )}

            {user?.role === 'admin' && (
              <NavLink
                to="/dashboard/admin"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-dark-600 text-accent-purple-light' : 'text-slate-400 hover:text-slate-200 hover:bg-dark-700'
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </div>

          {/* Desktop Auth + Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-dark-600 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">
                  Hi, <span className="text-slate-200 font-medium">{user.full_name?.split(' ')[0]}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile: theme toggle + menu button */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              className="p-2 text-slate-400 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-dark-500 py-3 space-y-1">
            <NavLink to="/events" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-dark-600 rounded-lg" onClick={() => setMenuOpen(false)}>Events</NavLink>
            {user && <NavLink to="/tickets/my" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-dark-600 rounded-lg" onClick={() => setMenuOpen(false)}>My Tickets</NavLink>}
            {user && (user.role === 'organizer' || user.role === 'admin') && (
              <>
                <NavLink to="/dashboard/organizer" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-dark-600 rounded-lg" onClick={() => setMenuOpen(false)}>Organizer Dashboard</NavLink>
                <NavLink to="/scan" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-dark-600 rounded-lg" onClick={() => setMenuOpen(false)}>QR Scanner</NavLink>
              </>
            )}
            {user?.role === 'admin' && <NavLink to="/dashboard/admin" className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-dark-600 rounded-lg" onClick={() => setMenuOpen(false)}>Admin</NavLink>}
            {user ? (
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg">Logout</button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="btn-secondary text-sm flex-1 justify-center" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary text-sm flex-1 justify-center" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
