import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paymentsService } from '../../services/paymentsService'
import LoadingSpinner from '../shared/LoadingSpinner'
import toast from 'react-hot-toast'
import { AlertCircle } from 'lucide-react'

export default function PayPalCheckout({ eventId, eventPrice, onSuccess }) {
  const navigate = useNavigate()
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const containerRef = useRef(null)
  const paymentSessionRef = useRef(null)
  const createOrderRef = useRef(null)

  const handleStartPayment = async () => {
    if (!paymentSessionRef.current || !createOrderRef.current || !containerRef.current) {
      toast.error('PayPal is not ready yet. Please try again.')
      return
    }

    try {
      setIsProcessing(true)
      await paymentSessionRef.current.start(
        {
          presentationMode: 'auto',
          targetElement: containerRef.current,
        },
        createOrderRef.current()
      )
    } catch (err) {
      toast.error(err.message || 'Failed to start payment')
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    const initializePayPal = async () => {
      try {
        setIsInitializing(true)
        setError(null)
        setIsReady(false)

        // Check if PayPal SDK is loaded
        if (!window.paypal) {
          throw new Error('PayPal SDK not loaded. Please refresh the page.')
        }

        // Get client ID from environment
        const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID
        if (!clientId) {
          throw new Error('PayPal Client ID not configured')
        }

        // Create SDK instance
        const sdkInstance = await window.paypal.createInstance({
          clientId,
          components: ['paypal-payments'],
          pageType: 'checkout',
        })

        // Check payment eligibility
        const eligibleMethods = await sdkInstance.findEligibleMethods({
          currencyCode: 'EUR',
        })

        if (!eligibleMethods.isEligible('paypal')) {
          throw new Error('PayPal is not available for your location')
        }

        // Create payment session
        const paymentSession = sdkInstance.createPayPalOneTimePaymentSession({
          async onApprove(data) {
            try {
              setIsProcessing(true)
              // Capture the order on backend
              const result = await paymentsService.capturePayPalOrder({
                paypal_order_id: data.orderId,
              })

              toast.success('Payment successful! Your ticket is ready.')
              
              if (onSuccess) {
                onSuccess(result.data)
              } else {
                setTimeout(() => {
                  navigate('/payment/success')
                }, 500)
              }
            } catch (err) {
              toast.error(err.response?.data?.message || err.message || 'Failed to process payment')
            } finally {
              setIsProcessing(false)
            }
          },

          onCancel(data) {
            toast('Payment cancelled')
            navigate('/payment/cancel')
          },

          onError(error) {
            console.error('PayPal error:', error)
            toast.error(error.message || 'Payment error occurred')
            setIsProcessing(false)
          },
        })

        paymentSessionRef.current = paymentSession

        const createOrder = async () => {
          const orderResponse = await paymentsService.createPayPalOrder({
            event_id: eventId,
          })

          return {
            orderId: orderResponse.data.paypalOrderId,
          }
        }

        createOrderRef.current = createOrder
        setIsReady(true)

        setIsInitializing(false)
      } catch (err) {
        console.error('PayPal initialization error:', err)
        setError(err.message)
        setIsInitializing(false)
      }
    }

    initializePayPal()

    return () => {
      paymentSessionRef.current = null
      createOrderRef.current = null
    }
  }, [eventId, navigate, onSuccess])

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Payment Setup Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div id="paypal-checkout-container" ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={handleStartPayment}
        disabled={!isReady || isInitializing || isProcessing}
        className="btn-primary w-full justify-center text-base py-3 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Pay with PayPal
      </button>
      {isProcessing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <LoadingSpinner size="md" />
        </div>
      )}
      {isInitializing && (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="md" />
        </div>
      )}
    </div>
  )
}
