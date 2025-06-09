'use client'

// React Imports
import React, { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

// React Hook Form Imports
import { useFormContext, Controller } from 'react-hook-form'

import {
  Autocomplete,
  Box,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Switch,
  Typography
} from '@mui/material'

const SampleOrder = ({ sampleData }) => {
  const { control, watch, setValue } = useFormContext()
  const allowSample = watch('allowSample')
  const isSmallSampleFree = watch('samples.small.freePerMonth')

  // Initialize form values when component mounts or when sampleData changes
  useEffect(() => {
    if (sampleData && Object.keys(sampleData).length > 0) {
      // Enable sample switch if sample data exists
      setValue('allowSample', true)

      // Set small sample values
      if (sampleData.small) {
        setValue('samples.small.freePerMonth', sampleData.small.freePerMonth)
        setValue('samples.small.price', sampleData.small.freePerMonth ? 0 : sampleData.small.price)
      }

      // Set large sample value
      if (sampleData.large) {
        setValue('samples.large.price', sampleData.large.price)
      }

      // Set full sample value
      if (sampleData.full) {
        setValue('samples.full.price', sampleData.full.price)
      }
    }
  }, [sampleData, setValue])

  // Effect to handle price when free/paid selection changes
  useEffect(() => {
    if (isSmallSampleFree) {
      setValue('samples.small.price', 0)
    }
  }, [isSmallSampleFree, setValue])

  return (
    <Card>
      <CardContent>
        <div className='flex justify-between items-center'>
          <CardHeader className='px-0' title='Sample Order' />

          <Controller
            name='allowSample'
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    {...field}
                    checked={field.value}
                    onChange={e => field.onChange(e.target.checked)}
                    color='primary'
                  />
                }
                label='Allow Sample'
              />
            )}
          />
        </div>

        {allowSample && (
          <Box mt={2} display='flex' flexDirection='column' gap={3}>
            {/* Small Sample (Radio: Free or Not) */}
            <Box>
              <Typography fontWeight={600}>15x15cm Sample</Typography>
              <Controller
                name='samples.small.freePerMonth'
                control={control}
                defaultValue={true}
                render={({ field }) => (
                  <FormControl component='fieldset'>
                    <RadioGroup
                      row
                      {...field}
                      value={field.value ? 'free' : 'paid'}
                      onChange={e => field.onChange(e.target.value === 'free')}
                    >
                      <FormControlLabel value='free' control={<Radio />} label='Free' />
                      <FormControlLabel value='paid' control={<Radio />} label='Paid' />
                    </RadioGroup>
                  </FormControl>
                )}
              />

              <Controller
                name='samples.small.price'
                control={control}
                defaultValue={0}
                rules={{
                  validate: value => {
                    if (!isSmallSampleFree && (!value || Number(value) <= 0)) {
                      return 'Enter a price for paid sample'
                    }
                    return true
                  }
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label='Price (if Paid)'
                    type='number'
                    fullWidth
                    sx={{ mt: 1 }}
                    disabled={isSmallSampleFree}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Box>

            {/* Large Sample */}
            <Box>
              <Typography fontWeight={600}>60x60cm Sample</Typography>
              <Controller
                name='samples.large.price'
                control={control}
                defaultValue=''
                rules={{
                  required: 'Price is required',
                  validate: value => Number(value) > 0 || 'Price must be greater than 0'
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label='Price'
                    type='number'
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Box>

            {/* Full Size Sample */}
            <Box>
              <Typography fontWeight={600}>Full Size Sample</Typography>
              <Controller
                name='samples.full.price'
                control={control}
                defaultValue=''
                rules={{
                  required: 'Price is required',
                  validate: value => Number(value) > 0 || 'Price must be greater than 0'
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label='Price'
                    type='number'
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default SampleOrder
