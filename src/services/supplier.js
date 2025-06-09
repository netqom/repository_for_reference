import { api } from "@/utils/api";


const TEAM_MEMBERS_ENDPOINT = "/admin/supplier"

export const supplierService = {
  // Get all team members with pagination
  get: async (page = 1, limit = 10, search_string = "",filter) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filter,
      ...(search_string ? { search_string } : {}),
    }).toString()

    return api.get(`${TEAM_MEMBERS_ENDPOINT}?${queryParams}`, {}, false)
  },

  // Get a single team member by ID
  getById: async (id) => {
    return api.get(`${TEAM_MEMBERS_ENDPOINT}/${id}`, {}, false)
  },

  // Create a new team member
  create: async (data) => {
    return api.post(TEAM_MEMBERS_ENDPOINT, data)
  },

  // Update an existing team member
  update: async (id, data) => {
    return api.put(`${TEAM_MEMBERS_ENDPOINT}/${id}`, data)
  },

  // Delete a team member
  delete: async (id) => {
    return api.delete(`${TEAM_MEMBERS_ENDPOINT}/${id}`)
  },

  // Update team member status
  updateStatus: async (id, status) => {
    return api.patch(`${TEAM_MEMBERS_ENDPOINT}/${id}/status`, { status })
  },
}
