// services/trade-professionals
import { createApiService } from "./commonService";

const SUPPORT_TICKET_ENDPOINT = "/support-ticket";

export const supportTicketServices = createApiService(SUPPORT_TICKET_ENDPOINT);
