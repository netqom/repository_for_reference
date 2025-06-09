// services/commonService.js
import { api } from "@/utils/api";

export const createApiService = (baseEndpoint, customMethods = {}) => {
  const defaultService = {


    // Get all items with pagination, search string and filters
    get: async (page = 1, limit = 10, searchString = "", filter = {}) => {
      // console.log('baseEndpoint', baseEndpoint);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filter,
        ...(searchString ? { search_string: searchString } : {}),
      }).toString();

      return api.get(`${baseEndpoint}?${queryParams}`, {}, false);
    },

    getAll: async () => {
      // console.log(baseEndpoint,'baseEndpointbaseEndpoint')
      return api.get(`${baseEndpoint}`, {}, false);
    },
    getByParamsIfUrlHasId: async (id, page = 1, limit = 10, searchString = "", filter = {}) => {
      // console.log('baseEndpoint', baseEndpoint);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filter,
        ...(searchString ? { search_string: searchString } : {}),
      }).toString();

      // If `id` is present, append it to the URL path
      const url = id ? `${baseEndpoint}/${id}?${queryParams}` : `${baseEndpoint}?${queryParams}`;

      return api.get(url, {}, false);
    },


    // Get item by ID
    getById: async (id) => {
      return api.get(`${baseEndpoint}/${id}`, {}, false);
    },

    // Get raw data without pagination or filters
    getRawData: async (data = {}) => {
      // console.log('baseEndpoint', baseEndpoint);
      return api.get(`${baseEndpoint}`, data, false);
    },

    create: async (data) => {
      // console.log('baseEndpoint', baseEndpoint);
      return api.post(baseEndpoint, data);
    },


    // Update an item
    update: async (id, data) => {
      // console.log('baseEndpoint', baseEndpoint);
      return api.put(`${baseEndpoint}/${id}`, data);
    },

    // Delete an item
    delete: async (id) => {
      // console.log('baseEndpoint', baseEndpoint);
      return api.delete(`${baseEndpoint}/${id}`);
    },

    // Patch sub-resource or partial update
    patch: async (id, subPath, data) => {
      // console.log('baseEndpoint', baseEndpoint);
      return api.patch(`${baseEndpoint}/${id}/${subPath}`, data);
    },
  };

  // Merge and return with overrides or new methods
  return {
    ...defaultService,
    ...customMethods,
  };
};
