import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ticketsService } from '../../services/ticketsService'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { Scan, CheckCircle, XCircle, User, Calendar, MapPin } from 'lucide-react'

export default function OrganizerScanPage() {
  const [qrInput, setQrInput] = useState('')
  const [result, setResult] = useState(null)

  const verifyMutation = useMutation({
    mutationFn: () => ticketsService.verifyTicket(qrInput.trim()),
    onSuccess: (data) => {
      setResult(data)
      if (data.valid) {
        toast.success('✅ Ticket verified!')
      } else {
        toast.error(data.message)
      }
    },
    onError: (err) => {
      toast.error(err.message)
      setResult(null)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!qrInput.trim()) return
    setResult(null)
    verifyMutation.mutate()
  }

  return (
    <div className="page-container py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2 flex items-center gap-3">
          <Scan className="w-8 h-8 text-accent-purple" />
          QR Ticket Scanner
        </h1>
        <p className="text-slate-400">Verify attendee tickets at event entry</p>
      </div>

      <div className="card p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Enter QR Token</label>
            <textarea
              className="input font-mono text-sm resize-none"
              rows={3}
              placeholder="Paste QR token here or type it manually..."
              value={qrInput}
              onChange={(e) => { setQrInput(e.target.value); setResult(null) }}
            />
          </div>

          <button
            type="submit"
            disabled={verifyMutation.isPending || !qrInput.trim()}
            className="btn-primary w-full justify-center py-3"
          >
            {verifyMutation.isPending ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Scan className="w-5 h-5" />
                Verify Ticket
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className={`card p-6 border-2 ${
          result.valid ? 'border-green-600 bg-green-900/10' : 'border-red-600 bg-red-900/10'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {result.valid ? (
              <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
            )}
            <div>
              <h3 className={`font-bold text-lg ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
                {result.valid ? 'VALID TICKET' : 'INVALID TICKET'}
              </h3>
              <p className="text-slate-400 text-sm">{result.message}</p>
            </div>
          </div>

          {result.ticket && (
            <div className="border-t border-dark-500 pt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <User className="w-4 h-4 text-accent-purple flex-shrink-0" />
                {result.ticket.full_name} ({result.ticket.email})
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-accent-purple flex-shrink-0" />
                {result.ticket.event_title}
              </div>
              {result.ticket.location && (
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-accent-purple flex-shrink-0" />
                  {result.ticket.location}
                </div>
              )}
              {result.ticket.checked_in_at && (
                <p className="text-xs text-slate-500 mt-2">
                  Checked in at: {new Date(result.ticket.checked_in_at).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card p-4 mt-6 bg-dark-700">
        <h3 className="font-semibold text-slate-200 mb-2 text-sm">How to use:</h3>
        <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
          <li>Ask attendee to show their QR code from the My Tickets page</li>
          <li>Copy the QR token text or use a QR scanner app to get the token</li>
          <li>Paste the token in the box above and click Verify</li>
          <li>Green = Valid ✅ | Red = Invalid or already used ❌</li>
        </ul>
      </div>
    </div>
  )
}
