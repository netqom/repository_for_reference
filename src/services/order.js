// services/trade-professionals
import { createApiService } from "./commonService";

const ORDER_ENDPOINT = "/order";

export const orderServices = createApiService(ORDER_ENDPOINT);
