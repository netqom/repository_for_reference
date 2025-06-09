'use server';
// Next Imports
import dynamic from 'next/dynamic';

// MUI Imports
import Grid from '@mui/material/Grid2';

// Component Imports

// Data Imports
import { getOrderHistory } from '@/app/server/actions';
import UserLeftOverview from '@/views/admin/trade-professionals/view/user-left-overview';
import UserRight from '@/views/admin/trade-professionals/view/user-right';
import { tradeProfessionalService } from '@/services/trade-professionals';

import OverViewTab from '@/views/admin/trade-professionals/view/user-right/overview';
const SecurityTab = dynamic(() => import('@/views/admin/trade-professionals/view/user-right/security'));
const OrderList = dynamic(() => import('@/views/admin/trade-professionals/view/user-right/orders/list'));
// const BillingPlans = dynamic(() => import('@views/apps/user/view/user-right/billing-plans'))
// const NotificationsTab = dynamic(() => import('@views/apps/user/view/user-right/notifications'))
// const ConnectionsTab = dynamic(() => import('@views/apps/user/view/user-right/connections'))

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/pages/pricing` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */
/* const getPricingData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/pages/pricing`)

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
} */

export async function fetchById(id) {
  try {
    return await tradeProfessionalService.getById(id);
  } catch (error) {
    console.error('Failed to fetch Trade Professional', error);
  }
}

export async function update(id, data) {
  try {
    return await tradeProfessionalService.update(id, data);
  } catch (error) {
    console.error('Failed to Update Trade Professional', error);
  }
}

export async function orderData() {
  try {
    return await getOrderHistory();
  } catch (error) {
    console.error('Failed to fetch ecommerce data', error);
  }
}

const UserViewTab = async props => {
  const params = await props.params; // Ensure await if needed (based on error)
  const userId = params?.id;

  const response = await fetchById(userId);
  const data = response?.data;

  const overviewTab = await OverViewTab({ data, params });

  const tabContentList = {
    overview: overviewTab,
    //security: <SecurityTab userId={userId} data={data} />,
    orders: <OrderList />,
  };

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <UserLeftOverview data={data} />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <UserRight tabContentList={tabContentList} data={data}/>
      </Grid>
    </Grid>
  );
};

export default UserViewTab;
