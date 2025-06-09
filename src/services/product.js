// services/trade-professionals
import { createApiService } from "./commonService"

const PRODUCT_ENDPOINT = "/product"
const PRODUCT_EXPORT_ENDPOINT = "/product/export/csv"
const PRODUCT_FRONT_LIST_ENDPOINT = "/product/front-list"

export const productServices = createApiService(PRODUCT_ENDPOINT)
export const productFrontListServices = createApiService(PRODUCT_FRONT_LIST_ENDPOINT)
export const productExportServices = createApiService(PRODUCT_EXPORT_ENDPOINT)
