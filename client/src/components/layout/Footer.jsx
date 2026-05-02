import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-dark-500 py-8 mt-auto">
      <div className="page-container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span>🎟</span>
            <span className="bg-gradient-to-r from-accent-purple-light to-blue-400 bg-clip-text text-transparent">
              FindEvent
            </span>
          </Link>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} FindEvent Platform. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-slate-500">
            <Link to="/events" className="hover:text-slate-300 transition-colors">Events</Link>
            <a href="mailto:support@findevent.app" className="hover:text-slate-300 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
