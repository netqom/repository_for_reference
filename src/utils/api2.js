import axios from "axios";
import { getSession } from "next-auth/react";

const RESOURCE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api2 =   () => {



    const sendRequest = async (endpoint, method = 'GET', body = null) => {
      const session = await getSession();

      // console.log(
        session,'session'
      );

        if (!session?.access_token) {
            throw new Error('No access token available');
        }

        const authHeader = {
            'Authorization': `Bearer ${session.access_token}`,
            'Accept': 'application/json'
        };

        const REQUEST_URL = RESOURCE_URL + endpoint;

        const requestOptions = {
            method: method,
            url: REQUEST_URL,
            headers: authHeader,
        };

        if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
            requestOptions.data = body;
        } else if (method === 'GET') {
            requestOptions.params = body;
        }

        if (method === 'GET' && endpoint.includes('download-scope-appointment-pdf')) {
            requestOptions.responseType = 'blob';
        }

        try {
            const response = await axios(requestOptions);


return response.data;
        } catch (error) {
            console.error('API request failed', error);
            throw error;
        }
    };

    return { sendRequest };
};
