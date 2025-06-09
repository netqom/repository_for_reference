// services/trade-professionals
import { createApiService } from "./commonService"

const MEASUREMENT_UNIT_ENDPOINT = "/product/measurement-units/all"

export const measurementUnit = createApiService(MEASUREMENT_UNIT_ENDPOINT)
