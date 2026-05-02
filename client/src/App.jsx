import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import HomePage from './pages/home/HomePage'
import EventsPage from './pages/events/EventsPage'
import EventDetailPage from './pages/events/EventDetailPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import MyTicketsPage from './pages/tickets/MyTicketsPage'
import OrganizerDashboard from './pages/organizer/OrganizerDashboard'
import OrganizerScanPage from './pages/organizer/OrganizerScanPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage'
import PaymentCancelPage from './pages/payment/PaymentCancelPage'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="payment/success" element={<PaymentSuccessPage />} />
        <Route path="payment/cancel" element={<PaymentCancelPage />} />

        <Route path="tickets/my" element={
          <ProtectedRoute>
            <MyTicketsPage />
          </ProtectedRoute>
        } />

        <Route path="dashboard/organizer" element={
          <ProtectedRoute roles={['organizer', 'admin']}>
            <OrganizerDashboard />
          </ProtectedRoute>
        } />

        <Route path="scan" element={
          <ProtectedRoute roles={['organizer', 'admin']}>
            <OrganizerScanPage />
          </ProtectedRoute>
        } />

        <Route path="dashboard/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}
