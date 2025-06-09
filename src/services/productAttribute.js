// services/trade-professionals
import { createApiService } from "./commonService"

const PRODUCTS_ATTRIBUTE_ENDPOINT = "/product/attribute"
const PRODUCTS_ATTRIBUTE_ENDPOINT_LIST = "/product/attribute/list"

export const productAttribute = createApiService(PRODUCTS_ATTRIBUTE_ENDPOINT)

export const productAttributeList = createApiService(PRODUCTS_ATTRIBUTE_ENDPOINT_LIST)
