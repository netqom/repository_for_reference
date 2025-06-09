import { api } from "@/utils/api";


const CATEGORY_ENDPOINT = "/category"

export const categoryService = {
  // Get all categories with pagination
  get: async (page = 1, limit = 10, search_string = "",filter) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filter,
      ...(search_string ? { search_string } : {}),
    }).toString()

    return api.get(`${CATEGORY_ENDPOINT}?${queryParams}`, {}, false)
  },
  getAll: async () => {
    return api.get(`${CATEGORY_ENDPOINT}/cate/all`)
  },

  // Get a single category by ID
  getById: async (id) => {
    return api.get(`${CATEGORY_ENDPOINT}/${id}`, {}, false)
  },

  // Create a new category
  create: async (data) => {
    return api.post(CATEGORY_ENDPOINT, data)
  },

  // Update an existing category
  update: async (id, data) => {
    return api.put(`${CATEGORY_ENDPOINT}/${id}`, data)
  },

  // Delete a category
  delete: async (id) => {
    return api.delete(`${CATEGORY_ENDPOINT}/${id}`)
  },

  // Update category status
  updateStatus: async (id, status) => {
    return api.patch(`${CATEGORY_ENDPOINT}/${id}/status`, { status })
  },
}