// services/trade-professionals
import { createApiService } from "./commonService"

const PRODUCT_RAW_DATA_ENDPOINT = "/product/raw/data"

export const productRawDataServices = createApiService(PRODUCT_RAW_DATA_ENDPOINT)
