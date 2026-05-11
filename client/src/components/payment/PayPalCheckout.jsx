import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { paymentsService } from "../../services/paymentsService";
import LoadingSpinner from "../shared/LoadingSpinner";
import toast from "react-hot-toast";
import { AlertCircle } from "lucide-react";

export default function PayPalCheckout({ eventId, eventPrice, onSuccess }) {
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoQuantity, setDemoQuantity] = useState(1);
  const [demoCardName, setDemoCardName] = useState("");
  const [demoCardNumber, setDemoCardNumber] = useState("");
  const [demoExpiry, setDemoExpiry] = useState("");
  const [demoCvc, setDemoCvc] = useState("");
  const isMockMode = import.meta.env.VITE_PAYPAL_MOCK_MODE === "true";
  const containerRef = useRef(null);
  const paymentSessionRef = useRef(null);
  const createOrderRef = useRef(null);

  const validateDemoForm = () => {
    if (demoQuantity < 1) {
      toast.error("Please choose at least one ticket.");
      return false;
    }
    if (!demoCardName.trim()) {
      toast.error("Please enter a cardholder name.");
      return false;
    }
    if (!/^[0-9]{12,19}$/.test(demoCardNumber.replace(/\s+/g, ""))) {
      toast.error("Please enter a valid mock card number.");
      return false;
    }
    if (!/^(0[1-9]|1[0-2])\/(?:[0-9]{2})$/.test(demoExpiry)) {
      toast.error("Please enter a valid expiry date like 07/28.");
      return false;
    }
    if (!/^[0-9]{3,4}$/.test(demoCvc)) {
      toast.error("Please enter a valid CVC.");
      return false;
    }
    return true;
  };

  const handleOpenDemoModal = () => setShowDemoModal(true);
  const handleCloseDemoModal = () => {
    setShowDemoModal(false);
    setDemoCardName("");
    setDemoCardNumber("");
    setDemoExpiry("");
    setDemoCvc("");
    setDemoQuantity(1);
  };

  const handleDemoPurchase = async (quantity = 1) => {
    if (!validateDemoForm()) {
      return;
    }

    try {
      setIsProcessing(true);
      const result = await paymentsService.createDemoPurchase({
        event_id: eventId,
        quantity,
      });

      toast.success("Demo purchase completed! Your ticket is ready.");

      const purchaseData = result.data || result;
      const ticket = purchaseData.ticket || purchaseData.tickets?.[0];
      const payload = { ...purchaseData, ticket };

      if (onSuccess) {
        onSuccess(payload);
      } else {
        setTimeout(() => {
          navigate("/payment/success");
        }, 500);
      }

      handleCloseDemoModal();
    } catch (err) {
      console.error("[PayPal Demo] Purchase error:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to complete demo purchase",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartPayment = async () => {
    if (
      !paymentSessionRef.current ||
      !createOrderRef.current ||
      !containerRef.current
    ) {
      toast.error("PayPal is not ready yet. Please try again.");
      return;
    }

    try {
      setIsProcessing(true);
      // Pass the createOrder function reference (do NOT call it here)
      // Use 'modal' presentation so the SDK opens the modal on click
      await paymentSessionRef.current.start(
        {
          presentationMode: "auto",
          targetElement: containerRef.current,
        },
        createOrderRef.current(),
      );
    } catch (err) {
      toast.error(err.message || "Failed to start payment");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (isMockMode) {
      setIsInitializing(false);
      setIsReady(true);
      return;
    }

    const initializePayPal = async () => {
      try {
        setIsInitializing(true);
        setError(null);
        setIsReady(false);

        // Check if PayPal SDK is loaded
        if (!window.paypal) {
          throw new Error("PayPal SDK not loaded. Please refresh the page.");
        }

        // Get client ID from environment
        const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
        if (!clientId) {
          throw new Error("PayPal Client ID not configured");
        }

        // Create SDK instance
        const sdkInstance = await window.paypal.createInstance({
          clientId,
          components: ["paypal-payments"],
          pageType: "checkout",
        });

        // Check payment eligibility
        const eligibleMethods = await sdkInstance.findEligibleMethods({
          currencyCode: "EUR",
        });

        if (!eligibleMethods.isEligible("paypal")) {
          throw new Error("PayPal is not available for your location");
        }

        // Create payment session
        const paymentSession = sdkInstance.createPayPalOneTimePaymentSession({
          async onApprove(data) {
            try {
              console.log("[PayPal] onApprove called with:", data);
              setIsProcessing(true);
              // Capture the order on backend
              console.log("[PayPal] Capturing order:", data.orderId);
              const result = await paymentsService.capturePayPalOrder({
                paypal_order_id: data.orderId,
              });

              console.log("[PayPal] Capture successful:", result);
              toast.success("Payment successful! Your ticket is ready.");

              if (onSuccess) {
                onSuccess(result.data);
              } else {
                setTimeout(() => {
                  navigate("/payment/success");
                }, 500);
              }
            } catch (err) {
              console.error("[PayPal] onApprove error:", err);
              const errorMsg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to process payment";
              console.error("[PayPal] Error details:", {
                status: err.response?.status,
                data: err.response?.data,
                message: errorMsg,
              });
              toast.error(errorMsg);
            } finally {
              setIsProcessing(false);
            }
          },

          onCancel(data) {
            console.log("[PayPal] Payment cancelled:", data);
            toast("Payment cancelled");
            navigate("/payment/cancel");
          },

          onError(error) {
            console.error("[PayPal] Modal error:", error);
            toast.error(error.message || "Payment error occurred");
            setIsProcessing(false);
          },
        });

        paymentSessionRef.current = paymentSession;

        const createOrder = async () => {
          const orderResponse = await paymentsService.createPayPalOrder({
            event_id: eventId,
          });

          const paypalOrderId =
            orderResponse?.data?.data?.paypalOrderId ||
            orderResponse?.data?.paypalOrderId;
          console.log(
            "[PayPal] Extracted paypalOrderId:",
            paypalOrderId,
            "from",
            orderResponse,
          );

          if (!paypalOrderId || typeof paypalOrderId !== "string") {
            throw new Error("No PayPal order ID returned from server");
          }

          // In real mode, reject mock/local IDs early.
          if (!isMockMode && String(paypalOrderId).startsWith("MOCK-")) {
            throw new Error(
              "Server is still returning mock order IDs. Restart backend with PAYPAL_MOCK_MODE=false.",
            );
          }

          // SDK v6 expects an object containing orderId.
          return { orderId: paypalOrderId };
        };

        createOrderRef.current = createOrder;
        setIsReady(true);

        setIsInitializing(false);
      } catch (err) {
        console.error("PayPal initialization error:", err);
        setError(err.message);
        setIsInitializing(false);
      }
    };

    initializePayPal();

    return () => {
      paymentSessionRef.current = null;
      createOrderRef.current = null;
    };
  }, [eventId, navigate, onSuccess, isMockMode]);

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Payment Setup Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="paypal-checkout-container"
      ref={containerRef}
      className="relative w-full"
    >
      <button
        type="button"
        onClick={isMockMode ? handleOpenDemoModal : handleStartPayment}
        disabled={(!isMockMode && (!isReady || isInitializing)) || isProcessing}
        className="btn-primary w-full justify-center text-base py-3 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isMockMode ? "Complete Demo Purchase" : "Pay with PayPal"}
      </button>
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100/80 dark:bg-slate-950/80 px-4 py-6">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Demo Checkout
                </h2>
                <p className="text-slate-600 text-sm dark:text-slate-400">
                  Enter mock card details and quantity below.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseDemoModal}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDemoPurchase(demoQuantity);
              }}
              className="space-y-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-slate-700 text-sm dark:text-slate-300">
                  Quantity
                  <input
                    type="number"
                    min="1"
                    value={demoQuantity}
                    onChange={(e) =>
                      setDemoQuantity(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-accent-purple dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>
                <label className="block text-slate-700 text-sm dark:text-slate-300">
                  Total
                  <div className="mt-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                    €{((parseFloat(eventPrice) || 0) * demoQuantity).toFixed(2)}
                  </div>
                </label>
              </div>

              <div className="grid gap-3">
                <label className="block text-slate-700 text-sm dark:text-slate-300">
                  Cardholder Name
                  <input
                    type="text"
                    value={demoCardName}
                    onChange={(e) => setDemoCardName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-accent-purple dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Jane Doe"
                  />
                </label>
                <label className="block text-slate-700 text-sm dark:text-slate-300">
                  Card Number
                  <input
                    type="text"
                    value={demoCardNumber}
                    onChange={(e) => setDemoCardNumber(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-accent-purple dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="1234 5678 9012 3456"
                    inputMode="numeric"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-slate-700 text-sm dark:text-slate-300">
                    Expiry
                    <input
                      type="text"
                      value={demoExpiry}
                      onChange={(e) => setDemoExpiry(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-accent-purple dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      placeholder="07/28"
                      maxLength={5}
                    />
                  </label>
                  <label className="block text-slate-700 text-sm dark:text-slate-300">
                    CVC
                    <input
                      type="text"
                      value={demoCvc}
                      onChange={(e) => setDemoCvc(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-accent-purple dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      placeholder="123"
                      inputMode="numeric"
                      maxLength={4}
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCloseDemoModal}
                  className="btn-secondary w-full justify-center py-3"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary w-full justify-center py-3"
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? "Processing..."
                    : `Buy ${demoQuantity} ticket${demoQuantity === 1 ? "" : "s"} (€${((parseFloat(eventPrice) || 0) * demoQuantity).toFixed(2)})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <LoadingSpinner size="md" />
        </div>
      )}
      {!isMockMode && isInitializing && (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="md" />
        </div>
      )}
    </div>
  );
}
