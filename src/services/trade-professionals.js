// services/trade-professionals
import { createApiService } from "./commonService";
import { api } from "@/utils/api";

// Define the endpoints
const TRADE_PROFESSIONALS_ENDPOINT = "/admin/trade-professional";
const USER_TRADE_PROFESSIONALS_ENDPOINT = "/user/trade-professional";
const USER_TRADE_PROFESSIONALS_CLIENT_ENDPOINT = "/user/trade-professional/client";
const USER_TRADE_PROFESSIONALS_PASSWORD_ENDPOINT = "/profile/password";
const USER_PROFILE_ENDPOINT = "/profile";
const TRADE_PROFESSIONALS_BUSINESS_USER_PROFILE_ENDPOINT = "/admin/trade-professional/business-profile";
const TRADE_PROFESSIONALS_BUSINESS_ENDPOINT = "/admin/trade-professional/business";



// Create API services for each endpoint
export const tradeProfessionalService = createApiService(TRADE_PROFESSIONALS_ENDPOINT);
export const userTradeProfessionalClientService = createApiService(USER_TRADE_PROFESSIONALS_CLIENT_ENDPOINT);
export const userTradeProfessionalPassword = createApiService(USER_TRADE_PROFESSIONALS_PASSWORD_ENDPOINT);
export const userTradeProfessionalBusinessProfile = createApiService(TRADE_PROFESSIONALS_BUSINESS_USER_PROFILE_ENDPOINT);
export const userTradeProfessionalBusiness = createApiService(TRADE_PROFESSIONALS_BUSINESS_ENDPOINT);
export const userProfile = createApiService(USER_PROFILE_ENDPOINT);
export const userTradeProfessionalService = createApiService(USER_TRADE_PROFESSIONALS_ENDPOINT, {

  getClientById: async (id) => {
    return await api.get(`${USER_TRADE_PROFESSIONALS_ENDPOINT}/client-public/${id}`);
  },
  addBankAccountForTradeProfessional: async (data) => {
    return await api.post(`${USER_TRADE_PROFESSIONALS_ENDPOINT}/create-connect-account`, data);
  },
  getStripeAccountStatus: async () => {
    return await api.get(`${USER_TRADE_PROFESSIONALS_ENDPOINT}/stripe-account-status`);
  },
  reVerifyStripeAccount: async () => {
    return await api.post(`${USER_TRADE_PROFESSIONALS_ENDPOINT}/stripe-account-reverify`);
  },
  payoutProcess: async (data) => {
    return await api.post(`${USER_TRADE_PROFESSIONALS_ENDPOINT}/payout-process`, data);
  },
  getAllClients: async () => {
    return await api.get(`${USER_TRADE_PROFESSIONALS_ENDPOINT}/client/all`);
  },
});


