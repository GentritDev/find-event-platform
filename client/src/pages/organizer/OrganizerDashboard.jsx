import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '../../services/eventsService'
import { uploadsService } from '../../services/uploadsService'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { Plus, Edit, Trash2, Eye, Send, XCircle, Upload } from 'lucide-react'

const CATEGORIES = ['Music', 'Technology', 'Sports', 'Arts', 'Food', 'Business', 'Health', 'Education']

function EventFormModal({ event, onClose, onSuccess }) {
  const [form, setForm] = useState(event ? {
    title: event.title, description: event.description, category: event.category || '',
    location: event.location, start_at: event.start_at?.slice(0, 16), end_at: event.end_at?.slice(0, 16),
    price_eur: event.price_eur, capacity: event.capacity, cover_image_url: event.cover_image_url || '',
    status: event.status,
  } : {
    title: '', description: '', category: '', location: '', start_at: '', end_at: '',
    price_eur: 0, capacity: 100, cover_image_url: '', status: 'draft',
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadsService.uploadImage(file)
      setForm((f) => ({ ...f, cover_image_url: result.url }))
      toast.success('Image uploaded!')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price_eur: parseFloat(form.price_eur),
        capacity: parseInt(form.capacity, 10),
        start_at: new Date(form.start_at).toISOString(),
        end_at: new Date(form.end_at).toISOString(),
      }
      if (event) {
        await eventsService.updateEvent(event.id, payload)
        toast.success('Event updated!')
      } else {
        await eventsService.createEvent(payload)
        toast.success('Event created!')
      }
      onSuccess()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-dark-500 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{event ? 'Edit Event' : 'Create Event'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><XCircle className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Title *</label>
              <input className="input" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Description *</label>
              <textarea className="input min-h-[100px] resize-y" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} required />
            </div>

            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Location *</label>
              <input className="input" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} required />
            </div>

            <div>
              <label className="label">Start Date & Time *</label>
              <input type="datetime-local" className="input" value={form.start_at} onChange={(e) => setForm({...form, start_at: e.target.value})} required />
            </div>

            <div>
              <label className="label">End Date & Time *</label>
              <input type="datetime-local" className="input" value={form.end_at} onChange={(e) => setForm({...form, end_at: e.target.value})} required />
            </div>

            <div>
              <label className="label">Price (EUR)</label>
              <input type="number" min="0" step="0.01" className="input" value={form.price_eur} onChange={(e) => setForm({...form, price_eur: e.target.value})} />
            </div>

            <div>
              <label className="label">Capacity *</label>
              <input type="number" min="1" className="input" value={form.capacity} onChange={(e) => setForm({...form, capacity: e.target.value})} required />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Cover Image</label>
              <div className="flex gap-3 items-center">
                <input className="input flex-1" placeholder="Image URL or upload below" value={form.cover_image_url} onChange={(e) => setForm({...form, cover_image_url: e.target.value})} />
                <label className={`btn-secondary cursor-pointer text-sm ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
              {form.cover_image_url && (
                <img src={form.cover_image_url} alt="Preview" className="mt-2 h-24 rounded-lg object-cover" />
              )}
            </div>

            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <LoadingSpinner size="sm" /> : (event ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function OrganizerDashboard() {
  const [showForm, setShowForm] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const queryClient = useQueryClient()

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['organizer-events'],
    queryFn: eventsService.getOrganizerEvents,
  })

  const deleteMutation = useMutation({
    mutationFn: eventsService.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] })
      toast.success('Event deleted')
    },
    onError: (err) => toast.error(err.message),
  })

  const publishMutation = useMutation({
    mutationFn: eventsService.publishEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] })
      toast.success('Event published!')
    },
    onError: (err) => toast.error(err.message),
  })

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditEvent(null)
    queryClient.invalidateQueries({ queryKey: ['organizer-events'] })
  }

  return (
    <div className="page-container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Organizer Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your events</p>
        </div>
        <button onClick={() => { setEditEvent(null); setShowForm(true) }} className="btn-primary">
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Events', value: events.length },
          { label: 'Published', value: events.filter(e => e.status === 'published').length },
          { label: 'Draft', value: events.filter(e => e.status === 'draft').length },
          { label: 'Total Capacity', value: events.reduce((s, e) => s + (e.capacity || 0), 0) },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="text-2xl font-bold text-accent-purple-light">{stat.value}</div>
            <div className="text-sm text-slate-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner size="xl" className="py-20" />
      ) : events.length === 0 ? (
        <div className="text-center py-20 card">
          <p className="text-5xl mb-4">🎪</p>
          <p className="text-lg text-slate-300 mb-2">No events yet</p>
          <p className="text-slate-500 mb-6">Create your first event to get started</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-500">
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Event</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400 hidden sm:table-cell">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400 hidden md:table-cell">Tickets</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-dark-600 hover:bg-dark-600/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-200 line-clamp-1">{event.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{event.location}</div>
                    </td>
                    <td className="p-4 hidden sm:table-cell text-sm text-slate-400">
                      {new Date(event.start_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-slate-400">
                      {event.tickets_sold || 0}/{event.capacity}
                    </td>
                    <td className="p-4">
                      <span className={`badge ${
                        event.status === 'published' ? 'badge-published' :
                        event.status === 'draft' ? 'badge-draft' : 'badge-cancelled'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <a href={`/events/${event.id}`} target="_blank" rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-500 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </a>
                        <button onClick={() => { setEditEvent(event); setShowForm(true) }}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-500 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        {event.status === 'draft' && (
                          <button onClick={() => publishMutation.mutate(event.id)}
                            disabled={publishMutation.isPending}
                            className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-green-900/20 rounded-lg transition-colors">
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this event?')) deleteMutation.mutate(event.id)
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(showForm) && (
        <EventFormModal
          event={editEvent}
          onClose={() => { setShowForm(false); setEditEvent(null) }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
