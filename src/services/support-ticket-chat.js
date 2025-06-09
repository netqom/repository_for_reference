// services/trade-professionals
import { createApiService } from "./commonService";

const SUPPORT_TICKET_CHAT_ENDPOINT = "/support-ticket/chat";

export const supportTicketChatServices = createApiService(SUPPORT_TICKET_CHAT_ENDPOINT);
