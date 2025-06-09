'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Typography,
  TextField,
  Switch,
  Card,
  CardHeader,
  CardContent,
  FormHelperText
} from '@mui/material'
import { useFormContext, Controller } from 'react-hook-form'
import Grid from '@mui/material/Grid2'


// Helper to generate Cartesian product variations based on selected attribute values
function generateVariations(selectedAttributeValues) {
  const arrays = Object.values(selectedAttributeValues)
  if (arrays.length === 0 || arrays.some(arr => arr.length === 0)) {
    return []
  }
  const cartesian = arr => arr.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]])
  const combinations = cartesian(arrays)
  return combinations.map(combo => {
    const variation = {}
    Object.keys(selectedAttributeValues).forEach((attr, index) => {
      variation[attr] = combo[index]
    })
    // Add default fields to each variation
    return {
      ...variation,
      description: '',
      stockStatus: 'in_stock',
      stockQuantity: 0,
      allowBackorders: false,
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      regularPrice: 0,
      salePrice: 0,
      purchasedPrice: 0,
      customImageUrl: '',
      image: '',
      // shippingClass: '',
      // taxClass: ''
    }
  })
}

export default function ProductVariants({ productAttributes }) {
  const hasAttributes = productAttributes && productAttributes.length > 0
  const [tabIndex, setTabIndex] = useState(0)
  const [selectedAttributes, setSelectedAttributes] = useState([])
  const [selectedAttributeValues, setSelectedAttributeValues] = useState({})
  const [allAttributes, setAllAttributes] = useState({})

  useEffect(() => {
    if (productAttributes && productAttributes.length > 0) {
      const attributesMap = {}

      productAttributes.forEach(attribute => {
        const name = attribute.name.toLowerCase()
        const values = attribute.variations.map(variation =>
          variation.measurementUnit ? `${variation.metaValue} ${variation.measurementUnit.name}` : variation.metaValue
        )
        attributesMap[name] = values
      })

      setAllAttributes(attributesMap)
    }
  }, [productAttributes])

  // Get RHF methods from context (parent form)
  const { control, watch, reset, setValue } = useFormContext()

  // Watch variations from form context
  const variations = watch('productVariations') || []

  // When selectedAttributes changes, initialize attribute values if not set
  useEffect(() => {
    const initSelectedValues = {}
    selectedAttributes.forEach(attr => {
      initSelectedValues[attr] = selectedAttributeValues[attr] || []
    })
    setSelectedAttributeValues(initSelectedValues)
  }, [selectedAttributes])

  // When selectedAttributeValues changes, generate new variations and update form
  useEffect(() => {
    const newVariations = generateVariations(selectedAttributeValues)
    // Update variations in form context
    setValue('productVariations', newVariations, { shouldValidate: true })
  }, [selectedAttributeValues, setValue])

    useEffect(() => {
      // Collect matched variation IDs based on selected attribute values
      const matchedVariationIds = []

      selectedAttributes.forEach(selectedAttributeName => {
        const lowerCaseName = selectedAttributeName.toLowerCase()

        // Find the corresponding attribute object from productAttributes
        const matchedAttribute = productAttributes.find(
          attr => attr.name.toLowerCase() === lowerCaseName
        )

        if (matchedAttribute) {
          const selectedValues = selectedAttributeValues[lowerCaseName] || []

          matchedAttribute.variations.forEach(variation => {
            const formattedValue = variation.measurementUnit
              ? `${variation.metaValue} ${variation.measurementUnit.name}`
              : variation.metaValue

            if (selectedValues.includes(formattedValue)) {
              matchedVariationIds.push(variation._id)
            }
          })
        }
      })

      // Update attributeVariations in form context with array of variation IDs
      setValue('attributeVariations', matchedVariationIds, { shouldValidate: true })
    }, [selectedAttributes, selectedAttributeValues, productAttributes, setValue])


  // Disable variations tab if no attributes or any attribute has no values selected
  const isVariationsDisabled =
    selectedAttributes.length === 0 || Object.values(selectedAttributeValues).some(vals => vals.length === 0)

  // Handle attribute selection change
  const handleAttributesChange = event => {
    setSelectedAttributes(event.target.value)
  }

  // Handle selected values for each attribute
  const handleAttributeValuesChange = (attributeName, values) => {
    setSelectedAttributeValues(prev => ({
      ...prev,
      [attributeName]: values
    }))
  }


  return (
    <Card>
      <CardHeader
        title='Product Data'
        action={
          <Typography color='primary.main' className='font-medium'>
            Set Product Attribute and Variations
          </Typography>
        }
        sx={{ '& .MuiCardHeader-action': { alignSelf: 'center' } }}
      />
      <CardContent>
        <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
          <Tabs
            orientation='vertical'
            value={tabIndex}
            onChange={(e, newValue) => setTabIndex(newValue)}
            sx={{ borderRight: 1, borderColor: 'divider', minWidth: 180 }}
          >
            <Tab label='Attributes' />
            <Tab label='Variations' disabled={isVariationsDisabled} />
          </Tabs>

          {tabIndex === 0 && (
            <Box sx={{ p: 3, flexGrow: 1 }}>
              <Typography variant='h6' gutterBottom>
                Choose Attributes to Combine
              </Typography>

              <FormControl sx={{ mb: 4, minWidth: 300 }} variant="outlined" margin="normal" error={!hasAttributes}>
                <InputLabel id='select-attributes-label'>Attributes</InputLabel>
                <Select
                  labelId='select-attributes-label'
                  multiple
                  value={selectedAttributes}
                  onChange={handleAttributesChange}
                  input={<OutlinedInput label='Attributes' />}
                  renderValue={selected => selected.join(', ')}
                >
                  {Object.keys(allAttributes).map(attributeName => (
                    <MenuItem key={attributeName} value={attributeName}>
                      <Checkbox checked={selectedAttributes.includes(attributeName)} />
                      <ListItemText primary={attributeName.charAt(0).toUpperCase() + attributeName.slice(1)} />
                    </MenuItem>
                  ))}
                </Select>

                {!hasAttributes && (
                    <FormHelperText >Please create the attribute to show here.</FormHelperText>
                  )}
              </FormControl>

              {selectedAttributes.length > 0 && (
                <>
                  <Typography variant='h6' gutterBottom>
                    Select Attribute Values
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedAttributes.map(attributeName => (
                      <Grid item xs={12} md={6} key={attributeName}>
                        <FormControl sx={{ mb: 3, minWidth: 300 }} fullWidth>
                          <InputLabel id={`${attributeName}-label`}>
                            {attributeName.charAt(0).toUpperCase() + attributeName.slice(1)}
                          </InputLabel>
                          <Select
                            fullWidth
                            labelId={`${attributeName}-label`}
                            multiple
                            value={selectedAttributeValues[attributeName] || []}
                            onChange={e => handleAttributeValuesChange(attributeName, e.target.value)}
                            input={<OutlinedInput label={attributeName} />}
                            renderValue={selected => selected.join(', ')}
                          >
                            {allAttributes[attributeName]?.map(value => (
                              <MenuItem key={value} value={value}>
                                <Checkbox checked={selectedAttributeValues[attributeName]?.includes(value) || false} />
                                <ListItemText primary={value} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </Box>
            // <Box sx={{ p: 3, flexGrow: 1 }}>
            //   <Typography variant='h6' gutterBottom>
            //     Choose Attributes to Combine
            //   </Typography>

            //   <FormControl sx={{ mb: 4, minWidth: 300 }}>
            //     <InputLabel id='select-attributes-label'>Attributes</InputLabel>
            //     <Select
            //       labelId='select-attributes-label'
            //       multiple
            //       value={selectedAttributes}
            //       onChange={handleAttributesChange}
            //       input={<OutlinedInput label='Attributes' />}
            //       renderValue={selected => selected.join(', ')}
            //     >
            //       {Object.keys(allAttributes).map(attributeName => (
            //         <MenuItem key={attributeName} value={attributeName}>
            //           <Checkbox checked={selectedAttributes.indexOf(attributeName) > -1} />
            //           <ListItemText primary={attributeName.charAt(0).toUpperCase() + attributeName.slice(1)} />
            //         </MenuItem>
            //       ))}
            //     </Select>
            //   </FormControl>

            //   {selectedAttributes.length > 0 && (
            //     <>
            //       <Typography variant='h6' gutterBottom>
            //         Select Attribute Values
            //       </Typography>
            //       <Grid container spacing={2}>
            //         {selectedAttributes.map(attributeName => (
            //           <Grid size={{ xs: 12, md: 6 }}>
            //             <FormControl key={attributeName} sx={{ mb: 3, minWidth: 300 }} fullWidth>
            //               <InputLabel id={`${attributeName}-label`}>
            //                 {attributeName.charAt(0).toUpperCase() + attributeName.slice(1)}
            //               </InputLabel>

            //               <Select
            //               fullWidth
            //                 labelId={`${attributeName}-label`}
            //                 multiple
            //                 value={selectedAttributeValues[attributeName] || []}
            //                 onChange={e => handleAttributeValuesChange(attributeName, e.target.value)}
            //                 input={
            //                   <OutlinedInput label={attributeName.charAt(0).toUpperCase() + attributeName.slice(1)} />
            //                 }
            //                 renderValue={selected => selected.join(', ')}
            //               >
            //                 {allAttributes[attributeName].map(value => (
            //                   <MenuItem key={value} value={value}>
            //                     <Checkbox
            //                       checked={
            //                         selectedAttributeValues[attributeName]
            //                           ? selectedAttributeValues[attributeName].indexOf(value) > -1
            //                           : false
            //                       }
            //                     />
            //                     <ListItemText primary={value} />
            //                   </MenuItem>
            //                 ))}
            //               </Select>
            //             </FormControl>
            //           </Grid>
            //         ))}
            //       </Grid>
            //     </>
            //   )}
            // </Box>
          )}

          {tabIndex === 1 && (
            <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', maxHeight: 600 }}>
              <Typography variant='h6' gutterBottom>
                Manage Variations
              </Typography>

              {variations.map((variation, index) => (
                <Box key={index} sx={{ mb: 4, border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
                  <Typography variant='subtitle1' gutterBottom>
                    {selectedAttributes
                      .map(attr => `${attr.charAt(0).toUpperCase() + attr.slice(1)}: ${variation[attr]}`)
                      .join(', ')}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name={`productVariations.${index}.description`}
                        control={control}
                        defaultValue={variation.description}
                        render={({ field }) => (
                          <TextField {...field} label='Description' multiline rows={2} fullWidth variant='outlined' />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller
                        name={`productVariations.${index}.stockStatus`}
                        control={control}
                        defaultValue={variation.stockStatus}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel id={`stock-status-label-${index}`}>Stock Status</InputLabel>
                            <Select {...field} labelId={`stock-status-label-${index}`} label='Stock Status'>
                              <MenuItem value='in_stock'>In Stock</MenuItem>
                              <MenuItem value='out_of_stock'>Out of Stock</MenuItem>
                              <MenuItem value='on_backorder'>On Backorder</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller
                        name={`productVariations.${index}.stockQuantity`}
                        control={control}
                        defaultValue={variation.stockQuantity}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label='Stock Quantity'
                            type='number'
                            inputProps={{ min: 0 }}
                            fullWidth
                            variant='outlined'
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Controller
                        name={`productVariations.${index}.allowBackorders`}
                        control={control}
                        defaultValue={variation.allowBackorders}
                        render={({ field }) => (
                          <>
                            <Typography>Allow Backorders</Typography>
                            <Switch
                              {...field}
                              checked={field.value}
                              onChange={e => field.onChange(e.target.checked)}
                              sx={{ ml: 1 }}
                            />
                          </>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.weight`}
                        control={control}
                        defaultValue={variation.weight}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label='Weight (kg)'
                            type='number'
                            inputProps={{ step: 0.01, min: 0 }}
                            fullWidth
                            variant='outlined'
                          />
                        )}
                      />
                    </Grid>

                    {/* Dimensions */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.dimensions.length`}
                        control={control}
                        defaultValue={variation.dimensions.length}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label='Length'
                            type='number'
                            inputProps={{ step: 0.01, min: 0 }}
                            fullWidth
                            variant='outlined'
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.dimensions.width`}
                        control={control}
                        defaultValue={variation.dimensions.width}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label='Width'
                            type='number'
                            inputProps={{ step: 0.01, min: 0 }}
                            fullWidth
                            variant='outlined'
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.dimensions.height`}
                        control={control}
                        defaultValue={variation.dimensions.height}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label='Height'
                            type='number'
                            inputProps={{ step: 0.01, min: 0 }}
                            fullWidth
                            variant='outlined'
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.regularPrice`}
                        control={control}
                        defaultValue={variation.regularPrice}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label='Regular Price'
                            type='number'
                            inputProps={{ step: 0.01, min: 0 }}
                            fullWidth
                            variant='outlined'
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.salePrice`}
                        control={control}
                        defaultValue={variation.salePrice}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label='Sale Price'
                            type='number'
                            inputProps={{ step: 0.01, min: 0 }}
                            fullWidth
                            variant='outlined'
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.purchasedPrice`}
                        control={control}
                        defaultValue={variation.purchasedPrice}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label='Purchased Price'
                            type='number'
                            inputProps={{ step: 0.01, min: 0 }}
                            fullWidth
                            variant='outlined'
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.customImageUrl`}
                        control={control}
                        defaultValue={variation.customImageUrl}
                        render={({ field }) => (
                          <TextField {...field} label='Custom Image URL' fullWidth variant='outlined' />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.image`}
                        control={control}
                        defaultValue={variation.image}
                        render={({ field }) => <TextField {...field} label='Image' fullWidth variant='outlined' />}
                      />
                    </Grid>

                    {/* <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.shippingClass`}
                        control={control}
                        defaultValue={variation.shippingClass}
                        render={({ field }) => (
                          <TextField {...field} label='Shipping Class' fullWidth variant='outlined' />
                        )}
                      />
                    </Grid> */}

                    {/* <Grid size={{ xs: 12, md: 4 }}>
                      <Controller
                        name={`productVariations.${index}.taxClass`}
                        control={control}
                        defaultValue={variation.taxClass}
                        render={({ field }) => <TextField {...field} label='Tax Class' fullWidth variant='outlined' />}
                      />
                    </Grid> */}
                  </Grid>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
