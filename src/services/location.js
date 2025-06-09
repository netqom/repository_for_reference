'use server'

import { api } from "@/utils/api";

const LOCATION_ENDPOINT = "/location";

// Export async functions directly instead of wrapping them in an object

export async function getCountries() {
  return api.get(`${LOCATION_ENDPOINT}/countries`, {}, false);
}

export async function getStatesByCountry(countryId) {
  return api.get(`${LOCATION_ENDPOINT}/states/${countryId}`, {}, false);
}

export async function getCitiesByState(stateId) {
  return api.get(`${LOCATION_ENDPOINT}/cities/${stateId}`, {}, false);
}
