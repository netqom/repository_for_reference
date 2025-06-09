import { api } from "@/utils/api";

const PAYMENT_API = '/payments';

export const paymentApi = {
  // Create Stripe Payment Intent
  createPaymentIntent: async (data) => {
    try {
      // console.log('waheguru');
      const response = await api.post(`${PAYMENT_API}/stripe/create-payment-intent`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create payment intent'
      };
    }
  },

  // Verify Stripe Payment
  verifyStripePayment: async (paymentIntentId) => {
    try {
      const response = await api.get(`${PAYMENT_API}/stripe/verify/${paymentIntentId}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying stripe payment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify payment'
      };
    }
  },

  // Create Klarna Session
  createKlarnaSession: async (data) => {
    try {
      const response = await api.post(`${PAYMENT_API}/klarna/create-session`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating Klarna session:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create Klarna session'
      };
    }
  },

  // Verify Klarna Payment
  verifyKlarnaPayment: async (orderId) => {
    try {
      const response = await api.get(`${PAYMENT_API}/klarna/verify/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying Klarna payment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify Klarna payment'
      };
    }
  }
};
