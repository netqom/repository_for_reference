'use client';
import React, { useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  MenuItem, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import Grid from '@mui/material/Grid2';
import { toast } from 'react-toastify';
import { useRouter, useParams } from 'next/navigation';
import { getCitiesByState, getCountries, getStatesByCountry } from '@/services/location';
import { createSupplier, fetchSupplierById, updateSupplier } from '@/app/[lang]/(dashboard)/(private)/admin/supplier/list/page';

const AddSupplierForm = () => {

  const params = useParams();
  const supplierId = params?.id || null;
  const locale = params?.lang || null;

  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    register,
    formState: { errors }
  } = useForm({
    defaultValues: {
      companyName: '',
      companyEmail: '',
      companyPhone: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      lat: '',
      long: '',
      status: '1'
    }
  });

  const [discounts, setDiscounts] = useState([{ minimumAreaSqFt: '', discountPercentage: '' }]);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);


  // Fetch country list once
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await getCountries();
        setCountryList(response?.data || []);
      } catch {
        toast.error('Failed to load countries');
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchSupplierDetails = async () => {
      if (!supplierId || supplierId == 'new') return;

      try {
        const response = await fetchSupplierById(supplierId);
        const supplier = response?.data;

        reset({
          companyName: supplier.companyName,
          companyEmail: supplier.companyEmail,
          companyPhone: supplier.companyPhone,
          contactName: supplier.contactInfo?.[0]?.name || '',
          contactEmail: supplier.contactInfo?.[0]?.email || '',
          contactPhone: supplier.contactInfo?.[0]?.phone || '',
          addressLine1: supplier.addresses?.addressLine1 || '',
          addressLine2: supplier.addresses?.addressLine2 || '',
          city: supplier.addresses?.city || '',
          state: supplier.addresses?.state || '',
          postalCode: supplier.addresses?.postalCode || '',
          country: supplier.addresses?.country || '',
          lat: supplier.addresses?.lat?.toString() || '',
          long: supplier.addresses?.long?.toString() || '',
          status: supplier.status,

        });
        // Fetch dependent states and cities for mapped values
        if (supplier.addresses?.country) {
          const countries = await getCountries();
          const states = await getStatesByCountry(supplier.addresses.country);

          setCountryList(countries?.data || []);
          setStateList(states?.data || []);

          const selectedCountryObj = countries?.data?.find(c => c._id === supplier.addresses.country);
          setSelectedCountry(selectedCountryObj);

          if (supplier.addresses?.state) {
            const cities = await getCitiesByState(supplier.addresses.state);
            setCityList(cities?.data || []);

            const selectedStateObj = states?.data?.find(s => s._id === supplier.addresses.state);
            const selectedCityObj = cities?.data?.find(c => c._id === supplier.addresses.city);

            setSelectedState(selectedStateObj);
            setSelectedCity(selectedCityObj);
          }
        }

        if (supplier.discounts?.length > 0) {
          setDiscounts(
            supplier.discounts.map(d => ({
              minimumAreaSqFt: d.minimumAreaSqFt.toString(),
              discountPercentage: d.discountPercentage.toString()
            }))
          );
        }
      } catch (error) {
        toast.error('Failed to load supplier details');
      }
    };

    fetchSupplierDetails();
  }, [supplierId, reset]);


  const handleDiscountChange = (index, field, value) => {
    const updatedDiscounts = [...discounts];
    updatedDiscounts[index][field] = value;
    setDiscounts(updatedDiscounts);
  };

  const handleAddDiscount = () => {
    setDiscounts([...discounts, { minimumAreaSqFt: '', discountPercentage: '' }]);
  };

  const handleRemoveDiscount = index => {
    const updatedDiscounts = discounts.filter((_, i) => i !== index);
    setDiscounts(updatedDiscounts);
  };

  const onSubmit = async (data) => {

    const formattedDiscounts = discounts.map(discount => ({
      minimumAreaSqFt: Number(discount.minimumAreaSqFt),
      discountPercentage: Number(discount.discountPercentage)
    }));

    const finalPayload = {
      companyName: data.companyName,
      companyEmail: data.companyEmail,
      companyPhone: data.companyPhone,
      contactInfo: [
        {
          name: data.contactName,
          email: data.contactEmail,
          phone: data.contactPhone
        }
      ],
      addresses: {
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: String(data.city),
        state: String(data.state),
        postalCode: data.postalCode,
        country: String(data.country),
        lat: parseFloat(data.lat),
        long: parseFloat(data.long)
      },
      discounts: formattedDiscounts,
      status: data.status
    };

    try {
      let response;

      if (supplierId && supplierId != 'new') {
        response = await updateSupplier(supplierId, finalPayload);

      } else {
        response = await createSupplier(finalPayload);
      }

      if (response?.statusCode === 201 || response?.statusCode === 200) {
        router.push(`/${locale}/admin/supplier/list`);
      } else {
        // Map backend field-level validation errors (422)
        if (response?.data?.errors) {
          const backendErrors = response.data.errors;
          Object.entries(backendErrors).forEach(([fieldName, messages]) => {
            if (Array.isArray(messages)) {
              setError(fieldName, { message: messages[0] });
            }
          });
        } else {
          const errorMessage = response?.message || 'Something went wrong. Please try again.';
          setError('apiError', { message: errorMessage });
        }
      }

      // router.push(`/${locale}/supplier/list`);
    } catch (error) {
      const backendErrors = error?.response?.data?.errors;
      if (backendErrors) {
        Object.entries(backendErrors).forEach(([fieldName, messages]) => {
          if (Array.isArray(messages)) {
            setError(fieldName, { message: messages[0] });
          }
        });
      } else {
        const errorMessage = error?.message || 'Something went wrong. Please try again.';
        setError('apiError', { message: errorMessage });
      }
    }
  };


  const handleCountryChange = async country => {
    const countryId = country?._id;
    setSelectedCountry(country);
    // setValue('country', countryId);
    setSelectedState(null);
    setSelectedCity(null);

    setValue('state', '');
    setValue('city', '');

    if (countryId) {
      setValue('country', countryId);
      try {
        const states = await getStatesByCountry(countryId);
        setStateList(states?.data || []);
        setCityList([]);
      } catch {
        toast.error('Failed to load states');
      }
    }
    else {
      setCityList([]);
      setStateList([]);
    }
  };

  const handleStateChange = async stateId => {
    setValue('state', stateId);
    setSelectedCity(null);
    setValue('city', '');
    if (stateId) {
      try {
        const cities = await getCitiesByState(stateId);
        setCityList(cities?.data || []);
      } catch {
        toast.error('Failed to load cities');
      }
    }
  };

  return (
    <Card>
      <CardHeader title="Factory / Supplier" />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box mb={5} sx={{ background: '#f7f7f7a6', borderRadius: '10px', border: '1px solid #ededed', p: 5 }}>
            <Typography variant='h5' mb={2}>
              Company Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, sm: 4 }}>
                <Controller
                  name='companyName'
                  control={control}
                  rules={{ required: 'Company name is required' }}
                  render={({ field }) => (
                    <TextField
                      sx={{ background: '#fff' }}
                      {...field}
                      fullWidth
                      label='Company Name'
                      error={!!errors.companyName}
                      helperText={errors.companyName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 4 }}>
                <Controller
                  name='companyEmail'
                  control={control}
                  rules={{
                    required: 'Company email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      sx={{ background: '#fff' }}
                      {...field}
                      fullWidth
                      label='Company Email'
                      error={!!errors.companyEmail}
                      helperText={errors.companyEmail?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 4 }}>
                  <Controller
                  name='companyPhone'
                  control={control}
                  rules={{
                    required: 'Company phone is required',
                    pattern: {
                      value: /^\+?[0-9\s\-().]{7,20}$/,
                      message: 'Enter a valid phone number (no letters)',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      sx={{ background: '#fff' }}
                      {...field}
                      type='tel'
                      inputProps={{
                        inputMode: 'tel',
                        pattern: '\\+?[0-9\\s\\-().]{7,20}',
                        onKeyDown: (e) => {
                          const allowedKeys = [
                            'Backspace',
                            'Tab',
                            'ArrowLeft',
                            'ArrowRight',
                            'Delete',
                            'Home',
                            'End',
                            '+',
                            '-',
                            '(',
                            ')',
                            ' ',
                          ];
                          const isNumber = /[0-9]/.test(e.key);
                          if (!isNumber && !allowedKeys.includes(e.key)) {
                            e.preventDefault();
                          }
                        },
                      }}
                      fullWidth
                      label='Company Phone'
                      error={!!errors.companyPhone}
                      helperText={errors.companyPhone?.message}
                    />
                  )}
                />

              </Grid>

            </Grid>
          </Box>

          <Box mb={5} sx={{ background: '#f7f7f7a6', borderRadius: '10px', border: '1px solid #ededed', p: 5 }}>
            <Typography variant='h5' mb={2}>
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, sm: 4 }}>
                <Controller
                  name='contactName'
                  control={control}
                  rules={{ required: 'Contact name is required' }}
                  render={({ field }) => (
                    <TextField
                      sx={{ background: '#fff' }}
                      {...field}
                      fullWidth
                      label='Contact Name'
                      error={!!errors.contactName}
                      helperText={errors.contactName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 4 }}>
                <Controller
                  name='contactEmail'
                  control={control}
                  rules={{
                    required: 'Contact email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      sx={{ background: '#fff' }}
                      {...field}
                      fullWidth
                      label='Contact Email'
                      error={!!errors.contactEmail}
                      helperText={errors.contactEmail?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 4 }}>
                <Controller
                  name='contactPhone'
                  control={control}
                  rules={{
                    required: 'Contact phone is required',
                    pattern: {
                      value: /^\+?[0-9\s\-().]{7,20}$/,
                      message: 'Enter a valid phone number (no letters)',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      sx={{ background: '#fff' }}
                      {...field}
                      type='tel'
                      inputProps={{
                        inputMode: 'tel',
                        pattern: '\\+?[0-9\\s\\-().]{7,20}',
                        onKeyDown: (e) => {
                          const allowedKeys = [
                            'Backspace',
                            'Tab',
                            'ArrowLeft',
                            'ArrowRight',
                            'Delete',
                            'Home',
                            'End',
                            '+',
                            '-',
                            '(',
                            ')',
                            ' ',
                          ];
                          const isNumber = /[0-9]/.test(e.key);
                          if (!isNumber && !allowedKeys.includes(e.key)) {
                            e.preventDefault();
                          }
                        },
                      }}
                      fullWidth
                      label='Contact Phone'
                      error={!!errors.contactPhone}
                      helperText={errors.contactPhone?.message}
                    />
                  )}
                />
              </Grid>


            </Grid>
          </Box>

          <Box mb={5} sx={{ background: '#f7f7f7a6', borderRadius: '10px', border: '1px solid #ededed', p: 5 }}>
            <Typography variant='h5' mb={2}>
              Address
            </Typography>
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Controller
                  name='addressLine1'
                  control={control}
                  rules={{ required: 'Address line 1 is required' }}
                  render={({ field }) => (
                    <TextField
                      sx={{ background: '#fff' }}
                      {...field}
                      fullWidth
                      label='Address Line 1'
                      error={!!errors.addressLine1}
                      helperText={errors.addressLine1?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Controller
                  name='addressLine2'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      sx={{ background: '#fff' }}
                      {...field}
                      fullWidth
                      label='Address Line 2'
                    />
                  )}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  {...register("country", { required: true })}
                  fullWidth
                  options={countryList}
                  getOptionLabel={(option) => option.name}
                  value={selectedCountry}
                  onChange={(event, value) => {
                    handleCountryChange(value);
                  }}
                  renderInput={(params) => <TextField {...params} label="Country" />}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  {...register("state", { required: true })}
                  fullWidth
                  options={stateList}
                  getOptionLabel={(option) => option.name}
                  value={selectedState}
                  onChange={(event, value) => {
                    setSelectedState(value);
                    handleStateChange(value?._id);
                  }}
                  disabled={!selectedCountry}
                  renderInput={(params) => <TextField {...params} label="State" />}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  {...register("city", { required: true })}
                  fullWidth
                  options={cityList}
                  getOptionLabel={(option) => option.name}
                  value={selectedCity}
                  onChange={(event, value) => {
                    setSelectedCity(value);
                    setValue('city', value?._id);
                  }
                  }
                  disabled={!selectedState}
                  renderInput={(params) => <TextField {...params} label="City" />}
                />
              </Grid>


              <Grid item size={{ xs: 12, sm: 4 }}>
                <Controller
                  name='postalCode'
                  control={control}
                  rules={{ required: 'Postal code is required' }}
                  render={({ field }) => (
                    <TextField
                      sx={{ background: '#fff' }}
                      {...field}
                      fullWidth
                      label='Postal Code'
                      error={!!errors.postalCode}
                      helperText={errors.postalCode?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: 'Status is required' }}
                  render={({ field }) => (
                    <TextField
                      sx={{ background: '#fff' }}
                      {...field}
                      select
                      fullWidth
                      label="Status"
                      error={!!errors.status}
                      helperText={errors.status?.message}
                    >
                      <MenuItem value="2">Pending</MenuItem>
                      <MenuItem value="1">Active</MenuItem>
                      <MenuItem value="0">Inactive</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>


            </Grid>
          </Box>

          <Box mb={5} sx={{ background: '#f7f7f7a6', borderRadius: '10px', border: '1px solid #ededed', p: 5 }}>
            <Typography variant='h5' mb={2}>
              Discounts
            </Typography>
            {discounts.map((discount, index) => (
              <Grid container spacing={2} key={index} mb={2} alignItems='center'>
                <Grid item size={{ xs: 12, sm: 4 }}>
                  <TextField
                    sx={{ background: '#fff' }}
                    fullWidth
                    label='Minimum Area (sqft)'
                    type='number'
                    value={discount.minimumAreaSqFt}
                    onChange={e => {
                      const value = parseFloat(e.target.value);
                      handleDiscountChange(index, 'minimumAreaSqFt', value < 0 ? 0 : value);
                    }}
                  />
                </Grid>
                <Grid item size={{ xs: 12, sm: 4 }}>
                  <TextField
                    sx={{ background: '#fff' }}
                    fullWidth
                    label='Discount (%)'
                    type='number'
                    value={discount.discountPercentage}
                    onChange={e => {
                      let value = parseFloat(e.target.value);
                      if (isNaN(value)) value = 0;
                      if (value < 0) value = 0;
                      if (value > 100) value = 100;
                      handleDiscountChange(index, 'discountPercentage', value);
                    }}
                  />
                </Grid>
                <Grid item size={{ xs: 12, sm: 4 }}>
                  <IconButton
                    onClick={() => {
                      if (discount.minimumAreaSqFt || discount.discountPercentage) {
                        setDeleteIndex(index);
                        setOpenConfirmDialog(true);
                      } else {
                        handleRemoveDiscount(index);
                      }
                    }}
                  >
                    <i className='ri-delete-bin-7-line text-textSecondary' />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              startIcon={<i className='ri-add-line' />}
              onClick={handleAddDiscount}
              variant='outlined'
              sx={{ mt: 2 }}
            >
              Add Discount
            </Button>
          </Box>

          {/* Confirmation Dialog */}
          <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete this team member?</Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setOpenConfirmDialog(false);
                  setDeleteIndex(null);
                }} color='primary'>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleRemoveDiscount(deleteIndex);
                  setOpenConfirmDialog(false);
                  setDeleteIndex(null);
                }} color='secondary'>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>

          <Box mt={4}>
            <Button type='submit' variant='contained'>
              Submit
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>

  );
};

export default AddSupplierForm;
