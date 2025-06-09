// services/trade-professionals
import { createApiService } from "./commonService"
 

const CART_ENDPOINT = "/cart"
const PAYMENT_ENDPOINT = "/payment"

const baseCartService = createApiService(CART_ENDPOINT)
const basePaymentService = createApiService(PAYMENT_ENDPOINT)

export const cartServices = {
  ...baseCartService,
  
  // Cart specific methods
  addToWishlist: async (data) => {
    return await baseCartService.post('/wishlist/add', data)
  },
  
  applyPromo: async (code) => {
    return await baseCartService.post('/promo/apply', { code })
  },
  
  // Payment methods
  createPaymentIntent: async (data) => {
    return await basePaymentService.post('/stripe/create-payment-intent', data)
  },
  verifyStripePayment: async (paymentIntentId) => {
    return await basePaymentService.get(`/stripe/verify/${paymentIntentId}`)
  },
  
  createKlarnaSession: async (data) => {
    return await basePaymentService.post('/klarna/create-session', data)
  },
  verifyKlarnaPayment: async (orderId) => {
    return await basePaymentService.get(`/klarna/verify/${orderId}`)
  }
}
