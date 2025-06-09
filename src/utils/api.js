import axios from "axios";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";

import { authOptions } from "@/libs/auth";

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Get common headers including Authorization
const getCommonHeaders = async () => {
  const session = await getServerSession(authOptions);

  const headers = {
    authorization: session?.access_token ? `Bearer ${session.access_token}` : "",
    'Accept': 'application/json',
  };


  return headers;
};

// Generic API request using Axios
const apiRequest = async (endpoint, method, data = null, customHeaders = {}, showToastOnError = true) => {
  try {

    // console.log(endpoint, 'endpoint');

    const headers = {
      ...(await getCommonHeaders()), // 👈 Skip Content-Type if FormData
      ...customHeaders,
    };

    const RESOURCE_URL = API_BASE_URL;
    const REQUEST_URL = RESOURCE_URL + endpoint;

    const config = {
      method: method,
      url: REQUEST_URL,
      headers: headers,
      data: data ?? {},
      withCredentials: true,
    };

    if (method == 'DELETE') {
      delete config.data;
    }

    // // console.log('.......headers test', headers);
    // // console.log(REQUEST_URL, 'REQUEST_URLREQUEST_URL');
    // // console.log(data, 'data');

    const response = await axios(config);

    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message,
      statusCode: response.status,
    };

  } catch (error) {

    const statusCode = error?.response?.status || 500;
    const errorData = error?.response?.data || {};
    const errorMessage = errorData?.message || error.message;

    return {
      success: false,
      data: errorData?.data || null,
      error: errorData?.error || errorMessage,
      message: errorMessage,
      statusCode: statusCode,
    };
  }
};

// Exported API methods
export const api = {
  get: (endpoint, customHeaders, showToastOnError) => apiRequest(endpoint, "GET", null, customHeaders, showToastOnError),
  post: (endpoint, data, customHeaders, showToastOnError) => apiRequest(endpoint, "POST", data, customHeaders, showToastOnError),
  put: (endpoint, data, customHeaders, showToastOnError) => apiRequest(endpoint, "PUT", data, customHeaders, showToastOnError),
  patch: (endpoint, data, customHeaders, showToastOnError) => apiRequest(endpoint, "PATCH", data, customHeaders, showToastOnError),
  delete: (endpoint, customHeaders, showToastOnError) => apiRequest(endpoint, "DELETE", null, customHeaders, showToastOnError),
};

