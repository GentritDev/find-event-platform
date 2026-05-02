import { useQuery } from '@tanstack/react-query'
import { ticketsService } from '../../services/ticketsService'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { Calendar, MapPin, CheckCircle, XCircle, Ticket } from 'lucide-react'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function MyTicketsPage() {
  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: ticketsService.getMyTickets,
  })

  if (isLoading) return <LoadingSpinner size="xl" className="py-32" />

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2 flex items-center gap-3">
          <Ticket className="w-8 h-8 text-accent-purple" />
          My Tickets
        </h1>
        <p className="text-slate-400">Your purchased event tickets with QR codes</p>
      </div>

      {error && (
        <div className="card p-6 text-center text-red-400">
          Failed to load tickets. Please try again.
        </div>
      )}

      {!isLoading && !error && tickets?.length === 0 && (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🎟</p>
          <h2 className="text-xl font-semibold text-slate-300 mb-2">No tickets yet</h2>
          <p className="text-slate-500 mb-6">Browse events and purchase your first ticket!</p>
          <a href="/events" className="btn-primary">Browse Events</a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tickets?.map((ticket) => (
          <div key={ticket.id} className={`card overflow-hidden ${ticket.status === 'used' ? 'opacity-70' : ''}`}>
            {/* Event image */}
            {ticket.cover_image_url && (
              <div className="h-32 overflow-hidden">
                <img src={ticket.cover_image_url} alt={ticket.event_title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-5">
              {/* Status */}
              <div className="flex items-center justify-between mb-3">
                <span className={`badge ${
                  ticket.status === 'active' ? 'badge-published' :
                  ticket.status === 'used' ? 'badge bg-slate-800 text-slate-400 border border-slate-700' :
                  'badge-cancelled'
                }`}>
                  {ticket.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {ticket.status === 'used' && <XCircle className="w-3 h-3 mr-1" />}
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </span>
                <span className="text-xs text-slate-500">#{ticket.id.slice(0, 8)}</span>
              </div>

              <h3 className="font-semibold text-slate-100 mb-2 line-clamp-2">{ticket.event_title}</h3>

              <div className="space-y-1.5 text-sm text-slate-400 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-accent-purple flex-shrink-0" />
                  {formatDate(ticket.start_at)}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-accent-purple flex-shrink-0" />
                  <span className="truncate">{ticket.location}</span>
                </div>
              </div>

              {/* QR Code */}
              {ticket.qr_code_data_url && ticket.status === 'active' && (
                <div className="border-t border-dark-500 pt-4 flex flex-col items-center">
                  <p className="text-xs text-slate-500 mb-2">Show at entrance</p>
                  <img
                    src={ticket.qr_code_data_url}
                    alt="QR Code"
                    className="w-36 h-36 rounded-lg bg-white p-1"
                  />
                  <p className="text-xs text-slate-600 mt-2 font-mono">{ticket.qr_token.slice(0, 16)}...</p>
                </div>
              )}

              {ticket.status === 'used' && (
                <div className="border-t border-dark-500 pt-3 text-center text-sm text-slate-500">
                  ✅ Used on {ticket.checked_in_at ? formatDate(ticket.checked_in_at) : 'N/A'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
