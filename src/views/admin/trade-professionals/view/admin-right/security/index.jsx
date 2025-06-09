'use client';

import Grid from '@mui/material/Grid2';
import { useEffect, useState } from 'react';
import ChangePassword from './ChangePassword';
import AddBankAccount from './AddBankAccount';
import AdminSettings from './AdminSettings';
import { checkUserRoleIsAdmin } from '@/components/common/userRole';

const SecurityTab = ({ userId }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyRole = async () => {
      const isAdminUser = await checkUserRoleIsAdmin();
      setIsAdmin(isAdminUser);
    };

    verifyRole();
  }, []);

  return (
    <Grid container spacing={6}>
      {isAdmin && (
        <Grid size={{ xs: 12 }}>
          <AdminSettings />
        </Grid>
      )}
      {!isAdmin && (
        <Grid size={{ xs: 12 }}>
          <AddBankAccount />
        </Grid>
      )}
      <Grid size={{ xs: 12 }}>
        <ChangePassword userId={userId} />
      </Grid>
    </Grid>
  );
};

export default SecurityTab;
