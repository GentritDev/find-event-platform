import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { paymentsService } from '../../services/paymentsService'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { CheckCircle, Ticket } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const paypalOrderId = searchParams.get('token')
  const hasCaptured = useRef(false)

  const captureMutation = useMutation({
    mutationFn: () => paymentsService.capturePayPalOrder({ paypal_order_id: paypalOrderId }),
    onSuccess: () => {
      toast.success('Payment successful! Your ticket is ready.')
    },
    onError: (err) => {
      toast.error(err.message)
      setTimeout(() => navigate('/events'), 3000)
    },
  })

  useEffect(() => {
    if (paypalOrderId && !hasCaptured.current) {
      hasCaptured.current = true
      captureMutation.mutate()
    }
    // captureMutation is stable (useMutation), paypalOrderId is from URL params
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paypalOrderId])

  if (captureMutation.isPending) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
        <LoadingSpinner size="xl" />
        <p className="text-slate-400">Processing your payment...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="card p-10 max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Payment Successful!</h1>
        <p className="text-slate-400 mb-6">
          Your ticket has been confirmed. Check your email for details and your QR code.
        </p>
        <Link to="/tickets/my" className="btn-primary mx-auto">
          <Ticket className="w-4 h-4" />
          View My Tickets
        </Link>
      </div>
    </div>
  )
}
