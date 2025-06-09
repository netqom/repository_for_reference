'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

import PreviewCard from './PreviewCard'
import { useDispatch } from 'react-redux'
import { useEffect, useState } from 'react';
import { getOrderDetails } from '@/app/server/order';
import { Box, CircularProgress } from '@mui/material';
import { callCommonAction } from '@/redux-store/slices/common'

const Preview = ({ orderId }) => {
  // console.log(orderId,'orderIdorderId')
  // Handle Print Button Click
  const handleButtonClick = () => {
    window.print()
  }

  const dispatch = useDispatch()
  const [data, setData] = useState([])

  useEffect(() => {
    fetchOrderDetails(orderId)
  }, [orderId])

  const fetchOrderDetails = async orderId => {
    try {
      dispatch(callCommonAction({ loading: true }))
      const response = await getOrderDetails(orderId)
      // console.log(response,'responseresponse')
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
      <Grid spacing={6}>
        <Grid size={{ xs: 12, md: 9 }}>
          <PreviewCard invoiceData={data} />
        </Grid>
        {/* <Grid size={{ xs: 12, md: 3 }}>
          <PreviewActions id={id} onButtonClick={handleButtonClick} />
        </Grid> */}
      </Grid>
    )
  }
}

export default Preview
