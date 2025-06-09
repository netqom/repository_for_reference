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

import { Autocomplete } from '@mui/material'

const ProductOrganize = ({ rawProductData }) => {
  // Access RHF context methods and form control
  const { control } = useFormContext()
  const [vendorList, setVendorList] = useState([])
  const [categoryList, setCategoryList] = useState([])

  useEffect(() => {
    if (rawProductData?.suppliers && Array.isArray(rawProductData?.suppliers)) {
      setVendorList(rawProductData?.suppliers)
    }

    if (rawProductData?.nestedCategories && Array.isArray(rawProductData.nestedCategories)) {
      setCategoryList(rawProductData.nestedCategories)
    }
  }, [rawProductData])

  function flattenCategories(categories, parent = '', level = 0) {
    return categories.flatMap(cat => {
      const current = {
        id: cat._id,
        title: cat.name,
        fullPath: parent ? `${parent} > ${cat.name}` : cat.name,
        level
      }
      const children = cat.children ? flattenCategories(cat.children, current.fullPath, level + 1) : []
      return [current, ...children]
    })
  }

  const flatOptions = flattenCategories(categoryList)

  return (
    <Card>
      <CardHeader title='Organize' />
      <CardContent>
        {/* Vendor Select */}
        <FormControl fullWidth margin='normal'>
          <InputLabel id='vendor-label'>Select Vendor</InputLabel>
          <Controller
            name='supplier'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <Select {...field} labelId='vendor-label' label='Select Vendor' fullWidth>
                {vendorList.length > 0 ? (
                  vendorList.map(vendor => (
                    <MenuItem key={vendor._id} value={vendor._id}>
                      {vendor.companyName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No vendors available</MenuItem>
                )}
              </Select>
            )}
          />
        </FormControl>

        {/* Category Select with Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: 16, marginBottom: 16 }}>
          {/* <FormControl fullWidth>
            <Autocomplete
              multiple={true}
              options={flatOptions}
              getOptionLabel={option => option.fullPath}
              renderInput={params => <TextField {...params} label='Select Category' />}
              sx={{ width: 400 }}
              groupBy={option => option.fullPath.split(' > ')[0]} // Group by top-level category
            />
          </FormControl> */}

          <FormControl fullWidth>
            <Controller
              name='categories'
              control={control}
              defaultValue={[]} // Will store: ["681221f4...", "6813576d..."]
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={flatOptions}
                  getOptionLabel={option => option.fullPath}
                  groupBy={option => option.fullPath.split(' > ')[0]}
                  // Convert full objects to just IDs when selecting
                  onChange={(_, selectedOptions) => {
                    field.onChange(selectedOptions.map(opt => opt.id))
                  }}
                  // Convert current ID array back to option objects for display
                  value={flatOptions.filter(opt => field.value.includes(opt.id))}
                  renderInput={params => <TextField {...params} label='Select Category' />}
                  sx={{ width: 400 }}
                />
              )}
            />
          </FormControl>
        </div>

        {/* Collection Select */}
        {/* <FormControl fullWidth margin='normal'>
          <InputLabel id='collection-label'>Select Collection</InputLabel>
          <Controller
            name='collection'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <Select {...field} labelId='collection-label' label='Select Collection' fullWidth>
                <MenuItem value="Men's Clothing">Men&apos;s Clothing</MenuItem>
                <MenuItem value="Women's Clothing">Women&apos;s Clothing</MenuItem>
                <MenuItem value="Kid's Clothing">Kid&apos;s Clothing</MenuItem>
              </Select>
            )}
          />
        </FormControl> */}

        {/* Status Select */}
        <FormControl fullWidth margin='normal'>
          <InputLabel id='status-label'>Select Status</InputLabel>
          <Controller
            name='status'
            control={control}
            defaultValue={1} // ✅ Set default to Published
            render={({ field }) => (
              <Select {...field} labelId='status-label' label='Select Status' fullWidth>
                <MenuItem value={1}>Published</MenuItem>
                <MenuItem value={0}>Draft</MenuItem>
              </Select>
            )}
          />
        </FormControl>

        {/* Tags TextField */}
        {/* <Controller
          name='tags'
          control={control}
          defaultValue=''
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              margin='normal'
              label='Enter Tags'
              placeholder='Fashion, Trending, Summer'
              variant='outlined'
            />
          )}
        /> */}
      </CardContent>
    </Card>
  )
}

export default ProductOrganize
