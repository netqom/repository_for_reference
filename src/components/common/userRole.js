'use client';
import { getSession } from 'next-auth/react';
import { adminRole } from '@configs/constant';

export async function checkUserRoleIsAdmin() {
  try {
    const session = await getSession();
    const roles = session?.user?.roles?.map(role => role?.id);

    if (roles?.includes(adminRole?.id)) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to check user role:', error);
    return false;
  }
}
