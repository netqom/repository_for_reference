'use client'

import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  TextField,
  Typography,
  Paper,
  Button
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { toast } from 'react-toastify'
import {
  addAttributesData,
  getAttributesDetails,
  getMeasurementUnits,
  updateAttributesData
} from '@/app/server/attribute'

export default function AttributeForm({ attributeId, onClose, refreshList }) {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      showMeasurementBox: false,
      values: [''],
      measurements: ['cm'],
      variationIds: ['']
    }
  })

  const [variationsToRemove, setVariationsToRemove] = useState([])
  const [measurementUnits, setMeasurementUnits] = useState([])

  // State to manage loading indicator on save button
  const [isLoading, setIsLoading] = useState(false)

  // Watch fields for dynamic lists and checkbox
  const attributeValues = watch('values')
  const attributeMeasurements = watch('measurements')
  const showMeasurementBox = watch('showMeasurementBox')

  // Fetch attribute details for edit mode and reset form fields accordingly
  const fetchAttributesDetails = async id => {
    try {
      const response = await getAttributesDetails(id)
      if (response?.success && response?.data) {
        const attributeData = response.data

        const values = attributeData.variations.map(variation => variation.metaValue)
        const measurements = attributeData.variations.map(variation => variation.measurementUnit?.symbol || '')

        const hasValidValues = values.length > 0 && values.every(val => val?.trim() !== '')
        const hasValidMeasurements = measurements.length > 0 && measurements.every(unit => unit?.trim() !== '')
        const variationIds = attributeData.variations.map(variation => variation._id || '')

        const shouldShowMeasurementBox = hasValidValues && hasValidMeasurements

        reset({
          name: attributeData.name || '',
          showMeasurementBox: shouldShowMeasurementBox,
          values: hasValidValues ? values : [''],
          measurements: hasValidMeasurements ? measurements : ['cm'],
          variationIds: variationIds.length ? variationIds : ['']
        })
      }
    } catch (error) {
      console.error('Failed to fetch attribute details:', error)
    }
  }

  const fetchUnits = async () => {
    try {
      const response = await getMeasurementUnits()
      if (response?.success && response?.data) {
        setMeasurementUnits(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch measurement units:', error)
    }
  }

  // Load attribute details when attributeId changes (edit mode)
  useEffect(() => {
    if (attributeId) {
      fetchAttributesDetails(attributeId)
    }
  }, [attributeId])

  useEffect(() => {
    fetchUnits()
  }, [])

const onSubmit = async formData => {
  setIsLoading(true)

  const showMeasurementBox = formData.showMeasurementBox
  const slug = formData.name.trim().toLowerCase().replace(/\s+/g, '-')

  const variations = formData.values.map((value, index) => {
    const variation = {
      metaKey: slug,
      metaValue: value
    }

    // Handle productMeasurementUnit based on showMeasurementBox state
    if (showMeasurementBox) {
      const selectedSymbol = formData.measurements[index]
      const selectedUnit = measurementUnits.find(unit => unit.symbol === selectedSymbol)
      variation.productMeasurementUnit = selectedUnit?._id || '000000000000000000000002' // fallback ID
    } else if (attributeId) {
      // Explicitly set to null in edit mode if unchecked
      variation.productMeasurementUnit = null
    }

    // Include variation ID if in edit mode
    if (attributeId && formData.variationIds?.[index]) {
      variation._id = formData.variationIds[index]
    }

    return variation
  })

  const formattedAttribute = {
    name: formData.name,
    slug,
    variations,
    variationsToRemove
  }

  try {
    let response
    if (attributeId) {
      response = await updateAttributesData(attributeId, formattedAttribute)
    } else {
      response = await addAttributesData(formattedAttribute)
    }

    if (response?.success) {
      toast.success(`Attribute ${attributeId ? 'updated' : 'saved'} successfully`)
      onClose()
      await refreshList()
    } else if (response?.statusCode === 422 && response?.data) {
      Object.entries(response.data).forEach(([field, message]) => {
        setError(field, { message: message || 'Invalid input' })
      })
    } else {
      toast.warning('Unexpected response. Please check.')
      onClose()
    }
  } catch (error) {
    console.error('Submission error:', error)
    toast.error(`Failed to ${attributeId ? 'update' : 'save'} attribute. Please try again.`)
  } finally {
    setIsLoading(false)
  }
}


  const variationIds = watch('variationIds')

  return (
    <Box py={2}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant='h6'>Attribute</Typography>
          <Box display='flex' flexDirection='column' gap={2} mt={2}>
            {/* Attribute Name Input */}
            <Controller
              name='name'
              control={control}
              rules={{ required: 'Attribute Name is required' }}
              render={({ field }) => (
                <TextField
                  label='Attribute Name'
                  variant='outlined'
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                  {...field}
                />
              )}
            />

            {/* Checkbox to toggle measurement input visibility */}
            <FormControlLabel
              control={
                <Controller
                  name='showMeasurementBox'
                  control={control}
                  render={({ field }) => <Checkbox {...field} checked={field.value} />}
                />
              }
              label='Show Measurement Box'
            />
            {console.lo}

            {/* Dynamic list of attribute values and measurements */}
            {attributeValues.map((value, index) => (
              <Box key={index} display='flex' alignItems='center' gap={2}>
                {/* Controlled input for attribute value */}
                <Controller
                  name={`values.${index}`}
                  control={control}
                  rules={{ required: 'Attribute value is required' }}
                  render={({ field }) => (
                    <TextField
                      label='Attribute Value'
                      fullWidth
                      {...field}
                      error={!!errors?.values?.[index]}
                      helperText={errors?.values?.[index]?.message}
                    />
                  )}
                />

                {/* Controlled select for measurement, shown conditionally */}
                {showMeasurementBox && (
                  <Controller
                    name={`measurements.${index}`}
                    control={control}
                    rules={{ required: 'Measurement is required' }}
                    render={({ field }) => (
                      <TextField
                        select
                        label='Measurement'
                        fullWidth
                        {...field}
                        value={field.value || ''}
                        error={!!errors?.measurements?.[index]}
                        helperText={errors?.measurements?.[index]?.message}
                      >
                        {measurementUnits.map(unit => (
                          <MenuItem key={unit._id} value={unit.symbol}>
                            {unit.name} ({unit.symbol})
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                )}

                {/* Button to remove the current attribute value + measurement */}
                {attributeValues.length > 1 && (
                  <IconButton
                    color='error'
                    onClick={() => {
                      const variationIdToRemove = variationIds[index]
                      if (variationIdToRemove) {
                        // Update state by appending the new ID
                        setVariationsToRemove(prev => [...prev, variationIdToRemove])
                      }
                      const updatedValues = [...attributeValues]
                      const updatedMeasurements = [...attributeMeasurements]
                      updatedValues.splice(index, 1)
                      updatedMeasurements.splice(index, 1)
                      setValue('values', updatedValues)
                      setValue('measurements', updatedMeasurements)
                    }}
                  >
                    <i className='ri-subtract-fill text-xl'></i>
                  </IconButton>
                )}
              </Box>
            ))}

            {/* Button to add a new attribute value + measurement */}
            <Box>
              <IconButton
                color='primary'
                onClick={() => {
                  setValue('values', [...attributeValues, ''])
                  setValue('measurements', [...attributeMeasurements, 'cm'])
                }}
              >
                <i className='ri-add-line text-xl'></i>
              </IconButton>
            </Box>
          </Box>
        </Paper>

        {/* Form action buttons with loading state */}
        <Box display='flex' gap={2}>
          <LoadingButton
            type='submit'
            variant='contained'
            color='primary'
            loading={isLoading}
            loadingIndicator='Saving...'
          >
            Save
          </LoadingButton>

          <Button variant='outlined' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  )
}
