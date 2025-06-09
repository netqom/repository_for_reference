'use client'

import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid2'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomInputHorizontal from '@core/components/custom-inputs/Horizontal'
import DirectionalIcon from '@components/DirectionalIcon'

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'

// Data
const cardData = [
  {
    title: (
      <div className='flex items-center gap-4'>
        <Avatar
          variant='rounded'
          className='is-[58px] bs-[34px]'
          sx={theme => ({
            backgroundColor: 'var(--mui-palette-action-hover)',
            ...theme.applyStyles('dark', {
              backgroundColor: 'var(--mui-palette-common-white)'
            })
          })}
        >
          <img src='/images/logos/visa.png' alt='plan' className='bs-3' />
        </Avatar>
        <Typography color='text.primary'>Credit Card</Typography>
      </div>
    ),
    value: 'credit-card',
    isSelected: true
  },
  {
    title: (
      <div className='flex items-center gap-4'>
        <Avatar
          variant='rounded'
          className='is-[58px] bs-[34px]'
          sx={theme => ({
            backgroundColor: 'var(--mui-palette-action-hover)',
            ...theme.applyStyles('dark', {
              backgroundColor: 'var(--mui-palette-common-white)'
            })
          })}
        >
          <img src='/images/logos/paypal.png' alt='plan' className='bs-5' />
        </Avatar>
        <Typography color='text.primary'>Paypal</Typography>
      </div>
    ),
    value: 'paypal'
  }
]

const countries = ['Australia', 'Brazil', 'Canada', 'India', 'United Arab Emirates', 'United Kingdom', 'United States']

const PaymentPageClient = ({ initialData }) => {
  // States
  const [selectCountry, setSelectCountry] = useState('')
  const [selectInput, setSelectInput] = useState('credit-card')
  const [error, setError] = useState(null)
  const cartData = initialData?.data

  const handleCountryChange = event => {
    setSelectCountry(event.target.value)
  }

  const handlePaymentChange = prop => {
    if (typeof prop === 'string') {
      setSelectInput(prop)
    } else {
      setSelectInput(prop.target.value)
    }
  }

  if (!initialData?.success) {
    return (
      <div className="p-4">
        <Alert severity="error">{initialData?.message || 'Failed to load cart data'}</Alert>
      </div>
    )
  }

  if (!cartData) {
    return (
      <div className="p-4">
        <Alert severity="warning">Cart not found or has expired</Alert>
      </div>
    )
  }

  return (
    <section className={classnames('md:plb-[100px] plb-6', frontCommonStyles.layoutSpacing)}>
      <Card>
        <Grid container>
          <Grid size={{ md: 12, lg: 7 }}>
            <CardContent className='flex flex-col max-sm:gap-y-5 gap-y-8 sm:p-8 border-be lg:border-be-0 lg:border-e bs-full'>
              <div className='flex flex-col gap-2'>
                <Typography variant='h4'>Complete Your Payment</Typography>
                <Typography>
                  Please select your payment method and fill in the required details to complete your purchase.
                </Typography>
              </div>
              <Grid container spacing={5}>
                {cardData.map((item, index) => (
                  <CustomInputHorizontal
                    key={index}
                    type='radio'
                    name='payment-method'
                    data={item}
                    selected={selectInput}
                    handleChange={handlePaymentChange}
                    gridProps={{ size: { xs: 12, sm: 6 } }}
                  />
                ))}
              </Grid>
              <div>
                <Typography variant='h4' className='mbe-6'>
                  Billing Details
                </Typography>
                <Grid container spacing={5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      fullWidth 
                      label='Email Address' 
                      defaultValue={cartData.clientEmail || ''} 
                      type='email' 
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel id='country-select-label'>Billing Country</InputLabel>
                      <Select
                        labelId='country-select-label'
                        id='country-select'
                        value={selectCountry}
                        label='Billing Country'
                        onChange={handleCountryChange}
                      >
                        {countries.map(country => (
                          <MenuItem key={country} value={country}>
                            {country}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label='Billing Zip / Postal Code'
                      id='postal-code-input'
                      placeholder='123456'
                      fullWidth
                      type='number'
                    />
                  </Grid>
                </Grid>
              </div>
              {selectInput === 'credit-card' && (
                <div>
                  <Typography variant='h4' className='mbe-6'>
                    Credit Card Info
                  </Typography>
                  <Grid container spacing={5}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        id='card-number-input'
                        placeholder='8763 2345 3478'
                        label='Card Number'
                        type='number'
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth id='card-holder-name' placeholder='John Doe' label='Card Holder' />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField fullWidth id='expiry-date' placeholder='05/2026' label='EXP. date' type='number' />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        fullWidth
                        id='cvv-input'
                        placeholder='123'
                        label='CVV'
                        type='number'
                      />
                    </Grid>
                  </Grid>
                </div>
              )}
            </CardContent>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <CardContent className='flex flex-col gap-6 sm:p-8'>
              <div>
                <Typography variant='h4' className='mbe-4'>
                  Order Summary
                </Typography>
                {cartData.cartItems?.map((item, index) => (
                  <div key={index} className='flex gap-4 items-center mbe-4'>
                    <img
                      width={60}
                      height={60}
                      alt={item.product?.name}
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${item.product?.productFeaturedImage?.filePath}`}
                      className='rounded'
                    />
                    <div className='flex flex-col gap-1'>
                      <Typography>{item.product?.name}</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {item.variation?.name}
                      </Typography>
                      <Typography variant='body2'>
                        Quantity: {item.quantity} SQ.M
                      </Typography>
                      <Typography className='font-medium'>
                        €{(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
              <Divider />
              <div className='flex flex-col gap-4'>
                <div className='flex justify-between'>
                  <Typography color='text.secondary'>Subtotal:</Typography>
                  <Typography>€{cartData.orderSummary?.subtotal.toFixed(2)}</Typography>
                </div>
                <div className='flex justify-between'>
                  <Typography color='text.secondary'>Shipping:</Typography>
                  <Typography>€{cartData.orderSummary?.shipping.toFixed(2)}</Typography>
                </div>
                <Divider />
                <div className='flex justify-between'>
                  <Typography color='text.primary' className='font-medium'>
                    Total:
                  </Typography>
                  <Typography color='text.primary' className='font-medium'>
                    €{cartData.orderSummary?.total.toFixed(2)}
                  </Typography>
                </div>
              </div>
              <Button
                fullWidth
                variant='contained'
                onClick={() => {
                  // Handle payment submission
                }}
                sx={{
                  backgroundColor: '#991b1b',
                  '&:hover': {
                    backgroundColor: '#7f1d1d',
                  },
                }}
              >
                Place Order
              </Button>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </section>
  )
}

export default PaymentPageClient 