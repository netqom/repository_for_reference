// services/trade-professionals
import { createApiService } from "./commonService";

const PRODUCTS_VARIATION_ENDPOINT = "/product/variation";

export const productVariation = createApiService(PRODUCTS_VARIATION_ENDPOINT);

