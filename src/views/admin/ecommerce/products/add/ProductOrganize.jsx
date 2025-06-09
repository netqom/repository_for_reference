'use client';

// React Imports
import React, { useEffect, useState } from 'react';

// MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

// React Hook Form Imports
import { useFormContext, Controller } from 'react-hook-form';

import { Autocomplete, FormHelperText } from '@mui/material';

const ProductOrganize = ({ rawProductData }) => {
  // Access RHF context methods and form control
  const { control, watch } = useFormContext();
  const [vendorList, setVendorList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    if (rawProductData?.suppliers && Array.isArray(rawProductData?.suppliers)) {
      setVendorList(rawProductData?.suppliers);
    }

    if (rawProductData?.nestedCategories && Array.isArray(rawProductData.nestedCategories)) {
      setCategoryList(rawProductData.nestedCategories);
    }
  }, [rawProductData]);

  function flattenCategoriesold(categories, parent = '', level = 0) {
    return categories.flatMap(cat => {
      const current = {
        id: cat._id,
        title: cat.name,
        fullPath: parent ? `${parent} > ${cat.name}` : cat.name,
        level
      };
      const children = cat.children ? flattenCategories(cat.children, current.fullPath, level + 1) : [];
      return [current, ...children];
    });
  }

  function flattenCategories(categories, parent = '', level = 0, parentIds = []) {
    return categories.flatMap(cat => {
      const current = {
        id: cat._id,
        title: cat.name,
        fullPath: parent ? `${parent} > ${cat.name}` : cat.name,
        level,
        parentIds
      };

      const children = cat.children
        ? flattenCategories(cat.children, current.fullPath, level + 1, [...parentIds, cat._id])
        : [];

      return [current, ...children];
    });
  }

  const flatOptions = flattenCategories(categoryList);

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
            rules={{ required: 'Supplier is required' }}
            render={({ field, fieldState }) => (
              <>
                <Select
                  {...field}
                  labelId='vendor-label'
                  label='Select Vendor'
                  fullWidth
                  error={!!fieldState.error} // Highlight error state
                >
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
                {fieldState.error && <FormHelperText error>{fieldState.error.message}</FormHelperText>}
              </>
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

          <Controller
            name='categories'
            control={control}
            defaultValue={[]}
            rules={{ required: 'At least one category is required' }}
            render={({ field, fieldState }) => {
              // All available options
              const allOptions = flatOptions;

              // Find the explicitly selected categories by comparing field.value to flatOptions
              // Only include options whose `id` is not present in another option's `parentIds`
              const selectedLeafOptions = allOptions.filter(
                opt =>
                  field.value.includes(opt.id) &&
                  !allOptions.some(other => field.value.includes(other.id) && other.parentIds.includes(opt.id))
              );

              return (
                <Autocomplete
                  multiple
                  options={allOptions}
                  value={selectedLeafOptions}
                  getOptionLabel={option => option.fullPath}
                  groupBy={option => option.fullPath.split(' > ')[0]}
                  onChange={(_, selectedOptions) => {
                    // When user selects options, include selected IDs + their parent IDs in form state
                    const allSelectedIds = selectedOptions.flatMap(opt => [opt.id, ...opt.parentIds]);
                    const uniqueIds = Array.from(new Set(allSelectedIds));
                    field.onChange(uniqueIds);
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label='Select Category'
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                  sx={{ width: 400 }}
                />
              );
            }}
          />
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
  );
};

export default ProductOrganize;
