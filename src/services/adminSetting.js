// services/trade-professionals
import { createApiService } from "./commonService";

const ADMIN_SETTINGS_ENDPOINT = "/admin/settings";

export const adminSettingServices = createApiService(ADMIN_SETTINGS_ENDPOINT);
