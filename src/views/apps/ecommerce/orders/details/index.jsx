'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import OrderDetailHeader from './OrderDetailHeader'
import OrderDetailsCard from './OrderDetailsCard'
import ShippingActivity from './ShippingActivityCard'
import CustomerDetails from './CustomerDetailsCard'
import ShippingAddress from './ShippingAddressCard'
import BillingAddress from './BillingAddressCard'
import { useEffect, useState } from 'react'
import { callCommonAction } from '@/redux-store/slices/common'
import { useDispatch } from 'react-redux'
import { getOrderDetails } from '@/app/server/order'
import CircularProgress from '@mui/material/CircularProgress'
import { Box } from '@mui/material';

const OrderDetails = ({ orderData, order }) => {
  const dispatch = useDispatch()
  const [data, setData] = useState([])

  useEffect(() => {
    fetchSupportTickets(order)
  }, [order])

  const fetchSupportTickets = async orderId => {
    try {
      dispatch(callCommonAction({ loading: true }))
      const response = await getOrderDetails(orderId)
      dispatch(callCommonAction({ loading: false }))
      if (response.statusCode === 200 && response.data) {
        setData(response.data)
      }
    } catch (error) {
      dispatch(callCommonAction({ loading: false }))
      console.error('Failed to fetch team members', error)
    }
  }


  if (data.length === 0) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' height={200}>
        <CircularProgress />
      </Box>
    )
  } else {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <OrderDetailHeader orderData={orderData} order={order} data={data} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <OrderDetailsCard data={data} />
            </Grid>
            {/* <Grid size={{ xs: 12 }}>
              <ShippingActivity order={order} />
            </Grid> */}
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <CustomerDetails orderData={orderData} data={data}/>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ShippingAddress data={data}/>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <BillingAddress />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

export default OrderDetails
