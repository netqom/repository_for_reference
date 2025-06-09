// hooks/usePermission.js
'use client';

import { useSession } from 'next-auth/react';

const usePermission = (requiredPermission) => {
    const { data: session } = useSession();
    const user = session?.user;

    const roles = user?.roles || [];
    if (!roles.length) return false;

    const hasPermission = roles.some((role) =>
        role?.permissions?.some((perm) => perm?.slug?.trim() === requiredPermission.trim())
    );

    return hasPermission;
};

export default usePermission;
