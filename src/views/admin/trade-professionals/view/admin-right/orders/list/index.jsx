'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import OrderCard from './OrderCard'
import OrderListTable from './OrderListTable'
import { getEcommerceData } from '@/app/server/actions'
import { useState, useEffect } from 'react'

// Fetch data for orders from the provided page
import { orderData as fetchOrderData } from '@/app/[lang]/(dashboard)/(private)/admin/trade-professionals/view/[id]/page'

const OrderList = () => {
  // Local state to store order data
  const [orderData, setOrderData] = useState([])
  useEffect(() => {
    // Fetch order data on component mount
    const loadOrderData = async () => {
      const data = await fetchOrderData()
      setOrderData(data)
    }

    loadOrderData()
  }, []) // Empty dependency array ensures it runs once when the component mounts

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <OrderCard />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <OrderListTable orderData={orderData} />
      </Grid>
    </Grid>
  )
}

export default OrderList
