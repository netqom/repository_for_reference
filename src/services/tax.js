import { api } from "@/utils/api";


const TAX_MANAGEMENT_ENDPOINT = "/admin/tax";

export const taxService = {
  // Get all categories with pagination
  get: async (page = 1, limit = 10, search_string = "", filter) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filter,
      ...(search_string ? { search_string } : {}),
    }).toString();

    return api.get(`${TAX_MANAGEMENT_ENDPOINT}?${queryParams}`, {}, false);
  },

  // Get a single category by ID
  getById: async (id) => {
    return api.get(`${TAX_MANAGEMENT_ENDPOINT}/${id}`, {}, false);
  },

  // Create a new category
  create: async (data) => {
    return api.post(TAX_MANAGEMENT_ENDPOINT, data);
  },

  // Update an existing category
  update: async (id, data) => {
    return api.put(`${TAX_MANAGEMENT_ENDPOINT}/${id}`, data);
  },

  // Delete a category
  delete: async (id) => {
    return api.delete(`${TAX_MANAGEMENT_ENDPOINT}/${id}`);
  },

  // Update category status
  updateStatus: async (id, status) => {
    return api.patch(`${TAX_MANAGEMENT_ENDPOINT}/${id}/status`, { status });
  },
};
