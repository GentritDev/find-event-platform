import { Link } from 'react-router-dom'
import { XCircle } from 'lucide-react'

export default function PaymentCancelPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="card p-10 max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Payment Cancelled</h1>
        <p className="text-slate-400 mb-6">
          Your payment was cancelled. No charges were made.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/events" className="btn-secondary">Browse Events</Link>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    </div>
  )
}
