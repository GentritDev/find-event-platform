import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { eventsService } from '../../services/eventsService'
import { paymentsService } from '../../services/paymentsService'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import toast from 'react-hot-toast'
import { Calendar, MapPin, Users, Tag, ArrowLeft, CreditCard, AlertCircle } from 'lucide-react'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsService.getEvent(id),
  })

  const purchaseMutation = useMutation({
    mutationFn: () => paymentsService.createPayPalOrder({ event_id: id }),
    onSuccess: (data) => {
      if (data?.approveUrl) {
        window.location.href = data.approveUrl
      } else {
        toast.error('Failed to get PayPal checkout URL')
      }
    },
    onError: (err) => toast.error(err.message),
  })

  if (isLoading) return <LoadingSpinner size="xl" className="py-32" />
  if (error) return (
    <div className="page-container py-20 text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p className="text-red-400">Event not found</p>
      <button onClick={() => navigate('/events')} className="btn-secondary mt-4">Back to Events</button>
    </div>
  )

  const spotsLeft = event.capacity - (event.tickets_sold || 0)
  const soldOut = spotsLeft <= 0
  const isFree = parseFloat(event.price_eur) === 0

  return (
    <div className="page-container py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Cover Image */}
          <div className="rounded-2xl overflow-hidden h-64 sm:h-80 mb-6 bg-dark-600">
            {event.cover_image_url ? (
              <img src={event.cover_image_url} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl opacity-20">🎟</span>
              </div>
            )}
          </div>

          {/* Category */}
          {event.category && (
            <div className="flex items-center gap-1.5 text-accent-purple-light text-sm font-medium mb-3">
              <Tag className="w-4 h-4" />
              {event.category}
            </div>
          )}

          <h1 className="text-3xl font-bold text-slate-100 mb-4">{event.title}</h1>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 text-slate-300">
              <Calendar className="w-5 h-5 text-accent-purple mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Start: {formatDate(event.start_at)}</p>
                <p className="text-slate-400 text-sm">End: {formatDate(event.end_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <MapPin className="w-5 h-5 text-accent-purple flex-shrink-0" />
              {event.location}
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Users className="w-5 h-5 text-accent-purple flex-shrink-0" />
              <span>{soldOut ? 'Sold out' : `${spotsLeft} of ${event.capacity} spots available`}</span>
            </div>
          </div>

          <div className="border-t border-dark-500 pt-6">
            <h2 className="font-semibold text-slate-100 mb-3">About this event</h2>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{event.description}</p>
          </div>

          <div className="mt-4 text-sm text-slate-500">
            Organized by <span className="text-slate-300 font-medium">{event.organizer_name}</span>
          </div>
        </div>

        {/* Sidebar - Purchase */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="text-3xl font-bold text-slate-100 mb-1">
              {isFree ? <span className="text-green-400">Free</span> : `€${parseFloat(event.price_eur).toFixed(2)}`}
            </div>
            {!isFree && <p className="text-xs text-slate-500 mb-4">per ticket</p>}

            {/* Status */}
            {event.status === 'cancelled' && (
              <div className="flex items-center gap-2 bg-red-900/20 border border-red-800 rounded-lg p-3 mb-4 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                This event has been cancelled
              </div>
            )}

            {soldOut && event.status !== 'cancelled' && (
              <div className="flex items-center gap-2 bg-orange-900/20 border border-orange-800 rounded-lg p-3 mb-4 text-orange-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                This event is sold out
              </div>
            )}

            {event.status === 'published' && !soldOut && (
              <>
                {user ? (
                  <button
                    onClick={() => purchaseMutation.mutate()}
                    disabled={purchaseMutation.isPending}
                    className="btn-primary w-full justify-center text-base py-3"
                  >
                    {purchaseMutation.isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        {isFree ? 'Get Free Ticket' : 'Buy with PayPal'}
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-primary w-full justify-center text-base py-3"
                  >
                    Login to Purchase
                  </button>
                )}
              </>
            )}

            <div className="mt-4 pt-4 border-t border-dark-500 space-y-2 text-sm text-slate-400">
              <div className="flex justify-between">
                <span>Capacity</span>
                <span className="text-slate-300">{event.capacity}</span>
              </div>
              <div className="flex justify-between">
                <span>Tickets sold</span>
                <span className="text-slate-300">{event.tickets_sold || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Available</span>
                <span className={soldOut ? 'text-red-400' : 'text-green-400'}>{spotsLeft}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
