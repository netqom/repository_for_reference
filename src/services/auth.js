'use server';

import { api } from "@/utils/api";

const AUTH_ENDPOINT = "/admin/forgot-password";
const AUTH_RESET_ENDPOINT = "/admin/reset-password";


// Export async functions directly instead of wrapping them in an object

export async function forgotPasswordApi(email) {
  try {
    const response = await api.post(`${AUTH_ENDPOINT}/`, { email });
    return response.data;
  } catch (error) {
    throw error?.response || error;
  }

}

export async function resetPasswordApi(data) {
  try {
    const response = await api.post(`${AUTH_RESET_ENDPOINT}/`, data);
    return response.data;
  } catch (error) {
    throw error?.response || error;
  }
}
