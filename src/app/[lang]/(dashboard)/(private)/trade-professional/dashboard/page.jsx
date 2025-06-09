// MUI Imports
import Grid from '@mui/material/Grid2'

// Components Imports
import Award from '@/views/trade-professional/dashboard/Profile'
import WeeklyOverview from '@views/trade-professional/dashboard/WeeklyOverview'
import TotalEarning from '@views/trade-professional/dashboard/TotalEarning'
import LineChart from '@views/trade-professional/dashboard/LineChart'
import DistributedColumnChart from '@views/trade-professional/dashboard/DistributedColumnChart'
import Performance from '@views/trade-professional/dashboard/Performance'
import DepositWithdraw from '@views/trade-professional/dashboard/DepositWithdraw'
import SalesByCountries from '@views/trade-professional/dashboard/SalesByCountries'
import CardStatVertical from '@components/card-statistics/Vertical'
import Orders from '@/views/trade-professional/dashboard/Orders';
import Profile from '@/views/trade-professional/dashboard/Profile';
import { fetchDashboardData } from '@/app/server/trade-professional';
import { CircularProgress } from '@mui/material';
import OrderListTable from '@/views/trade-professional/dashboard/OrderListTable';
import Promotions from '@/views/dashboards/crm/MeetingSchedule';
import { getEcommerceData } from '@/app/server/actions';


export const getDashboardData = async() => {
    const data = await fetchDashboardData();
    return data;
}

const DashboardAnalytics = async() => {
  const dashboardData = await getDashboardData();
  // console.log('dashboardData',dashboardData)
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Profile userData={dashboardData?.data?.user}/>
      </Grid>
      <Grid size={{ xs: 12, md: 8, lg: 8 }}>
        <Orders statusSummary={dashboardData?.data?.statusSummary} />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 7 }}>
      <OrderListTable  />
      </Grid>

      <Grid size={{ xs: 12, md: 4, lg: 5 }}>
      <Promotions  />
      </Grid>
    </Grid>
  )
}

export default DashboardAnalytics
