'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js'; 
import { TabContext, TabList, Tab } from '@mui/material';
import CustomTabList from '@/components/mui/TabList';
import { FormControlLabel, Switch } from '@mui/material'; 
import {  createPaymentIntentPublic, removeCart, removeCartWhole } from '@/app/server/actions';
 

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Stripe payment form component
const StripePaymentForm = ({ onPaymentSuccess, isProcessing, setIsProcessing, selectedAddress, selectedShipping, orderSummary, user, cartItems }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [saveCard, setSaveCard] = useState(true);
  const [paymentError, setPaymentError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!stripe || !elements) {
      return;
    }
  
    setIsProcessing(true);
    setPaymentError(null);
    // console.log("orderSummary:", orderSummary);
  
  
    try {
      // Create payment intent using our API
      const response = await createPaymentIntentPublic({
        amount: Math.round(orderSummary.total * 100), // Convert to cents
        currency: "usd",
        saveCard,
        customerId: user?._id,
        cartItems: cartItems,
        orderData: {
          subtotal: orderSummary.subtotal,
          shipping: orderSummary.shipping,
          tax: orderSummary.tax || 0,
          total: orderSummary.total,
          shippingAddress: selectedAddress,
          shippingMethod: selectedShipping,
          paymentMethod: 'stripe',
          userId: user?._id
        }
      });
      console.log("response 3333333333333:", response); // Add this line to see the paymentIntent object
  
      if (!response.success) {
        setPaymentError(response.message || "Failed to create payment intent");
        return;
      }
  
      const { clientSecret,orderId } = response.data;
  
      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user?.name || "",
            email: user?.email || "",
          },
        },
      });
  
      console.log('paymentIntent:', paymentIntent);
      console.log('confirmError:', confirmError);
  
      if (confirmError) {
        setPaymentError(confirmError.message);
      } else {
        onPaymentSuccess({
          paymentIntentId: paymentIntent.id,
          orderId: orderId,
          paymentMethod: "stripe",
          status: true
        });
      }
      // setPaymentError("Payment verification failed. Please contact support.");
    } catch (error) {
      console.error("Error creating payment intent:", error);
      setPaymentError("An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Element Section */}
      <div className="space-y-4">
        <Typography variant="subtitle1" className="font-medium">
          Card Details
        </Typography>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                  padding: '10px 0',
                },
              },
              hidePostalCode: true,
            }}
            className="min-h-[40px]"
          />
        </div>
      </div>

      {/* Error Message */}
      {paymentError && (
        <div className="mt-4">
          <Alert 
            severity="error"
            className="rounded-lg"
          >
            {paymentError}
          </Alert>
        </div>
      )}

      {/* Save Card Option */}
      <div className="py-2">
        <FormControlLabel
          control={
            <Switch 
              checked={saveCard} 
              onChange={(e) => setSaveCard(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" className="text-gray-700">
              Save card for future payments
            </Typography>
          }
        />
      </div>

      {/* Payment Button */}
      <div className="pt-4">
        <Button
          type="submit"
          variant="contained"
          disabled={!stripe || isProcessing}
          fullWidth
          size="large"
          sx={{
            backgroundColor: '#991b1b',
            '&:hover': {
              backgroundColor: '#7f1d1d',
            },
            '&:disabled': {
              backgroundColor: '#e5e7eb',
            },
            height: '48px'
          }}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2">
              <CircularProgress size={20} color="inherit" />
              <span>Processing...</span>
            </div>
          ) : (
            `Pay £${orderSummary.total.toFixed(2)}`
          )}
        </Button>
      </div>

      {/* Security Notice */}
      <div className="pt-4 text-center">
        <Typography variant="body2" color="text.secondary" className="flex items-center justify-center gap-1">
          <span className="material-icons text-sm">lock</span>
          Payments are secure and encrypted
        </Typography>
      </div>
    </form>
  );
};

export default function PaymentPageClient({ initialData, cartId, clientId }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Validate required data
    if (!initialData?.cartItems?.length || !initialData.client) {
      setError('Invalid payment data');
    }
    setIsLoading(false);
  }, [initialData]);

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      setIsProcessing(true);

      // Delete the cart using the existing removeCart action
      try {
       const response = await removeCartWhole(cartId);
       console.log("response removeCartWholeremoveCartWhole:", response);
      } catch (cartError) {
        console.error('Failed to delete cart, but payment was successful:', cartError);
      }

      // Redirect to thank you page with order ID in the path
      router.push(`/payment/thank-you/${paymentResult?.orderId}`);
    } catch (error) {
      console.error('Error handling payment success:', error);
      setError('Failed to process payment. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => router.push('/')}
          sx={{
            backgroundColor: '#991b1b',
            '&:hover': {
              backgroundColor: '#7f1d1d',
            },
          }}
        >
          Return to Home
        </Button>
      </div>
    );
  }

  const calculateTotals = () => {
    if (!initialData.cartItems || initialData.cartItems.length === 0) return {
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0
    };

    const subtotal = initialData?.cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const discount = initialData?.orderSummary?.discount || 0;
    const shipping = initialData?.orderSummary?.shipping || 0;
    const total = subtotal - discount + shipping;

    return {
      subtotal,
      discount,
      shipping,
      total
    };
  };

  const totals = calculateTotals();

  const handlePaymentMethodChange = (event, newValue) => {
    setPaymentMethod(newValue);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <Typography variant="h4" component="h1" gutterBottom className="text-center mb-8" color="primary">
            Complete Your Payment
          </Typography>

          <Grid container spacing={4}>
            {/* Order Summary */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={0} className="bg-gray-50">
                <CardContent>
                  <Typography variant="h6" gutterBottom className="font-semibold">
                    Order Summary
                  </Typography>
                  <div className="space-y-4">
                    {initialData.cartItems.map((item, index) => (
                      <div key={index} className="flex gap-4 bg-white p-3 rounded-lg shadow-sm">
                        <img
                          src={`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}${item?.product?.productFeaturedImage?.filePath}`}
                          alt={item.product?.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div>
                          <Typography variant="subtitle1" className="font-medium">
                            {item.product?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Quantity: {item.quantity} SQ.M
                          </Typography>
                          <Typography variant="body2" className="font-semibold">
                            £{(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Divider className="my-4" />
                  
                  <div className="space-y-2 bg-white p-4 rounded-lg">
                    <div className="flex justify-between">
                      <Typography>Subtotal:</Typography>
                      <Typography>£{totals?.subtotal.toFixed(2)}</Typography>
                    </div>
                    <div className="flex justify-between">
                      <Typography>Shipping:</Typography>
                      <Typography>£{totals?.shipping.toFixed(2)}</Typography>
                    </div>
                    <Divider className="my-2" />
                    <div className="flex justify-between font-bold">
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6" color="primary">£{totals?.total.toFixed(2)}</Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Grid>

            {/* Payment Form */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card elevation={0}>
                <CardContent>
                  <Typography variant="h6" gutterBottom className="font-semibold">
                    Payment Details
                  </Typography>
                  
                  {/* Shipping Address */}
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                    <Typography variant="subtitle1" gutterBottom className="font-medium">
                      Shipping Address
                    </Typography>
                    <Typography variant="body2">
                      {initialData.client.name}<br />
                      {initialData.shippingAddress?.addressLine1}<br />
                      {initialData.shippingAddress?.addressLine2 && (
                        <>{initialData.shippingAddress.addressLine2}<br /></>
                      )}
                      {initialData.shippingAddress?.city}, {initialData.shippingAddress?.state} {initialData.shippingAddress?.postalCode}<br />
                      {initialData.shippingAddress?.country}
                    </Typography>
                  </div>

                  <Divider className="mb-6" />

                  {/* Stripe payment form wrapped in Elements provider */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <Elements stripe={stripePromise}>
                      <StripePaymentForm
                        onPaymentSuccess={handlePaymentSuccess}
                        isProcessing={isProcessing}
                        setIsProcessing={setIsProcessing}
                        orderSummary={totals} 
                        cartItems={initialData?.cartItems} 
                        selectedAddress={initialData?.client?.addressDetails?._id}
                        selectedShipping={initialData?.client?.shippingMethod?._id}
                        user={initialData.client}
                      />
                    </Elements>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
} 