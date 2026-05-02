import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { eventsService } from '../../services/eventsService'
import EventCard from '../../components/shared/EventCard'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { Search, Filter } from 'lucide-react'

const CATEGORIES = ['Music', 'Technology', 'Sports', 'Arts', 'Food', 'Business', 'Health', 'Education']

export default function EventsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['events', { search, category, page }],
    queryFn: () => eventsService.getEvents({ search, category, page, status: 'published', limit: 12 }),
    keepPreviousData: true,
  })

  const events = data?.data || []
  const pagination = data?.pagination || {}

  return (
    <div className="page-container py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Browse Events</h1>
        <p className="text-slate-400">Discover amazing events near you</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="input pl-10"
            />
          </div>
          <div className="relative sm:w-56">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1) }}
              className="input pl-10 appearance-none"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <LoadingSpinner size="xl" className="py-20" />
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl text-slate-400">No events found</p>
          <p className="text-slate-500 mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-400">
              {pagination.total || 0} events found
              {isFetching && <span className="ml-2 text-accent-purple">Updating...</span>}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-400 px-4">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
