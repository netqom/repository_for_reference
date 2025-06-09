'use client'

// React Imports
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import { styled } from '@mui/material/styles'

// Component Imports
import CustomInputHorizontal from '@core/components/custom-inputs/Horizontal'
import AddressSearch from '@/views/pages/wizard-examples/checkout/AddressSearch'
import { addAddress, updateAddress } from '@/app/server/actions'
import { fetchUserAddresses } from '@/app/front-pages/checkout/page'

// Vars
const countries = ['Select Country', 'France', 'Russia', 'China', 'UK', 'US']

const initialAddressData = {
  firstName: '',
  lastName: '',
  country: '',
  address1: '',
  address2: '',
  landmark: '',
  city: '',
  state: '',
  zipCode: ''
}

// Styled Components
const Title = styled(Typography, {
  name: 'MuiCustomInputVertical',
  slot: 'title'
})(({ theme }) => ({
  letterSpacing: '0.15px',
  fontWeight: theme.typography.fontWeightMedium
}))

const customInputData = [
  // {
  //   title: (
  //     <Title component='div' className='flex items-center gap-1'>
  //       <i className='ri-home-4-line text-xl text-textPrimary' />
  //       <Typography color='text.primary' className='font-medium'>
  //         Home
  //       </Typography>
  //     </Title>
  //   ),
  //   content: 'Delivery Time (7am - 9pm)',
  //   value: 'home',
  //   isSelected: true
  // },
  // {
  //   title: (
  //     <Title component='div' className='flex items-center gap-1'>
  //       <i className='ri-building-4-line text-xl text-textPrimary' />
  //       <Typography color='text.primary' className='font-medium'>
  //         Office
  //       </Typography>
  //     </Title>
  //   ),
  //   content: 'Delivery Time (10am - 6pm)',
  //   value: 'office'
  // },
  {
    title: (
      <Title component='div' className='flex items-center gap-1'>
        <i className='ri-warehouse-line text-xl text-textPrimary' />
        <Typography color='text.primary' className='font-medium'>
          Warehouse
        </Typography>
      </Title>
    ),
    content: 'Delivery Time (8am - 8pm)',
    value: 'Warehouse'
  },
  {
    title: (
      <Title component='div' className='flex items-center gap-1'>
        <i className='ri-file-text-line text-xl text-textPrimary' />
        <Typography color='text.primary' className='font-medium'>
          Billing
        </Typography>
      </Title>
    ),
    content: 'Delivery Time (9am - 5pm)',
    value: 'Billing'
  },
  {
    title: (
      <Title component='div' className='flex items-center gap-1'>
        <i className='ri-truck-line text-xl text-textPrimary' />
        <Typography color='text.primary' className='font-medium'>
          Shipping
        </Typography>
      </Title>
    ),
    content: 'Delivery Time (7am - 10pm)',
    value: 'Shipping'
  }
];


const AddEditAddress = ({ open, setOpen, data, onSuccess }) => {
  const initialSelected = customInputData?.find(item => item.isSelected)?.value || ''
  const [selected, setSelected] = useState(initialSelected)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle address type change
  const handleChange = prop => {
    if (typeof prop === 'string') {
      setValue('address.type', prop)
      setSelected(prop)
    } else {
      setSelected(prop.target.value)
      setValue('address.type', prop.target.value)
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      address: {
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        type: 'Warehouse',
        isDefault: false,
        label: 'General',
        lat: '',
        long: ''
      }
    }
  })

  useEffect(() => {
    if (data) {
      reset({
        address: {
          _id: data._id,
          name: data.name,
          phone: data.phone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          street: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          type: data.type,
          isDefault: data.isDefault,
          label: data.label,
          lat: data.lat,
          long: data.long
        }
      })
      setSelected(data.type)
    }
  }, [data, reset])

  const handleClose = () => {
    reset()
    // if (onClose) {
    //   onClose()
    // }
    setOpen(false)
  }

  const onSubmit = async (formData) => {
    try {
      setIsSubmitting(true)
      let response

      const updatedFormData = {
        address: {
          ...formData.address,
          location: {
            type: 'Point',
            coordinates: [
              parseFloat(formData.address.long),
              parseFloat(formData.address.lat)
            ]
          }
        }
      }

      if (formData.address._id) {
        // Update existing address
        response = await updateAddress(formData.address._id, updatedFormData)
      } else {
        // Create new address
        response = await addAddress(updatedFormData)
      }

      if (response.success) {
        if (onSuccess) {
          await onSuccess(response)
        }
        setOpen(false);
      }
    } catch (error) {
      console.error('Error saving address:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddressSelect = (selectedAddress) => {
    setValue('address.addressLine1', selectedAddress.addressLine1)
    setValue('address.addressLine2', selectedAddress.addressLine2)
    setValue('address.city', selectedAddress.city)
    setValue('address.state', selectedAddress.state)
    setValue('address.postalCode', selectedAddress.postalCode)
    setValue('address.country', selectedAddress.country)
    setValue('address.lat', selectedAddress.lat)
    setValue('address.long', selectedAddress.long)
    setValue('address.street', selectedAddress.addressLine1) // Using addressLine1 as street
  }

  // console.log(JSON.stringify(data), 'datadatadata');

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      scroll='body'
      TransitionProps={{ unmountOnExit: true }}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {data ? 'Edit Address' : 'Add New Address'}
        <Typography component='span' className='flex flex-col text-center'>
          {data ? 'Edit Address for future billing' : 'Add address for billing address'}
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='pbs-0 sm:pli-16'>
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>
          <Grid container spacing={5}>
            {customInputData.map((item, index) => (
              <Grid size={{ xs: 12, sm: 4 }} key={index}>
                <CustomInputHorizontal
                  key={index}
                  type='radio'
                  name='addressType'
                  selected={selected}
                  data={item}
                  handleChange={handleChange}
                />
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('address.name', { required: 'Name is required' })}
                error={Boolean(errors?.address?.name)}
                helperText={errors?.address?.name?.message}
                fullWidth
                label='Full Name'
                placeholder='John'
              />

            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('address.phone', { required: 'Phone is required' })}
                error={Boolean(errors?.address?.phone)}
                helperText={errors?.address?.phone?.message}
                fullWidth
                label='Phone Number'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 12 }}>
              <AddressSearch onAddressSelect={handleAddressSelect} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('address.addressLine1', { required: 'Address Line 1 is required' })}
                error={Boolean(errors?.address?.addressLine1)}
                helperText={errors?.address?.addressLine1?.message}
                fullWidth
                label='Address Line 1'
                placeholder='Street address'
                InputLabelProps={{
                  shrink: Boolean(watch('address.addressLine1')) // Float label only if there's a value
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('address.addressLine2')}
                error={Boolean(errors?.address?.addressLine2)}
                helperText={errors?.address?.addressLine2?.message}
                fullWidth
                label='Address Line 2'
                placeholder='Apartment, suite, etc. (optional)'
                InputLabelProps={{
                  shrink: Boolean(watch('address.addressLine2')) // Float label only if there's a value
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                {...register('address.city', { required: 'City is required' })}
                error={Boolean(errors?.address?.city)}
                helperText={errors?.address?.city?.message}
                fullWidth
                label='City'
                placeholder='City'
                InputLabelProps={{
                  shrink: Boolean(watch('address.city')) // Float label only if there's a value
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                {...register('address.state', { required: 'State is required' })}
                error={Boolean(errors?.address?.state)}
                helperText={errors?.address?.state?.message}
                fullWidth
                label='State/Province'
                placeholder='State or Province'
                InputLabelProps={{
                  shrink: Boolean(watch('address.state')) // Float label only if there's a value
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                {...register('address.postalCode', { required: 'Postal code is required' })}
                error={Boolean(errors?.address?.postalCode)}
                helperText={errors?.address?.postalCode?.message}
                fullWidth
                label='Postal Code'
                placeholder='Postal/ZIP code'
                InputLabelProps={{
                  shrink: Boolean(watch('address.postalCode')) // Float label only if there's a value
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('address.country', { required: 'Country is required' })}
                error={Boolean(errors?.address?.country)}
                helperText={errors?.address?.country?.message}
                fullWidth
                label='Country'
                placeholder='Country'
                InputLabelProps={{
                  shrink: Boolean(watch('address.country')) // Float label only if there's a value
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    {...register('address.isDefault')}
                    defaultChecked={watch('address.isDefault')}
                  />
                }
                label='Set as default address'
              />
            </Grid>
          </Grid>


          <Grid container spacing={2}>



          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='outlined' color='secondary' disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : data ? 'Update' : 'Save'} Address
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddEditAddress



