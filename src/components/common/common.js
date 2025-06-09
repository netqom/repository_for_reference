import { adminRole, teamMemberRole, tradeProfessionalRole } from "@/configs/constant";
import { getSession } from "next-auth/react";

export async function getDashboardRedirectUrl() {
  const session = await getSession();

  const roleIds = session?.user?.roles?.map(role => role?.id) || [];

  if (roleIds.includes(adminRole.id)) {
    return process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL;
  } else if (roleIds.includes(teamMemberRole.id)) {
    return process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL;
  } else if (roleIds.includes(tradeProfessionalRole.id)) {
    return process.env.NEXT_PUBLIC_TRADE_PROFESSIONAL_DASHBOARD_URL;
  }
  else {
    return null;
  }
}


export const paymentStatus = {
  paid : { text: 'paid', color: 'success', colorClassName: 'text-success' },
  pending : { text: 'pending', color: 'warning', colorClassName: 'text-warning' },
  refunded : { text: 'refunded', color: 'secondary', colorClassName: 'text-secondary' },
  failed : { text: 'failed', color: 'error', colorClassName: 'text-error' }
}
//0=Cancelled, 1 = Delivered, 2= Processing, 3 = New, 4 = Shipped,
export const statusChipColor = {
  0: { text: 'Cancelled', color: 'error', colorClassName: 'text-error' },
  1: { text: 'Delivered', color: 'success', colorClassName: 'text-success' },
  2: { text: 'Processing', color: 'warning', colorClassName: 'text-warning' },
  3: { text: 'New', color: 'info', colorClassName: 'text-info' },
  4: { text: 'Shipped', color: 'secondary', colorClassName: 'text-secondary' }
};
