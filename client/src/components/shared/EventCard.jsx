import { Calendar, MapPin, Users, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function EventCard({ event }) {
  const spotsLeft = event.capacity - (event.tickets_sold || 0)
  const soldOut = spotsLeft <= 0

  return (
    <Link to={`/events/${event.id}`} className="block group">
      <div className="card overflow-hidden hover:border-accent-purple/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-purple/10">
        {/* Cover Image */}
        <div className="relative h-44 bg-dark-600 overflow-hidden">
          {event.cover_image_url ? (
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-600 to-dark-500">
              <span className="text-5xl opacity-30">🎟</span>
            </div>
          )}
          {/* Status badge */}
          <div className="absolute top-3 left-3">
            {soldOut ? (
              <span className="badge bg-red-900/80 text-red-300 border border-red-800 backdrop-blur-sm">Sold Out</span>
            ) : event.status === 'cancelled' ? (
              <span className="badge-cancelled backdrop-blur-sm">Cancelled</span>
            ) : null}
          </div>
          {/* Price */}
          <div className="absolute top-3 right-3">
            <span className="badge bg-dark-800/90 text-accent-purple-light border border-accent-purple/30 backdrop-blur-sm text-sm font-bold">
              {parseFloat(event.price_eur) === 0 ? 'Free' : `€${parseFloat(event.price_eur).toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {event.category && (
            <div className="flex items-center gap-1 text-xs text-accent-purple-light mb-2">
              <Tag className="w-3 h-3" />
              {event.category}
            </div>
          )}
          <h3 className="font-semibold text-slate-100 line-clamp-2 mb-3 group-hover:text-accent-purple-light transition-colors">
            {event.title}
          </h3>

          <div className="space-y-1.5 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-accent-purple" />
              <span>{formatDate(event.start_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-accent-purple" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 flex-shrink-0 text-accent-purple" />
              <span>{soldOut ? 'Sold out' : `${spotsLeft} spots left`}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
