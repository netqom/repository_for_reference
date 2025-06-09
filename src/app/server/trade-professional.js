'use server';

import {
     tradeProfessionalService,
     userTradeProfessionalBusiness,
     userTradeProfessionalBusinessProfile,
     userTradeProfessionalClientService,
     userTradeProfessionalPassword,
     userProfile,
     userTradeProfessionalService
} from "@/services/trade-professionals";

export const getTradeProfessionalDetails = async (userId) => {
     return await tradeProfessionalService.getById(userId);
};

export const createTradeProfessional = async (data) => {
     return await userTradeProfessionalService.create(data);
};

export const updateTradeProfessional = async (id, data) => {
     return await userTradeProfessionalService.update(id, data);
};

export const verifyTradProfessionalEmail = async (token, subPath, data) => {
     return await userTradeProfessionalService.patch(token, subPath, data);
};

export const updateBusinessProfileStatus = async (id, subPath, data) => {
     return await userTradeProfessionalBusinessProfile.patch(id, subPath, data);
};

export const updateBusinessStatus = async (id, subPath, data) => {
     return await userTradeProfessionalBusiness.patch(id, subPath, data);
};

/* API for B2B Trade Professionals */
export const fetchDashboardData = async () => {
     return await userTradeProfessionalService.getRawData();

};
export const changeTradeProfessionalPassword = async (id, data) => {
     return await userTradeProfessionalPassword.update(id, data);
};

export const updateProfile = async (id, data) => {
     return await userProfile.update(id, data);
};

export const addBankAccountForTradeProfessional = async (data) => {
     return await userTradeProfessionalService.addBankAccountForTradeProfessional(data);
};

export const getStripeAccountStatus = async (data) => {
     return await userTradeProfessionalService.getStripeAccountStatus(data);
};

export const reVerifyStripeAccount = async (data) => {
     return await userTradeProfessionalService.reVerifyStripeAccount(data);
};

export const payoutProcess = async (data) => {
     return await userTradeProfessionalService.payoutProcess(data);
};


/* API for B2C Trade Professionals  Client */

export const createTradeProfessionalClient = async (data) => {
     return await userTradeProfessionalClientService.create(data);
};

export const getTradeProfessionalClientList = async (currentPage, rowsPerPage, searchTerm, filteredData) => {
     return await userTradeProfessionalClientService.get(currentPage, rowsPerPage, searchTerm, filteredData);
};

export const deleteTradeProfessionalClient = async (id) => {
     return await userTradeProfessionalClientService.delete(id);
};

export const updateTradeProfessionalClient = async (id, data) => {
     return await userTradeProfessionalClientService.update(id, data);
};

/** End API for B2C Trade Professionals  Client */
